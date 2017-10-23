'use strict';
const path = require('path');
const { app } = require('electron');

const userData = app.getPath('userData');
module.exports = {
    production: process.env.NODE_ENV === 'production',
    assets: path.join(__dirname, 'assets'),
    pdf: path.join(userData, 'pdf'),
    db: path.join(userData, 'pdf.db')
};
