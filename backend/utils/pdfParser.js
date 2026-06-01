// backend/utils/pdfParser.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const parsePdf = async (buffer) => {
    // This logic handles both ESM and CommonJS quirks safely
    const parser = (typeof pdfParse === 'function') ? pdfParse : (pdfParse.default || pdfParse);
    
    if (typeof parser !== 'function') {
        throw new Error("PDF parser could not be loaded as a function");
    }
    
    return await parser(buffer);
};