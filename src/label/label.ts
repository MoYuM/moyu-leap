import { Target } from "../interface";
import { objectToCssString } from "../utils";
import * as vscode from "vscode";

const defaultCss = {
  position: "absolute",
  ["background-color"]: "#FF6600",
  ["color"]: "#333",
  ["z-index"]: 1,
  ["font-size"]: "16px",
  ["pointer-events"]: "none",
};

class Label {
  private targets: Target[] = [];
  private disposers: Array<() => void> = [];

  createType(text: string) {
    const css = objectToCssString(defaultCss);
    const type = vscode.window.createTextEditorDecorationType({
      before: {
        contentText: text,
        textDecoration: `none; ${css}`,
      },
    });
    return type;
  }

  draw(targets: Target[]) {
    this.dispose();

    for (const t of targets) {
      const type = this.createType(t.value);
      const range = new vscode.Range(t.position, t.position);
      vscode.window.activeTextEditor?.setDecorations(type, [range]);
      this.disposers.push(type.dispose);
    }
  }

  dispose() {
    this.disposers.forEach((disposer) => disposer?.());
    this.disposers = [];
  }
}

export default Label;
