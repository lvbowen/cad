
import { utils } from '@cloudpivot/common';

export default {
  parseUrlParam: utils.parseUrlParam,
  parseQueryString: function (url: string) {
    const obj = {};
    const params = url.slice(1);
    const arr = (params.split('&'));
    arr.forEach((v, i) => {/*  */
      const str = v.split('=')[1];
      if (str.indexOf('%') === -1) {
        obj[v.split("=")[0]] = v.split("=")[1];
      } else {
        obj[v.split("=")[0]] = JSON.parse(decodeURIComponent(v.split("=")[1]));
      }
    })
    console.log(obj)
    return obj;
  },
  //轮播分页处理
  fakePagination(data: any[] = [], pageSize: number = 3) {
    if (!data.length) return
    let minArr = []; //小数组
    const maxArr = []; //大数组
    data.forEach((c) => {
      // 小数组有pageSize条数据，生成一个新数组
      if (minArr.length === pageSize) {
        minArr = [];
      }
      // 小数组满pageSize条数据，放进大数组内
      if (minArr.length === 0) {
        // @ts-ignore
        maxArr.push(minArr);
      }
      // @ts-ignore
      minArr.push(c);
    });
    return maxArr;
  },
  /*RGB颜色转换为16进制*/
  colorHex(rgbStr) {
    //十六进制颜色值的正则表达式
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(rgbStr)) {
      const aColor = rgbStr.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      let strHex = "#";
      for (let i = 0; i < aColor.length; i++) {
        let hex = Number(aColor[i]).toString(16);
        if (hex === "0") {
          hex += hex;
        }
        strHex += hex;
      }
      if (strHex.length !== 7) {
        strHex = rgbStr;
      }
      return strHex;
    } else if (reg.test(rgbStr)) {
      const aNum = rgbStr.replace(/#/, "").split("");
      if (aNum.length === 6) {
        return rgbStr;
      } else if (aNum.length === 3) {
        let numHex = "#";
        for (let i = 0; i < aNum.length; i += 1) {
          numHex += (aNum[i] + aNum[i]);
        }
        return numHex;
      }
    } else {
      return rgbStr;
    }
  }
}
