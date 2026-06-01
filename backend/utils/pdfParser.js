import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const parsePdf = async (buffer) => {
    console.log("PDF LIB STRUCTURE:", Object.keys(pdfParse));
    console.log("PDF LIB TYPE:", typeof pdfParse);

    // Try to find the function dynamically
    let parser = null;
    if (typeof pdfParse === 'function') {
        parser = pdfParse;
    } else if (pdfParse.default && typeof pdfParse.default === 'function') {
        parser = pdfParse.default;
    } else if (pdfParse.pdf && typeof pdfParse.pdf === 'function') {
        parser = pdfParse.pdf;
    }

    if (typeof parser !== 'function') {
        throw new Error(`PDF parser could not be loaded. Structure: ${JSON.stringify(Object.keys(pdfParse))}`);
    }
    
    return await parser(buffer);
};