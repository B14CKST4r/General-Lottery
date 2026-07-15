"""
抽签引擎场景测试 - 配置驱动抽签

覆盖：
1. 单人抽签（预设配置）
2. 双人抽签（预设配置）
3. 自定义抽签（自定义配置）
4. 历史记录（保存/不保存）
5. 向后兼容性
"""

import pytest
from dist.engine.draw import DrawEngine, PRESET_SINGLE, PRESET_DOUBLE


class TestPresetSingleDraw:
    """单人抽签预设测试"""

    def test_single_preset_draw_returns_one(self):
        """单人预设返回1人"""
        data = ["张三", "李四", "王五"]
        engine = DrawEngine(data)
        engine.apply_preset(PRESET_SINGLE)
        result = engine.draw()
        assert result is not None
        assert isinstance(result, str)

    def test_single_preset_draw_in_data(self):
        """单人预设结果在数据中"""
        data = ["张三", "李四", "王五"]
        engine = DrawEngine(data)
        engine.apply_preset(PRESET_SINGLE)
        result = engine.draw()
        assert result in data

    def test_single_preset_empty_data(self):
        """单人预设空数据返回None"""
        engine = DrawEngine([])
        engine.apply_preset(PRESET_SINGLE)
        result = engine.draw()
        assert result is None

    def test_single_preset_saves_history(self):
        """单人预设默认保存历史"""
        data = ["张三", "李四", "王五"]
        engine = DrawEngine(data)
        engine.apply_preset(PRESET_SINGLE)
        engine.draw()
        assert len(engine.get_history()) == 1


class TestPresetDoubleDraw:
    """双人抽签预设测试"""

    def test_double_preset_draw_returns_two(self):
        """双人预设返回2人"""
        data = ["张三", "李四", "王五", "赵六"]
        engine = DrawEngine(data)
        engine.apply_preset(PRESET_DOUBLE)
        result = engine.draw()
        assert isinstance(result, list)
        assert len(result) == 2

    def test_double_preset_no_duplicate(self):
        """双人预设不重复"""
        data = ["张三", "李四", "王五", "赵六"]
        engine = DrawEngine(data)
        engine.apply_preset(PRESET_DOUBLE)
        result = engine.draw()
        assert len(set(result)) == 2

    def test_double_preset_result_in_data(self):
        """双人预设结果在数据中"""
        data = ["A", "B", "C", "D", "E"]
        engine = DrawEngine(data)
        engine.apply_preset(PRESET_DOUBLE)
        result = engine.draw()
        assert all(w in data for w in result)

    def test_double_preset_saves_history(self):
        """双人预设默认保存历史"""
        data = ["A", "B", "C", "D", "E"]
        engine = DrawEngine(data)
        engine.apply_preset(PRESET_DOUBLE)
        engine.draw()
        assert len(engine.get_history()) == 2


class TestCustomConfigDraw:
    """自定义配置抽签测试"""

    def test_custom_count(self):
        """自定义抽取人数"""
        data = ["A", "B", "C", "D", "E"]
        engine = DrawEngine(data)
        engine.count = 3
        engine.allow_duplicate = False
        engine.save_results = True
        result = engine.draw()
        assert isinstance(result, list)
        assert len(result) == 3

    def test_custom_with_duplicate(self):
        """自定义可重复抽取"""
        data = ["A", "B"]
        engine = DrawEngine(data)
        engine.count = 5
        engine.allow_duplicate = True
        engine.save_results = True
        result = engine.draw()
        assert len(result) == 5
        assert all(w in data for w in result)

    def test_custom_count_larger_than_data(self):
        """自定义数量大于数据量（不重复）"""
        data = ["A", "B"]
        engine = DrawEngine(data)
        engine.count = 5
        engine.allow_duplicate = False
        result = engine.draw()
        assert isinstance(result, list)
        assert len(result) == 2

    def test_custom_zero_count(self):
        """自定义count为0"""
        engine = DrawEngine(["A", "B", "C"])
        engine.count = 0
        result = engine.draw()
        assert result is None


class TestSaveResults:
    """保存结果测试"""

    def test_save_results_true_single(self):
        """保存结果 - 单人"""
        engine = DrawEngine(["A", "B", "C"])
        engine.count = 1
        engine.save_results = True
        engine.draw()
        assert len(engine.get_history()) == 1

    def test_save_results_true_multi(self):
        """保存结果 - 多人"""
        engine = DrawEngine(["A", "B", "C", "D", "E"])
        engine.count = 3
        engine.save_results = True
        engine.draw()
        assert len(engine.get_history()) == 3

    def test_save_results_false(self):
        """不保存结果"""
        engine = DrawEngine(["A", "B", "C", "D", "E"])
        engine.count = 3
        engine.save_results = False
        engine.draw()
        assert len(engine.get_history()) == 0

    def test_save_results_multiple_draws(self):
        """多次抽签累积历史"""
        engine = DrawEngine(["A", "B", "C", "D", "E"])
        engine.count = 2
        engine.save_results = True
        engine.draw()
        engine.reset_remaining()
        engine.draw()
        assert len(engine.get_history()) == 4

    def test_save_results_toggle(self):
        """切换保存开关"""
        engine = DrawEngine(["A", "B", "C", "D", "E"])
        engine.count = 1

        engine.save_results = True
        engine.draw()
        assert len(engine.get_history()) == 1

        engine.save_results = False
        engine.reset_remaining()
        engine.draw()
        assert len(engine.get_history()) == 1  # 第二次不保存


class TestBackwardCompatibility:
    """向后兼容性测试"""

    def test_draw_single_still_works(self):
        """旧方法 draw_single 仍可用"""
        engine = DrawEngine(["张三", "李四", "王五"])
        result = engine.draw_single()
        assert result is not None
        assert isinstance(result, str)

    def test_draw_multi_still_works(self):
        """旧方法 draw_multi 仍可用"""
        engine = DrawEngine(["A", "B", "C", "D", "E"])
        result = engine.draw_multi(3, allow_duplicate=False)
        assert len(result) == 3

    def test_draw_elimination_still_works(self):
        """旧方法 draw_elimination 仍可用"""
        engine = DrawEngine(["A", "B", "C"])
        result = engine.draw_elimination()
        assert len(result) == 3
        assert set(result) == {"A", "B", "C"}


class TestEngineState:
    """引擎状态测试"""

    def test_reload_resets_state(self):
        """重新加载数据重置引擎状态"""
        data1 = ["张三", "李四", "王五"]
        data2 = ["赵六", "钱七"]
        engine = DrawEngine(data1)
        assert engine.get_original_count() == 3
        engine.reload(data2)
        assert engine.get_original_count() == 2
        assert engine.get_remaining_count() == 2

    def test_draw_does_not_modify_remaining_with_duplicate(self):
        """可重复抽取不影响剩余数据"""
        data = ["甲", "乙", "丙"]
        engine = DrawEngine(data)
        engine.count = 5
        engine.allow_duplicate = True
        engine.draw()
        assert engine.get_remaining_count() == 3

    def test_reset_remaining(self):
        """重置剩余数据"""
        data = ["A", "B", "C", "D"]
        engine = DrawEngine(data)
        engine.count = 2
        engine.allow_duplicate = False
        engine.draw()
        assert engine.get_remaining_count() == 2
        engine.reset_remaining()
        assert engine.get_remaining_count() == 4

    def test_apply_preset_changes_config(self):
        """应用预设更改配置"""
        engine = DrawEngine(["A", "B", "C"])
        engine.count = 5
        engine.allow_duplicate = True
        engine.save_results = False

        engine.apply_preset(PRESET_SINGLE)
        assert engine.count == 1
        assert engine.allow_duplicate is False
        assert engine.save_results is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
    input("按 Enter 键退出...")