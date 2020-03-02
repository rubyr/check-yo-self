class ToDoList {
  constructor(title, tasks) {
    this.id = Math.random()
      .toString(36)
      .substr(2, 9);
    this.title = title;
    this.tasks = tasks;
    this.urgent = false;
    this.allTasksDone = false;
  }

  static getListById(listId) {
    var listObj = ToDoList.getLists()[listId];
    if (listObj != undefined) return ToDoList.parseObject(listObj);
  }

  static parseObject(toDoObject) {
    var newList = new ToDoList(toDoObject.title, toDoObject.tasks);
    newList = Object.assign(newList, toDoObject);
    newList.tasks.forEach((task, i) => {
      newList.tasks[i] = new Task();
      newList.tasks[i] = Object.assign(newList.tasks[i], task);
    });
    return newList;
  }

  static getLists() {
    var lists = localStorage.getItem("lists");
    if (lists === null) {
      lists = "{}";
    }
    return JSON.parse(lists);
  }

  saveToStorage() {
    var lists = ToDoList.getLists();
    lists[`${this.id}`] = this;
    localStorage.setItem("lists", JSON.stringify(lists));
  }

  deleteFromStorage() {
    var lists = ToDoList.getLists();
    delete lists[`${this.id}`];
    localStorage.setItem("lists", JSON.stringify(lists));
  }

  addTask(task) {
    this.tasks.push(task);
    this.saveToStorage();
  }

  updateToDo(options) {
    this.title = options.title || this.title;
    if (typeof options.urgent === "boolean") this.urgent = options.urgent;
    if (options.urgent === "toggle") this.urgent = !this.urgent;
    this.saveToStorage();
  }

  updateTask(taskNum, options) {
    this.tasks[taskNum].update(options);
    this.allTasksDone = this.tasks.every(task => task.completed);
    this.saveToStorage();
  }
}

if (typeof exports === "object") module.exports = ToDoList;
