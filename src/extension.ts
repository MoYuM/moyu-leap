import * as vscode from "vscode";
import { moveTo } from "./utils";
import finder, { findInRange } from "./finder";
import Label from "./label/label";
import { Target } from "./interface";

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

function leap({ type }: { type: "forward" | "backward" }) {
  let input = "";
  let showingLabel = false;
  let targets: Target[] = [];

  const activeTextEditor = vscode.window.activeTextEditor;
  const currentLine = activeTextEditor?.selection.active.line;

  const currentPosition = activeTextEditor?.selection.active;
  const forwardRange = activeTextEditor?.visibleRanges[0].with({
    start: currentPosition,
  });
  const backwardRange = activeTextEditor?.visibleRanges[0].with({
    end: currentPosition,
  });

  const label = new Label();

  if (currentLine === undefined) {
    return;
  }

  const handleInput = (text: string) => {
    input += text;
    const length = input.length;
    console.log("input", input);

    // 完成 label 阶段
    if (showingLabel && input.length > 2) {
      targets = targets
        .filter((i) => i.value[0] === text)
        .map((i) => ({ ...i, value: i.value.slice(1) }));

      // 只有一个结果，直接跳过去
      if (targets.length === 1) {
        moveTo(targets[0].position);
        clear();
        return;
      } else {
        // 有多个结果，显示 label
        label.setTargets(targets);
        label.draw();
        return;
      }
    }

    // 2 char
    if (length === 2) {
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
        targets = finder.generateTargets(positions.length).map((i, index) => ({
          value: i,
          position: positions[index],
        }));

        label.setTargets(targets);
        label.draw();
        showingLabel = true;
        return;
      }
    }
  };

  const clear = () => {
    executeCommand("setContext", "moyu.searchActive", false);
    command.dispose();
    label.clear();
    escapeDisposer.dispose();
    targets = [];
    input = "";
    showingLabel = false;
  };

  const command = overrideDefaultTypeEvent(({ text }) => handleInput(text));
  const escapeDisposer = registerTextEditorCommand("moyu.escape", clear);
}

export function activate(context: vscode.ExtensionContext) {
  /**
   * moyu.forward search
   */
  registerTextEditorCommand("moyu.forward search", () => {
    executeCommand("setContext", "moyu.searchActive", true);
    leap({ type: "forward" });
  });

  /**
   * moyu.backward search
   */
  registerTextEditorCommand("moyu.backward search", () => {
    executeCommand("setContext", "moyu.searchActive", true);
    leap({ type: "backward" });
  });
}

function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
  return registerCommand("type", (e) => callback(e));
}

// this method is called when your extension is deactivated
export function deactivate() {}
