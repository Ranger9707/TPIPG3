import express from 'express';
import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js';
import ReservasControlador from '../../controllers/reservasControlador.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const reservasControlador = new ReservasControlador();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Endpoints para la gestión de reservas, generación de reportes y operaciones administrativas
 */

/**
 * @swagger
 * /reservas/{id}:
 *   get:
 *     summary: Obtiene una reserva específica por su ID
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva obtenida correctamente
 *       404:
 *         description: No se encontró la reserva
 */

router.get('/:reserva_id',  autorizarUsuarios([1,2,3]), reservasControlador.buscarPorId);

/**
 * @swagger
 * /reservas:
 *   get:
 *     summary: Obtiene todas las reservas (según permisos del usuario)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida exitosamente
 *       403:
 *         description: No tiene permisos para ver las reservas
 */

router.get('/',  autorizarUsuarios([1,2,3]), reservasControlador.buscarTodos);

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Crea una nueva reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha_reserva
 *               - salon_id
 *               - turno_id
 *               - servicios
 *               - importe_total
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *               salon_id:
 *                 type: integer
 *               turno_id:
 *                 type: integer
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     servicio_id:
 *                       type: integer
 *                     importe:
 *                       type: number
 *               importe_total:
 *                 type: number
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Datos inválidos o incompletos
 */

router.post('/', autorizarUsuarios([1,3]), 
    [
        check('fecha_reserva', 'La fecha es necesaria.').notEmpty(),
        check('salon_id', 'El salón es necesario.').notEmpty(),
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

/**
 * @swagger
 * /reservas/{id}:
 *   put:
 *     summary: Edita una reserva existente (solo administrador)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva a editar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *               salon_id:
 *                 type: integer
 *               turno_id:
 *                 type: integer
 *               importe_total:
 *                 type: number
 *     responses:
 *       200:
 *         description: Reserva actualizada correctamente
 *       403:
 *         description: No tiene permisos para modificar reservas
 *       404:
 *         description: No se encontró la reserva
 */

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
        
        validarCampo
    ],
    reservasControlador.editar);

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Elimina una reserva (solo administrador)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva eliminada correctamente
 *       403:
 *         description: No tiene permisos para eliminar
 *       404:
 *         description: No se encontró la reserva
 */


router.delete('/:reserva_id',
    autorizarUsuarios([1]), 
    reservasControlador.eliminar);

/**
 * @swagger
 * /reservas/reporte/csv:
 *   get:
 *     summary: Genera un reporte de reservas en formato CSV (solo admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte CSV generado correctamente
 */


router.get('/reporte/csv',
    autorizarUsuarios([1]),
    reservasControlador.generarReporteCsv
);

/**
 * @swagger
 * /reservas/reporte/pdf:
 *   get:
 *     summary: Genera un reporte de reservas en formato PDF (solo admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte PDF generado correctamente
 */


router.get('/reporte/pdf',
    autorizarUsuarios([1]),
    reservasControlador.generarReportePdf
);

export { router };