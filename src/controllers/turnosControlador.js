import TurnosServicio from "../services/turnosServicio.js";
import apicache from 'apicache';

export default class TurnosControlador {
    constructor(){
        this.turnosServicio = new TurnosServicio();
    }

    buscarTodos = async (req, res) => {
        try{
            const turnos = await this.turnosServicio.buscarTodos();
            res.json({estado: true, datos: turnos});
        }catch(error){
            console.log("error en GET /turnos", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

    buscarPorId = async (req, res) => {
        try{
            const { turno_id } = req.params;
            const turno = await this.turnosServicio.buscarPorId(turno_id);
            if(!turno) {
                return res.status(404).json({estado: false, mensaje: "Turno no encontrado"});
            }
            res.json({estado: true, datos: turno});
        }catch(error){
            console.log("error en GET /turnos/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

    crear = async (req, res) => {
        try {
            const {orden, hora_desde, hora_hasta} = req.body;
            const turno = { orden, hora_desde, hora_hasta };

            const nuevoTurno = await this.turnosServicio.crear(turno);
            
            if (!nuevoTurno) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Turno no creado'
                })
            }

            apicache.clear('/api/v1/turnos');
            res.status(201).json({
                estado: true, 
                mensaje: 'Turno creado!',
                datos: nuevoTurno
            });
        } catch (err) {
            console.log('Error en POST /turnos/', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }

    editar = async (req, res) => {
        try {
            const { turno_id } = req.params;
            const datos = req.body;
            const turnoModificado = await this.turnosServicio.editar(turno_id, datos);

            if (!turnoModificado) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Turno no encontrado para modificar.'
                })
            }

            apicache.clear('/api/v1/turnos'); 
            res.json({
                estado: true, 
                mensaje: 'Turno modificado!',
                datos: turnoModificado
            });
        } catch (err) {
            console.log('Error en PUT /turnos/:id', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }
    
    eliminar = async (req, res) => {
        try{
            const { turno_id } = req.params;
            const filasAfectadas = await this.turnosServicio.eliminar(turno_id);

            if(filasAfectadas === 0) {
                return res.status(404).json({estado: false, mensaje: "Turno no encontrado"});
            }

            apicache.clear('/api/v1/turnos'); 
            res.json({estado: true, mensaje: "Turno eliminado"});
        }catch(error){
            console.log("error en DELETE /turnos/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }
}