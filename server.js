const express = require('express');
const session = require('express-session');
const app = express();
const fs = require('fs');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const path = require('path')
const db = require("./models/db")
const UserModel = require('./models/Users');
const TodoSchema = require('./models/Todo')

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

app.put('/todo/update', (req, res) => {
  const updatedTodo = req.body;
  const utask = updatedTodo.text
  const ustatus = updatedTodo.status
  TodoSchema.updateOne({ text: utask }, { $set: { status: ustatus } })
    .then(() => {
      res.status(200).send("Todo status updated successfully");
    })
    .catch(() => {
      res.status(500).send("Error updating todo status");
    })

});


app.delete('/todo/delete', (req, res) => {
  const todoToDelete = req.body;
  const utask = todoToDelete.text;
  const uimage = todoToDelete.image;
  TodoSchema.deleteOne({ text: utask })
    .then(() => {
      fs.unlinkSync(`./public/${uimage}`);
      res.status(200).send("Todo deleted successfully");
    })
    .catch(() => {
      res.status(500).send("Error deleting todo");
    })
});


app.get('/', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login", { error: null })
    return;
  }
  const user = req.session.user.name
  const pic = req.session.user.profilePic;
  res.render("index", { name: user, pic: pic })
});


app.get('/about', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login", { error: null })
    return;
  }
  const user = req.session.user.name
  const pic = req.session.user.profilePic
  res.render("about", { name: user, pic: pic })
});

app.get('/contact', (req, res) => {
  if (!req.session.isLoggedIn) {
    res.render("login", { error: null })
    return;
  }
  const user = req.session.user.name
  const pic = req.session.user.profilePic
  res.render("contact", { name: user, pic: pic })
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  UserModel.findOne({ username: username, password: password })
    .then((user) => {
      if (user) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        res.redirect('/');
        return;
      } else {
        res.render('login', { error: 'Enter valid credentials' });
      }
    }).catch((err) => {
      res.render('login', { error: 'Something went wrong' });
    })
});

app.get('/login', (req, res) => {
  res.render("login", { error: null })
})

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(er)
    }
    else {
      res.render("login", { error: null })
    }
  })
})

app.get('/signup', (req, res) => {
  res.render('signup', { error: null })
})

function isUserExisting(username, email) {
  return UserModel.exists({ $or: [{ username }, { email }] });
}

app.post('/signup', upload.single('pic'), async (req, res) => {
  const { username, password, name, email } = req.body;
  const pic = req.file;
  const profilePic = pic.filename;

  try {
    const userExists = await isUserExisting(username, email);
    if (userExists) {
      res.render('signup', { error: "User with same username or email already exists" });
    } else {
      const newUser = { username, password, name, email, profilePic };
      await UserModel.create(newUser);
      res.render('login', { error: "Account created successfully!!!!" });
    }
  } catch (err) {
    console.log(err);
    res.render('signup', { error: "Account creation failed" });
  }
});

app.get('/script.js', (req, res) => {
  res.sendFile(__dirname + '/script.js');
});

app.get("/todo-data", function (req, res) {

  TodoSchema.find({}).then((todos) => {
    if (todos) {
      res.status(200).send(JSON.stringify(todos));
      return;
    }
    else {
      res.status(404).send("No todos found");
    }
  });
});

app.post("/todo", taskImageUpload.single("image"), (req, res) => {
  const taskInput = req.body.task;
  const imageFilePath = req.file ? req.file.filename : null;

  const todo = {
    text: taskInput,
    image: imageFilePath,
    status: "in progress",
  };

  TodoSchema.create(todo).then(() => {
    res.status(200).json({ message: "Task submitted successfully" });
  }).catch((err) => {
    res.status(500).json({ error: "Error saving task" });
    return;
  })
});

db.init().then(() => {
  console.log("db connected")
  app.listen(3000, () => {
    console.log('server started at 3000');
  })
}).catch((err) => {
  console.log(err)
})