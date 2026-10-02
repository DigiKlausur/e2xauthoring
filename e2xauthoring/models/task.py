import os
import shutil
from typing import Optional

import nbformat
from e2xcore.utils.nbgrader_cells import (
    get_points,
    is_grade,
    is_nbgrader_cell,
    new_read_only_cell,
)
from jupyter_client.kernelspec import KernelSpecManager

from ..dataclasses import GitStatus, TaskRecord
from ..git import GitRepo, RepoStatus


def new_task_notebook(name: str, kernel_name: str = None) -> nbformat.notebooknode.NotebookNode:
    metadata = dict(nbassignment=dict(type="task"))
    if kernel_name is not None:
        kernel_spec = KernelSpecManager().get_kernel_spec(kernel_name)
        metadata["kernelspec"] = dict(
            name=kernel_name,
            display_name=kernel_spec.display_name,
            language=kernel_spec.language,
        )
    nb = nbformat.v4.new_notebook(metadata=metadata)
    cell = new_read_only_cell(
        grade_id=f"{name}_Header",
        source=(
            f"# {name}\n"
            "Here you should give a brief description of the task.\n"
            "Then add questions via the menu above.\n"
            "A task should be self contained and not rely on other tasks."
        ),
    )
    nb.cells.append(cell)
    return nb


class Task:
    name: str
    pool: str
    path: str
    base_path: str
    n_questions: int
    points: int
    last_modified: float
    repo: GitRepo

    def __init__(self, name: str, pool: str, base_path: str, repo: GitRepo):
        self.name = name
        self.pool = pool
        self.path = os.path.realpath(os.path.join(base_path, pool, name))
        self.base_path = base_path
        self.repo = repo
        self.last_modified = 0
        self.update_task_info()

    @staticmethod
    def create(name: str, pool: str, base_path: str, repo: GitRepo, kernel_name: str = None):
        task_path = os.path.join(base_path, pool, name)
        assert not os.path.exists(task_path), f"Task {name} already exists in pool {pool}"
        os.makedirs(os.path.join(task_path, "data"), exist_ok=True)
        os.makedirs(os.path.join(task_path, "img"), exist_ok=True)
        nb = new_task_notebook(name, kernel_name)
        nbformat.write(nb, os.path.join(task_path, f"{name}.ipynb"))
        return Task(name, pool, base_path, repo)

    def remove(self):
        task_path = self.path
        assert os.path.exists(task_path), f"Task {self.name} does not exist in pool {self.pool}"
        shutil.rmtree(task_path)

    def _rename_notebook(self, path: str, old_name: str, new_name: str):
        shutil.move(
            os.path.join(path, f"{old_name}.ipynb"),
            os.path.join(path, f"{new_name}.ipynb"),
        )
        notebook_path = os.path.join(path, f"{new_name}.ipynb")
        nb = nbformat.read(notebook_path, as_version=nbformat.NO_CONVERT)
        for cell in nb.cells:
            if is_nbgrader_cell(cell):
                cell.source = cell.source.replace(old_name, new_name)
                cell.metadata.nbgrader.grade_id = cell.metadata.nbgrader.grade_id.replace(
                    old_name, new_name
                )
        nbformat.write(nb, notebook_path)

    def copy(self, new_name: str):
        old_path = self.path
        new_path = os.path.join(os.path.dirname(old_path), new_name)
        assert not os.path.exists(new_path), f"Task {new_name} already exists"
        shutil.copytree(old_path, new_path)
        self._rename_notebook(new_path, self.name, new_name)
        return Task(new_name, self.pool, self.base_path, self.repo)

    def rename(self, new_name: str):
        old_path = self.path
        new_path = os.path.join(os.path.dirname(old_path), new_name)
        assert not os.path.exists(new_path), f"Task {new_name} already exists"
        shutil.move(old_path, new_path)
        self._rename_notebook(new_path, self.name, new_name)
        self.path = new_path
        self.name = new_name

    @property
    def notebook_file(self):
        return os.path.join(self.path, f"{self.name}.ipynb")

    @property
    def data_path(self):
        return os.path.join(self.path, "data")

    @property
    def image_path(self):
        return os.path.join(self.path, "img")

    @property
    def notebook_file_exists(self):
        return os.path.isfile(self.notebook_file)

    @property
    def is_dirty(self):
        if self.notebook_file_exists:
            return self.last_modified < os.path.getmtime(self.notebook_file)
        return False

    def update_task_info(self):
        if self.is_dirty:
            nb = nbformat.read(self.notebook_file, as_version=nbformat.NO_CONVERT)
            last_modified = os.path.getmtime(self.notebook_file)
            if self.last_modified < last_modified:
                points = [get_points(cell) for cell in nb.cells if is_grade(cell)]
                self.points = sum(points)
                self.n_questions = len(points)
                self.last_modified = last_modified

    def to_dataclass(
        self, include_git_status=False, repo_status: Optional[RepoStatus] = None
    ) -> TaskRecord:
        """
        Args:
            include_git_status (bool, optional): Whether to include the lists of changed files.
                Defaults to False.
            repo_status (RepoStatus, optional): The status of the repository, if already
                fetched for this request. Fetched from git if not given. Defaults to None.
        """
        if self.is_dirty:
            self.update_task_info()
        if repo_status is None:
            repo_status = self.repo.status()
        status = repo_status.for_path(self.path)
        if not include_git_status:
            status = GitStatus(status=status.status)
        return TaskRecord(
            name=self.name,
            pool=self.pool,
            points=self.points,
            n_questions=self.n_questions,
            git_status=status,
        )

    def to_json(self, include_git_status=False):
        return self.to_dataclass(include_git_status).to_json()
