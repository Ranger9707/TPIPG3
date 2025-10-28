import {conexion} from './conexion.js';

export default class Servicios{

    buscarTodos = async() => {
        const sql = 'SELECT * FROM servicios WHERE activo = 1';
        const [servicios] = await conexion.execute(sql);
        return servicios;
    }

    buscarPorId = async(servicio_id) => {
        const sql = 'SELECT * FROM servicios WHERE id = ? AND activo = 1';
        const [servicios] = await conexion.execute(sql, [servicio_id]);
        return servicios[0];
    }

    crear = async(servicio) => {
        const {descripcion, importe} = servicio;
        const sql = `INSERT INTO servicios (descripcion, importe) VALUES (?,?)`;
        const [result] = await conexion.execute(sql, [descripcion, importe]);

        if (result.affectedRows === 0){
            return null;
        }
        return this.buscarPorId(result.insertId);
    }

    editar = async(servicio_id, datos) => {
        const camposActualizar = Object.keys(datos);
        const valoresActualizar = Object.values(datos);
        const setValores = camposActualizar.map(campo => `${campo} = ?`).join(', ');
        const parametros = [...valoresActualizar, servicio_id];
        const sql = `UPDATE servicios SET ${setValores} WHERE servicio_id = ?`;
        const [result] = await conexion.execute(sql, parametros);

        if (result.affectedRows === 0){
            return null;
        }
        return this.buscarPorId(servicio_id);
    }

    eliminar = async(servicio_id) => {
        const sql = `UPDATE servicios SET activo = 0 WHERE servicio_id = ? AND activo = 1`;
        const [result] = await conexion.execute(sql, [servicio_id]);
        return result.affectedRows;
    }
}   