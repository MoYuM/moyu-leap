import * as vscode from 'vscode';
import * as CONFIG from '../constant';
import { Component } from './base';
import Block from './block';

type ListItemType = {
  label: string,
  key: string,
}

type ListStateType = {
  list: ListItemType[],
  activeKey: string,
}

class List implements Component {
  state: ListStateType;
  style?: Record<string, any>

  constructor() {
    this.state = {
      list: [],
      activeKey: '',
    }
  }

  public createType(): vscode.TextEditorDecorationType[] {
    const { list, activeKey } = this.state;
    const types: vscode.TextEditorDecorationType[] = [];
    list.forEach((i, index) => {
      const block = new Block();
      block.setState({ value: i.label });
      block.setStyle({
        top: `${index * 20}px`,
        ['min-width']: '200px',
      });

      // TODO make background color is configable
      if (activeKey === i.key) {
        block.setStyle({ background: 'red' });
      }

      const type = block.createType()[0];
      types.push(type);
    })

    return types;
  }

  public setState(newState: ListStateType): void {
    this.state = {
      ...this.state,
      ...newState,
    }
  }

  public setStyle(newStyle: Record<string, any>): void {
    this.style = {
      ...this.style,
      ...newStyle,
    }
  }
}

export default List;