import os
import re
import shutil
from abc import abstractmethod
from typing import List

from nbgrader.coursedir import CourseDirectory
from traitlets import Unicode
from traitlets.config import LoggingConfigurable

from ..dataclasses import ErrorMessage, SuccessMessage


class BaseManager(LoggingConfigurable):
    directory = Unicode(".", help="The directory of the items to manage")

    def __init__(self, coursedir: CourseDirectory) -> None:
        self.coursedir = coursedir
        self.__pattern = re.compile(r"^\w+[\w\s]*\w+$")

    @property
    def base_path(self):
        return self.coursedir.format_path(self.directory, ".", ".")

    def is_valid_name(self, name) -> bool:
        return self.__pattern.match(name) is not None

    def listdir(self, path: str) -> List[str]:
        return [
            directory for directory in os.listdir(path) if not directory.startswith(".")
        ]

    @abstractmethod
    def get(self, **kwargs) -> SuccessMessage | ErrorMessage:
        pass

    @abstractmethod
    def create(self, **kwargs) -> SuccessMessage | ErrorMessage:
        pass

    @abstractmethod
    def remove(self, **kwargs) -> SuccessMessage | ErrorMessage:
        pass

    @abstractmethod
    def list(self, **kwargs) -> SuccessMessage | ErrorMessage:
        pass

    def copy(self, old_name: str, new_name: str) -> SuccessMessage | ErrorMessage:
        src_path = os.path.join(self.base_path, old_name)
        dst_path = os.path.join(self.base_path, new_name)
        if not os.path.exists(src_path):
            return ErrorMessage(error="Source does not exist.")
        if os.path.exists(dst_path):
            return ErrorMessage(
                error="Destination already exists. Please delete first or choose a new name."
            )
        shutil.copytree(src_path, dst_path)
        return SuccessMessage()

    def rename(self, old_name: str, new_name: str) -> SuccessMessage | ErrorMessage:
        msg = self.copy(old_name, new_name)
        if not msg.success:
            return msg
        self.remove(old_name)
        return SuccessMessage()
