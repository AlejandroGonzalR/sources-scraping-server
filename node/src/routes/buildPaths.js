const path = require('path');
const buildPaths = {
    buildPathHtml: path.resolve('./out/report.html'),
    buildPathPdf: path.resolve('./out/generated/Report.pdf'),
    buildPathScraping: path.resolve('./out/generated/'),
    outZipPath: path.resolve('./out/'),
    buildPathZip: path.resolve('./public/'),
};

module.exports = buildPaths;
