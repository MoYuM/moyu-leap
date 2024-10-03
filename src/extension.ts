import * as vscode from "vscode";
import { moveTo } from "./utils";
import { findInRange, generateTargets } from "./finder";
import Label from "./label/label";
import { MoyuStore } from "./interface";
import { MOYU_STORE_KEY } from "./constant";

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

function leap({
  type,
  context,
}: {
  type: "forward" | "backward";
  context: vscode.ExtensionContext;
}) {
  const set = (store: Partial<MoyuStore>) => {
    const currentStore = get();
    context.workspaceState.update(MOYU_STORE_KEY, {
      ...currentStore,
      ...store,
    });
  };

  const get = () => {
    return context.workspaceState.get<MoyuStore>(MOYU_STORE_KEY);
  };

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
    const input = get()?.input || "";
    const targets = get()?.targets || [];
    const showingLabel = get()?.showingLabel || false;

    const newInput = input + text;
    set({ input: newInput });

    const length = newInput.length;
    console.log("input", input);

    // 完成 label 阶段
    if (showingLabel && newInput.length > 2) {
      const newTargets = targets
        .filter((i) => i.value[0] === text)
        .map((i) => ({ ...i, value: i.value.slice(1) }));

      set({ targets: newTargets });

      // 只有一个结果，直接跳过去
      if (newTargets.length === 1) {
        moveTo(newTargets[0].position);
        clear();
        return;
      } else {
        // 有多个结果，显示 label
        label.setTargets(newTargets);
        label.draw();
        return;
      }
    }

    // 2 char
    if (length === 2) {
      const positions = findInRange(
        newInput,
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
        const [firstOne, ...newTargets] = generateTargets(positions.length).map(
          (i, index) => ({
            value: i,
            position: positions[index],
          })
        );

        // 默认跳到第一个 target
        moveTo(firstOne.position);
        label.setTargets(newTargets);
        label.draw();
        set({
          targets: newTargets,
          showingLabel: true,
        });
      }
    }
  };

  const clear = () => {
    command.dispose();
    escapeDisposer.dispose();
    label.clear();
    set({ input: "", showingLabel: false });
    executeCommand("setContext", "moyu.searchActive", false);
  };

  const command = overrideDefaultTypeEvent(({ text }) => handleInput(text));
  const escapeDisposer = registerTextEditorCommand("moyu.escape", clear);
}

export function activate(context: vscode.ExtensionContext) {
  /**
   * moyu.forward search
   */
  const disposeForwardSearch = registerTextEditorCommand(
    "moyu.forward search",
    () => {
      executeCommand("setContext", "moyu.searchActive", true);
      leap({ type: "forward", context });
    }
  );

  /**
   * moyu.backward search
   */
  const disposeBackwardSearch = registerTextEditorCommand(
    "moyu.backward search",
    () => {
      executeCommand("setContext", "moyu.searchActive", true);
      leap({ type: "backward", context });
    }
  );

  /**
   * moyu.next target
   */
  // const disposeNextTarget = registerTextEditorCommand(
  //   "moyu.next target",
  //   () => {
  //     console.log("moyu.next target");
  //   }
  // );

  context.subscriptions.push(disposeForwardSearch);
  context.subscriptions.push(disposeBackwardSearch);
  // context.subscriptions.push(disposeNextTarget);
}

function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
  return registerCommand("type", (e) => callback(e));
}

// this method is called when your extension is deactivated
export function deactivate() {}
