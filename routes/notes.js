const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Auth error' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(500).json({ message: 'Invalid token' });
  }
};

// Create a new note
router.post('/', verifyToken, async (req, res) => {
  const { content } = req.body;
  try {
    const newNote = new Note({
      userId: req.user.userId,
      content
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notes for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note
router.put('/:id', verifyToken, async (req, res) => {
  const { content } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (note.userId.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    note.content = content;
    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (note.userId.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await note.remove();
    res.status(200).json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;