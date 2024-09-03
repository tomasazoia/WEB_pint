const express = require('express');
const albumFotosController = require('../controllers/albumFotosController');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/create', upload.single('foto'), albumFotosController.addAlbum);
router.get('/list', albumFotosController.listarAlbums);
router.get('/evento/:id', albumFotosController.albumDoEvento);
router.delete('/delete/:id', albumFotosController.deleteFoto)

module.exports = router;