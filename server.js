const express = require('express');
const session = require('express-session');
const app = express();
const fs = require('fs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'helloboss',
    resave: false,
    saveUninitialized: true,
  })
)


const users = [];

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
  if (!req.session.isLoggedIn) {
    res.redirect("/login")
    return;
  }
  fs.readFile(__dirname + '/index.html', 'utf8', (err, content) => {
    if (err) {
      console.error('Error reading the index.html file:', err);
      res.sendStatus(500);
      return;
    }

    const user = req.session.user;
    const renderedContent = content.replace('{{name}}', user.name);

    // Send the modified content as the response
    res.send(renderedContent);
  });
});


app.get('/about', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login")
    return;
  }
  res.sendFile(__dirname + '/about.html');
});

app.get('/contact', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login")
    return;
  }
  res.sendFile(__dirname + '/contact.html');
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Read user data from users.json file
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading users.json:', err);
      res.redirect('/login');
      return;
    }

    const users = JSON.parse(data);
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect('/');
      return;
    } else {
      res.redirect('/login?error=1');
    }
  });
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html')
})

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(er)
    }
    else {
      res.redirect('/login');
    }
  })
})

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html')
})


app.post('/signup', (req, res) => {
  const { username, password, name, email } = req.body;

  // Read the users.json file to check for existing users
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading users.json:', err);
      res.redirect('/login');
      return;
    }

    const existingUsers = JSON.parse(data);

    // Check if a user with the same username or email already exists
    const existingUser = existingUsers.find((user) => user.username === username || user.email === email);
    if (existingUser) {
      // If a user with the same username or email already exists, send an error response
      return res.redirect('/signup?error=1');
      return;
    }

    // If no user with the same username or email exists, proceed with registration
    const newUser = { username, password, name, email };
    existingUsers.push(newUser);

    fs.writeFile('users.json', JSON.stringify(existingUsers), 'utf8', (err) => {
      if (err) {
        console.error('Error saving user data:', err);
      } else {
        console.log('User data saved successfully.');
        // Redirect to login page with a success message as a query parameter
        res.redirect('/login?accountCreated=true');
      }
    });
  });
});


app.get('/script.js', (req, res) => {
  res.sendFile(__dirname + '/script.js');
});

app.get("/todo-data", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.status(401).send('error')
    return;
  }

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
  console.log('server started at 3000');
})