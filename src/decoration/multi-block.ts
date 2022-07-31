import * as vscode from 'vscode';
import * as CONFIG from '../constant';
import { Component, ComponentState } from './base';
import { objectToCssString, select } from '../utils';
import Block from './block';

class MultiBlock implements Component {

  state = {
    values: []
  };
  style = {};

  constructor() {
  }

  createType(): vscode.TextEditorDecorationType[] {
    const types = this.state.values.map(val => {
      const defaultCss = {
        position: 'absolute',
        top: '-20px',
        height: '20px',
        display: `inline-block`,
        padding: '0 4px',
        color: CONFIG.COLOR,
        ['background-color']: CONFIG.BACKGROUNDCOLOR,
        ['border-radius']: '2px',
        ['line-height']: '20px',
        ['z-index']: 1,
        ['pointer-events']: 'none',
        ...this.style,
      };

      const css = objectToCssString(defaultCss);
      const type = vscode.window.createTextEditorDecorationType({
        before: {
          contentText: val,
          textDecoration: `none; ${css}`
        },
      })
      return type;
    })

    return types;
  }

  draw(range: vscode.Range[]) {
    const types = this.createType();
    const disposers: Array<() => void> = [];
    types.forEach((t, index) => {
      console.log('hhhhhh',range[index].end.line ,range[index].start.line,range[index].start.character, range[index].end.character)
      vscode.window.activeTextEditor?.setDecorations(t, [range[index]])
      disposers.push(t.dispose);
    })
    return disposers;
  }

  setState(newState: ComponentState): void {
    this.state = {
      ...this.state,
      ...newState,
    }
  }

  setStyle(newStyle: Record<string, any>): void {
    this.style = {
      ...this.style,
      ...newStyle,
    }
  }
}

export default MultiBlock;