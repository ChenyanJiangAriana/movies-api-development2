import dotenv from 'dotenv';
import express from 'express';
import moviesRouter from './api/movies';
import bodyParser from 'body-parser';
import './db';  
import usersRouter from './api/users';
import genresRouter from './api/genres';
import session from 'express-session';
import passport from './authenticate';
import loglevel from 'loglevel';
import {loadUsers, loadMovies, loadUpcomingMovies, loadNowplayingMovies} from './seedData';
import usersRouter from './api/users';
import upcomingRouter from './api/upcomingMovies';
import nowplayingRouter from './api/nowplayingMovies';

dotenv.config();

if (process.env.NODE_ENV === 'test') {
  loglevel.setLevel('warn')
} else {
  loglevel.setLevel('info')
}

if (process.env.SEED_DB === 'true') {
  loadMovies();
  loadUsers();
  loadUpcomingMovies();
  loadNowplayingMovies();
}
const app = express();

const port = process.env.PORT;

if (process.env.SEED_DB) {
  loadUsers();
  loadMovies();
}

const errHandler = (err, req, res, next) => {
  /* if the error in development then send stack trace to display whole error,
  if it's in production then just send error message  */
  if(process.env.NODE_ENV === 'production') {
    return res.status(500).send(`Something went wrong!`);
  }
  res.status(500).send(`Hey!! You caught the error 👍👍, ${err.stack} `);
};

app.use(passport.initialize());
//configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(session({
  secret: 'ilikecake',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static('public'));
// initialise passport​
app.use(passport.initialize());
// Add passport.authenticate(..)  to middleware stack for protected routes​
app.use('/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);
app.use('/api/upcomingMovies',passport.authenticate('jwt', {session: false}), upcomingRouter);
app.use('/api/nowplayingMovies', passport.authenticate('jwt', {session: false}), nowplayingRouter);
app.use('/api/users', usersRouter);
app.use('/api/genres', genresRouter) 

app.use(errHandler);

app.listen(port, () => {
  console.info(`Server running at ${port}`);
});

export default app;