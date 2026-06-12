"""
WOTA抽签软件 - 抽签引擎
支持单人、多人和淘汰三种抽签模式
"""

import random
from typing import Optional


class DrawEngine:
    """抽签引擎"""

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

    def draw_single(self) -> Optional[str]:
        """
        单人模式：随机抽取1人

        Returns:
            中奖者姓名，或None（数据为空）
        """
        if not self._remaining_data:
            return None
        winner = random.choice(self._remaining_data)
        return winner

    def draw_multi(self, count: int, allow_duplicate: bool = False) -> list[str]:
        """
        多人模式：抽取指定人数

        Args:
            count: 要抽取的人数
            allow_duplicate: 是否允许重复抽取

        Returns:
            中奖者列表
        """
        if count <= 0:
            return []

        if allow_duplicate:
            # 允许重复：从原始数据中抽取
            return random.choices(self._original_data, k=count)
        else:
            # 不允许重复：从剩余数据中抽取
            available = min(count, len(self._remaining_data))
            winners = random.sample(self._remaining_data, available)
            return winners

    def draw_elimination(self) -> list[str]:
        """
        淘汰模式：逐一淘汰直至最后1人

        Returns:
            淘汰顺序列表，最后一人为冠军
        """
        self._elimination_order = []
        self._elimination_data = list(self._original_data)

        while len(self._elimination_data) > 1:
            # 随机选择一个淘汰
            eliminated = random.choice(self._elimination_data)
            self._elimination_order.append(eliminated)
            self._elimination_data.remove(eliminated)

        # 最后一轮剩余的1人为冠军
        if self._elimination_data:
            champion = self._elimination_data[0]
            self._elimination_order.append(champion)

        return self._elimination_order

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
