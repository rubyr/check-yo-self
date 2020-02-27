class Task {
  constructor(content) {
    this.content = content;
    this.completed = false;
  }

  update(options) {
    this.content = options.content || this.content;
    if (options.completed !== undefined)
      this.completed = options.completed;
  }
}

if (typeof exports == "object")
  module.exports = Task;