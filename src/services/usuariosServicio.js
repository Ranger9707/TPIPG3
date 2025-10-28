import Usuarios from '../db/usuarios.js';

export default class usuariosService {
    constructor() {
        this.usuarios = new Usuarios();
    }

    buscarUsuario = async (nombre_usuario, contrasenia) => {
        return this.usuarios.buscar(nombre_usuario, contrasenia);
    }

    buscarUsuarioPorId = async (usuario_id) => {
        return this.usuarios.buscarPorId(usuario_id);
    }

    buscarTodosUsuarios = () => {
        return this.usuarios.buscarTodos();
    }

    buscarUsuarioDetalle = (usuario_id) => {
        return this.usuarios.buscarPorIdDetalle(usuario_id);
    }

    crearUsuario = (usuario) => {
        // valida si el email (nombre_usuario) ya existe
        return this.usuarios.crear(usuario);
    }

    editarUsuario = async (usuario_id, datos) => {
        // Si la contraseña esta vacia, la quitamos para no actualizarla
        if (datos.contrasenia === "" || datos.contrasenia === null || datos.contrasenia === undefined) {
            delete datos.contrasenia;
        }

        const existe = await this.usuarios.buscarPorIdDetalle(usuario_id);
        if(!existe){
            return null;
        }
        return this.usuarios.editar(usuario_id, datos);
    }

    eliminarUsuario = (usuario_id) => {
        return this.usuarios.eliminar(usuario_id);
    }
}