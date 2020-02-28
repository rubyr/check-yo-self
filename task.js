class Task {
  constructor(content) {
    this.content = content;
    this.completed = false;
  }

  update(options) {
    this.content = options.content || this.content;
    if (typeof options.completed === "boolean")
      this.completed = options.completed;
    if (options.completed === "toggle")
      this.completed = !this.completed;
  }
}

if (typeof exports === "object")
  module.exports = Task;