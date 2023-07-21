<template>
  <div class="mainContainer">
    <div class="app_title">
      <div>
        <img @click="toprev" src="../../Img/fanhui1.png" alt=""/>
        <span>质检编码树</span>
      </div>
      <img
        v-if="mainTable.columns.length==1"
        src="../../../src/assets/extends/myIndexPwd.png"
        alt=""
        class="qbsEdit"
        @click="enableChecked"/>
      <img
        v-else
        src="../../../src/assets/extends/quality/top_tz.png"
        alt=""
        class="qbsEdit"
        @click="go2table()"/>
    </div>
    <article ref="TreeContainer">
      <nav ref="TreeNav" class="mainTableOptionNav">
        <a-input-search
          class="search_input"
          v-model="mainTable.conditions"
          placeholder="请输入关键字"
          allowClear
          size="small"
          @search="searchMainTable(mainTable.status)">
        </a-input-search>
        <a-dropdown :trigger="['click']">
          <img src="../../Img/icon_sx@2x.png" alt="" @click="e => e.preventDefault()">
          <a-menu slot="overlay">
            <a-menu-item @click="searchMainTable(k)" v-for="(k,v) in mainTable.statusAll" :key="v">
              <span :key="k" v-if="k===null" :class="mainTable.status===null?'active':''">{{ v }}</span>
              <span :key="k" v-else-if="k===1" :class="mainTable.status===1?'active':''">{{ v }}</span>
              <span :key="k" v-else-if="k===2" :class="mainTable.status===2?'active':''">{{ v }}</span>
              <span :key="k" v-else-if="k===0" :class="mainTable.status===0?'active':''">{{ v }}</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </nav>
      <main class="qbsTree">
        <vxe-virtual-tree
          ref="MainTable"
          size="mini"
          :border="true"
          rowId="id"
          :resizable="true"
          :showOverflow="true"
          :rowKey="true"
          :highlightCurrentRow="true"
          :loading="mainTable.loading"
          :data="mainTable.dataSource"
          :height="maxHeight"
          :columns="mainTable.columns"
          :treeConfig="{
            lazy: true,
            children: mainTable.treeField,
            hasChild: mainTable.hasChild,
            loadMethod: this.tableLazyLoad,
            indent:12
          } "
          :key="num"
          :checkboxConfig="{
            checkField: 'checked',
            halfField: 'indeterminate',
            showHeader: false,
            checkStrictly: true,
            checkMethod: this.getCheckFn,
          } "
          @checkbox-change="checkBoxChange"
          @cell-dblclick="go2table($event)"
          @current-change="tableSelected"
          @cell-click="openOrClose($event)"
        >
          <!-- 插槽用法 -->
          <template v-slot:qbsName="{ row, column }">
            <span v-if="row.qbsName.length<=17">{{ row.qbsName }}</span>
            <span v-else>{{ row.qbsName.substring(0, 17) + '...' }}</span>
            <span
              v-if="row.status===2"
              class="done">{{ '(' + Number(row.doingNum + row.doneNum) + '/' + row.totalNum + ')' }}</span>
            <span
              v-else-if="row.status===1"
              class="doing">{{ '(' + Number(row.doingNum + row.doneNum) + '/' + row.totalNum + ')' }}</span>
            <span v-else class="undo">{{ '(' + Number(row.doingNum + row.doneNum) + '/' + row.totalNum + ')' }}</span>
            <img v-if="row.progressState===1" src="../../../src/assets/extends/quality/已完成.png" class="state_pic"/>
            <img v-else-if="row.progressState===0" src="../../../src/assets/extends/quality/未开始.png" class="state_pic"/>
            <img v-else src="../../../src/assets/extends/quality/进行中.png" class="state_pic"/>
          </template>
        </vxe-virtual-tree>
      </main>
      <div class="annotation">
        <span style="color: #999999">注：1、部位名称(已验收/总验收)施工进度状态</span>
        <br>
        <span style="margin-left: 24px;color: #ff6367">红色</span>
        <span style="color: #999999">:未填报,</span>
        <span style="color: #efb70d">黄色</span>
        <span style="color: #999999">:进行中,</span>
        <span style="color: #00c567">绿色</span>
        <span style="color: #999999">:已完成</span>
        <div style="margin-left: 24px;color: #999999">2、双击编码树进入质检资料库</div>
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Ref, Vue} from "vue-property-decorator";
import apptitle from "../components/appTitle.vue";
import contentbox from "../components/contentBoxs.vue";
import * as Type from "../../type";
import {Table as VXETable} from "vxe-table";
import * as Api from "../../service/api";
// import {ZhCNEx} from "../../../../portal/extends/locales/zh-CN-ex";
import Utils from "../../utils";
import {isEmpty} from "lodash";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Dropdown from 'ant-design-vue/lib/dropdown';
import 'ant-design-vue/lib/dropdown/style/index.css';
import Menu from 'ant-design-vue/lib/menu';
import 'ant-design-vue/lib/menu/style/index.css';
import {RowInfo} from "vxe-table/types/component";
import {QualityTable} from "../../type";

interface MainTableType<T> {
  loading: boolean;
  checkAble: boolean;
  status: number | null;
  currentRow?: T | null;
  treeField: string;
  hasChild: string;
  dataSource: Array<Type.QualityTable>;
  treeData: Array<any>;
  conditions: string | null;
  columns: Array<any>;
  statusAll: any;
}

@Component({
  name: "qualityFill",
  components: {
    apptitle,
    contentbox,
    AInputSearch: Input.Search,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if ((vm as qualityFill).treeStatus.routeName === from.name) {
        for (const treeStatusKey in (vm as qualityFill).treeStatus) {
          // @ts-ignore
          (vm as qualityFill).treeStatus[treeStatusKey] = JSON.parse(window.sessionStorage.getItem('treeStatus'))[treeStatusKey]
        }
        (vm as qualityFill).treeStatus.off = true;
        (vm as qualityFill).mainTable.conditions = (vm as qualityFill).treeStatus.name;
        (vm as qualityFill).mainTable.status = (vm as qualityFill).treeStatus.status;
        console.log((vm as qualityFill).treeStatus)
      } else {
        (vm as qualityFill).treeStatus.off = false;
      }
    })
  }
})
export default class qualityFill extends Vue {

  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  // @InjectReactive('locale') locale?: typeof ZhCNEx;

  @InjectReactive('locale') locale?:any;

  @Ref() TreeContainer?: HTMLElement;

  @Ref() MainTable?: VXETable;

  @Ref() TreeNav?: HTMLElement;


  private maxHeight: number = 0;

  private mainTable: MainTableType<Type.QualityTable> = {
    loading: false,
    checkAble: false,
    currentRow: null,
    conditions: null,
    status: null,
    treeField: 'childs',
    hasChild: 'hasChild',
    dataSource: [],
    treeData: [],
    columns: [
      {
        title: "名称",
        field: 'qbsName',
        treeNode: true, // 树节点声明--重点
        slots: {default: "qbsName"} // 插槽声明
      },],
    statusAll: {
      // '无状态': -1,
      '全部': null,
      '未填报': 0,
      '审核中': 1,
      '已归档': 2,
    }
  }

  private checkedRow: Array<Type.QualityTable> = [];

  treeStatus:{routeName:string,off:boolean,appCode:string,projectName:string,name:string,flag:boolean,status:number|null,expandIds:string[],selectedIds:string[]} = {
    routeName: 'QualityDataBase',
    off: false,//是否一致
    appCode: '',
    projectName: '',
    name: '',
    flag: true,
    status: null,
    expandIds: [],
    selectedIds: []
  }
  num: number = 1;

  mounted() {
    const {calcContentHeight} = this;
    if (!this.treeStatus.off) {
      this.getQBSTree()?.then(() => this.setAllTreeExpanded());
    } else {
      this.getQBSTreeStatus();
    }
    window.addEventListener('resize', calcContentHeight);
  }

  destroyed() {
    const {calcContentHeight} = this;
    window.removeEventListener('resize', calcContentHeight);
  }

  toprev() {
    this.$router.push({name: 'business'})
  }

  private calcContentHeight() {
    const {TreeContainer, TreeNav} = this;
    if (!TreeContainer || !TreeNav) return;
    const
      containerH = TreeContainer.getClientRects()[0].height - 44,
      navH = TreeNav.getClientRects()[0].height + 10;
    this.maxHeight = containerH - navH;
  }

  private getQBSTree(nodeId?: string) {
    const {mainTable, projectCode, projectConfig, treeStructureAdapter} = this;
    if (mainTable.loading) return;
    this.mainTable.loading = true;
    return Api.getQBSTree({
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
      name: mainTable.conditions as string,
      flag: true,
      status: mainTable.status as number,
      qbsId: nodeId
    }).then(res => {
      this.mainTable.loading = false;
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.checkedRow = [];
        this.mainTable.dataSource = treeStructureAdapter(res.data) as Array<Type.QualityTable>;
      }
    })
  }
  private getQBSTreeStatus() {
    const {mainTable, projectCode, projectConfig, treeStructureAdapter} = this;
    if (mainTable.loading) return;
    this.mainTable.loading = true;
    return Api.getQBSTree({
      appCode: projectCode as string,
      projectName: projectConfig?.projectName as string,
      name: this.treeStatus.name as string,
      flag: true,
      status: this.treeStatus.status as number,
      selectIds: this.treeStatus.expandIds??[]
    }).then(res => {
      this.mainTable.loading = false;
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.checkedRow = [];
        this.mainTable.dataSource = treeStructureAdapter(res.data) as Array<Type.QualityTable>;
      }
    }).then(()=> {
      this.MainTable?.setAllTreeExpand(true);
      this.$nextTick(()=> {
        Utils.deepFind( this.mainTable.dataSource, item => {
          item._X_EXPAND = this.treeStatus.expandIds.includes(item.id);
          return false;
        }, mainTable.treeField );
      })
      const selectedRows = this.treeExpand(this.mainTable.dataSource,'childs','id',this.treeStatus.selectedIds)
      if(selectedRows.length) {
        selectedRows.map((i)=> {
          this.MainTable?.setCurrentRow(i)
        })
      }
    })
  }

  treeExpand(arr, attChildren = 'children', key:string, value:string[]) {
    let finalArr = [];
    arr.map((item) => {
      if (value.includes(item[key])) {
        // @ts-ignore
        finalArr.push(item);
      }
      if (item[attChildren]) {
        const p = this.treeExpand(item[attChildren], attChildren, key, value);
        finalArr = finalArr.concat(p)
      }
    });
    return finalArr;
  }
  private tableLazyLoad({row}: { row: Type.QualityTable }) {
    const {id} = row, {
      treeStructureAdapter,
      mainTable,
      projectCode,
      projectConfig
    } = this;
    if (!id) return;
    return new Promise(resolve => {
      Api.getQBSTree({
        appCode: projectCode as string,
        projectName: projectConfig?.projectName as string,
        name: mainTable.conditions as string,
        flag: true,
        status: mainTable.status as number,
        qbsId: id
      }).then(res => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        if (res.data) resolve(treeStructureAdapter(res.data))
      })
    });
  }

  private treeStructureAdapter(tree: Array<Type.QualityTable>, autoSet?: boolean): void | Array<Type.QualityTable> {
    const {treeField} = this.mainTable;
    if (Array.isArray(tree)) {
      tree.forEach(item => this.adapterImpl<Type.QualityTable>([item], treeField))
    } else {
      [tree].forEach(item => this.adapterImpl<Type.QualityTable>([item], treeField));
    }
    if (autoSet) {
      this.mainTable.dataSource = tree;
    } else {
      return tree;
    }
  }

  private adapterImpl<T>(dataSource: Array<T>, childrenKey: string): void {
    Utils.deepFind(dataSource, item => {
      item.checked = false;
      item.hasChild = !item.leaf;
      item.childs = item.leaf ? undefined : item.childs;
      item.isLeaf = !!item.leaf;
      return false;
    }, childrenKey);
  }

  private setAllTreeExpanded() {
    const {mainTable, MainTable} = this;
    //TODO:暂时解决异步树全部展开后下级不加载问题
    MainTable?.setAllTreeExpand(true);
    this.$nextTick().then(() => {
      Utils.deepFind(mainTable.dataSource, item => {
        item._X_EXPAND = !(!item.leaf && !item.childs.length);
        return false;
      }, mainTable.treeField);
    });
  }

  private getCheckFn({row}: { row: Type.QualityTable }) {
    return !isEmpty(row.jbs);
  }

  private searchMainTable(status?) {
    this.mainTable.status = status;
    this.clearSelectedRow();
    this.clearAllCheckBox();
    this.getQBSTree()?.then(() => {
      this.setAllTreeExpanded();
    });
  }

  private clearSelectedRow() {
    this.MainTable?.setCurrentRow([]);
    this.mainTable.currentRow = null;
  }

  private clearAllCheckBox() {
    const {mainTable} = this;
    Utils.deepFind(mainTable.dataSource, item => {
      item.checked = false;
      return false;
    }, 'childs');
  }

  private enableChecked() {
    const {mainTable} = this;
    if (mainTable.columns.length === 1) {
      mainTable.columns = [
        {
          type: 'checkbox',
          width: 40,
          align: 'center'
        },
        {
          title: "工程名称",
          field: 'qbsName',
          treeNode: true, // 树节点声明--重点
          slots: {default: "qbsName"} // 插槽声明
        },];
    } else {

    }
  }

  private checkBoxChange(
    {
      records,
      row,
      checked
    }: { records: Array<Type.QualityTable>, row: Type.QualityTable, checked: boolean }
  ) {
    console.log('checkBoxChange', records, row, checked, this.checkedRow)
    const {checkedRow, locale} = this;
    if (!checkedRow.length) {
      this.checkedRow = records;
      this.MainTable?.setCheckboxRow(row, checked);
    } else if (checked) {
      const handle = (property) => {
        return function (a, b) {
          const val1 = a[property];
          const val2 = b[property];
          return val1 - val2;
        }
      };
      const standard: Array<any> = checkedRow[0].jbs;
      console.log('standard', standard, row.jbs)
      if (row.jbs.length !== standard.length) {
        this.MainTable?.setCheckboxRow(row, false);
      } else {
        //TODO:
        let originTemp = '';
        let newTemp = '';
        standard.sort(handle('jbsCode')).forEach(function (v) {
          originTemp += v.qbsCode
        })
        row.jbs.sort(handle('jbsCode')).forEach(function (v) {
          newTemp += v.qbsCode
        })
        console.log('originTemp!==newTemp', originTemp === newTemp, checkedRow, row)
        if (originTemp === newTemp) {
          this.MainTable?.setCheckboxRow(row, true);
        } else {
          this.MainTable?.setCheckboxRow(row, false);
        }
      }
    } else if (!checked) {
      console.log(checkedRow, records);
      this.checkedRow = records;
    }
  }

  //TODO:跳转
  go2table(event) {
    //获取所有展开行id
    // @ts-ignore
    const expandRows = this.MainTable?.getTreeExpandRecords()??[]
    if(expandRows.length) {
      this.treeStatus.expandIds = expandRows.map((i)=> {
        return i.id as string;
      });
    }
    this.treeStatus.appCode = this.projectCode as string;
    this.treeStatus.projectName = this.projectConfig?.projectName as string;
    this.treeStatus.name = this.mainTable.conditions as string;
    this.treeStatus.status = this.mainTable.status;
    this.treeStatus.selectedIds = [];
    if (!event) {
      let selectRecords: Array<any> | null = this.MainTable?.getCheckboxRecords() ?? null;
      this.treeStatus.selectedIds = selectRecords?.map((i)=> i.id)??[]
      window.sessionStorage.setItem('treeStatus',JSON.stringify(this.treeStatus))
      //@ts-ignore
      this.$router.push({name: 'QualityDataBase', query: {data: JSON.stringify(selectRecords), flag: '1'}});
    } else {
      if (this.mainTable.columns.length !== 1) return
      this.treeStatus.selectedIds.push(event.row.id);
      window.sessionStorage.setItem('treeStatus',JSON.stringify(this.treeStatus))
      //@ts-ignore
      this.$router.push({name: 'QualityDataBase', query: {data: JSON.stringify([event.row]), flag: '1'}});
    }
  }

  private tableSelected({row}: { row: Type.QualityTable }) {
    const {mainTable} = this;
    if (!mainTable.checkAble) {
      this.mainTable.currentRow = row;
    } else {
      //this.MainTable?.setCurrentRow( [] );
    }
  }

  openOrClose(e) {
    console.log('openOrClose', this.MainTable?.isTreeExpandByRow(e.row));
    const isOpen: boolean = this.MainTable?.isTreeExpandByRow(e.row) ?? true;
    this.MainTable?.setTreeExpand(e.row, !isOpen)
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';

.mainContainer {
  .app_title {
    width: 100%;
    height: 45px;
    background: #0e79ed;
    display: flex;

    div:nth-child(1) {
      width: 80%;
      display: flex;

      span {
        width: 95%;
        font-size: 17px;
        padding-left: 15px;
        font-weight: 700;
      }

      img {
        padding-top: 12px;
        padding-left: 5px;
        width: 28px;
        height: 30px;
        margin-right: 40px;
      }
    }

    div:nth-child(2) {
      width: 20%;

      span {
        vertical-align: middle;
        width: 75%;
        font-size: 16px;
      }

      img {
        width: 18px;
        vertical-align: middle;
        margin-right: 3px;
        height: 18px;
      }
    }

    span {
      color: #fff;
      line-height: 45px;
    }

    .qbsEdit {
      width: 20px;
      vertical-align: center;
      margin: 15px 10px auto auto;
      height: 20px;
      cursor: pointer;
    }
  }

  & > article {
    //padding: 22px;
    display: flex;
    flex: 1;
    width: 100%;
    height: calc(100vh - 100px);
    flex-direction: column;

    .undo {
      color: #ff6367;
      margin: 0 5px;
    }

    .doing {
      color: #efb70d;
      margin: 0 5px;
    }

    .done {
      color: #00c567;
      margin: 0 5px;
    }

    .state_pic {
      width: 17px;
      height: 17px;
    }

    .qbsTree {
      height: calc(100vh - 155px);
      width: 100%;
      overflow-y: auto;

      /deep/ .vxe-tree-cell {
        font-size: 15px;
      }
    }

    .mainTableOptionNav {
      display: flex;
      width: 100%;
      height: 50px;
      align-items: center;
      margin-bottom: 10px;

      .search_input {
        width: 86%;
        margin-left: 2%;
      }

      & > img {
        height: 25px;
        width: 8%;
        margin: auto 2%;
      }
    }

    .annotation {
      text-align: justify;
      .px2rem(padding-top, @spacing-base);
      .px2rem(padding-left, 2 * @spacing-large);
      line-height: 1.3;
    }
  }
}

/deep/ .ant-dropdown-menu-item {
  span {
    .px2rem(padding-left, 8);
    .px2rem(padding-right, 8)
  }
}

.active {
  background-color: #409eff;
  color: white;
  //.px2rem(padding,@spacing-large)
}
</style>
