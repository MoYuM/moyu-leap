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
        top: '18px',
        ['color']: '#F2BD1D',
        ['border-top']: '2px solid #37A652',
        ['z-index']: 1,
        ['pointer-events']: 'none',
        ...this.style,
      };


      const css1 = objectToCssString(defaultCss);
      const type = vscode.window.createTextEditorDecorationType({
        before: {
          contentText: val,
          textDecoration: `none; ${css1}`
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