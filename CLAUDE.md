# WOTA抽签软件 - AI使用规范

## 1. 项目背景

本项目是一个基于PyQt5的Windows桌面抽签程序，用于随机抽签活动。代码库位于 `C:\Users\SMKF\Desktop\试做\程序\抽签`。

## 2. 技术栈

- **语言**: Python 3.12
- **框架**: PyQt5
- **数据存储**: JSON文件本地持久化
- **依赖文件**: `requirements.txt`
- **打包工具**: PyInstaller

## 3. 文件结构

```
抽签软件/
├── main.py              # 主程序入口（窗口协调器）
├── pages/               # 页面模块
│   ├── __init__.py
│   ├── base_page.py    # 页面基类
│   ├── start_page.py   # 启动页（抽签+背景选择+控制面板）
│   ├── data_page.py    # 数据管理页（导入/导出/删除）
│   ├── settings_page.py # 设置页（背景/粒子/快捷键/更多）
│   └── more_page.py    # 更多页（占位）
├── widgets/             # 组件模块
│   ├── __init__.py
│   ├── sidebar.py      # 侧边栏组件（白色，导航按钮）
│   ├── animated_bg.py  # 动画背景组件（支持纯色/粒子/渐变/光晕/图片）
│   └── bubble_toast.py # 气泡提示组件
├── core/                # 核心模块
│   ├── __init__.py
│   ├── data_manager.py # 数据和设置管理
│   │   ├── 数据操作: import_txt, import_csv, import_excel, export_csv, add_data, remove_data, clear_data
│   │   ├── 设置操作: load_settings, save_settings
│   │   └── 数据模型: self.data (list), self.settings (dict)
│   └── validators.py   # 问题检测与验证
├── styles/              # 样式模块
│   ├── __init__.py
│   └── theme.py        # 主题样式配置
├── 更新日志/
│   ├── README.md       # 更新日志索引
│   ├── 模板.md          # 日志记录模板
│   └── YYYY-MM-DD.md   # 每日更新记录
├── requirements.txt     # 依赖包
├── SPEC.md             # 项目规格文档
└── CLAUDE.md           # AI使用规范
```

## 4. 代码结构

### 4.1 主窗口结构

```
MainWindow (QMainWindow)
├── 浅蓝色背景 (#E8F4FC)
├── 侧边栏 Sidebar (白色，带阴影)
│   ├── 导航按钮: 启动、数据管理、设置、更多
│   └── 底部版本信息
└── 内容区 (白色卡片，带阴影)
    └── QStackedWidget
        ├── StartPage   # 启动页
        ├── DataPage   # 数据管理页
        ├── SettingsPage # 设置页
        └── MorePage   # 更多页
```

### 4.2 启动页结构

```
StartPage
├── 左侧主区域
│   ├── 背景动画层（纯色/粒子/渐变/光晕/图片）
│   ├── 标题 "抽签系统"
│   ├── 数据统计
│   ├── 结果显示卡片
│   └── 控制按钮（开始抽签/重新抽签）
└── 右侧控制面板
    ├── 控制面板标题
    ├── 背景样式选择
    └── 数据集列表
```

### 4.3 模式翻译映射

内部使用英文值，UI显示中文：
```python
# 抽签模式
{"单人模式": "single", "多人模式": "multi", "淘汰模式": "elimination"}

# 背景效果
{"纯色": "solid", "粒子": "particle", "渐变": "gradient", "光晕": "glow", "图片": "image"}
```

## 5. 数据结构

### 5.1 settings.json 结构
```json
{
  "animation_speed": 50,
  "animation_effect": "particle",
  "primary_color": "#6366F1",
  "particle_color": "#6366F1",
  "secondary_color": "#4F46E5",
  "accent_color": "#F59E0B",
  "background_color": "#1E1B4B",
  "background_type": "solid",
  "background_image": "",
  "drawing_mode": "single",
  "multi_count": 3,
  "allow_duplicate": false,
  "shortcuts": {
    "start_draw": "Space",
    "reset_draw": "R",
    "back_standby": "Escape",
    "open_data": "D",
    "open_settings": "S"
  }
}
```

### 5.2 data.json 结构
```json
["张三", "李四", "王五", ...]
```

## 6. 关键实现细节

### 6.1 阴影效果

使用 QGraphicsDropShadowEffect 实现阴影：
```python
shadow = QGraphicsDropShadowEffect()
shadow.setBlurRadius(10)
shadow.setColor(QColor(0, 0, 0, 60))
shadow.setOffset(2, 0)
widget.setGraphicsEffect(shadow)
```

### 6.2 动画Widget鼠标穿透

启动页动画覆盖整个页面但需穿透鼠标事件：
```python
content.setAttribute(Qt.WA_TransparentForMouseEvents)
```

### 6.3 Layout可见性

PyQt5中QHBoxLayout/QVBoxLayout没有setVisibility方法，需用QWidget包装：
```python
self.multi_count_widget = QWidget()
self.multi_count_layout = QHBoxLayout(self.multi_count_widget)
# ...
self.multi_count_widget.setVisible(True/False)
```

## 7. 验证与问题检测

### 7.1 validators.py 验证函数

| 函数 | 说明 |
|------|------|
| validate_data_not_empty | 检测数据是否为空 |
| validate_multi_count | 检测多人模式抽出人数是否有效 |
| validate_shortcuts | 检测快捷键冲突 |
| validate_background_image | 检测背景图片是否有效 |
| validate_all | 综合验证所有设置 |

### 7.2 ValidationError 错误码

| 错误码 | 说明 |
|--------|------|
| DATA_EMPTY | 数据为空 |
| INVALID_MULTI_COUNT | 抽出人数无效 |
| MULTI_COUNT_TOO_LARGE | 抽出人数大于数据总数 |
| IMAGE_NOT_FOUND | 背景图片不存在 |
| INVALID_IMAGE_FORMAT | 不支持的图片格式 |
| MISSING_LIBRARY | 缺少必要的库 |

## 8. 修改代码时的注意事项

### 8.1 必须遵守的规范

1. **动画切换必须用deleteLater()** - 否则内存泄漏
2. **Layout不能调setVisibility** - 必须用QWidget包装
3. **模式/效果值转换** - 内部存储与UI显示需映射
4. **快捷键检测** - Space键需特殊处理 `event.key() == Qt.Key_Space`
5. **动画Widget鼠标穿透** - 否则按钮无法点击
6. **侧边栏带阴影** - 使用 QGraphicsDropShadowEffect

### 8.2 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| AttributeError: 'QHBoxLayout' object has no attribute 'setVisibility' | 直接对Layout调用 | 用QWidget包装 |
| 按钮无法点击 | 动画Widget遮挡 | 添加WA_TransparentForMouseEvents |
| 动画切换后程序变卡 | 旧widget未删除 | 使用deleteLater() |
| 模式切换崩溃 | 中英文值混淆 | 使用映射表转换 |

### 8.3 测试重点

- 侧边栏导航切换
- 启动页背景效果切换（五种效果）
- 数据导入（TX T/CSV/Excel）
- 数据删除功能
- 快捷键冲突检测
- 设置保存后重启程序

## 9. 辅助工具命令

```bash
# 语法检查
python -m py_compile main.py

# 检查所有模块
python -m py_compile core/*.py widgets/*.py pages/*.py styles/*.py

# 运行程序
python main.py

# 安装依赖
pip install PyQt5 pandas xlrd

# 打包exe
pyinstaller --onefile --windowed --name "WOTA抽签软件" main.py
```

## 10. 更新日志规范

### 10.1 文件结构
```
更新日志/
├── README.md        # 主索引，包含目录和汇总
├── 模板.md           # 日志记录模板
└── YYYY-MM-DD.md    # 每日更新记录
```

### 10.2 日志格式

```markdown
### 新增功能
| 功能 | 文件名 | 行号 | 说明 |
|------|--------|------|------|
|      |        | new |      |

**详细说明：**
#### {功能名称}
{详细实现说明}

### Bug修复
| Bug名 | 文件地址 | 行号 | 说明 |
|-------|----------|------|------|
|       |          |      |      |

**修复说明：**
#### {Bug名}
- **修改方案**: {修复方法}
- **原因与结果**: {bug原因导致了什么，结果是什么}
- **解决方案**: {新方法如何解决}（可选）

### 其他修改
| 修改内容 | 说明 |
|----------|------|
|          |      |

### 打包记录
| 时间 | 大小 | 说明 |
|------|------|------|
|      |      |      |
```

### 10.3 记录规范
1. **日期格式**: YYYY-MM-DD
2. **行号**: 新创建文件填 `new`，修改现有文件填具体行号
3. **新增功能**: 功能名、文件名、行号、简要说明；详细说明中写实现方式
4. **Bug修复**: Bug名、文件地址、行号、问题说明；修复说明中写原因和方案
5. **其他修改**: UI、美术、样式等方面的修改
6. **打包记录**: 时间、大小、说明

## 11. 未来扩展建议

- 添加数据库支持
- 支持抽签结果历史记录
- 添加音效
- 支持自定义背景图片
- 添加抽签结果导出为图片功能
- 多数据集管理
- 比赛模板管理