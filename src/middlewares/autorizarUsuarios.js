export default function autorizarUsuarios(tiposPermitidos = []) {
  return (req, res, next) => {
    const usuario = req.user; 
    if (!usuario || !tiposPermitidos.includes(usuario.tipo_usuario)) {
      return res.status(403).json({ estado: false, mensaje: 'Acceso no autorizado' });
    }
    next();
  };
}
