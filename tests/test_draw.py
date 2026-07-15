"""
抽签引擎单元测试
"""

import os
import pytest
from dist.engine.draw import DrawEngine, PRESET_SINGLE, PRESET_DOUBLE


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
        assert len(winners) == 2

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
        assert len(set(order)) == 4

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

    def test_reset_remaining(self):
        """测试重置剩余数据"""
        data = ["A", "B", "C", "D"]
        engine = DrawEngine(data)
        engine.draw_multi(2, allow_duplicate=False)
        assert engine.get_remaining_count() == 2
        engine.reset_remaining()
        assert engine.get_remaining_count() == 4


class TestPresetConfig:
    """预设配置测试"""

    def test_preset_single(self):
        """测试单人预设配置"""
        engine = DrawEngine(["A", "B", "C"])
        engine.apply_preset(PRESET_SINGLE)
        assert engine.count == 1
        assert engine.allow_duplicate is False
        assert engine.save_results is True

    def test_preset_double(self):
        """测试双人预设配置"""
        engine = DrawEngine(["A", "B", "C"])
        engine.apply_preset(PRESET_DOUBLE)
        assert engine.count == 2
        assert engine.allow_duplicate is False
        assert engine.save_results is True

    def test_draw_with_single_preset(self):
        """测试使用单人预设抽签"""
        engine = DrawEngine(["张三", "李四", "王五"])
        engine.apply_preset(PRESET_SINGLE)
        result = engine.draw()
        assert result is not None
        assert isinstance(result, str)

    def test_draw_with_double_preset(self):
        """测试使用双人预设抽签"""
        engine = DrawEngine(["张三", "李四", "王五", "赵六"])
        engine.apply_preset(PRESET_DOUBLE)
        result = engine.draw()
        assert isinstance(result, list)
        assert len(result) == 2


class TestConfigDraw:
    """配置驱动抽签测试"""

    def test_draw_config_single(self):
        """测试配置驱动单人抽签"""
        engine = DrawEngine(["A", "B", "C"])
        engine.count = 1
        engine.allow_duplicate = False
        result = engine.draw()
        assert isinstance(result, str)
        assert result in ["A", "B", "C"]

    def test_draw_config_multi(self):
        """测试配置驱动多人抽签"""
        engine = DrawEngine(["A", "B", "C", "D", "E"])
        engine.count = 3
        engine.allow_duplicate = False
        result = engine.draw()
        assert isinstance(result, list)
        assert len(result) == 3

    def test_draw_config_duplicate(self):
        """测试配置驱动可重复抽签"""
        engine = DrawEngine(["A", "B"])
        engine.count = 5
        engine.allow_duplicate = True
        result = engine.draw()
        assert isinstance(result, list)
        assert len(result) == 5

    def test_draw_config_zero_count(self):
        """测试配置驱动count为0"""
        engine = DrawEngine(["A", "B", "C"])
        engine.count = 0
        result = engine.draw()
        assert result is None


class TestHistory:
    """历史记录测试"""

    def test_save_results_true(self):
        """测试保存结果到历史"""
        engine = DrawEngine(["A", "B", "C", "D", "E"])
        engine.count = 2
        engine.save_results = True
        engine.draw()
        assert len(engine.get_history()) == 2

    def test_save_results_false(self):
        """测试不保存结果到历史"""
        engine = DrawEngine(["A", "B", "C", "D", "E"])
        engine.count = 2
        engine.save_results = False
        engine.draw()
        assert len(engine.get_history()) == 0

    def test_get_history(self):
        """测试获取历史记录"""
        engine = DrawEngine(["A", "B", "C"])
        engine.count = 1
        engine.save_results = True
        engine.draw()
        engine.draw()
        assert len(engine.get_history()) == 2

    def test_clear_history(self):
        """测试清空历史记录"""
        engine = DrawEngine(["A", "B", "C"])
        engine.count = 1
        engine.save_results = True
        engine.draw()
        engine.draw()
        engine.clear_history()
        assert len(engine.get_history()) == 0

    def test_history_returns_copy(self):
        """测试历史记录返回副本"""
        engine = DrawEngine(["A", "B", "C"])
        engine.count = 1
        engine.save_results = True
        engine.draw()
        history = engine.get_history()
        history.clear()
        assert len(engine.get_history()) == 1


class TestLoadConfig:
    """配置文件加载测试"""

    def test_load_config(self):
        """测试从配置文件加载"""
        import tempfile
        import json

        config = {
            "multi_count": 3,
            "allow_duplicate": True,
            "save_results": False
        }

        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False, encoding="utf-8") as f:
            json.dump(config, f)
            config_path = f.name

        engine = DrawEngine(["A", "B", "C"])
        engine.load_config(config_path)
        assert engine.count == 3
        assert engine.allow_duplicate is True
        assert engine.save_results is False

        os.unlink(config_path)

    def test_load_config_missing_file(self):
        """测试加载不存在的配置文件"""
        engine = DrawEngine(["A", "B", "C"])
        engine.load_config("/nonexistent/path/settings.json")
        # 应保持默认值
        assert engine.count == 1
        assert engine.allow_duplicate is False
        assert engine.save_results is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
    input("按 Enter 键退出...")