//TP FINAL NO VA A USAR DELETE, SE  PUEDE USAR PATCH PARA MODIFICAR CAMPO ACTIVO


// app.post("/notificacion", async (req, res) => {
    
//     if(!req.body.fecha || !req.body.salon || !req.body.turno || !req.body.correoDestino) {
//         res.status(400).send({"estado":false, "error":"Faltan campos requeridos"});
//     }

//     try{
//         const { fecha, salon, turno, correoDestino } = req.body;

//         const __filename = fileURLToPath(import.meta.url);
//         const __dirname = path.dirname(__filename);
//         const plantilla = path.join(__dirname, 'utiles', 'handlebars', "plantilla.hbs");
        
//         const archivoHbs = await readFile(plantilla, 'utf-8');
//         const template = handlebars.compile(archivoHbs);
        
//         var html = template({fecha: fecha, salon: salon, turno: turno});


//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL,
//                 pass: process.env.PASSWORD
//             }
//         });

//         const opciones = { 
//             to: correoDestino,
//             html: html,
//             subject: "Notificación de reserva",
//         };

//         transporter.sendMail(opciones, (error, info) => {
//             if(error){
//                 console.log(error);
//                 res.json({"ok" :false, "mensaje":"Error al enviar el correo"});
//             }
//             console.log("Correo enviado: " + info.response);
//             res.json({"ok": true, "mensaje": "Correo enviado correctamente"});
//         });


    
//     }catch(error){
//         console.log(error);
//     }

   
// });
