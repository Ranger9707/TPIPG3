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

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: Endpoints para la gestión de turnos de reserva (horarios disponibles)
 */

/**
 * @swagger
 * /turnos:
 *   post:
 *     summary: Crea un nuevo turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden crear un nuevo turno.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orden
 *               - hora_desde
 *               - hora_hasta
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 1
 *               hora_desde:
 *                 type: string
 *                 example: "08:00"
 *               hora_hasta:
 *                 type: string
 *                 example: "12:00"
 *     responses:
 *       201:
 *         description: Turno creado correctamente
 *       400:
 *         description: Datos inválidos o formato incorrecto de hora
 *       403:
 *         description: No tiene permisos para realizar esta acción
 */

router.post('/', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('orden', 'El orden es necesario y debe ser numérico.').isInt({ min: 1 }),
        check('hora_desde', 'La hora_desde es necesaria (HH:MM).').matches(timeRegex),
        check('hora_hasta', 'La hora_hasta es necesaria (HH:MM).').matches(timeRegex),
        validarCampo    
    ],
    turnosControlador.crear);

/**
 * @swagger
 * /turnos/{id}:
 *   put:
 *     summary: Edita un turno existente
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden editar un turno existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a editar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 2
 *               hora_desde:
 *                 type: string
 *                 example: "13:00"
 *               hora_hasta:
 *                 type: string
 *                 example: "17:00"
 *     responses:
 *       200:
 *         description: Turno actualizado correctamente
 *       404:
 *         description: No se encontró el turno
 */

router.put('/:turno_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('orden').optional().isInt({ min: 1 }).withMessage('El orden debe ser numérico.'),
        check('hora_desde').optional().matches(timeRegex).withMessage('La hora_desde debe tener formato HH:MM.'),
        check('hora_hasta').optional().matches(timeRegex).withMessage('La hora_hasta debe tener formato HH:MM.'),
        validarCampo
    ],
    turnosControlador.editar);

/**
 * @swagger
 * /turnos/{id}:
 *   delete:
 *     summary: Elimina un turno existente
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden eliminar un turno.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a eliminar
 *     responses:
 *       200:
 *         description: Turno eliminado correctamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: No se encontró el turno
 */

router.delete('/:turno_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    turnosControlador.eliminar);

/**
 * @swagger
 * /turnos:
 *   get:
 *     summary: Obtiene la lista de todos los turnos disponibles
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     description: Todos los usuarios logueados pueden ver los turnos disponibles.
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida correctamente
 */

router.get('/', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    turnosControlador.buscarTodos);

/**
 * @swagger
 * /turnos/{id}:
 *   get:
 *     summary: Obtiene un turno específico por su ID
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a consultar
 *     responses:
 *       200:
 *         description: Turno obtenido correctamente
 *       404:
 *         description: No se encontró el turno
 */

router.get('/:turno_id', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    turnosControlador.buscarPorId);

export { router };