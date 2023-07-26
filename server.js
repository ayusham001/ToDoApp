const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json())



app.put('/todo/update', (req, res) => {
  const updatedTodo = req.body;

  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("Error reading all todos");
      return;
    }

    // Find the index of the task in the data array based on its text
    const taskIndex = data.findIndex((task) => task.text === updatedTodo.text);

    if (taskIndex !== -1) {
      // If the task is found, update its status
      data[taskIndex].status = updatedTodo.status;
    }

    fs.writeFile("data.json", JSON.stringify(data), function (err) {
      if (err) {
        res.status(500).send("Error updating todo status");
        return;
      }
      res.status(200).send("Todo status updated successfully");
    });
  });
});

app.delete('/todo/delete', (req, res) => {
    const todoToDelete = req.body;
  
    readAllTodos(function (err, data) {
      if (err) {
        res.status(500).send("Error reading all todos");
        return;
      }
  
      // Filter out the task to be deleted
      const filteredData = data.filter((todo) => todo.text !== todoToDelete.text);
  
      fs.writeFile("data.json", JSON.stringify(filteredData), function (err) {
        if (err) {
          res.status(500).send("Error deleting todo");
          return;
        }
        res.status(200).send("Todo deleted successfully");
      });
    });
  });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/about.html');
});

app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/contact.html');
});


app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});
app.get("/todo-data", function (req, res) {
    readAllTodos(function (err, data) {
      if (err) {
        res.status(500).send("error");
        return;
      }
  
      //res.status(200).send(JSON.stringify(data));
      res.status(200).json(data);
    });
  });

app.post('/todo', (req, res) => {
    saveTodoInFile(req.body, function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }

        res.status(200).send("success");
    });
});

function saveTodoInFile(todo, callback) {
    readAllTodos(function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        data.push(todo);

        fs.writeFile("data.json", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }

            callback(null);
        });
    });
}


function readAllTodos(callback) {
    fs.readFile("data.json", "utf-8", function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        if (data.length === 0) {
            data = "[]";
        }

        try {
            data = JSON.parse(data);
            callback(null, data);

        } catch (err) {
            callback(err);
        }
    });
}

app.listen(3000, () => {
    console.log('server started');
})