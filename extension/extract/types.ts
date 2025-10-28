/**
 * Type definitions for content extraction
 */

export interface CodeBlock {
  lang?: string;
  code: string;
}

export interface LessonChunk {
  id: string;
  title: string;
  text: string; // sanitized plain text
  html?: string; // optional cleaned HTML snippet
  codeBlocks: CodeBlock[];
  anchors: {
    url: string;
    startId?: string;
  };
}

export interface PageExtraction {
  pageUrl: string;
  pageTitle: string;
  license?: {
    source?: string;
    kind?: 'CC-BY-SA' | 'MIT' | 'Unknown';
  };
  chunks: LessonChunk[];
}

