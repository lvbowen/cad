export const getRealLength = (str: any) => {
  if (!str) {
    return 0;
  }
  let realLength: number = 0;
  const len: number = str.length;
  let charCode: number = -1;
  for (let i: number = 0; i < len; i += 1) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    } else {
      realLength += 2;
    }
  }
  return realLength;
};

export const bizModelNameValidator = (
  rules: any,
  value: any,
  callback: any,
  length: number
) => {
  const reg = /^ /;
  const reg2 = /^_/;
  const reg3 = /[^\u4e00-\u9fa5a-zA-Z\d-_]+/; // 模型名称 只能匹配 汉字英文字符数字和‘-’、‘_’字符 字符之间不能输入空格!
  const len = getRealLength(value);
  if (
    reg.test(value) ||
    len > (length | 50) ||
    reg2.test(value) ||
    reg3.test(value)
  ) {
    callback('');
  }
  callback();
};
export const pattern = (type: string) => {
  switch (type) {
    case 'code':
      /* 以字母开头不超过28个字符，仅支持字母、数字、下划线 */
      return /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/;
    case 'tablecode':
      /* 以字母开头不超过40个字符，仅支持字母、数字、下划线 */
      return /^[a-zA-Z][a-zA-Z0-9_]{0,40}$/;
    case 'modelcode':
      /* 以字母开头不超过28个字符，仅支持字母、数字、下划线 */
      return /^[a-zA-Z][a-zA-Z0-9_]{0,27}$/; //导入创建模型的时候，自动生成的模型编码可以达到28位
    case 'name':
      /* 仅限50个字符以内，并不能以空格开头 */
      return /^\S(.{0,49})?$/;
    default:
      break;
  }
};
