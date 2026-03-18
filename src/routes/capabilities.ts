import { Router, Request, Response, NextFunction } from 'express';
import { CapabilityRequest, SuccessResponse, ResponseMeta } from '../types';
import { AppError } from '../middleware/errorHandler';
import { TextSummaryOpenAIHandler } from '../capabilities/textSummaryOpenAI';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 注册所有 capability 处理器
const handlers = {
  text_summary: new TextSummaryOpenAIHandler(),
};

router.post('/run', async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  try {
    const body = req.body as CapabilityRequest;

    // 验证请求体
    if (!body || typeof body !== 'object') {
      throw new AppError('INVALID_REQUEST', 'Request body is required');
    }

    if (!body.capability || typeof body.capability !== 'string') {
      throw new AppError('INVALID_CAPABILITY', 'Missing or invalid "capability" field');
    }

    if (!body.input || typeof body.input !== 'object') {
      throw new AppError('INVALID_INPUT', 'Missing or invalid "input" field');
    }

    const { capability, input, request_id } = body;
    const metaRequestId = request_id || uuidv4();

    // 检查 capability 是否存在
    const handler = handlers[capability as keyof typeof handlers];
    if (!handler) {
      throw new AppError('CAPABILITY_NOT_FOUND', `Capability "${capability}" is not supported`, {
        available_capabilities: Object.keys(handlers),
      });
    }

    // 验证输入
    const validation = handler.validate(input);
    if (validation !== true) {
      throw new AppError('VALIDATION_ERROR', validation.error);
    }

    // 执行 capability
    const result = await handler.execute(input);

    const elapsed_ms = Date.now() - startTime;

    const meta: ResponseMeta = {
      request_id: metaRequestId,
      capability,
      elapsed_ms,
    };

    const response: SuccessResponse = {
      ok: true,
      data: result,
      meta,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
