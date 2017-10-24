'use strict';
const { app } = require('electron');
const platform = require('electron-platform');

module.exports = (show = true) => {
    if (platform.isDarwin) {
        if (show) app.dock.show();
        else app.dock.hide();
    }
};
