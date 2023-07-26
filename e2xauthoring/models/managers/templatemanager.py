import os
import shutil
from typing import List

import nbformat
from e2xcore.utils.nbgrader_cells import new_read_only_cell
from nbformat.v4 import new_notebook
from traitlets import Unicode

from ..dataclasses import Template
from ..dataclasses.message import ErrorMessage, SuccessMessage
from .manager import BaseManager


class TemplateManager(BaseManager):
    directory = Unicode(
        "templates", help="The relative directory where the templates are stored"
    )

    def create(self, name):
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
        nbformat.write(os.path.join(self.base_path, name, f"{name}.ipynb"))
        return SuccessMessage()

    def remove(self, name):
        shutil.rmtree(os.path.join(self.base_path, name))

    def list(self) -> List[Template]:
        return [
            Template(name=template_dir) for template_dir in self.listdir(self.base_path)
        ]
