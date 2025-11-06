import UsuariosServicio from "../services/usuariosServicio.js";
//1=Admin, 2=Empleado, 3=Cliente


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
            const {nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular} = req.body;
            
            if (![1, 2, 3].includes(tipo_usuario)) {
                return res.status(400).json({
                    estado: false,
                    mensaje: 'Tipo de usuario inválido (debe ser 1, 2 o 3).'
                });
            }

            const usuario = {nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto:null};

            if (req.file){
                usuario.foto = req.file.path;
            }

            const nuevoUsuario = await this.usuariosServicio.crearUsuario(usuario);
            
            if (!nuevoUsuario) {
                // Esto puede pasar si la inserción falla por razones que no son error
                return res.status(400).json({
                    estado: false,
                    mensaje: 'Usuario no creado'
                });
            }
            
            res.status(201).json({
                estado: true, 
                mensaje: 'Usuario creado!',
                datos: nuevoUsuario
            });

        } catch (err) {
            console.log('Error en POST /usuarios/', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ 
                    estado: false,
                    mensaje: 'El email (nombre_usuario) ya está en uso.'
                });
            }

            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }

    editar = async (req, res) => {
        try {
            const { usuario_id } = req.params;
            const datos = req.body;

            if (req.file){
                datos.foto = req.file.path;
            }

            // Evitar que un usuario cambie su propio rol
            if (req.user && Number(req.user.usuario_id) === Number(usuario_id) && datos.tipo_usuario && Number(datos.tipo_usuario) !== Number(req.user.tipo_usuario)) {
                return res.status(403).json({
                    estado: false,
                    mensaje: 'No puedes cambiar tu propio rol.'
                });
            }

            if (datos.tipo_usuario && Number(datos.tipo_usuario) === 1) {
                if (!req.user || Number(req.user.tipo_usuario) !== 1) {
                    return res.status(403).json({
                        estado: false,
                        mensaje: 'No tienes permiso para asignar el rol de administrador.'
                    });
                }
            }


            const usuarioDestino = await this.usuariosServicio.buscarUsuarioDetalle(usuario_id);
            if (!usuarioDestino) {
                return res.status(404).json({ estado: false, mensaje: 'Usuario no encontrado' });
            }
            if (req.user && Number(req.user.tipo_usuario) > Number(usuarioDestino.tipo_usuario)) {
                return res.status(403).json({
                    estado: false,
                    mensaje: 'No tienes permiso para modificar este usuario.'
                });
            }

            if (datos.usuario_id) delete datos.usuario_id;

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
            if (err.statusCode) {
                return res.status(err.statusCode).json({ estado: false, mensaje: err.message });
            }
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