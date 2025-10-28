/**
 * Mock AI Provider for development and testing
 * Returns deterministic canned responses
 */

import type { AIProvider } from './types';

class MockAIProvider implements AIProvider {
  async summarizeSection(input: {
    text: string;
    goal?: 'explain' | 'example';
  }): Promise<{ summary: string; example?: string }> {
    // Simulate processing delay
    await this.delay(300);

    const summary = this.generateMockSummary(input.text, input.goal);

    return {
      summary,
      example: input.goal === 'example' ? this.generateMockExample() : undefined,
    };
  }

  async objectives(input: { text: string }): Promise<string[]> {
    await this.delay(200);

    // Generate 2-3 objectives based on text
    const objectives = [
      'Understand the core concepts presented in this section',
      'Apply the principles to practical scenarios',
    ];

    // Add a third objective for longer content
    if (input.text.split(/\s+/).length > 100) {
      objectives.push('Recognize common patterns and best practices');
    }

    return objectives;
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
    await this.delay(400);

    // Extract a key term for the fill-in question
    const words = input.text.split(/\s+/);
    const keyWord = words.find((w) => w.length > 6) || 'concept';

    return {
      mcq: {
        q: 'What is the main purpose of this section?',
        options: [
          'To introduce foundational concepts',
          'To provide entertainment',
          'To confuse the reader',
          'To sell a product',
        ],
        correct: 0,
        why: 'This section focuses on introducing and explaining core concepts to help you understand the topic better.',
      },
      fill: {
        q: `The key term discussed in this section is _____.`,
        a: keyWord.toLowerCase(),
      },
    };
  }

  async adjustLevel(input: {
    text: string;
    level: 'beginner' | 'advanced';
  }): Promise<string> {
    await this.delay(300);

    if (input.level === 'beginner') {
      return `[Simplified] ${input.text.slice(0, 150)}... (This would be rewritten for beginners)`;
    } else {
      return `[Advanced] ${input.text.slice(0, 150)}... (This would include more technical details)`;
    }
  }

  async polish(input: { text: string }): Promise<string> {
    await this.delay(200);

    // In mock mode, just return the input with minor formatting
    return input.text.trim();
  }

  async translate(input: { text: string; to: string }): Promise<string> {
    await this.delay(300);

    return `[${input.to.toUpperCase()}] ${input.text.slice(0, 100)}... (Translation not implemented in mock mode)`;
  }

  // P1 hooks - stub implementations
  async explainCode(input: { code: string; lang?: string }): Promise<string> {
    await this.delay(300);

    return `This ${input.lang || 'code'} snippet demonstrates:\n\n1. **Input**: Takes parameters or data\n2. **Processing**: Performs operations or calculations\n3. **Output**: Returns results or modifies state\n\nCommon pitfalls to watch for: edge cases, performance, and error handling.`;
  }

  async chooseVisualTemplate(input: { text: string }): Promise<{
    template: 'none' | 'flowchart' | 'concept_map' | 'compare';
    params: Record<string, unknown>;
  }> {
    await this.delay(200);

    // Simple heuristic: look for keywords
    const text = input.text.toLowerCase();

    if (text.includes('step') || text.includes('process') || text.includes('flow')) {
      return {
        template: 'flowchart',
        params: { steps: ['Start', 'Process', 'Decision', 'End'] },
      };
    }

    if (text.includes('versus') || text.includes('compared') || text.includes('difference')) {
      return {
        template: 'compare',
        params: { items: ['Item A', 'Item B'] },
      };
    }

    if (text.includes('concept') || text.includes('relationship')) {
      return {
        template: 'concept_map',
        params: { nodes: ['Central Concept', 'Related Idea 1', 'Related Idea 2'] },
      };
    }

    return {
      template: 'none',
      params: {},
    };
  }

  // Helper methods
  private generateMockSummary(text: string, goal?: 'explain' | 'example'): string {
    const words = text.split(/\s+/).slice(0, 150);
    const baseText = words.join(' ');

    if (goal === 'explain') {
      return `This section explains important concepts. ${baseText.slice(0, 120)}...`;
    } else if (goal === 'example') {
      return `For example, consider how ${baseText.slice(0, 100)}...`;
    }

    return `${baseText.slice(0, 150)}...`;
  }

  private generateMockExample(): string {
    return 'For instance, when working with this concept, you might encounter scenarios where you need to apply these principles in real-world situations.';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockProvider = new MockAIProvider();

