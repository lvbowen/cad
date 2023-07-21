import { ZhCNEx } from "./zh-CN-ex";
import { EnUSEx } from "./en-US-ex";
import * as zhCN from '../../src/locale/zh-CN';
import * as enUS from '../../src/locale/en-US';
import merge from 'lodash/merge';

let locale: string = '';
let lang: unknown = null;
const getLang: () => unknown = () => {
  if (!!locale && locale === window.localStorage.getItem('locale')) return lang;
  locale = window.localStorage.getItem('locale') || 'zh';
  switch (locale) {
    case 'en':
      lang = merge(EnUSEx, enUS.default);
      break;
    default:
      lang = merge(ZhCNEx, zhCN.default);
      break;
  }
  return lang;
  /*return (lang = require(`../../src/locale/${locale==='zh'?'zh-CN':'en-US'}.ts`).default);*/
}

const getT: (keys: string) => unknown = (keys) => {
  const lang2: unknown = getLang();
  return keys.split('.').reduce((sum: object, key) => {
    return sum[key]
  }, lang2)

}

export default getT;
export {
  getLang
}
