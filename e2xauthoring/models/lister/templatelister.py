from typing import List

from traitlets import Unicode

from ..dataclasses.template import Template
from .lister import Lister


class TemplateLister(Lister):
    directory = Unicode(
        "templates", help="The relative directory where the templates are stored"
    )

    def list_items(self, **kwargs) -> List[Template]:
        return [
            Template(name=template_dir) for template_dir in self.listdir(self.base_path)
        ]
