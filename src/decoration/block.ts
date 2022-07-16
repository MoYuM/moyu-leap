import * as vscode from 'vscode';
import * as CONFIG from '../constant';
import { Component, ComponentState } from './base';
import { objectToCssString } from '../utils';


class Block implements Component {
	state = {
		value: '',
	}
	style?: Record<string, any>

	public createType(): vscode.TextEditorDecorationType[] {
		const defaultCss = {
			position: 'absolute',
			top: '-20px',
			height: '20px',
			display: `inline-block`,
			padding: '0 4px',
			color: CONFIG.COLOR,
			['background-color']: CONFIG.BACKGROUNDCOLOR,
			['border-radius']: '2px',
			['line-height']: '20px',
			['z-index']: 1,
			['pointer-events']: 'none',
			['min-width']: '30px',
			...this.style,
		};

		const css = objectToCssString(defaultCss);
		const type = vscode.window.createTextEditorDecorationType({
			before: {
				contentText: this.state.value,
				textDecoration: `none; ${css}`
			},
		})

		return [type];
	}


	public setState(newState: ComponentState): void {
		this.state = newState as { value: string };
	}

	public setStyle(newStyle: Record<string, any>): void {
		this.style = {
			...this.style,
			...newStyle,
		}
	}
}

export default Block;