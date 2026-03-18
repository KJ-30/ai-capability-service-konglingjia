import express from 'express';
import path from 'path';
import { requestLogger, errorLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import capabilitiesRouter from './routes/capabilities';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(requestLogger);

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/v1/capabilities', capabilitiesRouter);

// 根路由返回前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    meta: {
      request_id: 'unknown',
      capability: 'unknown',
      elapsed_ms: 0,
    },
  });
});

// 错误处理
app.use(errorLogger);
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 AI Capability Service is running on port ${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   POST http://localhost:${PORT}/v1/capabilities/run`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`🌐 Web UI: http://localhost:${PORT}`);
});

export default app;
