const express = require('express'); 
const router = express.Router();
const localRoute = require('../controllers/locaisController');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/create', upload.single('foto'), localRoute.createLocal);
router.post('/createmob', upload.single('foto'), localRoute.createLocalMobile);
router.get('/user/:userId/centro', localRoute.listLocaisByUserCentro);
router.get('/invalid/user/:userId/centro', localRoute.listLocaisByUserCentroInvalid);
router.get('/list', localRoute.listLocais);
router.get('/listvalidados', localRoute.listLocaisValidados);
router.put('/edit/:id', localRoute.updateLocal);
router.get('/get/:id', localRoute.getLocalById);
router.delete('/delete/:id', localRoute.deleteLocal);
router.get('/listarea/:id', localRoute.listLocaisByArea_);
router.get('/area/:id/user/:userId', localRoute.listLocaisByArea);
router.get('/subarea/:id/user/:userId', localRoute.listLocaisBySubArea);
router.get('/locals-by-area', localRoute.locais_por_area);
router.put('/validate/:id', localRoute.validateLocal);
router.put('/invalidate/:id', localRoute.invalidateLocal);

module.exports = router;