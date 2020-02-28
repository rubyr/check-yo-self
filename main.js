var listHolder = document.querySelector(".lists");

function createCard(list) { 
  var cardStr = `<section class="list${list.urgent ? " list-urgent" : ""}" data-list-id="${list.id}">
  <section class="list-title">
    <h3>${list.title}</h3>
  </section>
  <section class="list-items">`;

  list.tasks.forEach(task => {
    cardStr += `<div class="list-individual-item">
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
    listHolder.innerHTML += listHTML;
  }
}

// var list1 = new ToDoList("Get ripped", [new Task("Talk to jeff"), new Task("talk to Steve")]);
// list1.saveToStorage();

listHolder.addEventListener('click', function() {
  if (event.target.classList.contains("list-action-urgent")) {
    var list = event.target.closest(".list");
    list.classList.toggle("list-urgent");
    var listObj = ToDoList.getListById(list.dataset.listId);
    listObj.updateToDo({urgent: !listObj.urgent});
    listObj.saveToStorage();
  }
});

window.onload = function() {
  var allLists = ToDoList.getLists();
  for (var listId in allLists) {
    displayList(allLists[listId]);
  }
};