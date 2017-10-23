'use strict';
const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

module.exports = function (db) {
    // Clean files older than 1 day in static
    db.find({}, (err, allPdf) => {
        if (err) return console.error(err);
        for (let item of allPdf) {
            if (moment(item.created).add(1, 'day').unix() < moment().unix()) {
                db.remove({ _id: item._id });
                fs.removeSync(path.join(config.pdf, `${item._id}.pdf`));
            }
        }
    });
};
