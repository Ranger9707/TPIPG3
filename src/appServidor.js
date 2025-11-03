import app from "./appReservas.js";
import { swaggerDocs } from "./swagger.js";
process.loadEnvFile();


swaggerDocs(app);
app.listen(process.env.PUERTO, () => {
    console.log(`Server esta corriendo en el puerto ${process.env.PUERTO}`);
});