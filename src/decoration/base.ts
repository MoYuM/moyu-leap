import * as vscode from 'vscode';

export interface ComponentState {
	[key: string]: any,
}

export interface Component {
	state: Record<string, any>
	style?: Record<string, any>
	/** 
	 * create decorationTypes
	 * 
	 * all types will set on the same range
	 */
	createType(): vscode.TextEditorDecorationType[]

	setState(newState: ComponentState): void

	setStyle(newStyle: Record<string, any>): void
}

/**
 * the base class of all Component
 */
class Decoration {
	components: { component: Component, key: string }[];
	disposers: Array<() => void> = [];
	range?: vscode.Range;

	constructor(components: Record<string, new () => Component>) {
		this.components = Object.keys(components).map(i => ({
			component: new components[i](),
			key: i,
		}))
	}


	public draw(range: vscode.Range) {
		this.range = range;
		this.components.forEach(i => {
			const types = i.component.createType();

			types.forEach(t => {
				vscode.window.activeTextEditor?.setDecorations(t, [range])
				this.disposers.push(t.dispose);
			})
		})
	}


	public update(key: string, newState: Record<string, any>, newRange?: vscode.Range) {
		// TODO if the state has not changed, there is no need to update
		// need a isEqual function
		this.setState(key, newState);
		this.dispose();
		this.draw(newRange || this.range as vscode.Range);
	}


	public dispose() {
		this.disposers.forEach(d => d?.())
		this.disposers = [];
	}

	public getComponent(key: string) {
		return this.components.find(i => i.key === key)?.component;
	}

	public getState(key: string) {
		return this.getComponent(key)?.state;
	}

	public setState(key: string, newState: Record<string, any>) {
		return this.getComponent(key)?.setState(newState);
	}

	public setStyle(key: string, style: Record<string, any>) {
		this.getComponent(key)?.setStyle(style);
	}

	/** overwrite vscode type event */
	public listen(callback: (key: string) => void) {
		return vscode.commands.registerCommand('type', ({ text }) => {
			callback(text);
		});
	}
}

export default Decoration;
