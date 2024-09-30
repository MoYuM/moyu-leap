import * as vscode from "vscode";
import { moveTo } from "./utils";
import finder from "./finder";
import Label from "./label/label";
import { Target } from "./interface";

const { executeCommand, registerTextEditorCommand, registerCommand } =
  vscode.commands;

export function activate(context: vscode.ExtensionContext) {
  /**
   * moyu.search mode
   */
  registerTextEditorCommand("moyu.search mode", () => {
    executeCommand("hideSuggestWidget");
    executeCommand("setContext", "moyu.searchActive", true);

    let input = "";
    let showingLabel = false;
    let targets: Target[] = [];

    const activeTextEditor = vscode.window.activeTextEditor;
    const endLine = activeTextEditor?.visibleRanges[0].end.line || 0;
    const currentLine = activeTextEditor?.selection.active.line;
    const label = new Label();

    if (currentLine === undefined) {
      return;
    }

    const handleInput = (text: string) => {
      input += text;
      const length = input.length;

      // 完成 label 阶段
      if (showingLabel && input.length > 2) {
        console.log("aa");
        targets = targets
          .filter((i) => i.value[0] === text)
          .map((i) => ({ ...i, value: i.value.slice(1) }));

        // 只有一个结果，直接跳过去
        if (targets.length === 1) {
          console.log("bb");
          moveTo(targets[0].position);
          clear();
          return;
        } else {
          console.log("cc");
          // 有多个结果，显示 label
          label.setTargets(targets);
          label.draw();
          return;
        }
      }

      // 2 char
      if (length === 2) {
        console.log("dd");
        const positions = finder.findLetterBetweenLines(
          input,
          currentLine,
          endLine
        );

        // 只有一个结果，直接跳过去
        if (positions.length === 1) {
          console.log("ee");

          moveTo(positions[0]);
          clear();
          return;
        }

        // 有多个结果，显示 label
        if (positions.length > 1) {
          console.log(
            "ff",
            positions,
            finder.generateTargets(positions.length)
          );

          try {
            targets = finder
              .generateTargets(positions.length)
              .map((i, index) => ({
                value: i,
                position: positions[index],
              }));
          } catch (error) {
            console.log("error", error);
          }

          console.log("aaa", targets);
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
  });
}

function overrideDefaultTypeEvent(callback: (arg: { text: string }) => void) {
  return registerCommand("type", (e) => callback(e));
}

// this method is called when your extension is deactivated
export function deactivate() {}
