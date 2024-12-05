const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const todoList = document.getElementById("todo-list");

const confirmationModal = document.getElementById("confirmation-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

const tooltip = document.getElementById("custom-tooltip");

// retrieving tasks from localStorage
let allTodos = getTodos();
updateTodoList();

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});


function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText !== "") {
    const newTodo = {
      task: taskText,
      completed: false,
    };

    allTodos.push(newTodo);
    updateTodoList();
    saveTodos();

    // clearing input field
    taskInput.value = "";
  }
}


function updateProgressBar() {
  const totalTasks = allTodos.length;
  const completedTasks = allTodos.filter(todo => todo.completed).length;

  const progressBar = document.getElementById("progress-bar");
  const progressCounter = document.getElementById("progress-counter");

  if (totalTasks === 0) {
    progressBar.style.width = '0%';
    progressCounter.innerHTML = `0/0`;
    progressBar.classList.remove("filled");
    progressCounter.classList.remove("filled", "partial");
    return;
  }

  const progressPercentage = (completedTasks / totalTasks) * 100;
  progressBar.style.width = `${progressPercentage}%`;

  // class changes based on progress
  if (progressPercentage === 100) {
    progressBar.classList.add("filled");
    progressCounter.classList.add("filled");
    progressCounter.classList.remove("partial");
  } else if (progressPercentage > 0 && progressPercentage < 100) {
    progressBar.classList.remove("filled");
    progressCounter.classList.add("partial");
    progressCounter.classList.remove("filled");
  } else {
    progressBar.classList.remove("filled");
    progressCounter.classList.remove("filled", "partial");
  }

  progressCounter.innerHTML = `
    <span class="counter-min ${progressPercentage > 0 && progressPercentage < 100 ? 'partial-color' : ''}">
      ${completedTasks}
    </span>/
    <span class="counter-max">${totalTasks}</span>
  `;
}


function showTooltip(event, text) {
    tooltip.textContent = text;
    tooltip.style.opacity = "1";
    tooltip.style.top = event.pageY + 30 + "px";
    tooltip.style.left = event.pageX - 60 + "px";
}


function hideTooltip() {
    tooltip.style.opacity = "0";
}


function attachTooltipListeners() {
  const todoTexts = document.querySelectorAll(".text");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const checkboxes = document.querySelectorAll(".custom-checkbox");

  // for task text
  todoTexts.forEach((text, index) => {
      const correspondingCheckbox = document.getElementById(`todo-${index}`);
      const tooltipText = correspondingCheckbox.checked ? "Pažymėti kaip neatliktą" : "Pažymėti kaip atliktą";

      text.addEventListener("mouseenter", (event) => showTooltip(event, tooltipText));
      text.addEventListener("mousemove", (event) => showTooltip(event, tooltipText));
      text.addEventListener("mouseleave", hideTooltip);
  });

  // for delete button
  deleteButtons.forEach((btn) => {
      btn.addEventListener("mouseenter", (event) => showTooltip(event, "Pašalinti"));
      btn.addEventListener("mousemove", (event) => showTooltip(event, "Pašalinti"));
      btn.addEventListener("mouseleave", hideTooltip);
  });

  // for checkbox
  checkboxes.forEach((checkbox, index) => {
      const tooltipText = checkbox.checked ? "Pažymėti kaip neatliktą" : "Pažymėti kaip atliktą";

      checkbox.addEventListener("mouseenter", (event) => showTooltip(event, tooltipText));
      checkbox.addEventListener("mousemove", (event) => showTooltip(event, tooltipText));
      checkbox.addEventListener("mouseleave", hideTooltip);
  });
}


function updateTodoList() {
  todoList.innerHTML = "";

  if (allTodos.length === 0) {
    // placeholder message when there are no tasks
    const placeholder = document.createElement("li");
    placeholder.className = "todo-item placeholder";
    placeholder.textContent = "Neturite pridėtų užduočių!";
    todoList.appendChild(placeholder);
  } else {
    allTodos.forEach((todo, todoIndex) => {
      const todoItem = createTodoItem(todo, todoIndex);
      todoList.appendChild(todoItem);
    });
  }

  updateProgressBar();
  attachTooltipListeners();
}


function createTodoItem(todo, todoIndex) {
  const todoId = "todo-" + todoIndex;
  const todoLI = document.createElement("li");
  const todoText = todo.task;
  todoLI.className = "todo-item";

  todoLI.innerHTML = `
      <input type="checkbox" id="${todoId}" ${todo.completed ? "checked" : ""}>
      <label class="custom-checkbox" for="${todoId}">
          <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
      </label>
      <label for="${todoId}" class="text">${todoText}</label>
      <button class="delete-btn">
          <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
      </button>
  `;

  const checkbox = todoLI.querySelector("input[type='checkbox']");
  const deleteButton = todoLI.querySelector(".delete-btn");

  deleteButton.addEventListener("click", () => {
    hideTooltip();

    if (todo.completed) {
        // without showing the confirmation modal
        deleteTodoItem(todoIndex);
    } else {
        // showing the confirmation modal
        confirmationModal.style.display = "flex";
        confirmDeleteBtn.focus();

        confirmDeleteBtn.onclick = () => {
            deleteTodoItem(todoIndex);
            confirmationModal.style.display = "none";
        };

        cancelDeleteBtn.onclick = () => {
            confirmationModal.style.display = "none";
        };
    }
});

  checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos();
      updateTodoTextStyle(todo, todoLI);
      updateTodoList();
  });

  updateTodoTextStyle(todo, todoLI);

  return todoLI;
}


// text based on completion status
function updateTodoTextStyle(todo, todoLI) {
    const todoTextElement = todoLI.querySelector(".text");
    if (todo.completed) {
        todoTextElement.style.textDecoration = "line-through";
        todoTextElement.style.color = "var(--color-secondary)";
    } else {
        todoTextElement.style.textDecoration = "none";
        todoTextElement.style.color = "var(--color-text)";
    }
}


function deleteTodoItem(todoIndex) {
  allTodos = allTodos.filter((_, index) => index !== todoIndex);
  saveTodos();
  updateTodoList();
}


function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(allTodos));
}


function getTodos() {
  const todos = localStorage.getItem("todos");
  return todos ? JSON.parse(todos) : [];
}