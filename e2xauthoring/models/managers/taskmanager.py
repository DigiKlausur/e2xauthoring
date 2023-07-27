import os
import shutil

import nbformat
from e2xcore.utils.nbgrader_cells import is_nbgrader_cell, new_read_only_cell
from nbformat.v4 import new_notebook
from traitlets import Unicode

from ...utils.gitutils import commit_path, vcs_status
from ..dataclasses import ErrorMessage, SuccessMessage, Task
from .manager import BaseManager


class TaskManager(BaseManager):
    directory = Unicode(
        "pools", help="The relative directory where the pools are stored"
    )

    def __get_task_info(self, task, pool):
        base_path = os.path.join(self.base_path, pool)
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
        path = os.path.join(self.base_path, pool, task)
        git_status = vcs_status(path, relative=True)
        if git_status["repo"] is None:
            return dict(status="not version controlled")
        changed_files = (
            git_status["untracked"] + git_status["unstaged"] + git_status["staged"]
        )
        git_status["status"] = "modified" if len(changed_files) > 0 else "unchanged"
        return git_status

    def git_diff(self, pool, task, file):
        path = os.path.join(self.base_path, pool, task, file)
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

    def get(self, pool: str, name: str) -> SuccessMessage | ErrorMessage:
        path = os.path.join(self.base_path, pool, name)
        if not os.path.exists(path):
            return ErrorMessage(error="The task does not exists")
        points, n_questions = self.__get_task_info(name, pool)
        git_status = self.git_status(pool, name)
        if "repo" in git_status:
            del git_status["repo"]
        return SuccessMessage(
            data=Task(
                name=name,
                pool=pool,
                points=points,
                n_questions=n_questions,
                git_status=git_status,
            )
        )

    def create(self, pool: str, name: str) -> SuccessMessage | ErrorMessage:
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
                "Then add questions via the menu above.\n"
                "A task should be self contained"
            ),
        )
        nb.cells.append(cell)
        nbformat.write(nb, os.path.join(path, f"{name}.ipynb"))
        return SuccessMessage()

    def remove(self, pool, name) -> SuccessMessage | ErrorMessage:
        path = os.path.join(self.base_path, pool, name)
        if not os.path.exists(path):
            return ErrorMessage(error="The task does not exist")
        shutil.rmtree(path)
        return SuccessMessage()

    def list(self, pool) -> SuccessMessage | ErrorMessage:
        tasks = []
        path = os.path.join(self.base_path, pool)
        if not os.path.exists(path):
            return ErrorMessage(error=f"No pool with the name {pool} exists.")
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
        return SuccessMessage(data=tasks)

    def copy(
        self, old_name: str, new_name: str, pool: str = ""
    ) -> ErrorMessage | SuccessMessage:
        src = os.path.join(pool, old_name)
        dst = os.path.join(pool, new_name)
        status = super().copy(src, dst)
        if not status.success:
            return status
        dst_path = os.path.join(self.base_path, dst)
        shutil.move(
            os.path.join(dst_path, f"{old_name}.ipynb"),
            os.path.join(dst_path, f"{new_name}.ipynb"),
        )
        nb_path = os.path.join(dst_path, f"{new_name}.ipynb")
        nb = nbformat.read(nb_path, as_version=nbformat.NO_CONVERT)
        for cell in nb.cells:
            if is_nbgrader_cell(cell):
                grade_id = cell.metadata.nbgrader.grade_id
                cell.metadata.nbgrader.grade_id = grade_id.replace(old_name, new_name)
        nbformat.write(nb, nb_path)

        return SuccessMessage()

    def rename(
        self, old_name: str, new_name: str, pool: str = ""
    ) -> ErrorMessage | SuccessMessage:
        msg = self.copy(old_name, new_name, pool)
        if not msg.success:
            return msg
        self.remove(pool, old_name)
