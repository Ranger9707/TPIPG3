import express from 'express';
import ServiciosControlador from '../../controllers/serviciosControlador.js';
import apicache from 'apicache';
import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const serviciosControlador = new ServiciosControlador();
const router = express.Router();
const cache = apicache.middleware;

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Endpoints para la gestión de servicios adicionales ofrecidos por los salones
 */

/**
 * @swagger
 * /servicios:
 *   post:
 *     summary: Crea un nuevo servicio
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden crear un servicio nuevo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - importe
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Servicio de catering premium"
 *               importe:
 *                 type: number
 *                 example: 45000
 *     responses:
 *       201:
 *         description: Servicio creado correctamente
 *       400:
 *         description: Datos inválidos o incompletos
 *       403:
 *         description: No tiene permisos para realizar esta acción
 */

router.post('/', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('descripcion', 'La descripción es necesaria.').notEmpty(),
        check('importe', 'El importe debe ser mayor a 0.').isFloat({ min: 0.01 }),
        validarCampo    
    ],
    serviciosControlador.crear);

/**
 * @swagger
 * /servicios/{id}:
 *   put:
 *     summary: Edita un servicio existente
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden modificar servicios existentes.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio a editar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Servicio de decoración temática"
 *               importe:
 *                 type: number
 *                 example: 30000
 *     responses:
 *       200:
 *         description: Servicio actualizado correctamente
 *       404:
 *         description: No se encontró el servicio
 */

router.put('/:servicio_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    [
        check('importe').optional().isFloat({ min: 0.01 }).withMessage('El importe debe ser numérico y mayor a 0.'),
        check('descripcion').optional().notEmpty().withMessage('La descripción no puede estar vacía.'),
        validarCampo
    ],
    serviciosControlador.editar);

/**
 * @swagger
 * /servicios/{id}:
 *   delete:
 *     summary: Elimina un servicio
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden eliminar un servicio.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio eliminado correctamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: No se encontró el servicio
 */

router.delete('/:servicio_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    serviciosControlador.eliminar);

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Obtiene la lista de todos los servicios disponibles
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     description: Todos los usuarios logueados pueden consultar los servicios disponibles.
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida correctamente
 */

router.get('/', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    serviciosControlador.buscarTodos);

/**
 * @swagger
 * /servicios/{id}:
 *   get:
 *     summary: Obtiene un servicio específico por su ID
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio a consultar
 *     responses:
 *       200:
 *         description: Servicio obtenido correctamente
 *       404:
 *         description: No se encontró el servicio
 */

router.get('/:servicio_id', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    serviciosControlador.buscarPorId);

export { router };