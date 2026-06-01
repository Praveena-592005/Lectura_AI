import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfLib = require('pdf-parse');

export const parsePdf = async (buffer) => {
    // The logs show that your 'pdf-parse' package is actually exposing a class/object structure
    // We will target the PDFParse class found in the logs
    const parser = pdfLib.PDFParse || pdfLib;

    if (typeof parser === 'function') {
        return await parser(buffer);
    }

    // If it's a class/object, handle it as a standard async call
    if (typeof parser.parse === 'function') {
        return await parser.parse(buffer);
    }

    throw new Error(`PDF library structure not recognized. Available: ${JSON.stringify(Object.keys(pdfLib))}`);
};