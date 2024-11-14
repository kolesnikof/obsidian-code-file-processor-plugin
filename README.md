# Code File Embed Processor - Obsidian Plugin

## Description

The plugin allows you to work with code files in [Obsidian](https://obsidian.md/) in the same way as with regular Markdown files.

## How It Works

To view code files in Obsidian, the plugin converts them into Markdown format. The conversion process consists of two steps:

1. **File Renaming**: The filename and its extension will become the new filename, and the new extension will be `md`. For example, the file `main.js` will be renamed to `main.js.md`.
2. **Modifying File Content**: Symbols ``` will be added at the beginning and end of the file, turning the code into a code block in Markdown syntax.

The conversion affects only files in the folder specified in the plugin settings, including subfolders. You can also select which types of files to convert in the settings.

Additionally, the plugin allows you to revert a selected file or all files to their original format.

### Installation

### Manual installation

1. Download the latest version of the plugin from [GitHub Releases](https://github.com/kolesnikof/obsidian-code-file-processor-plugin/releases).
2. Unzip the archive and place the plugin folder in the `.obsidian/plugins` folder of your Obsidian repository.
3. Go to `Settings` > `Community Plugins` in Obsidian and enable the plugin.

## Usage

1. Go to `Settings` > `Code File Embed Processor` to customize the plugin to your needs.
2. Select the folder to convert the code files and specify which file types should be converted.
3. Use the commands available through the command palette (`Ctrl+P` or `Cmd+P`) to convert the code files or return them to their original format.

## Support

If you have any questions or suggestions, please create an issue on [GitHub page](https://github.com/kolesnikof/obsidian-code-file-processor-plugin/issues).

## License

This project is distributed under the MIT license. Details can be found in the [LICENSE](LICENSE) file.
