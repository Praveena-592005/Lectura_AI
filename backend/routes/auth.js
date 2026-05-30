import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User records indicate email already occupied' });
    }

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email },
      });
    } else {
      res.status(400).json({ message: 'Invalid registration dataset' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email },
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials trace matched' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;