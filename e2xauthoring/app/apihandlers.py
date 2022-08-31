import json

from e2xgrader.converters import GenerateExercise
from e2xgrader.models import AssignmentModel, TemplateModel
from e2xgrader.server_extensions.grader.apps.authoring.apihandlers import (
    BaseApiListHandler,
    BaseApiManageHandler,
    E2xApiHandler,
    ExerciseModel,
    KernelSpecHandler,
    PresetHandler,
    TemplateVariableHandler,
    api_url,
    assignment_regex,
    name_regex,
    pool_regex,
)
from e2xgrader.utils import urljoin
from nbgrader.server_extensions.formgrader.base import check_xsrf
from tornado import web

from e2xauthoring.utils import get_author, set_author

from ..models import TaskModel, TaskPoolModel


class ManagePoolsHandler(E2xApiHandler):
    def initialize(self) -> None:
        self.__poolmodel = TaskPoolModel(self.coursedir)

    @web.authenticated
    @check_xsrf
    def get(self, action):
        if action == "list":
            self.write(json.dumps(self.__poolmodel.list()))
        elif action == "get":
            self.write(json.dumps(self.__poolmodel.get(pool=self.get_argument("pool"))))
        else:
            self.write(
                json.dumps(
                    dict(status="error", message=f"{action} is not a valid action")
                )
            )

    @web.authenticated
    @check_xsrf
    def post(self, action):
        data = self.get_json_body()
        name = data.get("name")
        if action == "new":
            create_repository = data.get("create_repository", False)
            self.write(
                json.dumps(
                    self.__poolmodel.new(name=name, create_repository=create_repository)
                )
            )
        elif action == "remove":
            self.write(json.dumps(self.__poolmodel.remove(name=name)))
        elif action == "init_repo":
            self.write(json.dumps(self.__poolmodel.turn_into_repository(name)))
        else:
            self.write(
                json.dumps(
                    dict(status="error", message=f"{action} is not a valid action")
                )
            )


class ManageTasksHandler(E2xApiHandler):
    def initialize(self) -> None:
        self.__model = TaskModel(self.coursedir)

    @web.authenticated
    @check_xsrf
    def get(self, action):
        if action == "list":
            self.write(json.dumps(self.__model.list(pool=self.get_argument("pool"))))
        elif action == "list_all":
            tasks = []
            pool_model = TaskPoolModel(self.coursedir)
            for pool in pool_model.list():
                tasks.extend(self.__model.list(pool["name"]))
            self.write(json.dumps(tasks))
        elif action == "get":
            self.write(
                json.dumps(
                    self.__model.get(
                        pool=self.get_argument("pool"), name=self.get_argument("name")
                    )
                )
            )
        elif action == "diff":
            self.write(
                json.dumps(
                    self.__model.git_diff(
                        pool=self.get_argument("pool"),
                        task=self.get_argument("task"),
                        file=self.get_argument("file"),
                    )
                )
            )
        else:
            self.write(
                json.dumps(
                    dict(status="error", message=f"{action} is not a valid action")
                )
            )

    @web.authenticated
    @check_xsrf
    def post(self, action):
        data = self.get_json_body()
        name = data.get("name")
        pool = data.get("pool")
        if action == "new":
            self.write(json.dumps(self.__model.new(pool=pool, name=name)))
        elif action == "remove":
            self.write(json.dumps(self.__model.remove(pool=pool, name=name)))
        elif action == "commit":
            message = data.get("message", None)
            self.write(
                json.dumps(self.__model.commit(pool=pool, task=name, message=message))
            )
        else:
            self.write(
                json.dumps(
                    dict(status="error", message=f"{action} is not a valid action")
                )
            )


class ManageTemplatesHandler(E2xApiHandler):
    def initialize(self) -> None:
        self.__model = TemplateModel(self.coursedir)

    @web.authenticated
    @check_xsrf
    def get(self, action):
        if action == "list":
            self.write(json.dumps(self.__model.list()))
        else:
            self.write(
                json.dumps(
                    dict(status="error", message=f"{action} is not a valid action")
                )
            )

    @web.authenticated
    @check_xsrf
    def post(self, action):
        data = self.get_json_body()
        name = data.get("name")
        if action == "new":
            self.write(json.dumps(self.__model.new(name=name)))
        elif action == "remove":
            self.write(json.dumps(self.__model.remove(name=name)))
        else:
            self.write(
                json.dumps(
                    dict(status="error", message=f"{action} is not a valid action")
                )
            )


class GenerateExerciseHandler(E2xApiHandler):
    @web.authenticated
    @check_xsrf
    def post(self):
        GenerateExercise(coursedir=self.coursedir).convert(self.get_json_body())
        self.write(dict(success=True))


class GitAuthorHandler(E2xApiHandler):
    @web.authenticated
    @check_xsrf
    def get(self):
        self.write(json.dumps(get_author()))

    @web.authenticated
    @check_xsrf
    def post(self):
        data = self.get_json_body()
        name = data.get("name")
        email = data.get("email")
        self.write(json.dumps(set_author(name=name, email=email)))


pool_action_regex = r"(?P<action>new|list|remove|get|init_repo)"
task_action_regex = r"(?P<action>new|list|list_all|remove|commit|get|diff)"
template_action_regex = r"(?P<action>new|list|remove)"
default_handlers = [
    (urljoin(api_url, "presets"), PresetHandler),
    (
        urljoin(api_url, "assignments", "?"),
        BaseApiListHandler,
        dict(model_cls=AssignmentModel),
    ),
    (
        urljoin(api_url, "template", name_regex, "?"),
        BaseApiManageHandler,
        dict(model_cls=TemplateModel),
    ),
    (
        urljoin(api_url, "templates", "?"),
        BaseApiListHandler,
        dict(model_cls=TemplateModel),
    ),
    (
        urljoin(api_url, "worksheets", assignment_regex, name_regex, "?"),
        BaseApiManageHandler,
        dict(model_cls=ExerciseModel),
    ),
    (
        urljoin(api_url, "worksheets", assignment_regex, "?"),
        BaseApiListHandler,
        dict(model_cls=ExerciseModel),
    ),
    (urljoin(api_url, "pools", pool_action_regex, "?"), ManagePoolsHandler),
    (urljoin(api_url, "tasks", task_action_regex, "?"), ManageTasksHandler),
    (urljoin(api_url, "templates", template_action_regex, "?"), ManageTemplatesHandler),
    (urljoin(api_url, "templates", "variables"), TemplateVariableHandler),
    (urljoin(api_url, "kernelspec"), KernelSpecHandler),
    (urljoin(api_url, "generate_worksheet"), GenerateExerciseHandler),
    (urljoin(api_url, "git", "author"), GitAuthorHandler),
]
