import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse-fixed');

export const parsePdf = async (buffer) => {
    const data = await pdfParse(buffer);
    return data;
};