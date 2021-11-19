import * as vscode from 'vscode';

const formItems = ['input', 'select', 'empty']

const selectItem: () => Promise<string[] | []> = async () => {
	const value = await vscode.window.showQuickPick([...formItems, 'end'])
	if (!value) return []
	if (value === 'end') {
		return []
	} else {
		vscode.window.showInformationMessage(`增加${value}组件`)
		return [value, ...await selectItem()];
	}
}

const itemMap: Record<string, string> = {
	'input': `<Form.Item \n\tname="input" \n\tlabel="input"\n>\n\t<Input />\n</Form.Item>`,
	'select': `<Form.Item \n\tname="select" \n\tlabel="select"\n>\n\t<Select />\n</Form.Item>`,
	'empty': `<Form.Item \n\tname="empty" \n\tlabel="empty">\n<></>\n</Form.Item>`,
}

const generateFormItemCode: (itemList: string[] | []) => vscode.SnippetString = (itemList) => {
	const str = itemList.map(i => itemMap[i]).join('')
	return new vscode.SnippetString(str);
}

export function activate(context: vscode.ExtensionContext) {

	let addForm = vscode.commands.registerTextEditorCommand('moyu.add a antd form', async (edit) => {
		const first20LineRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(21, 0))
		const first20Text = edit.document.getText(first20LineRange)
		// TODO 考虑双引号
		const theLineNumber = first20Text.split('\n').findIndex(i => i.includes("from 'antd'")) + 1
		const theLine = first20Text.split('\n').find(i => i.includes("from 'antd'"))
		console.log('%ctheLine', 'background-color: darkorange', theLine);
		console.log('%cfirst20Text', 'background-color: darkorange', first20Text);
		// const itemList = await selectItem();

		// 创建文件夹
		// if (vscode.workspace.workspaceFolders) {
		// 	const rootPathURI = vscode.workspace.workspaceFolders[0].uri
		// 	const newPath = vscode.Uri.joinPath(rootPathURI, '/test');
		// 	vscode.workspace.fs.createDirectory(newPath)
		// }

		/**
		 * insert code
		 */

		// New editor
		// const editor = vscode.window.activeTextEditor


		// Create a new snippet
		// const snippet = generateFormItemCode(itemList);

		// insert text
		// editor?.insertSnippet(snippet);
	});

	const formWith = vscode.commands.registerTextEditorCommand('moyu.form with', () => {
		console.log('adf')
	})

	context.subscriptions.push(addForm);
	context.subscriptions.push(formWith);
}

// this method is called when your extension is deactivated
export function deactivate() { }
