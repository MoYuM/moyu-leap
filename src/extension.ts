import * as vscode from 'vscode';
import createFile from './createFile';
import createComponent from './createComponent';
import Finder from './finderInline';
import { getCurrent, getRootUri, getUserInput, moveTo, select } from './utils';
import Search from './search';
import * as CONFIG from './constant';
import Decoration from './decoration';
import { createSnippetByTemplete, edit } from './snippet';


export function activate(context: vscode.ExtensionContext) {

	/**
	 * new file
	 */
	vscode.commands.registerTextEditorCommand('moyu.new file', async () => {
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
	vscode.commands.registerTextEditorCommand('moyu.new component', async () => {
		const rootPathURI = getRootUri();
		const componentName = await getUserInput('请输入新组件名称')
		if (!rootPathURI) return;
		await createComponent(rootPathURI, componentName, 'currentPageComponent')
	})


	/**
	 * new component in global
	 */
	vscode.commands.registerTextEditorCommand('moyu.new component in global', async () => {
		const rootPathURI = getRootUri();
		const componentName = await getUserInput('请输入新组件名称');
		if (!rootPathURI) return;
		await createComponent(rootPathURI, componentName, 'globalComponent')
	})


	/**
	 * new page
	 */
	vscode.commands.registerTextEditorCommand('moyu.new page', async () => {
		const rootPathURI = getRootUri();
		const componentName = await getUserInput('请输入新页面名称');
		if (!rootPathURI) return;
		await createComponent(rootPathURI, componentName, 'page')
	})


	/**
	 * select nearest word
	 */
	vscode.commands.registerTextEditorCommand('moyu.select neareast word', () => {
		const finder = new Finder();
		const word = finder.findNearestWord();
		select(word.range);
	});


	/**
	 * select next word
	 */
	vscode.commands.registerTextEditorCommand('moyu.select next word', () => {
		const finder = new Finder();
		const range = finder.findNextWord();
		select(range);
	});


	/**
	 * select pervious word
	 */
	vscode.commands.registerTextEditorCommand('moyu.select pervious word', () => {
		const finder = new Finder();
		const range = finder.findPrevWord();
		select(range);
	});


	/**
	 * moyu.move to next bracket
	 */
	vscode.commands.registerTextEditorCommand('moyu.move to next bracket', () => {
		const finder = new Finder();
		const position = finder.findNextBracket();
		moveTo(position);
	});


	/**
	 * moyu.search mode
	 */
	vscode.commands.registerTextEditorCommand('moyu.search mode', () => {
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
	 * moyu.move up 5 lines
	 */
	vscode.commands.registerTextEditorCommand('moyu.move up', () => {
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
	vscode.commands.registerTextEditorCommand('moyu.move down', () => {
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
	 * snippet 模式
	 */
	vscode.commands.registerTextEditorCommand('moyu.snippet mode', () => {
		vscode.commands.executeCommand('hideSuggestWidget')
		vscode.commands.executeCommand('setContext', 'moyu.snippetActive', true);
		const dh = new Decoration();
		const current = getCurrent();
		if (!current) return;

		const range = vscode.window.activeTextEditor?.document.getWordRangeAtPosition(current);
		const word = vscode.window.activeTextEditor?.document.getText(range);
		if (!word) return;

		let input = ''
		let decoration = dh.create({
			text: "",
			range,
			style: {
				top: '-20px',
				['min-width']: '30px'
			}
		});
		dh.draw(decoration);

		const clear = () => {
			decoration.dispose();
			command.dispose();
			escapeDisposer.dispose();
			backspaceDisposer.dispose();
			vscode.commands.executeCommand('setContext', 'moyu.snippetActive', false);
		}

		const backspace = () => {
			input = input.slice(0, input.length - 1);
			decoration = dh.update(decoration, input);
		}

		const inputHandler = ({ text }: { text: string }) => {
			input += text.trim();
			decoration = dh.update(decoration, decoration.content + text);

			if (text === '\n') {
				const templete = CONFIG.TEMPLETE.find(i => i.command === input);

				if (templete) {
					const snippet = createSnippetByTemplete(word, templete);
					clear();
					edit({
						snippet,
						newLine: templete?.newLine,
						position: range?.end,
						replaceRange: range,
					})
				}
			}
		}

		const escapeDisposer = vscode.commands.registerTextEditorCommand("moyu.escape", clear)
		const backspaceDisposer = vscode.commands.registerTextEditorCommand("moyu.backspace", backspace)
		const command = overrideDefaultTypeEvent(inputHandler);
	})
}


function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
	return vscode.commands.registerCommand('type', (e) => {
		return callback(e)
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
