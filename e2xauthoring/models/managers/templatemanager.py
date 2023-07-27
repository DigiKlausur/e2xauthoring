import os
import shutil

import nbformat
from e2xcore.utils.nbgrader_cells import new_read_only_cell
from nbformat.v4 import new_notebook
from traitlets import Unicode

from ..dataclasses import ErrorMessage, SuccessMessage, Template
from .manager import BaseManager


class TemplateManager(BaseManager):
    directory = Unicode(
        "templates", help="The relative directory where the templates are stored"
    )

    def get(self, name: str) -> SuccessMessage | ErrorMessage:
        path = os.path.join(self.base_path, name)
        if not os.path.exists(path):
            return ErrorMessage(
                error=f"A template with the name {name} does not exists!"
            )
        return SuccessMessage(data=Template(name=name))

    def create(self, name: str) -> SuccessMessage | ErrorMessage:
        if not self.is_valid_name(name):
            return ErrorMessage(error="The name is invalid!")
        path = os.path.join(self.base_path, name)
        if os.path.exists(path):
            return ErrorMessage(
                error=f"A template with the name {name} already exists!"
            )
        self.log.info(f"Creating new template with name {name}")
        os.makedirs(os.path.join(self.base_path, name, "img"), exist_ok=True)
        os.makedirs(os.path.join(self.base_path, name, "data"), exist_ok=True)
        nb = new_notebook(metadata=dict(nbassignment=dict(type="template")))
        cell = new_read_only_cell(
            grade_id="HeaderA",
            source=(
                "### This is a header cell\n\n"
                "It will always appear at the top of the notebook"
            ),
        )
        cell.metadata["nbassignment"] = dict(type="header")
        nb.cells.append(cell)
        nbformat.write(nb, os.path.join(self.base_path, name, f"{name}.ipynb"))
        return SuccessMessage()

    def remove(self, name: str) -> SuccessMessage | ErrorMessage:
        path = os.path.join(self.base_path, name)
        if not os.path.exists(path):
            return ErrorMessage(error="The template does not exist")
        shutil.rmtree(path)
        return SuccessMessage()

    def list(self) -> SuccessMessage | ErrorMessage:
        if not os.path.exists(self.base_path):
            return ErrorMessage(error="Template directory not found.")
        return SuccessMessage(
            data=[
                Template(name=template_dir)
                for template_dir in self.listdir(self.base_path)
            ]
        )

    def copy(self, old_name: str, new_name: str) -> SuccessMessage | ErrorMessage:
        status = super().copy(old_name, new_name)
        if not status.success:
            return status
        dst_path = os.path.join(self.base_path, new_name)
        shutil.move(
            os.path.join(dst_path, f"{old_name}.ipynb"),
            os.path.join(dst_path, f"{new_name}.ipynb"),
        )
        return SuccessMessage()
