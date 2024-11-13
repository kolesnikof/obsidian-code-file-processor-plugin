import { App, PluginSettingTab, Setting, normalizePath } from 'obsidian';
import PluginCFP from './main';

export interface SettingsCFP {
    rootDirectory: string;
    fileTypes: {
        markup: string;
        style: string;
        programming: string;
        config: string;
        script: string;
        database: string;
        other: string;
    };
    fileExtToLang: {
        js: string;
        ts: string;
        py: string;
        rb: string;
        rs: string;
        pl: string;
        kt: string;
        cs: string;
        sh: string;
        bat: string;
        yml: string;
    }
}

export const DEFAULT_SETTINGS: SettingsCFP = {
    rootDirectory: 'Code',
    fileTypes: {
        markup: 'html',
        style: 'css, scss, sass, less',
        programming: 'js, ts, py, java, cpp, rb, kt, swift, cs, rs',
        config: 'conf, json, xml, ini, yml, yaml',
        script: 'sh, bat, ps1, lua, pl',
        database: 'sql',
        other: ''
    },
    fileExtToLang: {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        rb: 'ruby',
        rs: 'rust',
        pl: 'perl',
        kt: 'kotlin',
        cs: 'csharp',
        sh: 'bash',
        bat: 'batch',
        yml: 'yaml'
    }
};

export class SettingTabCFP extends PluginSettingTab {
    plugin: PluginCFP;

    constructor(app: App, plugin: PluginCFP) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // Root directory setting
        new Setting(containerEl)
            .setName('Root Directory')
            .setDesc('All files of the specified types in this folder and its subfolders will be converted to markdown')
            .addText(text => text
                .setPlaceholder(this.plugin.settings.rootDirectory)
                .setValue(this.plugin.settings.rootDirectory)
                .onChange(async (value) => {
                    this.plugin.settings.rootDirectory = normalizePath(value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl).setName('File types').setHeading();

        // Dynamic settings for file types
        this.addFileTypeSetting('Markup', 'markup');
        this.addFileTypeSetting('Style', 'style');
        this.addFileTypeSetting('Programming', 'programming');
        this.addFileTypeSetting('Configuration', 'config');
        this.addFileTypeSetting('Script', 'script');
        this.addFileTypeSetting('Database', 'database');
        this.addFileTypeSetting('Other', 'other');
    }

    private addFileTypeSetting(name: string, key: keyof SettingsCFP['fileTypes']) {
        new Setting(this.containerEl)
            .setName(name)
            .addText(text => text
                .setPlaceholder(this.plugin.settings.fileTypes[key])
                .setValue(this.plugin.settings.fileTypes[key])
                .onChange(async (value) => {
                    this.plugin.settings.fileTypes[key] = value;
                    await this.plugin.saveSettings();
                }));
    }
}