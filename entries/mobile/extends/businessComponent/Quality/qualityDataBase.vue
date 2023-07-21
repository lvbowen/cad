<template>
  <div class="quality-data-base full-height">
    <div class="app_title">
      <div>
        <img @click="toprev" src="../../Img/fanhui1.png" alt=""/>
        <span>{{ title }}</span>
      </div>
    </div>
    <div class="doc-list flex flex-column" v-if="filesFlag">
      <a-input-search
        class="search_input"
        v-model="tableData.conditions"
        placeholder="请输入关键字"
        allowClear
        size="small"
        @change="searchMainTable">
      </a-input-search>
      <div v-if="tableData.dataSource && tableData.dataSource.length" class="full-height folder">
        <div
          v-for="(item,index) in tableData.dataSource"
          :key="index"
          class="list">
          <img src="../../Img/Folder.png"/>
          <span> {{ item.sheetName }}</span>
          <span class="next">
            <a-icon type="plus-circle" @click="goFormAdd(item)"/>
            <a-icon type="right" @click="next(item)"/>
          </span>
        </div>
      </div>
      <div v-else class="blank">
        <img src="../../Img/blank.png"/>
        <p>暂无数据</p>
      </div>
    </div>
    <div class="mainContainer" v-else>
      <article class="tableContainer">
        <a-table
          size="small"
          bordered
          class="table"
          rowKey="id"
          :columns="tableData.columns"
          :dataSource="bizSheetData"
          :locale="{
            emptyText: tableData.emptyText
          }"
          :pagination="false"
        >
          <template slot="status" slot-scope="text, record">
            <span @click="goFormDetail(record)" :class="text==='已归档'?'done':text==='审核中'?'doing':'undo'">{{
              text
            }}</span>
          </template>
        </a-table>
      </article>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Ref, Vue, Watch} from "vue-property-decorator";
import apptitle from "../components/appTitle.vue";
import contentbox from "../components/contentBoxs.vue";
import * as Type from "../../type";
import * as Api from "../../service/api";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import moment from "moment";
interface QualityTableType {
  loading: boolean,
  dataSource: Array<Type.QualityQBS>,
  current: number,
  total: number,
  pageSize: number,
  conditions: string,
  emptyText: string,
  columns: Array<any>;
}

@Component({
  name: "qualityDataBase",
  components: {
    apptitle,
    contentbox,
    AInputSearch: Input.Search,
    ATable: Table,
    AIcon: Icon
  }
})
export default class qualityDataBase extends Vue {

  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  @Watch('$route', {immediate: true})
  getFilesInfo(val) {
    val.query.title ? this.title = val.query.title : this.title = '质检资料库';
    const v = val.query;
    if (v.flag) {
      if (v.flag === '1') { //a->b,c->b,刷新（xx）
        this.filesFlag = true;
        this.cacheData = JSON.parse(v.data);
        this.queryQualityBizSheetList();
      } else if (v.flag === '2') { //b->c
        this.filesFlag = false;
        this.bizSheetData = JSON.parse(v.data)?.datas ?? [];
      }
    }
    //addForm save
    if(val.query.iframeAction==='add') this.$router.go(-1)
  }

  private tableData: QualityTableType = {
    loading: false,
    dataSource: [],
    current: 0,
    total: 0,
    pageSize: 10,
    conditions: '',
    emptyText: '暂无数据',
    columns: [
      {
        title: "任务名称",
        dataIndex: 'sheetName',
        key: "sheetName",
        ellipsis: true,
        align: "center",
        width: "50%"
      },
      {
        title: '填报时间',
        align: "center",
        key: 'createTime',
        dataIndex: 'createTime',
        width: "25%",
        customRender: (text)=>{
          return moment(text).format('YYYY-MM-DD')
        }
      },

      {
        title: "当前流程",
        dataIndex: 'status',
        key: "status",
        width: "25%",
        align: "center",
        scopedSlots: {customRender: "status"}
      }
    ]
  }
  private title: string = '质检资料库'; //标题(文件目录名称)
  filesFlag: boolean = true;
  cacheData: Type.QualityQBS[] = [];
  bizSheetData: Type.BizSheetC[] = [];
  cacheHitsData: Type.QualityQBS[] = [];

  queryQualityBizSheetList(page?: number) {
    let qbsIds: Array<string> = [];
    //@ts-ignore
    // const params: Array<any> = this.$route.query.data ?? [];
    const params: any[] = this.cacheData;
    params.forEach(function (v) {
      qbsIds.push(v.id)
    });
    const {tableData} = this;
    Api.queryQualityBizSheetList({
      currentPage: page ?? 0,
      pageNum: 99999,
      qbsIds: qbsIds,
    }).then(res => {
      if (res.errcode !== 0) return tableData.emptyText = res.errmsg as string;
      if (res.data) {
        tableData.dataSource = res.data.hits;
        this.cacheHitsData = [...res.data.hits]
      }
    })
  }

  toprev() {
    this.$router.go(-1);
  }

  // private paginationChange(page: number, pageSize: number) {
  //   this.tableData.current = page;
  //   this.$nextTick().then(() => {
  //     this.queryQualityBizSheetList(page);
  //   });
  // }

  private searchMainTable() {
    const {tableData} = this;
    if (tableData.conditions === '') {
      this.queryQualityBizSheetList();
    } else {
      tableData.dataSource = this.cacheHitsData.filter(value => {
        if (value.sheetName.indexOf(tableData.conditions) > -1) {
          return value.sheetName
        }
      })
    }
  }

  private async go2View(record: Type.QualityQBS, mark: string) {
    const {schemaCode, sheetCode, datas, workFlowCode} = record;
    const {projectCode, projectConfig} = this;
    const urlProjectCode = projectCode;
    const urlProjectName = projectConfig?.projectName;
    const urlAction = datas?.[0].bizObjId ? 'detail' : 'add';
    // const urlReturn = `/apps/QualityDataBase/?data=${this.$route.query.data}`;
    const qbsCode = this.generateQBSCode();
    const returnDetail = `/apps/QualityDataBase/?data=null&iframeAction=${urlAction}`
    let url = {
      schemaCode: schemaCode,
      sheetCode: schemaCode,
      queryCode: schemaCode,
      qbsCode: qbsCode,
      projectName: urlProjectName
    }
    let urlDetail: any = {
      sheetCode: schemaCode,
      objectId: datas?.[0].bizObjId,
      schemaCode: schemaCode,
      qbsCode: qbsCode,
      isWorkFlow: false,
      return: returnDetail
    };
    if (workFlowCode) {
      this.$set(url, 'startWorkflowCode', workFlowCode);
      this.$set(url, 'return', returnDetail);
      if (datas?.[0].bizObjId) {
        const target = await Api.getWorkFlowFormDetailUrl({
          schemaCode,
          bizObjectId: datas?.[0].bizObjId as string
        }) as string;
        urlDetail = {};
        const _this = this;
        target.split('?')[1].split('&').forEach(function (v) {
          const tempt = v.split('=');
          _this.$set(urlDetail, tempt[0], tempt[1]);
        });
      }
    } else {
      this.$set(url, 'return', returnDetail);
    }
    this.$router.push({
      // 业务表单
      name: "form-detail",
      query: mark === 'view' ? urlDetail : url
    })
      .catch((err: any) => {
        err;
      });
    console.log('record===>', mark === 'view' ? urlDetail : url);
  }

  private async goFormDetail(record: Type.BizSheetC) {
    const {schemaCode, bizObjId} = record;
    let urlDetail: any = {
      return: `/apps/QualityDataBase/?data=null&iframeAction=detail`
    };
    const target = await Api.getWorkFlowFormDetailUrl({
      schemaCode,
      bizObjectId: bizObjId as string
    }) as string;
    const _this = this;
    target.split('?')[1].split('&').forEach(function (v) {
      const tempt = v.split('=');
      _this.$set(urlDetail, tempt[0], tempt[1]);
    });
    this.$router.push({
      // 业务表单
      name: "form-detail",
      query: urlDetail
    })
  }
  private goFormAdd(record: Type.BizSheetC) {
    const {schemaCode,qbsCode,workFlowCode} = record;
    let url: any = {
      schemaCode: schemaCode,
      sheetCode: schemaCode,
      queryCode: schemaCode,
      qbsCode: qbsCode,
      projectName: this.projectConfig?.projectName??'',
      return: `/apps/QualityDataBase/?iframeAction=add`
    };
    if(workFlowCode) {
      url.startWorkflowCode = workFlowCode;
    }
    this.$router.push({
      // 业务表单
      name: "form-detail",
      query: url
    })
  }

  private generateQBSCode() {
    //@ts-ignore
    const checkedRow: Array<any> = this.$route.query.data;
    return checkedRow.map(item => item.qbsCode).join(',');
  }

  next(item) {
    this.$router.push({
      name: 'QualityDataBase',
      query: {
        data: JSON.stringify(item),
        title: item.sheetName,
        flag: '2'
      }
    })
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';

.quality-data-base {
  //overflow: hidden;

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

  .doc-list {
    height: calc(100% - 45px);

    .folder {
      overflow: auto;

      .list {
        .px2rem(font-size, @font-size-small);
        font-weight: bold;
        background-color: white;
        padding: 2vw 3vw;
        display: flex;
        align-items: center;
        margin: 2vw;
        border-radius: 10px;

        span {
          padding-left: 2vw;
        }

        .next {
          flex: 1;
          text-align: right;

          .anticon {
            .px2rem(margin-left, @spacing-large);
            .px2rem(font-size, 35)
          }
        }
      }
    }

    .search_input {
      .px2rem(margin-top, @spacing-base);
      width: 99%;
      padding: 5px;
    }

    .blank {
      color: #8D8C8C;
      .px2rem(margin-top, @spacing-large);

      p {
        .px2rem(margin-top, 20);
        .px2rem(margin-bottom, 20);
      }

      img {
        width: 50%;
      }
    }
  }

  .mainContainer {
    height: calc(100% - 45px);
    overflow: auto;
    .px2rem(padding-bottom, @spacing-large);

    & > article {
      //padding: 22px;
      display: flex;
      flex: 1;
      width: 100%;
      //height: calc(100vh - 100px);
      flex-direction: column;

      ///deep/ .ant-table-content {
      //  height: calc(100vh - 190px);
      //}

      /deep/ .ant-pagination {
        float: right;
        margin: 4px;

        .ant-pagination-item {
          font-size: 16px;
        }
      }

      .undo {
        color: rgba(255, 113, 117, 1);
      }

      .doing {
        color: rgba(239, 183, 13, 1);
      }

      .done {
        color: rgba(0, 197, 103, 1);
      }
    }
  }
}

</style>
