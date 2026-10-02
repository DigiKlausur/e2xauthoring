import os
import shutil
from typing import Dict, Optional

from git import Actor, Git, GitCommandError

from ..dataclasses import GitStatus
from .status import RepoStatus, find_repo_root, get_repo_status

GITIGNORE = ".gitignore"


class GitRepo:
    """Git operations for a directory that may or may not be version controlled.

    The object holds no repository state. The repository root is looked up on
    every access, so changes made outside of the app (e.g. `git init` or
    `rm -rf .git` in a terminal) are picked up right away.
    """

    def __init__(self, path: str):
        self.path = os.path.realpath(path)

    @property
    def repo_root(self) -> Optional[str]:
        return find_repo_root(self.path)

    @property
    def is_version_controlled(self) -> bool:
        return self.repo_root is not None

    def status(self, cache: Optional[Dict[str, RepoStatus]] = None) -> RepoStatus:
        """Get the current status of the repository containing this path.

        Args:
            cache (Dict[str, RepoStatus], optional): Statuses already fetched during the
                current request, keyed by repository root. Pools that share a repository
                then share a single git call. Defaults to None.

        Returns:
            RepoStatus: The status of the repository, with a root of None if the path
                is not version controlled
        """
        root = self.repo_root
        if root is None:
            return RepoStatus()
        if cache is None:
            return get_repo_status(root)
        if root not in cache:
            cache[root] = get_repo_status(root)
        return cache[root]

    def get_status_of_path(self, path: str) -> GitStatus:
        """
        Returns the GitStatus of the specified path.

        Args:
            path (str): The path to check the status of.

        Returns:
            GitStatus: The GitStatus object containing the status of the path.
        """
        return self.status().for_path(path)

    def _copy_gitignore(self):
        here = os.path.dirname(__file__)
        shutil.copy(
            os.path.join(here, "..", "assets", GITIGNORE),
            os.path.join(self.path, GITIGNORE),
        )

    def initialize_repo(self, exist_ok: bool = True, author: Optional[Actor] = None):
        """
        Initializes a Git repository.
        """
        root = self.repo_root
        if not exist_ok and root is not None:
            raise ValueError(f"A repository already exists at {root}")
        self._copy_gitignore()
        if root is None:
            Git(self.path).init()
        self.commit(
            path=os.path.join(self.path, GITIGNORE),
            message="Add .gitignore",
            add_if_untracked=True,
            author=author,
        )

    def add(self, path: str) -> bool:
        """
        Adds a file to the repository.

        Args:
            path (str): The path of the file to be added.

        Returns:
            bool: True if the file was added, False otherwise.
        """
        root = self.repo_root
        if root is None:
            return False
        Git(root).add(os.path.relpath(os.path.abspath(path), start=root))
        return True

    def commit(
        self,
        path: str,
        add_if_untracked=False,
        message: Optional[str] = None,
        author: Optional[Actor] = None,
    ) -> bool:
        """
        Commits changes to the repository.

        Args:
            path (str): The path of the file to be committed.
            add_if_untracked (bool, optional): Whether to add the file if it is untracked.
                Defaults to False.
            message (str, optional): The commit message. If not provided, a default message will be
                used. Defaults to None.
            author (Actor, optional): The author of the commit. Defaults to None.

        Returns:
            bool: True if the commit was successful, False otherwise.
        """
        root = self.repo_root
        if root is None:
            return False
        relpath = os.path.relpath(os.path.abspath(path), start=root)
        author_string = f"{author.name} <{author.email}>" if author is not None else None
        try:
            if add_if_untracked:
                self.add(path)
            if message is None:
                message = f"Update {relpath}"
            Git(root).commit(relpath, message=message, author=author_string)
        except GitCommandError:
            return False
        return True

    def diff(self, file_path: str, color: bool = True, html=True) -> str:
        """
        Generate a diff for the specified file.

        Args:
            file_path (str): The path of the file to generate the diff for.
            color (bool, optional): Whether to include color in the diff. Defaults to True.
            html (bool, optional): Whether to format the diff as HTML. Defaults to True.

        Returns:
            str: The generated diff.
        """
        root = self.repo_root
        if root is None:
            return ""
        diff = Git(root).diff(os.path.relpath(file_path, start=root), color=color)
        if html:
            diff.replace("\n", "<br/>")
        return diff
