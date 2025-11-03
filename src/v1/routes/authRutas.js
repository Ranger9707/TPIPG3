import express from 'express';
import AuthController from '../../controllers/authControlador.js';
import {check} from 'express-validator';
import {validarCampo} from '../../middlewares/validarCampo.js';

const router = express.Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Rutas relacionadas con el inicio de sesión y autenticación de usuarios
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión en el sistema
 *     tags: [Autenticación]
 *     description: Verifica las credenciales del usuario y devuelve un token JWT válido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - contrasenia
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: admin@ejemplo.com
 *               contrasenia:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token JWT
 *       400:
 *         description: Campos faltantes o inválidos
 *       401:
 *         description: Credenciales incorrectas
 */

router.post('/login', [
    check('nombre_usuario', 'El correo electrónico es requerido!').not().isEmpty(),
    check('nombre_usuario', 'Revisar el formato del correo electrónico!').isEmail(),
    check('nombre_usuario').notEmpty().withMessage('El nombre de usuario es obligatorio'),
    check('contrasenia').notEmpty().withMessage('La contraseña es obligatoria'),
    validarCampo
], authController.login);


export {router};

