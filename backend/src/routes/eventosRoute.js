const express = require('express');
const router = express.Router();
const eventoRoute = require('../controllers/eventosController');

const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/user/:userId/:centro', eventoRoute.listEventosByUserCentro);
router.post('/create', upload.single('foto'), eventoRoute.createEvento);
router.post('/createmob', upload.single('foto'), eventoRoute.createEventoMobile);
router.get('/list', eventoRoute.listEventos);
router.get('/listdispcal/:userId', eventoRoute.listEventosDispCentroCal);
router.put('/update/:id', upload.single('foto'),eventoRoute.updateEvento);
router.get('/listdisp', eventoRoute.listEventosDisp);
router.get('/listarea/:id', eventoRoute.listEventosByArea);
router.get('/listdisp/:userId', eventoRoute.listEventosDispCentro);
router.delete('/delete/:id', eventoRoute.deleteEvento);
router.get('/get/:id', eventoRoute.eventoDetail);
router.get('/criador/eventos/:ID_CRIADOR', eventoRoute.listarEventosCriador);
router.get('/subarea/:subAreaId/user/:userId', eventoRoute.listEventosBySubArea);
router.get('/eventos-by-area', eventoRoute.eventos_por_area);

module.exports = router;