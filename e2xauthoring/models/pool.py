import os
import shutil
from typing import Dict, Optional, Set

from git import Actor

from ..dataclasses import PoolRecord
from ..git import GitRepo, RepoStatus, get_author
from .task import Task


class Pool:
    name: str
    base_path: str
    path: str
    repo: GitRepo
    tasks: Dict[str, Task]

    def __init__(self, name: str, base_path: str):
        self.name = name
        self.base_path = base_path
        self.path = os.path.realpath(os.path.join(base_path, name))
        self.repo = GitRepo(self.path)
        self.tasks = self.init_tasks()

    def __getitem__(self, key):
        return self.tasks[key]

    def __contains__(self, key):
        return key in self.tasks

    @staticmethod
    def create(name: str, base_path: str, init_repo: bool = False):
        pool_path = os.path.join(base_path, name)
        assert not os.path.exists(pool_path), f"Pool {name} already exists"
        os.makedirs(pool_path, exist_ok=True)
        pool = Pool(name=name, base_path=base_path)
        if init_repo:
            pool.turn_into_repository()
        return pool

    def remove(self):
        assert os.path.exists(self.path), f"Pool {self.name} does not exist"
        shutil.rmtree(self.path)

    def copy(self, new_name: str):
        src_path = self.path
        dst_path = os.path.join(self.base_path, new_name)
        assert not os.path.exists(dst_path), f"Pool {new_name} already exists"
        # Exclude the .git directory
        shutil.copytree(src_path, dst_path, ignore=shutil.ignore_patterns(".git"))
        return Pool(name=new_name, base_path=self.base_path)

    def rename(self, new_name: str):
        new_path = os.path.join(self.base_path, new_name)
        assert not os.path.exists(new_path), f"Pool {new_name} already exists"
        os.rename(self.path, new_path)
        self.name = new_name
        self.path = os.path.realpath(new_path)
        self.repo = GitRepo(self.path)
        # The tasks store their pool name and path, so recreate them
        self.tasks = self.init_tasks()

    def turn_into_repository(self):
        self.repo.initialize_repo(exist_ok=True, author=Actor(**get_author()))

    def is_version_controlled(self) -> bool:
        return self.repo.is_version_controlled

    def find_task_names(self) -> Set[str]:
        """Find all tasks in the pool.

        A task is a directory containing a notebook with the same name.
        This lists the pool directory once and checks each candidate with a
        single stat, which is much cheaper on NFS than listing every task
        directory.
        """
        try:
            entries = list(os.scandir(self.path))
        except FileNotFoundError:
            return set()
        return {
            entry.name
            for entry in entries
            if not entry.name.startswith(".")
            and entry.is_dir()
            and os.path.isfile(os.path.join(entry.path, f"{entry.name}.ipynb"))
        }

    def init_tasks(self):
        return {
            task_name: Task(
                name=task_name,
                pool=self.name,
                base_path=self.base_path,
                repo=self.repo,
            )
            for task_name in self.find_task_names()
        }

    def update_tasks(self):
        task_names = self.find_task_names()
        existing_names = set(self.tasks.keys())
        deleted = existing_names - task_names
        added = task_names - existing_names
        for deleted_task in deleted:
            del self.tasks[deleted_task]
        for added_task in added:
            self.tasks[added_task] = Task(
                name=added_task,
                pool=self.name,
                base_path=self.base_path,
                repo=self.repo,
            )

    def add_task(self, name: str, kernel_name: str = None):
        task_path = os.path.join(self.path, name)
        assert not os.path.exists(task_path), f"Task {name} already exists in pool {self.name}"
        task = Task.create(
            name=name,
            pool=self.name,
            base_path=self.base_path,
            repo=self.repo,
            kernel_name=kernel_name,
        )
        self.tasks[name] = task

    def remove_task(self, name: str):
        assert name in self.tasks, f"Task {name} does not exist in pool {self.name}"
        task = self.tasks.get(name)
        task.remove()
        del self.tasks[name]

    def copy_task(self, name: str, new_name: str):
        assert name in self.tasks, f"Task {name} does not exist in pool {self.name}"
        task = self.tasks.get(name)
        new_task = task.copy(new_name)
        self.tasks[new_name] = new_task

    def rename_task(self, name: str, new_name: str):
        assert name in self.tasks, f"Task {name} does not exist in pool {self.name}"
        task = self.tasks.get(name)
        task.rename(new_name)
        self.tasks[new_name] = task
        del self.tasks[name]

    def commit_task(self, task_name: str, message: str):
        assert task_name in self.tasks, f"No task with the name {task_name} exists."
        assert self.repo.is_version_controlled, f"Pool {self.name} is not version controlled."
        task = self.tasks[task_name]
        return self.repo.commit(task.path, add_if_untracked=True, message=message)

    def to_dataclass(
        self, include_git_status=False, status_cache: Optional[Dict[str, RepoStatus]] = None
    ) -> PoolRecord:
        """
        Args:
            include_git_status (bool, optional): Whether to include the lists of changed files.
                Defaults to False.
            status_cache (Dict[str, RepoStatus], optional): Repository statuses already fetched
                for this request, keyed by repository root. Defaults to None.
        """
        self.update_tasks()
        repo_status = self.repo.status(cache=status_cache)
        if include_git_status:
            repo_status = repo_status.expand_untracked(self.path)
        tasks = [
            task.to_dataclass(include_git_status=include_git_status, repo_status=repo_status)
            for task in self.tasks.values()
        ]
        return PoolRecord(
            name=self.name,
            base_path=self.base_path,
            tasks=tasks,
            n_tasks=len(tasks),
            is_repo=repo_status.is_version_controlled,
        )

    def to_json(self, include_git_status=False):
        return self.to_dataclass(include_git_status=include_git_status).to_json()
