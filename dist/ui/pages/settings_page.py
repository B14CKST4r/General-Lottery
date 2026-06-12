"""
设置页面 - 程序设置
"""

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt

from .base_page import BasePage


class SettingsPage(BasePage):
    """设置页面"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._page_name = "settings"
        self._setup_ui()

    def _setup_ui(self):
        """设置UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(20)

        title = QLabel("设置", self)
        title.setStyleSheet("""
            QLabel {
                font-size: 48px;
                font-weight: bold;
                color: #F59E0B;
                font-family: Microsoft YaHei;
            }
        """)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subtitle = QLabel("配置程序选项", self)
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