/**
 * AI Provider type definitions
 */

export interface Summarizer {
  summarizeSection(input: {
    text: string;
    goal?: 'explain' | 'example';
  }): Promise<{ summary: string; example?: string }>;
}

export interface Writer {
  objectives(input: { text: string }): Promise<string[]>; // 2-3 items
  quiz(input: { text: string }): Promise<{
    mcq: {
      q: string;
      options: string[];
      correct: number;
      why: string;
    };
    fill: {
      q: string;
      a: string;
    };
  }>;
}

export interface Rewriter {
  adjustLevel(input: {
    text: string;
    level: 'beginner' | 'advanced';
  }): Promise<string>;
}

export interface Proofreader {
  polish(input: { text: string }): Promise<string>;
}

export interface Translator {
  translate(input: { text: string; to: string }): Promise<string>;
}

// P1 hooks - not fully implemented in P0
export interface Prompt {
  explainCode(input: { code: string; lang?: string }): Promise<string>; // P1 hook
  chooseVisualTemplate(input: { text: string }): Promise<{
    template: 'none' | 'flowchart' | 'concept_map' | 'compare';
    params: Record<string, unknown>;
  }>; // P1 hook
}

export interface AIProvider
  extends Summarizer,
    Writer,
    Rewriter,
    Proofreader,
    Translator,
    Prompt {}

export type AIProviderType = 'mock' | 'chrome';

export class AIError extends Error {
  constructor(
    message: string,
    public code: 'NOT_AVAILABLE' | 'FAILED' | 'NOT_IMPLEMENTED'
  ) {
    super(message);
    this.name = 'AIError';
  }
}

