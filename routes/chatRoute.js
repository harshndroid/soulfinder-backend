const express = require('express');
const router = express.Router();
const Message = require('./../models/Message');
const authMiddleware = require('./../authMiddleware');

router.get('/:otherUserId', authMiddleware, async (req, res) => {
  const myUserId = req.jwtDecodedValue?.id;
  if (!myUserId) {
    return res.status(401).json({ data: 'You are not authorized. Login again' });
  }

  const { otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: myUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
