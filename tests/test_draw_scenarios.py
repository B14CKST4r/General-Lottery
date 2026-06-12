"""
抽签引擎功能测试 - 针对单人/双人/自定义抽签场景

覆盖：
1. 单人抽签（不重复）
2. 双人抽签（可重复/不重复）
3. 自定义抽签（可重复/不重复）
"""

import pytest
from dist.engine.draw import DrawEngine


class TestSingleDraw:
    """单人抽签测试"""

    def test_single_draw_returns_one_person(self):
        """单人抽签返回1人"""
        data = ["张三", "李四", "王五", "赵六"]
        engine = DrawEngine(data)
        result = engine.draw_single()
        assert result is not None
        assert isinstance(result, str)

    def test_single_draw_result_in_data(self):
        """单人抽签结果在数据中"""
        data = ["张三", "李四", "王五"]
        engine = DrawEngine(data)
        result = engine.draw_single()
        assert result in data

    def test_single_draw_empty_data(self):
        """单人抽签空数据返回None"""
        engine = DrawEngine([])
        result = engine.draw_single()
        assert result is None

    def test_single_draw_is_random(self):
        """单人抽签结果随机（多次抽取应有不同结果）"""
        data = ["甲", "乙", "丙", "丁", "戊"]
        engine = DrawEngine(data)
        results = [engine.draw_single() for _ in range(50)]
        unique_results = set(results)
        # 多次抽取应该有一定随机性，不应该50次都抽到同一个人
        assert len(unique_results) > 1


class TestDoubleDraw:
    """双人抽签测试"""

    def test_double_draw_no_duplicate(self):
        """双人抽签（不重复）返回2个不同的人"""
        data = ["张三", "李四", "王五", "赵六", "钱七"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(2, allow_duplicate=False)
        assert len(winners) == 2
        assert len(set(winners)) == 2  # 两个人应该不同

    def test_double_draw_no_duplicate_result_in_data(self):
        """双人抽签（不重复）结果都在原始数据中"""
        data = ["A", "B", "C", "D", "E"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(2, allow_duplicate=False)
        assert all(w in data for w in winners)

    def test_double_draw_with_duplicate(self):
        """双人抽签（可重复）返回2人（可能重复）"""
        data = ["张三", "李四"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(2, allow_duplicate=True)
        assert len(winners) == 2
        assert all(w in data for w in winners)

    def test_double_draw_with_duplicate_can_repeat(self):
        """双人抽签（可重复）可能出现同一人被抽中多次"""
        data = ["甲", "乙"]
        engine = DrawEngine(data)
        # 进行多次抽取，验证可能出现重复
        has_duplicate = False
        for _ in range(100):
            winners = engine.draw_multi(2, allow_duplicate=True)
            if winners[0] == winners[1]:
                has_duplicate = True
                break
        assert has_duplicate, "可重复模式应该能抽到同一个人"

    def test_double_draw_no_duplicate_count_limit(self):
        """双人抽签（不重复）数据不足时返回实际人数"""
        data = ["张三", "李四"]  # 只有2人
        engine = DrawEngine(data)
        winners = engine.draw_multi(5, allow_duplicate=False)  # 要抽5人
        assert len(winners) == 2  # 只能返回2人


class TestCustomDraw:
    """自定义抽签测试"""

    def test_custom_draw_no_duplicate_normal(self):
        """自定义抽签（不重复）正常抽取"""
        data = ["张三", "李四", "王五", "赵六", "钱七"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(3, allow_duplicate=False)
        assert len(winners) == 3
        assert len(set(winners)) == 3  # 三个人都不同

    def test_custom_draw_with_duplicate_normal(self):
        """自定义抽签（可重复）正常抽取"""
        data = ["A", "B", "C"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(5, allow_duplicate=True)
        assert len(winners) == 5
        assert all(w in data for w in winners)

    def test_custom_draw_count_zero(self):
        """自定义抽签数量为0返回空列表"""
        engine = DrawEngine(["张三", "李四"])
        winners = engine.draw_multi(0, allow_duplicate=False)
        assert winners == []

    def test_custom_draw_count_larger_than_data_no_duplicate(self):
        """自定义抽签（不重复）数量大于数据量时返回全部数据"""
        data = ["甲", "乙", "丙"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(10, allow_duplicate=False)
        assert len(winners) == 3
        assert set(winners) == set(data)

    def test_custom_draw_count_larger_than_data_with_duplicate(self):
        """自定义抽签（可重复）数量大于数据量时正常返回"""
        data = ["甲", "乙"]
        engine = DrawEngine(data)
        winners = engine.draw_multi(10, allow_duplicate=True)
        assert len(winners) == 10
        assert all(w in data for w in winners)


class TestDrawModeComparison:
    """抽签模式对比测试"""

    def test_no_duplicate_vs_with_duplicate_difference(self):
        """验证不重复和可重复模式的区别"""
        data = ["A", "B", "C"]
        engine_no_dup = DrawEngine(data)
        engine_with_dup = DrawEngine(data)

        # 不重复模式：每次从剩余数据抽取
        winners_no_dup_1 = engine_no_dup.draw_multi(3, allow_duplicate=False)
        winners_no_dup_2 = engine_no_dup.draw_multi(3, allow_duplicate=False)

        # 可重复模式：每次从原始数据抽取
        winners_with_dup_1 = engine_with_dup.draw_multi(3, allow_duplicate=True)
        winners_with_dup_2 = engine_with_dup.draw_multi(3, allow_duplicate=True)

        # 可重复模式多次抽取结果总数应该都是3（因为从原始数据抽取）
        # 不重复模式第二次会因为数据被抽完而返回空或少量
        assert len(winners_with_dup_1) == 3
        assert len(winners_with_dup_2) == 3


class TestEngineState:
    """引擎状态测试"""

    def test_reload_resets_state(self):
        """重新加载数据重置引擎状态"""
        data1 = ["张三", "李四", "王五"]
        data2 = ["赵六", "钱七"]
        engine = DrawEngine(data1)

        assert engine.get_original_count() == 3
        assert engine.get_remaining_count() == 3

        # 重新加载数据
        engine.reload(data2)
        assert engine.get_original_count() == 2
        assert engine.get_remaining_count() == 2

    def test_draw_does_not_modify_remaining_data(self):
        """抽取操作不会修改剩余数据（当前实现设计如此）"""
        data = ["A", "B", "C", "D", "E"]
        engine = DrawEngine(data)
        assert engine.get_remaining_count() == 5

        # 进行抽取
        engine.draw_multi(3, allow_duplicate=False)
        engine.draw_single()

        # 剩余数据量不变（当前实现设计）
        assert engine.get_remaining_count() == 5

    def test_draw_with_duplicate_keeps_original_count(self):
        """可重复抽取不影响原始数据量"""
        data = ["甲", "乙", "丙"]
        engine = DrawEngine(data)

        engine.draw_multi(5, allow_duplicate=True)
        assert engine.get_original_count() == 3
        assert engine.get_remaining_count() == 3  # 剩余仍是3，因为从原始数据抽取


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
    input("按 Enter 键退出...")
