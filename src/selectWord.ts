import * as vscode from 'vscode';

const getCursorPosition = () => {
  return vscode.window.activeTextEditor?.selection.active;
}

const getTextDoc = () => {
  return vscode.window.activeTextEditor?.document;
}

const getEditor = () => {
  return vscode.window.activeTextEditor;
}

const selectionTheWord = (editor: vscode.TextEditor, range?: vscode.Range) => {
  if (range) {
    // 光标在单词中或紧挨着单词
    const selection = new vscode.Selection(range.start, range.end);
    editor.selection = selection
  }
}

/**
 * 选择当前光标所在的单词，如果光标没有在单词中，则选择最近的单词
 */
const selectWord = () => {
  const textDoc = getTextDoc();
  const cursorPos = getCursorPosition();
  const editor = getEditor();
  if (!cursorPos || !editor) return;

  const wordRange = textDoc?.getWordRangeAtPosition(cursorPos);

  if (wordRange) {
    // 光标在单词中或紧挨着单词
    selectionTheWord(editor, wordRange);
  } else {
    // 光标不挨着任何单词，则向左寻找第一个单词，并选中它
    const { line, character } = cursorPos;
    const firstCharPos = new vscode.Position(line, 0);
    const lineTextBeforeCursor = textDoc?.getText(new vscode.Range(firstCharPos, cursorPos));

    // 离最近的一个字母，有多远
    const lastLetterIndex = lineTextBeforeCursor?.split('').reverse().findIndex(i => /[a-zA-Z]/.test(i));

    if (lastLetterIndex) {
      const lastWord = textDoc?.getWordRangeAtPosition(new vscode.Position(line, character - lastLetterIndex))
      selectionTheWord(editor, lastWord);
    }
  }
}

export default selectWord;