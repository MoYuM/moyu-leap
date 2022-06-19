import { TempleteType, VariableType } from './interface';

/** 
 * 字体颜色
 */
export const COLOR = '#612500';

/**
 *  背景颜色
 */
export const BACKGROUNDCOLOR = '#ffd591';

/** 
 * search mode 中可能出现的key值
 */
export const KEYS = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
  'z', 'x', 'c', 'v', 'b', 'n', 'm',
];

/** 
 * 退出 search mode 快捷键
 */
export const EXITSEARCHMODE = '`';

/** 
 * 选择多少个 key 作为 entry
 */
export const PICKENTRYSCOUNT = 7;

/**
 * 选择光标上下多少行解析
 */
export const PARSE_LINE_COUNT = 40;

/**
 * 上下快速移动光标时，移动的行数
 */
export const MOVE_LINES = 5;


/**
 * 模板
 */
export const TEMPLETE: TempleteType = [
  {
    name: 'log',
    command: 'log',
    newLine: true,
    body: "console.log('${TEXT}',${TEXT})",
  },
  {
    name: 'useState',
    command: 'useState',
    newLine: false,
    body: "const [${TEXT}, set${FIRST_UP_CASE}] = React.useState();"
  }
]

/**
 * 模板变量
 */
export const VARIABLE: VariableType = [
  {
    name: 'TEXT',
    transformer: text => text,
  },
  {
    name: 'FIRST_UP_CASE',
    transformer: text => text.split('').map((i, index) => {
      if (index === 0) {
        return i.toUpperCase();
      } else {
        return i
      }
    }).join('')
  }
]