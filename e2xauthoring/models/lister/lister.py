import os
from abc import abstractmethod
from typing import List

from nbgrader.coursedir import CourseDirectory
from traitlets import Unicode
from traitlets.config import LoggingConfigurable


class Lister(LoggingConfigurable):
    directory = Unicode(".", help="The directory of the items to list")

    def __init__(self, coursedir: CourseDirectory) -> None:
        self.coursedir = coursedir

    @property
    def base_path(self):
        return self.coursedir.format_path(self.directory, ".", ".")

    def listdir(self, path: str) -> List[str]:
        return [
            directory for directory in os.listdir(path) if not directory.startswith(".")
        ]

    @abstractmethod
    def list_items(self, **kwargs):
        pass
