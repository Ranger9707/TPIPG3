import ReservasServicio from "../services/reservasServicio.js";

export default class ReservasControlador{

    constructor(){
        this.reservasServicio = new ReservasServicio();
    }

    crear = async (req, res) => {
        try {
            
            const {
                fecha_reserva,
                salon_id,
                usuario_id,
                turno_id,
                foto_cumpleaniero, 
                tematica,
                importe_salon,
                importe_total,
                servicios } = req.body;

            const reserva = {
                fecha_reserva,
                salon_id,
                usuario_id,
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
            const reservas = await this.reservasServicio.buscarTodos();

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
            const filasAfectadas = await this.reservasServicio.eliminar(reserva_id);
    
            if(filasAfectadas === 0) {
                return res.status(404).json({estado: false, mensaje: "Reserva no encontrada"});
            }
    
            res.json({estado: true, mensaje: "Reserva eliminada"});
        }catch(error){
            console.log("error en DELETE /reservas/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

}
