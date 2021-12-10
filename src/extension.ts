import * as vscode from 'vscode';
import customTemplate from './template';
import Snippet from './getSnippet';
import createFile from './createFile';
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
		// 创建文件夹
		if (vscode.workspace.workspaceFolders) {
			const rootPathURI = vscode.window.activeTextEditor?.document.uri
			
			const res = await createFile(rootPathURI, 'test.less')
			if (res) {
				vscode.window.showInformationMessage('创建成功');
			} else {
				vscode.window.showErrorMessage('创建失败')
			}
		}
	})


	// context.subscriptions.push(addForm);
	context.subscriptions.push(addFile);
}

// this method is called when your extension is deactivated
export function deactivate() { }
