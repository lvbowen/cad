/**
 * 该文件处理业务逻辑
 */

import cascaderTitle from '../cascader-title/index';
import NumberFormat from '../number-format/index';
import ResultFilter from '../reslut-filter/index';
import DateFormat from '../date-format/index';
import { Modal } from '@h3/antd-vue';
import { NumberType } from '@h3/report/basics/enum/filter-type'

// 数值格式值
let numberFormat!: H3.Report.FilterPicker;
// 设置结果筛选器
let resultFilterData!: H3.Report.ResultFilter;
// 日期格式设置
let dateFormat!: H3.Report.DateFormat
// metric 组的index
let metricGroupIndex!: any;

/**
 * 重命名
 * @param params params参数在cascader-menu中的showSubMenu方法中传递
 */
function rename (params: H3.CascaderParam) {
  const comp: any = new cascaderTitle().$mount();
  // 传参
  comp.renameModel = params.data.alias || params.data.name;
  comp.data = params.data;
  comp.chart = params.chart;
  comp.removeUndrag = params.removeUndrag;
  comp.resizeChartView = params.resizeChartView;
  let count: number = 0;
  // 挂载$el
  for (const i in (params.self as any).$el.children) {
    if (i === 'length') return;
    if ((params.self as any).$el.children[i].className.indexOf(comp.$el.className) > -1) {
      count += 1;
    }
    if (Number(i) === ((params.self as any).$el.children.length - 1)) {
      // 不存在comp.$el，才挂载在dom节点上
      if (count === 0) {
        (params.self as any).$parent.$parent.$el.children[params.cascaderIndex.toString()].after(comp.$el);
        params.hideCascader();
        break;
      }
    }
  }
}

/**
 * 处理汇总方式
 * @param params
 */
function aggregateTypeBusiness(params: H3.CascaderParam) {
  // 点击对应的checked等于true
  params.treeNode.checked = true;
  const value = (params.treeNode as any).value;
  // 只有维度日期、指标数值字段才存在汇总方式
  if (params.data.type === 'date') {
    // 重置汇总结果占比设置
    resetAggregateResult(params);
    // 重置数值格式设置
    resetAggregateResult(params);
    // 维度 - 日期字段赋值
    params.data.options.format = value;
  } else if (params.data.type === 'number') {
    // 判断之前是否设置同环比分析
    if (params.data.options.ratio) {
      // 重置数值格式设置
      resetAggregateResult(params);
    }
    // value不等于总和值和计数时，需要重置
    if (value !== 'SUM' && value !== 'COUNT') {
      // 重置汇总结果占比设置
      resetAggregateResult(params);
    }
    // 指标 - 数值字段赋值
    params.data.options.aggregateType = value;
  }
  // 重置同/环比分析
  resetRatioAnalyze(params);
  // 刷新数据
  params.resizeChartView({ chart: params.chart, type: 'data' });
}

/**
 * 重置汇总结果占比设置
 * @param params
 */
function resetAggregateResult(params: H3.CascaderParam) {
  // 维度不存在percent字段
  if (params.data.options.percent) {
    // 指标字段修改自身options
    (params.data.options as any).percent = 'DEFAULT';
    (params.data.options as any).numberFormat.comma = false;
    (params.data.options as any).numberFormat.percent = false;
    (params.data.options as any).numberFormat.fraction = false;
  } else {
    (params.chart.data.metric as any).forEach((item: any) => {
      item.options.percent = 'DEFAULT';
      item.options.numberFormat.comma = false;
      item.options.numberFormat.percent = false;
      item.options.numberFormat.fraction = false;
    })
  }
}

/**
 * 处理汇总结果显示
 * @param params
 */
function aggregateResultBusiness(params: H3.CascaderParam) {
  // 点击对应的checked等于true
  params.treeNode.checked = true;
  // 修改data的值
  params.data.options.percent = (params.treeNode as any).value;
  // 修改数值格式设置的值
  if ((params.treeNode as any).value === 'PERCENT') {
    (params.data.options as any).numberFormat.percent = true;
    (params.data.options as any).numberFormat.fraction = 2;
    // 重置同/环比分析
    resetRatioAnalyze(params);
  } else {
    // 判断是否有设置同环比分析
    if (!params.data.options.ratio) {
      (params.data.options as any).numberFormat.comma = false;
      (params.data.options as any).numberFormat.percent = false;
      (params.data.options as any).numberFormat.fraction = false;
    }
  }
  // 刷新数据
  params.resizeChartView({ chart: params.chart, type: 'data' });
}

/**
 * 重置同/环比分析
 * @param params
 */
function resetRatioAnalyze(params: H3.CascaderParam) {
  console.log('resetRatioAnalyze');
  // 点击维度、或者指标，数据取值不同
  if (params.source !== 'metric') {
    params.chart.data.metric.forEach((item) => {
      if (item.options.ratio) delete item.options.ratio;
    })
  } else {
    if (params.data.options.ratio) delete params.data.options.ratio;
  }
}

/**
 * 同/环比分析
 * @param params
 */
function ratioAnalyzeBusiness(params: H3.CascaderParam) {
  if (params.data.options.ratio && params.data.options.ratio === params.treeNode.value) {
    // todo 取消同环比
    // console.log('ratioAnalyzeBusiness', params);
    // console.log('选择了同一个同环比');
    // resetRatioAnalyze(params);
    // (params.data.options as any).numberFormat.percent = false;
    // (params.data.options as any).numberFormat.fraction = false;
    // params.resizeChartView({ chart: params.chart, type: 'data' });
    // return ;
  }
  
  // 同/环比分析增长率数组
  const ratioList: Array<number> = [2, 4, 6, 8];
  // 点击对应的checked等于true
  params.treeNode.checked = true;
  // 修改data的值
  params.data.options.ratio = (params.treeNode as any).value;
  // 重置汇总结果占比设置
  resetAggregateResult(params);
  // 增长率的都添加百分符和添加两位小数
  (params.data.options as any).numberFormat.percent = ratioList.includes(Number((params.treeNode as any).value));
  (params.data.options as any).numberFormat.fraction = ratioList.includes(Number((params.treeNode as any).value)) ? 2 : false;
  // 刷新数据
  params.resizeChartView({ chart: params.chart, type: 'data' });
}


/**
 * 设置数值格式
 * @param filter
 */
function setFormat(filter){
  numberFormat = filter;
}

/**
 * 显示数值格式
 */
function showNumberFormat(params: H3.CascaderParam) {
  const modalConfirm = Modal.confirm({
    class: 'h3-report-confirm__modal h3-report-number-format__modal',
    title: '数值格式设置',
    content: (h) => {
      return h(NumberFormat, {
        props: {
          value: 999999.99,
          numberFormat: (params.data.options.numberFormat as H3.Report.NumberFormat)
        },
        on: {
          'set-format': setFormat
        }
      });
    },
    okText: '确定',
    cancelText: '取消',
    width: 482,
    destroyOnClose: true,
    centered: true,
    closable: true,
    confirmLoading: true,
    iconType: 'noneIcon',
    onOk: (e) => {
      params.setNumberFormat({ numberFormat: numberFormat, metricIndex: params.cascaderIndex, groupIndex: metricGroupIndex });
      params.resizeChartView({ chart: params.chart, type: 'view' });
      modalConfirm.destroy();
    }
  } as any);
}

/**
 * 显示结果筛选器
 */
function showResultFilter(params: H3.CascaderParam) {
  const modalConfirm = Modal.confirm({
    class: 'h3-report-confirm__modal h3-report-number-format__modal', // 主要是兼容正常弹窗样式
    title: '结果筛选器',
    content: (h) => {
      return h(ResultFilter, {
        props: {
          value: (params.data.options.resultFilter as H3.Report.ResultFilter),
        },
        on: {
          input: (data: H3.Report.ResultFilter) => {
            if (resultFilterData && (data.condition || data.condition === 0)  && data.condition !== resultFilterData.condition) {
              modalConfirm.update({
                class: 'h3-report-confirm__modal h3-report-number-format__modal',
              });
            }
            resultFilterData = data;
          },
          cancel: () => {
            modalConfirm.destroy();
          }
        }
      });
    },
    okText: '确定',
    cancelText: '取消',
    width: 640,
    destroyOnClose: true,
    centered: true,
    closable: true,
    confirmLoading: true,
    iconType: '',
    onOk: (e) => {
      // 校验 校验如果不通过 提示错误样式
      return new Promise(function(reslove,reject){
        const res = verifyResultFilter(resultFilterData);
        if (res) {
          params.setResultFilter({ resultFilter: resultFilterData, metricIndex: params.cascaderIndex, groupIndex: metricGroupIndex });
          params.resizeChartView({ chart: params.chart, type: 'data' });
          reslove();
          modalConfirm.destroy();
        } else {
          // 更新错误样式
          modalConfirm.update({
            class: 'h3-report-confirm__modal h3-report-number-format__modal h3-report-model-error',
          });
          reject();
        }
        reslove();
      })
    }
  } as any);
}

/**
 * 校验结果筛选器
 * @param params 
 */
const verifyResultFilter = (data:H3.Report.ResultFilter) => {
   if (!data.display) {
     return true;
   } else {
     if (data.logic === NumberType.Range) {
       const resSet = JSON.parse(data.condition as string);
       return resSet.leftData < resSet.rightData
     } else if (data.logic === NumberType.None || data.logic === NumberType.NotNone) {
       return true;
     } else {
       if (data.condition === 0) return true;
       if (!data.condition) return false;
     }

   }
   return true;
}
/**
 * 隐藏字段
 */
const handleHiddenField = (params: H3.CascaderParam) => {
  params.treeNode.checked = !params.treeNode.checked;
  (params.data.options as any).hidden = !params.data.options.hidden;
  params.resizeChartView({ chart: params.chart, type: 'data' });
}
// dateFormat
/**
 * 隐藏字段
 */
const showDateFormat = (params: H3.CascaderParam) => {
  const modalConfirm = Modal.confirm({
    class: 'h3-report-confirm__modal h3-report-date-format__modal', // 主要是兼容正常弹窗样式
    title: '日期格式设置',
    content: (h) => {
      return h(DateFormat, {
        props: {
          value: (params.data.options.dateFormat as H3.Report.DateFormat),
        },
        on: {
          input: (date: H3.Report.DateFormat) => {
            console.log(date);
            dateFormat = date;
          }
        }
      });
    },
    okText: '确定',
    cancelText: '取消',
    width: 480,
    destroyOnClose: true,
    centered: true,
    closable: true,
    confirmLoading: true,
    iconType: 'noneIcon',
    onOk: (e) => {
      console.log(params, dateFormat);
      params.setDateFormat({ dateFormat: dateFormat, dimensionIndex: params.cascaderIndex });
      // (params.data.options as any).dateFormat = dateFormat;
      params.resizeChartView({ chart: params.chart, type: 'view' });
      modalConfirm.destroy();
    }
  } as any);
}

/**
 * 参数在cascader-menu.vue中的paramOptions()方法中调用传参
 * @param options
 * @param params
 */
export default function (options: any, params: H3.CascaderParam) {
  metricGroupIndex = params.chart.type === 'biax' ? params.source.split('-')[1] : 0;
  switch (options.funName) {
    // 修改重命名
    case 'title':
      rename(params);
      break;
    // 汇总方式
    case 'aggregateType':
      aggregateTypeBusiness(params);
      break;
    // 汇总结果显示
    case 'aggregateResult':
      aggregateResultBusiness(params);
      break;
    // 同/环比分析
    case 'ratioAnalyze':
      ratioAnalyzeBusiness(params);
      break;
    // 数值格式设置
    case 'numberFormat':
      showNumberFormat(params);
      break;
    // 数值格式设置
    case 'resultFilter':
      showResultFilter(params);
      break;
    // 隐藏字段
    case 'hiddenField':
      handleHiddenField(params);
      break;
    // 明细表日期格式设置
    case 'dateFormat':
      showDateFormat(params);
      break;
    default:
      console.log('异常错误!')
      break;
  }
  // 移除禁止拖拽class
  params.removeUndrag();
  // 隐藏cascader
  params.hideCascader();
}
