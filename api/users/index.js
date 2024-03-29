import express from 'express';
import User from './userModel';
import jwt from 'jsonwebtoken';
import movieModel from '../movies/movieModel';
import upcomingModel from '../upcomingMovies/upcomingModel';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', (req, res, next) => {
  User.find().then(users => res.status(200).json(users)).catch(next);
});

// Register OR authenticate a user
router.post('/', async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(401).json({
      success: false,
      msg: 'Please pass username and password.',
    });
  }
  if (req.query.action === 'register') {
    const regularExpression = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
    if (regularExpression.test(req.body.password)) {
      await User.create(req.body).catch(next);
      res.status(201).json({
        code: 201,
        msg: 'Successful created new user.',
      });
    } else {
      res.status(401).json({
        code: 401,
        msg: 'The password is too simple'
      });
    }
  } else {
    const user = await User.findByUserName(req.body.username).catch(next);
    if (!user) return res.status(401).json({ code: 401, msg: 'Authentication failed. User not found.' });
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch && !err) {
        // if user is found and password is right create a token
        const token = jwt.sign(user.username, process.env.SECRET);
        // return the information including token as JSON
        res.status(200).json({
          success: true,
          token: 'BEARER ' + token,
        });
      } else {
        res.status(401).json({
          code: 401,
          msg: 'Authentication failed. Wrong password.'
        });
      }
    });
  }
});

// Update a user
router.put('/:id', (req, res, next) => {
  if (req.body._id) delete req.body._id;
  User.update({
    _id: req.params.id,
  }, req.body, {
    upsert: false,
  })
    .then(user => res.json(200, user)).catch(next);
});

//Add a favourite. No Error Handling Yet. Can add duplicates too!
// eslint-disable-next-line no-unused-vars

router.post('/:userName/favourites', async (req, res, next) => {
  try {
    const newFavourite = req.body.id;
    const userName = req.params.userName;
    const movie = await movieModel.findByMovieDBId(newFavourite);
    const user = await User.findByUserName(userName);
    if (user.favourites.includes(movie._id)) {
      res.status(401).json({
        code: 401,
        msg: 'The movie has appeared'
      });
    }
    else {
      await user.favourites.push(movie._id);
      await user.save();
      res.status(201).json(user);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/:userName/watchlist',async (req, res, next) => {
  const newWatchList =req.body.id;
  const userName = req.params.userName;
  const movie = await upcomingModel.findByMovieDBId(newWatchList);
  const user = await User.findByUserName(userName);
  if(user.watchList.includes(movie._id)){
    res.status(401).json({
      code: 401,
      msg: 'The movie has appeared'
    });
  }
  else{
   await user.watchList.push(movie._id);
   await user.save();
   res.status(201).json(user); 
  }
});

router.get('/:userName/favourites', (req, res, next) => {
  const userName = req.params.userName;
  User.findByUserName(userName).populate('favourites').then(
    user => res.status(201).json(user.favourites),
  ).catch(next);
});

router.get('/:userName/watchlist', (req, res, next) => {
  const userName = req.params.userName;
  User.findByUserName(userName).populate('watchlist').then(
    user => res.status(201).json(user.watchList)
  ).catch(next);
});

export default router;
