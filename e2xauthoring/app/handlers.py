import os
import sys
from email.policy import default

from e2xgrader.server_extensions.grader.apps.authoring.handlers import app_url
from e2xgrader.utils import urljoin
from nbgrader.server_extensions.formgrader.base import (
    BaseHandler,
    check_notebook_dir,
    check_xsrf,
)
from tornado import web


class AuthoringHandler(BaseHandler):
    @web.authenticated
    @check_xsrf
    @check_notebook_dir
    def get(self):
        self.write(
            self.render(
                os.path.join("authoring", "base.tpl"),
                url_prefix=self.url_prefix,
                base_url=self.base_url,
                windows=(sys.prefix == "win32"),
            )
        )


default_handlers = [(urljoin(app_url, "?"), AuthoringHandler)]
