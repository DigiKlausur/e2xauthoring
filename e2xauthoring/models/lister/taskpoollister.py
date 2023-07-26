import os
from typing import List

from traitlets import Unicode

from ...utils.gitutils import is_version_controlled
from ..dataclasses import TaskPool
from .lister import Lister


class TaskPoolLister(Lister):
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

    def list_items(self, **kwargs) -> List[TaskPool]:
        return [
            TaskPool(
                name=pool_dir,
                n_tasks=self.__get_n_tasks(pool_dir),
                is_repo=is_version_controlled(os.path.join(self.base_path, pool_dir)),
            )
            for pool_dir in self.listdir(self.base_path)
        ]
