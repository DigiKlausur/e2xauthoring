import { BaseAPI } from "./base";
import { pathJoin } from "./base";

export class AuthoringAPI extends BaseAPI {
  constructor(base_url) {
    super();
    this.base_url = pathJoin([base_url, "e2x", "authoring", "api"]);
  }

  get_presets(params) {
    return this.get(pathJoin([this.base_url, "presets"]), params);
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

  list_pools() {
    return this.get(pathJoin([this.base_url, "pools", "list"]));
  }

  remove_pool(pool) {
    return this.post(pathJoin([this.base_url, "pools", "remove"]), {
      name: pool,
    });
  }

  create_pool(pool) {
    return this.post(pathJoin([this.base_url, "pools", "new"]), { name: pool });
  }

  list_tasks(pool) {
    return this.get(pathJoin([this.base_url, "tasks", "list"]), { pool: pool });
  }

  remove_task(pool, task) {
    return this.post(pathJoin([this.base_url, "tasks", "remove"]), {
      name: task,
      pool: pool,
    });
  }

  create_task(pool, task) {
    return this.post(pathJoin([this.base_url, "tasks", "new"]), {
      name: task,
      pool: pool,
    });
  }

  get_task(pool, task) {
    return this.get(pathJoin([this.base_url, "tasks", "get"]), {
      name: task,
      pool: pool,
    });
  }

  commit_task(pool, task, message = undefined) {
    let data = {
      name: task,
      pool: pool,
    };
    if (message !== undefined) {
      data["message"] = message;
    }
    return this.post(pathJoin([this.base_url, "tasks", "commit"]), data);
  }
}
