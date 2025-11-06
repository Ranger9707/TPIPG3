import app from "./appReservas.js";

process.loadEnvFile();

app.listen(process.env.PUERTO, () => {
    console.log(`Server esta corriendo en el puerto ${process.env.PUERTO}`);
});