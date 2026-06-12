"""
数据管理页面 - 数据导入/导出
"""

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt

from .base_page import BasePage


class DataPage(BasePage):
    """数据管理/导入页面"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._page_name = "data"
        self._setup_ui()

    def _setup_ui(self):
        """设置UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(20)

        title = QLabel("数据管理", self)
        title.setStyleSheet("""
            QLabel {
                font-size: 48px;
                font-weight: bold;
                color: #F59E0B;
                font-family: Microsoft YaHei;
            }
        """)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subtitle = QLabel("导入、导出和管理抽签数据", self)
        subtitle.setStyleSheet("""
            QLabel {
                font-size: 24px;
                color: #FFFFFF;
                font-family: Microsoft YaHei;
            }
        """)
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)

        layout.addWidget(title)
        layout.addWidget(subtitle)
        layout.addStretch()

        self.setStyleSheet("""
            QWidget {
                background-color: #1E1B4B;
            }
        """)