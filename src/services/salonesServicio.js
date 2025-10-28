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

    editar = (salon_id, salon) => {
        return this.salones.actualizar(salon_id, salon);
    }

    eliminar = (salon_id) => {
        return this.salones.eliminar(salon_id);
    }
}