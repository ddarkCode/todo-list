require('dotenv').config();
const express = require('express');
const { connect, model, Schema } = require('mongoose');

const day = require('./date')();

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log('Database Connected');
  }
);

const todolistSchema = new Schema({
  name: String,
});

const Todo = model('Todo', todolistSchema);

const item1 = new Todo({
  name: 'Welcome to your todolist',
});
const item2 = new Todo({
  name: 'Hit the + button to add new item',
});
const item3 = new Todo({
  name: '<-- Hit this to delete an item.',
});

const todos = [item1, item2, item3];

app
  .route('/')
  .get((req, res) => {
    Todo.find((err, foundTodos) => {
      if (err) {
        console.log(err);
      } else {
        if (foundTodos.length === 0) {
          Todo.insertMany(todos, function (err, insertedTodos) {
            if (err) {
              console.log(err);
            } else {
              console.log(insertedTodos);
              res.redirect('/');
            }
          });
        } else {
          res.render('list', { listTitle: day, items: foundTodos });
        }
      }
    });
  })
  .post((req, res) => {
    console.log(req.body);
    const { todo } = req.body;
    const newTodo = new Todo({
      name: todo,
    });
    newTodo.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  });

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
