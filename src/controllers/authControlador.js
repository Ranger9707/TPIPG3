import jwt from 'jsonwebtoken';
import passport from 'passport';
import UsuariosServicio from '../services/usuariosServicio.js'; 

export default class AuthController {
  constructor() {
    this.usuariosServicio = new UsuariosServicio();
  }

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

  getMiPerfil = async (req, res) => {
    try {
      const usuario_id = req.user.usuario_id; 
      
      const usuario = await this.usuariosServicio.buscarUsuarioDetalle(usuario_id);

      if (!usuario) {
        return res.status(404).json({ estado: false, mensaje: "Usuario no encontrado." });
      }
      
      res.json({ estado: true, datos: usuario });

    } catch (error) {
      console.log("Error en GET /auth/me", error);
      res.status(500).json({ estado: false, mensaje: "Error interno del servidor." });
    }
  };

  register = async (req, res) => {
    try {
        const { nombre, apellido, nombre_usuario, contrasenia, celular } = req.body;        
        const usuario = {
            nombre, 
            apellido, 
            nombre_usuario, 
            contrasenia, 
            celular, 
            foto: null,
            tipo_usuario: 3 //  Forzamos rol a Cliente
        };

        if (req.file){
            usuario.foto = req.file.path;
        }

        const nuevoUsuario = await this.usuariosServicio.crearUsuario(usuario);
        
        if (!nuevoUsuario) {
            return res.status(400).json({
                estado: false,
                mensaje: 'No se pudo crear el usuario'
            });
        }

        res.status(201).json({
            estado: true, 
            mensaje: '¡Usuario cliente registrado con éxito!',
            datos: nuevoUsuario
        });

    } catch (err) {
        console.log('Error en POST /auth/register', err);
        
        //error mail duplicado
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                estado: false,
                mensaje: 'El email (nombre_usuario) ya está en uso.'
            });
        }

        res.status(500).json({
            estado: false,
            mensaje: 'Error interno del servidor.'
        });
    }
  }


}
