export function isChineseCharacter(str) {
  if (Object.prototype.toString.call(str) !== "[object String]") {
    return false;
  }
  //只允许传入一个字符
  let flag = true;
  for (const i of str) {
    if (flag) {
      flag = false;
    } else {
      return false;
    }
  }
  const testCases = [
    ["\u4E00", "\u9FEF"], //基本汉字&基本汉字补充
    ["\u3400", "\u4DB5"], //扩展A
    ["\u{20000}", "\u{2A6D6}"], //扩展B
    ["\u{2A700}", "\u{2B734}"], //扩展C
    ["\u{2B740}", "\u{2B81D}"], //扩展D
    ["\u{2B820}", "\u{2CEA1}"], //扩展E
    ["\u{2CEB0}", "\u{2EBE0}"] //扩展F
  ];
  for (const t of testCases) {
    if (t[0] <= str && t[1] >= str) {
      return true;
    }
  }
  return false;
}

export function subStr(str: string, length: number, ellipsis: boolean = false) {
  let count = 0;
  let res = "";
  for (const char of str) {
    if (length > count) {
      if (isChineseCharacter(char)) {
        count += 2;
      } else {
        count++;
      }
      res += char;
    } else {
      ellipsis && res.length < str.length && (res += "...");
      break;
    }
  }
  return res;
}

/**
 * 获取字符串长度
 * @param str
 */
export function getStrLen(str: string) {
  let count = 0;
  for (const char of str) {
    if (isChineseCharacter(char)) {
      count += 2;
    } else {
      count++;
    }
  }
  return count;
}

/**
 * 补全0
 * @param str
 * @param key  补全的字符
 * @param length  长度
 */
export function makeStr(str, key, length) {
  return (str + Array(length).join(String(key))).slice(0, length);
}
