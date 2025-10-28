import { conexion } from "./conexion.js";

export default class Turnos {
    buscarTodos = async () => {
        const sql = "SELECT * FROM turnos WHERE activo = 1 ORDER BY orden";
        const [turnos] = await conexion.execute(sql);
        return turnos;
    }

    buscarPorId = async (turno_id) => {
        const sql = "SELECT * FROM turnos WHERE turno_id = ? AND activo = 1";
        const [turno] = await conexion.execute(sql, [turno_id]);
        return turno[0];
    }

    crear = async(turno) => {
        const {orden, hora_desde, hora_hasta} = turno;
        const sql = 'INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES (?,?,?)';
        const [result] = await conexion.execute(sql, [orden, hora_desde, hora_hasta]);

        if (result.affectedRows === 0){
            return null;
        }

        return this.buscarPorId(result.insertId);
    }

    editar = async (turno_id, datos) => {
        const camposActualizar = Object.keys(datos);
        const valoresActualizar = Object.values(datos);
        const setValores = camposActualizar.map(campo => `${campo} = ?`).join(', ');
        const parametros = [...valoresActualizar, turno_id];
        
        const sql = `UPDATE turnos SET ${setValores} WHERE turno_id = ? AND activo = 1`;
        const [result] = await conexion.execute(sql, parametros);

        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(turno_id);
    }

    eliminar = async (turno_id) => {
        // Soft delete
        const sql = "UPDATE turnos SET activo = 0 WHERE turno_id = ? AND activo = 1";
        const [result] = await conexion.execute(sql, [turno_id]);
        return result.affectedRows;
    }
}