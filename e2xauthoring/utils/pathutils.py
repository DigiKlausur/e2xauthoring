import os


def is_parent_path(parent_path: str, child_path: str) -> bool:
    """Check if a path is a parent of another path

    Args:
        parent_path (str): The potential parent path
        child_path (str): The path to test
    Returns:
        bool: True if child_path is a sub directory of parent_path
    """
    parent_path = os.path.abspath(parent_path)
    child_path = os.path.abspath(child_path)
    return os.path.commonpath([parent_path]) == os.path.commonpath([parent_path, child_path])
