'use strict';
const PDFWindow = require('electron-pdf-window');
const sleep = require('sleep-promise');
const fs = require('fs-extra');
const dockOnMac = require('./dockOnMac');
const config = require('../config');

module.exports = function (filePath, printJS) {
    const fileWin = new PDFWindow({ show: false });

    fileWin.webContents.on('dom-ready', () => {
        fileWin.webContents.executeJavaScript(
            `document.body.style.cursor = 'wait';`
        );
        fileWin.webContents.insertCSS(
            `body:before, body:after {
                content: "";
                display: block;
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
            }
            body:before {
                z-index: 99998;
                background: #404040;
            }
            body:after {
                z-index: 99999;
                width: 50px;
                height: 50px;
                margin: auto;
                background-image: url("file://${config.assets}/loading-spin.svg");
                background-size: 100% 100%;
            }
            body.loaded:before, body.loaded:after {
                content: none;
            }`
        );
    });

    fileWin.webContents.on('did-finish-load', async () => {
        await sleep(1000);
        fileWin.show();
        dockOnMac(true);
        fileWin.webContents.executeJavaScript(printJS);
    });

    fileWin.on('close', () => {
        dockOnMac(false);
        fs.removeSync(filePath);
        console.log(`[File] Remove ${filePath}`);
    });

    console.log(`[Window] Open ${filePath}`);
    fileWin.loadURL(`file://${filePath}`);
    fileWin.maximize();

    return fileWin;
};
