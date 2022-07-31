import * as vscode from 'vscode';
import { moveTo, select, getCurrentWordAndRange, getCurrent, zeroMin } from './utils';
import finder from './finder';
import * as CONFIG from './constant';
import Decoration from './decoration/base';
import Block from './decoration/block';
import MultiBlock from './decoration/multi-block';
import List from './decoration/list';
import { createSnippetByTemplete, editSnippet } from './snippet';

const { executeCommand, registerTextEditorCommand, registerCommand } = vscode.commands;


export function activate(context: vscode.ExtensionContext) {
	/**
	 * select nearest word
	 */
	registerTextEditorCommand('moyu.select neareast word', () => {
		const { range } = getCurrentWordAndRange()
		select(range);
	});


	/**
	 * moyu.move up 5 lines
	 */
	registerTextEditorCommand('moyu.move up', () => {
		const current = vscode.window.activeTextEditor?.selection.active;
		moveTo(
			current?.with(
				current.line - CONFIG.MOVE_LINES <= 0
					? 0
					: current.line - CONFIG.MOVE_LINES
			),
			{
				withScroll: true
			}
		);
	});


	/**
	 * moyu.move down 5 lines
	 */
	registerTextEditorCommand('moyu.move down', () => {
		const current = vscode.window.activeTextEditor?.selection.active;
		const newPosition = current?.with(
			Math.min(
				current.line + CONFIG.MOVE_LINES,
				vscode.window.activeTextEditor?.document.lineCount as number
			)
		)
		moveTo(newPosition, { withScroll: true });
	});


	/**
	 * moyu.search mode
	 */
	registerTextEditorCommand('moyu.search mode', () => {
		executeCommand('hideSuggestWidget');
		executeCommand('setContext', 'moyu.searchActive', true);

		const line = getCurrent()?.line;
		if (line === undefined) return;

		let isFirst = true;
		let targets: { value: string, range: vscode.Range }[] = [];

		const searchRange = 20;
		const lineCount = vscode.window.activeTextEditor?.document.lineCount || 0;
		const dh = new Decoration({ MultiBlock });

		const handleInput = (text: string) => {
			if (isFirst) {
				const positions = finder.findLetterBetweenLines(
					text,
					zeroMin(line - searchRange),
					Math.min(line + searchRange, lineCount)
				).sort((a, b) => {
					if (a.line === line && b.line === line) return a.character - b.character
					if (a.line === line) return -1;
					if (b.line === line) return 1;
					return 0;
				});
				targets = finder
					.generateTargets(positions.length)
					.filter((_, index) => !!positions[index])
					.map((i, index) => {
						const pos = positions[index];
						const range: vscode.Range = new vscode.Range(pos, pos.with(pos.line, pos.character + 1))
						return {
							value: i,
							range: range
						}
					})
				dh.setState('MultiBlock', { values: targets.map(i => i.value) });
				dh.draw(targets.map(i => i.range));

				isFirst = false;
			} else {
				const isFound = targets.filter(i => i.value.endsWith(text)).length === 1;
				if (isFound) {
					moveTo(targets.find(i => i.value.includes(text))?.range.start);
					clear();
				} else {
					targets = targets.filter(i => i.value.includes(text));
					dh.setState('MultiBlock', { values: targets.map(i => i.value) });
					dh.dispose();
					dh.draw(targets.map(i => i.range));
				}
			}
		}

		const clear = () => {
			executeCommand('setContext', 'moyu.searchActive', false);
			command.dispose();
			dh.dispose();
			targets = [];
			escapeDisposer.dispose();
		}

		const command = overrideDefaultTypeEvent(({ text }) => handleInput(text));
		const escapeDisposer = registerTextEditorCommand("moyu.escape", clear);
	});


	/** 
	 * snippet mode
	 */
	registerTextEditorCommand('moyu.snippet mode', () => {
		const { range, word } = getCurrentWordAndRange();
		if (!(range && word)) return;

		executeCommand('hideSuggestWidget');
		executeCommand('setContext', 'moyu.snippetActive', true);

		const clear = () => {
			dh.dispose();
			listener.dispose();
			escapeDisposer.dispose();
			backspaceDisposer.dispose();
			upDisposer.dispose();
			downDisposer.dispose();
			executeCommand('setContext', 'moyu.snippetActive', false);
		};


		const handleInput = (text: string) => {
			const currentText = dh.getState('Input')?.value;
			const currentList = dh.getState('List')?.list;
			const value = currentText + text.trim()
			const { label, key } = currentList?.find((i: { label: string, key: string }) => i?.label?.includes(value)) || {};

			dh.update('Input', { value });
			if (key) {
				dh.update('List', { activeKey: key });
			}

			// type enter to confirm
			if (text === '\n') {

				// auto comfirm when there is activeKey
				const templete = CONFIG.TEMPLETE.find(i => i.command === (label || value));

				if (templete) {
					const snippet = createSnippetByTemplete(word, templete);
					editSnippet({
						snippet,
						newLine: templete?.newLine,
						position: range?.end,
						replaceRange: range,
					})
				}

				clear();
			}
		}

		const handleDelete = () => {
			const currentText = dh.getState('Input')?.value;

			if (currentText) {
				const newText = currentText.slice(0, currentText.length - 1)
				dh.update('Input', { value: newText });
			} else {
				clear(); // dispose input if there is no content to delete
			}
		}

		const handleUp = () => {
			const { activeKey, list } = dh.getState('List');
			if (activeKey) {
				const currentIndex = list.findIndex((i: { key: string }) => i.key === activeKey);
				const { key, label } = list.at(currentIndex - 1);
				dh.update('Input', { value: label });
				dh.update('List', { activeKey: key });
			} else {
				const { key, label } = list.at(-1);
				dh.update('Input', { value: label });
				dh.update('List', { activeKey: key });
			}
		}

		const handleDown = () => {
			const { activeKey, list } = dh.getState('List');
			if (activeKey) {
				const currentIndex = list.findIndex((i: { key: string }) => i.key === activeKey);
				const { key, label } = list.at(currentIndex + 1);
				dh.update('Input', { value: label });
				dh.update('List', { activeKey: key });
			} else {
				const { key, label } = list.at(0);
				dh.update('Input', { value: label });
				dh.update('List', { activeKey: key });
			}
		}

		const dh = new Decoration({ Input: Block, List });
		dh.setStyle('Input', {
			['background-color']: '#D0D8D9',
			['color']: '#40362E',
			['border-radius']: '5px',
			['font-weight']: '700',
			['box-shadow']: '0px 0px 16px 0px #D0D8D9',
		})
		dh.setState('List', {
			list: CONFIG.TEMPLETE.map(i => ({
				label: i.command,
				key: i.name
			})),
		})
		dh.draw([range]);

		const listener = dh.listen(handleInput);
		const escapeDisposer = registerTextEditorCommand("moyu.escape", clear);
		const backspaceDisposer = registerTextEditorCommand("moyu.backspace", handleDelete);
		const upDisposer = registerTextEditorCommand("moyu.up", handleUp);
		const downDisposer = registerTextEditorCommand("moyu.down", handleDown);
	})
}


function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
	return registerCommand('type', (e) => {
		return callback(e)
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }


function findLetterPositionInline(letter: string, lineCount: number): (vscode.Position | undefined) {
	const line = vscode.window.activeTextEditor?.document.lineAt(lineCount);
	if (line?.isEmptyOrWhitespace) return;

	return new vscode.Position(
		lineCount,
		line?.firstNonWhitespaceCharacterIndex || 0 + (line?.text.indexOf(letter) || 0)
	)
}