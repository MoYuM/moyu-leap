import * as vscode from "vscode";
import {
  getCurrentPosition,
  moveTo,
  setContext,
  type,
  getVisibleRange,
} from "./utils";
import { findInRange } from "./finder";
import Label from "./label/label";
import { TargetsController } from "./targets";

const { executeCommand, registerTextEditorCommand, registerCommand } =
  vscode.commands;

const label = new Label();
const controller = new TargetsController();
const disposes: vscode.Disposable[] = [];

let _input: string = "";

const handleInput = (text: string, type: "forward" | "backward") => {
  const input = _input + text;
  _input = input;
  console.log("input", input, text);

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
  disposes.forEach((i) => i.dispose());
  executeCommand("setContext", "moyu.searchActive", false);
};

const handleMoveCursor = (num: number) => {
  controller.move(num);
  moveTo(controller.cursorPosition());
  label.draw(controller.getLabelTargets());
};

const handleSearch = (input: string, type: "forward" | "backward") => {
  const currentPosition = getCurrentPosition();
  const forwardRange = getVisibleRange()?.with({ start: currentPosition });
  const backwardRange = getVisibleRange()?.with({ end: currentPosition });

  const positions = findInRange(
    input,
    type === "forward" ? forwardRange : backwardRange
  );

  // No result, clear and quit
  if (positions.length === 0) {
    clear();
    return;
  }

  // Only one result, move to the position, and quit
  if (positions.length === 1) {
    moveTo(positions[0]);
    clear();
    return;
  }

  // Multiple results, generate targets, and draw the label
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
   * moyu.previous target
   */
  const disposePreviousTarget = registerTextEditorCommand(
    "moyu.previous target",
    () => {
      handleMoveCursor(-1);
    }
  );

  /**
   * moyu.next target
   */
  const disposeNextTarget = registerTextEditorCommand(
    "moyu.next target",
    () => {
      handleMoveCursor(1);
    }
  );

  /**
   * moyu.escape
   */
  const disposeEscape = registerTextEditorCommand("moyu.escape", clear);

  context.subscriptions.push(disposeForwardSearch);
  context.subscriptions.push(disposeBackwardSearch);
  context.subscriptions.push(disposePreviousTarget);
  context.subscriptions.push(disposeEscape);
  context.subscriptions.push(disposeNextTarget);
}

function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
  const command = registerCommand("type", (e) => callback(e));
  disposes.push(command);
}

// this method is called when your extension is deactivated
export function deactivate() {
  clear();
}
