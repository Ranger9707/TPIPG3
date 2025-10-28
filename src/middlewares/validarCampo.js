import { validationResult } from "express-validator";

export const validarCampo = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({
            estado: "Fallo",
            mensaje: errores.mapped()
        });
    }
    next(); 
};