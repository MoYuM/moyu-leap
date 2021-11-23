import * as vscode from 'vscode';
import { CustomTemplate } from './interface';

type GetSnippet = (template: CustomTemplate) => Promise<string>
type SelectItem = (list: CustomTemplate[]) => Promise<Array<string>>
type GetCustomValues = (body: string) => Promise<string>


/**
 * Generate a snippet by template
 */
const getSnippet: GetSnippet = async template => {
  const { body, children } = template;
  const haveChildren = body.includes('{{children}}') && !!children?.length

  // handle custom values
  let result = await replaceCustomValues(body);

  // handle children
  if (haveChildren) {
    const childrenList = await selectItem(children);
    const code = childrenList
      .map(i => i.replaceAll('\n', '\n\t'))
      .join('\n\t')

    result = result.replace('{{children}}', code)
  }

  return result;
}



/**
 * 
 * Find and replace custom values in body with inputbox
 * 
 */
const replaceCustomValues: GetCustomValues = async (_body) => {
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


/**
 * 
 * Select items in children with quickPick
 * 
 */
const selectItem: SelectItem = async (templateList) => {

  // select item
  const nameList = templateList.map(i => i.name);
  const value = await vscode.window.showQuickPick([...nameList, 'end'])

  if (!value) return []
  if (value === 'end') {
    return []
  } else {

    // recursive
    const currentTemplate = templateList.find(i => i.name === value) as CustomTemplate;
    const sinppet = await getSnippet(currentTemplate);

    return [
      sinppet,
      ...await selectItem(templateList)
    ];
  }
}

export default getSnippet;