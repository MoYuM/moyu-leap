import * as vscode from "vscode";
export interface CustomTemplate {
  /** 代码片段名称 */
  name: string;
  /** 代码片段主体 */
  body: string;
  /** 需要导入的组件 */
  autoImport?: AutoImport;
  /** 子元素 */
  children?: CustomTemplate[];
}

export type Word = {
  text: string;
  start: number;
  end: number;
  line: number;
  range: vscode.Range;
};

export type Target = {
  value: string;
  position: vscode.Position;
};

export type AutoImport = Array<{ key: string; from: string }>;

export type VariableType = Array<{
  name: string;
  transformer: (text: string) => string;
}>;

export type TempleteType = {
  name: string;
  command: string;
  newLine: boolean;
  body: string;
};
