"""
开始页面 - 抽签主页面
"""

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt

from .base_page import BasePage


class StartPage(BasePage):
    """开始页面（抽签页面）"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._page_name = "start"
        self._setup_ui()

    def _setup_ui(self):
        """设置UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(20)

        title = QLabel("抽签系统", self)
        title.setStyleSheet("""
            QLabel {
                font-size: 48px;
                font-weight: bold;
                color: #F59E0B;
                font-family: Microsoft YaHei;
            }
        """)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subtitle = QLabel("准备开始抽签", self)
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