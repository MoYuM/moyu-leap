import * as vscode from 'vscode';
import { CustomTemplate } from './interface';

type GetSnippet = (template: CustomTemplate) => Promise<string>
type SelectItem = (list: CustomTemplate[]) => Promise<Array<{ name: string, values: Record<string, string> }>>

/**
 * Generate a snippet by template
 */
const getSnippet: GetSnippet = async template => {
  const { body, children } = template;
  const haveChildren = body.includes('{{children}}') && !!children?.length
  let result = body;

  // Select children
  if (haveChildren) {
    const childrenList = await selectItem(children);
    const code = childrenList.reduce((acc, cur) => {

      // find children body
      let childBody = children.find(i => i.name === cur.name)?.body;

      // replace custom value
      for (const valName in cur.values) {
        childBody = childBody?.replace(`{{${valName}}}`, cur.values[valName])
      }

      // handle indentation
      childBody = childBody?.replaceAll('\n', '\n\t');

      return acc +(childBody || '')
    }, '')

    result = body.replace('{{children}}', code)
  }

  return result;
}


/**
 * 调用showQuickPick 
 * 可以选择list中的若干项
 * 直到选择end为止
 */
const selectItem: SelectItem = async (templateList) => {
  // select item
  const nameList = templateList.map(i => i.name);
  const value = await vscode.window.showQuickPick([...nameList, 'end'])

  if (!value) return []
  if (value === 'end') {
    return []
  } else {

    // input custom value
    const currentTemplate = templateList.find(i => i.name === value) as CustomTemplate;
    const items = currentTemplate.body
      .match(/{{[a-zA-Z]+}}/g)
      ?.map(i => i.replaceAll(/\{|\}/g, ''))
      .filter(i => i !== 'children')

    let itemsObj: Record<string, string> = {};

    if (items?.length) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const res = await vscode.window.showInputBox({ placeHolder: `请输入${item}` });
        itemsObj[item] = res || '';
      }
    }

    return [
      {
        name: currentTemplate?.name,
        values: itemsObj,
      },
      ...await selectItem(templateList)
    ];
  }
}

export default getSnippet;