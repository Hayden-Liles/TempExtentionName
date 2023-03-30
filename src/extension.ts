// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import player, { PlayerConfig } from './player';
import debounce = require('lodash.debounce');
import { keys, toInteger } from 'lodash';

let listener: EditorListener;
let isActive: boolean;
let config: PlayerConfig = {
    macVol: 1,
    winVol: 100,
    linuxVol: 100
};
let lineCount = vscode.window.activeTextEditor?.document.lineCount;

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


    //                                       AUDIO FILES

    //                                       Key Presses ✔
    // Space_Bar Key
    private _mario_jump_Audio: string = path.join(this._basePath, 'audio', 'mario_jump.wav');

    // Enter Key
    private _mario_coin_Audio: string = path.join(this._basePath, 'audio', 'mario_coin.wav');



    //                                    File Manipulation
    // Create New File
    private _1_up_Audio: string = path.join(this._basePath, 'audio', '1_up.wav');

    // Switch Between Files
    private _mario_pipe_Audio: string = path.join(this._basePath, 'audio', 'mario_pipe.wav');

    // Delete File
    private _death_Audio: string = path.join(this._basePath, 'audio', 'death.wav');

    // Save File
    private _level_complete_Audio: string = path.join(this._basePath, 'audio', 'level_complete.wav');

    // Open Project
    private _here_we_go_Audio: string = path.join(this._basePath, 'audio', 'here_we_go.wav');

    // Split Screen
    private _star_power_Audio: string = path.join(this._basePath, 'audio', 'star_power.wav');

    // Zen mode
    private _mario_bros_Audio: string = path.join(this._basePath, 'audio', 'mario_bros.wav');

    // TEST SOUND 
    private _retroAudio: string = path.join(this._basePath, 'audio', 'retro.wav');


    // NOTE Maybe Section
    // MARIO KART START RACE - run server
    // MARIO KART LONG JUMP - run client
    // MARIO - POWER UP - creation of cunstructor
    // MARIO BROS GAME OVER - build error
    // MARIO WINS - build success

    constructor(private player: any) {
        this._disposable = vscode.Disposable.from(...this._subscriptions);
        this.player = {
            play: (filePath: string) => player.play(filePath, config)
        };
        // EXAMPLE of EVENT LISTENER
        // vscode.workspace.onDidSaveTextDocument(this._EXAMPLECALLBACK, this, this._subscriptions);
        // EVENT LISTENERS VVV
        vscode.workspace.onDidChangeTextDocument(this._allKeysCallback, this, this._subscriptions);


    }
    // CALL_BACKS VVVV
    _allKeysCallback = debounce((event: vscode.TextDocumentChangeEvent) => {
        if (!isActive) return;
        let curDocument = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        if (event.document !== curDocument || event.contentChanges.length === 0) return;

        const pressedKey = event.contentChanges[0].text.toString();
        const tempCheckLine = event.document.lineCount;
        let checkLineCount = 0;

        // WACKEY WAY to check if space was pressed
        if (lineCount) {
            checkLineCount = (tempCheckLine - lineCount) || 0;
            if (checkLineCount > 0) {
                this.player.play(this._mario_coin_Audio);
                lineCount = tempCheckLine;
            }
        }

        switch (pressedKey) {
            // SPACE_BAR KEY
            case ' ':
                this.player.play(this._mario_jump_Audio);
                break;
            default:
                break;
        }

    }, 100, { leading: true });

    dispose() {
        this._disposable.dispose();
    }
}


// NOTE Callback Example
// _saveCallback = debounce(() => {
//     this.player.play(this._AUDIO_FILE)
// }, 100, { leading: true });