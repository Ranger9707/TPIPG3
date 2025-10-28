import { conexion } from "./conexion.js";

export default class Reservas {

    buscarPropias = async(usuario_id) => {
        const sql = 'SELECT * FROM reservas WHERE activo = 1 AND usuario_id = ?';
        const [reservas] = await conexion.execute(sql, [usuario_id]);
        return reservas;
    }

    buscarTodos = async() => {
        const sql = 'SELECT * FROM reservas WHERE activo = 1';
        const [reservas] = await conexion.execute(sql);
        return reservas;
    }

    buscarPorId = async(reserva_id) => {
        const sql = 'SELECT * FROM reservas WHERE activo = 1 AND reserva_id = ?';
        const [reserva] = await conexion.execute(sql, [reserva_id]);
        if(reserva.length === 0){
            return null;
        }

        return reserva[0];
    }

    crear = async(reserva) => {
        const {
                fecha_reserva,
                salon_id,
                usuario_id,
                turno_id,
                foto_cumpleaniero, 
                tematica,
                importe_salon,
                importe_total 
            } = reserva;
        
        const sql = `INSERT INTO reservas 
            (fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total) 
            VALUES (?,?,?,?,?,?,?,?)`;
        
        const [result] = await conexion.execute(sql, 
            [fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total]);

        if (result.affectedRows === 0){
            return null;
        }

        return this.buscarPorId(result.insertId);
    }

    datosParaNotificacion = async(reserva_id) => {
        const sql = `SELECT r.fecha_reserva as fecha, s.titulo as salon, t.orden as turno
            FROM reservas as r
            INNER JOIN  salones as s on s.salon_id = r.salon_id 
            INNER JOIN  turnos as t on t.turno_id = r.turno_id
            WHERE r.activo = 1 and r.reserva_id = ?`;

        const [reserva] = await conexion.execute(sql, [reserva_id]);
        if(reserva.length === 0){
            return null;
        }

        return reserva[0];
    }

    editar = async (reserva_id, datos) => {
            const camposActualizar = Object.keys(datos);
            const valoresActualizar = Object.values(datos);
            const setValores = camposActualizar.map(campo => `${campo} = ?`).join(', ');
            const parametros = [...valoresActualizar, reserva_id];
            
            // actualiza siactivo
            const sql = `UPDATE reservas SET ${setValores} WHERE reserva_id = ? AND activo = 1`;
            const [result] = await conexion.execute(sql, parametros);

            if (result.affectedRows === 0) {
                return null;
            }
            return this.buscarPorId(reserva_id);
    }

    eliminar = async (reserva_id) => {
        const sql = "UPDATE reservas SET activo = 0 WHERE reserva_id = ? AND activo = 1";
        const [result] = await conexion.execute(sql, [reserva_id]);
        return result.affectedRows;
    }

} 
