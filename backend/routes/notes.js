const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');

// Add new notes using: post "/api/auth/addnote" . login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter Valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast min 5 characters').isLength({ min: 5 })
], async (req, res) => {
    try {

        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const saveNote = await note.save();
        res.json(saveNote);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

// Get all the notes using: get "/api/notes/fetchallnotes" . login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {

        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

// Update all the notes using: put "/api/notes/fetchallnotes" . login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body;
    //create a newNote object
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };

    //Find the note to be updated and update its
    let note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("not found") };

    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({note});
});


// Delete all the notes using: DELETE "/api/notes/deletenote" . login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    // const { title, description, tag } = req.body;
    
    //Find the note to be delete and delete its
    let note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("not found") };

    //Allow deletion only if users owns this note
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({"Success":"Notes has been deleted", note:note});
});

module.exports = router;