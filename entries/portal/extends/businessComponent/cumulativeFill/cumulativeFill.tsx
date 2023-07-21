/// <reference path="../../../src/typings/shims-tsx.d.ts" />
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Class from './cumulativeFill.module.less';

import * as tsx from 'vue-tsx-support';

import { Input } from '@h3/antd-vue';
import { WBSreport } from "../../type";


@Component( {
  name: 'cumulativeFill',
  components: {
    AInput: Input
  }
} )
export default class CumulativeFill extends Vue {

  _tsx!: tsx.DeclareProps<Pick<CumulativeFill, 'selectedRow'>>

  @Prop() selectedRow?: WBSreport | null;

  private rowData: any | null = null;

  @Watch( 'selectedRow' )
  selectedRowListener( value: WBSreport ) {
    const rowData = { ...value };
    console.log( rowData );
    this.rowData = rowData;
  }


  render() {
    const { rowData } = this;
    return (
      <article class={ Class.main }>
        <nav class={ Class.nav }>累计填报视图</nav>
        <main>
          <div class={ Class.fillBlock }>
            <aside>
              <span>编码</span>
              <a-input maxLength={ 25 } value={ rowData?.reportBS } readOnly={ true }/>
            </aside>
            <aside>
              <span>单价</span>
              <a-input maxLength={ 25 } value={ rowData?.metricBS } readOnly={ true }/>
            </aside>
            <aside>
              <span>设计数量</span>
              <a-input maxLength={ 25 } value={ rowData?.planAmountBS } readOnly={ true }/>
            </aside>
            <aside>
              <span>完成数量</span>
              <a-input maxLength={ 25 } value={ rowData?.reportAmountBS } readOnly={ true }/>
            </aside>
            <aside>
              <span>剩余数量</span>
              {/*<a-input maxLength={25} value={rowData&&rowData.planamountwbs - rowData.reportamountwbs} readOnly={true} />*/ }
              <a-input maxLength={ 25 } value={ rowData && rowData.surplusAmount }
                       readOnly={ true }/>
            </aside>
            <aside>
              <span>完成数量百分比</span>
              <a-input maxLength={ 25 }
                       value={ `${ rowData && Number( (rowData.reportAmountBS / rowData.planAmountBS).toFixed( 4 ) ) * 100 || 0 }%` }
                       readOnly={ true }/>
            </aside>
          </div>
          <div class={ Class.fillBlock }>
            <aside>
              <span>名称</span>
              <a-input maxLength={ 25 } value={ rowData?.workName } readOnly={ true }/>
            </aside>
            <aside>
              <span>单价</span>
              <a-input maxLength={ 25 } value={ rowData?.metricBS } readOnly={ true }/>
            </aside>
            <aside>
              <span>计划产值</span>
              <a-input maxLength={ 25 } value={ rowData?.planMoneyBS } readOnly={ true }/>
            </aside>
            <aside>
              <span>完成产值</span>
              <a-input maxLength={ 25 } value={ rowData?.reportMoneyBS } readOnly={ true }/>
            </aside>
            <aside>
              <span>剩余产值</span>
              {/* // <a-input maxLength={25} value={rowData&&rowData.planmoneywbs-rowData.reportmoneywbs} readOnly={true} />*/ }
              <a-input maxLength={ 25 } value={ rowData && rowData.surplusMoney }
                       readOnly={ true }/>
            </aside>
            <aside>
              <span>完成产值百分比</span>
              <a-input maxLength={ 25 }
                       value={ `${ rowData && Number( (rowData.reportMoneyBS / rowData.planMoneyBS).toFixed( 4 ) ) * 100 || 0 }%` }
                       readOnly={ true }/>
            </aside>
          </div>
        </main>
      </article>
    );
  }
}
