import OpenAI from 'openai';
import { CapabilityHandler } from '../types';
import { config } from '../config';

interface TextSummaryInput {
  text: string;
  max_length?: number;
}

export class TextSummaryOpenAIHandler implements CapabilityHandler {
  name = 'text_summary';
  private client: OpenAI | null = null;

  constructor() {
    // 只在配置了 API Key 时初始化客户端
    if (config.openai.apiKey && config.openai.apiKey !== 'your_openai_api_key_here') {
      this.client = new OpenAI({
        apiKey: config.openai.apiKey,
        baseURL: config.openai.baseURL,
      });
    }
  }

  validate(input: Record<string, unknown>): boolean | { error: string } {
    if (!input.text || typeof input.text !== 'string') {
      return { error: 'Missing or invalid "text" field' };
    }

    if (input.max_length !== undefined) {
      if (typeof input.max_length !== 'number' || input.max_length <= 0) {
        return { error: '"max_length" must be a positive number' };
      }
    }

    return true;
  }

  async execute(input: TextSummaryInput): Promise<{ result: string }> {
    const { text, max_length = 120 } = input;

    // 如果没有配置 OpenAI API Key，回退到模拟实现
    if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
      console.log('[OpenAI] API Key not configured, falling back to mock implementation');
      return { result: this.mockSummary(text, max_length) };
    }

    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }
      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are a text summarization assistant. Summarize the given text in ${max_length} characters or less. Be concise and capture the main points.`,
          },
          {
            role: 'user',
            content: `Please summarize the following text:\n\n${text}`,
          },
        ],
        max_tokens: Math.ceil(max_length / 2),
        temperature: 0.3,
      });

      const summary = response.choices[0]?.message?.content?.trim() || '';

      return { result: summary };
    } catch (error) {
      console.error('[OpenAI] Error calling API:', error);
      // 出错时回退到模拟实现
      console.log('[OpenAI] Falling back to mock implementation due to error');
      return { result: this.mockSummary(text, max_length) };
    }
  }

  private mockSummary(text: string, maxLength: number): string {
    // 简单的摘要逻辑：提取前几句并截断
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    let summary = '';
    for (const sentence of sentences) {
      if ((summary + sentence).length <= maxLength) {
        summary += sentence.trim() + ' ';
      } else {
        break;
      }
    }

    summary = summary.trim();

    if (summary.length === 0) {
      summary = text.substring(0, maxLength);
    }

    if (summary.length < text.length) {
      summary += '...';
    }

    return summary;
  }
}
