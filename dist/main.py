"""
WOTA抽签软件 - PyQt6 重构版
主程序入口
"""

import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QWidget, QHBoxLayout, QStackedWidget
from PyQt6.QtCore import Qt

from ui.pages import StartPage, DataPage, SettingsPage, MorePage
from ui.widgets import Sidebar


class MainWindow(QMainWindow):
    """主窗口"""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("WOTA抽签软件")
        self.setFixedSize(1000, 700)
        self._setup_ui()

    def _setup_ui(self):
        """设置UI"""
        # 创建中央部件
        central = QWidget(self)
        self.setCentralWidget(central)

        # 主布局：侧边栏 + 内容区
        main_layout = QHBoxLayout(central)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 创建侧边栏
        self.sidebar = Sidebar(self)
        self.sidebar.navigate.connect(self._on_navigate)

        # 创建页面堆栈
        self.pages = QStackedWidget(self)
        self.pages.setContentsMargins(0, 0, 0, 0)

        # 添加页面
        self.start_page = StartPage(self)
        self.data_page = DataPage(self)
        self.settings_page = SettingsPage(self)
        self.more_page = MorePage(self)

        self.pages.addWidget(self.start_page)
        self.pages.addWidget(self.data_page)
        self.pages.addWidget(self.settings_page)
        self.pages.addWidget(self.more_page)

        # 添加到主布局
        main_layout.addWidget(self.sidebar)
        main_layout.addWidget(self.pages, 1)

        # 设置页面索引映射
        self._page_index_map = {
            Sidebar.PAGE_START: 0,
            Sidebar.PAGE_DATA: 1,
            Sidebar.PAGE_SETTINGS: 2,
            Sidebar.PAGE_MORE: 3,
        }

    def _on_navigate(self, page: str):
        """导航到指定页面"""
        if page in self._page_index_map:
            index = self._page_index_map[page]
            self.pages.setCurrentIndex(index)


def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()