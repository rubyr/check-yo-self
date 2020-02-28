const $ = document.querySelector.bind(document);
var aside = $("aside");
var form = {
  title:     $("#list-title-input"),
  taskList:  $("#new-task-holder"),
  taskInput: $("#task-input"),
  addTask:   $(".add-task"),
  submit:    $("#submit-new-list"),
  clear:     $("#clear-new-list"),
  tasks:     []
};
var listHolder = $(".lists");

function createCard(list) { 
  var cardStr = `<section class="list${list.urgent ? " list-urgent" : ""}" data-list-id="${list.id}">
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
  listObj.updateToDo({urgent: !listObj.urgent});
  listObj.saveToStorage();
}

function clearForm() {
  form.taskList.innerHTML = "";
  form.title.value = "";
  form.taskInput.value = "";
  form.tasks = [];
}

function checkTask(task) {
  var list = task.closest(".list");
  list = ToDoList.getListById(list.dataset.listId);
  list.updateTask(task.dataset.taskNum, {completed: true});
  task.classList.add("checked");
}

aside.addEventListener('click', function() {
  if (event.target == form.addTask && form.taskInput.value != "") {
    form.taskList.innerHTML += 
    `<div>
      <img src="assets/delete.svg" alt="Delete Item" class="delete-task">
      <p>${form.taskInput.value}</p>
    </div>`;
    form.tasks.push(form.taskInput.value);
    form.taskInput.value = "";
  }
  if (event.target.classList.contains("delete-task")) {
    var task = event.target.parentNode.getElementsByTagName("P")[0].innerText;
    form.tasks.splice(form.tasks.indexOf(task), 1);
    event.target.closest("#new-task-holder").removeChild(event.target.parentNode);
  }
  if (event.target == form.submit) {
    var titleFilled = !!form.title.value;
    var tasksFilled = !!form.tasks.length;
    
    if (titleFilled && tasksFilled) {
      var taskList = [];
      form.tasks.forEach(task => {
        taskList.push(new Task(task));
      });
      var newList = new ToDoList(form.title.value, taskList);
      newList.saveToStorage();
      displayList(newList);

      clearForm();
    }
  }
  if (event.target == form.clear) {
    clearForm();
  }
});

listHolder.addEventListener('click', function() {
  if (event.target.classList.contains("list-action-urgent")) {
    markUrgent(event.target.closest(".list"));
  }
  if (event.target.classList.contains("list-individual-item")) {
    checkTask(event.target);
  }
});

window.onload = function() {
  var allLists = ToDoList.getLists();
  for (var listId in allLists) {
    displayList(allLists[listId]);
  }
};