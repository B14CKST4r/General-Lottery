"""
终端抽签测试程序
配置驱动版 - 通过 count/allow_duplicate/save_results 控制抽签行为
"""

import json
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dist.engine.draw import DrawEngine, PRESET_SINGLE, PRESET_DOUBLE


def print_header(text: str):
    """打印标题"""
    print("\n" + "=" * 50)
    print(f"  {text}")
    print("=" * 50)


def print_result(label: str, value):
    """打印结果"""
    print(f"\n{label}:")
    print(f"  {value}")


def print_config(engine: DrawEngine):
    """打印当前配置"""
    print(f"\n  抽签人数: {engine.count}")
    print(f"  允许重复: {'是' if engine.allow_duplicate else '否'}")
    print(f"  保存结果: {'是' if engine.save_results else '否'}")


def save_config_to_file(config: dict, config_dir: str = None) -> str:
    """保存配置到文件，返回文件路径"""
    if config_dir is None:
        config_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "dist", "config"
        )
    os.makedirs(config_dir, exist_ok=True)

    # 按序号命名
    existing = [f for f in os.listdir(config_dir) if f.startswith("draw_config_") and f.endswith(".json")]
    next_num = len(existing) + 1
    filename = f"draw_config_{next_num}.json"
    filepath = os.path.join(config_dir, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

    return filepath


def load_saved_configs(config_dir: str = None) -> list[dict]:
    """加载所有已保存的配置"""
    if config_dir is None:
        config_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "dist", "config"
        )
    configs = []
    if not os.path.exists(config_dir):
        return configs

    for filename in sorted(os.listdir(config_dir)):
        if filename.startswith("draw_config_") and filename.endswith(".json"):
            filepath = os.path.join(config_dir, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                config = json.load(f)
                config["_file"] = filepath
                config["_name"] = filename
                configs.append(config)
    return configs


def main():
    print_header("WOTA 抽签系统 - 终端测试")

    # 初始化数据
    default_data = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"]
    print(f"\n默认数据: {default_data}")
    print(f"共 {len(default_data)} 人")

    engine = DrawEngine(default_data)

    while True:
        print_header("功能菜单")
        print_config(engine)
        print("""
  1. 抽签
  2. 修改配置
  3. 查看抽签记录
  4. 重新加载数据
  5. 进行单元测试
  6. 保存当前配置
  0. 退出程序
        """)

        choice = input("请选择功能 (0-6): ").strip()

        if choice == "1":
            print_header("抽签")
            result = engine.draw()
            if result is None:
                print("\n  数据为空，无法抽签")
            elif isinstance(result, list):
                print_result("中奖者", result)
                print(f"\n  抽取人数: {len(result)}")
            else:
                print_result("中奖者", result)

        elif choice == "2":
            print_header("修改配置")
            print_config(engine)
            print("\n  预设配置:")
            print("    a. 单人 (1人, 不重复, 保存)")
            print("    b. 双人 (2人, 不重复, 保存)")
            print("    c. 自定义")
            print("    d. 加载已保存配置")

            sub = input("\n请选择 (a/b/c/d): ").strip().lower()

            if sub == 'a':
                engine.apply_preset(PRESET_SINGLE)
                print("\n已应用单人预设")
                print_config(engine)

            elif sub == 'b':
                engine.apply_preset(PRESET_DOUBLE)
                print("\n已应用双人预设")
                print_config(engine)

            elif sub == 'c':
                try:
                    count = int(input(f"抽签人数 (当前: {engine.count}): "))
                    dup_input = input(f"允许重复 (当前: {'是' if engine.allow_duplicate else '否'}, y/n): ").strip().lower()
                    save_input = input(f"保存结果 (当前: {'是' if engine.save_results else '否'}, y/n): ").strip().lower()

                    engine.count = count
                    engine.allow_duplicate = (dup_input == 'y')
                    engine.save_results = (save_input != 'n')
                    print("\n配置已更新")
                    print_config(engine)
                except ValueError:
                    print("输入无效")

            elif sub == 'd':
                saved_configs = load_saved_configs()
                if not saved_configs:
                    print("\n  暂无已保存的配置")
                else:
                    print("\n  已保存的配置:")
                    for i, cfg in enumerate(saved_configs, 1):
                        name = cfg.get("_name", "")
                        print(f"    {i}. {name} - 人数:{cfg.get('count', '?')} 重复:{'是' if cfg.get('allow_duplicate') else '否'} 保存:{'是' if cfg.get('save_results') else '否'}")

                    try:
                        idx = int(input("\n请选择配置编号: "))
                        if 1 <= idx <= len(saved_configs):
                            cfg = saved_configs[idx - 1]
                            engine.count = cfg.get("count", 1)
                            engine.allow_duplicate = cfg.get("allow_duplicate", False)
                            engine.save_results = cfg.get("save_results", True)
                            print("\n已加载配置")
                            print_config(engine)
                        else:
                            print("编号无效")
                    except ValueError:
                        print("输入无效")
            else:
                print("无效选择")

        elif choice == "3":
            print_header("抽签记录")
            history = engine.get_history()
            if not history:
                print("\n  暂无抽签记录")
            else:
                print(f"\n  共 {len(history)} 条记录:")
                for i, name in enumerate(history, 1):
                    print(f"    {i}. {name}")
            print(f"\n  输入 c 清空记录，其他键返回")
            action = input().strip().lower()
            if action == 'c':
                engine.clear_history()
                print("  记录已清空")

        elif choice == "4":
            print_header("重新加载数据")
            names = input("输入新数据（用逗号分隔，留空重置默认）: ").strip()
            if names:
                new_data = [n.strip() for n in names.split(",") if n.strip()]
                engine.reload(new_data)
                engine.clear_history()
                print(f"已加载 {len(new_data)} 条数据: {new_data}")
            else:
                engine.reload(default_data)
                engine.clear_history()
                print(f"已重置为默认数据: {default_data}")

        elif choice == "5":
            print_header("进行单元测试")
            import subprocess
            result = subprocess.run(
                ["python", "-m", "pytest", "tests/test_draw.py", "tests/test_draw_scenarios.py", "-v", "--tb=short"],
                capture_output=False
            )
            if result.returncode == 0:
                print("\n所有测试通过!")
            else:
                print("\n有测试失败!")

        elif choice == "6":
            print_header("保存当前配置")
            print_config(engine)
            print(f"\n  将保存以下配置为新的抽签配置文件:")
            print(f"    抽签人数: {engine.count}")
            print(f"    允许重复: {'是' if engine.allow_duplicate else '否'}")
            print(f"    保存结果: {'是' if engine.save_results else '否'}")

            confirm = input("\n确认保存? (y/n): ").strip().lower()
            if confirm == 'y':
                config = {
                    "count": engine.count,
                    "allow_duplicate": engine.allow_duplicate,
                    "save_results": engine.save_results
                }
                filepath = save_config_to_file(config)
                print(f"\n  配置已保存到: {filepath}")

                # 使用保存的配置进行抽签
                print("\n使用此配置进行抽签:")
                result = engine.draw()
                if result is None:
                    print("  数据为空，无法抽签")
                elif isinstance(result, list):
                    print_result("中奖者", result)
                else:
                    print_result("中奖者", result)
            else:
                print("  已取消")

        elif choice == "0":
            print_header("退出")
            print("感谢使用!")
            break

        else:
            print("无效选择，请重新输入")

        input("\n按 Enter 键继续...")


if __name__ == "__main__":
    main()