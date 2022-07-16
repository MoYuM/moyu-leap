import * as vscode from 'vscode';
import createFile from './createFile';
import createComponent from './createComponent';
import Finder from './finderInline';
import { getRootUri, getUserInput, moveTo, select, getCurrentWordAndRange } from './utils';
import Search from './search';
import * as CONFIG from './constant';
import Decoration from './decoration/base';
import Input from './decoration/input';
import { createSnippetByTemplete, edit } from './snippet';

const { executeCommand, registerTextEditorCommand, registerCommand } = vscode.commands;


export function activate(context: vscode.ExtensionContext) {

	/**
	 * new file
	 */
	registerTextEditorCommand('moyu.new file', async () => {
		const rootPathURI = getRootUri();
		const fileName = await getUserInput('请输入文件名称');
		const res = await createFile(rootPathURI, fileName);

		if (res.result && res.uri) {
			await vscode.window.showTextDocument(res.uri, { preview: false })
			vscode.window.showInformationMessage('创建成功');
		} else {
			vscode.window.showErrorMessage('创建失败')
		}
	})


	/**
	 * new component
	 */
	registerTextEditorCommand('moyu.new component', async () => {
		const rootPathURI = getRootUri();
		const componentName = await getUserInput('请输入新组件名称')
		if (!rootPathURI) return;
		await createComponent(rootPathURI, componentName, 'currentPageComponent')
	})


	/**
	 * new component in global
	 */
	registerTextEditorCommand('moyu.new component in global', async () => {
		const rootPathURI = getRootUri();
		const componentName = await getUserInput('请输入新组件名称');
		if (!rootPathURI) return;
		await createComponent(rootPathURI, componentName, 'globalComponent')
	})


	/**
	 * new page
	 */
	registerTextEditorCommand('moyu.new page', async () => {
		const rootPathURI = getRootUri();
		const componentName = await getUserInput('请输入新页面名称');
		if (!rootPathURI) return;
		await createComponent(rootPathURI, componentName, 'page')
	})


	/**
	 * select nearest word
	 */
	registerTextEditorCommand('moyu.select neareast word', () => {
		const { range } = getCurrentWordAndRange()
		select(range);
	});


	// /**
	//  * select next word
	//  */
	// registerTextEditorCommand('moyu.select next word', () => {
	// 	const finder = new Finder();
	// 	const range = finder.findNextWord();
	// 	select(range);
	// });


	// /**
	//  * select pervious word
	//  */
	// registerTextEditorCommand('moyu.select pervious word', () => {
	// 	const finder = new Finder();
	// 	const range = finder.findPrevWord();
	// 	select(range);
	// });


	/**
	 * moyu.move to next bracket
	 */
	// registerTextEditorCommand('moyu.move to next bracket', () => {
	// 	const finder = new Finder();
	// 	const position = finder.findNextBracket();
	// 	moveTo(position);
	// });




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
		const search = new Search();

		let targets = search.findAllTargets();
		let disposeCount = 0;
		let total = targets.length;
		let typeList: string[] = [];
		search.showTargets(targets);

		const command = overrideDefaultTypeEvent(({ text }) => {
			if (text === CONFIG.EXITSEARCHMODE) {
				search.disposeTargets(targets);
				command.dispose();
				return;
			}

			typeList.push(text);

			const needDisposeTargets = targets?.filter(i => !typeList.every((j, index) => i.key[index] === j));
			targets = targets.filter(i => typeList.every((j, index) => i.key[index] === j));

			disposeCount += needDisposeTargets.length;
			search.disposeTargets(needDisposeTargets);

			if (disposeCount === total) {
				command.dispose();
				return;
			}

			if (total - disposeCount === 1) {
				moveTo(targets[0].range.start);
				targets[0].dispose();
				command.dispose();
				return;
			}
		});
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
			executeCommand('setContext', 'moyu.snippetActive', false);
		};


		const handleInput = (text: string) => {
			const currentText = dh.getState('Input')?.value;
			const newText = currentText + text.trim()
			dh.update('Input', { value: newText });

			// type enter to confirm
			if (text === '\n') {
				const templete = CONFIG.TEMPLETE.find(i => i.command === newText);

				if (templete) {
					const snippet = createSnippetByTemplete(word, templete);
					edit({
						snippet,
						newLine: templete?.newLine,
						position: range?.end,
						replaceRange: range,
					})
				}

				clear();
			}
		}

		const handleBackspace = () => {
			const currentText = dh.getState('Input')?.value;

			if (currentText) {
				const newText = currentText.slice(0, currentText.length - 1)
				dh.update('Input', { value: newText });
			} else {

				// dispose input if there is no content to delete
				clear();
				return;
			}
		}

		const dh = new Decoration({ Input });
		dh.draw(range);

		const listener = dh.listen(handleInput);
		const escapeDisposer = registerTextEditorCommand("moyu.escape", clear);
		const backspaceDisposer = registerTextEditorCommand("moyu.backspace", handleBackspace);
	})
}


function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
	return registerCommand('type', (e) => {
		return callback(e)
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
