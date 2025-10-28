import {conexion} from './conexion.js';

export default class Usuarios{

    buscar = async (nombre_usuario, contrasenia) => {
        const sql = `SELECT u.usuario_id, CONCAT(u.nombre, ' ', u.apellido) as usuario, u.tipo_usuario
                        FROM usuarios  AS u
                        WHERE u.nombre_usuario = ? 
                            AND u.contrasenia = SHA2(?, 256) 
                            AND u.activo = 1;`
        const [result] = await conexion.query(sql, [nombre_usuario, contrasenia]);
        return result[0];
    }

    buscarPorId = async (usuario_id) => {
        const sql = `SELECT CONCAT(u.nombre, ' ', u.apellido) as usuario, u.tipo_usuario, u.usuario_id
                        FROM usuarios  AS u
                        WHERE u.usuario_id = ? AND u.activo = 1;`
        const [result] = await conexion.query(sql, [usuario_id]);
        return result[0];
    }

    buscarTodos = async () => {
        const sql = `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, activo
                     FROM usuarios WHERE activo = 1`;
        const [usuarios] = await conexion.execute(sql);
        return usuarios;
    }

    buscarPorIdDetalle = async (usuario_id) => {
        const sql = `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto, activo
                     FROM usuarios WHERE usuario_id = ? AND activo = 1`;
        const [usuario] = await conexion.execute(sql, [usuario_id]);
        return usuario[0];
    }


    //Crea un nuevo usuario hasheando la pass

    crear = async(usuario) => {
        const {nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto} = usuario;
        
        // Hasheamos la contraseña directamente
        const sql = `INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto) 
                     VALUES (?,?,?, SHA2(?, 256), ?,?,?)`;
        
        const [result] = await conexion.execute(sql, [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto]);

        if (result.affectedRows === 0){
            return null;
        }
        // Devuelvo el usuario
        return this.buscarPorIdDetalle(result.insertId);
    }


     //Si se incluye contraseña, la hashea.
     
    editar = async (usuario_id, datos) => {
        const campos = Object.keys(datos);
        const valores = Object.values(datos);

        let setValores = [];
        let parametros = [];

        // Construccion para hashear
        for (let i = 0; i < campos.length; i++) {
            const campo = campos[i];
            const valor = valores[i];

            if (campo === 'contrasenia') {
                setValores.push('contrasenia = SHA2(?, 256)'); 
            } else {
                setValores.push(`${campo} = ?`);
            }
            parametros.push(valor);
        }

        if (parametros.length === 0) {
            return this.buscarPorIdDetalle(usuario_id); // No hay nada paraactualizar
        }

        parametros.push(usuario_id);
        
        const sql = `UPDATE usuarios SET ${setValores.join(', ')} WHERE usuario_id = ? AND activo = 1`;
        
        const [result] = await conexion.execute(sql, parametros);
        
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorIdDetalle(usuario_id);
    }

    eliminar = async (usuario_id) => {
        const sql = "UPDATE usuarios SET activo = 0 WHERE usuario_id = ? AND activo = 1";
        const [result] = await conexion.execute(sql, [usuario_id]);
        return result.affectedRows;
    }
}



