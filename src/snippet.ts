import * as vscode from 'vscode';
import { TEMPLETE, VARIABLE } from './constant';
import { moveTo } from './utils';

export const edit = (config: {
  /** 另起一行 */
  newLine?: boolean,
  snippet: vscode.SnippetString,
  position?: vscode.Position,
  replaceRange?: vscode.Range,
}) => {
  const {
    snippet,
    position,
    newLine = false,
    replaceRange,
  } = config;
  if (!position) return;
  if (newLine) {
    vscode.window.activeTextEditor?.insertSnippet(
      new vscode.SnippetString('\n'),
      position.with(position.line + 1, 0)
    )

    vscode.window.activeTextEditor?.insertSnippet(
      snippet,
      position.with(position.line + 1)
    )
  }

  if (replaceRange) {
    vscode.window.activeTextEditor?.edit((editor) => {
      if (!replaceRange) return;
      editor.delete(replaceRange);
      editor.insert(replaceRange.start, snippet.value);
    })
  }
}

export const createSnippet = (
  text?: string,
  command?: string,
) => {
  if (!text) return;
  if (command) return templeteToSnippet(text, command);
  return new vscode.SnippetString(text);
}

export const templeteToSnippet = (text: string, command: string) => {
  const templete = TEMPLETE.find(i => i.command === command);
  let result = templete?.body || '';
  if (!templete) return;

  VARIABLE.forEach(v => {
    const variable = `$\{${v.name}\}`
    if (result.includes(variable)) {
      result = result.replaceAll(
        variable,
        v.transformer(text)
      );
    }
  })

  return new vscode.SnippetString(result);
}
