const express = require('express');
const sha256 = require('js-sha256');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// App configuration
app.use(express.json());
app.use(express.static(path.join()));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

// Data import
const data = require('./data');

const { users } = data;
const { schedules } = data;

// Welcome
app.get('/', (req, res) => {
  res.render('msg', { msg: 'Welcome to our schedule website' });
});

// Displays users
app.get('/users', (req, res) => {
  res.render('all-users', {
    users,
  });
});

// Displays schedules
app.get('/schedules', (req, res) => {
  res.render('all-schedules', {
    users,
    schedules,
  });
});

// Adds new user
app.get('/users/new', (req, res) => {
  res.render('add-user', {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });
});

app.post('/users', (req, res) => {
  const newUser = ({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
  });

  newUser.password = sha256(newUser.password);
  users.push(newUser);
  res.render('one-user', newUser);
});

// Adds new schedule
app.get('/schedules/new', (req, res) => {
  const names = [];
  for (const one of users) {
    names.push(`${one.firstname} ${one.lastname}`);
  }
  res.render('add-schedule', {
    names,
    day: '',
    start: '',
    end: '',
  });
});

app.post('/schedules', (req, res) => {
  const { name } = req.body;
  const separatedName = name.split(' ');
  const firstname = separatedName[0];
  const lastname = separatedName[1];

  function checkUser() {
    for (let i = 0; i < users.length; i = +1) {
      if (users[i].firstname === firstname && users[i].lastname === lastname) {
        return i;
      }
    }
  }

  const userId = checkUser(firstname, lastname);

  const newSchedule = ({
    user_id: userId,
    day: parseInt(req.body.day, 10),
    start_at: req.body.start,
    end_at: req.body.end,
  });

  schedules.push(newSchedule);

  res.render('one-schedules-added', {
    firstname,
    lastname,
    day: newSchedule.day,
    start_at: newSchedule.start_at,
    end_at: newSchedule.end_at,
  });
});

// Displays one user
app.get('/users/:usersId', (req, res) => {
  const usersId = parseInt(req.params.usersId, 10);

  if (usersId > (users.length - 1) || usersId < 0) {
    res.status(404).render('msg', { msg: `There is no user with id: ${usersId}` });
    return;
  }

  const user = users[usersId];
  res.render(
    'one-user',
    {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
    },
  );
});

// Displays schedule for one user
app.get('/users/:usersId/schedules', (req, res) => {
  const usersId = parseInt(req.params.usersId, 10);

  const user = users[usersId];

  function scheduleForUser(timetable) {
    const schedule = [];
    for (const x in timetable) {
      if (timetable[x].user_id === usersId) {
        schedule.push(schedules[x]);
      }
    }
    return (schedule);
  }

  const schedule = scheduleForUser(schedules);

  if (usersId > (users.length - 1) || usersId < 0) {
    res.status(404).render('msg', { msg: `There is no user with id: ${usersId}` });
    return;
  }

  if (schedule.length === 0) {
    res.status(404).render('msg', { msg: `There is no schedule for user with id: ${usersId}` });
    return;
  }

  res.render('one-schedule', {
    firstname: user.firstname,
    lastname: user.lastname,
    schedule,
  });
});

app.listen(port, () => {
  console.log(`Server up&running: http://localhost:${port}`);
});
