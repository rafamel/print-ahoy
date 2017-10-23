'use strict';
const { app, Tray, Menu, dialog } = require('electron');
const Datastore = require('nedb');
const chokidar = require('chokidar');
const settings = require('electron-settings');
const platform = require('electron-platform');
const sleep = require('sleep-promise');
const path = require('path');
const fs = require('fs-extra');

const config = require('./config');
const onAdd = require('./utils/onAdd');
const openViewer = require('./utils/openViewer');
const cleanFiles = require('./utils/cleanFiles');

const iconPath = path.join(config.assets, 'printer_18.png');
let appIcon = null;

app.on('ready', () => {
    // Initialize db
    const printJS = fs.readFileSync(path.join(config.assets, 'print.js'), 'utf8');
    const db = new Datastore({ filename: config.db, autoload: true });
    const state = {
        stack: [],
        open: false,
        watcher: null
    };

    const dockOnMac = (show = true) => {
        if (platform.isDarwin) {
            if (show) app.dock.show();
            else app.dock.hide();
        }
    };
    dockOnMac(false);

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

    function watcher(path) {
        // clean files
        cleanFiles(db);
        // run watcher
        return chokidar
            // eslint-disable-next-line
            .watch(path, { ignored: /(^|[\/\\])\../, depth: 1 })
            .on('add', async (path, info) => {
                await sleep(2000);
                const file = await onAdd(db, path);
                if (state.open) state.stack.push(file);
                else {
                    state.open = true;
                    dockOnMac(true);
                    await sleep(1000);
                    await openViewer(file, printJS);
                }
            });
    }

    app.on('window-all-closed', async function () {
        if (!state.stack.length) {
            state.open = false;
            dockOnMac(false);
        } else {
            state.open = true;
            dockOnMac(true);
            await sleep(1000);
            await openViewer(state.stack.shift(), printJS);
        }
    });

    appIcon = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Print Ahoy'
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
