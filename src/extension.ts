import * as vscode from "vscode";
import { moveTo } from "./utils";
import { findInRange } from "./finder";
import Label from "./label/label";
import { TargetsController } from "./targets";

const { executeCommand, registerTextEditorCommand, registerCommand } =
  vscode.commands;

function testMask() {
  const activeTextEditor = vscode.window.activeTextEditor;
  const endLine = activeTextEditor?.visibleRanges[0].end.line || 0;
  const currentLine = activeTextEditor?.selection.active.line;
  const type = vscode.window.createTextEditorDecorationType({
    color: "red",
  });
  const range = new vscode.Range(
    new vscode.Position(currentLine || 0, 0),
    new vscode.Position(endLine || 0, 0)
  );
  vscode.window.activeTextEditor?.setDecorations(type, [range]);
}

const label = new Label();
const controller = new TargetsController();
let _input: string = "";

const handleInput = (text: string, type: "forward" | "backward") => {
  const input = _input + text;
  _input = input;
  console.log("input", input, text);

  if (text === "\n") {
    handleMoveCursor(1);
    return;
  }

  if (input.length === 1) {
    // nothing;
    return;
  }

  if (input.length === 2) {
    handleSearch(input, type);
    return;
  }

  if (input.length > 2) {
    handleLabel(text);
    return;
  }
};

const clear = () => {
  label.clear();
  controller.clear();
  _input = "";
  executeCommand("setContext", "moyu.searchActive", false);
};

const handleMoveCursor = (num: number) => {
  controller.move(num);
  moveTo(controller.cursorPosition());
  label.draw(controller.getLabelTargets());
};

const handleSearch = (input: string, type: "forward" | "backward") => {
  const activeTextEditor = vscode.window.activeTextEditor;
  const currentPosition = activeTextEditor?.selection.active;
  const forwardRange = activeTextEditor?.visibleRanges[0].with({
    start: currentPosition,
  });
  const backwardRange = activeTextEditor?.visibleRanges[0].with({
    end: currentPosition,
  });
  const positions = findInRange(
    input,
    type === "forward" ? forwardRange : backwardRange
  );

  // 没有结果，清空
  if (positions.length === 0) {
    clear();
    return;
  }

  // 只有一个结果，直接跳过去
  if (positions.length === 1) {
    moveTo(positions[0]);
    clear();
    return;
  }

  // 有多个结果，显示 label
  if (positions.length > 1) {
    controller.generate(positions);

    const targets = controller.getLabelTargets();
    const firstPosition = controller.cursorPosition();

    // 默认跳到第一个 target
    moveTo(firstPosition);
    label.draw(targets);
  }
};

const handleLabel = (text: string) => {
  controller.filter(text);

  // 只有一个结果，直接跳过去
  if (controller.getTargets().length === 1) {
    moveTo(controller.cursorPosition());
    clear();
  } else {
    // 有多个结果，显示 label
    label.draw(controller.getLabelTargets());
  }
};

export function activate(context: vscode.ExtensionContext) {
  /**
   * moyu.forward search
   */
  const disposeForwardSearch = registerTextEditorCommand(
    "moyu.forward search",
    () => {
      executeCommand("setContext", "moyu.searchActive", true);
      overrideDefaultTypeEvent(({ text }) => handleInput(text, "forward"));
    }
  );

  /**
   * moyu.backward search
   */
  const disposeBackwardSearch = registerTextEditorCommand(
    "moyu.backward search",
    () => {
      executeCommand("setContext", "moyu.searchActive", true);
      overrideDefaultTypeEvent(({ text }) => handleInput(text, "backward"));
    }
  );

  /**
   * moyu.next target
   */
  const disposeBackspace = registerTextEditorCommand("moyu.backspace", () => {
    handleMoveCursor(-1);
  });

  const disposeEscape = registerTextEditorCommand("moyu.escape", clear);

  context.subscriptions.push(disposeForwardSearch);
  context.subscriptions.push(disposeBackwardSearch);
  context.subscriptions.push(disposeBackspace);
  context.subscriptions.push(disposeEscape);
}

function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
  return registerCommand("type", (e) => callback(e));
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log("4");
  clear();
}
