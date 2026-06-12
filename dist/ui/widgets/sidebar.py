"""
侧边栏组件 - 页面导航
"""

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QPushButton, QLabel
from PyQt6.QtCore import Qt, pyqtSignal


class Sidebar(QWidget):
    """侧边栏导航组件"""

    # 导航信号，传递页面名称
    navigate = pyqtSignal(str)

    # 页面名称常量
    PAGE_START = "start"
    PAGE_DATA = "data"
    PAGE_SETTINGS = "settings"
    PAGE_MORE = "more"

    def __init__(self, parent=None):
        super().__init__(parent)
        self._current_page = self.PAGE_START
        self._setup_ui()

    def _setup_ui(self):
        """设置UI"""
        self.setFixedWidth(200)
        self.setStyleSheet("""
            QWidget {
                background-color: #FFFFFF;
                border-right: 1px solid #E5E7EB;
            }
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 20, 0, 20)
        layout.setSpacing(8)

        # 标题
        title = QLabel("导航", self)
        title.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: bold;
                color: #1E1B4B;
                padding: 10px 20px;
                font-family: Microsoft YaHei;
            }
        """)
        layout.addWidget(title)

        # 分隔线
        line = QWidget(self)
        line.setFixedHeight(1)
        line.setStyleSheet("background-color: #E5E7EB;")
        layout.addWidget(line)

        layout.addSpacing(20)

        # 导航按钮
        self._btn_start = self._create_nav_button("开始", self.PAGE_START)
        self._btn_data = self._create_nav_button("导入", self.PAGE_DATA)
        self._btn_settings = self._create_nav_button("设置", self.PAGE_SETTINGS)
        self._btn_more = self._create_nav_button("更多", self.PAGE_MORE)

        layout.addWidget(self._btn_start)
        layout.addWidget(self._btn_data)
        layout.addWidget(self._btn_settings)
        layout.addWidget(self._btn_more)

        layout.addStretch()

        # 底部版本信息
        version = QLabel("v1.0.0", self)
        version.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #9CA3AF;
                padding: 10px 20px;
                font-family: Microsoft YaHei;
            }
        """)
        version.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(version)

        # 设置默认选中
        self._set_active_button(self._btn_start)

    def _create_nav_button(self, text: str, page: str) -> QPushButton:
        """创建导航按钮"""
        btn = QPushButton(text, self)
        btn.setFixedHeight(50)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setStyleSheet("""
            QPushButton {
                background-color: transparent;
                border: none;
                text-align: left;
                padding-left: 20px;
                font-size: 16px;
                color: #4B5563;
                font-family: Microsoft YaHei;
            }
            QPushButton:hover {
                background-color: #F3F4F6;
                color: #1E1B4B;
            }
            QPushButton:pressed {
                background-color: #E5E7EB;
            }
        """)
        btn.clicked.connect(lambda: self._on_nav_click(page, btn))
        return btn

    def _on_nav_click(self, page: str, btn: QPushButton):
        """导航按钮点击"""
        if page == self._current_page:
            return
        self._set_active_button(btn)
        self._current_page = page
        self.navigate.emit(page)

    def _set_active_button(self, active_btn: QPushButton):
        """设置活跃按钮样式"""
        all_buttons = [self._btn_start, self._btn_data, self._btn_settings, self._btn_more]
        for btn in all_buttons:
            if btn == active_btn:
                btn.setStyleSheet("""
                    QPushButton {
                        background-color: #EEF2FF;
                        border: none;
                        text-align: left;
                        padding-left: 20px;
                        font-size: 16px;
                        font-weight: bold;
                        color: #6366F1;
                        font-family: Microsoft YaHei;
                    }
                """)
            else:
                btn.setStyleSheet("""
                    QPushButton {
                        background-color: transparent;
                        border: none;
                        text-align: left;
                        padding-left: 20px;
                        font-size: 16px;
                        color: #4B5563;
                        font-family: Microsoft YaHei;
                    }
                    QPushButton:hover {
                        background-color: #F3F4F6;
                        color: #1E1B4B;
                    }
                    QPushButton:pressed {
                        background-color: #E5E7EB;
                    }
                """)