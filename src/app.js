'use strict';
const { app, Tray, Menu, dialog } = require('electron');
const chokidar = require('chokidar');
const settings = require('electron-settings');
const path = require('path');
const fs = require('fs-extra');

const config = require('./config');
const dockOnMac = require('./utils/dockOnMac');
const openViewer = require('./utils/openViewer');

let appIcon;

app.on('ready', () => {
    // Initialize
    const printJS = fs.readFileSync(path.join(config.assets, 'print.js'), 'utf8');
    const state = {
        stack: [],
        open: false,
        watcher: null
    };
    dockOnMac(false);

    // Choose Path or retrieve from settings
    if (!settings.has('watchPath')) choosePath();
    else {
        const path = settings.get('watchPath');
        state.watcher = watcher(path);
    }
    function choosePath() {
        dockOnMac(true);
        dialog.showOpenDialog({ properties: ['openDirectory'] }, (path) => {
            dockOnMac(false);
            if (path) {
                if (state.watcher) state.watcher.close();
                settings.set('watchPath', path);
                state.watcher = watcher(path);
            } else console.log('No path selected');
        });
    }

    // Watcher
    function watcher(path) {
        return chokidar
            // eslint-disable-next-line
            .watch(path, { ignored: /(^|[\/\\])\../, depth: 1 })
            .on('add', (path, info) => {
                if (state.open) state.stack.push(path);
                else {
                    state.open = true;
                    openViewer(path, printJS);
                }
            });
    }

    // Run next on stack if one print task has finished
    app.on('window-all-closed', () => {
        if (!state.stack.length) {
            state.open = false;
        } else {
            state.open = true;
            openViewer(state.stack.shift(), printJS);
        }
    });

    // Tray
    appIcon = new Tray(path.join(config.assets, 'printer_18.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Print Ahoy',
            enabled: false
        },
        {
            label: 'Change Path',
            click: choosePath
        },
        {
            label: 'Quit',
            accelerator: 'Command+Q',
            selector: 'terminate:'
        }
    ]);
    appIcon.setToolTip('Print Ahoy');
    appIcon.setContextMenu(contextMenu);
});
