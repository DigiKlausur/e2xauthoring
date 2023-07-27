import os
import shutil

from traitlets import Unicode

from ...utils.gitutils import create_repository, is_version_controlled
from ..dataclasses import ErrorMessage, SuccessMessage, TaskPool
from .manager import BaseManager


class TaskPoolManager(BaseManager):
    directory = Unicode(
        "pools", help="The relative directory where the pools are stored"
    )

    def __get_n_tasks(self, name) -> int:
        return len(
            [
                d
                for d in os.listdir(os.path.join(self.base_path, name))
                if not d.startswith(".")
            ]
        )

    def turn_into_repository(self, pool) -> SuccessMessage | ErrorMessage:
        path = os.path.join(self.base_path(), pool)
        if not os.path.exists(path) or not os.path.isdir(path):
            return ErrorMessage(
                error=f"The pool {pool} does not exist or is not a directory.",
            )
        repo = create_repository(path)
        if repo is not None:
            return SuccessMessage()
        return ErrorMessage(
            error=f"There was an issue turning the pool {pool} into a repository!"
        )

    def get(self, name: str) -> SuccessMessage | ErrorMessage:
        path = os.path.join(self.base_path, name)
        if not os.path.exists(path):
            return ErrorMessage(error=f"A pool with the name {name} does not exists!")
        return SuccessMessage(
            data=TaskPool(
                name=name,
                n_tasks=self.__get_n_tasks(name),
                is_repo=is_version_controlled(path),
            )
        )

    def create(
        self, name: str, init_repository: bool = False
    ) -> SuccessMessage | ErrorMessage:
        if not self.is_valid_name(name):
            return ErrorMessage(error="The name is invalid!")
        path = os.path.join(self.base_path, name)
        if os.path.exists(path):
            return ErrorMessage(error=f"A pool with the name {name} already exists!")
        os.makedirs(path, exist_ok=True)
        if init_repository:
            return self.turn_into_repository(name)
        return SuccessMessage()

    def remove(self, name) -> SuccessMessage | ErrorMessage:
        path = os.path.join(self.base_path, name)
        if not os.path.exists(path):
            return ErrorMessage(error="The task pool does not exist")
        shutil.rmtree(path)
        return SuccessMessage()

    def list(self) -> SuccessMessage | ErrorMessage:
        if not os.path.exists(self.base_path):
            return ErrorMessage(error="Pool directory does not exist.")
        return SuccessMessage(
            data=[
                TaskPool(
                    name=pool_dir,
                    n_tasks=self.__get_n_tasks(pool_dir),
                    is_repo=is_version_controlled(
                        os.path.join(self.base_path, pool_dir)
                    ),
                )
                for pool_dir in self.listdir(self.base_path)
            ]
        )
