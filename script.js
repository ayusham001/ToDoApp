const btn = document.getElementById('btn');
const ip = document.getElementById('ip');
const prioritySelector = document.getElementById('prioritySelector');
const pass = document.getElementById('password');
const cpass = document.getElementById('confirm-password');
const form = document.getElementById('form');



function fetchAndDisplayTasks() {
    fetch("/todo-data")
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Something went wrong with the request");
            }
        })
        .then((todos) => {
            const taskListDiv = document.getElementById("taskList");
            taskListDiv.innerHTML = ""; // Clear the previous task list

            todos.forEach((todo) => {
                showTodoInUI(todo);
            });
        })
        .catch((err) => {
            console.log(err);
        });
}


document.getElementById("taskForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const taskInput = document.getElementById("ip").value;
    const imageInput = document.getElementById("task_pic").files[0];

    const formData = new FormData();
    formData.append("task", taskInput);
    formData.append("image", imageInput);

    fetch("/todo", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Task submitted successfully:", data);
            // Fetch and display updated task list
            fetchAndDisplayTasks(); form.reset();
        })
        .catch((error) => {
            console.error("Error submitting task:", error);
        });
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
        fetch('/todo/delete', {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(todo),
        })
            .then((response) => {
                if (response.ok) {
                    // If the response status is in the range 200-299, it means success
                    console.log("Todo deleted successfully.");
                    // Remove the todoDiv from the DOM after the server successfully deletes the todo
                    todoDiv.remove();
                } else {
                    console.log("Failed to delete todo.");
                }
            })
            .catch((err) => {
                console.error("Error deleting todo:", err);
            });
    });



    const imagediv = document.createElement("div");
    imagediv.classList.add("imagediv");
    const todoImageNode = document.createElement("img");
    todoImageNode.src = todo.image;
    todoImageNode.alt = todo.text; // Set alt text for accessibility
    todoImageNode.classList.add("todo-image");
    
    taskListDiv.appendChild(todoTextNode);
    imagediv.appendChild(todoImageNode);
    taskActionDiv.appendChild(checkboxInput);
    taskActionDiv.appendChild(deleteButton);

    todoDiv.appendChild(taskListDiv);
    todoDiv.appendChild(imagediv);
    todoDiv.appendChild(taskActionDiv);

    // Assuming you have a container with class 'task-container' in your HTML
    const taskContainer = document.querySelector(".tasks");
    taskContainer.appendChild(todoDiv); // Changed the selector here
}



fetch("/todo-data")
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Something went wrong with the request");
        }
    })
    .then((todos) => {
        todos.forEach((todo) => {
            showTodoInUI(todo);
        });
    })
    .catch((err) => {
        console.log(err);
    });

function updateTodoStatus(todo) {
    fetch('/todo/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to update todo status');
            }
            console.log('Todo status updated successfully.');
        })
        .catch((error) => {
            console.error('Error updating todo status:', error);
        });
}