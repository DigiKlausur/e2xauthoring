from nbgrader.coursedir import CourseDirectory
from traitlets import Unicode
from traitlets.config import LoggingConfigurable

from ..utils.pathutils import resolve_path


class ResourceCollection(LoggingConfigurable):
    """Base class for collections of authoring resources such as pools and templates.

    Resources can live outside of the nbgrader course directory, e.g. to share
    them between several courses.
    """

    coursedir: CourseDirectory

    resources_root = Unicode(
        None,
        allow_none=True,
        help=(
            "Root directory for authoring resources. Relative paths are resolved "
            "against the nbgrader course root. Defaults to the course root."
        ),
    ).tag(config=True)

    directory = Unicode(
        help=(
            "Directory where the resources are stored. Relative paths are resolved "
            "against resources_root."
        )
    ).tag(config=True)

    @property
    def root_path(self) -> str:
        if self.resources_root is None:
            return resolve_path(".", self.coursedir.root)
        return resolve_path(self.coursedir.root, self.resources_root)

    @property
    def resource_path(self) -> str:
        return resolve_path(self.root_path, self.directory)
