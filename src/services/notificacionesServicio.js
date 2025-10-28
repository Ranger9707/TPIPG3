import nodemailer from 'nodemailer';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

export default class notificacionesServicio {

    enviarCorreo = async (correoDatos) => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const plantillaPath = path.join(__dirname, '../utiles/handlebars/plantilla.hbs');
        const plantilla = fs.readFileSync(plantillaPath, 'utf-8');

        const template = handlebars.compile(plantilla);
        const datos = {
            fecha: correoDatos.fecha,
            salon: correoDatos.salon,
            turno: correoDatos.turno,
        };
        const correoHTML = template(datos);
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.USEREMAIL,
                pass: process.env.PASSWORDEMAIL
            },
        });

        const mailOptions = {
            to: correoDatos.para,
            subject: correoDatos.asunto,
            html: correoHTML,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.json({ mensaje: 'Error al enviar el correo', error: error });
            }
            res.json({ mensaje: 'Correo enviado correctamente', info: info });
        });
    }

    enviarMensaje = async (datos)  => {}
    enviarWhatsApp = async (datos)  => {}
    enviarNotificacionPush = async (datos)  => {}
}