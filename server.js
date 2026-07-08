const express = require('express');
const app = express();

require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const authMiddleware = require('./authMiddleware');

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('./models/User');
const usersRoute = require('./routes/usersRoute');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.post('/googleLogin', async (req, res) => {
  console.log('/googleLogin');
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      existingUser = await new User({ email, name, photoUrl: picture }).save();
      var isNewUser = true;
    } else {
      isNewUser = false;
    }

    const token = jwt.sign({ email, id: existingUser.id }, 'somerandomtext');
    res.status(200).json({
      token,
      email,
      userId: existingUser.id,
      isNewUser,
    });
  } catch (error) {
    console.log('======googleLogin error', error);
    res.status(500).json({ error: 'Google sign-in failed' });
  }
});

app.post('/init', authMiddleware, async (req, res) => {
  console.log('/init', req.body);
  const jwtDecodedValue = req.jwtDecodedValue;
  if (jwtDecodedValue) {
    const id = req.body.id; // mongoose id
    const data = await User.findByIdAndUpdate(
      id,
      { location: req.body.location, lastSeenAt: req.body.lastSeenAt },
      { new: true, runValidators: true }
    );

    const userData = await User.findById(id);

    console.log('====userData', userData);
    res.status(200).json({ data: userData });
  } else res.status(401).json({ data: 'You are not authorized. Login again' });
});

app.post('/updateUserProfile', authMiddleware, async (req, res) => {
  console.log('/updateUserProfile', req.body);
  const jwtDecodedValue = req.jwtDecodedValue;
  if (jwtDecodedValue) {
    const id = jwtDecodedValue.id; // mongoose id
    const data = await User.findByIdAndUpdate(
      id,
      {
        photoUrl: req.body.photoUrl,
        name: req.body.name,
        age: req.body.age,
        bio: req.body.bio,
        currentCity: req.body.currentCity,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({ data });
  } else res.status(401).json({ data: 'You are not authorized. Login again' });
});

app.post('/blockUser', authMiddleware, async (req, res) => {
  console.log('/blockUser', req.body);
  const jwtDecodedValue = req.jwtDecodedValue;
  if (jwtDecodedValue) {
    const id = jwtDecodedValue.id; // mongoose id
    const blockedUserId = req.body.blockedUserId;
    const data = await User.findByIdAndUpdate(
      id,
      { $addToSet: { blockedUserIds: blockedUserId } },
      { new: true, runValidators: true }
    );
    res.status(200).json({ data });
  } else res.status(401).json({ data: 'You are not authorized. Login again' });
});

app.use('/nearbyTravellers', usersRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('server listening at', PORT);
});
