import json

from e2xgrader.models import AssignmentModel, TemplateModel
from e2xgrader.server_extensions.grader.apps.authoring.apihandlers import (
    BaseApiListHandler,
    BaseApiManageHandler,
    E2xApiHandler,
    ExerciseModel,
    GenerateExerciseHandler,
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

from ..models import TaskModel, TaskPoolModel


class ManagePoolsHandler(E2xApiHandler):
    def initialize(self) -> None:
        self.__poolmodel = TaskPoolModel(self.coursedir)

    @web.authenticated
    @check_xsrf
    def get(self, action):
        if action == "list":
            self.write(json.dumps(self.__poolmodel.list()))
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
        elif action == "get":
            self.write(
                json.dumps(
                    self.__model.get(
                        pool=self.get_argument("pool"), name=self.get_argument("name")
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


pool_action_regex = r"(?P<action>new|list|remove|init_repo)"
task_action_regex = r"(?P<action>new|list|remove|commit|get)"
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
        urljoin(api_url, "exercise", assignment_regex, name_regex, "?"),
        BaseApiManageHandler,
        dict(model_cls=ExerciseModel),
    ),
    (
        urljoin(api_url, "exercise", assignment_regex, "?"),
        BaseApiListHandler,
        dict(model_cls=ExerciseModel),
    ),
    (urljoin(api_url, "pools", pool_action_regex, "?"), ManagePoolsHandler),
    (urljoin(api_url, "tasks", task_action_regex, "?"), ManageTasksHandler),
    (urljoin(api_url, "templates", "variables"), TemplateVariableHandler),
    (urljoin(api_url, "kernelspec"), KernelSpecHandler),
    (urljoin(api_url, "generate_exercise"), GenerateExerciseHandler),
]


old = [
    (
        urljoin(api_url, "pool", name_regex, "?"),
        BaseApiManageHandler,
        dict(model_cls=TaskPoolModel),
    ),
    (
        urljoin(api_url, "pools", pool_regex, "?"),
        BaseApiListHandler,
        dict(model_cls=TaskModel),
    ),
    (
        urljoin(api_url, "task", pool_regex, name_regex, "?"),
        ManageTasksHandler,
        dict(model_cls=TaskModel),
    ),
    (urljoin(api_url, "pools", "?"), BaseApiListHandler, dict(model_cls=TaskPoolModel)),
]
