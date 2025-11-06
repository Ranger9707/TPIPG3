import express from 'express';
import AuthController from '../../controllers/authControlador.js';
import {check} from 'express-validator';
import {validarCampo} from '../../middlewares/validarCampo.js';
import passport from 'passport';
import upload from '../../middlewares/gestionArchivos.js';

const router = express.Router();
const authController = new AuthController();

router.post('/login', [
    check('nombre_usuario', 'El correo electrónico (nombre_usuario) es requerido y debe ser válido.').notEmpty().isEmail(),
    check('contrasenia', 'La contraseña es obligatoria.').notEmpty(),
    validarCampo
], authController.login);

router.get('/me',
  passport.authenticate('jwt', { session: false }), 
  authController.getMiPerfil
);

router.post('/register', 
    upload.single('foto'),
    [
        check('nombre', 'El nombre es requerido.').notEmpty(),
        check('apellido', 'El apellido es requerido.').notEmpty(),
        check('nombre_usuario', 'El email (nombre_usuario) es requerido y debe ser válido.').isEmail(),
        check('contrasenia', 'La contraseña es requerida (mín 6 caracteres).').isLength({ min: 6 }),
        validarCampo    
    ],
    authController.register
);


export {router};
