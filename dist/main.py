"""
WOTA抽签软件 - PyQt6 重构版
主程序入口
"""

import sys
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtCore import Qt


class MainWindow(QMainWindow):
    """主窗口"""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("WOTA抽签软件")
        self.setGeometry(100, 100, 1200, 700)
        self._setup_ui()

    def _setup_ui(self):
        """设置UI - 待实现"""
        pass


def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()