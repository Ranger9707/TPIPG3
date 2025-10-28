import express from 'express';
import AuthController from '../../controllers/authControlador';
import {check} from 'express-validator';
import {validarCampo} from '../../middlewares/validarCampo.js';

const router = express.Router();
const authController = new AuthController();

router.post('/login', [
    check('nombre_usuario', 'El correo electrónico es requerido!').not().isEmpty(),
    check('nombre_usuario', 'Revisar el formato del correo electrónico!').isEmail(),
    check('nombre_usuario').notEmpty().withMessage('El nombre de usuario es obligatorio'),
    check('contrasenia').notEmpty().withMessage('La contraseña es obligatoria'),
    validarCampo
], authController.login);


export default {router};
