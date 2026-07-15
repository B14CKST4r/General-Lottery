"""
WOTA抽签软件 - 抽签引擎
支持配置驱动的抽签功能，通过 count/allow_duplicate/save_results 控制行为
"""

import json
import os
import random
from typing import Optional


# 预设配置
PRESET_SINGLE = {"count": 1, "allow_duplicate": False, "save_results": True}
PRESET_DOUBLE = {"count": 2, "allow_duplicate": False, "save_results": True}


class DrawEngine:
    """抽签引擎 - 配置驱动"""

    def __init__(self, data: list[str]):
        """
        初始化抽签引擎

        Args:
            data: 名单列表
        """
        self._original_data = list(data)  # 原始数据副本
        self._remaining_data = list(data)  # 剩余可抽数据
        self._elimination_order: list[str] = []  # 淘汰顺序记录
        self._elimination_data: list[str] = list(data)  # 淘汰模式当前数据
        self._history: list[str] = []  # 抽出结果历史

        # 配置变量
        self.count: int = 1  # 抽签人数
        self.allow_duplicate: bool = False  # 是否允许重复
        self.save_results: bool = True  # 是否保存结果到历史

    def apply_preset(self, preset: dict) -> None:
        """
        应用预设配置

        Args:
            preset: 预设配置字典，如 PRESET_SINGLE 或 PRESET_DOUBLE
        """
        self.count = preset.get("count", 1)
        self.allow_duplicate = preset.get("allow_duplicate", False)
        self.save_results = preset.get("save_results", True)

    def draw(self) -> Optional[str | list[str]]:
        """
        根据当前配置执行抽签

        通过 count/allow_duplicate/save_results 控制行为：
        - count=1: 单人抽签，返回 str
        - count>1: 多人抽签，返回 list[str]
        - allow_duplicate=True: 允许重复抽取
        - save_results=True: 结果保存到历史记录

        Returns:
            count=1 时返回中奖者姓名(str)或None
            count>1 时返回中奖者列表(list[str])或空列表
        """
        if not self._remaining_data and not self.allow_duplicate:
            return None if self.count == 1 else []
        if self.count <= 0:
            return None if self.count == 0 else []

        if self.count == 1:
            # 单人抽签
            if self.allow_duplicate:
                result = random.choice(self._original_data)
            else:
                if not self._remaining_data:
                    return None
                result = random.choice(self._remaining_data)
                self._remaining_data.remove(result)
        else:
            # 多人抽签
            if self.allow_duplicate:
                if not self._original_data:
                    return []
                result = random.choices(self._original_data, k=self.count)
            else:
                if not self._remaining_data:
                    return []
                available = min(self.count, len(self._remaining_data))
                result = random.sample(self._remaining_data, available)
                for w in result:
                    self._remaining_data.remove(w)

        # 保存结果到历史
        if self.save_results:
            if isinstance(result, list):
                self._history.extend(result)
            else:
                self._history.append(result)

        return result

    def draw_single(self) -> Optional[str]:
        """
        单人模式：随机抽取1人（向后兼容）

        Returns:
            中奖者姓名，或None（数据为空）
        """
        old_count = self.count
        self.count = 1
        result = self.draw()
        self.count = old_count
        return result

    def draw_multi(self, count: int, allow_duplicate: bool = False) -> list[str]:
        """
        多人模式：抽取指定人数（向后兼容）

        Args:
            count: 要抽取的人数
            allow_duplicate: 是否允许重复抽取

        Returns:
            中奖者列表
        """
        old_count = self.count
        old_dup = self.allow_duplicate
        self.count = count
        self.allow_duplicate = allow_duplicate
        result = self.draw()
        self.count = old_count
        self.allow_duplicate = old_dup
        return result if isinstance(result, list) else ([result] if result else [])

    def draw_elimination(self) -> list[str]:
        """
        淘汰模式：逐一淘汰直至最后1人

        Returns:
            淘汰顺序列表，最后一人为冠军
        """
        self._elimination_order = []
        self._elimination_data = list(self._original_data)

        while len(self._elimination_data) > 1:
            idx = random.randrange(len(self._elimination_data))
            eliminated = self._elimination_data.pop(idx)
            self._elimination_order.append(eliminated)

        if self._elimination_data:
            champion = self._elimination_data[0]
            self._elimination_order.append(champion)

        # 保存淘汰结果到历史
        if self.save_results:
            self._history.extend(self._elimination_order)

        return self._elimination_order

    def load_config(self, config_path: str = None) -> None:
        """
        从配置文件加载抽签参数

        Args:
            config_path: 配置文件路径，默认为 dist/config/settings.json
        """
        if config_path is None:
            config_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "config", "settings.json"
            )

        if not os.path.exists(config_path):
            return

        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)

        self.count = config.get("multi_count", 1)
        self.allow_duplicate = config.get("allow_duplicate", False)
        self.save_results = config.get("save_results", True)

    def reload(self, data: list[str]) -> None:
        """
        重新加载数据

        Args:
            data: 新的名单列表
        """
        self._original_data = list(data)
        self._remaining_data = list(data)
        self._elimination_order = []
        self._elimination_data = list(data)

    def get_history(self) -> list[str]:
        """
        获取抽出结果历史

        Returns:
            结果历史列表的副本
        """
        return list(self._history)

    def clear_history(self) -> None:
        """清空结果历史"""
        self._history.clear()

    def get_remaining_count(self) -> int:
        """
        获取剩余可用数据条数

        Returns:
            剩余数据数量
        """
        return len(self._remaining_data)

    def get_original_count(self) -> int:
        """
        获取原始数据条数

        Returns:
            原始数据数量
        """
        return len(self._original_data)

    def get_elimination_count(self) -> int:
        """
        获取淘汰模式当前剩余人数

        Returns:
            淘汰模式中剩余未淘汰人数
        """
        return len(self._elimination_data)

    def reset_elimination(self) -> None:
        """重置淘汰模式状态"""
        self._elimination_order = []
        self._elimination_data = list(self._original_data)

    def reset_remaining(self) -> None:
        """重置剩余可抽数据（恢复为原始数据）"""
        self._remaining_data = list(self._original_data)