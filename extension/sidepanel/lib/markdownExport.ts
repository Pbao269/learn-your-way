/**
 * Markdown export functionality
 * Exports sprint progress and lesson content to Markdown
 */

import type { PageExtraction, LessonChunk } from '../../extract/types';
import type { ChunkProgress } from '../state/sprintStore';

export interface ExportData {
  extraction: PageExtraction;
  chunk: LessonChunk;
  objectives?: string[];
  explainer?: string;
  quiz?: {
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
  };
  notes?: string;
  progress?: ChunkProgress;
}

/**
 * Export a lesson chunk to Markdown format
 */
export function exportChunkToMarkdown(data: ExportData): string {
  const { extraction, chunk, objectives, explainer, quiz, notes, progress } = data;

  let markdown = '';

  // Header
  markdown += `# ${chunk.title}\n\n`;
  markdown += `**Source:** [${extraction.pageTitle}](${chunk.anchors.url})\n\n`;
  markdown += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;

  // License info
  if (extraction.license) {
    markdown += `**License:** ${extraction.license.kind || 'Unknown'}`;
    if (extraction.license.source) {
      markdown += ` (${extraction.license.source})`;
    }
    markdown += '\n\n';
  }

  markdown += '---\n\n';

  // Learning Objectives
  if (objectives && objectives.length > 0) {
    markdown += '## Learning Objectives\n\n';
    objectives.forEach((obj) => {
      markdown += `- ${obj}\n`;
    });
    markdown += '\n';
  }

  // Reading Mode Explainer
  if (explainer) {
    markdown += '## Summary\n\n';
    markdown += `${explainer}\n\n`;
  }

  // Code Blocks
  if (chunk.codeBlocks.length > 0) {
    markdown += '## Code Examples\n\n';
    chunk.codeBlocks.forEach((block, index) => {
      markdown += `### Example ${index + 1}${block.lang ? ` (${block.lang})` : ''}\n\n`;
      markdown += '```' + (block.lang || '') + '\n';
      markdown += block.code + '\n';
      markdown += '```\n\n';
    });
  }

  // Quiz Questions
  if (quiz) {
    markdown += '## Quick Check\n\n';
    
    // MCQ
    markdown += `### Question 1 (Multiple Choice)\n\n`;
    markdown += `${quiz.mcq.q}\n\n`;
    quiz.mcq.options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D
      const isCorrect = index === quiz.mcq.correct;
      markdown += `${letter}. ${option}${isCorrect ? ' ✓' : ''}\n`;
    });
    markdown += `\n**Answer:** ${String.fromCharCode(65 + quiz.mcq.correct)}\n\n`;
    markdown += `**Explanation:** ${quiz.mcq.why}\n\n`;

    // Fill-in
    markdown += `### Question 2 (Fill in the Blank)\n\n`;
    markdown += `${quiz.fill.q}\n\n`;
    markdown += `<details>\n`;
    markdown += `<summary>Show Answer</summary>\n\n`;
    markdown += `**Answer:** ${quiz.fill.a}\n\n`;
    markdown += `</details>\n\n`;
  }

  // Notes
  if (notes && notes.trim()) {
    markdown += '## My Notes\n\n';
    markdown += `${notes}\n\n`;
  }

  // Progress
  if (progress && progress.score) {
    markdown += '---\n\n';
    markdown += `**Quiz Score:** ${progress.score.correct}/${progress.score.total}\n\n`;
  }

  // Footer
  markdown += '---\n\n';
  markdown += `[↑ Back to source](${chunk.anchors.url})\n\n`;
  markdown += `*Exported from LearnMyWay Chrome Extension*\n`;

  return markdown;
}

/**
 * Export full lesson plan to Markdown
 */
export function exportLessonPlanToMarkdown(
  extraction: PageExtraction,
  progressMap: Record<string, ChunkProgress>
): string {
  let markdown = '';

  // Header
  markdown += `# ${extraction.pageTitle}\n\n`;
  markdown += `**Source:** ${extraction.pageUrl}\n\n`;
  markdown += `**Date:** ${new Date().toISOString().split('T')[0]}\n\n`;

  if (extraction.license) {
    markdown += `**License:** ${extraction.license.kind || 'Unknown'}\n\n`;
  }

  markdown += '---\n\n';

  // Table of Contents
  markdown += '## Table of Contents\n\n';
  extraction.chunks.forEach((chunk, index) => {
    const progress = progressMap[chunk.id];
    const status = progress?.status === 'done' ? '✓' : '○';
    const score = progress?.score ? ` (${progress.score.correct}/${progress.score.total})` : '';
    markdown += `${index + 1}. ${status} [${chunk.title}](#${slugify(chunk.title)})${score}\n`;
  });
  markdown += '\n';

  // Chunk summaries
  extraction.chunks.forEach((chunk) => {
    markdown += `## ${chunk.title}\n\n`;
    markdown += `[View source](${chunk.anchors.url})\n\n`;
    
    // Truncate text to first 100 words
    const words = chunk.text.split(/\s+/).slice(0, 100);
    markdown += `${words.join(' ')}...\n\n`;

    const progress = progressMap[chunk.id];
    if (progress) {
      markdown += `**Status:** ${progress.status}\n`;
      if (progress.score) {
        markdown += `**Score:** ${progress.score.correct}/${progress.score.total}\n`;
      }
      markdown += '\n';
    }
  });

  markdown += '---\n\n';
  markdown += `*Exported from LearnMyWay Chrome Extension*\n`;

  return markdown;
}

/**
 * Download markdown content as a file
 */
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Helper: Convert string to slug for anchor links
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

