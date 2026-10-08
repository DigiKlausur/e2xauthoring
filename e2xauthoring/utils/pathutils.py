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


def resolve_path(base_path: str, path: str) -> str:
    """Resolve a path against a base path

    Args:
        base_path (str): The directory relative paths are resolved against
        path (str): An absolute path or a path relative to base_path
    Returns:
        str: The normalized absolute path
    """
    path = os.path.expanduser(path)
    if not os.path.isabs(path):
        path = os.path.join(os.path.expanduser(base_path), path)
    return os.path.abspath(path)
