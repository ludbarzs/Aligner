import os


def is_code_line(line: str) -> bool:
    """Check if code line is not empty, not comment not an import)"""
    line = line.strip()
    if not line:
        return False
    if line.startswith("#"):
        return False
    if line.startswith(("import", "from")):
        return False
    return True


def count_lines_in_file(file_path: str) -> int:
    with open(file_path, "r") as f:
        return sum(1 for line in f if is_code_line(line))


def count_lines_in_dir(project_path: str) -> int:
    total_lines = 0
    for root, _, files in os.walk(project_path):
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                total_lines += count_lines_in_file(file_path)
    return total_lines


# Checks if script is run directly, not from a module
if __name__ == "__main__":
    project_path = os.getcwd()
    total_lines = count_lines_in_dir(project_path)
    print(f"Total lines in project: {total_lines}")
