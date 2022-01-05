import * as vscode from 'vscode';
import createFile from './createFile';
import createComponent from './createComponent';
import selectWord from './selectWord';
import { getRootUri, getUserInput } from './utils';


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
	 * select word
	 */
	vscode.commands.registerTextEditorCommand('moyu.select word', async () => {
		selectWord();
	})

}

// this method is called when your extension is deactivated
export function deactivate() { }
