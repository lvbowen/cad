<template>
  <div class="drawing-database full-height">
    <div class="header flex-center-align">
      <!-- <Icon name="arrow-left" @click="back()"/> -->
      <div>图纸资料库</div>
    </div>
    <div class="content">
      <Search v-model="searchVaule" placeholder="请输入关键字（文件名）查找" showAction>
        <template #action>
          <a-button
            @click="onSearch"
            type="primary"
            shape="round"
            class="search">搜索
          </a-button>
        </template>
      </Search>
      <div class="menu">
        <div v-if="selectedItem.pdbsname.length"> {{ selectedItem.pdbsname }}</div>
        <div v-else>请选择资料目录</div>
        <img :src="arrow" @click="openDrawingTree"/>
      </div>
      <r-scroll ref="scroll" @loadmore="queryData">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          bordered
          :key="pageNum"
          :pagination="false">
          <span slot="attachment" slot-scope="text, record">
            <a @click="downloadFile(record)" class="fj">
              {{ record.attachment ? record.attachment.name : '' }}
            </a>
          </span>
        </a-table>
      </r-scroll>
    </div>
    <van-dialog
      v-model="show"
      title="资料目录"
      :showCancelButton="true"
      @confirm="queryMenu"
      @close="closeDrawingTree">
      <div class="inner" slot="default">
        <div class="tree">
          <a-tree
            class="tree"
            :treeData="treeData"
            :replaceFields="replaceFields"
            @select="onSelect"></a-tree>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import {Search, Dialog} from 'vant';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import arrow from '../../Img/arrow0.png';
import {getpdbsTree, getList} from "../service/api";
import env from "@/config/env";
import {ProjectConfig} from "../../type";
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
// import moment from 'moment';
import * as platform from '@cloudpivot/platform';
import rScroll from './common/scroll.vue';
//@ts-ignore
@Component({
  name: "DrawingDatabase",
  components: {
    Search,
    AButton: Button,
    ATree: Tree,
    AModal: Modal,
    Dialog,
    VanDialog: Dialog.Component,
    AIcon: Icon,
    ATable: Table,
    rScroll
  }
})
export default class DrawingDatabase extends Vue {
  @InjectReactive('projectConfig')
  private projectConfig?: ProjectConfig;
  searchVaule: string = '';
  arrow: string = arrow;
  show: boolean = false;
  treeData: Array<any> = [];
  replaceFields = {
    key: "id",
    title: "pdbsname",
  };
  selectedItem: { id: string, pdbsname: string } = {
    id: '',
    pdbsname: ''
  };
  seletedKey: string = '';
  columns: any[] = [
    {
      title: '序号',
      align: "center",
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      align: "center",
      title: "附件",
      key: "attachment",
      dataIndex: "attachment",
      scopedSlots: {customRender: "attachment"}
    },
    {
      align: "center",
      title: "上传人",
      key: "userName",
      dataIndex: "userName",
    },
    {
      align: "center",
      title: "上传日期",
      key: "uploadTime",
      dataIndex: "uploadTime",
    }
  ];
  tableData: Array<any> = [];
  loading: boolean = false;
  pageNum: number = 1;
  queryKeyword: string = '';

  openDrawingTree() {
    this.show = true;
  }

  getpdbsTree() {
    getpdbsTree({
      projectCode: env.project,
      projectName: this.projectConfig?.projectName ?? '',
      userId: ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.treeData = res.data;
      if (res.data && res.data.length) {
        this.selectedItem = this.treeArrFilter(this.treeData, 'children', 'id', res.data[0].id)[0];
        this.getList();
      }
      ;
    })
  }

  closeDrawingTree() {
    this.show = false
  }

  onSearch() {
    this.pageNum = 1;
    this.queryKeyword = this.searchVaule;
    this.getList();
  }

  onSelect(key) {
    this.seletedKey = key[0];
  }

  treeArrFilter(arr: any[] = [], attChildren = 'children', key, value) {
    let finalArr = [];
    arr.map((item: any) => {
      if (item[key] === value) {
        //@ts-ignore
        finalArr.push(item);
      }
      if (item[attChildren]) {
        const p = this.treeArrFilter(item[attChildren], attChildren, key, value);
        finalArr = finalArr.concat(p)
      }
    });
    return finalArr;
  }

  getList() {
    this.loading = true;
    getList({
      projectCode: env.project,
      projectName: this.projectConfig?.projectName ?? '',
      userId: '',
      pdbsId: this.selectedItem.id,
      queryKeyword: this.queryKeyword,
      pageNum: this.pageNum,
      pageSize: 6
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.tableData = res.data.records;
    }).finally(() => {
      this.loading = false;
    })
  }

  queryMenu() {
    this.tableData = [];
    this.pageNum = 1;
    this.searchVaule = '';
    this.selectedItem = this.treeArrFilter(this.treeData, 'children', 'id', this.seletedKey)[0];
    this.show = false;
    this.getList();
  }

  downloadFile(data) {
    platform.service.openLink(data.previewUrl);
  }

  timeout(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms, 'done')
    })
  }

  queryData() {
    getList({
      projectCode: env.project,
      projectName: this.projectConfig?.projectName ?? '',
      userId: '',
      pdbsId: this.selectedItem.id,
      queryKeyword: '',
      pageNum: ++this.pageNum,
      pageSize: 6
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      //@ts-ignore
      if (res.data && Array.isArray(res.data.records) && !res.data.records.length) return this.$refs.scroll.compleate();
      this.tableData = this.tableData.concat(res.data.records);
    }).finally(() => {
      //@ts-ignore
      this.$refs.scroll.loaded();
    })
  }

  mounted() {
    this.getpdbsTree();
  }
}
</script>

<style scoped lang="less">
@import "~@/styles/index.less";

.drawing-database {
  text-align: left;
  overflow: hidden;

  /deep/ .van-dialog {
    top: 40%;
    height: 40%;
    display: flex;
    flex-direction: column;
    .van-dialog__header {
      background-color: #50A4FF;
      color: white;
      .px2rem(padding,24);
    }
    .van-dialog__content {
      flex: 1;
      height: 30%;
      overflow: auto;
      .px2rem(padding-left,16);
      .px2rem(padding-right,16);
      .inner {
        justify-content: space-between;
        .px2rem(padding-left,16);
        .px2rem(padding-right,16);
        .tree {
          .px2rem(margin-bottom,48px);
          overflow: auto;
        }
      }
    }
  }

  .header {
    .px2rem(padding, @spacing-large);
    color: @font-color-base;
    .px2rem(font-size, 32);
    background-color: #2758fd;
    .px2rem(height, 88px);

    > div {
      margin: 0 auto;
      font-weight: bold;
    }
  }

  .content {
    .px2rem(padding, 10px);
    height: calc(100% - 13vw);

    .search {
      .px2rem(padding-left, 32px);
      .px2rem(padding-right, 32px);
      //background: linear-gradient(90deg, #2DA9AA, #00C7C9);
    }

    .van-search {
      height: 16vw;
      padding: 0;
    }

    .menu {
      height: 10vw;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.4vw 0 0.6vw 0;
      .px2rem(font-size, 30px);
      color: #333333;
      font-weight: bold;

      img {
        .px2rem(width, 50px);
        .px2rem(height, 50px);
        .px2rem(margin-left, 16px)
      }
    }

    .fj {
      color: #2970ff;
    }

    /deep/ .ant-table-body {
      table {
        width: 100%;
      }
    }
  }
}
</style>
