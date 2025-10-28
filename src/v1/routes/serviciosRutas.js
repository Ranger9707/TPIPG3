import express from 'express';
import ServiciosControlador from '../../controllers/serviciosControlador.js';
import apicache from 'apicache';
import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const serviciosControlador = new ServiciosControlador();
const router = express.Router();
const cache = apicache.middleware;

router.post('/', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('descripcion', 'La descripción es necesaria.').notEmpty(),
        check('importe', 'El importe debe ser mayor a 0.').isFloat({ min: 0.01 }),
        validarCampo    
    ],
    serviciosControlador.crear);

router.put('/:servicio_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('importe').optional().isFloat({ min: 0.01 }).withMessage('El importe debe ser numérico y mayor a 0.'),
        check('descripcion').optional().notEmpty().withMessage('La descripción no puede estar vacía.'),
        validarCampo
    ],
    serviciosControlador.editar);

router.delete('/:servicio_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    serviciosControlador.eliminar);

router.get('/', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    serviciosControlador.buscarTodos);

router.get('/:servicio_id', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    serviciosControlador.buscarPorId);

export { router };