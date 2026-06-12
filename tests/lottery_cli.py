"""
终端抽签测试程序
交互式测试 DrawEngine 的各种功能
"""

import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dist.engine.draw import DrawEngine


def print_header(text: str):
    """打印标题"""
    print("\n" + "=" * 50)
    print(f"  {text}")
    print("=" * 50)


def print_result(label: str, value):
    """打印结果"""
    print(f"\n{label}:")
    print(f"  {value}")


def main():
    print_header("WOTA 抽签系统 - 终端测试")

    # 初始化数据
    default_data = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"]
    print(f"\n默认数据: {default_data}")
    print(f"共 {len(default_data)} 人")

    engine = DrawEngine(default_data)

    while True:
        print_header("功能菜单")
        print("""
  1. 单人抽签
  2. 双人抽签（不重复）
  3. 双人抽签（可重复）
  4. 自定义抽签
  5. 淘汰模式
  6. 查看当前状态
  7. 重新加载数据
  8. 运行单元测试
  0. 退出程序
        """)

        choice = input("请选择功能 (0-8): ").strip()

        if choice == "1":
            print_header("单人抽签")
            result = engine.draw_single()
            print_result("中奖者", result)

        elif choice == "2":
            print_header("双人抽签（不重复）")
            winners = engine.draw_multi(2, allow_duplicate=False)
            print_result("中奖者", winners)
            check = "[OK]" if len(set(winners)) == len(winners) else "[FAIL]"
            print(f"\n去重验证: {check}")

        elif choice == "3":
            print_header("双人抽签（可重复）")
            winners = engine.draw_multi(2, allow_duplicate=True)
            print_result("中奖者", winners)
            same = winners[0] == winners[1] if len(winners) == 2 else False
            status = "[SAME]" if same else "[DIFFERENT]"
            print(f"结果: {status}")

        elif choice == "4":
            print_header("自定义抽签")
            try:
                count = int(input("请输入抽取人数: "))
                dup_input = input("是否允许重复 (y/n): ").strip().lower()
                allow_dup = dup_input == 'y'

                winners = engine.draw_multi(count, allow_duplicate=allow_dup)
                print_result("中奖者", winners)
                print(f"\n抽取人数: {len(winners)}")
            except ValueError:
                print("输入无效")

        elif choice == "5":
            print_header("淘汰模式")
            order = engine.draw_elimination()
            print_result("淘汰顺序", order)
            print(f"\n冠军: {order[-1]}")

            # 显示淘汰过程
            print("\n淘汰过程:")
            for i, person in enumerate(order[:-1], 1):
                print(f"  第{i}轮淘汰: {person}")
            print(f"  冠军: {order[-1]}")

        elif choice == "6":
            print_header("当前状态")
            print(f"原始数据: {engine.get_original_count()} 人")
            print(f"剩余数据: {engine.get_remaining_count()} 人")
            print(f"淘汰模式剩余: {engine.get_elimination_count()} 人")

        elif choice == "7":
            print_header("重新加载数据")
            names = input("输入新数据（用逗号分隔）: ").strip()
            if names:
                new_data = [n.strip() for n in names.split(",") if n.strip()]
                engine.reload(new_data)
                print(f"已加载 {len(new_data)} 条数据: {new_data}")
            else:
                engine.reload(default_data)
                print(f"已重置为默认数据: {default_data}")

        elif choice == "8":
            print_header("运行单元测试")
            import subprocess
            result = subprocess.run(
                ["python", "-m", "pytest", "tests/test_draw.py", "-v", "--tb=short"],
                capture_output=False
            )
            if result.returncode == 0:
                print("\n所有测试通过!")
            else:
                print("\n有测试失败!")

        elif choice == "0":
            print_header("退出")
            print("感谢使用!")
            break

        else:
            print("无效选择，请重新输入")

        input("\n按 Enter 键继续...")


if __name__ == "__main__":
    main()