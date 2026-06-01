// /app/utils/pdfParser.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const parsePdf = async (buffer) => {
    // The real pdf-parse library works as a simple, direct function
    const data = await pdfParse(buffer);
    return data;
};