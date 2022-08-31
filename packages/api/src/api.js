import { E2xAPI, get, put, NbGraderAPI, pathJoin, post } from "./base";

export class AuthoringAPI {
  constructor(base_url) {
    this.base_url = pathJoin([base_url, "e2x", "authoring", "api"]);
    this.tasks = new TaskAPI(base_url);
    this.pools = new TaskPoolAPI(base_url);
    this.templates = new TemplateAPI(base_url);
    this.assignments = new AssignmentAPI(base_url);
    this.worksheets = new WorksheetAPI(base_url);
    this.git = new GitAPI(base_url);
  }

  get_presets(params) {
    return get(pathJoin([this.base_url, "presets"]), params);
  }

  list_question_presets() {
    return this.get_presets({
      type: "question",
      action: "list",
    });
  }

  list_template_presets() {
    return this.get_presets({
      type: "template",
      action: "list",
    });
  }

  get_question_preset(name) {
    return this.get_presets({
      type: "question",
      action: "get",
      name: name,
    });
  }

  get_template_preset(name) {
    return this.get_presets({
      type: "template",
      action: "get",
      name: name,
    });
  }

  list_kernels() {
    return get(pathJoin([this.base_url, "kernelspec"]));
  }
}

class TaskPoolAPI extends E2xAPI {
  constructor(base_url) {
    super(base_url);
    this.base_url = pathJoin([this.base_url, "pools"]);
  }

  /**
   * Get a list of all task pools
   * @returns {Array} A list of task pools
   */
  list() {
    return get(pathJoin([this.base_url, "list"]));
  }

  /**
   * Remove a task pool and all tasks within it
   * @param {String} pool The name of the pool
   * @returns {Object}    A status object
   */
  remove(pool) {
    return post(pathJoin([this.base_url, "remove"]), {
      name: pool,
    });
  }

  /**
   * Create a new task pool
   * @param {String} pool      The name of the pool
   * @param {Boolean} initRepo If this task pool should be initialized as a git repository
   * @returns {Object}         A status object
   */
  new(pool, initRepo) {
    return post(pathJoin([this.base_url, "new"]), {
      name: pool,
      create_repository: initRepo,
    });
  }

  /**
   * Get information about a specific task pool
   * @param {String} pool The name of the pool
   * @returns {Object}    An object containing information about the pool
   */
  get(pool) {
    return get(pathJoin([this.base_url, "get"]), { pool: pool });
  }

  /**
   * Turn an existing task pool into a git repository
   * @param {String} pool The name of the pool
   * @returns {Object}    A status object
   */
  init_as_repo(pool) {
    return post(pathJoin([this.base_url, "init_repo"]), {
      name: pool,
    });
  }
}

class TaskAPI extends E2xAPI {
  constructor(base_url) {
    super(base_url);
    this.base_url = pathJoin([this.base_url, "tasks"]);
  }
  list(pool) {
    if (pool !== undefined) {
      return get(pathJoin([this.base_url, "list"]), {
        pool: pool,
      });
    } else {
      return get(pathJoin([this.base_url, "list_all"]));
    }
  }

  remove(pool, task) {
    return post(pathJoin([this.base_url, "remove"]), {
      name: task,
      pool: pool,
    });
  }

  new(pool, task) {
    return post(pathJoin([this.base_url, "new"]), {
      name: task,
      pool: pool,
    });
  }

  get(pool, task) {
    return get(pathJoin([this.base_url, "get"]), {
      name: task,
      pool: pool,
    });
  }

  commit(pool, task, message = undefined) {
    let data = {
      name: task,
      pool: pool,
    };
    if (message !== undefined) {
      data["message"] = message;
    }
    return post(pathJoin([this.base_url, "commit"]), data);
  }

  diff(pool, task, file) {
    return get(pathJoin([this.base_url, "diff"]), {
      pool: pool,
      task: task,
      file: file,
    });
  }
}

class TemplateAPI extends E2xAPI {
  constructor(base_url) {
    super(base_url);
    this.base_url = pathJoin([this.base_url, "templates"]);
  }

  list() {
    return get(pathJoin([this.base_url, "list"]));
  }

  remove(name) {
    return post(pathJoin([this.base_url, "remove"]), {
      name: name,
    });
  }

  new(name) {
    return post(pathJoin([this.base_url, "new"]), {
      name: name,
    });
  }

  list_variables(name) {
    return get(pathJoin([this.base_url, "variables"]), {
      template: name,
    });
  }
}

class AssignmentAPI extends NbGraderAPI {
  constructor(base_url) {
    super(base_url);
    this.e2x_api_url = pathJoin([base_url, "e2x", "authoring", "api"]);
  }

  list(include_score = true) {
    return get(pathJoin([this.base_url, "assignments"]), {
      include_score: include_score,
    });
  }

  new(name, date) {
    let params = {};
    if (date !== null) {
      let duedate_notimezone = date.toISOString().split(".")[0];
      params["duedate_notimezone"] = duedate_notimezone.slice(
        0,
        duedate_notimezone.length - 3
      );
    }
    return put(pathJoin([this.base_url, "assignment", name]), params);
  }
}

class WorksheetAPI extends E2xAPI {
  constructor(base_url) {
    super(base_url);
  }

  list(assignment) {
    return get(pathJoin([this.base_url, "worksheets", assignment]));
  }

  new(assignment, name, tasks, template, templateOptions, worksheetOptions) {
    if (worksheetOptions["task-headers"] !== undefined) {
      worksheetOptions["task-headers"] = false;
    }
    let resources = {
      exercise_options: worksheetOptions,
      tasks: tasks.map((_task) => {
        return { ..._task, task: _task.name };
      }),
      template: template,
      "template-options": templateOptions,
      exercise: name,
      assignment: assignment,
    };
    return post(pathJoin([this.base_url, "generate_worksheet"]), resources);
  }
}

class GitAPI extends E2xAPI {
  constructor(base_url) {
    super(base_url);
  }

  getAuthor() {
    return get(pathJoin([this.base_url, "git", "author"]));
  }

  setAuthor(name, email) {
    return post(pathJoin([this.base_url, "git", "author"]), {
      name: name,
      email: email,
    });
  }
}
