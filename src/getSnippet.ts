import * as vscode from 'vscode';
import { CustomTemplate, AutoImport } from './interface';

type GetSnippet = (template: CustomTemplate) => Promise<string>
type SelectItem = (list: CustomTemplate[]) => Promise<Array<string>>
type GetCustomValues = (body: string) => Promise<string>
type InsertImport = (importList: AutoImport) => Promise<void>

class Snippet {
  /** config of template */
  template: CustomTemplate
  /** 最开始鼠标的位置 */
  originSelection?: vscode.Selection
  /** 自动import */
  autoImport: AutoImport
  /** 用于生成snippet的string */
  snippetString: string

  constructor(template: CustomTemplate, originSelection?: vscode.Selection) {
    this.originSelection = originSelection;
    this.template = template;
    this.autoImport = [];
    this.snippetString = template.body;
  }

  init = async () => {
    this.snippetString = await this.generateString(this.template);
  }

  /**
   * Select and input all we need to generate snippet
   */
  private generateString: GetSnippet = async (template) => {
    const { body, children, autoImport } = template;
    const haveChildren = body.includes('{{children}}') && !!children?.length;
    const needImport = autoImport && autoImport.length && autoImport.length > 0;

    // handle custom values
    let result = await this.replaceCustomValues(body);

    // handle import
    if (needImport) {
      this.autoImport = this.autoImport.concat(autoImport);
    }

    // handle children
    if (haveChildren) {
      const childrenList = await this.selectItem(children);
      const code = childrenList
        .map(i => i.replaceAll('\n', '\n\t'))
        .join('\n\t')

      result = result.replace('{{children}}', code)
    }

    return result;
  }


  /**
   * Select items in children with quickPick
   */
  private selectItem: SelectItem = async (templateList) => {

    // select item
    const nameList = templateList.map(i => i.name);
    const value = await vscode.window.showQuickPick([...nameList, 'end'])

    if (!value) return []
    if (value === 'end') {
      return []
    } else {

      // recursive
      const currentTemplate = templateList.find(i => i.name === value) as CustomTemplate;
      const sinppet = await this.generateString(currentTemplate);

      return [
        sinppet,
        ...await this.selectItem(templateList)
      ];
    }
  }


  /**
   * Find and replace custom values in body with inputbox
   */
  private replaceCustomValues: GetCustomValues = async (_body) => {
    let body = _body;
    const reg = /{{[a-zA-Z]+}}/g;

    if (!reg.test(body)) {
      return body
    }

    // find custom value
    const items = body
      .match(reg)
      ?.map(i => i.replaceAll(/\{|\}/g, ''))
      .filter(i => i !== 'children')

    let itemsObj: Record<string, string> = {};

    // input custom values
    if (items?.length) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const res = await vscode.window.showInputBox({ placeHolder: `请输入${item}` });
        itemsObj[item] = res || '';
      }
    }

    // replace custom value
    for (const valName in itemsObj) {
      body = body?.replace(`{{${valName}}}`, itemsObj[valName])
    }

    return body;
  }

  getSnippet: () => vscode.SnippetString = () => {
    return new vscode.SnippetString(this.snippetString);
  }

  insertSnippet = () => {
    
  }
}

const insertImport: InsertImport = async (importList) => {
  const curEditor = vscode.window.activeTextEditor
  if (!curEditor) return

  // get frist 10 line
  const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(11, 0))
  const textList = curEditor.document.getText(range).split('\n');

  // loop for import
  for (let i = 0; i < importList.length; i++) {
    const { key, from } = importList[i];
    // TODO consider double quotation
    const oldLineIndex = textList.findIndex(i => i.includes(`from '${from}'`));
    const oldLine = textList?.[oldLineIndex];
    const keyInOldLine = oldLine?.includes(key);

    // need insert new key in old import line
    if (oldLine && !keyInOldLine) {
      await curEditor.insertSnippet(
        new vscode.SnippetString(', ' + key),
        new vscode.Position(
          oldLineIndex,
          oldLine.indexOf('}')
        )
      )
    }

    // need new line to import
    if (!oldLine) {
      // find the last import line
      const lastImportIndex = 10 + 2 - textList.reverse().findIndex(i => i.includes('import'));
      await curEditor.insertSnippet(
        new vscode.SnippetString(`import { ${key} } from '${from}';\n`),
        new vscode.Position(
          lastImportIndex,
          0
        )
      )
    }
  }
}

export default Snippet;