import express from 'express';
//import handlebars from 'handlebars';
//import nodemailer from 'nodemailer';
//import {fileURLToPath} from 'url';
//import { readFile } from 'fs/promises';
//import path from 'path';
//import { conexion } from './db/conexion.js';

import {router as SalonesRutasV1} from './v1/routes/salonesRutas.js';

const app = express();
app.use(express.json());
app.use('/api/v1/salones', SalonesRutasV1);



process.loadEnvFile();
app.listen(process.env.PUERTO, () => {
    console.log(`Server esta corriendo en el puerto ${process.env.PUERTO}`);
});


