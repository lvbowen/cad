<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { CreateElement } from 'vue';
import { Mutation, Action, State, namespace } from 'vuex-class';
import options from '@h3/report/dist/options';
import { LocaleProvider } from '@h3/antd-vue';
import zh_CN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import { addWheelListener } from '@h3/report/basics/utils/global';
import { closest } from '@h3/report/basics/utils/dom';
import FilterTypes, {  DateType, NumberType,StringType } from '@h3/report/basics/enum/filter-type';
import Filter from './element'
  @Component({
    name: 'h3-report-filter-element',
    components: {
      ...Filter
    }
  })
export default class SetFilter extends Vue {
    prefixCls = 'h3-report-filter-element';
    @Prop({ default: {} }) filter!: H3.Report.FilterFieldColumn;
    @Prop({ default: '' }) format!: string; // 筛选方式
    @Prop({ default: null }) chartSize?: {h: number, w: number} | null; // grid宽高
    @Prop({ default: '' }) status?: 'design' | 'report' | 'preview'; // 图表状态

    // 日期组件是否常显示 h>13
    isTiling:boolean = false;
    // 排列组件是否换行
    isNewFeed:boolean = false;
    // 是否展示单日历
    isSingleDate: boolean = false;
    // 拷贝
    tmpFilter = JSON.parse(JSON.stringify(this.filter));

    // 监听筛选器宽高
    @Watch('chartSize', { deep: true })
    changeChartSize(chartSize: {h?: number, w?: number}) {
      if (chartSize && chartSize.h && chartSize.w) {
        this.isTiling = !!(this.status && chartSize.h >= 11);
        this.isSingleDate = !!(this.isTiling && chartSize.w <= 12);
        this.isNewFeed = !!(this.status && chartSize.h >= 7);
      }
    }
    
    /**
     *  值改变
     * @param value
     */
    valueChange(value:any) {
      if (value === '' || value === null) {
        this.filter.text.splice(0,this.filter.text.length);
      } else if (value instanceof Array) {
        this.filter.text.splice(0,this.filter.text.length,...value);
      } else {
        this.filter.text.splice(0,this.filter.text.length,value);
      }
      this.$emit('change-value', this.filter.text);
    }

    
    /**
     * 生成组件
     */
    generatingComponent() {
      if (([StringType.None, StringType.NotNone]as Array<string>).includes(this.filter.formula)) {
        return null;
      }
      switch (this.filter.field.type) {
        case 'date':
          if (this.filter.formula === DateType.Range) {
            if(this.isSingleDate) {
              return 'SingleRangeDate'
            } else {
              return 'RangeDate'; // 范围日历
            }
          } else {
            return 'SingleDate'; // 单日历
          }
        case 'number':
          if (this.filter.formula ===  NumberType.Range) {
            return 'RangeInput'; // 范围输入框
          } else {
            return 'FilterInput'; // 单行文本输入框
          }
        case 'string':
          if (!([StringType.In, StringType.NotIn] as Array<string>).includes(this.filter.formula)) {
            return 'FilterInput'; // 单行文本输入框
          } else {
            return 'MultiInput'; // 多项文本输入框
          }
      }
    }
    
    render(h: CreateElement) {
      const ValueComponent = () => {
        let component;
        let tmpComponent;
        let componentProps: H3.Report.FilterFieldExtend = {
          field: this.filter.field,
          formula: this.filter.formula,
          value: this.filter.text as any instanceof Array && (this.filter.text[0] || this.filter.text[1]) ? this.filter.text : [],
        };
        component = this.generatingComponent();
        if(component) {
          if (typeof options.integrateComponents === 'function' && options.integrateComponents(this.filter.field, this.filter.formula)) {
            component =  options.integrateComponents(this.filter.field);
          } else {
            let extendProps: any = {
              comPrefixCls:  this.prefixCls
            };
            if(this.filter.field.type === 'date') {
              extendProps.format = this.format;
              extendProps.tiling = this.isTiling;
            }
            Object.assign(componentProps,extendProps);
          }
        }
        // 生成通用组件
         tmpComponent = h(component, {
          props: componentProps,
          on: {
            input: (value: any) => {
              this.valueChange(value);
            }
          }
        });
        // 日期组件公共处理
        if(this.filter.field.type === 'date') {
          tmpComponent = h(LocaleProvider, {
            props: {
              locale: zh_CN
            }
          }, [
              tmpComponent,
          ]);
        }
        if(tmpComponent) {
          return h('div', {
            class: {
              'h3-report-filter-element': true,
              'tiling-date-component': this.isTiling,
              'new-line': this.isNewFeed,
            },
          }, [
            tmpComponent
          ]);
        } else {
          return null
        }
      };
      return ValueComponent();
    }
    mounted() {
      addWheelListener(document.body, (e: Event) =>  {
        if(closest(e.target as HTMLDivElement, '.ant-calendar-time-picker-select')) {
          e.stopPropagation();
        }
      }, true);
    }
    created() {
    }
  }
</script>

