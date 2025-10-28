import jwt from 'jsonwebtoken';
import passport from 'passport';

export default class AuthController {
    login = async(req,res) => {
        passport.authenticate('local', {session: false}, (error, usuario, info) => {
            if (err || !usuario){
                return res.status(400).json({
                    estado: false,
                    message: 'Error en la autenticación'
                });
            }

            req.login(usuario, {session: false}, (error) => {
                if (error){
                    res.send(error);
                }
                const token = jwt.sign(usuario, process.env.JWT_SECRET, {expiresIn: '8h'});
                return res.json(({
                    estado: true,
                    token: token,
                }));
            })
        })(req, res);
    }
}