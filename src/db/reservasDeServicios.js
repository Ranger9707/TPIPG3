import { conexion } from "./conexion.js";

export default class ReservasServicios {
    crear = async(reserva_id, servicios, db = conexion) => { 
        for (const servicio of servicios){
            const sql = `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?,?,?)`;
            
            await db.execute(sql, [reserva_id, servicio.servicio_id, servicio.importe ]); 
        }
        return true;
    }
    actualizar = async(reserva_id, servicios, db = conexion) => { 
        const sqlDelete = 'DELETE FROM reservas_servicios WHERE reserva_id = ?';
        await db.execute(sqlDelete, [reserva_id]); 
        for (const servicio of servicios){
            const sqlInsert = `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) 
                VALUES (?,?,?);`;
            await db.execute(sqlInsert, [reserva_id, servicio.servicio_id, servicio.importe ]); 
        }
        return true;
    }
}