class ToDoList {
  constructor(title, tasks) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.title = title;
    this.tasks = tasks;
    this.urgent = false;
  }

  getLists() {
    var lists = localStorage.getItem("lists");
    if (lists === null) {
      lists = "{}";
    }
    return lists;
  }

  saveToStorage() {
    var lists = this.getLists();
    lists = JSON.parse(lists);
    lists[`${this.id}`] = this;
    localStorage.setItem("lists", JSON.stringify(lists));
  }

  deleteFromStorage() {
    var lists = this.getLists();
    lists = JSON.parse(lists);
    delete lists[`${this.id}`];
    localStorage.setItem("lists", JSON.stringify(lists));
  }

  updateToDo(options) {
    this.title = options.title || this.title;
    if (options.urgent !== undefined)
      this.urgent = options.urgent;
  }

  updateTask(taskNum, options) {
    this.tasks[taskNum].update(options);
  }
}

if (typeof exports == "object")
  module.exports = ToDoList;