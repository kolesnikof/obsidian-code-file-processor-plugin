import { Notice, TAbstractFile, TFile, TFolder } from 'obsidian';
import { ModalCFP, ModalOptionsCFP, ModalButtonCFP } from './modal';
import PluginCFP from './main';

export class LogicCFP {
	plugin: PluginCFP;
	readonly directoryPath: string;

	constructor(plugin: PluginCFP) {
		this.plugin = plugin;
		this.directoryPath = plugin.settings.rootDirectory;
	}

	/**
	 * Function type: Main
	 * Prompts the user for confirmation to convert all specified file types to markdown.
	 * If confirmed, it converts all files of the specified types in the specified directory and its subdirectories
	 * to markdown by adding a language block and changing the file extension,
	 * then shows a notice with the number of files converted.
	 * @throws Error if the specified directory is not found.
	 */
	async convertFilesToMarkdown() {
		const showModal = async (): Promise<boolean> => {
			return new Promise((resolve) => {
				const buttons: ModalButtonCFP[] = [
					{ title: "Cancel", onClick: () => resolve(false) },
					{ title: "Confirm", onClick: () => resolve(true), cls: 'mod-warning' }
				];

				const options: ModalOptionsCFP = {
					title: "Confirmation",
					content: "Convert all specified file types to markdown?",
					buttons: buttons
				};

				new ModalCFP(this.plugin.app, options).open();
			});
		};
		const confirmation = await showModal();

		if (confirmation) {
			try {
				const convertedFilesCount = await this.convertFilesInDirectoryHelper();
				if (convertedFilesCount > 0) {
					new Notice(`${convertedFilesCount} file(s) converted`);
				} else {
					new Notice("Nothing's been converted");
				}
			} catch (error) {
				console.error("Error occurred during file converting:", error);
				new Notice(`Error: ${error.message}`);
			}
		}
	}

	/**
	 * Function type: Main
	 * Prompts the user for confirmation to undo changes for the currently active file.
	 * If confirmed, it undoes the changes by removing the language block and closing
	 * block from the file content and restores the original file extension.
	 * Displays a notice indicating the changes have been undone for the file.
	 */
	async undoSingleFileChanges() {
		const activeFile = this.plugin.app.workspace.getActiveFile();
		if (activeFile) {
			// const confirmation = await this.showConfirmationModal(`Undo changes for ${activeFile.basename}?`);

			const showModal = async (): Promise<boolean> => {
				return new Promise((resolve) => {
					const buttons: ModalButtonCFP[] = [
						{ title: "Cancel", onClick: () => resolve(false) },
						{ title: "Confirm", onClick: () => resolve(true), cls: 'mod-warning' }
					];

					const options: ModalOptionsCFP = {
						title: "Confirmation",
						content: `Undo changes for ${activeFile.basename}?`,
						buttons: buttons
					};

					new ModalCFP(this.plugin.app, options).open();
				});
			};
			const confirmation = await showModal();


			if (confirmation) {
				await this.undoFileChangesHelper(activeFile);
				new Notice(`Changes undone for ${activeFile.name}`);
			}
		}
	}

	/**
	 * Function type: Main
	 * Prompts the user for confirmation to undo changes for all files in the specified directory
	 * and its subdirectories. If confirmed, it recursively undoes changes for files with the .md
	 * extension, restoring their original content and file extensions.
	 * Displays a notice with the number of files for which changes have been undone.
	 * @throws Error if the specified directory is not found.
	 */
	async undoAllFilesChanges() {
		const folder = this.plugin.app.vault.getAbstractFileByPath(this.directoryPath);

		if (!folder || !(folder as TFolder).children) {
			throw new Error(`Directory not found: ${this.directoryPath}`);
		}

		const showModal = async (): Promise<boolean> => {
			return new Promise((resolve) => {
				const buttons: ModalButtonCFP[] = [
					{ title: "Cancel", onClick: () => resolve(false) },
					{ title: "Confirm", onClick: () => resolve(true), cls: 'mod-warning' }
				];

				const options: ModalOptionsCFP = {
					title: "Confirmation",
					content: "Undo changes for all files in the specified directory?",
					buttons: buttons
				};

				new ModalCFP(this.plugin.app, options).open();
			});
		};
		const confirmation = await showModal();

		if (confirmation) {
			// Recursively undo changes in files in the folder and subdirectories
			const undoneFilesCount = await this.undoChangesRecursivelyHelper(folder);
			new Notice(`Changes undone for ${undoneFilesCount} file(s)`);
		}
	}

	/**
	 * Function type: Helper
	 * Undo changes to the specified file.
	 * It removes the language block and closing block from the file content,
	 * and restores the original file extension by removing .md from the file path.
	 * @param file The file to be processed.
	 */
	async undoFileChangesHelper(file: TFile) {
		const fileContent = await this.plugin.app.vault.read(file);
		const modifiedContent = fileContent
			.replace(/^```[a-z]+\n/, '')        // Remove language block at the start
			.replace(/\n```\s*$/, '');          // Remove closing block at the end

		// Modify the file content
		await this.plugin.app.vault.modify(file, modifiedContent);

		// Restore the original file extension by removing .md
		const newFilePath = file.path.replace('.md', '');
		await this.plugin.app.vault.rename(file, newFilePath);
	}

	/**
	 * Function type: Helper
	 * Undo changes to all files in the specified directory and its subdirectories
	 * that have the .md extension.
	 * @param folder The directory to be processed.
	 * @returns The number of files processed.
	 */
	async undoChangesRecursivelyHelper(folder: any): Promise<number> {
		let undoneFilesCount = 0;
		const filesAndFolders = folder.children;

		const undoPromises = filesAndFolders.map(async (fileOrFolder: TAbstractFile) => {
			if (fileOrFolder instanceof TFile) {
				if (fileOrFolder.path.endsWith('.md')) {
					await this.undoFileChangesHelper(fileOrFolder);
					undoneFilesCount++;
				}
			} else {
				undoneFilesCount += await this.undoChangesRecursivelyHelper(fileOrFolder);
			}
		});

		await Promise.all(undoPromises);
		return undoneFilesCount;
	}

	/**
	 * Function type: Helper
	 * Converts all files in the specified directory and its subdirectories to markdown if
	 * their extension matches one of the provided file types.
	 * @returns The number of files processed.
	 */
	async convertFilesInDirectoryHelper(): Promise<number> {
		const folder = this.plugin.app.vault.getAbstractFileByPath(this.directoryPath);

		if (!folder || !(folder instanceof TFolder)) {
			throw new Error(`Directory not found: ${this.directoryPath}`);
		}

		// Combine all file types from different categories
		const fileTypes = Object.values(this.plugin.settings.fileTypes)
			.flatMap((types: string) => types.split(',').map(type => type.trim()));

		// Process files recursively in folder and subdirectories
		return this.convertFilesRecursivelyHelper(folder, fileTypes);
	}

	/**
	 * Function type: Helper
	 * Recursively processes all files in the specified directory and its subdirectories,
	 * and converts them to markdown if their extension matches one of the provided file types.
	 * @param folder The directory to be processed.
	 * @param fileTypes The list of file extensions to be converted.
	 * @returns The number of files processed.
	 */
	async convertFilesRecursivelyHelper(folder: any, fileTypes: string[]): Promise<number> {
		const filesAndFolders = folder.children;

		// Use map to collect promises
		const filePromises = filesAndFolders.map(async (fileOrFolder: { extension: string; }) => {
			if (fileOrFolder instanceof TFile) {
				if (fileTypes.includes(fileOrFolder.extension)) {
					await this.convertFileHelper(fileOrFolder);
					return 1; // Return 1 for each processed file
				}
			} else {
				// Recursively process subdirectories
				return this.convertFilesRecursivelyHelper(fileOrFolder, fileTypes);
			}
			return 0; // Return 0 if no file is processed
		});

		// Wait for all promises to resolve and sum up the results
		const results = await Promise.all(filePromises);
		return results.reduce((sum, processedFiles) => sum + processedFiles, 0);
	}

	/**
	 * Function type: Helper
	 * Reads the content of a file, adds a language block and converts it to markdown,
	 * then modifies the file content and changes the file extension.
	 * @param file The file to be converted.
	 */
	async convertFileHelper(file: TFile) {
		const fileContent = await this.plugin.app.vault.read(file);
		const languageBlock = this.getLanguageFromFileExtensionHelper(file.extension);

		const newContent = `${languageBlock}\n${fileContent}\n\`\`\`\n`;

		// Modify file content and change extension
		await this.plugin.app.vault.modify(file, newContent);
		const newFilePath = `${file.path}.md`;
		await this.plugin.app.vault.rename(file, newFilePath);
	}

	/**
	 * Function type: Helper
	 * Gets language block from file extension.
	 * If extension is found in fileExtToLang settings, use the corresponding language name.
	 * Otherwise, use the extension as the language name.
	 * @param extension The file extension to get the language block from
	 * @returns The language block string
	 */
	getLanguageFromFileExtensionHelper(extension: string) {
		const langName = this.plugin.settings.fileExtToLang[extension as keyof typeof this.plugin.settings.fileExtToLang] ?? extension;
		if (langName) {
			return `\`\`\`${langName}`;
		}
	}
}