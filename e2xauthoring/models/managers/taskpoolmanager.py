import os
import shutil
from typing import List

from traitlets import Unicode

from ...utils.gitutils import create_repository, is_version_controlled
from ..dataclasses import TaskPool
from ..dataclasses.message import ErrorMessage, SuccessMessage
from .manager import BaseManager


class TaskPoolManager(BaseManager):
    directory = Unicode(
        "pools", help="The relative directory where the pools are stored"
    )

    def __get_n_tasks(self, name):
        return len(
            [
                d
                for d in os.listdir(os.path.join(self.base_path, name))
                if not d.startswith(".")
            ]
        )

    def turn_into_repository(self, pool):
        path = os.path.join(self.base_path(), pool)
        if not os.path.exists(path) or not os.path.isdir(path):
            return dict(
                status="error",
                error=f"The pool {pool} does not exist or is not a directory.",
            )
        repo = create_repository(path)
        if repo is not None:
            return SuccessMessage()
        return ErrorMessage(
            error=f"There was an issue turning the pool {pool} into a repository!"
        )

    def create(self, name: str, init_repository: bool = False):
        if not self.is_valid_name(name):
            return ErrorMessage(error="The name is invalid!")
        path = os.path.join(self.base_path, name)
        if os.path.exists(path):
            return ErrorMessage(error=f"A pool with the name {name} already exists!")
        os.makedirs(path, exist_ok=True)
        if init_repository:
            return self.turn_into_repository(name)
        return SuccessMessage()

    def remove(self, name):
        shutil.rmtree(os.path.join(self.base_path, name))

    def list(self) -> List[TaskPool]:
        return [
            TaskPool(
                name=pool_dir,
                n_tasks=self.__get_n_tasks(pool_dir),
                is_repo=is_version_controlled(os.path.join(self.base_path, pool_dir)),
            )
            for pool_dir in self.listdir(self.base_path)
        ]
