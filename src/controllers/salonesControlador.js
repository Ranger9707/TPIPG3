import SalonesServicio from "../services/salonesServicio.js";
import apicache from 'apicache';

export default class SalonesControlador {
    constructor(){
        this.salonesServicio = new SalonesServicio();
    }

    buscarTodos = async (req, res) => {
        try{
            const salones = await this.salonesServicio.buscarTodos();
            res.json({estado: true, datos: salones}); 
        }catch(error){
            console.log("error en la consulta GET /salones", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

    buscarPorId = async (req, res) => {
        try{
            const { salon_id } = req.params;
            const salon = await this.salonesServicio.buscarPorId(salon_id);
            if(!salon) {
                return res.status(404).json({estado: false, mensaje: "Salón no encontrado"});
            }
            res.json({estado: true, datos: salon}); 
        }catch(error){
            console.log("error en la consulta GET /salones/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

    crear = async (req, res) => {
        try {
            const {titulo, direccion, capacidad, importe} = req.body;

            const salon =  {
                titulo, direccion, capacidad, importe
            } 
            const nuevoSalon = await this.salonesServicio.crear(salon);
            if (!nuevoSalon) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Salón no creado'
                })
            }
            apicache.clear('/api/v1/salones');
            res.status(201).json({ 
                estado: true, 
                mensaje: 'Salón creado!',
                datos: nuevoSalon 
            });
        } catch (err) {
            console.log('Error en POST /salones/', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }

    editar = async (req, res) => {        
        try {
            const salon_id = req.params.salon_id;
            const datos = req.body;
            const salonModificado = await this.salonesServicio.editar(salon_id, datos);

            if (!salonModificado) {
                return res.status(404).json({
                    estado: false,
                    mensaje: 'Salón no encontrado para ser modificado.'
                })
            }
            apicache.clear('/api/v1/salones');
            res.json({
                estado: true, 
                mensaje: 'Salón modificado!',
                datos: salonModificado 
            });
        } catch (err) {
            console.log('Error en PUT /salones/:salon_id', err);
            res.status(500).json({
                estado: false,
                mensaje: 'Error interno del servidor.'
            });
        }
    }
    
    eliminar = async (req, res) => {
        try{
            const { salon_id } = req.params;
            const filasAfectadas = await this.salonesServicio.eliminar(salon_id);
            if(filasAfectadas === 0) {
                return res.status(404).json({estado: false, mensaje: "Salón no encontrado"});
            }
            apicache.clear('/api/v1/salones');
            res.json({estado: true, mensaje: "Salón eliminado"});
        }catch(error){
            console.log("error en la consulta DELETE /salones/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }
}