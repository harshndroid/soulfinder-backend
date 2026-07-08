const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const authMiddleware = require('./../authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const requestingUserId = req.jwtDecodedValue?.id;
    const requestingUser = requestingUserId
      ? await User.findById(requestingUserId)
      : null;
    const blockedByMe = requestingUser?.blockedUserIds || [];

    const data = await User.find();
    const visibleUsers = data.filter((user) => {
      if (blockedByMe.includes(user.id)) return false;
      if (user.blockedUserIds?.includes(requestingUserId)) return false;
      return true;
    });

    res.status(200).json(visibleUsers);
  } catch (error) {
    res.status(404).json({ error });
  }
});

module.exports = router;
