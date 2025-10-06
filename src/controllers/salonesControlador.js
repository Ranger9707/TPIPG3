import SalonesServicio from "../services/salonesServicio.js";

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
        try{
            const { titulo, direccion, capacidad, importe } = req.body;
            if(!titulo || !direccion || !capacidad || !importe){
                return res.status(400).json({estado: false, mensaje: "Faltan datos"});
            }
            const nuevoSalonId = await this.salonesServicio.crear(req.body);
            res.status(201).json({ estado: true, mensaje: `Salón creado con ID: ${nuevoSalonId}` });
        }catch(error){
            console.log("error en la consulta POST /salones", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }

    editar = async (req, res) => {
        try{
            const { salon_id } = req.params;
            const { titulo, direccion, capacidad, importe } = req.body;
            if(!titulo || !direccion || !capacidad || !importe){
                return res.status(400).json({estado: false, mensaje: "Faltan datos"});
            }
            const filasAfectadas = await this.salonesServicio.editar(salon_id, req.body);
            if(filasAfectadas === 0) {
                return res.status(404).json({estado: false, mensaje: "Salón no encontrado"});
            }
            res.json({estado: true, mensaje: "Salón actualizado"});
        }catch(error){
            console.log("error en la consulta PUT /salones/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }
    
    eliminar = async (req, res) => {
        try{
            const { salon_id } = req.params;
            const filasAfectadas = await this.salonesServicio.eliminar(salon_id);
            if(filasAfectadas === 0) {
                return res.status(404).json({estado: false, mensaje: "Salón no encontrado"});
            }
            res.json({estado: true, mensaje: "Salón eliminado"});
        }catch(error){
            console.log("error en la consulta DELETE /salones/:id", error);
            res.status(500).json({estado: false, mensaje: "Error del servidor"});
        }
    }
        
    }
