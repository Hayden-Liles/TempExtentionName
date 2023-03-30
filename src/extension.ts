// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import player, { PlayerConfig } from './player';
import debounce = require('lodash.debounce');
import { toInteger } from 'lodash';

let listener: EditorListener;
let isActive: boolean;
let isNotArrowKey: boolean;
let config: PlayerConfig = {
    macVol: 1,
    winVol: 100,
    linuxVol: 100
};

export function activate(context: vscode.ExtensionContext) {

    isActive = context.globalState.get('TempName', true);
    config.macVol = context.globalState.get('mac_volume', 1);
    config.winVol = context.globalState.get('win_volume', 100);
    config.linuxVol = context.globalState.get('linux_volume', 1);

    listener = listener || new EditorListener(player);

    vscode.commands.registerCommand('TempName.enable', () => {
        if (!isActive) {
            context.globalState.update('TempName', true);
            isActive = true;
            vscode.window.showInformationMessage('TempName Sounds extension enabled');
        } else {
            vscode.window.showWarningMessage('TempName Sounds extension is already enabled');
        }
    });
    vscode.commands.registerCommand('TempName.disable', () => {
        if (isActive) {
            context.globalState.update('TempName', false);
            isActive = false;
            vscode.window.showInformationMessage('TempName Sounds extension disabled');
        } else {
            vscode.window.showWarningMessage('TempName Sounds extension is already disabled');
        }
    });
    vscode.commands.registerCommand('TempName.volumeUp', () => {
        let newVol = null;
        switch (process.platform) {
            case 'darwin':
                config.macVol += 1;

                if (config.macVol > 10) {
                    vscode.window.showWarningMessage('Sounds already at maximum volume');
                    config.macVol = 10;
                }

                newVol = config.macVol;
                context.globalState.update('mac_volume', newVol);
                break;

            case 'win32':
                config.winVol += 10;

                if (config.winVol > 100) {
                    vscode.window.showWarningMessage('Sounds already at maximum volume');
                    config.winVol = 100;
                }

                newVol = config.winVol;
                context.globalState.update('win_volume', newVol);
                break;

            case 'linux':
                config.linuxVol += 1;

                if (config.linuxVol > 10) {
                    vscode.window.showWarningMessage('Sounds already at maximum volume');
                    config.linuxVol = 10;
                }

                newVol = config.linuxVol;
                context.globalState.update('linux_volume', newVol);
                break;

            default:
                newVol = 0;
                break;
        }

        vscode.window.showInformationMessage('Sounds volume raised: ' + newVol);
    });
    vscode.commands.registerCommand('TempName.volumeDown', () => {
        let newVol = null;

        switch (process.platform) {
            case 'darwin':
                config.macVol -= 1;

                if (config.macVol < 1) {
                    vscode.window.showWarningMessage('Sounds at minimum volume');
                    config.macVol = 1;
                }

                newVol = config.macVol;
                context.globalState.update('mac_volume', newVol);
                break;

            case 'win32':
                config.winVol -= 10;

                if (config.winVol < 10) {
                    vscode.window.showWarningMessage('Sounds already at minimum volume');
                    config.winVol = 10;
                }

                newVol = config.winVol;
                context.globalState.update('win_volume', newVol);
                break;

            case 'linux':
                config.linuxVol -= 1;

                if (config.linuxVol < 1) {
                    vscode.window.showWarningMessage('Sounds already at minimum volume');
                    config.linuxVol = 1;
                }

                newVol = config.linuxVol;
                context.globalState.update('linux_volume', newVol);
                break;

            default:
                newVol = 0;
                break;
        }

        vscode.window.showInformationMessage('Sounds volume lowered: ' + newVol);
    });

    vscode.commands.registerCommand('TempName.setVolume', async () => {
        let input = await vscode.window.showInputBox()
        let newVol = toInteger(input);

        switch (process.platform) {
            case 'darwin':
                if (newVol > 10) {
                    vscode.window.showInformationMessage("Volume increased to maximum")
                    config.macVol = 10;
                } else if (newVol < 1) {
                    vscode.window.showInformationMessage("Volume decreased to minimum")
                    config.macVol = 1
                } else {
                    if (config.macVol < newVol)
                        vscode.window.showInformationMessage("Volume increased to " + newVol)
                    else if (config.macVol > newVol)
                        vscode.window.showInformationMessage("Volume decreased to " + newVol)
                    else
                        vscode.window.showWarningMessage("Volume already at " + newVol);

                    config.macVol = newVol;
                }

                context.globalState.update('mac_volume', newVol);
                break;

            case 'win32':
                if (newVol > 100) {
                    vscode.window.showInformationMessage("Volume increased to maximum")
                    config.winVol = 100;
                }
                else if (newVol < 10) {
                    vscode.window.showInformationMessage("Volume decreased to minimum")
                    config.winVol = 10
                } else {
                    if (config.winVol < newVol)
                        vscode.window.showInformationMessage("Volume increased to " + newVol)
                    else if (config.winVol > newVol)
                        vscode.window.showInformationMessage("Volume decreased to " + newVol)
                    else
                        vscode.window.showWarningMessage("Volume already at " + newVol);

                    config.winVol = newVol;
                }

                context.globalState.update('win_volume', newVol);
                break;

            case 'linux':
                if (newVol > 10) {
                    vscode.window.showInformationMessage("Volume increased to maximum")
                    config.linuxVol = 10;
                } else if (newVol < 1) {
                    vscode.window.showInformationMessage("Volume decreased to minimum")
                    config.linuxVol = 1
                } else {
                    if (config.linuxVol < newVol)
                        vscode.window.showInformationMessage("Volume increased to " + newVol)
                    else if (config.linuxVol > newVol)
                        vscode.window.showInformationMessage("Volume decreased to " + newVol)
                    else
                        vscode.window.showWarningMessage("Volume already at " + newVol);

                    config.linuxVol = newVol;
                }

                context.globalState.update('linux_volume', newVol);
                break;

            default:
                newVol = 0;
                break;
        }
    });

    context.subscriptions.push(listener);
}

export function deactivate() { }

export class EditorListener {
    private _disposable: vscode.Disposable;
    private _subscriptions: vscode.Disposable[] = [];
    private _basePath: string = path.join(__dirname, '..');

    private _retroAudio: string = path.join(this._basePath, 'audio', 'retro.wav');

    constructor(private player: any) {
        isNotArrowKey = false;

        vscode.workspace.onDidSaveTextDocument(this._saveCallback, this, this._subscriptions);
        this._disposable = vscode.Disposable.from(...this._subscriptions);
        this.player = {
            play: (filePath: string) => player.play(filePath, config)
        };
    }

    _saveCallback = debounce(() => {
        this.player.play(this._retroAudio)
    }, 100, { leading: true });

    dispose() {
        this._disposable.dispose();
    }
}
