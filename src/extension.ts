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
let soundPlaying: boolean = false;
let config: PlayerConfig = {
    macVol: 1,
    winVol: 100,
    linuxVol: 100
};
let lineCount = vscode.window.activeTextEditor?.document.lineCount;

export function activate(context: vscode.ExtensionContext) {

    isActive = context.globalState.get('TempName', true);
    config.macVol = context.globalState.get('mac_volume', 1);
    config.winVol = context.globalState.get('win_volume', 50);
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
        let input = await vscode.window.showInputBox();
        let newVol = toInteger(input);

        switch (process.platform) {
            case 'darwin':
                if (newVol > 10) {
                    vscode.window.showInformationMessage("Volume increased to maximum");
                    config.macVol = 10;
                } else if (newVol < 1) {
                    vscode.window.showInformationMessage("Volume decreased to minimum");
                    config.macVol = 1;
                } else {
                    if (config.macVol < newVol) {
                        vscode.window.showInformationMessage("Volume increased to " + newVol);
                    }
                    else if (config.macVol > newVol) {
                        vscode.window.showInformationMessage("Volume decreased to " + newVol);
                    }
                    else {
                        vscode.window.showWarningMessage("Volume already at " + newVol);
                    }

                    config.macVol = newVol;
                }

                context.globalState.update('mac_volume', newVol);
                break;

            case 'win32':
                if (newVol > 100) {
                    vscode.window.showInformationMessage("Volume increased to maximum");
                    config.winVol = 100;
                }
                else if (newVol < 10) {
                    vscode.window.showInformationMessage("Volume decreased to minimum");
                    config.winVol = 10;
                } else {
                    if (config.winVol < newVol) {
                        vscode.window.showInformationMessage("Volume increased to " + newVol);
                    }
                    else if (config.winVol > newVol) {
                        vscode.window.showInformationMessage("Volume decreased to " + newVol);
                    }
                    else {
                        vscode.window.showWarningMessage("Volume already at " + newVol);
                    }

                    config.winVol = newVol;
                }

                context.globalState.update('win_volume', newVol);
                break;

            case 'linux':
                if (newVol > 10) {
                    vscode.window.showInformationMessage("Volume increased to maximum");
                    config.linuxVol = 10;
                } else if (newVol < 1) {
                    vscode.window.showInformationMessage("Volume decreased to minimum");
                    config.linuxVol = 1;
                } else {
                    if (config.linuxVol < newVol) {
                        vscode.window.showInformationMessage("Volume increased to " + newVol);
                    }
                    else if (config.linuxVol > newVol) {
                        vscode.window.showInformationMessage("Volume decreased to " + newVol);
                    }
                    else {
                        vscode.window.showWarningMessage("Volume already at " + newVol);
                    }

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
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor?.viewColumn !== vscode.ViewColumn.One) {
            listener._splitScreenCallback();
        }
    }));
}

export function deactivate() { }

export class EditorListener {
    private _disposable: vscode.Disposable;
    private _subscriptions: vscode.Disposable[] = [];
    private _basePath: string = path.join(__dirname, '..');


    //                                       AUDIO FILES

    //                                       Key Presses ✔
    // Space_Bar Key ✔
    private _marioJumpAudio = { path: path.join(this._basePath, 'audio', 'mario_jump.wav'), audioLength: 450 };

    // Enter Key ✔
    private _marioCoinAudio = { path: path.join(this._basePath, 'audio', 'mario_coin.wav'), audioLength: 900 };

    //                                    File Manipulation
    // Create New File ✔
    private _1UpAudio = { path: (path.join(this._basePath, 'audio', '1_up.wav')), audioLength: 880 };

    // Delete File ✔
    private _deathAudio = { path: path.join(this._basePath, 'audio', 'death.wav'), audioLength: 2780 };

    // Save File ✔
    private _levelCompleteAudio = { path: path.join(this._basePath, 'audio', 'level_complete.wav'), audioLength: 7700 };

    // Open Project ✔
    private _hereWeGoAudio = { path: path.join(this._basePath, 'audio', 'here_we_go.wav'), audioLength: 3950 };

    // Split Screen ✔
    private _starPowerAudio = { path: path.join(this._basePath, 'audio', 'star_power.wav'), audioLength: 5500 };

    // TBD
    private _marioBrosAudio = { path: path.join(this._basePath, 'audio', 'mario_bros.wav'), audioLength: 14850 };

    // Switch Between Files ✔
    private _marioPipeAudio = { path: path.join(this._basePath, 'audio', 'mario_pipe.wav'), audioLength: 800 };






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
        // ON LOAD EVENT
        // WHEN PROJECT LOADS
        this._openProjectCallback();
        // EXAMPLE of EVENT LISTENER
        // vscode.workspace.onDidSaveTextDocument(this._EXAMPLECALLBACK, this, this._subscriptions);
        // EVENT LISTENERS VVV
        vscode.workspace.onDidChangeTextDocument(this._allKeysCallback, this, this._subscriptions);
        // listeners for file manipulation
        let folders = vscode.workspace.workspaceFolders;
        if (folders) {
            let watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folders[0], "**/*"));
            // CREATE FILE
            watcher.onDidCreate(uri => this._createFileCallback());
            // DELETE FILE
            watcher.onDidDelete(uri => this._deleteFileCallback());
        }
        vscode.workspace.onDidSaveTextDocument(this._saveFileCallback, this, this._subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._switchFileCallback, this, this._subscriptions);
    }


    // CALL_BACKS VVVV
    _allKeysCallback = debounce((event: vscode.TextDocumentChangeEvent) => {
        if (!isActive) { return; }
        let curDocument = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
        if (event.document !== curDocument || event.contentChanges.length === 0) { return; }

        const pressedKey = event.contentChanges[0].text.toString();
        const tempCheckLine = event.document.lineCount;
        let checkLineCount = 0;

        // WACKEY WAY to check if Enter Key was pressed
        if (lineCount) {
            checkLineCount = (tempCheckLine - lineCount) || 0;
            if (vscode.workspace.getConfiguration('TempName').get('Enter_Key') !== true){return;}
            if (checkLineCount > 0 && soundPlaying !== true) {
                soundPlaying = true;
                this.player.play(this._marioCoinAudio.path);
                lineCount = tempCheckLine;
                setTimeout(() => {
                    soundPlaying = false;
                }, this._marioCoinAudio.audioLength);
            }
        }

        switch (pressedKey) {
            // SPACE_BAR KEY
            case ' ':
                if (vscode.workspace.getConfiguration('TempName').get('Space_Key') !== true){return;}
                if (soundPlaying === true) { return; }
                soundPlaying = true;
                this.player.play(this._marioJumpAudio.path);
                setTimeout(() => {
                    soundPlaying = false;
                }, this._marioJumpAudio.audioLength);
                break;
            default:
                break;
        }

    }, 0, { leading: true });

    _createFileCallback = debounce(() => {
        if(vscode.workspace.getConfiguration('TempName').get('Create_File') !== true){return;}
        if (soundPlaying === true) { return; }
        soundPlaying = true;
        this.player.play(this._1UpAudio.path);
        setTimeout(() => {
            soundPlaying = false;
        }, this._1UpAudio.audioLength);
    }, 0, { leading: true });

    _deleteFileCallback = debounce(() => {
        if(vscode.workspace.getConfiguration('TempName').get('Delete_File') !== true){return;}
        if (soundPlaying === true) { return; }
        soundPlaying = true;
        this.player.play(this._deathAudio.path);
        setTimeout(() => {
            soundPlaying = false;
        }, this._deathAudio.audioLength);
    }, 0, { leading: true });

    _saveFileCallback = debounce(() => {
        if(vscode.workspace.getConfiguration('TempName').get('Save_File') !== true){return;}
        if (soundPlaying === true) { return; }
        soundPlaying = true;
        this.player.play(this._levelCompleteAudio.path);
        setTimeout(() => {
            soundPlaying = false;
        }, this._levelCompleteAudio.audioLength);
    }, 0, { leading: true });

    _openProjectCallback = debounce(() => {
        if(vscode.workspace.getConfiguration('TempName').get('Open_Project') !== true){return;}
        if (soundPlaying === true) { return; }
        soundPlaying = true;
        vscode.window.showInformationMessage("You got this!");
        this.player.play(this._hereWeGoAudio.path);
        setTimeout(() => {
            soundPlaying = false;
        }, this._hereWeGoAudio.audioLength);
    }, 0, { leading: true });

    _switchFileCallback = debounce(() => {
        if(vscode.workspace.getConfiguration('TempName').get('Switch_File') !== true){return;}
        if (soundPlaying === true) { return; }
        soundPlaying = true;
        this.player.play(this._marioPipeAudio.path);
        setTimeout(() => {
            soundPlaying = false;
        }, this._marioPipeAudio.audioLength);
    }, 130);

    _splitScreenCallback = debounce(() => {
        if(vscode.workspace.getConfiguration('TempName').get('Split_Screen') !== true){return;}
        if (soundPlaying === true) { return; }
        soundPlaying = true;
        this.player.play(this._starPowerAudio.path);
        setTimeout(() => {
            soundPlaying = false;
        }, this._starPowerAudio.audioLength);
    }, 0, { leading: true });


    dispose() {
        this._disposable.dispose();
    }
}


// NOTE Callback Example
// _saveCallback = debounce(() => {
//     this.player.play(this._AUDIO_FILE)
// }, 0, { leading: true });