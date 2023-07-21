<template>
  <div class="main">
    <a-card title="数字移交" class="box" :bodyStyle="bodyStyleBox">
      <!--      <span class="toprev" @click="toprev">-->
      <!--        <img src="../../../src/assets/extends/icon/icon.png" alt=""/>-->
      <!--      </span>-->
      <a-card
        title="编码树"
        class="left"
        size="small"
        :bodyStyle="bodyStyleLeft">
        <a-input-search style="margin-bottom: 8px" placeholder="请输入关键字" @change="onChange"/>
        <div class="tree">
          <a-tree
            selectable
            :key="treeKey"
            :loadData="onLoadData"
            :treeData="treeData"
            :replaceFields="replaceFields"
            @select="onSelect"
            :defaultExpandedKeys="treeExpandData"
            :defaultSelectedKeys="SelectedKeys"
          >
            <template slot="title" slot-scope="text,record">
              <span v-if="highLightKeys.indexOf(text.eventKey)>-1" style="color: #0BCDA3">{{ text.taskName }}</span>
              <span v-else>{{ text.taskName }}</span>
            </template>
          </a-tree>
        </div>
      </a-card>
      <a-card
        title="数据明细"
        class="right"
        size="small"
        :bodyStyle="bodyStyleRight">
        <!--模块选择栏-->
        <div>
          <a-button
            :class="moduleChoose===v.code?'hover_modules':'modules_button'"
            v-for="(v,i) in moduleOption"
            :key="i"
            @click="chooseModule(v.code)">
            {{ v.name }}
          </a-button>
        </div>
        <!--关键字搜索、日期选择-->
        <div style="text-align: right;padding-right: 10px;">
          <!-- <span>关键字搜索:</span>
          <a-input-search
            enterButton
            placeholder="请输入关键字"
            size="small"
            class="operate_class"
            :key="codeValue+'0'"
            @change="onTableChange"/>
          <span>日期选择:</span>
          <a-range-picker
            :key="codeValue"
            class="operate_class"
            size="small"
            allowClear
            @change="onDateChange"/> -->
          <a-button type="primary" @click="exportClick">导出</a-button>
        </div>
        <!--具体表格内容选择-->
        <div class="detail_table">
          <div v-if="detailOption.length>0">
            <a-button
              :class="detailChoose===v.key?'hover_detail':'detail_button'"
              v-for="(v,i) in detailOption"
              :key="i"
              size="small"
              @click="chooseDetail(v.key)">
              {{ v.value }}
            </a-button>
          </div>
          <a-table
            style="margin-top: 10px"
            :pagination="pagination"
            :columns="tableLabel"
            :data-source="tableData"
            :scroll="{ x: 1050, y:yHeight }"
            @change="handleTableChange">
            <template
              slot="qualityOperate"
              slot-scope="text, record,index"
            >
              <a @click="showConnect(record)">查看</a>
            </template>
            <template
              v-for="(val,i) in colorLabels"
              :slot="val"
              slot-scope="text, record"
            >
              <template v-for="(value,index) in colorOptions">
                <span
                  v-show="typeof(record[val]) == 'undefined'?false:record[val]===value.value"
                  :key="i+index+value.value"
                  :style="{ color: [record[val]==value.value?value.color:''],width:'100%',height:'100%'}">
                  {{ record[val] }}
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </a-card>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import axios from "axios";
import {Card, Row, Col, Tree, Input, DatePicker, Table, Button} from "@h3/antd-vue";
import CommonHeader from "../../../src/components/shared/header/header.vue";
import * as Type from '../../type';
import env from "@/config/env";
import Utils from "../../utils";

@Component({
  name: "componentOverview",
  components: {
    ACard: Card,
    ARow: Row,
    ACol: Col,
    ATree: Tree,
    AInput: Input,
    AInputSearch: Input.Search,
    ARangePicker: DatePicker.RangePicker,
    ATable: Table,
    AButton: Button,
    CommonHeader
  }
})
export default class componentOverview extends Vue {
  @InjectReactive('project') projectCode?: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  leftwidth: number = 6;
  rightwidth: number = 18;

  //左侧项目树
  treeKey: number = 0;
  replaceFields = {
    key: "id",
    title: "taskName",
  };
  treeData: Array<{ [propsName: string]: string }> = [];
  treeExpandData: Array<any> = [];
  highLightKeys: Array<any> = [];
  SelectedKeys: Array<any> = [];
  projectName: string = '';
  //右侧数据明细
  moduleOption: Array<any> = [
    {
      name: '进度管理',
      code: 'schedule'
    },
    {
      name: '质量管理',
      code: 'quality'
    },
    {
      name: '计量支付',
      code: 'payment'
    }];
  moduleChoose: string = 'schedule';
  detailOption: Array<any> = [];
  detailChoose: string = '';
  searchValue: string = '';
  tableLabel: Array<any> = [    // 表头数据
    {
      title: '序号',
      align: "center",
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      align: "center",
      title: "文件名称",
      key: "fileName",
      dataIndex: "fileName",
    },
    {
      align: "center",
      title: "上传人",
      key: "uploadPerson",
      dataIndex: "uploadPerson",
    },
    {
      align: "center",
      title: "上传日期",
      key: "uploadTime",
      dataIndex: "uploadTime",
    },
    {
      align: "center",
      title: "附件",
      key: "attachmentList",
      dataIndex: "attachmentList",
      scopedSlots: {customRender: "attachmentList"}
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      scopedSlots: {customRender: "操作"}
    },];
  tableData: Array<any> = [];
  pagination = {
    pageSize: 100, //每页中显示50条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["20", "50", "100", "200", "400", "600"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  bimURL: string = `${env.apiHost}`;
  colorOptions: Array<{ value: string, color: string }> = [
    {
      value: '未开工',
      color: '#ee1d24'
    },
    {
      value: '已完工',
      color: '#00a650'
    },
    {
      value: '进行中',
      color: '#00aeef'
    },
    {
      value: '预警',
      color: '#f7941d'
    },
    {
      value: '滞后',
      color: '#fff100'
    },
    {
      value: '未填报',
      color: '#ee1d24'
    },
    {
      value: '审核中',
      color: '#00aeef'
    },
    {
      value: '已归档',
      color: '#00a650'
    },
    {
      value: '未提交',
      color: '#ee1d24'
    },
    {
      value: '流程结束',
      color: '#00a650'
    },
  ];

  //表头
  scheduleLabel: Array<any> = [
    // {
    //   title: '序号',
    //   align: "center",
    //   width: '7%',
    //   customRender: (text, record, index) => `${index + 1}`,
    // },
    {
      title: 'MBS编码',
      align: "center",
      width: '25%',
      dataIndex: 'reportBS',
      key: 'reportBS',
    },
    {
      title: '填报数量',
      align: "center",
      dataIndex: 'reportDetailAmount',
      key: 'reportDetailAmount',
    },
    {
      title: '填报产值',
      align: "center",
      dataIndex: 'reportDetailMoney',
      key: 'reportDetailMoney',
    },
    {
      title: '填报日期',
      align: "center",
      width: "18%",
      dataIndex: 'reportDate',
      key: 'reportDate',
    },
    {
      title: '状态',
      align: "center",
      dataIndex: 'state',
      key: 'state',
      scopedSlots: {customRender: "state"}
    }];
  qualityLabel: Array<any> = [
    {
      title: 'MBS编码',
      align: "center",
      width: '35%',
      dataIndex: 'mbsCode',
      key: 'mbsCode',
    },
    {
      title: '文件名称',
      align: "center",
      dataIndex: 'schemaName',
      key: 'schemaName',
    },
    {
      title: '编制日期',
      align: "center",
      dataIndex: 'time',
      key: 'time',
      width: '18%',
    },
    {
      title: '编制人',
      align: "center",
      dataIndex: 'createrName',
      key: 'createrName',
    },
    {
      title: '当前流程',
      align: "center",
      dataIndex: 'status',
      key: 'status',
      scopedSlots: {customRender: "status"}
    },
    {
      title: '操作',
      align: "center",
      width: '6%',
      dataIndex: 'qualityOperate',
      key: 'qualityOperate',
      scopedSlots: {customRender: "qualityOperate"}
    },
  ];
  measureLabel: Array<any> = [
    {
      title: 'MBS编码',
      align: "center",
      width: '22%',
      dataIndex: 'mbs',
      key: 'mbs',
    },
    {
      title: '施工申报金额',
      align: "center",
      dataIndex: 'sgMoney',
      key: 'sgMoney',
    },
    {
      title: '监理申报金额',
      align: "center",
      dataIndex: 'jlMoney',
      key: 'jlMoney',
    },
    {
      title: '业主申报金额',
      align: "center",
      dataIndex: 'yzMoney',
      key: 'yzMoney',
    },
    {
      title: '填报日期',
      align: "center",
      dataIndex: 'createdTime',
      key: 'createdTime',
    },
    {
      title: '计量周期',
      align: "center",
      dataIndex: 'measurePeriod',
      key: 'measurePeriod',
      width: '8%'
    },
    {
      title: '计量状态',
      align: "center",
      dataIndex: 'measureStatus',
      key: 'measureStatus',
      width: '8%',
      scopedSlots: {customRender: "measureStatus"}
    },
    {
      title: '支付周期',
      align: "center",
      dataIndex: 'paymentPeriod',
      key: 'paymentPeriod',
      width: '8%'
    },
    {
      title: '支付状态',
      align: "center",
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: '8%',
      scopedSlots: {customRender: "paymentStatus"}
    }
  ];
  colorLabels: Array<string> = ['state', 'paymentStatus', 'measureStatus', 'status'];

  endTime: string = '';
  startTime: string = '';
  codeValue: string = '';
  utils: any = Utils;
  yHeight: number = 530;
  bodyStyleLeft: any = {
    'display': 'flex',
    'flex': 1,
    'flexDirection': 'column',
    // 'height': '90%',
  };
  bodyStyleRight: any = {
    'display': 'flex',
    'flex': 1,
    'flexDirection': 'column',
    // 'height': '90%',
  };
  bodyStyleBox: any = {
    'display': 'flex',
    'flex': 1,
    'flexDirection': 'row',
    'height': '97%',
  };

  mounted() {
    this.projectName = this.projectConfig?.projectName as string
    this.initTree();
    let _this = this;
    _this.yHeight = document.documentElement.clientHeight * 0.86 - 290;
    window.onresize = () => {
      return (() => {
        _this.yHeight = document.documentElement.clientHeight * 0.86 - 290;
      })()
    };
    axios.get(this.bimURL + '/api/mbsRelate/getMbsRelateTable', {params: {appCode: this.projectCode}}).then(res=>{
      res.data.forEach(e => {
        this.moduleOption.push(e)
      });
      console.log(this.moduleOption);
    })
  }

  chooseDetail(k) {
    this.detailChoose = k;
  }

  //模块按钮选择事件
  chooseModule(k) {
    this.moduleChoose = k;
    //清空page和size
    this.pagination = {
      pageSize: 100, //每页中显示50条数据
      total: 0,
      current: 1,
      showSizeChanger: true,
      pageSizeOptions: ["20", "50", "100", "200", "400", "600"], //每页中显示的数据
      showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
    };
    this.getTableData()
  }

  getWorkFlowFormDetail(schemaCode, bizObjectId) {
    axios
      .post(this.bimURL + '/api/runtime/form/get_form_url', {
        schemaCode: schemaCode,
        bizObjectId: bizObjectId
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) return res.data as string
      })
      .catch(err => {
        console.log(err);
      });
  }

  getMeasureDetail() {
    this.tableData = [];
    this.tableLabel = this.measureLabel;
    axios
      .post(this.bimURL + '/api/mbsRelate/getMeasureDetail', {
        appCode: this.projectCode,
        end: this.endTime,
        start: this.startTime,
        like: this.searchValue,
        mbsCode: this.codeValue,
        page: this.pagination.current,
        size: this.pagination.pageSize,
        projectName: this.projectName
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode !== 0) return;
        this.tableData = res.data.records;
        this.pagination.total = res.data.total;
        for (let i = 0; i < this.tableData.length; i++) {
          this.$set(this.tableData[i], 'key', this.tableData[i].id);
        }
      })
  }

  getScheduleDetail() {
    this.tableData = [];
    this.tableLabel = this.scheduleLabel;
    axios
      .post(this.bimURL + '/api/mbsRelate/getScheduleDetail', {
        appCode: this.projectCode,
        end: this.endTime,
        start: this.startTime,
        like: this.searchValue,
        mbsCode: this.codeValue,
        page: this.pagination.current,
        size: this.pagination.pageSize,
        projectName: this.projectName
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode !== 0) return;
        this.tableData = res.data.records;
        this.pagination.total = res.data.total;
        for (let i = 0; i < this.tableData.length; i++) {
          this.$set(this.tableData[i], 'key', this.tableData[i].id);
        }
      })
  }

  getQualityDetail() {
    this.tableData = [];
    this.tableLabel = this.qualityLabel;
    axios
      .post(this.bimURL + '/api/mbsRelate/getQualityDetail', {
        appCode: this.projectCode,
        end: this.endTime,
        start: this.startTime,
        like: this.searchValue,
        mbsCode: this.codeValue,
        page: this.pagination.current,
        size: this.pagination.pageSize,
        projectName: this.projectName
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode !== 0) return;
        this.tableData = res.data.records;
        this.pagination.total = res.data.total;
        for (let i = 0; i < this.tableData.length; i++) {
          this.$set(this.tableData[i], 'key', this.tableData[i].id);
        }
      })
  }

  //点击分页中数字时触发的方法
  handleTableChange(pagination) {
    this.pagination.current = pagination.current;
    this.pagination.pageSize = pagination.pageSize;
    this.getTableData()
  }

  //初始化左侧树
  initTree() {
    this.SelectedKeys = [];
    this.treeExpandData = [];
    this.treeData = [];
    //@ts-ignore
    if (this.projectConfig?.projectLevel !== 2) return this.$message.warn('请选择项目');
    axios
      .get(this.bimURL + `/api/code_mbs/top_tree_list_v2`, {
        params: {
          projectCode: this.projectCode,
          projectName: this.projectConfig?.projectName ?? '',
          multiProjectFlag: this.projectConfig?.multiProjectFlag ?? false,
          parentId: '',
          codeType: ''
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode !== 0) return this.$message.warn(res.errmsg)
        let resData = res.data;
        this.SelectedKeys.push(resData[0].id);
        this.codeValue = resData[0].codeValue
        this.getTableData();
        for (let i = 0; i < resData.length; i++) {
          if (resData[i].children === undefined) {
            resData[i].isLeaf = true;
          }
          this.$set(resData[i], "key", resData[i].id);
          this.treeExpandData.push(resData[i].id);
        }
        this.treeData = resData;
        this.treeKey += 1;
        if (this.treeData.length === 0) return this.$message.warn("暂无模型数据");
      })
  }

  //时间选择
  onDateChange(dates, dateStrings) {
    this.endTime = dateStrings[1] === '' ? '' : dateStrings[1] + ' 00:00:00';
    this.startTime = dateStrings[0] === '' ? '' : dateStrings[0] + ' 00:00:00';
    //清空page
    this.pagination.current = 0;
    this.getTableData()
  }

  //左侧树的关键字搜索
  onChange(v) {
    this.treeExpandData = [];
    this.treeData = [];
    const value = v.target.value
    if (value.length == 0) {
      this.initTree();
      this.treeKey += this.treeKey;
    } else {
      axios
        .get(
          this.bimURL + '/api/code_mbs/getByCodeName', {
            params: {
              codeType: "MBS",
              projectCode: this.projectCode,
              projectName: this.projectConfig?.projectName ?? '',
              multiProjectFlag: this.projectConfig?.multiProjectFlag ?? false,
              name: value
            }
          })
        .then(res => {
          this.treeKey += this.treeKey;
          this.treeData = res.data.tree;
          this.highLightKeys = res.data.selectedIds;
          this.treeExpandData = res.data.fatherIds;
        })
    }
  }

  // 树 异步加载
  onLoadData(treeNode) {
    const _this = this;
    return new Promise(resolve => {
      if (treeNode.dataRef.children?.length > 0) { // 有值了直接渲染
        //@ts-ignore
        resolve();
        return;
      }
      axios
        .get(this.bimURL + "/api/code_mbs/child_tree_list_v2", {
          params: {
            projectCode: this.projectCode,
            projectName: treeNode.$vnode.data.props.projectName,
            multiProjectFlag: this.projectConfig?.multiProjectFlag ?? false,
            id: treeNode.$vnode.data.key,
            codeType: "MBS"
          }
        })
        .then(res => {
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].children == undefined) {
              res.data[i].isLeaf = true;
            }
          }
          treeNode.dataRef.children = res.data;
          _this.treeData = [..._this.treeData];
        });
      //@ts-ignore
      resolve();
    });
  }

  // 树-选择
  onSelect(selectedKeys, e) {
    if(selectedKeys.length == 0) return this.tableData = [];this.codeValue =""
    this.SelectedKeys = []
    this.SelectedKeys.push(e.node.dataRef.id);
    this.codeValue = e.node.dataRef.codeValue;
    //初始化进度模块
    this.detailChoose = '';
    this.detailOption = [];
    this.searchValue = '';
    this.startTime = '';
    this.endTime = '';
    this.getTableData();
  }

  //右侧表格关键字搜索
  onTableChange(e) {
    this.searchValue = e.target.value;
    //清空page
    this.pagination.current = 0;
    this.getTableData()
  }

  async showConnect(record) {
    const {schemaCode, dataId, workFlowCode, mbsCode} = record;
    const {projectCode, projectName} = this;
    const urlProjectCode = projectCode;
    const urlProjectName = projectName;
    const urlAction = dataId ? 'detail' : 'add';
    let urlReturn:string = '';
    if(this.isDingTalk) {
      const projectLength:number = window.config.project.length;
      const pathName = location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
      urlReturn = `${pathName}?code=${schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`;
    }else{
      urlReturn = `${location.pathname}?code=${schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`
    }
    // const urlReturn = `/${urlProjectCode}/QualityDB?code=${schemaCode}&openMode&pcUrl&queryCode=&iframeAction=${urlAction}`;
    let url = `/form/detail?schemaCode=${schemaCode}&sheetCode=${schemaCode}&queryCode=${schemaCode}&mbsCode=${mbsCode}&projectName=${urlProjectName}`;
    let urlDetail = `/form/detail?sheetCode=${schemaCode}&objectId=${dataId}&schemaCode=${schemaCode}&isWorkFlow=false&return=${encodeURIComponent(urlReturn)}`;
    if (workFlowCode) {
      url += `&startWorkflowCode=${workFlowCode}&return=${encodeURIComponent(urlReturn)}`;
      const target = await this.getWorkFlowFormDetail(schemaCode, dataId);
      urlDetail = `${target}`;
    } else {
      url += `&return=${encodeURIComponent(urlReturn)}`;
    }
    if(this.isDingTalk) {
      urlAction === 'add' ? this.$router.push(url) : this.$router.push(urlDetail)
    }else {
      window.open(urlAction === 'add' ? `/${urlProjectCode}${url}` : `/${urlProjectCode}${urlDetail}`);
    }
  }

  toprev() {
    //@ts-ignore
    this.$router.go(-1);
  }

  exportClick() {
    if(this.codeValue && this.moduleChoose) {
      if(this.moduleChoose == 'schedule' || this.moduleChoose == 'quality' || this.moduleChoose == 'payment') {
        window.open(this.bimURL +`/api/mbsRelate/exportSQMData?appCode=${ this.projectCode }&mbsCode=${ this.codeValue }&module=${ this.moduleChoose }&projectName=${encodeURIComponent(`${this.projectConfig?.projectName }`)}`)
      }else {
        window.open(this.bimURL +`/api/mbsRelate/exportMbsRelateTableData?appCode=${ this.projectCode }&mbsCode=${ this.codeValue }&schemaCode=${ this.moduleChoose }&projectName=${encodeURIComponent(`${this.projectConfig?.projectName }`)}`)
      }
    }
  }

  getTableData() {
    if (this.moduleChoose == 'schedule') return this.getScheduleDetail();
    if (this.moduleChoose == 'quality') return this.getQualityDetail();
    if (this.moduleChoose == 'payment') return this.getMeasureDetail();
    axios.get(this.bimURL + `/api/app/query/get`, {
      params: {
        schemaCode: this.moduleChoose,
        code: this.moduleChoose,
        source: 1
      }
    })
    .then(res => {
      //@ts-ignore
      if (res.errcode == 0) {
        const resColumn = res.data.queryColumns;
        this.tableLabel = []
        for (let i = 0; i < resColumn.length; i++) {
          this.tableLabel.push({
            align: "center",
            ellipsis: true,
            title: resColumn[i].name,
            dataIndex: resColumn[i].propertyCode,
            key: resColumn[i].propertyCode,
          })
        }
        this.tableData = []
        axios.post(this.bimURL + `/api/mbsRelate/getMbsRelateTableData`, {
            appCode: this.projectCode,
            mbsCode: this.codeValue,
            projectName: this.projectName,
            schemaCode: this.moduleChoose,
        }).then(resData=>{
          const temptData = resData.data;
          for (let i = 0; i < temptData.length; i++) {
            this.$set(temptData[i].data, 'key', temptData[i].data.id)
            this.tableData.push(temptData[i].data);
          }
        })
      }
    })
  }
}
</script>

<style lang="less" scoped>
@import (reference) "../../styles/theme.less";

.toprev {
  position: absolute;
  top: 1.7%;
  left: 0.1%;
  z-index: 9;
  cursor: pointer;
  font-size: 19px;
}

.main {
  .flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.main {
  /deep/.ant-table-thead > tr > th {
    background: rgba(171, 208, 254, 0.5);
  }
}

.box {
  height: 100%;
  width: 100%;

  .left {
    width: 24.5%;
    height: 98%;
    .tree{
      overflow: auto;
      height:  calc(85vh - 165px);
    }
  }

  .right {
    margin-left: 0.5%;
    width: 75%;
    height: 98%;
  }

  .operate_class {
    margin: 0 20px 0 10px;
    width: 250px
  }

  .modules_button {
    margin: 0 1vw 0.4vw 0;
  }

  .hover_modules {
    margin: 0 1vw 0.4vw 0;
    color: #FFFFFF;
    background-color: #5291ff;
  }

  .detail_table {
    margin: 0.4vw 0 0 0;
    //border: 1px solid #d9d9d9;
    height: 97%;
    .flex;
    flex: 1;
    flex-direction: column;

    .detail_button {
      margin: 0.4vw 0 0.4vw 0.4vw;
      border-radius: 0;
    }

    .hover_detail {
      margin: 0.4vw 0 0.4vw 0.4vw;
      border-radius: 0;
      color: #5291ff;
      border: 1px solid #5291ff;
      font-weight: bolder;
    }
  }

}

/deep/ .ant-table {
  .flex;
  flex: 1;
  flex-direction: column;
  height: calc(85vh - 240px);
}
/* 表格斑马样式 **/
/deep/.ant-table-tbody tr:nth-child(2n) {
  background-color:#fafafa;
}
</style>


