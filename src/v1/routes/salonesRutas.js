import express from 'express';
import SalonesControlador from '../../controllers/salonesControlador.js';
import apicache from 'apicache';

import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js'; 
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const salonesControlador = new SalonesControlador();

const router = express.Router();

let cache = apicache.middleware;

router.post('/', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('titulo', 'El título es necesario.').notEmpty(),
        check('direccion', 'La dirección es necesaria.').notEmpty(),
        check('capacidad', 'La capacidad debe ser mayor a 0.').isInt({ min: 1 }), 
        check('importe', 'El importe debe ser mayor a 0.').isFloat({ min: 0.01 }),
        validarCampo    
    ],
    salonesControlador.crear);

router.put('/:salon_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('titulo').optional().notEmpty().withMessage('El título no puede estar vacío.'),
        check('direccion').optional().notEmpty().withMessage('La dirección no puede estar vacía.'),
        check('capacidad').optional().isInt({ min: 1 }).withMessage('La capacidad debe ser mayor a 0.'),
        check('importe').optional().isFloat({ min: 0.01 }).withMessage('El importe debe ser mayor a 0.'),
        validarCampo    
    ],
    salonesControlador.editar);

router.delete('/:salon_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    salonesControlador.eliminar);

router.get('/', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    salonesControlador.buscarTodos);

router.get('/:salon_id', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    salonesControlador.buscarPorId);

export { router }; 