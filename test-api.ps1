# AI Capability Service API 测试脚本

$baseUrl = "http://localhost:3000"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "AI Capability Service API 测试" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. 健康检查测试
Write-Host "1. 测试健康检查接口..." -ForegroundColor Yellow
Write-Host "   GET $baseUrl/health" -ForegroundColor Gray
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   成功" -ForegroundColor Green
    Write-Host "   响应: $($health | ConvertTo-Json -Compress)" -ForegroundColor DarkGray
} catch {
    Write-Host "   失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. 成功的 text_summary 请求
Write-Host "2. 测试成功的 text_summary 请求..." -ForegroundColor Yellow
Write-Host "   POST $baseUrl/v1/capabilities/run" -ForegroundColor Gray

$successBody = @{
    capability = "text_summary"
    input = @{
        text = "这是一段很长的文本内容，需要进行摘要处理。文本摘要是一种自然语言处理技术，它能够从长文本中提取关键信息，生成简洁的摘要。这是第三句话。这是第四句话。"
        max_length = 50
    }
    request_id = "test-success-001"
} | ConvertTo-Json -Compress

try {
    $successResponse = Invoke-RestMethod -Uri "$baseUrl/v1/capabilities/run" -Method POST -ContentType "application/json" -Body $successBody
    Write-Host "   成功" -ForegroundColor Green
    Write-Host "   响应:" -ForegroundColor DarkGray
    $successResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor DarkGray
} catch {
    Write-Host "   失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. 失败的请求 - 不存在的 capability
Write-Host "3. 测试不存在的 capability..." -ForegroundColor Yellow
Write-Host "   POST $baseUrl/v1/capabilities/run" -ForegroundColor Gray

$notFoundBody = @{
    capability = "unknown_capability"
    input = @{
        text = "test"
    }
    request_id = "test-notfound-002"
} | ConvertTo-Json -Compress

try {
    $notFoundResponse = Invoke-RestMethod -Uri "$baseUrl/v1/capabilities/run" -Method POST -ContentType "application/json" -Body $notFoundBody
    Write-Host "   响应: $($notFoundResponse | ConvertTo-Json -Compress)" -ForegroundColor DarkGray
} catch {
    Write-Host "   正确返回错误 (HTTP $($_.Exception.Response.StatusCode.value__))" -ForegroundColor Green
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   错误响应:" -ForegroundColor DarkGray
    $errorBody | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor DarkGray
}
Write-Host ""

# 4. 失败的请求 - 缺少必填字段
Write-Host "4. 测试缺少必填字段..." -ForegroundColor Yellow
Write-Host "   POST $baseUrl/v1/capabilities/run" -ForegroundColor Gray

$invalidBody = @{
    capability = "text_summary"
    input = @{}
    request_id = "test-invalid-003"
} | ConvertTo-Json -Compress

try {
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/v1/capabilities/run" -Method POST -ContentType "application/json" -Body $invalidBody
    Write-Host "   响应: $($invalidResponse | ConvertTo-Json -Compress)" -ForegroundColor DarkGray
} catch {
    Write-Host "   正确返回错误 (HTTP $($_.Exception.Response.StatusCode.value__))" -ForegroundColor Green
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   错误响应:" -ForegroundColor DarkGray
    $errorBody | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor DarkGray
}
Write-Host ""

# 5. 测试不同的 max_length
Write-Host "5. 测试不同的 max_length 参数..." -ForegroundColor Yellow
Write-Host "   POST $baseUrl/v1/capabilities/run" -ForegroundColor Gray

$longText = "人工智能（Artificial Intelligence），英文缩写为AI。它是研究、开发用于模拟、延伸和扩展人的智能的理论、方法、技术及应用系统的一门新的技术科学。人工智能是计算机科学的一个分支，它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器，该领域的研究包括机器人、语言识别、图像识别、自然语言处理和专家系统等。"

$lengthBody = @{
    capability = "text_summary"
    input = @{
        text = $longText
        max_length = 100
    }
    request_id = "test-length-004"
} | ConvertTo-Json -Compress

try {
    $lengthResponse = Invoke-RestMethod -Uri "$baseUrl/v1/capabilities/run" -Method POST -ContentType "application/json" -Body $lengthBody
    Write-Host "   成功" -ForegroundColor Green
    Write-Host "   原文长度: $($longText.Length) 字符" -ForegroundColor DarkGray
    Write-Host "   摘要长度: $($lengthResponse.data.result.Length) 字符" -ForegroundColor DarkGray
    Write-Host "   摘要内容: $($lengthResponse.data.result)" -ForegroundColor DarkGray
} catch {
    Write-Host "   失败: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "测试完成" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
