import Reservas from "../db/reservas.js";
import ReservasServicios from "../db/reservasDeServicios.js";
import notificacionesServicio from "./notificacionesServicio.js";

export default class ReservasServicio {

    constructor(){
        this.reserva = new Reservas();
        this.reservas_servicios = new ReservasServicios();
        this.notificaciones_servicios = new notificacionesServicio();
    }

    buscarTodos = (usuario) => {

        if(usuario.tipo_usuario < 3){
            return this.reserva.buscarTodos();
        }else{
            return this.reserva.buscarPropias(usuario.usuario_id);
        }

    }

    buscarPorId = (reserva_id) => {
        return this.reserva.buscarPorId(reserva_id);
    }

    crear = async (reserva) => {
        
        const {
            fecha_reserva,
            salon_id,
            usuario_id,
            turno_id,
            foto_cumpleaniero, 
            tematica,
            importe_salon,
            importe_total,
            servicios } = reserva;

        const nuevaReserva = {
            fecha_reserva,
            salon_id,
            usuario_id,
            turno_id,
            foto_cumpleaniero, 
            tematica,
            importe_salon,
            importe_total
        }    

        const result = await this.reserva.crear(nuevaReserva);

        if (!result) {
            return null;
        }

        await this.reservas_servicios.crear(result.reserva_id, servicios);     

        const datosParaNotificacion = await this.reserva.datosParaNotificacion(result.reserva_id);
        
        await this.notificaciones_servicios.enviarCorreo(datosParaNotificacion);

        return this.reserva.buscarPorId(result.reserva_id);
    }

    editar = async (reserva_id, datos) => {
        
        const existe = await this.reserva.buscarPorId(reserva_id);
        if (!existe) {
            return null;
        }

        // Separamos los servicios del resto de los datos de la reserva
        const { servicios, ...datosReserva } = datos;

        // 1. Actualizar la reserva principal (si hay datos para ello)
        // (ej: cambiar la temática, fecha, importe_total, etc.)
        if (Object.keys(datosReserva).length > 0) {
            await this.reserva.editar(reserva_id, datosReserva);
        }

        // 2. Actualizar los servicios asociados (si se enviaron en el body)
        if (servicios && Array.isArray(servicios)) {
            // Usamos el nuevo método 'actualizar'
            await this.reservas_servicios.actualizar(reserva_id, servicios);
        }

        // Devolvemos la reserva con todos los datos actualizados
        return this.reserva.buscarPorId(reserva_id);
    }

    eliminar = async (reserva_id) => {
        
        // NOTA: Para un borrado completo, también deberíamos borrar
        // de 'reservas_servicios' (usando el método 'actualizar' con array vacío).
        // Pero como es un soft-delete de la reserva, los registros asociados
        // quedan "huérfanos" pero intactos, lo cual es aceptable.

        return this.reserva.eliminar(reserva_id);
    }
}