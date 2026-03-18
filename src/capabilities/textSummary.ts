import { CapabilityHandler } from '../types';

interface TextSummaryInput {
  text: string;
  max_length?: number;
}

export class TextSummaryHandler implements CapabilityHandler {
  name = 'text_summary';

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
    
    // 模拟 AI 文本摘要
    // 实际项目中这里会调用真实的模型 API
    const summary = this.simulateSummary(text, max_length);
    
    // 模拟处理延迟
    await this.simulateLatency();
    
    return { result: summary };
  }

  private simulateSummary(text: string, maxLength: number): string {
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
      // 如果句子太长，直接截断
      summary = text.substring(0, maxLength);
    }
    
    if (summary.length < text.length) {
      summary += '...';
    }
    
    return summary;
  }

  private async simulateLatency(): Promise<void> {
    // 模拟 10-50ms 的处理延迟
    const delay = Math.floor(Math.random() * 40) + 10;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
