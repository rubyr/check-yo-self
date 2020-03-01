const $ = document.querySelector.bind(document);
var aside = $("aside");
var listHolder = $(".lists");
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
      displayList(newList);

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
var filter = {
  urgent: false,
  title: false,
  urgentBtn:  $("#filter-by-urgent"),
  search: $("#search"),
  iterateCards(callback) {
    for (var i = 0; i < listHolder.childElementCount; i++) {
      var thisList = listHolder.children[i];
      callback(thisList);
    }
  }, 
  sortUrgent() {
    filter.iterateCards(list => {
      if (list.classList.contains("list-urgent"))
        list.classList.remove("hidden");
      else 
        list.classList.add("hidden");
    });
  },
  sortTitle() {
    filter.iterateCards(function(list) {
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
    filter.iterateCards(list => list.classList.remove("hidden"));
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

function createCard(list) { 
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

  cardStr += `</section>
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
}

function displayList(list) {
  var listHTML = createCard(list);
  if (listHolder.childElementCount === 0) {
    listHolder.innerHTML = listHTML;
  } else {
    listHolder.innerHTML = listHTML + listHolder.innerHTML;
  }
}

function markUrgent(list) {
  list.classList.toggle("list-urgent");
  var listObj = ToDoList.getListById(list.dataset.listId);
  listObj.updateToDo({urgent: "toggle"});
  listObj.saveToStorage();
}

function checkTask(task) {
  var list = task.closest(".list");
  list = ToDoList.getListById(list.dataset.listId);
  list.updateTask(task.dataset.taskNum, {completed: "toggle"});
  task.classList.toggle("checked");
}

function deleteList(list) {
  var listObj = ToDoList.getListById(list.dataset.listId);
  if (!listObj.allTasksDone) {
    return;
  }
  listObj.deleteFromStorage();
  listHolder.removeChild(list);
  if (listHolder.childElementCount === 0) {
    listHolder.innerHTML = "Nothing here. Add a task!";
  }
}

aside.addEventListener('click', function() {
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
    filter.urgentBtn.classList.toggle("button-selected");
    filter.urgent = !filter.urgent;
    filter.filterCards();
  }
});

listHolder.addEventListener('click', function() {
  if (event.target.classList.contains("list-action-urgent")) {
    markUrgent(event.target.closest(".list"));
  }
  if (event.target.classList.contains("list-individual-item")) {
    checkTask(event.target);
  }
  if (event.target.classList.contains("list-action-delete")) {
    deleteList(event.target.closest(".list"));
  }
});

filter.search.addEventListener('keyup', function() {
  filter.filterCards();
});

window.onload = function() {
  var allLists = ToDoList.getLists();
  for (var listId in allLists) {
    displayList(allLists[listId]);
  }
};