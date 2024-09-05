const express = require('express');
const router = express.Router();
const { listarUsers, listarUsersValidados, listarUsersNaoValidados, getLoggedUser, updateUser, deleteUser, listarUsersPorCentro,listarUsersByStartDate, getUserById, validarUser,updateUserCentro, invalidarUser, promoverParaAdministrador, despromoverParaAdministrador, deleteUser1 } = require('../controllers/utilizadorController');

router.get('/list', listarUsers);
router.get('/listvalidados/:userId', listarUsersValidados);
router.get('/listnaovalidados/:userId', listarUsersNaoValidados);
router.get('/profile', getLoggedUser);
router.put('/profileup', updateUser);
router.delete('/delete/:id', deleteUser);
router.get('/users-by-center', listarUsersPorCentro);
router.get('/users-by-start-date', listarUsersByStartDate)
router.get('/:id', getUserById);
router.put('/validar/:id', validarUser);
router.put('/invalidar/:id', invalidarUser);
router.put('/admin/:id', promoverParaAdministrador);
router.put('/updateCentro', updateUserCentro);
router.put('/unadmin/:id', despromoverParaAdministrador);
router.delete('/delete1/:id', deleteUser1);

module.exports = router;