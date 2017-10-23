'use strict';
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

module.exports = async function (db, filePath) {
    const x = path.basename(filePath);

    // Add to db
    const val = await new Promise((resolve, reject) => {
        db.insert({ created: (new Date()).getTime() }, (err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
    console.log(`[DB] ADD ${x}`);

    // Move file
    const newPath = path.join(config.pdf, `${val._id}.pdf`);
    fs.moveSync(filePath, newPath);
    console.log(`[Drop] MOVE ${x}`);

    // Return file path
    return `file://${newPath}`;
};
