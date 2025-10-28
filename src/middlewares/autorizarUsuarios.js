export default function autorizarUsuarios(tiposPermitidos = []) {
    return (req, res, next) => {
        const usuario = req.usuario;
        if (!usuario || !tiposPermitidos.includes(usuario.tipo_usuario)) {
            return res.status(403).json({ mensaje: 'Acceso no autorizado' });
        }
        next();
    };}