<template>
  <div class="main">
    <div class="navTitle">
      <img
        @click="(e) => {this.$router.go(-1)}"
        src="../../icon.png"
        style="cursor: pointer"
        alt="">
      <span class="titleName" @click="(e) => {this.$router.go(-1)}">纠偏详细信息</span>
    </div>
    <!--  模型页面，可参照此页面基本结构 -->
    <a-card class="box">
      <a-button
        type="primary"
        @click="saveDetail()"
        style="float: right"
        v-show="!isOnlyDetail">保存
      </a-button>
      <span class="title">基本信息</span>
      <div class="formContainer">
        <a-row type="flex" justify="start">
          <a-col :span="5">
            <span>部位名称:{{ formData.planDetailName }}</span>
          </a-col>
          <a-col :span="5">
            <span>父级名称:{{ formData.parentPlanDetailName }}</span>
          </a-col>
          <a-col :span="5">
            <span>单位:{{ formData.planDetailUnit }}</span>
          </a-col>
          <a-col :span="5">
            <span>综合单价:{{ formData.planDetailUnitPrice }}</span>
          </a-col>
        </a-row>
        <a-row type="flex" justify="start">
          <a-col :span="5">
            <span>计划数量:{{ formData.planDetailAmount }}</span>
          </a-col>
          <a-col :span="5">
            <span>计划产值:{{ formData.planDetailMoney }}</span>
          </a-col>
          <a-col :span="5">
            <span>计划工期:{{ formData.planDetailPeriod }}</span>
          </a-col>
          <a-col :span="5">
            <span>计划开始时间:{{ formData.planDetailStart }}</span>
          </a-col>
          <a-col :span="4">
            <span>计划结束时间:{{ formData.planDetailEnd }}</span>
          </a-col>
        </a-row>
        <a-row type="flex" justify="start">
          <a-col :span="5">
            <span>完成数量:{{ formData.reportDetailAmount }}</span>
          </a-col>
          <a-col :span="5">
            <span>完成产值:{{ formData.reportDetailMoney }} 元</span>
          </a-col>
          <a-col :span="5">
            <span>实际开始时间:{{ formData.reportStart }}</span>
          </a-col>
          <a-col :span="5">
            <span>实际结束时间:{{ formData.reportEnd }}</span>
          </a-col>
          <a-col :span="4">
            <span :style="{color:(formData.progressState=='预警'||formData.progressState=='滞后'?'red':'')}">当前状态:{{
              formData.progressState
            }}</span>
          </a-col>
        </a-row>
      </div>

      <span class="title">纠偏报告</span>
      <div class="tableContainer">
        <a-row type="flex" justify="start">
          <a-col :span="8">
            <span>纠 偏 人 :  </span>
            <a-input
              ref="userNameInput"
              v-model="creater"
              placeholder="请输入纠偏人！"
              disabled
              style="width: 150px">
            </a-input>
          </a-col>
          <a-col :span="8">
            <span>纠偏日期 : </span>
            <a-date-picker
              v-model="formData.deviationDate"
              @change="onChange(record.key, item, $event)"
              :disabled="isOnlyDetail"/>
          </a-col>
        </a-row>
        <a-row type="flex" justify="start">
          <a-col :span="16">
            <span>纠偏内容:  </span>
            <a-textarea
              placeholder="请输入纠偏内容！"
              v-model="formData.deviationContent"
              :disabled="isOnlyDetail"
              style="width: 760px;height:100px">
            </a-textarea>
          </a-col>
        </a-row>
        <a-row type="flex" justify="start">
          <a-col :span="24">
            <span>附件上传:  </span>
            <a-upload
              name="file"
              :action="action"
              :headers="headers"
              :showUploadList="false"
              @change="importChange"
            >
              <a-button type="primary" :disabled="isOnlyDetail">选择附件</a-button>
            </a-upload>
          </a-col>
        </a-row>
        <a-row type="flex" justify="end">
          <a-col :span="23">
            <a-table
              :columns="tableLabel"
              :data-source="tableData"
              rowKey="refId"
              style="height:300px;width: 95%;margin-left: 15px"
              :scroll="{ x: 1200, y: 240 }"
            >
              <template slot="操作" slot-scope="record">
                <a @click="doAct(record,'预览')" :disabled="isSave">预览</a>|
                <a @click="doAct(record,'下载')" :disabled="isSave">下载</a>
              </template>
            </a-table>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Prop, Vue} from "vue-property-decorator";
import {Card, Col, Row, Button, Input, DatePicker, Upload, Table} from "@h3/antd-vue";
import OAuthApi from "@/apis/oauth";
import * as Type from '../../type';
import moment from 'moment';
import env from "@/config/env";

@Component({
  name: "scheduleDeviationDetail",
  components: {
    ACol: Col,
    ARow: Row,
    ACard: Card,
    ATable: Table,
    AUpload: Upload,
    AInput: Input,
    Atextarea: Input.TextArea,
    AButton: Button,
    ADatePicker: DatePicker,
  }
})
export default class scheduleDeviationDetail extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  // @Prop() formData!: any;
  formData: any = {};
  creater: string = '';
  action = `${env.apiHost}/api/aliyun/upload`;
  headers = {Authorization: 'Bearer ' + localStorage.token};
  tableLabel: Array<any> = [
    {
      title: '序号',
      align: "center",
      width: 100,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      align: "center",
      title: "文件名",
      key: "name",
      dataIndex: "name",
    },
    {
      align: "center",
      title: "上传时间",
      key: "createdTime",
      dataIndex: "createdTime",
      scopedSlots: {customRender: "createdTime"}
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      scopedSlots: {customRender: "操作"}
    },
  ];
  tableData: Array<any> = [];
  constTable: Array<any> = [];
  isSave: boolean = false;
  isOnlyDetail: boolean = false;//查看状态不能编辑


  mounted() {
    this.formData = this.$route.query.data;
    this.isOnlyDetail = false;
    if (this.$route.query.type === 'add') {
      this.creater = localStorage.user_name;
      this.$set(this.formData, 'deviationContent', '');
      this.$set(this.formData, 'deviationDate', this.momentDateStr(this.getCurrentData()));
    } else {
      this.creater = this.formData.creater;
      this.constTable = this.formData.attachmentModelList;
      var _this = this;
      _this.constTable.forEach(function (value) {
        _this.tableData.push(value)
      });
      if (this.$route.query.type === 'detail') return this.isOnlyDetail = true;
    }
    console.log('this.formData ', this.formData)
    // if (!this.formData.deviationContent) this.$set(this.formData, 'deviationContent', '')
    // if (!this.formData.deviationDate) this.$set(this.formData, 'deviationDate', this.momentDateStr(this.getCurrentData()))
  }

  saveDetail() {
    if (this.$route.query.type === 'add') {
      let params: any = {
        projectCode: this.projectCode,
        projectName: this.projectConfig?.projectName ?? '',
        scheduleDeviationdetail: {
          attachmentModelList: [],
        },
        // userId: localStorage.user_id ?? ''
      }
      params.scheduleDeviationdetail.attachmentModelList = this.tableData;
      this.formData.deviationDate = moment(this.formData.deviationDate).format('YYYY-MM-DD');
      params.scheduleDeviationdetail = Object.assign(this.formData, params.scheduleDeviationdetail);
      console.log('addDeviationDetail输入参数====>', params)
      OAuthApi.addDeviationDetail(params).then(res => {
        if (res.errcode === 0) {
          this.$message.success('保存成功');
          this.isSave = true;
          this.$router.go(-1);
        } else {
          return this.$message.warn('保存失败')
        }
      })
    } else {
      let params: any = {
        projectCode: this.projectCode,
        projectName: this.projectConfig?.projectName ?? '',
        scheduleDeviationdetail: this.formData
      }
      params.scheduleDeviationdetail.attachmentModelList = this.tableData;
      this.formData.deviationDate = moment(this.formData.deviationDate).format('YYYY-MM-DD');
      console.log('updateDeviationDetail输入参数====>', params)
      OAuthApi.updateDeviationDetail(params).then(res => {
        if (res.errcode === 0) {
          this.$message.success('保存成功');
          this.isSave = true;
        } else {
          return this.$message.warn('保存失败')
        }
      })
    }

  }

  onChange(key, dataIndex, value) {
    console.log(value.format("YYYY-MM-DD"))
  }

  // 将时间字符串 转换 为 Moment
  momentDateStr(dateStr) {
    return moment(dateStr);
  }

  getCurrentData() {
    return new Date().toLocaleDateString();
  }

  importChange(info) {
    console.log(info.fileList, 'info.file.response');
    const _this = this;
    _this.tableData = [];
    _this.constTable.forEach(function (value) {
      _this.tableData.push(value)
    });
    if (info.file.status === 'uploading') {
    } else if (info.file.status === 'done') {
      if (info.file.response.errcode !== 0) {
        //@ts-ignore
        _this.$message.error(`${info.file.response.errmsg} ,导入失败.`);
      } else {
        info.fileList.forEach(function (v) {
          _this.tableData.push(v.response.data);
        });
        console.log(_this.tableData, '_this.tableData')
      }
    } else if (info.file.status === 'error') {
      //@ts-ignore
      _this.$message.error(`${info.file.name} 导入失败.`);
    } else {
      //@ts-ignore
      _this.$message.error("导入异常")
    }
  }

  doAct(record, type) {
    const token = localStorage.getItem('token')
    const downloadUrl = `${env.apiHost}/api/aliyun/download?refId=` + record.refId;
    if (type === '下载') return window.open(downloadUrl);
    return window.open("https://cloudpivotkkfileview.wisdombim.com.cn/onlinePreview" + "?url=" + downloadUrl + "=name=" + record.name)
  }
}
</script>

<style lang="less" scoped>
@import (reference) "../../styles/theme.less";

.main {
  .flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .titleName {
    font-size: 14px;
    font-family: Source Han Sans CN, serif;
    font-weight: 400;
    color: #0A0A0A;
    cursor:pointer;
  }

  .box {
    height: calc(100% - 40px);
    width: 100%;

    .title {
      font-size: 19px;
      line-height: 30px;
      font-weight: 500;
      margin-left: 16px;
      color: #004898;
      margin-bottom: -15px;
    }

    .formContainer {
      margin: 8px;
      background-color: #f2f2f2;

      span:nth-child(n+1) {
        font-size: 17px;
        line-height: 50px;
        font-weight: 500;
        margin-left: 8px;
        color: #004898;
      }
    }

    .tableContainer {
      margin: 8px;
      background-color: #f2f2f2;
      height: 540px;

      span:nth-child(n+1) {
        font-size: 17px;
        line-height: 50px;
        font-weight: 500;
        margin-left: 8px;
        color: #004898;
      }

      /deep/ .ant-table {
        height: 290px;
      }
    }
  }

}

</style>
