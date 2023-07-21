<template>
  <div class="engineering-archives flex flex-column full-height">
    <div class="e-header flex flex-space-between">
      <div v-show="!isShowSearchPanel" class="title">
        <tIcon :src="'goBack'"></tIcon>
        工程档案
      </div>
      <!-- <div class="title" v-show="isShowSearchPanel">
        <tIcon :src="'goBack'" :clickEvent="()=>isShowSearchPanel=false"></tIcon>
        搜索结果
      </div>
      <div>
        <a-input-search
          v-model="searchKey"
          placeholder="文件名称"
          @search="!isShowSearchPanel?isShowSearchPanel=true:getDocListByKeyword"></a-input-search>
      </div> -->
    </div>
    <div class="e-content flex-1 flex">
      <a-card v-show="!isShowSearchPanel" class="full-height files-menu flex flex-column">
        <template slot="title">
          <a-icon type="credit-card"/>
          文件目录
        </template>
        <div class="directorySearch">
          <a-input-search
            v-model="searchKeyOne"
            placeholder="目录名称"
            @pressEnter="() => handleSearchOne(searchKeyOne)"
            @search="getDocListByKeywordOne"
          ></a-input-search>
        </div>
        <a-tree
          :key="filesKey"
          :defaultExpandAll="true"
          :replaceFields="filesMenuReplaceFields"
          :treeData="filesMenuTree"
          showIcon
          @select="selectTreeNodeOne"
        >
          <template slot="icon" slot-scope="t">
            <span class="doc-folder">
              <img v-if="t.type==0" alt="" src="./img/file1_yellow拷贝3.png"/>
              <img v-if="t.type==1" src="./img/文档(1).png">
            </span>
          </template>
        </a-tree>
      </a-card>
      <a-card
        v-if="this.partCodeTree.length > 0"
        v-show="!isShowSearchPanel"
        class="full-height part-code flex flex-column"
      >
        <template slot="title">
          <a-icon type="profile"/>
          部位码
        </template>
        <div class="PartsCodeSearch">
          <a-input-search
            v-model="searchKeyTwo"
            placeholder="部位名称"
            @pressEnter="() => handleSearchTwo(searchKeyTwo)"
            @search="getDocListByKeywordTwo"
          ></a-input-search>
        </div>
        <a-tree
          :key="codeKey"
          :defaultExpandAll="true"
          :replaceFields="partCodeReplaceFields"
          :treeData="partCodeTree"
          @select="selectTreeNodeTwo"
        ></a-tree>
      </a-card>
      <a-card :class="isShowSearchPanel ? 'doc-list-full-width' : 'doc-list'" class="full-height">
        <template slot="title">
          <span v-show="!isShowSearchPanel"><a-icon type="profile"/>文档列表</span>
        </template>
        <!-- <template slot="title">
          <span v-show="isShowSearchPanel">按日期查找：
            <a-button
              type="link"
              v-for="(i,key) in dateOptions"
              :key="key"
              @click="changeDate(i.value)"
              :class="selectDate===i.value?'date-active':''">
              {{ i.lable }}
            </a-button>
          </span>
        </template> -->
        <div class="listSearch">
          <a-input-search
            v-model="searchKeyThree"
            placeholder="文件名称"
            @pressEnter="() => handleSearchThree(searchKeyThree)"
            @search="getDocListByKeywordThree"
          ></a-input-search>
        </div>
        <a-table
          :columns="docListColumns"
          :data-source="docList"
          :pagination="pagination"
          rowKey="index"
          @change="handleTableChange"
        >
          <!--          <template slot="filesName" slot-scope="text, record">-->
          <!--            <div class="filesName" @click="openDetails(record)" v-html="record.title"></div>-->
          <!--          </template>-->
          <template v-slot:filesName="text">
            <div class="filesName" @click="openDetails(record)" v-html="text"></div>
          </template>
          <template v-slot:creator="text">
            <span v-html="text"></span>
          </template>
          <template v-slot:modifier="text">
            <span v-html="text"></span>
          </template>
          <template v-slot:modifyTime="text">
            <span v-html="text"></span>
          </template>
          <span slot="attachments" slot-scope="attachments" class="attachments">
            <div
              :style="attachments.length > 1 ? hidden_attachments : attachments_name"
              class="attachments_name"
            >
              <template v-if="attachments.length > 1">
                <a
                  v-for="(item, index) in attachments"
                  :key="index"
                  href="javascript:"
                  v-html="`${item.name}...`"
                  @click="showModal(attachments)"

                ></a>
              </template>
              <a
                v-for="item in attachments"
                :key="item.id"
                href="javascript:"
                v-html="item.name"
                @click="openPageTwo(item)"></a>
            </div>
            <div><img
              v-show="attachments.length>=1"
              alt=""
              src="./img/icon_download.png"
              @click="downloadTwo(attachments[0])"
              style="cursor: pointer"/>
            </div>
          </span>
        </a-table>
        <a-modal v-model="visible" title="附件" @ok="handleOk">
          <div v-for="(item, index) in attachments" :key="index" class="modalList flex">
            <a
              :style="{ marginRight: '20px' }"
              href="javascript:"
              v-html="item.name"
              @click="openPageOne(item)"></a>
            <div><img
              alt=""
              src="./img/icon_download.png"
              @click="downloadOne(item, index)"
              style="cursor: pointer"/></div>
          </div>
        </a-modal>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue, Watch} from "vue-property-decorator";
import Input from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import Card from "ant-design-vue/lib/card";
import "ant-design-vue/lib/card/style/index.css";
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import "ant-design-vue/lib/tree/style/index.css";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import {DocList, FilesMenu, PartCode} from "./enType";
import * as Type from "../../type";
import Utils from "../../utils";
import {Icon as tIcon} from "@ctesi/component";
import {Modal} from "@h3/antd-vue";
import { exampleData } from './mock'

import {getAreaCodeTree, getDirectoryList, getDocListByKeywordList} from "./server/index.js";

@Component({
  name: "EngineeringArchives",
  components: {
    AInputSearch: Input.Search,
    ACard: Card,
    AIcon: Icon,
    ATree: Tree,
    ATable: Table,
    AButton: Button,
    tIcon,
    AModal: Modal,
  },
})
export default class EngineeringArchives extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  searchKeyOne: string = "";
  searchKeyTwo: string = "";
  searchKeyThree: string = "";
  dataList: Array<{ [propsName: string]: string }> = [];
  filesMenuTree: FilesMenu[] = [];
  newFilesMenuTree: Array<any> = [];
  filesMenuReplaceFields: { children: string; title: string; key: string } = {
    children: "childs",
    title: "name",
    key: "key",
  };
  filesKey: number = 0;
  partCodeTree: PartCode[] = [];
  partCodeReplaceFields: { children: string; title: string; key: string } = {
    children: "childs",
    title: "qbsName",
    key: "key",
  };
  codeKey: number = 0;
  docList: DocList[] = [];
  docListColumns: Array<Type.TableColumn<any>> = [
    {
      title: "序号",
      dataIndex: "index",
      key: "header_0",
    },
    {
      title: "文件名称",
      dataIndex: "title",
      key: "header_1",
      scopedSlots: {customRender: "filesName"},
    },
    {
      title: "创建人",
      dataIndex: "creator",
      key: "creator",
      scopedSlots: {customRender: 'creator'}
    },
    {
      title: "修改人",
      dataIndex: "modifier",
      key: "header_3",
      scopedSlots: {customRender: 'modifier'}
    },
    {
      title: "修改时间",
      dataIndex: "modifyTime",
      key: "header_4",
      scopedSlots: {customRender: 'modifyTime'}
    },
    {
      title: "附件",
      dataIndex: "attachments",
      key: "header_5",
      scopedSlots: {customRender: "attachments"},
    },
  ];
  isShowSearchPanel: boolean = false;
  visible: boolean = false;
  flag: boolean = false;
  dateOptions: { lable: string; value: string }[] = [
    {
      lable: "全部",
      value: "all",
    },
    {
      lable: "今日",
      value: "today",
    },
    {
      lable: "最近一周",
      value: "week",
    },
    {
      lable: "最近一月",
      value: "month",
    },
  ];
  selectDate: string = "all";
  appCode: any = "";
  projectName: any = "";
  attachments: any = [];
  hidden_attachments: object = {
    width: "140px",
    height: "20px",
    whiteSpace: "nowrap",
    overflow: "hidden",
  };
  attachments_name: object = {
    width: "140px",
    overflow: "hidden",
  };
  schemaCode: string = "";
  qbsCode: string = "";
  pagination: object = {
    current: 0,
    pageSize: 10, //每页中显示10条数据
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "50"], //每页中显示的数据
    showTotal: (total) => `共有 ${total} 条数据`, //分页中显示总的数据
  };

  @Watch("schemaCode", {immediate: true})
  changeSchemaCode(val) {
    this.searchKeyOne = '';
    this.searchKeyTwo = '';
    this.searchKeyThree = '';
  }

  @Watch("qbsCode", {immediate: true})
  changeQbsCode(val) {
    // this.searchKeyTwo = '';
    this.searchKeyThree = '';
  }

  //文件目录搜索
  getDocListByKeywordOne(val) {
    this.Search(this.filesMenuTree, val);
  }

  Search(data, val) {
    this.filesMenuTree = [];
    this.SearchTree(this.newFilesMenuTree, val);
  }

  SearchTree(data, val) {
    data.forEach((item) => {
      if (item.name.indexOf(val) > -1) {
        this.filesMenuTree.push(item);
        return item.name.indexOf(val) > -1;
      }
      if (item.childs?.length) {
        this.SearchTree(item.childs, val);
      }
    });
  }

  handleSearchOne(val) {
    console.log(val);
    this.Search(this.filesMenuTree, val);
  }

  SearchTwo(val) {
    let params = {
      appCode: this.appCode,
      projectName: this.projectName,
      flag: this.flag,
      name: val,
    };
    //获取部位码树列表
    getAreaCodeTree(params).then((res) => {
      //@ts-ignore
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      Utils.deepFind(
        res.data,
        (item) => {
          delete item.root;
          return false;
        },
        "childs"
      );
      this.partCodeTree = res.data;
    });
  }

  //部位码搜索
  getDocListByKeywordTwo(val) {
    this.SearchTwo(val);
  }

  handleSearchTwo(val) {
    this.SearchTwo(val);
  }

  //文档列表搜索
  getDocListByKeywordThree(keyWords) {//点击搜索
    this.SearchDocListByKeywordData(this.qbsCode, keyWords)
  }

  handleSearchThree(keyWords) {//回车搜索
    this.SearchDocListByKeywordData(this.qbsCode, keyWords)
  }

  changeDate(val) {
    this.selectDate = val
  }

  selectTreeNodeOne(keys, event) {//文件目录点击事件
    this.flag = event.node.dataRef.isRelated;
    this.schemaCode = event.node.dataRef.schemaCode;
    this.qbsCode='';
    if (event.node.dataRef.type == 1 && event.node.dataRef.isRelated == true) {
      let params = {
        appCode: this.appCode,
        projectName: this.projectName,
        flag: this.flag,
      };
      //获取部位码树列表
      getAreaCodeTree(params).then((res) => {
        //@ts-ignore
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        Utils.deepFind(
          res.data,
          (item) => {
            delete item.root;
            return false;
          },
          "childs"
        );
        this.qbsCode = res.data[0].qbsCode;
        this.partCodeTree = res.data;
        this.getDocListByKeywordData(this.qbsCode);
      });
    } else {
      this.partCodeTree = [];
      this.docList=[];
    }
    if (event.node.dataRef.type == 1) {
      this.getDocListByKeywordData("")
    }
  }

  selectTreeNodeTwo(keys, event) {
    //部位码点击事件
    this.qbsCode = event.node.dataRef.qbsCode;
    this.getDocListByKeywordData(this.qbsCode);
  }

  showModal(attachments) {
    this.visible = true;
    console.log(attachments);
    this.attachments = attachments;
  }

  handleOk(e) {
    console.log(e);
    this.visible = false;
  }

  downloadOne(item, index) {//弹框下载文件
    const token = localStorage.getItem("token");
    if (item) {
      window.open(`${item.downloadUrl}&access_token=${token}`)
    }
  }

  openPageOne(item) {//弹框打开文件
    console.log(item)
    if (item) {
      window.open(`${item.previewUrl}`)
    }

  }

  downloadTwo(item) {
    const token = localStorage.getItem("token");
    if (item) {
      window.open(`${item.downloadUrl}&access_token=${token}`)
    }
  }

  openPageTwo(item) {
    if (item) {
      window.open(`${item.previewUrl}`)
    }
  }

  handleTableChange(pagination) {//分页
    this.pagination['current'] = pagination.current;
    this.pagination['pageSize'] = pagination.pageSize;
    this.getDocListByKeywordData(this.qbsCode)
  }

  getDirectoryList() {
    //获取文档目录树
    getDirectoryList(this.appCode, this.projectName).then((res) => {
      //@ts-ignore
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.newFilesMenuTree = res.data;
      this.filesMenuTree = this.newFilesMenuTree;
      Utils.deepFind(
        this.filesMenuTree,
        (item) => {
          item.scopedSlots = {icon: "icon"};
          return false;
        },
        "childs"
      );
    });
  }

  getDocListByKeywordData(qbsCode) {//文档列表
    let params = {
      appCode: this.appCode,
      projectName: this.projectName,
      schemaCode: this.schemaCode,
      pageNum: this.pagination['current'],
      pageSize: this.pagination['pageSize'],
      qbsCode: qbsCode,
    };
    getDocListByKeywordList(params).then((res) => {
      //@ts-ignore
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.docList = res.data.records;
      this.pagination["total"] = res.data.total;
    });
  }

  SearchDocListByKeywordData(qbsCode, keyWords) {//文档列表
    // this.docList = exampleData.response.data.DocList;
    // console.log(this.docList,'111')
    let params = {
      appCode: this.appCode,
      projectName: this.projectName,
      schemaCode: this.schemaCode,
      pageNum: this.pagination['current'],
      pageSize: this.pagination['pageSize'],
      qbsCode: qbsCode,
      keyWords: keyWords
    };
    getDocListByKeywordList(params).then((res) => {
      //@ts-ignore
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.docList = res.data.records;
      this.pagination["total"] = res.data.total;
    });
  }

  openDetails(val) {//打开详情
    let routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: val.schemaCode,
        objectId: val.objectId,
        sheetCode: val.schemaCode,
        return: `${this.$route.fullPath}`,
        projectName: this.projectConfig?.projectName,
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }

  mounted() {
    this.filesKey++;
    this.codeKey++;
    this.appCode = this.projectCode;
    this.projectName = this.projectConfig?.projectName;
    this.getDirectoryList();
  }
}
</script>

<style lang="less" scoped>
@import "../../styles/public.module.less";

.engineering-archives {
  .e-header {
    margin-bottom: @spacing-base;

    .title {
      font-size: 17px;
      font-weight: bold;
    }
  }

  .e-content {
    .anticon {
      margin-right: @spacing-base;
    }

    /deep/ .ant-card-body {
      // display: flex;
      overflow: auto;

      .ant-table-wrapper {
        width: 100%;
      }
    }

    .files-menu {
      width: 28%;
      margin-right: 0.5%;

      .directorySearch {
        width: 100%;
      }

      /deep/ .doc-folder {
        i {
          img {
            width: 16px;
            height: 16px;
          }
        }
      }

      /deep/ .ant-tree li .ant-tree-node-content-wrapper {
        padding-left: 0;
      }
    }

    .part-code {
      width: 30%;
      margin-right: 0.5%;
    }

    .doc-list {
      width: 100%;

      .listSearch {
        width: 400px;
      }
    }

    .doc-list-full-width {
      width: 100%;

      .date-active {
        font-weight: bold;
      }
    }

    .attachments {
      overflow: hidden;

      .attachments_name {
        a {
          width: 140px;
          display: block;
          margin-right: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          float: left;
        }
      }

      div {
        margin-left: 10px;
        float: left;
      }
    }

    .filesName:hover {
      cursor: pointer;
      color: #0b8ef5;
    }
  }

  /deep/ .ant-card-head {
    height: 50px;
  }
}

/deep/ .ant-tree-switcher_open {
  .ant-tree-switcher-icon {
    font-size: 20px !important;
    color: #cccccc;
  }
}
</style>
