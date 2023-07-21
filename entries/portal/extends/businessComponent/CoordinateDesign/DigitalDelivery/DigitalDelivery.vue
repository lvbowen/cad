<template>
  <div class="digital-delivery">
    <p class="title">数字交付</p>
    <div class="header">
      <div class="left-choose">
        <div :class="leftChoose==='全部'?'hover-left-choose':''" @click="changeLeftChoose('全部')">
          全部
        </div>
        <div
          :class="leftChoose!=='全部'?'hover-left-choose':''"
          @click="changeLeftChoose('我分享的')">
          我分享的
        </div>
      </div>
    </div>
    <div class="table-list">
      <div class="operation-group">
        <a-button type="primary" @click="openModal">新增</a-button>
        <a-input-search
          placeholder="请输入项目名！"
          style="width: 300px;margin-left: 10px"
          enterButton
          @search="onSearch"/>
      </div>
      <a-table
        class="table-container"
        bordered
        size="small"
        rowKey="id"
        :columns="tableColunms"
        :data-source="tableData"
      >
        <template v-slot:operation="record">
          <a-popconfirm @confirm="deleteList(record)" title="删除后不可恢复哦，确认删除吗？">
            <a style="color: #fc5454">删除</a>
          </a-popconfirm>
        </template>
        <template v-slot:url="record">
          <span v-if="!record.url" style="color:#9f9f9f">暂无链接</span>
          <a-tooltip v-else>
            <template slot="title">
              {{ record.url }}
            </template>
            <a class="url-item" @click="openUrl(record)">{{ record.url.slice(0, 30) }}...</a>
          </a-tooltip>
        </template>
      </a-table>
    </div>
    <a-modal
      title="新增数字交付"
      :visible="isAdd"
      @cancel="cancelAdd"
      @ok="addList"
      width="1000px"
    >
      <div class="modal-container">
        <div class="modal-title">
          <img :src="titleLeft" alt="">
          <span>基本信息</span>
        </div>
        <div class="info-container">
          <div class="info-item">
            <div>项目名称</div>
            <a-select
              v-if="groupAll.length!==0"
              :defaultValue="projectChoose.id"
              style="width: 276.33px"
              @change="changeGroup">
              <a-select-option
                :value="v.id"
                v-for="(v,i) in groupAll"
                :key="i"
                :title="v.engineeringName">{{
                  v.engineeringName
                }}
              </a-select-option>
            </a-select>
          </div>
          <div class="info-item">
            <div>创建人</div>
            <a-input :defaultValue="userName" style="width: 300px" disabled></a-input>
          </div>
          <div class="info-item">
            <div>创建时间</div>
            <a-input :defaultValue="today" style="width: 300px" disabled></a-input>
          </div>
        </div>
        <div class="modal-title">
          <img :src="titleLeft" alt="">
          <span>规则设置</span>
        </div>
        <div class="info-container">
          <div class="info-item" style="width: 700px">
            <div>生效设置</div>
            <a-radio-group
              name="effectiveFlag"
              :defaultValue="effectiveFlagChoose"
              style="width: 500px"
              @change="effectiveFlagChange">
              <a-radio value="无限制">无限制</a-radio>
              <a-radio value="规定日期内生效">规定日期内生效</a-radio>
            </a-radio-group>
          </div>
          <div class="info-item" v-if="effectiveFlagChoose!=='无限制'">
            <div>生效日期</div>
            <a-date-picker
              style="width:300px"
              placeholder="请选择日期"
              :allowClear="false"
              :defaultValue="selectDataValue1"
              @change="onDateChange1"/>
          </div>
          <div class="info-item" v-if="effectiveFlagChoose!=='无限制'">
            <div>失效日期</div>
            <a-date-picker
              :key="selectDataValue2"
              style="width:300px"
              placeholder="请选择日期"
              :allowClear="false"
              :defaultValue="selectDataValue2"
              :disabledDate="rangeStartPicker"
              @change="onDateChange2"/>
          </div>
          <div class="info-item" style="width: 700px">
            <div>登录设置</div>
            <a-radio-group
              name="loginFlag"
              :defaultValue="loginFlagChoose"
              style="width: 500px"
              @change="loginFlagChange">
              <a-radio value="无限制">无限制</a-radio>
              <a-radio value="指定账号登录">指定账号登录</a-radio>
            </a-radio-group>
          </div>
          <div class="info-item" v-if="loginFlagChoose!=='无限制'">
            <div>用户账号</div>
            <a-input
              :key="userAccount"
              :defaultValue="userAccount"
              style="width: 300px"
              @change="userAccountChange"></a-input>
          </div>
          <div class="info-item" v-if="loginFlagChoose!=='无限制'" style="width: 500px">
            <div>用户密码</div>
            <a-input-password
              v-model="passWord"
              style="width:276.5px;margin-left: -6.3px;"
              placeholder="8-15个字符,支持英文、数字、半角字符"
              autocomplete="new-password"
              @change="passWordChange"
            />
            <a-button style="margin-left: 10px" type="danger" @click="randomPassword(8)">一键生成</a-button>
          </div>
        </div>
        <div class="modal-title">
          <img :src="titleLeft" alt="">
          <span>成果设置</span>
        </div>
        <div class="info-container">
          <div class="info-item">
            <a-input-search
              size="small"
              placeholder="请输入成果名"
              style="width: 300px;margin-right: 10px"
              enterButton

              @search="modalSearch"
            />
          </div>
        </div>
        <a-table
          class="table-container"
          style="margin:0 20px"
          bordered
          size="small"
          rowKey="id"
          :columns="modalColunms"
          :loading="loading"
          :data-source="modalData"
          :rowSelection="{
            selectedRowKeys: selectedRowKeys,
            onChange: onChange
          }">
          <template v-slot:attachment="record">
            {{ record.attachment.name }}
            <!--            <span v-for="(v,i) in record.attachment" :key="i">{{ v.name }};</span>-->
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import Dropdown from "ant-design-vue/lib/dropdown";
import "ant-design-vue/lib/dropdown/style/index.css";
import Input from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Tooltip from "ant-design-vue/lib/tooltip";
import "ant-design-vue/lib/tooltip/style/index.css";
import Radio from "ant-design-vue/lib/radio";
import "ant-design-vue/lib/radio/style/index.css";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import moment from 'moment';

import * as Api from "../../../service/api";

import titleLeft
  from '../../../../src/assets/extends/CoordinateDesign/ProductionTaskList/title-left.png'

@Component({
  name: "DigitalDelivery",
  components: {
    AButton: Button, ADropdown: Dropdown, AInput: Input, AInputSearch: Input.Search, ATable: Table,
    AModal: Modal, ATooltip: Tooltip, ARadio: Radio, ARadioGroup: Radio.Group, ASelect: Select,
    ASelectOption: Select.Option, ADatePicker:DatePicker,AInputPassword:Input.Password,
    APopconfirm: Popconfirm
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode?: string;

  leftChoose: string = '全部';
  tableData: Array<any> = [];
  tableColunms: Array<any> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      //@ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '项目/文件名称',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '创建人',
      dataIndex: 'operatorName',
      key: 'operatorName',
    },
    {
      title: '成果数量',
      dataIndex: 'achievementAmount',
      key: 'achievementAmount',
    },
    {
      title: '生效时间',
      dataIndex: 'effectiveTime',
      key: 'effectiveTime',
    },
    {
      title: '失效时间',
      dataIndex: 'expiredTime',
      key: 'expiredTime',
    },
    {
      title: '账号',
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: '密码',
      dataIndex: 'password',
      key: 'password',
    },
    {
      title: '网址链接',
      key: 'url',
      width: 250,
      scopedSlots: {customRender: 'url'},
    },
    {
      title: '操作',
      key: 'operation',
      width: 80,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  modalData: Array<any> = [];
  loading: boolean = false;
  modalColunms: Array<any> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      //@ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '成果名称',
      key: 'attachment',
      scopedSlots: {customRender: 'attachment'},
    },
    {
      title: '成果版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
    },
    {
      title: '设计人',
      dataIndex: 'designerName',
      key: 'designerName',
      width: 100,
    },
    {
      title: '所属专业任务',
      dataIndex: 'professionName',
      key: 'professionName',
      width: 120,
    },
    {
      title: '所属设计任务',
      dataIndex: 'professionTaskName',
      key: 'professionTaskName',
      // width: 110,
    },
  ];
  selectedRowKeys: string[] = [];
  selectedRow: any[] = [];
  isAdd: boolean = false;
  titleLeft: HTMLImageElement = titleLeft;
  groupAll: Array<{ id: string, engineeringName: string }> = [];
  projectChoose: { id: string, engineeringName: string } = {id: '', engineeringName: ''}
  userName: string = 'admin';
  today: string = '2022-10-19';
  effectiveFlagChoose: string = '无限制';
  loginFlagChoose:string = '无限制';

  selectDataValue1= moment().format("YYYY-MM-DD");
  selectDataValue2= moment().format("YYYY-MM-DD");

  userAccount:string='';
  passWord:string = '';

  mounted() {
    //@ts-ignore
    this.userName = JSON.parse(sessionStorage.getItem("user")).name ?? '';
    this.getTime();
    this.getDigitalDeliveryByProject();
  }

  addList() {
    if (this.selectedRow.length === 0) return this.$message.warn('未选择成果文件！');
    if (this.selectedRow.length > 1) return this.$message.warn('目前仅支持选择一个成果文件！');
    Api.addDigitalDelivery({
      //@ts-ignore
      operator: JSON.parse(sessionStorage.getItem("user")).id ?? "",
      operatorName: this.userName,
      projectName: this.projectChoose.engineeringName,
      projectId: this.projectChoose.id,
      account: this.userAccount,
      password: this.passWord,
      loginFlag: this.loginFlagChoose,
      effectiveFlag: this.effectiveFlagChoose,
      achievementAmount: '1',
      effectiveTime: this.selectDataValue1,
      expiredTime: this.selectDataValue2,
      designFileId: this.selectedRow[0].attachment.id
    }).then(res => {
      if (res.errcode === 0) {
        this.$message.success('新增成功！')
        this.selectedRowKeys = [];
        this.selectedRow = [];
        this.isAdd = false;
        this.modalData = [];
        this.getDigitalDeliveryByProject()
      } else {
        this.$message.warn('新增失败！')
      }
    })
  }

  cancelAdd() {
    this.isAdd = false;
    this.groupAll = [];
  }

  changeGroup(v, info) {
    this.groupAll.forEach(item => {
      if (item.id === v) {
        this.projectChoose = item;
      }
    })
    this.getAchievementsByProjectId(this.projectChoose)
  }

  changeLeftChoose(v) {
    this.leftChoose = v;
    if (v === '全部') {
      this.getDigitalDeliveryByProject()
    } else {
      const tempt: any[] = []
      this.tableData.forEach(item => {
        if (item.operatorName == this.userName) {
          tempt.push(item)
        }
      })
      this.tableData = tempt;
    }
  }

  deleteList(v) {
    Api.deleteDigitalDeliveryById({
      id: v.id
    }).then(res => {
      if (res.errcode === 0 && res.data) {
        this.$message.success('删除成功')
        this.getDigitalDeliveryByProject();
      } else {
        this.$message.warn('删除失败')
      }
    })
  }

  effectiveFlagChange(v) {
    this.effectiveFlagChoose = v.target.value;
  }

  loginFlagChange(v){
    this.loginFlagChoose = v.target.value;
  }

  getAchievementsByProjectId(v, keyWords?: string) {
    this.loading = true
    Api.getAchievementsByProjectId({
      appCode: this.projectCode ?? '',
      projectId: v.id as string ?? '',
      achievementName: keyWords ?? null
    }).then(res => {
      if (res.errcode === 0) {
        this.modalData = res.data;
      }
    }).finally(()=> {
      this.loading = false
    })
  }

  getDigitalDeliveryByProject(v?: string) {
    Api.getDigitalDeliveryByProject({
      projectName: v ?? null,
      appCode: this.projectCode ?? 'XTSJ'
    }).then(res => {
      if (res.errcode === 0) {
        this.tableData = res.data;
      }
    })
  }

  getTime() {
    const date = new Date();
    const year = date.getFullYear();    //  返回的是年份
    const month = date.getMonth() + 1;  //  返回的月份上个月的月份，记得+1才是当月
    const dates = date.getDate();       //  返回的是几号
    this.today = year + "-" + month + "-" + dates;
  }

  modalSearch(v) {
    this.getAchievementsByProjectId(this.projectChoose, v);
  }

  onChange(selectedRowKeys, info) {
    this.selectedRowKeys = selectedRowKeys;
    this.selectedRow = info;
  }

  onDateChange1(date: moment.Moment | string, dateString: string){
    this.selectDataValue1=dateString;
    console.log('2222222222',moment(this.selectDataValue2).valueOf() < moment(this.selectDataValue1).valueOf())
    if(moment(this.selectDataValue2).valueOf() < moment(this.selectDataValue1).valueOf()){
      this.selectDataValue2=dateString;
    }
  }

  onDateChange2(date: moment.Moment | string, dateString: string){
    this.selectDataValue2=dateString;
  }

  onSearch(v) {
    this.getDigitalDeliveryByProject(v)
  }

  openModal() {
    this.isAdd = true;
    Api.getProjectDropBox({
      appCode: this.projectCode ?? '',
      lotus: false,
      hasModel: true
    }).then(res => {
      if (res.errcode === 0) {
        this.groupAll = res.data;
        this.projectChoose = this.groupAll[0];
        this.getAchievementsByProjectId(this.projectChoose)
      }
    })
  }

  openUrl(v) {
    window.open(v.url)
  }

  passWordChange(v){
    console.log('passWordChange',v.target.value)
    this.passWord = v.target.value;
  }

  randomPassword(size){
    const seed = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','m','n','p','Q','r','s','t','u','v','w','x','y','z','2','3','4','5','6','7','8','9'];// 密码源数组
    let n='';
    for(let i=0;i<size;i++){
     const t=Math.round(Math.random()*(seed.length-1));
      n+=seed[t];
    }
    this.userAccount='user'
    return this.passWord = n;
  }

  rangeStartPicker(val: moment.Moment ) {
    return moment(val).valueOf() < moment(this.selectDataValue1).valueOf();
  }

  userAccountChange(v){
    console.log('userAccountChange',v.target.value)
    this.userAccount = v.target.value;
  }
}
</script>

<style lang="less" scoped>
@import "../../../styles/public.module.less";

.digital-delivery {
  .flex-column;
  width: 1708px;
  height: 100%;
  margin: 0 auto;

  .title {
    margin-bottom: 10px;
    width: 72px;
    font-size: 18px;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 48px;
  }

  .header {
    .flex-space-between;
    height: 34px;

    .left-choose {
      .flex-space-between;
      font-size: 14px;
      line-height: 34px;
      color: #ffffff;
      height: 36px;
      width: 250px;

      & > div {
        width: 123px;
        height: 34px;
        border: 1px solid rgba(241, 245, 249, 0.18);
        background: #00499C;
        text-align: center;
      }

      .hover-left-choose {
        width: 123px;
        height: 34px;
        border: 0px solid #F1F5F9;
        background: #2984FF;
        text-align: center;
      }
    }
  }

  .table-list {
    margin-top: 10px;
    background: white;
    height: 100%;

    .operation-group {
      margin: 10px 2%;
      height: 40px;
    }

    .table-container {
      width: 96%;
      margin: 0 auto;

      .url-item {

      }
    }
  }

  /*Table style*/

  /deep/ .ant-table {
    .ant-table-thead {
      background-color: #f8fbff;

      & > tr > th {
        position: relative;
        font-weight: 700;
        border-right: 0 !important;

        &:not(:last-child):after {
          position: absolute;
          top: 50%;
          right: 0;
          height: 52%;
          width: 1px;
          transform: translateY(-50%);
          content: "";
          border-right: 1px solid #bcbcbc;
        }
      }
    }

    .ant-table-body {
      // overflow-y: auto!important;
      margin: 0;
      // &>tr>td{
      //   border-right: 0!important;
      // }
    }

    .ant-table-header {
      min-height: auto;
    }

    .ant-table-hide-scrollbar {
      margin-bottom: 0 !important;
      padding: 0 !important;
      // overflow: hidden !important;
    }

    .evenRow {
      background-color: #F8F9FE;
    }

    .oddRow {
      background-color: #fff;
    }
  }
}

.modal-container {
  .flex-column;

  .modal-title {
    .flex;
    margin-bottom: 5px;
    height: 20px;

    & > span {
      margin-left: 5px;
      font-size: 16px;
      line-height: 20px;
    }
  }

  .info-container {
    .flex-wrap;

    .info-item {
      .flex;
      .flex-center-align;
      width: 350px;
      height: 30px;
      margin: 8px 20px;

      & > div {
        width: 80px;
      }
    }
  }

}
</style>
