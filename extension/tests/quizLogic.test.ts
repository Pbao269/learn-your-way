/**
 * Tests for quiz logic
 */

import { describe, it, expect } from 'vitest';

// Helper function to normalize answers (case-insensitive)
function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim();
}

// Helper function to check MCQ answer
function checkMCQAnswer(userAnswer: number, correctAnswer: number): boolean {
  return userAnswer === correctAnswer;
}

// Helper function to check fill-in answer
function checkFillAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

describe('Quiz Logic', () => {
  describe('MCQ Answer Checking', () => {
    it('should correctly identify correct MCQ answer', () => {
      const userAnswer = 2;
      const correctAnswer = 2;
      
      expect(checkMCQAnswer(userAnswer, correctAnswer)).toBe(true);
    });

    it('should correctly identify incorrect MCQ answer', () => {
      const userAnswer = 1;
      const correctAnswer = 2;
      
      expect(checkMCQAnswer(userAnswer, correctAnswer)).toBe(false);
    });

    it('should handle zero-indexed answers', () => {
      const userAnswer = 0;
      const correctAnswer = 0;
      
      expect(checkMCQAnswer(userAnswer, correctAnswer)).toBe(true);
    });
  });

  describe('Fill-in Answer Checking', () => {
    it('should match exact answers (case-insensitive)', () => {
      expect(checkFillAnswer('React', 'react')).toBe(true);
      expect(checkFillAnswer('react', 'React')).toBe(true);
      expect(checkFillAnswer('REACT', 'react')).toBe(true);
    });

    it('should handle whitespace trimming', () => {
      expect(checkFillAnswer('  React  ', 'react')).toBe(true);
      expect(checkFillAnswer('React', '  react  ')).toBe(true);
    });

    it('should reject incorrect answers', () => {
      expect(checkFillAnswer('Vue', 'React')).toBe(false);
      expect(checkFillAnswer('Angular', 'React')).toBe(false);
    });

    it('should handle empty answers', () => {
      expect(checkFillAnswer('', 'React')).toBe(false);
      expect(checkFillAnswer('React', '')).toBe(false);
    });

    it('should handle special characters in answers', () => {
      expect(checkFillAnswer('Node.js', 'node.js')).toBe(true);
      expect(checkFillAnswer('C++', 'c++')).toBe(true);
    });
  });

  describe('Answer Normalization', () => {
    it('should normalize various answer formats', () => {
      expect(normalizeAnswer('  Hello World  ')).toBe('hello world');
      expect(normalizeAnswer('UPPERCASE')).toBe('uppercase');
      expect(normalizeAnswer('MixedCase')).toBe('mixedcase');
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score correctly for all correct answers', () => {
      const mcqCorrect = true;
      const fillCorrect = true;
      const score = {
        correct: (mcqCorrect ? 1 : 0) + (fillCorrect ? 1 : 0),
        total: 2,
      };
      
      expect(score.correct).toBe(2);
      expect(score.total).toBe(2);
    });

    it('should calculate score correctly for partial correct answers', () => {
      const mcqCorrect = true;
      const fillCorrect = false;
      const score = {
        correct: (mcqCorrect ? 1 : 0) + (fillCorrect ? 1 : 0),
        total: 2,
      };
      
      expect(score.correct).toBe(1);
      expect(score.total).toBe(2);
    });

    it('should calculate score correctly for all incorrect answers', () => {
      const mcqCorrect = false;
      const fillCorrect = false;
      const score = {
        correct: (mcqCorrect ? 1 : 0) + (fillCorrect ? 1 : 0),
        total: 2,
      };
      
      expect(score.correct).toBe(0);
      expect(score.total).toBe(2);
    });
  });
});

