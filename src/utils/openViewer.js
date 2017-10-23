'use strict';
const PDFWindow = require('electron-pdf-window');

module.exports = async function (filePath, printJS) {
    const fileWin = new PDFWindow();

    fileWin.webContents.on('dom-ready', () => {
        fileWin.webContents.executeJavaScript(
            `document.body.style.cursor = 'wait';`
        );
    });

    fileWin.webContents.on('did-finish-load', () => {
        fileWin.webContents.executeJavaScript(printJS);
    });

    fileWin.maximize();
    fileWin.loadURL(filePath);
    // if (!config.production) fileWin.webContents.openDevTools(); // todo

    console.log(`[Window] Open ${filePath}`);
    return fileWin;
};
