const express = require('express');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

let todos = ['Buy Food', 'Cook Food', 'Eat Food'];

app.get('/', (req, res) => {
  const today = new Date();
  const options = {
    day: 'numeric',
    weekday: 'long',
    month: 'long',
  };
  console.log(options);
  const day = today.toLocaleDateString('en-US', options);
  res.render('list', { day, todos });
});

app.post('/', (req, res) => {
  const { todo } = req.body;
  todos = todos.concat(todo);
  res.redirect('/');
});

app.listen(5000, () => console.log('Server is running on port 5000'));
