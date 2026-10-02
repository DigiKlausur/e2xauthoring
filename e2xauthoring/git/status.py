import os
import subprocess
from dataclasses import dataclass, replace
from typing import Iterable, List, Optional, Tuple

from ..dataclasses import GitStatus

# The untracked cache lets git skip directories whose mtime has not changed.
# It is stored in the index, so passing it per call is enough and leaves the
# repository config untouched. -unormal matches a plain `git status`, which
# keeps the cache valid when users also run git in a terminal.
STATUS_COMMAND = (
    "git",
    "-c",
    "core.untrackedCache=true",
    "status",
    "--porcelain=v2",
    "-z",
    "-unormal",
)


class GitStatusError(RuntimeError):
    pass


def find_repo_root(path: str) -> Optional[str]:
    """Find the root of the Git repository containing a path.

    Walks up the directory tree looking for a .git entry. This only needs a
    few stat calls, so it is cheap enough to run on every request and picks up
    repositories created or removed outside of the app.

    Args:
        path (str): The path to start from

    Returns:
        Optional[str]: The repository root, or None if the path is not version controlled
    """
    current = os.path.realpath(path)
    while True:
        if os.path.exists(os.path.join(current, ".git")):
            return current
        parent = os.path.dirname(current)
        if parent == current:
            return None
        current = parent


@dataclass(frozen=True)
class RepoStatus:
    """A snapshot of the status of a whole repository.

    Paths are relative to the repository root and use forward slashes.
    A root of None means the path is not version controlled.
    New directories are listed as a single "dir/" entry in untracked
    until they are expanded with expand_untracked.
    """

    root: Optional[str] = None
    staged: Tuple[str, ...] = ()
    unstaged: Tuple[str, ...] = ()
    untracked: Tuple[str, ...] = ()

    @property
    def is_version_controlled(self) -> bool:
        return self.root is not None

    def _prefix(self, path: str) -> str:
        # No realpath here: it costs an lstat per path component, which adds up
        # on NFS. Pool and task paths are already resolved.
        relpath = os.path.relpath(path, start=self.root)
        return "" if relpath == "." else relpath.replace(os.sep, "/") + "/"

    def _untracked_dirs(self, prefix: str) -> List[str]:
        # Untracked directories below the prefix or containing it
        return [
            f
            for f in self.untracked
            if f.endswith("/") and (f.startswith(prefix) or prefix.startswith(f))
        ]

    def expand_untracked(self, path: str) -> "RepoStatus":
        """List the files of the untracked directories that touch a path.

        Only the directories below or containing the path are expanded, so
        callers pay for the extra git call only where they need file lists.

        Args:
            path (str): An absolute, resolved path inside the repository

        Returns:
            RepoStatus: A status with those directories replaced by their files
        """
        if not self.is_version_controlled:
            return self
        dirs = self._untracked_dirs(self._prefix(path))
        if not dirs:
            return self
        files = [f for f in self.untracked if f not in dirs]
        output = _run_git(
            self.root, ["git", "ls-files", "-z", "--others", "--exclude-standard", "--", *dirs]
        )
        files.extend(os.fsdecode(f) for f in output.split(b"\0") if f)
        return replace(self, untracked=tuple(files))

    def for_path(self, path: str) -> GitStatus:
        """Get the status of all files below a path.

        Untracked directories are only listed as files after expand_untracked.

        Args:
            path (str): An absolute, resolved path inside the repository

        Returns:
            GitStatus: The status with file paths relative to the given path
        """
        if not self.is_version_controlled:
            return GitStatus(status="not version controlled")
        prefix = self._prefix(path)

        def below(files: Iterable[str]) -> List[str]:
            return [f[len(prefix) :] for f in files if f.startswith(prefix)]

        staged = below(self.staged)
        unstaged = below(self.unstaged)
        untracked = below(self.untracked)
        # The path may lie inside an untracked directory, e.g. a task in a new pool
        inside_untracked = any(prefix.startswith(f) for f in self._untracked_dirs(prefix))
        changed = inside_untracked or len(staged) + len(unstaged) + len(untracked) > 0
        return GitStatus(
            status="modified" if changed else "unchanged",
            staged=staged,
            unstaged=unstaged,
            untracked=untracked,
        )


def parse_porcelain_v2(output: bytes) -> Tuple[List[str], List[str], List[str]]:
    """Parse the output of `git status --porcelain=v2 -z`.

    Args:
        output (bytes): The raw output of git status

    Returns:
        Tuple[List[str], List[str], List[str]]: The staged, unstaged and untracked paths
    """
    staged, unstaged, untracked = [], [], []
    entries = iter(output.split(b"\0"))
    for entry in entries:
        if not entry:
            continue
        kind = entry[:1]
        if kind == b"1":
            # 1 XY sub mH mI mW hH hI path
            fields = entry.split(b" ", 8)
        elif kind == b"2":
            # 2 XY sub mH mI mW hH hI Xscore path, followed by the original path
            fields = entry.split(b" ", 9)
            next(entries, None)
        elif kind == b"u":
            # u XY sub m1 m2 m3 mW h1 h2 h3 path, an unmerged path
            fields = entry.split(b" ", 10)
        elif kind == b"?":
            untracked.append(os.fsdecode(entry[2:]))
            continue
        else:
            continue
        xy = fields[1]
        path = os.fsdecode(fields[-1])
        if kind == b"u":
            unstaged.append(path)
            continue
        if xy[:1] != b".":
            staged.append(path)
        if xy[1:2] != b".":
            unstaged.append(path)
    return staged, unstaged, untracked


def _run_git(root: str, args: Iterable[str]) -> bytes:
    result = subprocess.run(list(args), cwd=root, capture_output=True)
    if result.returncode != 0:
        raise GitStatusError(
            f"git failed in {root}: {result.stderr.decode(errors='replace').strip()}"
        )
    return result.stdout


def get_repo_status(root: str) -> RepoStatus:
    """Get the status of a whole repository with a single git status call.

    Args:
        root (str): The root of the repository

    Returns:
        RepoStatus: The status of the repository
    """
    staged, unstaged, untracked = parse_porcelain_v2(_run_git(root, STATUS_COMMAND))
    return RepoStatus(
        root=root,
        staged=tuple(staged),
        unstaged=tuple(unstaged),
        untracked=tuple(untracked),
    )
