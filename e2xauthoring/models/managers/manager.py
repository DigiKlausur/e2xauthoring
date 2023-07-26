import os
import re
from abc import abstractmethod
from typing import List

from nbgrader.coursedir import CourseDirectory
from traitlets import Unicode
from traitlets.config import LoggingConfigurable


class BaseManager(LoggingConfigurable):
    directory = Unicode(".", help="The directory of the items to manage")

    def __init__(self, coursedir: CourseDirectory) -> None:
        self.coursedir = coursedir
        self.__pattern = re.compile(r"^\w+[\w\s]*\w+$")

    @property
    def base_path(self):
        return self.coursedir.format_path(self.directory, ".", ".")

    def is_valid_name(self, name):
        return self.__pattern.match(name) is not None

    def listdir(self, path: str) -> List[str]:
        return [
            directory for directory in os.listdir(path) if not directory.startswith(".")
        ]

    @abstractmethod
    def create(self, **kwargs):
        pass

    @abstractmethod
    def remove(self, **kwargs):
        pass

    @abstractmethod
    def list(self, **kwargs):
        pass
