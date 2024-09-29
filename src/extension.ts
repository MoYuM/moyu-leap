import * as vscode from "vscode";
import { moveTo, getCurrent, zeroMin, isMatch } from "./utils";
import finder from "./finder";
import Decoration from "./decoration/base";
import MultiBlock from "./decoration/multi-block";

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
    let isFirst = true;
    let targets: { value: string; range: vscode.Range }[] = [];

    const endLine =
      vscode.window.activeTextEditor?.visibleRanges[0].end.line || 0;
    const currentLine = vscode.window.activeTextEditor?.selection.active.line;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const dh = new Decoration({ MultiBlock });

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
          moveTo(targets[0].range.start);
          clear();
          return;
        } else {
          console.log("cc");
          // 有多个结果，显示 label
          dh.setState("MultiBlock", { values: targets.map((i) => i.value) });
          dh.dispose();
          dh.draw(targets.map((i) => i.range));
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
              .map((i, index) => {
                const pos = positions[index];
                const range: vscode.Range = new vscode.Range(
                  pos,
                  pos.with(pos.line, pos.character + 1)
                );
                return {
                  value: i,
                  range: range,
                };
              });
          } catch (error) {
            console.log("error", error);
          }

          console.log("aaa", targets);
          dh.setState("MultiBlock", { values: targets.map((i) => i.value) });
          dh.draw(targets.map((i) => i.range));
          showingLabel = true;
          return;
        }
      }

      // if (isFirst) {
      //   const positions = finder
      //     .findLetterBetweenLines(text, currentLine, endLine)
      //     .sort((a, b) => {
      //       if (a.line === currentLine && b.line === currentLine) {
      //         return a.character - b.character;
      //       }
      //       if (a.line === currentLine) {
      //         return -1;
      //       }
      //       if (b.line === currentLine) {
      //         return 1;
      //       }
      //       return 0;
      //     });
      //   targets = finder
      //     .generateTargets(positions.length)
      //     .filter((_, index) => !!positions[index])
      //     .map((i, index) => {
      //       const pos = positions[index];
      //       const range: vscode.Range = new vscode.Range(
      //         pos,
      //         pos.with(pos.line, pos.character + 1)
      //       );
      //       return {
      //         value: i,
      //         range: range,
      //       };
      //     });
      //   console.log("targets", targets);
      //   dh.setState("MultiBlock", { values: targets.map((i) => i.value) });
      //   dh.draw(targets.map((i) => i.range));

      //   isFirst = false;
      // } else {
      //   input = input + text.trim();
      //   const isFound =
      //     targets.filter((i) => isMatch(i.value, input)).length === 1;
      //   if (isFound) {
      //     moveTo(targets.find((i) => i.value.includes(text))?.range.start);
      //     clear();
      //   } else {
      //     targets = targets.filter((i) => isMatch(i.value, input));
      //     if (targets.length) {
      //       console.log("targets 2", targets);
      //       dh.setState("MultiBlock", { values: targets.map((i) => i.value) });
      //       dh.dispose();
      //       dh.draw(targets.map((i) => i.range));
      //     } else {
      //       clear();
      //     }
      //   }
      // }
    };

    const clear = () => {
      executeCommand("setContext", "moyu.searchActive", false);
      command.dispose();
      dh.dispose();
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
