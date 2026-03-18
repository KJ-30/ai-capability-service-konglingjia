# AI Capability Service

模型能力统一调用服务 - 一个最小化的后端服务，用于统一调用各种 AI 能力。

## 功能特性

- ✅ 统一的 Capability 调用接口
- ✅ 支持 `text_summary` 文本摘要能力
- ✅ 请求验证和错误处理
- ✅ 请求耗时统计
- ✅ 结构化日志记录
- ✅ 健康检查接口

## 技术栈

- Node.js + TypeScript
- Express.js
- Zod（运行时类型验证）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式启动

```bash
npm run dev
```

### 3. 生产模式构建和启动

```bash
npm run build
npm start
```

服务默认运行在 `http://localhost:3000`

## API 文档

### 健康检查

```bash
GET /health
```

### 执行 Capability

```bash
POST /v1/capabilities/run
```

#### 请求示例

```bash
curl -X POST http://localhost:3000/v1/capabilities/run \
  -H "Content-Type: application/json" \
  -d '{
    "capability": "text_summary",
    "input": {
      "text": "这是一段很长的文本内容，需要进行摘要处理。文本摘要是一种自然语言处理技术，它能够从长文本中提取关键信息，生成简洁的摘要。",
      "max_length": 50
    },
    "request_id": "req-123456"
  }'
```

#### 成功响应

```json
{
  "ok": true,
  "data": {
    "result": "这是一段很长的文本内容，需要进行摘要处理..."
  },
  "meta": {
    "request_id": "req-123456",
    "capability": "text_summary",
    "elapsed_ms": 15
  }
}
```

#### 错误响应

```json
{
  "ok": false,
  "error": {
    "code": "CAPABILITY_NOT_FOUND",
    "message": "Capability \"unknown_capability\" is not supported",
    "details": {
      "available_capabilities": ["text_summary"]
    }
  },
  "meta": {
    "request_id": "req-123456",
    "capability": "unknown_capability",
    "elapsed_ms": 2
  }
}
```

## 支持的 Capabilities

### text_summary

文本摘要能力，将长文本压缩为指定长度的摘要。

**输入参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 是 | 需要摘要的原始文本 |
| max_length | number | 否 | 摘要最大长度（字符数），默认 120 |

**输出：**

| 字段 | 类型 | 说明 |
|------|------|------|
| result | string | 摘要后的文本 |

## 错误码

| 错误码 | 说明 |
|--------|------|
| INVALID_REQUEST | 请求体格式错误 |
| INVALID_CAPABILITY | capability 字段缺失或无效 |
| INVALID_INPUT | input 字段缺失或无效 |
| CAPABILITY_NOT_FOUND | 请求的 capability 不存在 |
| VALIDATION_ERROR | 输入参数验证失败 |
| INTERNAL_ERROR | 服务器内部错误 |

## 项目结构

```
.
├── src/
│   ├── capabilities/      # Capability 处理器
│   │   └── textSummary.ts
│   ├── middleware/        # 中间件
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── routes/           # 路由
│   │   └── capabilities.ts
│   ├── types/            # 类型定义
│   │   └── index.ts
│   └── index.ts          # 入口文件
├── package.json
├── tsconfig.json
└── README.md
```

## 开发计划

- [ ] 接入真实模型 API（OpenAI / Claude）
- [ ] 支持更多 capability（text_translation、sentiment_analysis 等）
- [ ] 添加单元测试
- [ ] 添加 API 限流
- [ ] 添加请求缓存

## License

MIT
