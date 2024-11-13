import { Plugin } from 'obsidian';
import { LogicCFP } from './logic';
import { SettingsCFP, DEFAULT_SETTINGS, SettingTabCFP } from './settings';


export default class PluginCFP extends Plugin {
    settings: SettingsCFP;
    logic: LogicCFP;

    /**
     * Loads the plugin settings and initializes the LogicCFP instance.
     * Adds an icon to the app's ribbon to convert source code files to markdown.
     * Registers commands in the Command Palette for converting files and undoing changes.
     * Attaches a settings tab to the app for plugin-specific configurations.
     */
    async onload() {
        await this.loadSettings();
        this.logic = new LogicCFP(this);

        // Add icon to Ribbon
        this.addRibbonIcon('replace-all', 'Convert source code files', async () => {
            await this.logic.convertFilesToMarkdown();
        });

        // Add commands to Command Palette
        this.addCommand({
            id: 'convert-files-command',
            name: 'Convert source code files',
            callback: async () => {
                await this.logic.convertFilesToMarkdown();
            },
        });

        this.addCommand({
            id: 'undo-changes-current-file',
            name: 'Undo changes for current file',
            callback: async () => {
                await this.logic.undoSingleFileChanges();
            },
        });

        this.addCommand({
            id: 'undo-changes-all-files',
            name: 'Undo changes for all files',
            callback: async () => {
                await this.logic.undoAllFilesChanges();
            },
        });

        // Add settings tab
        this.addSettingTab(new SettingTabCFP(this.app, this));
    }

    /**
     * Loads the plugin settings. If no settings are found, the DEFAULT_SETTINGS will be used.
     * @returns A Promise that resolves to the loaded settings.
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    /**
     * Saves the plugin settings. If no settings are found, the DEFAULT_SETTINGS will be used.
     * @returns A Promise that resolves when the settings are saved.
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }
}