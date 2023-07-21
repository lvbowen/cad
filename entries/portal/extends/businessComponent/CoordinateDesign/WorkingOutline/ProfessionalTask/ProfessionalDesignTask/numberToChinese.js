// format number 2 Chinese
let unit = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
let shi = '十', bai = '百', qian = '千', wan = '万', yi = '亿'

const resultOf = {
  ge: function(numStr) {
    if (numStr.length === 1 && numStr === '0') {
      return '零'
    }
    // 截取个位数
    const substr = numStr.substr(numStr.length - 1, 1)
    return substr === '0' ? 0 : showZero(this.shi(numStr)) + unit[substr]
  },
  shi: function(numStr) {
    if (numStr.length > 1) {
      // 截取十位数
      const substr = numStr.substr(numStr.length - 2, 1)
      // 根据口语习惯，当没有百位数且十位数为1时，1不发声，如：一十只发十
      // 当numStr少于3位数时，this.bai()调用 结果为''
      if (this.bai(numStr) === '' && substr === '1') return shi
      // 当前位数是否为0，如果是，则返回数字0（会在最后的结果删掉），否则判断其高一位是否为0，是的话则返回‘零’，否则返回''
      return substr === '0' ? 0 : showZero(this.bai(numStr)) + unit[substr] + shi
    }
    return ''
  },
  bai: function(numStr) {
    if (numStr.length > 2) {
      // 截取百位数
      const substr = numStr.substr(numStr.length - 3, 1)
      return substr === '0' ? 0 : showZero(this.qian(numStr)) + unit[substr] + bai
    }
    return ''
  },
  qian: function(numStr) {
    if (numStr.length > 3) {
      // 截取千位数
      const substr = numStr.substr(numStr.length - 4, 1)
      return substr === '0' ? 0 : unit[substr] + qian
    }
    return ''
  },
  // 获取前面的个十百千位，与万组成万位数值
  wan: function(numStr) {
    // 截取万位的数
    // 如：111,222,33 则截取1112作为万位的数值，即1112万
    if (numStr.length > 4) {
      const substr = numStr.substr(0, numStr.length - 4) // -4: 扣去个、十、百、千，得到万位数，故减4
      if (numStr > 8 && QBSG(substr) === 0) {
        return QBSG(numStr.substr(numStr.length - 1, 4)) === 0 ? '零' : ''
      } else {
        return QBSG(substr) + wan
      }
    }
    return ''
  },
  yi: function(numStr) {
    if (numStr.length >= 9) {
      const substr = numStr.substr(0, numStr.length - 8)
      return this.wan(substr) + QBSG(substr) + yi
    }
    return ''
  }
}

// 当前面的那一位为0时，则那一位的汉字显示'零'
function showZero(isZero) {
  return isZero === 0 ? '零' : ''
}

function QBSG(numStr) {
  return resultOf.qian(numStr) + resultOf.bai(numStr) + resultOf.shi(numStr) + resultOf.ge(numStr)
}

function numberToChinese(num) {
  if (num.toString().length > 16) return console.error('数字超出范围！')
  if (!Number.isInteger(+num)) return console.error('请输入整数！')
  let prefix = ''
  if (num < 0) {
    prefix = '负'
  }
  num = Math.abs(num).toString()
  const result = prefix + resultOf.yi(num) + resultOf.wan(num) + resultOf.qian(num) + resultOf.bai(num) + resultOf.shi(num) + resultOf.ge(num)
  // 返回结果包含数字 0，要去除 0
  return result.replace(/0/g, '')
}

exports.numberToChinese = numberToChinese
