import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfLib = require('pdf-parse');

export const parsePdf = async (buffer) => {
    // 1. Identify the class or function
    const Target = pdfLib.PDFParse || pdfLib;

    // 2. If it is a class, we MUST use 'new'
    const instance = (typeof Target === 'function' && Target.prototype && Target.prototype.constructor.name === 'PDFParse') 
        ? new Target() 
        : Target;

    // 3. Some classes need an explicit .parse() call, others are callable directly
    if (typeof instance.parse === 'function') {
        return await instance.parse(buffer);
    } else if (typeof instance === 'function') {
        return await instance(buffer);
    }

    throw new Error("Could not initialize PDF parser.");
};