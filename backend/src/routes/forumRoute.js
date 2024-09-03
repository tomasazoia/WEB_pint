const express = require('express');
const router = express.Router();
const createForum = require('../controllers/forumController');

router.post('/create', createForum.addForum);
router.get('/list', createForum.listarForums);
router.delete('/delete/:idForum', createForum.deleteForum);
router.get('/area/:id', createForum.listarForumsPorArea);
router.get('/get/:id', createForum.forumDetail);

module.exports = router;