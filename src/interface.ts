
export interface CustomTemplate {
  /** 代码片段名称 */
  name: string,
  /** 代码片段主体 */
  body: string,
  /** 需要导入的组件 */
  autoImport?: AutoImport,
  /** 子元素 */
  children?: CustomTemplate[],
}

export type AutoImport = Array<{ key: string, from: string }>
