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
 * Targets 3-8 chunks with 120-300 words each
 */
function extractChunks(doc: Document, baseUrl: string): LessonChunk[] {
  const chunks: LessonChunk[] = [];
  const headings = doc.querySelectorAll('h2, h3');

  headings.forEach((heading, index) => {
    const title = heading.textContent?.trim() || `Section ${index + 1}`;
    const id = heading.id || `chunk-${index}`;

    // Collect content until next heading
    const content = collectContentUntilNextHeading(heading);
    
    if (!content.text || content.text.length < 50) {
      return; // Skip too-short sections
    }

    // Extract code blocks
    const codeBlocks = extractCodeBlocks(content.elements);

    // Calculate word count
    const wordCount = content.text.split(/\s+/).length;

    // Only include chunks between 120-300 words (or at least 50 words)
    if (wordCount >= 50 && chunks.length < 8) {
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

  return chunks;
}

/**
 * Collect content between this heading and the next
 */
function collectContentUntilNextHeading(heading: Element): {
  text: string;
  html: string;
  elements: Element[];
} {
  const elements: Element[] = [];
  let textParts: string[] = [];
  let htmlParts: string[] = [];
  
  let sibling = heading.nextElementSibling;
  
  while (sibling) {
    // Stop at next heading of same or higher level
    if (sibling.matches('h1, h2, h3')) {
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

  // Take first ~300 words
  const words = text.split(/\s+/).slice(0, 300);
  const truncatedText = words.join(' ');

  const codeBlocks = extractCodeBlocks([body]);

  return [
    {
      id: 'fallback-1',
      title: 'Page Content',
      text: truncatedText,
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

