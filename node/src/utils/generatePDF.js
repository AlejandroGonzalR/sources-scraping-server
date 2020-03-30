const fs = require('fs');
const pdf = require('html-pdf');
const { buildPathHtml, buildPathPdf } = require('../routes/buildPaths');

const pdfOptions = {
    format: 'A4',
    border: {
        top: '1.54cm',
        right: '1.54cm',
        bottom: '1.54cm',
        left: '1.54cm'
    },
    paginationOffset: 1,
    header: {
        height: '20mm'
    },
    footer: {
        height: '10mm'
    }
};

exports.printPdf = () => {
    let html = fs.readFileSync(buildPathHtml, 'utf8');

    return new Promise(resolve => {
        pdf
            .create(html, pdfOptions)
            .toFile(buildPathPdf, (err, res) => {
                if (err) return console.log(err);
                console.log('Successfully created PDF file.');
                resolve(res);
        })
    });
};
