import express from 'express';
import SalonesControlador from '../../controllers/salonesControlador.js';

const salonesControlador = new SalonesControlador();

const router = express.Router();  

router.get('/', salonesControlador.buscarTodos);
router.post('/', salonesControlador.crear);
router.put('/:salon_id', salonesControlador.editar);
router.delete('/:salon_id', salonesControlador.eliminar);
router.get('/:salon_id', salonesControlador.buscarPorId);

export { router }; 