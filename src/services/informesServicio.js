import { createObjectCsvWriter } from 'csv-writer';
import puppeteer from "puppeteer"; 
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class InformeServicio {
    informeReservasCsv = async (datosReporte) => {
        try{
            let ruta = path.resolve(__dirname, '../../logs/reporte_reservas.csv');
            const dir = path.dirname(ruta);
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }

            const csvWriter = createObjectCsvWriter({
                path: ruta,
                header: [
                    {id: 'reserva_id', title: 'ID Reserva'},
                    {id: 'fecha_reserva', title: 'Fecha'},
                    {id: 'salon', title: 'Salón'},
                    {id: 'turno', title: 'Turno'},
                    {id: 'cliente', title: 'Cliente'},
                    {id: 'tematica', title: 'Temática'},
                    {id: 'importe_total', title: 'Importe Total'},
                    {id: 'servicios_contratados', title: 'Servicios'}
                ]
            });
            
            await csvWriter.writeRecords(datosReporte);
            return ruta; 
            
        }catch (error){
            console.log(`Error generando csv ${error}`);
            throw error; 
        }
    }

    informeReservasPdf = async (datosReporte) => {
        let browser; 
        try{
            const plantillaPath = path.join(__dirname, '../utiles/handlebars/informe.hbs');
            
            if (!fs.existsSync(plantillaPath)) {
                throw new Error(`Plantilla no encontrada en ${plantillaPath}. (Asegúrate de crearla)`);
            }

            const plantillaHtml = fs.readFileSync(plantillaPath , 'utf8');
            const template = handlebars.compile(plantillaHtml);
            
            const htmlFinal = template({ reservas: datosReporte });
            
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            let page = await browser.newPage();
            await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true
            });

            return buffer; 

        }catch(error){
            console.error('Error generando el PDF:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close(); 
            }
        }
    }

    informeEstadisticasPdf = async (datosEstadisticas) => {
        let browser; 
        try{
            const plantillaPath = path.join(__dirname, '../utiles/handlebars/estadisticas.hbs');
            
            if (!fs.existsSync(plantillaPath)) {
                throw new Error(`Plantilla no encontrada en ${plantillaPath}.`);
            }

            const plantillaHtml = fs.readFileSync(plantillaPath , 'utf8');
            const template = handlebars.compile(plantillaHtml);
            const htmlFinal = template({ estadisticas: datosEstadisticas });
            
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            let page = await browser.newPage();
            await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true
            });

            return buffer; 

        }catch(error){
            console.error('Error generando el PDF de estadísticas:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close(); 
            }
        }
    }


}