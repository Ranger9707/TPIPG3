import express from 'express';
import UsuariosControlador from '../../controllers/usuariosControlador.js';
import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const usuariosControlador = new UsuariosControlador();
const router = express.Router();

// Admin (1)
router.post('/', 
    autorizarUsuarios([1]),
    [
        check('nombre', 'El nombre es requerido.').notEmpty(),
        check('apellido', 'El apellido es requerido.').notEmpty(),
        check('nombre_usuario', 'El email (nombre_usuario) es requerido.').isEmail(),
        check('contrasenia', 'La contraseña es requerida (mín 6 caracteres).').isLength({ min: 6 }),
        check('tipo_usuario', 'El tipo_usuario es requerido (1, 2 o 3).').isInt({ min: 1, max: 3 }),
        validarCampo    
    ],
    usuariosControlador.crear);

router.put('/:usuario_id', 
    autorizarUsuarios([1]),
    [
        check('nombre_usuario').optional().isEmail().withMessage('El email (nombre_usuario) es inválido.'),
        check('contrasenia').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener mín 6 caracteres.'),
        check('tipo_usuario').optional().isInt({ min: 1, max: 3 }).withMessage('El tipo_usuario debe ser 1, 2 o 3.'),
        validarCampo
    ],
    usuariosControlador.editar);

router.delete('/:usuario_id', 
    autorizarUsuarios([1]), 
    usuariosControlador.eliminar);

router.get('/:usuario_id', 
    autorizarUsuarios([1]), 
    usuariosControlador.buscarPorId);

// Admin (1), Empleado (2)
router.get('/', 
    autorizarUsuarios([1, 2]), 
    usuariosControlador.buscarTodos);

export { router };