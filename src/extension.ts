import * as vscode from 'vscode';
import createFile from './createFile';
import createComponent from './createComponent';
import Finder from './finderInline';
import { getRootUri, getUserInput, moveTo, select } from './utils';
import Search from './search';
import * as CONFIG from './constant';


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
		const range = finder.findNearestWord();
		select(range);
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
			current?.with(current.line - 5 <= 0 ? 0 : current.line - 5),
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
		const newPosition = current?.with(Math.min(current.line + 5, vscode.window.activeTextEditor?.document.lineCount as number))
		moveTo(newPosition, { withScroll: true });
	});
}

function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
	return vscode.commands.registerCommand('type', (e) => {
		return callback(e)
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
