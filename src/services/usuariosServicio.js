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
}