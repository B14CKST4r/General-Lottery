"""
页面基类 - 所有页面的父类
"""

from PyQt6.QtWidgets import QWidget
from PyQt6.QtCore import pyqtSignal


class BasePage(QWidget):
    """页面基类"""

    # 页面切换信号
    switch_to_page = pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self._page_name = "base"

    @property
    def page_name(self) -> str:
        """获取页面名称"""
        return self._page_name

    def on_enter(self):
        """进入页面时的回调"""
        pass

    def on_exit(self):
        """离开页面时的回调"""
        pass