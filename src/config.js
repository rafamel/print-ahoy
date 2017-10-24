'use strict';
const path = require('path');
const { app } = require('electron');

module.exports = {
    production: process.env.NODE_ENV === 'production',
    assets: path.join(__dirname, 'assets')
};
