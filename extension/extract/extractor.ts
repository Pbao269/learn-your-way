/**
 * Content extractor for LearnMyWay
 * Extracts structured content from documentation pages
 */

import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';
import type { PageExtraction, LessonChunk, CodeBlock } from './types';

/**
 * Main extraction function
 * Extracts and chunks content from a document
 */
export function extractPage(doc: Document): PageExtraction {
  const pageUrl = doc.URL || window.location.href;
  const pageTitle = doc.title || 'Untitled Page';

  // Try Readability first for better content isolation
  let cleanDoc: Document | null = null;
  try {
    const reader = new Readability(doc.cloneNode(true) as Document);
    const article = reader.parse();
    
    if (article?.content) {
      // Create a new document from the cleaned HTML
      const parser = new DOMParser();
      cleanDoc = parser.parseFromString(article.content, 'text/html');
    }
  } catch (error) {
    console.warn('Readability extraction failed, using fallback:', error);
  }

  // Use cleaned doc or fallback to original
  const targetDoc = cleanDoc || doc;

  // Extract chunks from headings
  const chunks = extractChunks(targetDoc, pageUrl);

  // Detect license information
  const license = detectLicense(doc);

  return {
    pageUrl,
    pageTitle,
    license,
    chunks: chunks.length > 0 ? chunks : createFallbackChunk(targetDoc, pageUrl),
  };
}

/**
 * Extract chunks based on H2 and H3 headings
 * Improved for modern documentation structures (AWS, Azure, MongoDB, etc.)
 * Targets 3-8 chunks with 80-500 words each
 */
function extractChunks(doc: Document, baseUrl: string): LessonChunk[] {
  const chunks: LessonChunk[] = [];
  
  // First, try to find H2 headings (primary sections)
  const h2Headings = doc.querySelectorAll('h2');
  
  // If we have good H2 coverage, use H2-only strategy
  // Otherwise fall back to H2 + H3
  const minWordCountPerH2 = 40; // Allow shorter documentation sections
  const maxTotalChunks = 8;
  
  if (h2Headings.length >= 2) {
    // Strategy 1: H2-only chunks (best for well-structured docs)
    h2Headings.forEach((heading, index) => {
      if (chunks.length >= maxTotalChunks) return;
      
      const title = heading.textContent?.trim() || `Section ${index + 1}`;
      const id = heading.id || `chunk-${index}`;

      // Collect content until next H2 (or end of document)
      const content = collectContentUntilNextHeading(heading, 'h2');
      
      if (!content.text || content.text.length < 20) {
        return; // Skip very short sections (titles only)
      }

      // Extract code blocks
      const codeBlocks = extractCodeBlocks(content.elements);

      // Calculate word count
      const wordCount = content.text.split(/\s+/).length;
      
      // Smart chunking: if section is too large (>500 words), split it
      if (wordCount > 500) {
        const splitChunks = splitLargeSection(content, title, id, baseUrl);
        splitChunks.forEach(chunk => {
          if (chunks.length < maxTotalChunks) {
            chunks.push(chunk);
          }
        });
      } else if (wordCount >= minWordCountPerH2 || chunks.length === 0) {
        chunks.push({
          id,
          title,
          text: content.text,
          html: content.html,
          codeBlocks,
          anchors: {
            url: `${baseUrl}${heading.id ? `#${heading.id}` : ''}`,
            startId: heading.id,
          },
        });
      }
    });
  } else {
    // Strategy 2: H2 + H3 fallback (for less structured content)
    const allHeadings = doc.querySelectorAll('h2, h3');
    
    allHeadings.forEach((heading, index) => {
      if (chunks.length >= maxTotalChunks) return;
      
      const title = heading.textContent?.trim() || `Section ${index + 1}`;
      const id = heading.id || `chunk-${index}`;
      const tagName = heading.tagName.toLowerCase();

      // Collect until next heading at same or higher level
      const content = collectContentUntilNextHeading(heading, tagName);
      
      if (!content.text || content.text.length < 25) {
        return;
      }

      const codeBlocks = extractCodeBlocks(content.elements);
      const wordCount = content.text.split(/\s+/).length;

      if (wordCount >= 30 && chunks.length < maxTotalChunks) {
        chunks.push({
          id,
          title,
          text: content.text,
          html: content.html,
          codeBlocks,
          anchors: {
            url: `${baseUrl}${heading.id ? `#${heading.id}` : ''}`,
            startId: heading.id,
          },
        });
      }
    });
  }

  // If we still don't have enough chunks, try to merge very short sections
  if (chunks.length < 3 && chunks.length > 0) {
    return mergeShortSections(chunks);
  }

  return chunks;
}

/**
 * Split large sections into smaller chunks based on H3 headings or paragraphs
 */
function splitLargeSection(
  content: { text: string; html: string; elements: Element[] },
  title: string,
  id: string,
  baseUrl: string
): LessonChunk[] {
  const subChunks: LessonChunk[] = [];
  
  // Look for H3 subsections within the large H2 section
  const subHeadings = content.elements.filter(el => 
    el.matches('h3') || el.querySelector('h3')
  );

  if (subHeadings.length > 0) {
    // Split by H3 headings
    let currentText = '';
    let currentHtml = '';
    let chunkIndex = 0;

    content.elements.forEach((el, idx) => {
      if (el.matches('h3')) {
        // Save previous chunk
        if (currentText.trim().length >= 80) {
          subChunks.push({
            id: `${id}-${chunkIndex}`,
            title: el.textContent?.trim() || `${title} - Part ${chunkIndex + 1}`,
            text: currentText.trim(),
            html: currentHtml.trim(),
            codeBlocks: extractCodeBlocks(
              content.elements.filter((_, i) => i < idx && i >= chunkIndex * 100)
            ),
            anchors: {
              url: `${baseUrl}#${id}-${chunkIndex}`,
              startId: el.id,
            },
          });
          chunkIndex++;
          currentText = '';
          currentHtml = '';
        }
      } else {
        const text = el.textContent?.trim();
        if (text) {
          currentText += text + ' ';
          currentHtml += el.outerHTML;
        }
      }
    });

    // Add remaining content
    if (currentText.trim().length >= 50) {
      subChunks.push({
        id: `${id}-${chunkIndex}`,
        title: `${title} - Continued`,
        text: currentText.trim(),
        html: currentHtml.trim(),
        codeBlocks: extractCodeBlocks(content.elements),
        anchors: {
          url: `${baseUrl}#${id}-${chunkIndex}`,
        },
      });
    }
  } else {
    // Split by paragraphs for large content without H3
    const paragraphs = content.elements.filter(el => 
      el.matches('p, ul, ol, blockquote, pre, div') && 
      el.textContent && el.textContent.trim().length > 50
    );
    
    // Group paragraphs into ~250-word chunks
    let currentGroup: Element[] = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    paragraphs.forEach((el) => {
      const wordCount = el.textContent?.split(/\s+/).length || 0;
      
      if (currentWordCount + wordCount > 250 && currentGroup.length > 0) {
        // Save current chunk
        const chunkText = currentGroup.map(e => e.textContent?.trim()).join(' ');
        const chunkHtml = currentGroup.map(e => DOMPurify.sanitize(e.outerHTML)).join('\n');
        
        subChunks.push({
          id: `${id}-${chunkIndex}`,
          title: `${title} - Part ${chunkIndex + 1}`,
          text: chunkText,
          html: chunkHtml,
          codeBlocks: extractCodeBlocks(currentGroup),
          anchors: {
            url: `${baseUrl}#${id}-${chunkIndex}`,
          },
        });
        
        chunkIndex++;
        currentGroup = [el];
        currentWordCount = wordCount;
      } else {
        currentGroup.push(el);
        currentWordCount += wordCount;
      }
    });

    // Add remaining content
    if (currentGroup.length > 0 && currentWordCount >= 80) {
      const chunkText = currentGroup.map(e => e.textContent?.trim()).join(' ');
      const chunkHtml = currentGroup.map(e => DOMPurify.sanitize(e.outerHTML)).join('\n');
      
      subChunks.push({
        id: `${id}-${chunkIndex}`,
        title: `${title} - Part ${chunkIndex + 1}`,
        text: chunkText,
        html: chunkHtml,
        codeBlocks: extractCodeBlocks(currentGroup),
        anchors: {
          url: `${baseUrl}#${id}-${chunkIndex}`,
        },
      });
    }
  }

  return subChunks.length > 0 ? subChunks : [{
    id,
    title,
    text: content.text,
    html: content.html,
    codeBlocks: extractCodeBlocks(content.elements),
    anchors: {
      url: `${baseUrl}${id ? `#${id}` : ''}`,
      startId: id,
    },
  }];
}

/**
 * Merge very short sections to avoid too few chunks
 */
function mergeShortSections(chunks: LessonChunk[]): LessonChunk[] {
  if (chunks.length <= 1) return chunks;
  
  const merged: LessonChunk[] = [];
  let currentChunk = { ...chunks[0] };
  
  for (let i = 1; i < chunks.length; i++) {
    const nextChunk = chunks[i];
    const combinedWordCount = 
      (currentChunk.text.split(/\s+/).length + nextChunk.text.split(/\s+/).length);
    
    if (combinedWordCount < 500) {
      // Merge chunks
      currentChunk = {
        ...currentChunk,
        title: `${currentChunk.title} & ${nextChunk.title}`,
        text: `${currentChunk.text}\n\n${nextChunk.text}`,
        html: `${currentChunk.html}\n${nextChunk.html}`,
        codeBlocks: [...currentChunk.codeBlocks, ...nextChunk.codeBlocks],
      };
    } else {
      merged.push(currentChunk);
      currentChunk = nextChunk;
    }
  }
  
  merged.push(currentChunk);
  return merged;
}

/**
 * Collect content between this heading and the next
 */
function collectContentUntilNextHeading(heading: Element, untilLevel: string = 'h2'): {
  text: string;
  html: string;
  elements: Element[];
} {
  const elements: Element[] = [];
  const textParts: string[] = [];
  const htmlParts: string[] = [];
  
  let sibling = heading.nextElementSibling;
  const stopHeadings = untilLevel === 'h2' ? 'h1, h2' : 'h1, h2, h3';
  
  while (sibling) {
    // Stop at next heading of same or higher level
    if (sibling.matches(stopHeadings)) {
      break;
    }

    elements.push(sibling);

    // Extract text
    const text = sibling.textContent?.trim();
    if (text) {
      textParts.push(text);
    }

    // Extract HTML (sanitized)
    const html = sibling.outerHTML;
    if (html) {
      htmlParts.push(DOMPurify.sanitize(html));
    }

    sibling = sibling.nextElementSibling;
  }

  return {
    text: textParts.join(' '),
    html: htmlParts.join('\n'),
    elements,
  };
}

/**
 * Extract code blocks from elements
 */
function extractCodeBlocks(elements: Element[]): CodeBlock[] {
  const codeBlocks: CodeBlock[] = [];

  elements.forEach((el) => {
    // Look for <pre><code> patterns
    const preElements = el.querySelectorAll('pre');
    
    preElements.forEach((pre) => {
      const code = pre.querySelector('code') || pre;
      const codeText = code.textContent?.trim();
      
      if (codeText) {
        // Try to detect language from class name
        const className = code.className || pre.className;
        const langMatch = className.match(/language-(\w+)|lang-(\w+)/);
        const lang = langMatch?.[1] || langMatch?.[2];

        codeBlocks.push({
          lang,
          code: codeText,
        });
      }
    });

    // Also check if the element itself is a code block
    if (el.matches('pre')) {
      const code = el.querySelector('code') || el;
      const codeText = code.textContent?.trim();
      
      if (codeText && !codeBlocks.some(cb => cb.code === codeText)) {
        const className = code.className || el.className;
        const langMatch = className.match(/language-(\w+)|lang-(\w+)/);
        const lang = langMatch?.[1] || langMatch?.[2];

        codeBlocks.push({
          lang,
          code: codeText,
        });
      }
    }
  });

  return codeBlocks;
}

/**
 * Create a single fallback chunk when no headings are found
 */
function createFallbackChunk(doc: Document, baseUrl: string): LessonChunk[] {
  const body = doc.body || doc.documentElement;
  const text = body.textContent?.trim() || '';
  const html = DOMPurify.sanitize(body.innerHTML || '');

  const codeBlocks = extractCodeBlocks([body]);

  return [
    {
      id: 'fallback-1',
      title: 'Page Content',
      text,
      html,
      codeBlocks,
      anchors: {
        url: baseUrl,
      },
    },
  ];
}

/**
 * Detect license information from page
 */
function detectLicense(doc: Document): {
  source?: string;
  kind?: 'CC-BY-SA' | 'MIT' | 'Unknown';
} | undefined {
  // Look for common license patterns
  const bodyText = doc.body?.textContent?.toLowerCase() || '';
  
  if (bodyText.includes('cc by-sa') || bodyText.includes('creative commons')) {
    return { kind: 'CC-BY-SA' };
  }
  
  if (bodyText.includes('mit license')) {
    return { kind: 'MIT' };
  }

  // Check meta tags
  const licenseMeta = doc.querySelector('meta[name="license"]');
  if (licenseMeta) {
    const content = licenseMeta.getAttribute('content');
    if (content) {
      return { source: content, kind: 'Unknown' };
    }
  }

  return undefined;
}

