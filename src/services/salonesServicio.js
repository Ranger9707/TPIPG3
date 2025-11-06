import Salones from "../db/salones.js";

export default class SalonesServicio {
    constructor(){
        this.salones = new Salones();
    }

    buscarTodos = () => {
        return this.salones.buscarTodos();
    }

    buscarPorId = (salon_id) => {
        return this.salones.buscarPorId(salon_id);
    }

    crear = (salon) => {
        return this.salones.crear(salon);
    }

    editar = (salon_id, datos) => {
        const existe = this.salones.buscarPorId(salon_id);
        if(!existe){
            return null;
        }
        return this.salones.editar(salon_id, datos);
    }

    eliminar = (salon_id) => {
        return this.salones.eliminar(salon_id);
    }
}