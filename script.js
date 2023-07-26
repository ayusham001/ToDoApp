const btn = document.getElementById('btn');
const ip = document.getElementById('ip');
const prioritySelector = document.getElementById('prioritySelector');

btn.addEventListener('click', () => {
    const todotext = ip.value;
    const priorityValue = prioritySelector.value;
    console.log(todotext);
    ip.value = '';

    if (!todotext || !priorityValue) {
        alert('Enter a ToDo or select priority');
        return;
    }

    const todo = {
        text: todotext,
        priority: priorityValue,
        status: "in progress"
    }

    fetch('/todo', {
        method: "Post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    }).then((response) => {
        if (response.status === 200) {
            // display todo in UI
            showTodoInUI(todo);
        } else {
            alert("something weird happened");
        }
    }).catch((err) => { console.log(err) });
});


function showTodoInUI(todo) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("task");

    const taskListDiv = document.createElement("div");
    taskListDiv.classList.add("task-list");

    const todoTextNode = document.createElement("p");
    todoTextNode.innerText = todo.text; // Corrected property name
    if (todo.status === "done") {
        todoTextNode.style.textDecoration = "line-through"; // Apply "line-through" style for completed tasks
      }

    const taskActionDiv = document.createElement("div");
    taskActionDiv.classList.add("task-action");

    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.checked = todo.status === "done"; // Set the checkbox state based on the todo status

    checkboxInput.addEventListener("change", () => {
      todo.status = checkboxInput.checked ? "done" : "in progress"; // Update the status property based on checkbox state
      updateTodoStatus(todo); // Send the updated todo to the server to save the status change

      if (checkboxInput.checked) {
        todoTextNode.style.textDecoration = "line-through"; // Apply "line-through" style for completed tasks
      } else {
        todoTextNode.style.textDecoration = "none"; // Remove "line-through" style for in-progress tasks
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "X";
    deleteButton.id = "delete";

    deleteButton.addEventListener("click", () => {
        todoDiv.remove();
        fetch('/todo/delete', {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(todo),
        }).then((response) => {
            if (response.status === 200) {
                console.log("Todo deleted successfully.");
            } else {
                console.log("Failed to delete todo.");
            }
        }).catch((err) => {
            console.log(err);
        });
    });
    


    const priorityNode = document.createElement("span");
    priorityNode.innerText = todo.priority;
    priorityNode.style.color='red';

    taskListDiv.appendChild(todoTextNode);
    taskListDiv.appendChild(priorityNode);
    taskActionDiv.appendChild(checkboxInput);
    taskActionDiv.appendChild(deleteButton);

    todoDiv.appendChild(taskListDiv);
    todoDiv.appendChild(taskActionDiv);

    // Assuming you have a container with class 'task-container' in your HTML
    const taskContainer = document.querySelector(".tasks");
    taskContainer.appendChild(todoDiv); // Changed the selector here
}


fetch("/todo-data")
    .then(function (response) {
        if (response.status === 200) {
            return response.json();
        } else {
            alert("something weird happened");
        }
    })
    .then(function (todos) {
        todos.forEach(function (todo) {
            showTodoInUI(todo);
        });
    });

    function updateTodoStatus(todo) {
        fetch('/todo/update', {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(todo),
        }).then((response) => {
          if (response.status === 200) {
            console.log("Todo status updated successfully.");
          } else {
            console.log("Failed to update todo status.");
          }
        }).catch((err) => {
          console.log(err);
        });
    }