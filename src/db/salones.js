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

    crear = async ({titulo, direccion, capacidad, importe}) => {
        const sql = "INSERT INTO salones (titulo, direccion, capacidad, importe) VALUES (?, ?, ?, ?)";
        const valores = [titulo, direccion, capacidad, importe];
        const [result] = await conexion.execute(sql, valores);
        return result.insertId;
    }

    actualizar = async (salon_id, {titulo, direccion, capacidad, importe}) => {
        const sql = "UPDATE salones SET titulo = ?, direccion = ?, capacidad = ?, importe = ? WHERE salon_id = ? AND activo = 1";
        const valores = [titulo, direccion, capacidad, importe, salon_id];
        const [result] = await conexion.execute(sql, valores);
        return result.affectedRows;
    }

    eliminar = async (salon_id) => {
        const sql = "UPDATE salones SET activo = 0 WHERE salon_id = ? AND activo = 1";
        const [result] = await conexion.execute(sql, [salon_id]);
        return result.affectedRows;
    }
}
