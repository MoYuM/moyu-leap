import * as vscode from 'vscode';

/**
 * 替换uri的最后一段路径，并返回一个新的uri
 */
export const lastPathTo = (uri: vscode.Uri, name: string) => {
  const filePath = uri.toString().split('/')
  filePath.splice(-1, 1, name);
  return vscode.Uri.parse(filePath.join('/'));
}
