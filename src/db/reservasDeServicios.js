import { conexion } from "./conexion.js";

export default class ReservasServicios {
    
    crear = async(reserva_id, servicios) => {

        try{
            await conexion.beginTransaction();

            for (const servicio of servicios){
                const sql = `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) 
                    VALUES (?,?,?);`;
                conexion.execute(sql, [reserva_id, servicio.servicio_id, servicio.importe ]);
            }

            await conexion.commit();

            return true;
        }catch(error){
            await conexion.rollback();
            console.log(`error ${error}`);
            return false;
        }
    }

    actualizar = async(reserva_id, servicios) => {
        try {
            await conexion.beginTransaction();

            // 1. Borrar servicios anteriores
            const sqlDelete = 'DELETE FROM reservas_servicios WHERE reserva_id = ?';
            await conexion.execute(sqlDelete, [reserva_id]);

            // 2. Insertar servicios nuevos
            for (const servicio of servicios){
                const sqlInsert = `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) 
                    VALUES (?,?,?);`;
                // Se usa 'await' aquí
                await conexion.execute(sqlInsert, [reserva_id, servicio.servicio_id, servicio.importe ]);
            }

            await conexion.commit();
            return true;

        } catch (error) {
            await conexion.rollback();
            console.log(`error actualizando servicios ${error}`);
            return false;
        }
    }
}