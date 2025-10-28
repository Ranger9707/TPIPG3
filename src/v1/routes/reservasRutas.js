import express from 'express';
import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js';
import ReservasControlador from '../../controllers/reservasControlador.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const reservasControlador = new ReservasControlador();
const router = express.Router();

router.get('/:reserva_id',  autorizarUsuarios([1,2,3]), reservasControlador.buscarPorId);
router.get('/',  autorizarUsuarios([1,2,3]), reservasControlador.buscarTodos);
router.post('/', autorizarUsuarios([1,3]), 
    [
        check('fecha_reserva', 'La fecha es necesaria.').notEmpty(),
        check('salon_id', 'El salón es necesario.').notEmpty(),
        check('usuario_id', 'El usuario es necesario.').notEmpty(), 
        check('turno_id', 'El turno es necesario.').notEmpty(),  
        check('servicios', 'Faltan los servicios de la reserva.')
        .notEmpty()
        .isArray(),  
        check('servicios.*.importe')
        .isFloat() 
        .withMessage('El importe debe ser numérico.'),   
        validarCampo
    ],
    reservasControlador.crear);

router.put('/:reserva_id',
    autorizarUsuarios([1]), // Solo Admin
    [
        // Validaciones opcionales para la reserva
        check('fecha_reserva').optional().notEmpty().withMessage('La fecha no puede estar vacía.'),
        check('salon_id').optional().notEmpty().withMessage('El salón no puede estar vacío.'),
        check('turno_id').optional().notEmpty().withMessage('El turno no puede estar vacío.'),
        check('importe_total').optional().isFloat({ min: 0 }).withMessage('El importe debe ser numérico.'),
        
        // Validaciones opcionales para los servicios
        check('servicios').optional().isArray().withMessage('Servicios debe ser un array.'),
        check('servicios.*.servicio_id').optional().notEmpty().withMessage('El servicio_id es requerido.'),
        check('servicios.*.importe').optional().isFloat().withMessage('El importe debe ser numérico.'),
        
        validarCampos
    ],
    reservasControlador.editar);

router.delete('/:reserva_id',
    autorizarUsuarios([1]), // Solo Admin
    reservasControlador.eliminar);


export { router };