const { error } = require('console');
const express = require('express');
const session = require('express-session');
const app = express();
const fs = require('fs');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const path = require('path')

app.use(express.static('public'))
const taskImageStorage = multer.diskStorage({
  destination: 'public/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});

const taskImageUpload = multer({ storage: taskImageStorage });

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'helloboss',
    resave: false,
    saveUninitialized: true,
  })
)
app.use(express.static('uploads'))

app.set('view engine', 'ejs');

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

    // Find the todo data that needs to be deleted
    const todoIndex = data.findIndex((todo) => todo.text === todoToDelete.text);
    if (todoIndex === -1) {
      res.status(404).send("Todo not found");
      return;
    }

    // Retrieve the image filename from the todo data
    const imageFilename = data[todoIndex].image;

    // Remove the todo from the data array
    const deletedTodo = data.splice(todoIndex, 1)[0];

    fs.writeFile("data.json", JSON.stringify(data), function (err) {
      if (err) {
        res.status(500).send("Error deleting todo");
        return;
      }

      // If an image exists, delete the image file from the 'public' folder
      if (imageFilename) {
        const imagePath = path.join(__dirname, 'public', imageFilename);
        try {
          fs.unlinkSync(imagePath);
          console.log("Image deleted:", imageFilename);
        } catch (err) {
          console.error("Error deleting image:", err);
        }
      }

      res.status(200).send("Todo deleted successfully");
    });
  });
});


app.get('/', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login",{error:null})
    return;
  }
  const user=req.session.user.name
  const pic=req.session.user.pic.filename
  res.render("index",{name:user,pic:pic})
});


app.get('/about', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login",{error:null})
    return;
  }
  const user=req.session.user.name
  const pic=req.session.user.pic.filename
  res.render("about",{name:user,pic:pic})
});

app.get('/contact', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login",{error:null})
    return;
  }
  const user=req.session.user.name
  const pic=req.session.user.pic.filename
  res.render("contact",{name:user,pic:pic})
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Read user data from users.json file
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading users.json:', err);
      res.render('login',{error:null});
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
      res.render('login',{error:'Enter valid credentials'});
    }
  });
});

app.get('/login', (req, res) => {
  res.render("login",{error:null})
})

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(er)
    }
    else {
      res.render("login",{error:null})
    }
  })
})

app.get('/signup', (req, res) => {
  res.render('signup',{error:null})
})


app.post('/signup',upload.single('pic'), (req, res) => {
  const { username, password, name, email } = req.body;
  const pic =req.file;
  console.log(req.file);

  // Read the users.json file to check for existing users
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading users.json:', err);
      res.render("login")
      return;
    }

    const existingUsers = JSON.parse(data);

    // Check if a user with the same username or email already exists
    const existingUser = existingUsers.find((user) => user.username === username || user.email === email);
    if (existingUser) {
      // If a user with the same username or email already exists, send an error response
      return res.render('signup',{error:'User with same username or email already exist!'})
    }

    // If no user with the same username or email exists, proceed with registration
    const newUser = { username, password, name, email, pic };
    existingUsers.push(newUser);

    fs.writeFile('users.json', JSON.stringify(existingUsers), 'utf8', (err) => {
      if (err) {
        console.error('Error saving user data:', err);
      } else {
        console.log('User data saved successfully.');
        // Redirect to login page with a success message as a query parameter
        res.render('login',{error:null});
      }
    });
  });
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

    res.status(200).send(JSON?.stringify(data));
    // res.status(200).json(data);
  });
});

app.post("/todo", taskImageUpload.single("image"), (req, res) => {
  const taskInput = req.body.task;
  const imageFilePath = req.file ? req.file.filename : null; // Use filename instead of path

  const todo = {
    text: taskInput,
    image: imageFilePath,
    status: "in progress",
  };

  saveTodoInFile(todo, function (err) {
    if (err) {
      res.status(500).json({ error: "Error saving task" });
      return;
    }

    res.status(200).json({ message: "Task submitted successfully" }); // Send the correct response
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

      callback(null); // Pass null as the second argument to indicate success
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