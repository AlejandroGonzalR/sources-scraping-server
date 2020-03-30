'use strict';

const fs = require('fs');
const path = require ('path');
const rimraf = require('rimraf');
const scrape = require('website-scraper');
const pdf_template = require('../utils/buildPDFTemplate');
const pdf_generator = require('../utils/generatePDF');
const notifier = require('../utils/notifyJob');
const { buildPathPdf, buildPathScraping, buildPathZip, outZipPath } = require('../routes/buildPaths');
const compress = require('../utils/compressReport');
let counter = 1;

exports.sendFile = (req, email) => {
    let urlHostname = getHostname(req);

    scrapWebsite(req, urlHostname)
        .then(_ => generateReport(urlHostname,email))
        .catch(err => {
            console.log('Error scraping: ', err);
        });
};

async function generateReport(urlHostname,email) {
    let filesData = customSort(getAllfiles(buildPathScraping));
    let zipOutPath = `${buildPathZip}/Request-${counter}.zip`;

    await createPdf(filesData, urlHostname);
    await compress.zipDirectory(buildPathScraping, zipOutPath)
        .then(() => {
            deleteGenerated();
            notifier.sendMail(`http://127.0.0.1:5000/files/Request-${counter}.zip`,email)
        })
        .catch(err => {
            console.log(err);
        });
    counter++;
}

async function scrapWebsite(url, name) {
    let scrapDirectory = `${buildPathScraping}/assets`;

    if (fs.existsSync(scrapDirectory)) {
        scrapDirectory = scrapDirectory + counter.toString();
    }

    const options = {
        urls: [url],
        // directory: `${buildPathScraping}/${name}`
        directory: scrapDirectory
    };

    await scrape(options, (error, result) => {
        if(error) {
            console.log(error)
        }
    });
}

async function createPdf(data, title) {
    let file, stat;
    await pdf_template.generatePdfTemplate(title, data);
    await pdf_generator.printPdf()
        .then(() => {
            file = fs.createReadStream(buildPathPdf);
            stat = fs.statSync(buildPathPdf);
        });
}

function customSort(array) {
    array.sort(function(a, b) {
        return parseFloat(a.size) - parseFloat(b.size);
    });

    return array
}

function deleteGenerated() {
    rimraf(outZipPath,  () => {
        console.log('out deleted');
    });
}

const getHostname = (url) => {
    let urlAux = new URL(url).href;
    let urlParts = urlAux.split(".");
    return urlParts[1]
};

const getAllfiles = function(dirPath, arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllfiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            let pathAux = dirPath.split('/usr/src/app/out/generated').pop();
            let fileObject = {
                name: path.join(pathAux, file),
                size: fs.statSync(path.join( dirPath, file)).size,
                sizeNormalize: getTotalSize(path.join( dirPath, file))
            };
            arrayOfFiles.push(fileObject);
        }
    });

    return arrayOfFiles
};

const convertBytes = function(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) {
        return "n/a"
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i === 0) {
        return bytes + " " + sizes[i]
    }
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
};

const getTotalSize = function(directoryPath) {
    return convertBytes(fs.statSync(directoryPath).size)
};
