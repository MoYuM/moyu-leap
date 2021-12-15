import * as vscode from 'vscode';
import customTemplate from './template';
import Snippet from './getSnippet';
import createFile from './createFile';
import createComponent from './createComponent';
export function activate(context: vscode.ExtensionContext) {

	// let addForm = vscode.commands.registerTextEditorCommand('moyu.add a antd form', async (edit) => {

	// 	// New editor
	// 	const editor = vscode.window.activeTextEditor
	// 	const curPosition = editor?.selection

	// 	// Select template
	// 	const name = await vscode.window.showQuickPick(customTemplate.map(i => i.name));
	// 	if (!name) return;

	// 	const template = customTemplate.find(i => i.name === name);

	// 	// Create a new snippet
	// 	if (!template) return;
	// 	const mo = new Snippet(template, curPosition);
	// 	await mo.init();
	// 	const snippet = mo.getSnippet();
	// 	console.log('%cmo.autoImport', 'background-color: darkorange', mo.autoImport);

	// 	// insert text
	// 	editor?.insertSnippet(snippet, curPosition);
	// });

	let addFile = vscode.commands.registerTextEditorCommand('moyu.add a file', async () => {
		const rootPathURI = vscode.window.activeTextEditor?.document.uri
		const fileName = await vscode.window.showInputBox({ placeHolder: '请输入文件名称' })

		const res = await createFile(rootPathURI, fileName);

		if (res.result && res.uri) {
			await vscode.window.showTextDocument(res.uri, { preview: false })
			vscode.window.showInformationMessage('创建成功');
		} else {
			vscode.window.showErrorMessage('创建失败')
		}
	})

	let addComponent = vscode.commands.registerTextEditorCommand('moyu.new component', async () => {
		const rootPathURI = vscode.window.activeTextEditor?.document.uri
		const componentName = await vscode.window.showInputBox({ placeHolder: '请输入新组件名称' })
		if (!rootPathURI) return;

		await createComponent(rootPathURI, componentName, 'currentPath')
	})

	let addComponentInGlobal = vscode.commands.registerTextEditorCommand('moyu.new component in global', async () => {
		const rootPathURI = vscode.window.activeTextEditor?.document.uri
		const componentName = await vscode.window.showInputBox({ placeHolder: '请输入新组件名称' })
		if (!rootPathURI) return;

		await createComponent(rootPathURI, componentName, 'global')
	})


	// context.subscriptions.push(addForm);
	context.subscriptions.push(addFile);
}

// this method is called when your extension is deactivated
export function deactivate() { }
