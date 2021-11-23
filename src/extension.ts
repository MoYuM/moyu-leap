import * as vscode from 'vscode';
import customTemplate from './template';
import Snippet from './getSnippet';

export function activate(context: vscode.ExtensionContext) {

	let addForm = vscode.commands.registerTextEditorCommand('moyu.add a antd form', async (edit) => {

		// 创建文件夹
		// if (vscode.workspace.workspaceFolders) {
		// 	const rootPathURI = vscode.workspace.workspaceFolders[0].uri
		// 	const newPath = vscode.Uri.joinPath(rootPathURI, '/test');
		// 	vscode.workspace.fs.createDirectory(newPath)
		// }

		// New editor
		const editor = vscode.window.activeTextEditor
		const curPosition = editor?.selection

		// Select template
		const name = await vscode.window.showQuickPick(customTemplate.map(i => i.name));
		if (!name) return;

		const template = customTemplate.find(i => i.name === name);

		// Create a new snippet
		if (!template) return;
		const mo = new Snippet(template, curPosition);
		await mo.init();
		const snippet = mo.getSnippet();
		console.log('%cmo.autoImport', 'background-color: darkorange', mo.autoImport);

		// insert text
		editor?.insertSnippet(snippet, curPosition);
	});


	context.subscriptions.push(addForm);
}

// this method is called when your extension is deactivated
export function deactivate() { }
