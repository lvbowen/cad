import { Component, InjectReactive, Vue } from 'vue-property-decorator';
import Class from './ConstructionPlan.module.less';
import * as Type from '../../type';
import * as Constant from '../../constant'

import { Icon } from '@ctesi/component';

import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import {
  changeWBSPlan,
  deleteSchedulePlan,
  schedulePlanListQuery,
  schedulePlanSwitch
} from "../../service/api";

@Component( {
  name: 'ConstructionList'
} )
export default class ConstructionList extends Vue {

  @InjectReactive( 'project' ) projectCode?: string;

  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;

  private selectedRowKeys: Array<string> = [];
  private switchLoading: boolean = false;
  private enableLoading: boolean = false;

  render() {

    const {
      selectedRowKeys,
      columns,
      mainTableConfig,
      onSelectChange,
      switchSchedulePlan,
      go2NewPlan,
      paginationChange,
      switchPlan
    } = this;

    return (
      <article class={ Class.mainList }>
        <nav class={ Class.listNav }>
          <Icon src={ 'goBack' } clickEvent={ e => this.$router.go( -1 ) }/>
          <span>施工总计划进度</span>
          <Button loading={ this.switchLoading } onClick={ e => switchPlan() }>计划变更</Button>
          {/*<Button>计划拆解</Button>*/ }
          <Button loading={ this.enableLoading } onClick={ e => switchSchedulePlan() }>启用</Button>
          {/*<Button >变更</Button>*/ }
          <Button onClick={ e => go2NewPlan() }>新增</Button>
        </nav>
        <main class={ Class.listContainer }>
          <Table
            rowKey={ 'id' }
            rowSelection={ {
              hideDefaultSelections: true,
              type: 'radio',
              selectedRowKeys: selectedRowKeys,
              onChange: onSelectChange
            } }
            columns={ columns }
            dataSource={ mainTableConfig.dataSources }
            pagination={ {
              position: 'bottom',
              total: mainTableConfig.total,
              onChange: paginationChange
            } }
          />
        </main>
      </article>
    );
  }

  private mainTableConfig: Partial<Type.SchedulePlanListResult> = {
    dataSources: [],
    pageSize: 10,
    current: 1,
    total: 0
  }

  private columns: Array<any> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
    },
    {
      title: '计划方案名称',
      dataIndex: 'planSchemeName',
    },
    {
      title: '计划开始时间',
      dataIndex: 'schemePlanStart'
    },
    {
      title: '计划完成时间',
      dataIndex: 'schemePlanEnd'
    },
    {
      title: '编制人',
      dataIndex: 'name'
    },
    {
      title: '总工期',
      dataIndex: 'schemePeriod'
    },
    {
      title: '流程状态',
      dataIndex: 'businessState'
    },
    {
      title: '计划状态',
      dataIndex: 'schemeState'
    },
    {
      title: '操作',
      align: 'center',
      customRender: this.renderOptionColumn
    }
  ];

  mounted() {
    this.getTableData();
  }

  private renderOptionColumn( text, record, index ): JSX.Element {
    const { go2PlanDetail, deletePlanDetail } = this;
    return (
      <span class={ Class.listOptC }>
        <span onClick={ e => go2PlanDetail( record.id ) }>查看</span>
        <span onClick={ e => deletePlanDetail( record.id ) }>删除</span>
      </span>
    )
  }

  private onSelectChange( keys: Array<string> ) {
    console.log( 'keys===>', keys );
    this.selectedRowKeys = keys;
  }

  private go2PlanDetail( id: string ) {
    if ( !id ) return;
    this.$router.push( {
      name: 'constructionPlan',
      query: {
        id: id
      }
    } );
  }

  private go2NewPlan() {
    this.$router.push( {
      name: 'constructionPlan',
    } );
  }

  private deletePlanDetail( id: string ) {
    if ( !id ) return;
    deleteSchedulePlan( {
      projectCode: this.projectCode as string,
      schedulePlanId: id
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.getTableData();
    } );
  }

  private getTableData() {
    const { pageSize, current } = this.mainTableConfig, { projectCode, projectConfig } = this;
    if ( !projectConfig || projectConfig.projectLevel !== Constant.ProjectLevel['项目'] ) return;
    schedulePlanListQuery( {
      pageNum: current as number,
      pageSize: pageSize as number,
      projectCode: projectCode as string,
      // projectName:window.Environment.markName
      projectName: projectConfig.projectName as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      console.log(res.data?.records);
      res.data?.records.forEach(e => {
        e.schemePlanStart = String(e.schemePlanStart)?.split(" ")[0]
        e.schemePlanEnd = String(e.schemePlanEnd)?.split(" ")[0]
      });
      this.mainTableConfig.dataSources = res.data?.records ?? [];
      this.mainTableConfig.total = res.data?.total ?? 0;
    } )
  }

  private switchSchedulePlan() {
    if ( this.enableLoading ) return;
    this.enableLoading = true;
    const { getTableData, projectCode, selectedRowKeys } = this;
    if ( !selectedRowKeys.length ) {
      this.enableLoading = false;
      this.$message.warn( '未选中任何项目' );
      return;
    }
    schedulePlanSwitch( {
      projectCode: projectCode as string,
      schedulePlanId: selectedRowKeys[0]
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.enableLoading = false;
      getTableData();
    } )
  }

  private switchPlan() {
    if ( this.switchLoading ) return;
    this.switchLoading = true;
    const {
      getTableData,
      mainTableConfig,
      projectCode,
      selectedRowKeys
    } = this, { dataSources } = mainTableConfig;
    if ( !selectedRowKeys.length ) return this.$message.warn( '未选中任何项目' );
    const currentId = this.selectedRowKeys?.[0] ?? null;
    console.log( currentId );
    const target = dataSources?.find( item => item.id === currentId );
    console.log( target, target?.businessState );
    if ( target ) {
      console.log( target, target.businessState );
      if ( target.businessState == Type.SchedulePlanBizState.Audit || target.businessState == Type.SchedulePlanBizState.Audited ) {
        changeWBSPlan( {
          projectCode: projectCode as string,
          schedulePlanId: currentId
        } ).then( res => {
          this.switchLoading = false;
          if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
          this.selectedRowKeys = [];
          getTableData();
        } )
      } else {
        this.switchLoading = false;
        this.$message.warn( '未审核项目不能变更计划!' );
      }
    } else {
      this.switchLoading = false;
      this.$message.warn( '未选中任何项目' );
    }
  }

  private paginationChange( page: number, pageSize: number ) {
    this.mainTableConfig.current = page;
    this.$nextTick().then( () => this.getTableData() );
  }
}
