import * as vscode from "vscode";

export type Target = {
  value: string;
  position: vscode.Position;
};

export type MoyuStore = {
  input: string;
  targets: Target[];
  showingLabel: boolean;
  index: number;
};
