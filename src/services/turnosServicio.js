import Turnos from "../db/turnos.js";

export default class TurnosServicio {
    constructor(){
        this.turnos = new Turnos();
    }

    buscarTodos = () => {
        return this.turnos.buscarTodos();
    }

    buscarPorId = (turno_id) => {
        return this.turnos.buscarPorId(turno_id);
    }

    crear = (turno) => {
        return this.turnos.crear(turno);
    }

    editar = async (turno_id, datos) => {
        const existe = await this.turnos.buscarPorId(turno_id);
        if(!existe){
            return null;
        }
        return this.turnos.editar(turno_id, datos);
    }

    eliminar = (turno_id) => {
        return this.turnos.eliminar(turno_id);
    }
}