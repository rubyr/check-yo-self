const $ = document.querySelector.bind(document);
var aside = $("aside");
var form = {
  title:      $("#list-title-input"),
  taskList:   $("#new-task-holder"),
  taskInput:  $("#task-input"),
  addTaskBtn: $(".add-task"),
  submitBtn:  $("#submit-new-list"),
  clearBtn:   $("#clear-new-list"),
  tasks:      [],
  deleteTask(task) {
    var taskName = task.parentNode.getElementsByTagName("P")[0].innerText;
    this.tasks.splice(this.tasks.indexOf(taskName), 1);
    task.closest("#new-task-holder").removeChild(task.parentNode);
  },
  addTask() {
    if (this.taskInput.value != "") {
      this.taskList.innerHTML += 
      `<div>
        <img src="assets/delete.svg" alt="Delete Item" class="delete-task">
        <p>${this.taskInput.value}</p>
      </div>`;
      this.tasks.push(form.taskInput.value);
      this.taskInput.value = "";
    }
    this.taskInput.focus();
  },
  submit() {
    var titleFilled = !!this.title.value;
    var tasksFilled = !!this.tasks.length;
    
    if (titleFilled && tasksFilled) {
      var taskList = [];
      this.tasks.forEach(task => {
        taskList.push(new Task(task));
      });
      var newList = new ToDoList(this.title.value, taskList);
      newList.saveToStorage();
      lists.displayList(newList);

      form.clear();
    }
  },
  clear() {
    this.taskList.innerHTML = "";
    this.title.value = "";
    this.taskInput.value = "";
    this.tasks = [];
  }
};
var lists = {
  container: $(".lists"),
  noListsMessage: $("#no-lists"),
  listCount: 0,

  createCard(list) { 
    var cardStr = `<section class="list${list.urgent ? " list-urgent" : ""}" data-list-id="${list.id}" title="${list.title}">
    <section class="list-title">
      <h3>${list.title}</h3>
    </section>
    <section class="list-items">`;

    list.tasks.forEach((task, i) => {
      cardStr += `<div class="list-individual-item${(task.completed) ? " checked" : ""}" data-task-num="${i}">
      <img src="assets/checkbox.svg" alt="Check off item"> <p>${task.content}</p>
    </div>`;
    });

    cardStr += `
    <input type="text" id="new-task-input">
    </section>
    <section class="list-actions">
      <div class="list-action-urgent">
        <img src="assets/urgent.svg" alt="Urgent"> 
        <p>urgent</p>
      </div>
      <div class="list-action-delete">
        <img src="assets/delete.svg" alt="Delete"> 
        <p>delete</p>
      </div>
    </section>
    </section>`;

    return cardStr;
  },

  displayList(list) {
    var listHTML = this.createCard(list);
    if (this.listCount === 0) {
      this.noListsMessage.classList.add("hidden");
    }
    this.listCount++;
    this.container.innerHTML = listHTML + this.container.innerHTML;
  },

  markUrgent(list) {
    list.classList.toggle("list-urgent");
    var listObj = ToDoList.getListById(list.dataset.listId);
    listObj.updateToDo({urgent: "toggle"});
    listObj.saveToStorage();
  },

  checkTask(task) {
    var list = task.closest(".list");
    list = ToDoList.getListById(list.dataset.listId);
    list.updateTask(task.dataset.taskNum, {completed: "toggle"});
    task.classList.toggle("checked");
  },

  deleteList(list) {
    var listObj = ToDoList.getListById(list.dataset.listId);
    if (!listObj.allTasksDone) {
      return;
    }
    listObj.deleteFromStorage();
    this.container.removeChild(list);
    this.listCount--;
    if (this.listCount === 0) {
      this.noListsMessage.classList.remove("hidden");
    }
  },

  editTitle(titleSection) {
    var title = titleSection.parentNode.title;
    titleSection.innerHTML = `<input tyle="text" id="title-input-TEMP">`;
    var input = $("#title-input-TEMP");
    input.value = title;
    input.focus();
  },

  setTitle() {
    var input = $("#title-input-TEMP");
    if (input.value === "")
      return;
    var list = input.closest(".list");
    var newTitle = input.value;
    input.parentNode.innerHTML = `<h3>${newTitle}</h3>`;
    list.title = newTitle;
    ToDoList.getListById(list.dataset.listId).updateToDo({title: newTitle});
  },

  editTask(task) {
    var taskName = task.innerText;
    task.outerHTML = `<input type="text" id="task-input-TEMP" value="${taskName}">`;
    var input = $("#task-input-TEMP");
    input.value = taskName;
    input.focus();
  },

  setTask() {
    var input = $("#task-input-TEMP");
    if (input.value === "")
      return;
    var item = input.closest(".list-individual-item");
    var newTask = input.value;
    item.removeChild(input);
    item.innerHTML += `<p>${newTask}</p>`;
    ToDoList.getListById(item.closest(".list").dataset.listId)
      .updateTask(item.dataset.taskNum, {content: newTask});
  },

  addTask(list) {
    var input = list.querySelector("#new-task-input");
    if (input.value === "")
      return;
    var task = new Task(input.value);
    ToDoList.getListById(list.dataset.listId).addTask(task);
    var listItemHolder = list.querySelector(".list-items");
    listItemHolder.removeChild(input);
    listItemHolder.innerHTML += `<div class="list-individual-item" data-task-num="${listItemHolder.childElementCount}">
    <img src="assets/checkbox.svg" alt="Check off item"> <p>${task.content}</p>
  </div>
  <input type="text" id="new-task-input">`;
  }
};
var filter = {
  urgent: false,
  title: false,
  urgentBtn:  $("#filter-by-urgent"),
  search: $("#search"),
  iterateCards(callback) {
    for (var i = 0; i < lists.container.childElementCount; i++) {
      var thisList = lists.container.children[i];
      if (thisList.title !== "")
        callback(thisList);
    }
  }, 
  urgentClicked() {
    this.urgentBtn.classList.toggle("button-selected");
    this.urgent = !this.urgent;
    this.filterCards();
  },
  sortUrgent() {
    this.iterateCards(list => {
      if (list.classList.contains("list-urgent"))
        list.classList.remove("hidden");
      else 
        list.classList.add("hidden");
    });
    if (lists.container.querySelectorAll(".list:not(.hidden)").length === 0) {
      $("#urgent-message").classList.remove("hidden");
    }
  },
  sortTitle() {
    this.iterateCards(function(list) {
      if (filter.urgent && list.classList.contains("hidden"))
        return;
      if (list.title.includes(filter.search.value)) {
        list.classList.remove("hidden");
      } else {
        list.classList.add("hidden");
      }
    });
  },
  showAll() {
    this.iterateCards(list => list.classList.remove("hidden"));
    $("#urgent-message").classList.add("hidden");
  },
  filterCards() {
    this.title = (this.search.value !== "");
    if (this.urgent) {
      this.sortUrgent();
    } else if (!this.title) {
      this.showAll();
    }
    if (this.title) {
      this.sortTitle();
    } else if (!this.urgent) {
      this.showAll();
    }
  }
};

aside.addEventListener('click', function(event) {
  if (event.target === form.addTaskBtn) {
    form.addTask();
  }
  if (event.target.classList.contains("delete-task")) {
    form.deleteTask(event.target);
  }
  if (event.target === form.submitBtn) {
    form.submit();
  }
  if (event.target === form.clearBtn) {
    form.clear();
  }
  if (event.target === filter.urgentBtn) {
    filter.urgentClicked();
  }
});

aside.addEventListener('keyup', function(event) {
  event.preventDefault();

  if (event.target === form.taskInput && event.keyCode === 13) {
    form.addTask();
  }
});

lists.container.addEventListener('click', function(event) {
  if ($("#task-input-TEMP") !== null) {
    lists.setTask();
  }
  if ($("#title-input-TEMP") !== null) {
    lists.setTitle();
  }
  if (event.target.classList.contains("list-action-urgent")) {
    lists.markUrgent(event.target.closest(".list"));
  }
  if (event.target.parentNode.classList.contains("list-individual-item")) {
    if (event.target.tagName === "IMG")
      lists.checkTask(event.target.closest(".list-individual-item"));
    if (event.target.tagName === "P")
      lists.editTask(event.target);
  }
  if (event.target.classList.contains("list-action-delete")) {
    lists.deleteList(event.target.closest(".list"));
  }
  if (event.target.classList.contains("list-title")) {
    lists.editTitle(event.target);
  }
});

lists.container.addEventListener('keyup', function(event) {
  event.preventDefault();

  if (event.keyCode === 13) {
    if ($("#title-input-TEMP") !== null) lists.setTitle();
    if ($("#task-input-TEMP") !== null) lists.setTask();
    if (event.target.id === "new-task-input") lists.addTask(event.target.closest(".list"));
  }
});

filter.search.addEventListener('keyup', function() {
  filter.filterCards();
});

window.onload = function() {
  var allLists = ToDoList.getLists();
  for (var listId in allLists) {
    lists.displayList(allLists[listId]);
  }
};