const express = require('express');
const router = express.Router();
const Message = require('./../models/Message');
const authMiddleware = require('./../authMiddleware');

router.get('/unread/senders', authMiddleware, async (req, res) => {
  const myUserId = req.jwtDecodedValue?.id;
  if (!myUserId) {
    return res.status(401).json({ data: 'You are not authorized. Login again' });
  }

  try {
    const unreadSenderIds = await Message.distinct('senderId', {
      receiverId: myUserId,
      read: false,
    });
    res.status(200).json(unreadSenderIds);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post('/:otherUserId/markRead', authMiddleware, async (req, res) => {
  const myUserId = req.jwtDecodedValue?.id;
  if (!myUserId) {
    return res.status(401).json({ data: 'You are not authorized. Login again' });
  }

  const { otherUserId } = req.params;
  try {
    await Message.updateMany(
      { senderId: otherUserId, receiverId: myUserId, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ data: 'ok' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

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
