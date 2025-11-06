import ServiciosServicio from "../services/serviciosServicio.js";
import apicache from "apicache";

export default class ServiciosControlador {
    constructor(){
        this.serviciosServicio = new ServiciosServicio();
    }

    buscarTodos = async (req, res) => {
        try {
            const servicios = await this.serviciosServicio.buscarTodos();
            res.json({estado: true, datos: servicios});
        } catch (error) {
            console.log("error en GET /servicios", error);
            res.status(500).json({estado: false, mensaje: "Error al obtener los servicios"});
        }
    }

    buscarPorId = async (req, res) => {
        try {
            const {servicio_id} = req.params;
            const servicio = await this.serviciosServicio.buscarPorId(servicio_id);
            if(!servicio){
                return res.status(404).json({estado: false, mensaje: "Servicio no encontrado"});
            }
            res.json({estado: true, datos: servicio});
        } catch (error) {
            console.log("error en GET /servicios/:servicio_id", error);
            res.status(500).json({estado: false, mensaje: "Error al obtener el servicio"});
        }
    }

    crear = async (req, res) => {
        try {
            const {descripcion, importe} = req.body;
            const servicio = {descripcion, importe};
            const nuevoServicio = await this.serviciosServicio.crear(servicio);

            if(!nuevoServicio){
                return res.status(404).json({estado: false, mensaje: "No se pudo crear el servicio"});
            }
            apicache.clear('/api/v1/servicios');
            res.status(201).json({estado: true, datos: nuevoServicio, mensaje: "Servicio creado exitosamente"});
        } catch (error) {
            console.log("error en POST /servicios", error);
            res.status(500).json({estado: false, mensaje: "Error interno"});
        }
    }

    editar = async (req, res) => {
        try {
            const {servicio_id} = req.params;
            const datos = req.body;
            const servicioModificado = await this.serviciosServicio.editar(servicio_id, datos);

            if(!servicioModificado){
                return res.status(404).json({estado: false, mensaje: "Servicio no encontrado o no se pudo modificar"});
            }
            apicache.clear('/api/v1/servicios');
            res.json({estado: true, datos: servicioModificado, mensaje: "Servicio modificado exitosamente"});
        } catch (error) {
            console.log("error en PUT /servicios/:servicio_id", error);
            res.status(500).json({estado: false, mensaje: "Error interno del servdior"});
        }
    }

    eliminar = async (req, res) => {
        try {
            const {servicio_id} = req.params;
            const filasAfectadas = await this.serviciosServicio.eliminar(servicio_id);

            if(filasAfectadas === 0){
                return res.status(404).json({estado: false, mensaje: "Servicio no encontrado o no se pudo eliminar"});
            }
            apicache.clear('/api/v1/servicios');
            res.json({estado: true, mensaje: "Servicio eliminado exitosamente"});
        } catch (error) {
            console.log("error en DELETE /servicios/:servicio_id", error);
            res.status(500).json({estado: false, mensaje: "Error interno del servdior"});
        }
    }
}