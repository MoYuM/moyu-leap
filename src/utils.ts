import * as vscode from 'vscode';

/**
 * 替换uri的最后一段路径，并返回一个新的uri
 */
export const lastPathTo = (uri: vscode.Uri, name: string) => {
  const filePath = uri.toString().split('/')
  filePath.splice(-1, 1, name);
  return vscode.Uri.parse(filePath.join('/'));
}

/**
 * 获取当前根目录路径
 */
export const getRootUri = () => {
  return vscode.window.activeTextEditor?.document.uri
}

/**
 * 打开一个InputBox，返回用户输入的字符串
 */
export const getUserInput = async (placeHolder: string) => {
  const string = await vscode.window.showInputBox({ placeHolder })
  return string;
}