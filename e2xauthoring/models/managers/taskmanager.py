import os
import shutil
from typing import List

import nbformat
from e2xcore.utils.nbgrader_cells import new_read_only_cell
from nbformat.v4 import new_notebook
from traitlets import Unicode

from ...utils.gitutils import commit_path, vcs_status
from ..dataclasses import Task
from ..dataclasses.message import ErrorMessage, SuccessMessage
from .manager import BaseManager


class TaskManager(BaseManager):
    directory = Unicode(
        "pools", help="The relative directory where the pools are stored"
    )

    def __get_task_info(self, task, pool):
        base_path = os.path.join(self.base_path(), pool)
        notebooks = [
            file
            for file in os.listdir(os.path.join(base_path, task))
            if file.endswith(".ipynb")
        ]

        points = 0
        questions = 0

        for notebook in notebooks:
            nb = nbformat.read(os.path.join(base_path, task, notebook), as_version=4)
            for cell in nb.cells:
                if "nbgrader" in cell.metadata and cell.metadata.nbgrader.grade:
                    points += cell.metadata.nbgrader.points
                    questions += 1
        return points, questions

    def commit(self, pool, task, message):
        path = os.path.join(self.base_path(), pool, task)
        git_status = self.git_status(pool, task)
        if git_status["repo"] is None:
            return dict(success=False, error="Not part of a git repository")
        elif git_status["status"] == "unchanged":
            return dict(
                success=True, message="No files have been changed. Nothing to commit"
            )

        commit_okay = commit_path(
            git_status["repo"], path, add_if_untracked=True, message=message
        )
        return dict(success=commit_okay)

    def git_status(self, pool, task):
        path = os.path.join(self.base_path(), pool, task)
        git_status = vcs_status(path, relative=True)
        if git_status["repo"] is None:
            return dict(status="not version controlled")
        changed_files = (
            git_status["untracked"] + git_status["unstaged"] + git_status["staged"]
        )
        git_status["status"] = "modified" if len(changed_files) > 0 else "unchanged"
        return git_status

    def git_diff(self, pool, task, file):
        path = os.path.join(self.base_path(), pool, task, file)
        git_status = vcs_status(path)
        if git_status["repo"] is None:
            return dict(path=path, diff="Not version controlled or not added")
        else:
            relpath = os.path.relpath(path, start=git_status["repo"].working_tree_dir)
            return dict(
                path=path,
                diff=git_status["repo"]
                .git.diff(relpath, color=True)
                .replace("\n", "<br/>"),
            )

    def create(self, pool: str, name: str):
        if not self.is_valid_name(name):
            return ErrorMessage(error="The name is invalid!")
        path = os.path.join(self.base_path, pool, name)
        if os.path.exists(path):
            return ErrorMessage(
                error=f"A task with the name {name} already exists in the pool {pool}!"
            )
        self.log.info(f"Creating new template with name {name}")
        os.makedirs(os.path.join(path, "img"), exist_ok=True)
        os.makedirs(os.path.join(path, "data"), exist_ok=True)
        nb = new_notebook(metadata=dict(nbassignment=dict(type="task")))
        cell = new_read_only_cell(
            grade_id=f"{name}_Header",
            source=(
                f"# {name}\n"
                "Here you should give the general information about the task.\n"
                "Then add questions via the menu above.\n",
                "A task should be self containet",
            ),
        )
        nb.cells.append(cell)
        nbformat.write(os.path.join(path, f"{name}.ipynb"))
        return SuccessMessage()

    def remove(self, pool, name):
        shutil.rmtree(os.path.join(self.base_path, pool, name))

    def list(self, pool) -> List[Task]:
        tasks = []
        for task_dir in self.listdir(os.path.join(self.base_path, pool)):
            points, n_questions = self.__get_task_info(task_dir, pool)
            git_status = self.git_status(pool, task_dir)
            del git_status["repo"]
            tasks.append(
                Task(
                    name=task_dir,
                    pool=pool,
                    points=points,
                    n_questions=n_questions,
                    git_status=git_status,
                )
            )
        return tasks
