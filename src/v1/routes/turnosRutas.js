import express from 'express';
import TurnosControlador from '../../controllers/turnosControlador.js';
import apicache from 'apicache';
import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const turnosControlador = new TurnosControlador();
const router = express.Router();
let cache = apicache.middleware;

// Regex para validar formato hora
const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5]?[0-9](?::[0-5]?[0-9])?$/;

router.post('/', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('orden', 'El orden es necesario y debe ser numérico.').isInt({ min: 1 }),
        check('hora_desde', 'La hora_desde es necesaria (HH:MM).').matches(timeRegex),
        check('hora_hasta', 'La hora_hasta es necesaria (HH:MM).').matches(timeRegex),
        validarCampo    
    ],
    turnosControlador.crear);

router.put('/:turno_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('orden').optional().isInt({ min: 1 }).withMessage('El orden debe ser numérico.'),
        check('hora_desde').optional().matches(timeRegex).withMessage('La hora_desde debe tener formato HH:MM.'),
        check('hora_hasta').optional().matches(timeRegex).withMessage('La hora_hasta debe tener formato HH:MM.'),
        validarCampo
    ],
    turnosControlador.editar);

router.delete('/:turno_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    turnosControlador.eliminar);

    router.get('/', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    turnosControlador.buscarTodos);

router.get('/:turno_id', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    turnosControlador.buscarPorId);

export { router };