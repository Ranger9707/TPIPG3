import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt"; 
import { Strategy as LocalStrategy } from "passport-local";
import usuariosService from "../services/usuariosServicio.js"; 

const strategy = new LocalStrategy(
  {
    usernameField: 'nombre_usuario',
    passwordField: 'contrasenia',
  },
    async (nombre_usuario, contrasenia, done) => {
        try{
            const servicio = new usuariosService();
            const usuario = await servicio.buscarUsuario(nombre_usuario, contrasenia); 
            if(!usuario){
                return done (null, false, {message: 'Nombre de usuario o contraseña incorrectos'});
            }
            return done (null, usuario, {message: 'Autenticación exitosa'});
        }
        catch (exc){
            done (exc);
        }
    }
);

const validation = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
        secretOrKey: process.env.JWT_SECRET
    },
    async (jwtPayload, done) => {
        const servicio = new usuariosService();
        const usuario = await servicio.buscarUsuarioPorId(jwtPayload.usuario_id); 
        if (!usuario){
            return done (null, false, {message: 'Token inválido'});
        }
        return done (null, usuario);
    }
);

export {strategy, validation};