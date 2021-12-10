import * as vscode from 'vscode';

type CreateFile = (
  /** 当前文件路径 */
  uri?: vscode.Uri,
  /** 创建的文件的名称 */
  fileName?: string,
) => Promise<boolean>

const createFile: CreateFile = async (uri, fileName = 'index.js') => {
  if (!uri) return false

  // 处理新文件的路径
  // 将当前文件的名字换一个就行了
  const filePath = uri.toString().split('/')
  filePath.splice(-1, 1, fileName);
  const newFilePath = vscode.Uri.parse(filePath.join('/'));

  const edit = new vscode.WorkspaceEdit()
  edit.createFile(newFilePath);

  return await vscode.workspace.applyEdit(edit);
}

export default createFile;