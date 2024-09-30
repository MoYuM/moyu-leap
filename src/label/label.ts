import { Target } from "../interface";
import { objectToCssString } from "../utils";
import * as vscode from "vscode";

const defaultCss = {
  position: "absolute",
  top: "18px",
  ["color"]: "#F2BD1D",
  ["border-top"]: "2px solid #37A652",
  ["z-index"]: 1,
  ["font-weight"]: "700",
  ["font-size"]: "20px",
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

  draw() {
    this.dispose();

    for (const t of this.targets) {
      const type = this.createType(t.value);
      const range = new vscode.Range(t.position, t.position);
      vscode.window.activeTextEditor?.setDecorations(type, [range]);
      this.disposers.push(type.dispose);
    }
  }

  setTargets(targets: Target[]) {
    this.targets = targets;
  }

  dispose() {
    this.disposers.forEach((disposer) => disposer?.());
    this.disposers = [];
  }

  clear() {
    this.dispose();
    this.targets = [];
  }
}

export default Label;
