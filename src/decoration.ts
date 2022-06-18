import * as vscode from 'vscode';
import * as CONFIG from './constant';

type DecorationMore = vscode.TextEditorDecorationType & {
  content?: string,
  range?: vscode.Range,
  style?: Record<string, string | number>,
}

class Decoration {

  private objectToCssString = (settings: any) => {
    let value = '';
    const cssString = Object.keys(settings).map(setting => {
      value = settings[setting];
      if (typeof value === 'string' || typeof value === 'number') {
        return `${setting}: ${value};`
      }
    }).join(' ');

    return cssString;
  }

  public create(config: {
    text?: string,
    range?: vscode.Range,
    style?: Record<string, string | number>,
  }): DecorationMore {
    const { text, range, style } = config;

    const defaultCss = {
      position: 'absolute',
      top: 0,
      height: '20px',
      display: `inline-block`,
      padding: '0 4px',
      color: CONFIG.COLOR,
      ['background-color']: CONFIG.BACKGROUNDCOLOR,
      ['border-radius']: '2px',
      ['line-height']: '20px',
      ['z-index']: 1,
      ['pointer-events']: 'none',
      ...style,
    };

    const css = this.objectToCssString(defaultCss);
    const type = vscode.window.createTextEditorDecorationType({
      before: {
        contentText: text,
        textDecoration: `none; ${css}`
      },
    })

    return {
      ...type,
      range,
      content: text,
      style: defaultCss,
    }
  }

  public draw(
    type: DecorationMore,
  ) {
    const { range } = type;
    if (range) {
      vscode.window.activeTextEditor?.setDecorations(type, [range]);
    }
  }

  public update(d: DecorationMore, options: { text: string }) {
    if (!d.range) return;
    d.dispose();
    const newD = this.create({
      text: options.text,
      range: d.range,
      style: d.style
    });
    this.draw(newD);
    return newD;
  }
}

export default Decoration;