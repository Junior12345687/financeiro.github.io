const express = require('express');
const controller = require('../controllers/controller');
// const rateLimit = require('express-rate-limit');
const router = express.Router();


router.post('/login', controller.login);
router.post('/cadastro', controller.cadastro);
router.post('/', controller.listar);

module.exports = router;