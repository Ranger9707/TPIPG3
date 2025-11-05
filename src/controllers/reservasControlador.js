import ReservasServicio from "../services/reservasServicio.js";
import InformeServicio from "../services/informesServicio.js"; 
import Reservas from "../db/reservas.js"; 

export default class ReservasControlador{

    constructor(){
        this.reservasServicio = new ReservasServicio();
        this.informeServicio = new InformeServicio();
        this.reservasDB = new Reservas();
    }

    crear = async (req, res) => {
        try {
            
            const {
                fecha_reserva,
                salon_id,
                turno_id,
                foto_cumpleaniero, 
                tematica,
                importe_salon,
                importe_total,
                servicios } = req.body;
            const usuario_id_token = req.user.usuario_id;

            const reserva = {
                fecha_reserva,
                salon_id,
                usuario_id: usuario_id_token,
                turno_id,
                foto_cumpleaniero, 
                tematica,
                importe_salon,
                importe_total, 
                servicios
            };

            const nuevaReserva = await this.reservasServicio.crear(reserva)

            if (!nuevaReserva) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Reserva no creada'
                })
            }

            res.json({
                estado: true, 
                mensaje: 'Reserva creada!',
                salon: nuevaReserva
            });
    
        } catch (err) {
            console.log('Error en POST /reservas/', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }
    
    buscarTodos = async (req, res) => {
        try {
            const reservas = await this.reservasServicio.buscarTodos(req.user);

            res.json({
                estado: true, 
                datos: reservas
            });
    
        } catch (err) {
            console.log('Error en GET /reservas', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }

    buscarPorId = async (req, res) => {
        try {
            const reserva_id = req.params.reserva_id;
            const reserva = await this.reservasServicio.buscarPorId(reserva_id);

            if (!reserva) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Reserva no encontrada.'
                })
            }

            res.json({
                estado: true, 
                reserva: reserva
            });
    
        } catch (err) {
            console.log('Error en GET /reservas/reservas_id', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }

    editar = async (req, res) => {
        try {
            const { reserva_id } = req.params;
            const datos = req.body; 
            if (datos.usuario_id) {
                delete datos.usuario_id;
            }

            const reservaModificada = await this.reservasServicio.editar(reserva_id, datos);
    
            if (!reservaModificada) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Reserva no encontrada para modificar.'
                });
            }
    
            res.json({
                estado: true, 
                mensaje: 'Reserva y servicios modificados!', // Mensaje actualizado
                datos: reservaModificada
            });
        } catch (err) {
            console.log('Error en PUT /reservas/:id', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }
    
    eliminar = async (req, res) => {
        try{
            const { reserva_id } = req.params;
            const filasAfectadas = await this.reservasServicio.eliminar(reserva_id, req.user);
    
            if(filasAfectadas === 0) {
                return res.status(404).json({estado: false, mensaje: "Reserva no encontrada"});
            }
    
            res.json({estado: true, mensaje: "Reserva eliminada"});
        }catch(error){
            console.log("error en DELETE /reservas/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

    generarReporteCsv = async (req, res) => {
        try {
            const datos = await this.reservasDB.llamarSpReporteReservas();

            if (!datos || datos.length === 0) {
                return res.status(404).json({ estado: false, mensaje: "No hay datos de reservas para reportar." });
            }

            const rutaArchivo = await this.informeServicio.informeReservasCsv(datos);

            res.download(rutaArchivo, 'reporte_reservas.csv');

        } catch (error) {
            console.log("Error en generarReporteCsv:", error);
            res.status(500).json({ estado: false, mensaje: "Error interno del servidor." });
        }
    }

    generarReportePdf = async (req, res) => {
        try {
            const datos = await this.reservasDB.llamarSpReporteReservas();

            if (!datos || datos.length === 0) {
                return res.status(404).json({ estado: false, mensaje: "No hay datos de reservas para reportar." });
            }

            const pdfBuffer = await this.informeServicio.informeReservasPdf(datos);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Length': pdfBuffer.length,
                'Content-Disposition': 'attachment; filename="reporte_reservas.pdf"'
            });
            res.send(pdfBuffer);

        } catch (error) {
            console.log("Error en generarReportePdf:", error);
            res.status(500).json({ estado: false, mensaje: "Error interno del servidor." });
        }
    }

    generarEstadisticaSalones = async (req, res) => {
        try {
            const datos = await this.reservasServicio.obtenerEstadisticaSalones();
            res.json({ estado: true, datos: datos });
        } catch (error) {
            console.log("Error en generarEstadisticaSalones:", error);
            res.status(500).json({ estado: false, mensaje: "Error interno del servidor." });
        }
    }

    generarEstadisticaIngresos = async (req, res) => {
        try {
            const datos = await this.reservasServicio.obtenerEstadisticaIngresos();
            res.json({ estado: true, datos: datos });
        } catch (error) {
            console.log("Error en generarEstadisticaIngresos:", error);
            res.status(500).json({ estado: false, mensaje: "Error interno del servidor." });
        }
    }

    generarEstadisticaTopServicios = async (req, res) => {
        try {
            const datos = await this.reservasServicio.obtenerEstadisticaTopServicios();
            res.json({ estado: true, datos: datos });
        } catch (error) {
            console.log("Error en generarEstadisticaTopServicios:", error);
            res.status(500).json({ estado: false, mensaje: "Error interno del servidor." });
        }
    }

    generarReporteEstadisticasPdf = async (req, res) => {
        try {
            //conjunto de datos
            const datosSalones = await this.reservasServicio.obtenerEstadisticaSalones();
            const datosIngresos = await this.reservasServicio.obtenerEstadisticaIngresos();
            const datosTopServicios = await this.reservasServicio.obtenerEstadisticaTopServicios();
            const datosCompletos = {
                salones: datosSalones,
                ingresos: datosIngresos,
                topServicios: datosTopServicios
            };

            const pdfBuffer = await this.informeServicio.informeEstadisticasPdf(datosCompletos);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Length': pdfBuffer.length,
                'Content-Disposition': 'attachment; filename="reporte_estadisticas.pdf"'
            });
            res.send(pdfBuffer);

        } catch (error) {
            console.log("Error en generarReporteEstadisticasPdf:", error);
            res.status(500).json({ estado: false, mensaje: "Error interno del servidor." });
        }
    }

    
}