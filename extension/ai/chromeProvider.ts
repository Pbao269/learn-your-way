/**
 * Chrome Built-in AI Provider
 * Uses Chrome's experimental AI APIs
 */

import type { AIProvider } from './types';
import { AIError } from './types';

// Type definitions for Chrome AI API (experimental)
interface ChromeAI {
  languageModel?: {
    capabilities(): Promise<{ available: string }>;
    create(options?: { temperature?: number; topK?: number }): Promise<LanguageModel>;
  };
  summarizer?: {
    capabilities(): Promise<{ available: string }>;
    create(options?: { type?: string; length?: string }): Promise<Summarizer>;
  };
}

interface LanguageModel {
  prompt(text: string): Promise<string>;
  destroy(): void;
}

interface Summarizer {
  summarize(text: string): Promise<string>;
  destroy(): void;
}

declare global {
  interface Window {
    ai?: ChromeAI;
  }
}

class ChromeAIProvider implements AIProvider {
  private async checkAvailability(): Promise<void> {
    if (!window.ai) {
      throw new AIError(
        'Chrome AI API not available. Please use Chrome Canary with AI flags enabled.',
        'NOT_AVAILABLE'
      );
    }
  }

  async summarizeSection(input: {
    text: string;
    goal?: 'explain' | 'example';
  }): Promise<{ summary: string; example?: string }> {
    await this.checkAvailability();

    try {
      if (window.ai?.summarizer) {
        const capabilities = await window.ai.summarizer.capabilities();
        
        if (capabilities.available === 'no') {
          throw new AIError('Summarizer not available', 'NOT_AVAILABLE');
        }

        const summarizer = await window.ai.summarizer.create({
          type: 'key-points',
          length: 'medium',
        });

        const summary = await summarizer.summarize(input.text);
        summarizer.destroy();

        return { summary };
      } else if (window.ai?.languageModel) {
        // Fallback to language model
        const model = await window.ai.languageModel.create();
        const prompt = `Summarize the following text in 120-180 words for a ${input.goal || 'general'} explanation:\n\n${input.text}`;
        const summary = await model.prompt(prompt);
        model.destroy();

        return { summary };
      }

      throw new AIError('No AI capabilities available', 'NOT_AVAILABLE');
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw new AIError(
        `Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FAILED'
      );
    }
  }

  async objectives(input: { text: string }): Promise<string[]> {
    await this.checkAvailability();

    try {
      if (!window.ai?.languageModel) {
        throw new AIError('Language model not available', 'NOT_AVAILABLE');
      }

      const model = await window.ai.languageModel.create({ temperature: 0.7 });
      const prompt = `Based on this text, generate 2-3 learning objectives (imperative verbs, concise):\n\n${input.text}\n\nObjectives (one per line):`;
      
      const response = await model.prompt(prompt);
      model.destroy();

      // Parse response into array
      const objectives = response
        .split('\n')
        .map((line) => line.replace(/^[-*\d.]+\s*/, '').trim())
        .filter((line) => line.length > 0)
        .slice(0, 3);

      return objectives.length > 0 ? objectives : ['Understand the key concepts', 'Apply the knowledge'];
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw new AIError(
        `Objective generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FAILED'
      );
    }
  }

  async quiz(input: { text: string }): Promise<{
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
  }> {
    await this.checkAvailability();

    try {
      if (!window.ai?.languageModel) {
        throw new AIError('Language model not available', 'NOT_AVAILABLE');
      }

      const model = await window.ai.languageModel.create({ temperature: 0.8 });
      
      // Generate MCQ
      const mcqPrompt = `Create 1 multiple choice question about:\n${input.text}\n\nFormat:\nQ: [question]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nCorrect: [A/B/C/D]\nWhy: [explanation]`;
      
      const mcqResponse = await model.prompt(mcqPrompt);
      
      // Generate fill-in
      const fillPrompt = `Create 1 fill-in-the-blank question about:\n${input.text}\n\nFormat:\nQ: [question with _____ blank]\nA: [answer]`;
      
      const fillResponse = await model.prompt(fillPrompt);
      model.destroy();

      // Parse responses (simplified parsing)
      const mcq = this.parseMCQ(mcqResponse);
      const fill = this.parseFillIn(fillResponse);

      return { mcq, fill };
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw new AIError(
        `Quiz generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FAILED'
      );
    }
  }

  async adjustLevel(input: {
    text: string;
    level: 'beginner' | 'advanced';
  }): Promise<string> {
    await this.checkAvailability();

    try {
      if (!window.ai?.languageModel) {
        throw new AIError('Language model not available', 'NOT_AVAILABLE');
      }

      const model = await window.ai.languageModel.create();
      const prompt = `Rewrite this text for a ${input.level} audience:\n\n${input.text}`;
      
      const result = await model.prompt(prompt);
      model.destroy();

      return result;
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw new AIError(
        `Level adjustment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FAILED'
      );
    }
  }

  async polish(input: { text: string }): Promise<string> {
    await this.checkAvailability();

    try {
      if (!window.ai?.languageModel) {
        // If no AI, just return trimmed text
        return input.text.trim();
      }

      const model = await window.ai.languageModel.create({ temperature: 0.3 });
      const prompt = `Polish and improve this text (fix grammar, clarity):\n\n${input.text}`;
      
      const result = await model.prompt(prompt);
      model.destroy();

      return result;
    } catch (error) {
      // Non-critical, return original
      return input.text.trim();
    }
  }

  async translate(input: { text: string; to: string }): Promise<string> {
    throw new AIError('Translation not implemented in P0', 'NOT_IMPLEMENTED');
  }

  // P1 hooks - stub implementations
  async explainCode(input: { code: string; lang?: string }): Promise<string> {
    throw new AIError('Code explanation not implemented in P0', 'NOT_IMPLEMENTED');
  }

  async chooseVisualTemplate(input: { text: string }): Promise<{
    template: 'none' | 'flowchart' | 'concept_map' | 'compare';
    params: Record<string, unknown>;
  }> {
    throw new AIError('Visual template selection not implemented in P0', 'NOT_IMPLEMENTED');
  }

  // Helper parsing methods
  private parseMCQ(response: string): {
    q: string;
    options: string[];
    correct: number;
    why: string;
  } {
    // Simplified parsing - in production, use more robust parsing
    const lines = response.split('\n');
    const q = lines.find((l) => l.startsWith('Q:'))?.replace('Q:', '').trim() || 'Sample question?';
    const options = lines
      .filter((l) => /^[A-D]\)/.test(l))
      .map((l) => l.replace(/^[A-D]\)\s*/, '').trim());
    
    if (options.length < 4) {
      options.push(...['Option A', 'Option B', 'Option C', 'Option D'].slice(options.length));
    }

    const correctLine = lines.find((l) => l.startsWith('Correct:'));
    const correctLetter = correctLine?.match(/[A-D]/)?.[0] || 'A';
    const correct = correctLetter.charCodeAt(0) - 65; // A=0, B=1, etc.

    const why = lines.find((l) => l.startsWith('Why:'))?.replace('Why:', '').trim() || 'This is the correct answer.';

    return { q, options, correct, why };
  }

  private parseFillIn(response: string): { q: string; a: string } {
    const lines = response.split('\n');
    const q = lines.find((l) => l.startsWith('Q:'))?.replace('Q:', '').trim() || 'Fill in the blank: _____';
    const a = lines.find((l) => l.startsWith('A:'))?.replace('A:', '').trim() || 'answer';

    return { q, a };
  }
}

export const chromeProvider = new ChromeAIProvider();

