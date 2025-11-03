import jwt from 'jsonwebtoken';
import passport from 'passport';

export default class AuthController {
  login = async (req, res) => {
    passport.authenticate('local', { session: false }, (error, usuario, info) => {
      if (error || !usuario) {
        return res.status(400).json({
          estado: false,
          message: info?.message || 'Error en la autenticación'
        });
      }

      req.login(usuario, { session: false }, (err) => {
        if (err) {
          return res.status(500).json({ estado: false, message: 'Error interno' });
        }

        const payload = {
          usuario_id: usuario.usuario_id,
          tipo_usuario: usuario.tipo_usuario
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        return res.json({
          estado: true,
          token
        });
      });
    })(req, res);
  };
}
