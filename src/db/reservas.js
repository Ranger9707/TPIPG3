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

    buscarPorId = async(reserva_id, db = conexion) => { 
        const sql = 'SELECT * FROM reservas WHERE activo = 1 AND reserva_id = ?';
        const [reserva] = await db.execute(sql, [reserva_id]); 
        if(reserva.length === 0){
            return null;
        }
        return reserva[0];
    }

    crear = async(reserva, db = conexion) => { 
        const {
                fecha_reserva, salon_id, usuario_id, turno_id,
                foto_cumpleaniero, tematica, importe_salon, importe_total 
            } = reserva;
        
        const sql = `INSERT INTO reservas 
            (fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total) 
            VALUES (?,?,?,?,?,?,?,?)`;
        
        const [result] = await db.execute(sql, 
            [fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total]);

        if (result.affectedRows === 0){
            return null;
        }

        return this.buscarPorId(result.insertId, db); 
    }

    datosParaNotificacion = async(reserva_id, db = conexion) => { 
        const sql = `CALL sp_notificacion_reserva(?)`;
        
        try {
            const [resultados] = await db.execute(sql, [reserva_id]); 
            if(resultados[0].length === 0){
                return null;
            }
            return [ resultados[0], resultados[1] ]; 
        } catch (error) {
            console.error("Error al llamar a sp_notificacion_reserva:", error);
            return null;
        }
    }
    editar = async (reserva_id, datos, db = conexion) => { 
            const camposActualizar = Object.keys(datos);
            const valoresActualizar = Object.values(datos);
            const setValores = camposActualizar.map(campo => `${campo} = ?`).join(', ');
            const parametros = [...valoresActualizar, reserva_id];
            
            const sql = `UPDATE reservas SET ${setValores} WHERE reserva_id = ? AND activo = 1`;
            const [result] = await db.execute(sql, parametros); 

            if (result.affectedRows === 0) {
                
            }
            return this.buscarPorId(reserva_id, db); 
    }
    eliminar = async (reserva_id, usuario_id = null, db = conexion) => { 
        let sql = "UPDATE reservas SET activo = 0 WHERE reserva_id = ? AND activo = 1";
        const params = [reserva_id];

        if (usuario_id) {
        sql += " AND usuario_id = ?";
        params.push(usuario_id);
        }
        
        const [result] = await db.execute(sql, params); 
        return result.affectedRows;
    }
    
    llamarSpReporteReservas = async (db = conexion) => { 
        const sql = "CALL sp_reporte_reservas()";
        const [resultados] = await db.execute(sql); 
        return resultados[0]; 
    }

    llamarSpEstadisticaSalon = async (db = conexion) => {
        const sql = "CALL sp_estadistica_reservas_por_salon()";
        const [resultados] = await db.execute(sql);
        return resultados[0]; 
    }

    llamarSpEstadisticaIngresos = async (db = conexion) => {
        const sql = "CALL sp_estadistica_ingresos_mensuales()";
        const [resultados] = await db.execute(sql);
        return resultados[0]; 
    }

    llamarSpEstadisticaTopServicios = async (db = conexion) => {
        const sql = "CALL sp_estadistica_top_servicios()";
        const [resultados] = await db.execute(sql);
        return resultados[0]; 
    }
} 
