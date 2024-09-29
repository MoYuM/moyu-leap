import * as vscode from "vscode";

export interface ComponentState {
  [key: string]: any;
}

export interface Component {
  state: Record<string, any>;
  style?: Record<string, any>;
  /**
   * create decorationTypes
   *
   * all types will set on the same range
   */
  createType(): vscode.TextEditorDecorationType[];

  draw(range: vscode.Range[]): Array<() => void>;

  setState(newState: ComponentState): void;

  setStyle(newStyle: Record<string, any>): void;
}

/**
 * the base class of all Component
 */
class Decoration {
  components: { component: Component; key: string }[];
  disposers: Array<() => void> = [];
  ranges?: vscode.Range[];

  constructor(components: Record<string, new () => Component>) {
    this.components = Object.keys(components).map((i) => ({
      component: new components[i](),
      key: i,
    }));
  }

  public draw(ranges: vscode.Range[]) {
    this.ranges = ranges;
    let newDisposers: Array<() => void> = [];
    this.components.forEach((i) => {
      const disposers = i.component.draw(ranges);
      newDisposers = [...newDisposers, ...disposers];
    });
    this.disposers = newDisposers;
  }

  public update(key: string, newState: Record<string, any>) {
    // TODO if the state has not changed, there is no need to update
    // need a isEqual function
    this.setState(key, newState);
    this.dispose();
    if (this.ranges) {
      this.draw(this.ranges);
    }
  }

  public dispose() {
    this.disposers.forEach((d) => d?.());
    this.disposers = [];
  }

  public getComponent(key: string) {
    return this.components.find((i) => i.key === key)?.component;
  }

  public getState(key: string) {
    return this.getComponent(key)?.state || {};
  }

  public setState(key: string, newState: Record<string, any>) {
    return this.getComponent(key)?.setState(newState);
  }

  public setStyle(key: string, style: Record<string, any>) {
    this.getComponent(key)?.setStyle(style);
  }

  /** overwrite vscode type event */
  public listen(callback: (key: string) => void) {
    return vscode.commands.registerCommand("type", ({ text }) => {
      callback(text);
    });
  }
}

export default Decoration;
