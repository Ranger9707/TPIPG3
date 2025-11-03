import express from 'express';
import SalonesControlador from '../../controllers/salonesControlador.js';
import apicache from 'apicache';

import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js'; 
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const salonesControlador = new SalonesControlador();

const router = express.Router();

let cache = apicache.middleware;

/**
 * @swagger
 * tags:
 *   name: Salones
 *   description: Endpoints para gestionar los salones disponibles
 */

/**
 * @swagger
 * /salones:
 *   post:
 *     summary: Crea un nuevo salón
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden crear un nuevo salón.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - direccion
 *               - capacidad
 *               - importe
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Salón Atlántico"
 *               direccion:
 *                 type: string
 *                 example: "Av. Libertad 1234"
 *               capacidad:
 *                 type: integer
 *                 example: 150
 *               importe:
 *                 type: number
 *                 example: 25000
 *     responses:
 *       201:
 *         description: Salón creado correctamente
 *       400:
 *         description: Datos inválidos o incompletos
 *       403:
 *         description: No tiene permisos para realizar esta acción
 */


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

/**
 * @swagger
 * /salones/{id}:
 *   put:
 *     summary: Edita un salón existente
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden editar un salón existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón a editar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               importe:
 *                 type: number
 *     responses:
 *       200:
 *         description: Salón actualizado correctamente
 *       404:
 *         description: No se encontró el salón
 */

router.put('/:salon_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    salonesControlador.editar);

/**
 * @swagger
 * /salones/{id}:
 *   delete:
 *     summary: Elimina un salón
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol Admin o Empleado pueden eliminar un salón.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Salón eliminado correctamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: No se encontró el salón
 */

router.delete('/:salon_id', 
    autorizarUsuarios([1, 2]), // Solo Admin y Empleado
    salonesControlador.eliminar);

/**
 * @swagger
 * /salones:
 *   get:
 *     summary: Obtiene la lista de todos los salones
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     description: Todos los usuarios logueados pueden consultar los salones disponibles.
 *     responses:
 *       200:
 *         description: Lista de salones obtenida correctamente
 */

router.get('/', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    salonesControlador.buscarTodos);

/**
 * @swagger
 * /salones/{id}:
 *   get:
 *     summary: Obtiene un salón específico por su ID
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón a consultar
 *     responses:
 *       200:
 *         description: Salón obtenido correctamente
 *       404:
 *         description: No se encontró el salón
 */

router.get('/:salon_id', 
    autorizarUsuarios([1, 2, 3]), // Todos los usuarios logueados
    cache("5 minutes"), 
    salonesControlador.buscarPorId);

export { router }; 