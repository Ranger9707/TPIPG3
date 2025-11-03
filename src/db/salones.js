import { conexion } from "./conexion.js";

export default class Salones {
    buscarTodos = async () => {
        const sql = "SELECT * FROM salones WHERE activo = 1";
        const [salones] = await conexion.execute(sql);
        return salones;
    }

    buscarPorId = async (salon_id) => {
        const sql = "SELECT * FROM salones WHERE salon_id = ? AND activo = 1";
        const [salon] = await conexion.execute(sql, [salon_id]);
        return salon[0];
    }

    crear = async(salon) => {
        const {titulo, direccion, capacidad, importe} = salon;
        const sql = 'INSERT INTO salones (titulo, direccion, capacidad, importe) VALUES (?,?,?,?)';
        const [result] = await conexion.execute(sql, [titulo, direccion, capacidad, importe]);

        if (result.affectedRows === 0){
            return null;
        }

        return this.buscarPorId(result.insertId);
    }

    editar = async (salon_id, datos) => {
        const camposActualizar = Object.keys(datos);
        const valoresActualizar = Object.values(datos);
        const setValores = camposActualizar.map(campo => `${campo} = ?`).join(', ');
        const parametros = [...valoresActualizar, salon_id];
        const sql = `UPDATE salones SET ${setValores} WHERE salon_id = ?`;
        const [result] = await conexion.execute(sql, parametros);
        if (result.affectedRows === 0) {
            return null;
        }
        return this.buscarPorId(salon_id);
}

    eliminar = async (salon_id) => {
        const sql = "UPDATE salones SET activo = 0 WHERE salon_id = ? AND activo = 1";
        const [result] = await conexion.execute(sql, [salon_id]);
        return result.affectedRows;
    }
}
