/**
 * AI Provider factory
 * Selects and provides the appropriate AI provider
 */

import type { AIProvider, AIProviderType } from './types';
import { mockProvider } from './mockProvider';
import { chromeProvider } from './chromeProvider';

/**
 * Get the current AI provider
 * Default: mockProvider
 * If Chrome AI is available and user opts in, use chromeProvider
 */
export function getAIProvider(preferredType?: AIProviderType): AIProvider {
  // Check environment variable or storage setting
  const type = preferredType || getStoredProviderType();

  if (type === 'chrome' && isChromeAIAvailable()) {
    console.log('Using Chrome built-in AI provider');
    return chromeProvider;
  }

  console.log('Using mock AI provider');
  return mockProvider;
}

/**
 * Check if Chrome AI is available
 */
function isChromeAIAvailable(): boolean {
  return typeof window !== 'undefined' && 'ai' in window;
}

/**
 * Get stored provider type from chrome.storage
 * Returns 'mock' by default
 */
function getStoredProviderType(): AIProviderType {
  // This is a synchronous check; actual storage read should be async
  // For now, default to mock
  // TODO: P1 - Add settings UI to let user choose provider
  return 'mock';
}

/**
 * Set provider type preference
 * @param type - 'mock' or 'chrome'
 */
export async function setProviderType(type: AIProviderType): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ aiProviderType: type });
    console.log(`AI provider set to: ${type}`);
  }
}

/**
 * Detect available AI capabilities
 */
export async function detectAICapabilities(): Promise<{
  chromeAI: boolean;
  summarizer: boolean;
  languageModel: boolean;
}> {
  const capabilities = {
    chromeAI: isChromeAIAvailable(),
    summarizer: false,
    languageModel: false,
  };

  if (capabilities.chromeAI && window.ai) {
    try {
      if (window.ai.summarizer) {
        const summarizerCaps = await window.ai.summarizer.capabilities();
        capabilities.summarizer = summarizerCaps.available !== 'no';
      }

      if (window.ai.languageModel) {
        const lmCaps = await window.ai.languageModel.capabilities();
        capabilities.languageModel = lmCaps.available !== 'no';
      }
    } catch (error) {
      console.warn('Failed to detect AI capabilities:', error);
    }
  }

  return capabilities;
}

// Export singleton instance with mock provider as default
export const aiProvider = getAIProvider();

