"""
抽签引擎单元测试
"""

import pytest
from dist.engine.draw import DrawEngine


class TestDrawEngine:
    """抽签引擎测试类"""

    def test_init_with_data(self):
        """测试初始化"""
        data = ["张三", "李四", "王五"]
        engine = DrawEngine(data)
        assert engine.get_original_count() == 3
        assert engine.get_remaining_count() == 3

    def test_init_with_empty_data(self):
        """测试空数据初始化"""
        engine = DrawEngine([])
        assert engine.get_original_count() == 0
        assert engine.get_remaining_count() == 0

    def test_draw_single_normal(self):
        """测试单人模式正常抽取"""
        data = ["张三", "李四", "王五"]
        engine = DrawEngine(data)
        winner = engine.draw_single()
        assert winner in data

    def test_draw_single_empty(self):
        """测试单人模式空数据"""
        engine = DrawEngine([])
        winner = engine.draw_single()
        assert winner is None

    def test_draw_single_result_type(self):
        """测试单人模式返回类型"""
        engine = DrawEngine(["张三"])
        winner = engine.draw_single()
        assert isinstance(winner, str)

    def test_draw_multi_normal(self):
        """测试多人模式正常抽取"""
        data = ["张三", "李四", "王五", "赵六", "钱七"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(3)
        assert len(winners) == 3
        assert all(w in data for w in winners)

    def test_draw_multi_count_zero(self):
        """测试多人模式数量为0"""
        engine = DrawEngine(["张三", "李四"])
        winners = engine.draw_multi(0)
        assert winners == []

    def test_draw_multi_count_larger_than_data(self):
        """测试多人模式抽取数量大于数据量"""
        data = ["张三", "李四"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(5, allow_duplicate=False)
        assert len(winners) == 2  # 只能返回全部数据

    def test_draw_multi_with_duplicate(self):
        """测试多人模式允许重复"""
        data = ["张三", "李四"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(5, allow_duplicate=True)
        assert len(winners) == 5
        assert all(w in data for w in winners)

    def test_draw_elimination_order_length(self):
        """测试淘汰模式顺序长度"""
        data = ["张三", "李四", "王五", "赵六"]
        engine = DrawEngine(data)
        order = engine.draw_elimination()
        assert len(order) == 4

    def test_draw_elimination_champion_last(self):
        """测试淘汰模式冠军在最后"""
        data = ["张三", "李四", "王五"]
        engine = DrawEngine(data)
        order = engine.draw_elimination()
        champion = order[-1]
        assert champion in data

    def test_draw_elimination_unique(self):
        """测试淘汰模式每个人只能被淘汰一次"""
        data = ["甲", "乙", "丙", "丁"]
        engine = DrawEngine(data)
        order = engine.draw_elimination()
        assert len(set(order)) == 4  # 四个人都出现且唯一

    def test_draw_elimination_order_contains_all(self):
        """测试淘汰顺序包含所有参与者"""
        data = ["A", "B", "C", "D", "E"]
        engine = DrawEngine(data)
        order = engine.draw_elimination()
        assert set(order) == set(data)

    def test_reload_data(self):
        """测试重新加载数据"""
        data1 = ["张三", "李四"]
        data2 = ["王五", "赵六", "钱七"]
        engine = DrawEngine(data1)
        assert engine.get_original_count() == 2

        engine.reload(data2)
        assert engine.get_original_count() == 3
        assert engine.get_remaining_count() == 3

    def test_reset_elimination(self):
        """测试重置淘汰模式"""
        data = ["张三", "李四", "王五"]
        engine = DrawEngine(data)
        engine.draw_elimination()
        assert engine.get_elimination_count() == 1

        engine.reset_elimination()
        assert engine.get_elimination_count() == 3


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
    input("按 Enter 键退出...")
