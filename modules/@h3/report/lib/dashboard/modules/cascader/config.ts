/**
 * 该文件处理显示、数据构造
 */

import enumType from '@h3/report/basics/enum/aggregate-type';
import ratio from '@h3/report/basics/enum/ratio';
import { ElementType } from '@h3/report/basics/enum/chart-type';

/**
 * 枚举映射
 * @param item
 * @param data 
 */
const enumTypeData = function (item: H3.CascaderNode, enumData: Array<any> = [], funName: string) {
  enumData.forEach((enumItem: any, index: number) => {
    const child: any = {
      displayName: enumItem.label,
      subShow: false,
      isShow: true,
      level: 2,
      method: { funName: funName },
      children: [],
      checked: index === 0 ? true : false,
      value: enumItem.value
    };
    // 同/环比分析、默认不选中
    if (funName === 'ratioAnalyze') child.checked = false;
    (item as any).children.push(child);
  });
};

/**
 * 修改项 - 赋值
 * @param item
 * @param param
 */
const assignValue = function (item: H3.CascaderNode, param: any, source: string) {
  (item as any).children.forEach((child) => {
    // 汇总方式
    if (source === 'aggregateType') {
      if (param.data.type === 'number') {
        child.value === param.data.options.aggregateType ? child.checked = true : child.checked = false;
      } else {
        child.value === param.data.options.format ? child.checked = true : child.checked = false;
      }
    }
    // 汇总结果
    else if (source === 'aggregateResult') {
      child.value === param.data.options.percent ? child.checked = true : child.checked = false;
    }
    // 同/环比分析
    else if (source === 'ratioAnalyze') {
      console.log(child.value,param.data.options.ratio);
      child.value === param.data.options.ratio ? child.checked = true : child.checked = false;
    }
  })
};

/**
 * 汇总方式处理
 * @param item
 * @param data
 */
const handleAggregateType = function (item: H3.CascaderNode, param: any) {
  if (param.chart.type === ElementType.LIST) {
    // 明细表 - 不存在汇总方式
    item.isShow = false;
  } else {
    // type - string、date、number三种类型
    if (param.data.type === 'string') {
      // 字符串字段隐藏
      item.isShow = false;
    } else if (param.data.type === 'date') {
      if (param.data.options.aggregateType && param.data.options.aggregateType === 'COUNT') {
        // 指标 - 日期字段隐藏
        item.isShow = false;
      } else {
        // 维度 - 日期字段
        enumTypeData(item, enumType.date, 'aggregateType');
      }
    } else if (param.data.type === 'number') {
      // 指标 - 数值字段
      enumTypeData(item, enumType.number, 'aggregateType');
    }
    // 修改项 - 赋值
    assignValue(item, param, 'aggregateType');
  }
};

/**
 * 汇总结果处理
 */
const handleAggregateTypeResult = function (item: H3.CascaderNode, param: any, menuList:Array<H3.CascaderNode>) {
  const dimensionLength = param.chart.data.dimension.length;
  const metricLength = param.chart.data.metric.length;
  // 指标图 - 0维1标 - 没有汇总结果显示功能
  if (param.chart.type === ElementType.CARD && dimensionLength === 0 && metricLength === 1) {
    item.isShow = false;
  }
  // 透视图、饼图、明细表 - 没有汇总结果显示功能
  if (param.chart.type === ElementType.TABLE || param.chart.type === ElementType.PIE || param.chart.type === ElementType.LIST || param.chart.type === ElementType.SCATTER) {
    item.isShow = false;
  }
  // 指标 指标和指标组 - 只有指标才存在汇总结果显示功能
  if (param.source.indexOf('metric') < 0) {
    item.isShow = false;
  }
  // 汇总方式 - 求和、计数才有汇总结果显示功能
  (menuList[1] as any).children.forEach((child: any) => {
    if (child.checked) {
      if (child.value !== 'SUM' && child.value !== 'COUNT') {
        item.isShow = false;
      }
    }
  });
  enumTypeData(item, enumType.aggregateResult, 'aggregateResult');
  // 修改项 - 赋值
  assignValue(item, param, 'aggregateResult');
};

/**
 * 同/环比分析（维度中有且只有一个日期字段时才可以使用同/环比分析，指标字段只支持总和/计数）
 * @param item
 * @param param
 */
const handleRatioAnalyze = function (item: H3.CascaderNode, param: any) {
  // 维度 - 不存在同/环比分析功能  指标和指标组
  if (param.source.indexOf('metric') < 0) {
    item.isShow = false;
  } else {
    let sum: number = 0;
    const newDimensionArr: Array<any> = [];
    // 维度
    // eslint-disable-next-line no-shadow
    param.chart.data.dimension.forEach((item) => {
      if (item.type === 'date') {
        sum += 1;
        newDimensionArr.push(item);
      }
    })
    // 分组维度
    if (param.chart.data.groupDimension) {
      // eslint-disable-next-line no-shadow
      param.chart.data.groupDimension.forEach((item) => {
        if (item.type === 'date') {
          sum += 1;
          newDimensionArr.push(item);
        }
      })
    }
    // 等于1且等于总和值/计数时，才显示同/环比分析
    if (sum === 1 && (param.data.options.aggregateType === 'SUM' || param.data.options.aggregateType === 'COUNT')) {
      const index = newDimensionArr[0].options.format;
      enumTypeData(item, ratio[index], 'ratioAnalyze');
    } else {
      item.isShow = false;
    }
    // 饼图暂时隐藏同环比分析功能
    if (param.chart.type === ElementType.PIE || param.chart.type === ElementType.SCATTER) {
      item.isShow = false;
    }
  }
  // 修改项 - 赋值
  assignValue(item, param, 'ratioAnalyze');
};

/**
 * 显示数值格式设置
 * @param params
 */
const showNumberFormat = function (item: H3.CascaderNode, param: any) {
 
  // 散点图 - 没有数值格式设置
  if (param.chart.type === ElementType.SCATTER) {
    item.isShow = false;
  }
  // 指标 或者指标组 - 只有指标才存在数值格式设置
  if (param.source.indexOf('metric') < 0) {
    item.isShow = false;
  }
  // 明细表 数值格式设置
  if (param.chart.type === ElementType.LIST && param.data.type === 'number') {
    item.isShow = true;
  }
};

/**
 * 显示数值格式设置
 * @param params
 */
const showResultFilter = function (item: H3.CascaderNode, param: any) {
  // 明细表 - 没有数值格式设置
  if (param.chart.type === ElementType.LIST || param.chart.type === ElementType.TABLE) {
    item.isShow = false;
  }
  // 散点图 - 没有数值格式设置
  // if (param.chart.type === 'scatter') {
  //   item.isShow = false;
  // }
  // 指标 或者指标组- 只有指标才存在数值格式设置
  if (param.source.indexOf('metric') < 0) {
    item.isShow = false;
  }
};

/**
 * 隐藏字段
 */
const handleHiddenField = (item: H3.CascaderNode, param: any) => {
  if (param.chart.type === ElementType.LIST) {
    // 只有明细表的字段有这个功能
    item.isShow = true;
    item.checked = param.data.options.hidden
  }
}

/**
 * 明细表日期格式设置
 * @param item 
 * @param params 
 */
const handleDateFormat = (item: H3.CascaderNode, param: any) => {
  if (param.chart.type === ElementType.LIST && param.data.type === 'date') {
    // 只有明细表的字段有这个功能
    item.isShow = true;
  }
}

/**
 * 构造menuList子集数据
 * @param data
 */
const createChildData = function (params: any) {
  const menuList: Array<H3.CascaderNode> = [
    {
      key: 'title',
      displayName: '修改显示名',
      isShow: true,
      subShow: false,
      level: 1,
      method: { funName: 'title' },
      children: [],
    },
    {
      key: 'hiddenField',
      displayName: ' 隐藏字段',
      isShow: false,
      subShow: false,
      level: 1,
      checked: false,
      method: { funName: 'hiddenField' },
      children: [],
    },
    {
      key: 'aggregateType',
      isShow: true,
      displayName: '汇总方式',
      subShow: false,
      level: 1,
      children: []
    },
    {
      key: 'aggregateResult',
      isShow: true,
      displayName: '汇总结果显示',
      subShow: false,
      level: 1,
      children: []
    },
    {
      key: 'ratioAnalyze',
      isShow: true,
      displayName: '同/环比分析',
      subShow: false,
      level: 1,
      children: []
    },
    {
      key: 'numberFormat',
      isShow: true,
      displayName: '数值格式设置',
      subShow: false,
      level: 1,
      method: { funName: 'numberFormat' },
      children: []
    },
    {
      key: 'resultFilter',
      isShow: true,
      displayName: '结果筛选器',
      subShow: false,
      level: 1,
      method: { funName: 'resultFilter' },
      children: []
    },
    {
      key: 'dateFormat',
      isShow: false,
      displayName: '日期格式设置',
      subShow: false,
      level: 1,
      method: { funName: 'dateFormat' },
      children: []
    }
  ];
  menuList.forEach((item: H3.CascaderNode) => {
    switch (item.key) {
      // 汇总方式
      case 'aggregateType':
        handleAggregateType(item, params);
        break;
      // 汇总结果显示
      case 'aggregateResult':
        handleAggregateTypeResult(item, params, menuList);
        break;
      // 同/环比分析
      case 'ratioAnalyze':
        handleRatioAnalyze(item, params);
        break;
      // 数值格式设置
      case 'numberFormat':
        showNumberFormat(item, params);
        break;
      // 数值类型结果筛选器设置
      case 'resultFilter':
        showResultFilter(item, params);
        break;
      // 明细表隐藏字段
      case 'hiddenField':
        handleHiddenField(item, params);
        break;
      // 明细表日期格式设置
      case 'dateFormat':
        handleDateFormat(item, params);
        break;
      default:
        break;
    }
  });
  return menuList;
};

export default {
  createChildData,
}
