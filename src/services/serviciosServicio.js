import Servicios from "../db/servicios.js";

export default class ServiciosServicio {
    constructor() {
        this.servicios = new Servicios();
    }

    buscarTodos = () => {
        return this.servicios.buscarTodos();
    }

    buscarPorId = (servicio_id) => {
        return this.servicios.buscarPorId(servicio_id);
    }

    crear = (servicio) => {
        return this.servicios.crear(servicio);
    }

    editar = (servicio_id, datos) => {
        const existe = this.servicios.buscarPorId(servicio_id);
        if (!existe) {
            return null;
        }
        return this.servicios.editar(servicio_id, datos);
    }

    eliminar = (servicio_id) => {
        return this.servicios.eliminar(servicio_id);
    }
}