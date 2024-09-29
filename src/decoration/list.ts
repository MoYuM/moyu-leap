import * as vscode from "vscode";
import * as CONFIG from "../constant";
import { Component } from "./base";
import Block from "./block";

type ListItemType = {
  label: string;
  key: string;
};

type ListStateType = {
  list: ListItemType[];
  activeKey: string;
};

class List implements Component {
  state: ListStateType;
  style?: Record<string, any>;

  constructor() {
    this.state = {
      list: [],
      activeKey: "",
    };
  }

  private getListItemStyle(index: number) {
    const style: Record<string, string> = {};
    const lastIndex = this.state.list.length - 1;

    style["min-width"] = "200px";
    style["top"] = `${index * 20 + 5}px`;
    style["background-color"] = "#D0D8D9";
    style["color"] = "#40362E";
    style["border-radius"] = "0";

    if (index === 0) {
      style["border-radius"] = `5px 5px 0 0`;
    } else if (index === lastIndex) {
      style["border-radius"] = `0 0 5px 5px`;
    }

    return style;
  }

  private getActiveItemStyle() {
    return {
      background: "#D92818",
      color: "white",
      ["box-shadow"]: "0px 0px 11px 0px #BF372A",
      ["z-index"]: "999",
    };
  }

  public createType(): vscode.TextEditorDecorationType[] {
    const { list, activeKey } = this.state;
    const types: vscode.TextEditorDecorationType[] = [];

    list.forEach((i, index) => {
      const block = new Block();
      block.setState({ value: i.label });
      block.setStyle(this.getListItemStyle(index));

      // TODO make background color is configable
      if (activeKey === i.key) {
        block.setStyle(this.getActiveItemStyle());
      }

      const type = block.createType()[0];
      types.push(type);
    });

    return types;
  }

  draw(range: vscode.Range[]): (() => void)[] {
    const types = this.createType();
    const disposers: Array<() => void> = [];

    types.forEach((t) => {
      disposers.push(t.dispose);
      vscode.window.activeTextEditor?.setDecorations(t, range);
    });

    return disposers;
  }

  public setState(newState: ListStateType): void {
    this.state = {
      ...this.state,
      ...newState,
    };
  }

  public setStyle(newStyle: Record<string, any>): void {
    this.style = {
      ...this.style,
      ...newStyle,
    };
  }
}

export default List;
