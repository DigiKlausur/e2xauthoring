import os

from e2xcore.utils import urljoin
from nbgrader.server_extensions.formgrader.base import (
    BaseHandler,
    check_notebook_dir,
    check_xsrf,
)
from tornado import web

from ...__version__ import __version__

app_url = urljoin("e2x", "authoring", "app")
static_url = urljoin("e2x", "authoring", "static", "authoring-ui")


class AuthoringHandler(BaseHandler):
    """Serves the HTML shell of the authoring UI for every URL under the app.

    The catch-all lets the frontend router handle deep links and reloads.
    """

    @web.authenticated
    @check_xsrf
    @check_notebook_dir
    def get(self):
        app_config = dict(
            baseUrl=urljoin(self.base_url, app_url),
            apiUrl=urljoin(self.base_url, "e2x", "authoring", "api"),
            formgraderApiUrl=urljoin(self.base_url, "formgrader", "api"),
            notebookUrl=urljoin(self.base_url, "notebooks", self.url_prefix),
        )
        self.write(
            self.render(
                os.path.join("authoring", "index.html"),
                app_config=app_config,
                static_url=urljoin(self.base_url, static_url),
                version=__version__,
            )
        )


default_handlers = [(urljoin(app_url, "?.*"), AuthoringHandler)]
