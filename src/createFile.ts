import * as vscode from 'vscode';
import { lastPathTo } from './utils';

type CreateFile = (
  /** 当前文件路径 */
  uri?: vscode.Uri,
  /** 创建的文件的名称 */
  fileName?: string,
) => Promise<{
  result: boolean,
  uri?: vscode.Uri,
}>

const createFile: CreateFile = async (uri, fileName = 'index.tsx') => {
  if (!uri) {
    return {
      result: false,
    }
  }

  const newFilePath = lastPathTo(uri, fileName);
  const edit = new vscode.WorkspaceEdit()
  edit.createFile(newFilePath);
  const result = await vscode.workspace.applyEdit(edit);

  return {
    result,
    uri: newFilePath
  }
}

export default createFile;