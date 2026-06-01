import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfLib = require('pdf-parse');

export const parsePdf = async (buffer) => {
    // 1. The logs confirm 'PDFParse' is a class constructor
    const parserInstance = new pdfLib.PDFParse();
    
    // 2. We wrap this in a Promise because these class-based parsers 
    // often use event emitters or callbacks rather than direct return values
    return new Promise((resolve, reject) => {
        parserInstance.on('pdfParser_dataReady', (pdfData) => {
            // Depending on the version, data is in 'pdfData'
            resolve({ text: pdfData.Pages.map(p => p.Texts.map(t => decodeURIComponent(t.R[0].T)).join(' ')).join('\n') });
        });
        
        parserInstance.on('pdfParser_dataError', (err) => {
            reject(err);
        });

        parserInstance.parseBuffer(buffer);
    });
};