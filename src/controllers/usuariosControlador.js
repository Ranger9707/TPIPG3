import UsuariosServicio from "../services/usuariosServicio.js";

export default class UsuariosControlador {
    constructor(){
        this.usuariosServicio = new UsuariosServicio();
    }

    buscarTodos = async (req, res) => {
        try{
            const usuarios = await this.usuariosServicio.buscarTodosUsuarios();
            res.json({estado: true, datos: usuarios});
        }catch(error){
            console.log("error en GET /usuarios", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

    buscarPorId = async (req, res) => {
        try{
            const { usuario_id } = req.params;
            const usuario = await this.usuariosServicio.buscarUsuarioDetalle(usuario_id);
            if(!usuario) {
                return res.status(404).json({estado: false, mensaje: "Usuario no encontrado"});
            }
            res.json({estado: true, datos: usuario});
        }catch(error){
            console.log("error en GET /usuarios/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

    crear = async (req, res) => {
        try {
            const {nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto} = req.body;
            
            // Validación básica de tipo de usuario
            if (![1, 2, 3].includes(tipo_usuario)) {
                return res.status(400).json({
                    estado: false,
                    mensaje: 'Tipo de usuario inválido (debe ser 1, 2 o 3).'
                });
            }

            const usuario = {nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto};
            const nuevoUsuario = await this.usuariosServicio.crearUsuario(usuario);
            
            if (!nuevoUsuario) {
                return res.status(400).json({
                    estado: false,
                    mensaje: 'Usuario no creado (posible email duplicado)'
                });
            }
            
            res.status(201).json({
                estado: true, 
                mensaje: 'Usuario creado!',
                datos: nuevoUsuario
            });
        } catch (err) {
            console.log('Error en POST /usuarios/', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor (posible email duplicado).'
            });
        }
    }

    editar = async (req, res) => {
        try {
            const { usuario_id } = req.params;
            const datos = req.body;
            
            // Un Admin no puede hacerse auto downgrade
            if (req.user.usuario_id == usuario_id && datos.tipo_usuario && datos.tipo_usuario !== 1) {
                 return res.status(403).json({
                    estado: false,
                    mensaje: 'Un administrador no puede cambiar su propio rol.'
                });
            }

            const usuarioModificado = await this.usuariosServicio.editarUsuario(usuario_id, datos);

            if (!usuarioModificado) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Usuario no encontrado para modificar.'
                })
            }

            res.json({
                estado: true, 
                mensaje: 'Usuario modificado!',
                datos: usuarioModificado
            });
        } catch (err) {
            console.log('Error en PUT /usuarios/:id', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }
    
    eliminar = async (req, res) => {
        try{
            const { usuario_id } = req.params;

            // Un usuario no puede eliminarse a si msmo
            if (req.user.usuario_id == usuario_id) {
                return res.status(403).json({
                    estado: false,
                    mensaje: 'No puedes eliminar tu propio usuario.'
                });
            }

            const filasAfectadas = await this.usuariosServicio.eliminarUsuario(usuario_id);

            if(filasAfectadas === 0) {
                return res.status(404).json({estado: false, mensaje: "Usuario no encontrado"});
            }

            res.json({estado: true, mensaje: "Usuario eliminado"});
        }catch(error){
            console.log("error en DELETE /usuarios/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }
}