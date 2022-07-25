import * as vscode from 'vscode';
import { VARIABLE } from './constant';
import { TempleteType } from './interface';


export const editSnippet = (config: {
  /** 另起一行 */
  newLine?: boolean,
  snippet: vscode.SnippetString,
  position?: vscode.Position,
  replaceRange?: vscode.Range,
}) => {
  const { insertSnippet, edit } = vscode.window.activeTextEditor || {};
  const {
    snippet,
    position,
    newLine = false,
    replaceRange,
  } = config;
  if (!position) return;
  if (newLine) {
    insertSnippet?.(
      new vscode.SnippetString('\n'),
      position.with(position.line + 1, 0)
    )

    insertSnippet?.(
      snippet,
      position.with(position.line + 1)
    )
    return;
  }

  if (replaceRange) {
    edit?.((editor) => {
      if (!replaceRange) return;
      editor.delete(replaceRange);
    })
    insertSnippet?.(
      snippet,
      replaceRange.start,
    )
  }
}

export const createSnippetByTemplete = (text: string, templete: TempleteType) => {
  let result = templete?.body || '';

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
