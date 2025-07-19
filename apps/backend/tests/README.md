# 后端测试文档

## 测试策略

我们采用分层测试策略，从底层到顶层逐步测试：

### 1. 单元测试 (Unit Tests)

#### `test_field_parsing.py`
- **目的**: 测试字段路径解析功能
- **覆盖**: 简单字段路径、数组索引、嵌套数组、无效路径、边界情况
- **测试数量**: 5个测试用例

#### `test_resume_service.py`
- **目的**: 测试简历服务核心功能
- **覆盖**: 字段更新、简历解析、建议接受、错误处理
- **测试数量**: 9个测试用例

#### `test_chat_service.py`
- **目的**: 测试聊天服务功能
- **覆盖**: 简历上下文格式化、聊天历史格式化、聊天处理、错误处理
- **测试数量**: 8个测试用例

### 2. 集成测试 (Integration Tests)

#### `test_api_integration.py`
- **目的**: 测试API端点的完整功能
- **覆盖**: 简历解析API、聊天API、建议接受API、健康检查
- **测试数量**: 12个测试用例

#### `test_main.py`
- **目的**: 测试主应用功能
- **覆盖**: 健康检查端点、测试端点
- **测试数量**: 2个测试用例

## 测试运行

### 运行所有测试
```bash
python -m pytest tests/ -v
```

### 运行特定测试文件
```bash
# 运行字段解析测试
python -m pytest tests/test_field_parsing.py -v

# 运行服务层测试
python -m pytest tests/test_resume_service.py -v
python -m pytest tests/test_chat_service.py -v

# 运行API集成测试
python -m pytest tests/test_api_integration.py -v
```

### 运行特定测试类
```bash
python -m pytest tests/test_field_parsing.py::TestFieldPathParsing -v
```

### 运行特定测试方法
```bash
python -m pytest tests/test_field_parsing.py::TestFieldPathParsing::test_simple_field_path -v
```

## 测试覆盖率

当前测试覆盖了以下功能：

### 字段路径解析
- ✅ 简单字段路径 (`basics.name`)
- ✅ 数组索引 (`work[0].description`)
- ✅ 嵌套数组 (`work[0].achievements[1]`)
- ✅ 无效路径处理
- ✅ 边界情况

### 简历服务
- ✅ 简历解析
- ✅ 字段更新
- ✅ 建议接受
- ✅ 错误处理

### 聊天服务
- ✅ 简历上下文格式化
- ✅ 聊天历史格式化
- ✅ 聊天处理
- ✅ 动作建议

### API集成
- ✅ 简历解析端点
- ✅ 聊天端点
- ✅ 建议接受端点
- ✅ 健康检查端点
- ✅ 错误处理

## Mock数据

测试使用mock LLM客户端，确保：
- 测试不依赖外部API
- 测试结果可预测
- 测试运行快速

## 测试数据清理

API集成测试使用内存存储，每个测试前会清理状态，确保测试之间不相互影响。

## 未来改进

1. 添加性能测试
2. 添加负载测试
3. 添加数据库集成测试（当添加持久化时）
4. 添加真实LLM API的集成测试 