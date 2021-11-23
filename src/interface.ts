
export interface CustomTemplate {
  /** 代码片段名称 */
  name: string,
  /** 代码片段主体 */
  body: string,
  /** 需要导入的组件 */
  import?: string,
  /** 从何处导入 */
  from?: string,
  /** 子元素 */
  children?: CustomTemplate[]
}
