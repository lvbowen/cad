<template>
  <div class="bim-content-config">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="BIM菜单配置" class="custom-style">
        <a-button
          @click="toForm(`${projectCode}_bim_config`,'bimMenu')"
          type="primary">新增
        </a-button>
        <a-table
          :key="num"
          :columns="columns"
          :data-source="bimMenuData"
          :childrenColumnName="childrenColumnName"
          :defaultExpandAllRows="true"
          :pagination="false"
          rowKey="id"
          bordered
          :customRow="rowClickTab"
          :rowClassName="setRowClassNameTab"
        >
          <template slot="operation" slot-scope="text, record, index">
            <div class="operator">
              <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="confirm('bimMenu',record.id)">
                <a v-if="!record.children.length" class="warning-color">删除</a>
              </a-popconfirm>
              <a @click="toFormUrl(`${projectCode}_bim_config`,record.id)" class="base-color">设置</a>
            </div>
          </template>
        </a-table>
      </a-collapse-panel>
      <a-collapse-panel key="2" header="BIM弹窗配置" class="custom-style">
        <a-button
          @click="toForm(`${projectCode}_bim_card_config`,'bimModal')"
          type="primary">新增
        </a-button>
        <a-table
          :key="numC"
          :columns="bimCardColumns"
          :data-source="bimCardData"
          :childrenColumnName="childrenColumnName"
          :defaultExpandAllRows="true"
          :pagination="false"
          rowKey="id"
          bordered
          :customRow="rowClick"
          :rowClassName="setRowClassName"
        >
          <template slot="operation" slot-scope="text, record, index">
            <div class="operator">
              <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="confirm('bimCard',record.id)">
                <a v-if="!record.children.length" class="warning-color">删除</a>
              </a-popconfirm>
              <a @click="toFormUrl(`${projectCode}_bim_card_config`,record.id)" class="base-color">设置</a>
            </div>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive,Mixins} from 'vue-property-decorator';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import {bimModal} from "../type";
import * as Type from "../../../type";
import Websocket from "../websocket_base";
import onActionClick from "@cloudpivot/list/src/components/pc/scripts/onActionClick";
import {
  getFormUrl,
  getBIMModalConfig,
  getBIMMenuConfig,
  deleteBIMMenu,
  deleteBIMModal,
} from "../../../service/api";

@Component({
  name: 'BimContentConfig',
  components: {
    ATable: Table,
    AButton: Button,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    APopconfirm: Popconfirm
  }
})
export default class BimContentConfig extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode!: string;
  activeKey: string[] = ['1', '2'];
  bimMenuData: bimModal[] = [];
  childrenColumnName: string = 'children';
  columns: any[] = [
    {
      title: '模块名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '项目设置',
      dataIndex: 'projects',
      // width: '30%',
      key: 'projects',
      customRender: (text)=> {
        let str = '';
        if(text && text.length) {
          text.map((i)=> {
            str = str + i + ';'
          })
        }
        return str;
      }
      // align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 150,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  bimCardColumns:any[] = [
    {
      title: '模块名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '项目设置',
      dataIndex: 'projects',
      // width: '30%',
      key: 'projects',
      customRender: (text)=> {
        let str = '';
        if(text && text.length) {
          text.map((i)=> {
            str = str + i + ';'
          })
        }
        return str;
      },
      // align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      width: 150,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  bimCardData:bimModal[] = [];
  num: number = 0;
  numC: number = 0;
  currentRow: bimModal | null = null;
  currentRowTab: bimModal | null = null;
  socket1: any = null;
  socket2: any = null;
  initBimMenuConfig() {
    getBIMMenuConfig({appCode:this.projectCode}).then((res)=> {
      if(res.errcode!==0) {return this.$message.error(res.errmsg as string)}
      if(res.data) {
        this.bimMenuData = res.data;
        this.num++;
      }
    })
  }
  initBimModalConfig() {
    getBIMModalConfig({appCode:this.projectCode}).then((res)=> {
      if(res.errcode!==0) {return this.$message.error(res.errmsg as string)}
      if(res.data) {
        this.bimCardData = res.data;
        this.numC++;
      }
    })
  }
  confirm(flag:string,id:string) {
    //删除接口
    let Api = flag==='bimCard'?deleteBIMModal:deleteBIMMenu;
    Api({appCode:this.projectCode??'',id:id}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      //重新查表格接口
      if(flag==='bimCard'){
        this.initBimModalConfig();
      }else {
        this.initBimMenuConfig();
      }
    })
  }
  toForm(schemaCode: string,flag:string) {
    // console.log(this.currentRow)
    let parentId: string| null=null;
    if(flag==='bimMenu') {
      parentId = this.currentRowTab?this.currentRowTab.id:null
    }else if(flag==='bimModal'){
      parentId = this.currentRow?this.currentRow.id:null
    }
    let routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: schemaCode,
        sheetCode: schemaCode,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        parentId: parentId
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }
  toFormUrl(schemaCode,id) {
    getFormUrl({
      bizObjectId: id,
      schemaCode: schemaCode
    }).then((res)=> {
      // 如果报错, 会返回一个对象
      if ( typeof res === "object" && res.errcode !== 0 ) {
        return this.$message.error( res.errmsg as string, 3 );
      }
      // 否则返回一个字符串
      else if ( typeof res === "string" ) {
        let search = location.search;
        search = search
          ? `${search}&iframeAction=detail`
          : `?iframeAction=detail`;
        // const url = `${res}&return=${location.pathname + encodeURIComponent(search)}`;
        let url:string = '';
        if(this.isDingTalk) {
          const projectLength:number = window.config.project.length;
          const pathName =  location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
          url = `${ res }&return=${ pathName + encodeURIComponent( search )}`;
        }else{
          url = `${ res }&return=${ location.pathname + encodeURIComponent( search )}`;
        }
        if(this.isDingTalk) {
          this.$router.push(url)
        }else {
          const formUrl = onActionClick.getFormRealUrl( this, url );
          window.open( formUrl );
        }
      }
    })
  }
  // 点击行时
  rowClick(record, index) {
    return {
      on: {
        click: (e) => {
          if(!this.currentRow) {
            this.currentRow = record;
          }else if(record.id === this.currentRow.id) {
            this.currentRow = null;
          }else {
            this.currentRow = record;
          }
          //新增
        }
      }
    }
  };
  // 行样式
  setRowClassName(record, index) {
    // let rowColor = (index % 2 === 0) ? "evenRowStyl" : "";//判断单双行，赋予不同样式
    if (!this.currentRow) {
      return
    }
    return record.id === this.currentRow.id ? "clickRowStyl" : '';//赋予点击行样式
  }
  // 点击行时
  rowClickTab(record, index) {
    return {
      on: {
        click: (e) => {
          if(!this.currentRowTab) {
            this.currentRowTab = record;
          }else if(record.id === this.currentRowTab.id) {
            this.currentRowTab = null;
          }else {
            this.currentRowTab = record;
          }
          //新增
        }
      }
    }
  };
  // 行样式
  setRowClassNameTab(record, index) {
    // let rowColor = (index % 2 === 0) ? "evenRowStyl" : "";//判断单双行，赋予不同样式
    if (!this.currentRowTab) {
      return
    }
    return record.id === this.currentRowTab.id ? "clickRowStyl" : '';//赋予点击行样式
  }
  mounted() {
    this.socket1 = new Websocket();
    this.socket1.initWebsocket(this.projectCode??'','bimTab',this.initBimMenuConfig);
    this.socket2 = new Websocket();
    this.socket2.initWebsocket(this.projectCode??'','bimFrame',this.initBimModalConfig);
  }
  destroyed () {
    this.socket1.close();
    this.socket2.close();
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';

.bim-content-config {
  .operator {
    a {
      margin-right: @spacing-base;
    }
  }
  /deep/ .ant-table {
    .ant-table-row {
      >td:first-child {
        min-width: 150px;
        white-space: nowrap;
      }
    }
  }
}
</style>
