/**
 * Test Chrome Built-in AI APIs
 * Run this in the browser console to verify API availability
 */

export async function testChromeAIAPIs() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    apis: {},
  };

  console.group('🧪 Testing Chrome Built-in AI APIs');

  // Test Writer API
  try {
    console.log('Testing Writer API...');
    if ('ai' in self && 'writer' in (self as any).ai) {
      const writer = await (self as any).ai.writer.create();
      const result = await writer.write('Explain quantum computing', {
        context: 'Educational explanation for beginners',
      });
      results.apis.writer = {
        available: true,
        sample: result.substring(0, 100) + '...',
      };
      console.log('✅ Writer API: Available');
    } else {
      results.apis.writer = { available: false, error: 'API not found' };
      console.log('❌ Writer API: Not available');
    }
  } catch (error) {
    results.apis.writer = { available: false, error: (error as Error).message };
    console.log('❌ Writer API error:', error);
  }

  // Test Proofreader API
  try {
    console.log('Testing Proofreader API...');
    if ('ai' in self && 'proofreader' in (self as any).ai) {
      const proofreader = await (self as any).ai.proofreader.create();
      const result = await proofreader.proofread('This is a test sentance with a mistake.');
      results.apis.proofreader = {
        available: true,
        sample: result.substring(0, 100),
      };
      console.log('✅ Proofreader API: Available');
    } else {
      results.apis.proofreader = { available: false, error: 'API not found' };
      console.log('❌ Proofreader API: Not available');
    }
  } catch (error) {
    results.apis.proofreader = { available: false, error: (error as Error).message };
    console.log('❌ Proofreader API error:', error);
  }

  // Test Rewriter API
  try {
    console.log('Testing Rewriter API...');
    if ('ai' in self && 'rewriter' in (self as any).ai) {
      const rewriter = await (self as any).ai.rewriter.create();
      const result = await rewriter.rewrite('Make this text more formal', {
        context: 'Professional documentation',
      });
      results.apis.rewriter = {
        available: true,
        sample: result.substring(0, 100),
      };
      console.log('✅ Rewriter API: Available');
    } else {
      results.apis.rewriter = { available: false, error: 'API not found' };
      console.log('❌ Rewriter API: Not available');
    }
  } catch (error) {
    results.apis.rewriter = { available: false, error: (error as Error).message };
    console.log('❌ Rewriter API error:', error);
  }

  // Test Prompt API
  try {
    console.log('Testing Prompt API...');
    if ('ai' in self && 'languageModel' in (self as any).ai) {
      const session = await (self as any).ai.languageModel.create();
      const result = await session.prompt('What is 2+2?');
      results.apis.promptAPI = {
        available: true,
        sample: result.substring(0, 100),
      };
      console.log('✅ Prompt API: Available');
      session.destroy();
    } else {
      results.apis.promptAPI = { available: false, error: 'API not found' };
      console.log('❌ Prompt API: Not available');
    }
  } catch (error) {
    results.apis.promptAPI = { available: false, error: (error as Error).message };
    console.log('❌ Prompt API error:', error);
  }

  // Test Summarizer API
  try {
    console.log('Testing Summarizer API...');
    if ('ai' in self && 'summarizer' in (self as any).ai) {
      const summarizer = await (self as any).ai.summarizer.create({
        type: 'key-points',
        length: 'short',
      });
      const longText = 'Artificial intelligence is transforming how we interact with technology. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions. Neural networks, inspired by the human brain, enable computers to learn from experience.';
      const result = await summarizer.summarize(longText);
      results.apis.summarizer = {
        available: true,
        sample: result.substring(0, 100),
      };
      console.log('✅ Summarizer API: Available');
      summarizer.destroy();
    } else {
      results.apis.summarizer = { available: false, error: 'API not found' };
      console.log('❌ Summarizer API: Not available');
    }
  } catch (error) {
    results.apis.summarizer = { available: false, error: (error as Error).message };
    console.log('❌ Summarizer API error:', error);
  }

  console.groupEnd();
  console.log('📊 Test Results:', results);
  
  return results;
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('💡 Run testChromeAIAPIs() to test all APIs');
}

