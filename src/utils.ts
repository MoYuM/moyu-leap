import * as vscode from "vscode";

/**
 * 替换uri的最后一段路径，并返回一个新的uri
 */
export const lastPathTo = (uri: vscode.Uri, name: string) => {
  const filePath = uri.toString().split("/");
  filePath.splice(-1, 1, name);
  return vscode.Uri.parse(filePath.join("/"));
};

/**
 * 获取当前根目录路径
 */
export const getRootUri = () => {
  return vscode.window.activeTextEditor?.document.uri;
};

/**
 * 打开一个InputBox，返回用户输入的字符串
 */
export const getUserInput = async (placeHolder: string) => {
  const string = await vscode.window.showInputBox({ placeHolder });
  return string;
};

/**
 * 选择一个 range
 * @param range Range
 */
export const select = (range?: vscode.Range) => {
  const editor = vscode.window.activeTextEditor;
  if (range && editor) {
    const selection = new vscode.Selection(range.start, range.end);
    editor.selection = selection;
  }
};

/**
 * 移动光标到某个 position
 * @param pos Position
 */
export const moveTo = (
  pos?: vscode.Position,
  config?: {
    withScroll: boolean;
  }
) => {
  const editor = vscode.window.activeTextEditor;
  const { withScroll } = config || {};
  if (pos && editor) {
    const selection = new vscode.Selection(pos, pos);
    editor.selection = selection;

    // scroll to
    if (withScroll) {
      const newRanges = new vscode.Range(pos, pos);
      vscode.window.activeTextEditor?.revealRange(newRanges, 1);
    }
  }
};

export const getCurrent = () => {
  return vscode.window.activeTextEditor?.selection.active;
};

/**
 * get the word in the range that return by getWordRangeAtPosition()
 */
export const getCurrentWordAndRange = () => {
  const current = getCurrent();
  if (!current) return {};
  const range =
    vscode.window.activeTextEditor?.document.getWordRangeAtPosition(current);
  if (!range) return {};
  const word = vscode.window.activeTextEditor?.document.getText(range);
  if (range && word) {
    return {
      range,
      word,
    };
  } else {
    return {};
  }
};

export const objectToCssString = (settings: any) => {
  let value = "";
  const cssString = Object.keys(settings)
    .map((setting) => {
      value = settings[setting];
      if (typeof value === "string" || typeof value === "number") {
        return `${setting}: ${value};`;
      }
    })
    .join(" ");

  return cssString;
};

export const setContext = (command: string, value: any) => {
  vscode.commands.executeCommand("setContext", command, value);
};

/**
 * 最小不会小于零
 */
export const zeroMin = (val: number) => Math.max(val, 0);

export const isMatch = (text: string, input: string) => {
  return input.split("").every((i, index) => text.charAt(index) === i);
};
