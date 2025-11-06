import { conexion } from "../db/conexion.js";
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
        if(usuario.tipo_usuario < 3){ // 1: Admin, 2: Empleado
            return this.reserva.buscarTodos();
        }else{ // 3: Cliente
            return this.reserva.buscarPropias(usuario.usuario_id);
        }
    }

    buscarPorId = (reserva_id) => {
        return this.reserva.buscarPorId(reserva_id);
    }

    crear = async (reserva) => {
        
        const {
            fecha_reserva, salon_id, usuario_id, turno_id,
            foto_cumpleaniero, tematica, importe_salon, importe_total,
            servicios 
        } = reserva;

        let transaccion; 
        try {
            transaccion = await conexion.getConnection();
            
            await transaccion.beginTransaction();

            const nuevaReservaDatos = {
                fecha_reserva, salon_id, usuario_id, turno_id,
                foto_cumpleaniero, tematica, importe_salon, importe_total
            };    
            
            const result = await this.reserva.crear(nuevaReservaDatos, transaccion); 
            if (!result) {
                throw new Error('No se pudo crear la reserva principal.');
            }

            await this.reservas_servicios.crear(result.reserva_id, servicios, transaccion); 

            const datosNotificacion = await this.reserva.datosParaNotificacion(result.reserva_id, transaccion);
            
            if (datosNotificacion) {
                const [datosReservaArray, correosAdminArray] = datosNotificacion;
                const datosReserva = datosReservaArray[0]; 
                const correoCliente = datosReserva.correoCliente;

                this.notificaciones_servicios.enviarCorreo({
                    para: correoCliente,
                    asunto: '¡Tu reserva ha sido confirmada!',
                    fecha: datosReserva.fecha,
                    salon: datosReserva.salon,
                    turno: datosReserva.turno
                }).catch(console.error); 

                for (const admin of correosAdminArray) {
                    this.notificaciones_servicios.enviarCorreo({
                        para: admin.correoAdmin,
                        asunto: 'Se ha registrado una nueva reserva',
                        fecha: datosReserva.fecha,
                        salon: datosReserva.salon,
                        turno: datosReserva.turno
                    }).catch(console.error);
                }
            }

            await transaccion.commit();
            

            return this.reserva.buscarPorId(result.reserva_id, transaccion);

        } catch (error) {
            if (transaccion) {
                await transaccion.rollback();
            }
            console.error('Error en la transacción de crear reserva:', error);
            return null; 
        
        } finally {
            if (transaccion) {
                transaccion.release();
            }
        }
    }

    editar = async (reserva_id, datos) => {
        
        let transaccion;
        try {
            transaccion = await conexion.getConnection();
            await transaccion.beginTransaction();
            const existe = await this.reserva.buscarPorId(reserva_id, transaccion);
            if (!existe) {
                throw new Error('Reserva no encontrada');
            }
            let servicios = null;
            if (typeof datos.servicios === 'string') {
                try {
                    servicios = JSON.parse(datos.servicios);
                } catch (e) {
                    throw new Error("El campo 'servicios' (string) no es un JSON válido.");
                }
            } 
            else if (typeof datos.servicios === 'object' && datos.servicios !== null) {
                servicios = datos.servicios;
            }
            const { servicios: _servicios, ...datosReserva } = datos;
            if (Object.keys(datosReserva).length > 0) {
                await this.reserva.editar(reserva_id, datosReserva, transaccion);
            }
            if (servicios && Array.isArray(servicios)) {
                await this.reservas_servicios.actualizar(reserva_id, servicios, transaccion);
            }

            await transaccion.commit();
            
            return this.reserva.buscarPorId(reserva_id, transaccion);

        } catch (error) {
            if (transaccion) {
                await transaccion.rollback();
            }
            console.error('Error en la transacción de editar reserva:', error);
            if (error.message === 'Reserva no encontrada') {
                return null;
            }
            throw error; //otros errores
        
        } finally {
            if (transaccion) {
                transaccion.release();
            }
        }
    }

    eliminar = async (reserva_id, usuario = null) => {
        let usuario_id_dueño = null;
        if (usuario && usuario.tipo_usuario === 3) { // cliente
            usuario_id_dueño = usuario.usuario_id;
        }
        return this.reserva.eliminar(reserva_id, usuario_id_dueño);
    }

    obtenerEstadisticaSalones = () => {
        return this.reserva.llamarSpEstadisticaSalon();
    }

    obtenerEstadisticaIngresos = () => {
        return this.reserva.llamarSpEstadisticaIngresos();
    }

    obtenerEstadisticaTopServicios = () => {
        return this.reserva.llamarSpEstadisticaTopServicios();
    }
}