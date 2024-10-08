import * as vscode from "vscode";
import { getCurrentPosition, moveTo, setContext, type } from "./utils";
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
let disposeDefaultType: (() => void) | null = null;
const disposes: vscode.Disposable[] = [];

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
  console.log("[clear moyu]", disposeDefaultType);
  label.clear();
  controller.clear();
  _input = "";
  disposes.forEach((i) => i.dispose());
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
  const labelTargets = controller.search(text);

  // No match target, type the text, and quit
  if (labelTargets.length === 0) {
    const currentPosition = getCurrentPosition();
    if (currentPosition) {
      type(text, currentPosition);
    }
    clear();
    return;
  }

  // Match one target, move to the target, and quit
  if (labelTargets.length === 1) {
    moveTo(labelTargets[0].position);
    clear();
    return;
  }

  // Match multiple targets, search and update the label
  if (labelTargets.length > 1) {
    label.draw(labelTargets);
  }
};

export function activate(context: vscode.ExtensionContext) {
  /**
   * moyu.forward search
   */
  const disposeForwardSearch = registerTextEditorCommand(
    "moyu.forward search",
    () => {
      setContext("moyu.searchActive", true);
      overrideDefaultTypeEvent(({ text }) => handleInput(text, "forward"));
    }
  );

  /**
   * moyu.backward search
   */
  const disposeBackwardSearch = registerTextEditorCommand(
    "moyu.backward search",
    () => {
      setContext("moyu.searchActive", false);
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
  const command = registerCommand("type", (e) => callback(e));
  disposes.push(command);
}

// this method is called when your extension is deactivated
export function deactivate() {
  clear();
}
