// 请求类型
export interface CapabilityRequest {
  capability: string;
  input: Record<string, unknown>;
  request_id?: string;
}

// 成功响应类型
export interface SuccessResponse<T = unknown> {
  ok: true;
  data: T;
  meta: ResponseMeta;
}

// 错误响应类型
export interface ErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: ResponseMeta;
}

// 响应元数据
export interface ResponseMeta {
  request_id: string;
  capability: string;
  elapsed_ms: number;
}

// 统一响应类型
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Capability 处理器接口
export interface CapabilityHandler {
  name: string;
  validate(input: Record<string, unknown>): boolean | { error: string };
  execute(input: Record<string, unknown>): Promise<unknown>;
}
