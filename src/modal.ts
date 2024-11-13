import { App, Modal } from 'obsidian';

export interface ModalButtonCFP {
	title: string;
	cls?: string;
	onClick?: () => void;
}

export interface ModalOptionsCFP {
	title: string;
	content: string;
	buttons?: ModalButtonCFP[];
}

export class ModalCFP extends Modal {
	options: ModalOptionsCFP;

	constructor(app: App, options: ModalOptionsCFP) {
		super(app);
		this.options = options;
	}

	/**
	 * Sets the title and content of the modal upon opening.
	 * If button options are provided, creates a container for the buttons.
	 */
	onOpen() {
		this.setTitle(this.options.title);
		this.setContent(this.options.content);

		if (this.options.buttons && this.options.buttons.length > 0) {
			this.createButtonContainer(this.options.buttons);
		}
	}

	/**
	 * Creates a container for buttons within the modal and populates it with the specified buttons.
	 * Each button is created with a title, optional CSS class, and a click event listener
	 * that triggers the button's onClick function and closes the modal.
	 * 
	 * @param buttons An array of ModalButtonCFP objects representing the buttons to be added.
	 */
	createButtonContainer(buttons: ModalButtonCFP[]) {
		const buttonContainer = this.contentEl.createDiv({ cls: 'modal-button-container' });
		buttons.forEach(button => {
			const btn = buttonContainer.createEl('button', { text: button.title, cls: button.cls });
			btn.addEventListener('click', () => {
				button.onClick?.();
				this.close();
			});
		});
	}

	/**
	 * Clears the modal content area when the modal is closed.
	 */
	onClose() {
		this.contentEl.empty();
	}
}