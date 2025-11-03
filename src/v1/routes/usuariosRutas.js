import express from 'express';
import UsuariosControlador from '../../controllers/usuariosControlador.js';
import { check } from 'express-validator';
import { validarCampo } from '../../middlewares/validarCampo.js';
import autorizarUsuarios from '../../middlewares/autorizarUsuarios.js';

const usuariosControlador = new UsuariosControlador();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para la gestión de usuarios del sistema (solo accesibles por administradores)
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol **Admin (1)** pueden crear nuevos usuarios del sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *               - tipo_usuario
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               nombre_usuario:
 *                 type: string
 *                 example: "juan.perez@ejemplo.com"
 *               contrasenia:
 *                 type: string
 *                 example: "segura123"
 *               tipo_usuario:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: 1=Admin, 2=Empleado, 3=Cliente
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos o faltantes
 *       403:
 *         description: No tiene permisos para realizar esta acción
 */


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

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Edita un usuario existente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol **Admin (1)** pueden modificar usuarios.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a editar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "nuevo.email@ejemplo.com"
 *               contrasenia:
 *                 type: string
 *                 example: "nueva123"
 *               tipo_usuario:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: 1=Admin, 2=Empleado, 3=Cliente
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: No se encontró el usuario
 */

router.put('/:usuario_id', 
    autorizarUsuarios([1]),
    [
        check('nombre_usuario').optional().isEmail().withMessage('El email (nombre_usuario) es inválido.'),
        check('contrasenia').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener mín 6 caracteres.'),
        check('tipo_usuario').optional().isInt({ min: 1, max: 3 }).withMessage('El tipo_usuario debe ser 1, 2 o 3.'),
        validarCampo
    ],
    usuariosControlador.editar);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol **Admin (1)** pueden eliminar un usuario existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: No se encontró el usuario
 */

router.delete('/:usuario_id', 
    autorizarUsuarios([1]), 
    usuariosControlador.eliminar);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol **Admin (1)** pueden consultar información de usuarios individuales.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente
 *       404:
 *         description: No se encontró el usuario
 */

router.get('/:usuario_id', 
    autorizarUsuarios([1]), 
    usuariosControlador.buscarPorId);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios del sistema
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo los usuarios con rol **Admin (1)** o **Empleado (2)** pueden obtener la lista completa de usuarios.
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *       403:
 *         description: No tiene permisos
 */

// Admin (1), Empleado (2)
router.get('/', 
    autorizarUsuarios([1, 2]), 
    usuariosControlador.buscarTodos);

export { router };