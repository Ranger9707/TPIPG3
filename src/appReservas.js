import express from 'express';
import path from 'path';
import passport from 'passport';
import morgan from 'morgan';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

import { readFileSync } from 'fs';
const swaggerFile = JSON.parse(readFileSync('./swagger-output.json'));

import { router as SalonesRutasV1} from './v1/routes/salonesRutas.js';
import { router as ReservasRutasV1} from './v1/routes/reservasRutas.js';
import { router as AuthRutaV1} from './v1/routes/authRutas.js';
import { router as ServiciosRutasV1} from './v1/routes/serviciosRutas.js';
import { router as TurnosRutasV1} from './v1/routes/turnosRutas.js';
import { router as UsuariosRutasV1} from './v1/routes/usuariosRutas.js';

import {strategy, validation} from './config/passport.js';

const app = express();

app.use(express.json());
passport.use(strategy);
passport.use(validation);
app.use(passport.initialize());

const logDirectory = path.resolve('./logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}
let log = fs.createWriteStream(path.join(logDirectory, 'access.log'), {flags: 'a'});
app.use(morgan('combined', {stream: log}));
app.use(morgan('combined'))

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use('/api/v1/auth', AuthRutaV1);
app.use('/api/v1/salones', passport.authenticate('jwt', { session: false }), SalonesRutasV1);
app.use('/api/v1/reservas', passport.authenticate( 'jwt', { session:false }), ReservasRutasV1);
app.use('/api/v1/servicios', passport.authenticate('jwt', { session: false }), ServiciosRutasV1);
app.use('/api/v1/turnos', passport.authenticate('jwt', { session: false }), TurnosRutasV1);
app.use('/api/v1/usuarios', passport.authenticate('jwt', { session: false }), UsuariosRutasV1);

export default app;