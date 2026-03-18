import OpenAI from 'openai';
import { CapabilityHandler } from '../types';
import { config } from '../config';

interface TextSummaryInput {
  text: string;
  max_length?: number;
}

export class TextSummaryDeepSeekHandler implements CapabilityHandler {
  name = 'text_summary';
  private client: OpenAI | null = null;

  constructor() {
    // 只在配置了 API Key 时初始化客户端
    if (config.deepseek.apiKey) {
      this.client = new OpenAI({
        apiKey: config.deepseek.apiKey,
        baseURL: config.deepseek.baseURL,
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

    // 如果没有配置 DeepSeek API Key，回退到模拟实现
    if (!config.deepseek.apiKey) {
      console.log('[DeepSeek] API Key not configured, falling back to mock implementation');
      return { result: this.mockSummary(text, max_length) };
    }

    try {
      if (!this.client) {
        throw new Error('DeepSeek client not initialized');
      }
      const response = await this.client.chat.completions.create({
        model: config.deepseek.model,
        messages: [
          {
            role: 'system',
            content: `你是一个文本摘要助手。请将给定的文本摘要为 ${max_length} 个字符以内。要简洁并抓住要点。`,
          },
          {
            role: 'user',
            content: `请摘要以下文本：\n\n${text}`,
          },
        ],
        max_tokens: Math.ceil(max_length / 2),
        temperature: 0.3,
      });

      const summary = response.choices[0]?.message?.content?.trim() || '';

      return { result: summary };
    } catch (error) {
      console.error('[DeepSeek] Error calling API:', error);
      // 出错时回退到模拟实现
      console.log('[DeepSeek] Falling back to mock implementation due to error');
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
