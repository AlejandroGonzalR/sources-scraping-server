const fs = require('fs');
const archiver = require('archiver');

exports.zipDirectory = (source, out) => {
    const stream = fs.createWriteStream(out);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
};
