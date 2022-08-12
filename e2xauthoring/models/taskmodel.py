import os

from e2xgrader.models import TaskModel as E2xTaskModel

from ..utils import commit_path, is_version_controlled, vcs_status


class TaskModel(E2xTaskModel):
    def get(self, **kwargs):
        task = super().get(**kwargs)
        git_status = self.git_status(pool=task["pool"], task=task["name"])
        del git_status["repo"]
        task["git_status"] = git_status
        return task

    def commit(self, pool, task, message, **kwargs):
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

    def list(self, pool:str):
        tasks = super().list(pool=pool)
        if is_version_controlled(os.path.join(self.base_path(), pool)):
            for task in tasks:
                git_status = self.git_status(pool=task["pool"], task=task["name"])
                del git_status["repo"]
                task["git_status"] = git_status
        return tasks

    def git_status(self, pool, task):
        path = os.path.join(self.base_path(), pool, task)
        git_status = vcs_status(path)
        if git_status["repo"] is None:
            return dict(status="not version controlled")
        changed_files = (
            git_status["untracked"] + git_status["unstaged"] + git_status["staged"]
        )
        git_status["status"] = "modified" if len(changed_files) > 0 else "unchanged"
        return git_status
