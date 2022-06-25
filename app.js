require('dotenv').config();
const express = require('express');
const _ = require('lodash');
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

const daysOfWeek = [
  'Sunday,',
  'Monday,',
  'Tuesday,',
  'Wednesday,',
  'Thursday,',
  'Friday,',
  'Saturday,',
];

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

const listSchema = new Schema({
  name: String,
  lists: [todolistSchema],
});

const List = model('List', listSchema);

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
    const { todo, listTitle } = req.body;

    if (daysOfWeek.includes(listTitle)) {
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
    } else {
      List.findOne({ name: listTitle }, (err, foundList) => {
        if (err) {
          console.log(err);
        } else {
          const newCustomItem = new List({
            name: todo,
          });
          foundList.lists.push(newCustomItem);
          foundList.save((err) => {
            if (err) {
              console.log(err);
            } else {
              res.redirect('/' + listTitle);
            }
          });
        }
      });
    }
  });

app.get('/:customList', (req, res) => {
  let { customList } = req.params;
  customList = _.capitalize(customList);
  List.findOne({ name: customList }, (err, foundList) => {
    if (err) {
      console.log(err);
    } else {
      if (!foundList) {
        const newCustomList = new List({
          name: customList,
          lists: todos,
        });
        newCustomList.save((err) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect('/' + customList);
          }
        });
      } else {
        res.render('list', {
          listTitle: foundList.name,
          items: foundList.lists,
        });
      }
    }
  });
});

app.post('/delete', (req, res) => {
  let { todoId, listTitle } = req.body;
  listTitle = listTitle.split(' ')[0];

  if (daysOfWeek.includes(listTitle)) {
    Todo.findByIdAndDelete(todoId, (err, deletedTodo) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listTitle },
      { $pull: { lists: { _id: todoId } } },
      (err, updatedList) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/' + listTitle);
        }
      }
    );
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
