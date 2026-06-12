"""
更多页面 - 扩展功能占位
"""

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt

from .base_page import BasePage


class MorePage(BasePage):
    """更多页面"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._page_name = "more"
        self._setup_ui()

    def _setup_ui(self):
        """设置UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(20)

        title = QLabel("更多", self)
        title.setStyleSheet("""
            QLabel {
                font-size: 48px;
                font-weight: bold;
                color: #F59E0B;
                font-family: Microsoft YaHei;
            }
        """)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subtitle = QLabel("更多功能开发中...", self)
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