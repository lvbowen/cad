<template>
  <div class="reviewDetail">
    <a-collapse
      :defaultActiveKey="['1']"
      :bordered="false"
      expandIconPosition="right"
    >
      <!-- tab切换 -->
      <!--      <div class="clearfix">-->
      <!--        <div class="left buttonLinks">-->
      <!--          <span-->
      <!--            class="buttonLink"-->
      <!--            :class="{ active: leftButtonLinks.activeIndex === index }"-->
      <!--            v-for="(item, index) in leftButtonLinks.buttonLinks"-->
      <!--            :key="index"-->
      <!--            @click="leftButtonClick(index)"-->
      <!--          >{{ item.name }}</span-->
      <!--          >-->
      <!--        </div>-->
      <!--      </div>-->
      <!-- 技术方案 -->
      <a-collapse-panel key="1">
        <template #header>
          <div class="collapseHeader">
            <div class="collapseHeaderTitle left">技术方案</div>
          </div>
        </template>
        <!-- 搜索框 -->
        <div class="operate">
          <!--          <div class="inputSearch">-->
          <!--            <a-input-search-->
          <!--              v-model.trim="keywords"-->
          <!--              class="inputSearch"-->
          <!--              placeholder="请输入项目名称"-->
          <!--              enterButton-->
          <!--              @search="onSearch"-->
          <!--              @change="onChanges"-->
          <!--              allowClear-->
          <!--            />-->
          <!--          </div>-->
          <div class="button">
            <a-popconfirm title="确认删除吗？删除之后不可恢复哦！" @confirm="handleDel">
              <a-button :disabled="!delSubButton">删除</a-button>
            </a-popconfirm>
            <a-button type="primary" @click="handleAdd" :disabled="!delSubButton">新增</a-button>
          </div>
        </div>

        <!-- 技术方案表格 -->
        <div class="mainReviewComments">
          <a-table
            bordered
            :key="tableKey"
            rowKey="id"
            :data-source="dataSource"
            :columns="columns"
            :loading="loading"
            :pagination="false"
            :rowSelection="rowSelection"
          >
            <template slot="operation" slot-scope="text, record">
              <span class="lookShow" style="margin-right: 8px" @click="lookShow(record)">
                <a>查看</a>
              </span>
              <!--              <a-popconfirm-->
              <!--                v-if="dataSource.length"-->
              <!--                title="确认删除吗？删除之后不可恢复哦"-->
              <!--                @confirm="() => onDelete(record)"-->
              <!--              >-->
              <!--                <a :disabled="!delSubButton">删除</a>-->
              <!--              </a-popconfirm>-->
            </template>
          </a-table>
          <div>
            <a-pagination
              showQuickJumper
              :defaultCurrent="pageTable"
              :current="pageTable"
              :total="totalTable"
              :pageSize="sizeTable"
              @change="onChange"
            />
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import {Collapse, Popconfirm, Tabs} from "@h3/antd-vue";
import {Component, Vue, Prop, InjectReactive} from "vue-property-decorator";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.less";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Pagination from "ant-design-vue/lib/pagination";
import "ant-design-vue/lib/pagination/style/index.css";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import {
  technicalSchemeList,
  technicalSchemeAuth,
} from "../../../../service/CoordinateDesign/pluginsDownload";
import {listApi} from "@cloudpivot/api";
import { TableColumn } from "../../../../type";

@Component({
  name: "TechnicalProtocols",
  components: {
    [Collapse.name]: Collapse,
    [Collapse.Panel.name]: Collapse.Panel,
    AButton: Button,
    APopconfirm: Popconfirm,
    AInputSearch: Input.Search,
    ATabs: Tabs,
    ATable: Table,
    APagination: Pagination,
  },
})
export default class TechnicalProtocols extends Vue {
  @InjectReactive("project") appCode!: string;
  @Prop({required: true}) projectId!: string;
  @Prop({required: false, default: false}) isCreate!: boolean;
  @Prop({required: false}) wProjectName!: string;

  // 定义变量 初始化数据
  // keywords: any = this.wProjectName ?? "";
  editable: boolean | undefined;
  value: any;
  visible: boolean = false;
  visibility: boolean = false;
  confirmLoading: boolean = false;
  ModalText: string | undefined;
  delSubButton: boolean = false; //删除按钮权限
  workitemId: string | undefined = "";

  //tab切换按钮
  leftButtonLinks = {
    activeIndex: 1,
    buttonLinks: [{name: "设计评审"}, {name: "技术方案"}],
  };
  itemEdit: any;
  discharge: any;

  //头部 tab 切换
  leftButtonClick(index: number) {
    this.leftButtonLinks.activeIndex = index;
    this.$router.push({
      name: "DesignReview",
      query: {
        projectId: this.projectId,
      },
    });
  }

  dataSource: any = [];
  count: any = 4;
  columns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      //@ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: "项目编号",
      width: "8%",
      align: "center",
      dataIndex: "engineeringNumber",
    },
    {
      title: "项目名称",
      width: "12%",
      align: "center",
      dataIndex: "engineeringName",
    },
    {
      title: "设计阶段",
      width: "10%",
      align: "center",
      dataIndex: "engineeringStage",
    },
    {
      title: "评审类型",
      width: "10%",
      align: "center",
      dataIndex: "reviewType",
    },
    {
      title: "创建人",
      align: "center",
      dataIndex: "creater",
      width: 120
    },
    {
      title: "创建时间",
      align: "center",
      dataIndex: "createrTime",
      width: 120
    },
    {
      title: "流程状态",
      width: "20%",
      align: "center",
      dataIndex: "processState",
    },
    {
      title: "操作功能",
      align: "center",
      width: "80px",
      dataIndex: "features",
      scopedSlots: {customRender: "operation"},
    },
  ];
  text: any;
  record: any;

  // 表格分页
  loading: boolean = false;
  pageTable: number = 1;
  sizeTable: number = 10;
  totalTable: number = 0;
  currentRow: any = null;
  schemaCode: string = "XTSJ_jsfa";
  idsArr: any = [];
  deviewId: string = "";
  vms: any = this;

  //进入页面调取列表接口
  async mounted() {
    this.getListLooksData();
    this.getTechnicalSchemeAuth();
  }

  //进入页面调取新增删除 按钮权限接口
  async getTechnicalSchemeAuth() {
    const res = await technicalSchemeAuth({
      appCode: "XTSJ",
      scrwdId: this.projectId
    });
    if(res.errcode!==0) return this.$message.error(res.errmsg as string)
    if(!res.data) return;
    this.delSubButton = res.data;
  }

  // 获取设计评审列表接口数据渲染
  async getListLooksData() {
    this.loading = true;
    this.dataSource = [];
    this.idsArr = [];
    const res = await technicalSchemeList({
      appCode: "XTSJ",
      page: this.pageTable,
      size: this.sizeTable,
      scrwdId: this.projectId??''
    });
    this.loading = false;
    if(res.errcode!==0) return this.$message.error(res.errmsg as string)
    if(!res.data) return;
    this.totalTable = res.data.total;
    this.dataSource = res.data.records;
    this.tableKey++
  }

  //点击查看跳转到技术方案详情页
  lookShow({id, workitemId, workflowInstanceId}) {
    this.$router.push({
      name: "ArtReviewDetail",
      query: {
        // workitemId: workitemId ?? "",
        id: id,
        projectId: this.projectId
        // workflowInstanceId: workflowInstanceId,
      },
    });
  }

  //初始化默认参数
  clearDatas() {
    this.dataSource = [];
    this.idsArr = [];
    this.pageTable = 1;
  }

  // // 搜索接口
  // onSearch() {
  //   // 搜索前先初始化数据
  //   this.clearDatas();
  //   //进行特定搜索
  //   this.getListLooksData();
  // }
  //
  // onChanges() {
  //   if (this.keywords.length == 0) {
  //     this.onSearch();
  //   }
  // }

  check() {
    this.editable = false;
    this.$emit("change", this.value);
  }

  edit() {
    this.editable = true;
  }

  //单行删除
  onDelete(records) {
    this.deleteRow([records.id]);
    // if (!this.currentRow) return this.$message.warn("请选择行！");
  }

  // 删除接口
  deleteRow(arr: any) {
    listApi
      .deleteListData({
        ids: arr,
        schemaCode: this.schemaCode,
      })
      .then((res) => {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        if(!res.data) return;
        if (res.data.errorCount > 0) {
          this.$message.warn("该用户没有删除权限");
        } else {
          this.$message.success(res.errmsg as string);
          //刷新页面
          this.pageTable = 1;
          this.getListLooksData();
        }
      });
  }

  onChange(pageNumber) {
    this.pageTable = pageNumber;
    this.getListLooksData();
    console.log("Page: ", pageNumber);
  }

  //单选框
  rowSelection: any = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.selectedKeys(selectedRowKeys)
      // this.idsArr = selectedRows.map((v) => v.id);
    },
  };
  selectedKeys(selectedRowKeys:string[]) {
    this.idsArr = selectedRowKeys
  }
  handleAdd() {
    //跳转到技术评审详情页 进行新增操作
    this.$router.push({
      name: "ArtReviewDetail",
      query: {
        projectId: this.projectId,
        //@ts-ignore
        isCreate: true,
      },
    });
  }

  // 删除按钮
  handleDel() {
    if (!this.idsArr.length) return this.$message.warning('请至少选一条数据！');
    this.deleteRow(this.idsArr);
  }
  tableKey: number = 1;
}
</script>

<style lang="less" scoped>
.myHeader {
  position: relative;
  height: 2.0833vw;
  line-height: 2.0833vw;
  margin-bottom: 0.5208vw;

  .headerIcon {
    padding-right: 0.7813vw;
    font-size: 1.0417vw;
  }

  .headerTitle {
    height: 100%;
    font-size: 18px;
    font-weight: 700;
  }
}

.buttonLinks {
  margin-bottom: 1.0417vw;

  &:not(:last-child) {
    margin-right: 0.5208vw;
  }

  .buttonLink {
    display: inline-block;
    line-height: 2.0833vw;
    font-size: 0.8333vw;
    font-family: "Source Han Sans CN";
    color: #b1b1b1;
    cursor: pointer;

    &:not(:last-child) {
      margin-right: 1.875vw;
    }
  }

  .active {
    color: #666666;
    border-bottom: 0.1563vw solid #3293ff;
  }
}

.clearfix:before,
.clearfix:after {
  content: "";
  display: table;
}

.clearfix:after {
  clear: both;
  overflow: hidden;
}

.clearfix {
  *zoom: 1;
}

.collapseHeader {
  height: 1.25vw;
  line-height: 1.25vw;
  background: url("../.././../../../src/assets/extends/CoordinateDesign/ProductionTaskList/title.png") no-repeat;
  background-size: 100% 100%;

  .collapseHeaderIcon {
    height: 100%;
    padding-right: 0.5208vw;
  }

  .collapseHeaderTitle {
    padding-left: 1.1458vw;
    padding-right: 4.1667vw;
    font-size: 0.7292vw;
    font-family: "Microsoft YaHei";
    color: #ffffff;
  }

  .subTitle {
    font-size: 0.625vw;
    font-family: "Microsoft YaHei";
    color: #7dadef;
  }

  .collapseHeaderLine {
    &::after {
      content: "";
      margin-left: 1.0417vw;
      border-left: 0.1042vw solid #797979;
    }
  }

  .collapseHeaderNode {
    em {
      padding-left: 0.5208vw;
      color: #67c73b;
    }
  }

  .collapseHeaderItem {
    font-size: 0.625vw;
    font-family: "Microsoft YaHei";
    color: #575859;
    padding-left: 1.0417vw;

    em {
      padding-left: 0.5208vw;
    }
  }

  .collapseHeaderHandle {
    em {
      color: #3873f6;
    }
  }

  .collapseHeaderWorkflow {
    em {
      color: #f29d38;
    }
  }

  .collapseHeaderTime {
    em {
      padding: 0 0.1042vw;
      color: #e10404;
    }
  }
}

.reviewDetail {
  padding: 10px;
  // ::v-deep .button ant-btn ant-btn-primary
  .operate {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .inputSearch {
      width: 350px;
    }

    .button {
      width: 150px;
      display: flex;
      justify-content: space-between;
    }
  }

  // 项目基本信息
  .basicInformation {
    height: 360px;
    width: 100%;
    box-sizing: border-box;

    &-tops {
      width: 100%;
      height: 200px;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
    }

    ::v-deep .ant-form-item-label {
      width: 20%;
      margin-right: 15px;
      text-align: left;
    }

    ::v-deep .ant-form-item-control-wrapper {
      width: 70%;
    }

    &-bottoms {
      width: 100%;
      height: 100px;
      box-sizing: border-box;

      ::v-deep .ant-form-item-label {
        width: 9.6%;
        margin-right: 15px;
        text-align: left;
        line-height: 20px !important;

        label {
          white-space: pre-wrap !important;
          line-height: 10px;
        }
      }

      ::v-deep .ant-form-item-control-wrapper {
        width: 79%;
        height: 100px;

        textarea {
          height: 100px;
        }
      }
    }
  }
}

.professionalDesignOutlineWrap {
  .collapseHeaderTitles {
    padding-left: 1.1458vw;
    padding-right: 4.1667vw;
    font-size: 0.7292vw;
    font-family: "Microsoft YaHei";
    font-weight: 900;
  }

  .rightButton {
    width: 200px;
    float: right;
    margin-right: -52px;
  }

  //主要评审意见
  .mainReviewComments {
    height: 100%;
    width: 92%;
    box-sizing: border-box;

    &-content {
      width: 100%;
      height: 400px;
      margin-top: 20px;

      .reviewProposer {
        width: 100%;
        margin-top: 15px;
      }

      .operation {
        display: flex;
        justify-content: space-around;
      }
    }
  }

  //表格自带样式
  ::v-deep .ant-table-thead {
    background-color: skyblue !important;
  }

  .editable-cell {
    position: relative;
  }

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    line-height: 18px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell:hover .editable-cell-icon {
    display: inline-block;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

::v-deep.ant-pagination {
  position: absolute;
  top: 103%;
  right: 2%;
}
</style>
