import glob
import os
import shutil

from traitlets import Unicode

from .base import BaseManager


class WorksheetManager(BaseManager):
    directory = Unicode("source", help="The directory where assignments go.")

    def get(self, name: str, assignment: str):
        return {"name": name, "assignment": assignment}

    def remove(self, name: str, assignment: str):
        base_path = os.path.join(self.base_path(), assignment)
        worksheet_files = os.path.join(base_path, "{}_files".format(name))
        if os.path.exists(worksheet_files):
            shutil.rmtree(worksheet_files)
        worksheet = os.path.join(base_path, "{}.ipynb".format(name))
        if os.path.exists(worksheet):
            os.remove(worksheet)

    def list(self, assignment: str):
        base_path = os.path.join(self.base_path(), assignment)
        worksheetnbs = glob.glob(os.path.join(base_path, "*.ipynb"))
        worksheets = []
        for worksheetnb in worksheetnbs:
            name = os.path.split(worksheetnb)[-1].replace(".ipynb", "")
            worksheets.append(
                {
                    "name": name,
                    "assignment": assignment,
                    "link": os.path.join(
                        "taskcreator", "assignments", assignment, name
                    ),
                }
            )

        return worksheets
