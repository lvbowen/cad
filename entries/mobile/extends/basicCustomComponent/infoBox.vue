<template>
  <article class="main">
    <div class="father_tab">
      <a-tabs @change="pressFather">
        <a-tab-pane
          v-for="(item) in fatherButtonData"
          :key="item.id"
          :tab="item.buttonName">
          <div class="sub_collapse">
            <div v-for="(item) in subButtonData" :key="item.id" style="clear: both;">
              <div style="height: 2vw">
                <img
                  :src="titleQQ"
                  class="img_left"
                  @click="pressSubButton(item)"/>
                <p class="font_mid" @click="pressSubButton(item)">{{ item.buttonName }}</p>
                <img
                  v-if="!collapseClose&&markId==item.id"
                  :src="icon_arr1"
                  class="img_right"
                  @click="pressSubButton(item)"/>
                <img
                  v-else
                  :src="icon_arr1"
                  class="img_right_close"
                  @click="pressSubButton(item)"/>
                <!--                <img :src="lineIcon" class="img_bottom"/>-->
              </div>
              <div
                :style="[{'height':(30-subButtonData.length*3)+'vh'},{'overflow': 'auto'},{'clear': 'both'},{'marginTop': '-3vh'}]"
                v-if="Object.keys(verticalData).length!=0&&tabShow&&!collapseClose&&markId==item.id">
                <div v-for="(value,key,index) in verticalData" :key="key">
                  <div class="table_title" @click="closeTable(key)">
                    <p class="table_p">
                      <img
                        v-if="closeTableID.indexOf(key) == -1"
                        style="cursor: pointer;"
                        :src="icon_arr1"
                      />
                      <img
                        v-else
                        :src="icon_arr1"
                        class="table_img_close"
                      />{{ key }}</p></div>
                  <a-table
                    v-if="closeTableID.indexOf(key) == -1"
                    :key="index"
                    class="devOps_table"
                    :pagination="false"
                    :columns="value.columns"
                    :data-source="value.data"
                  >
                    <template
                      slot="msg"
                      slot-scope="text, record"
                    >
                      <a v-if="record.property&&record.msg!=='查看/编辑'" @click="toUrl(record)" class="underline">
                        <img
                          :src="fileIcon"
                          style="width: 18px;height:17px;"
                        />{{ "\xa0" + "." + "\xa0" + record.msg }}</a>
                      <a v-else-if="record.property&&record.msg==='查看/编辑'" @click="toUrl(record)">
                        {{ record.msg }}</a>
                      <div
                        v-else-if="record.color"
                        :key="index"
                        :style="{ background: [record.color],width:'100%',height:'100%'}">
                        {{ record.msg }}
                      </div>
                      <p v-else>{{ record.msg }}</p>
                    </template>
                    <template
                      slot="name"
                      slot-scope="text, record"
                    >
                      <p style="color: #0BCDA3">{{ record.name }}</p>
                    </template>
                  </a-table>
                </div>
              </div>
              <p
                style="text-align: center;color: #FFFFFF;font-size: 2.8vw"
                v-if="Object.keys(verticalData).length==0&&tabShow&&!collapseClose&&markId==item.id">
                <a-spin v-if="showSpin&&tabShow&&!collapseClose&&markId==item.id"/>
                暂无相关信息
              </p>
            </div>
          </div>
          <a-spin v-if="showSpin&&!tabShow"/>
          <div style="height:20vh;overflow: auto;" v-if="!tabShow">
            <div v-for="(value,key,index) in verticalData" :key="key">
              <div class="table_title" @click="closeTable(key)">
                <p class="table_p">
                  <img
                    v-if="closeTableID.indexOf(key) == -1"
                    style="cursor: pointer;"
                    :src="icon_arr1"
                  />
                  <img
                    v-else
                    :src="icon_arr1"
                    class="table_img_close"
                  />{{ key }}</p>
              </div>
              <a-table
                v-if="closeTableID.indexOf(key) ==-1"
                :key="index"
                class="devOps_table"
                :pagination="false"
                :columns="value.columns"
                :data-source="value.data"
              >
                <template
                  slot="msg"
                  slot-scope="text, record"
                >
                  <a v-if="record.property&&record.msg!=='查看/编辑'" @click="toUrl(record)" class="underline">
                    <img
                      :src="fileIcon"
                      style="width: 18px;height:17px;"
                    />{{ "\xa0" + "." + "\xa0" + record.msg }}</a>
                  <a v-else-if="record.property&&record.msg==='查看/编辑'" @click="toUrl(record)">{{
                    record.msg
                  }}</a>
                  <p v-else>{{ record.msg }}</p>
                </template>
                <template
                  slot="name"
                  slot-scope="text, record"
                >
                  <p style="color: #0BCDA3">{{ record.name }}</p>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </article>
</template>

<script lang="ts">
import env from "@/config/env";
import {Button, Tabs, Spin, Table, Icon} from "@h3/antd-vue";
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import closeIcon from '../../src/assets/extends/infoPop/close.png';
import titleQQ from '../../src/assets/extends/infoPop/titleQQ.png';
import icon_arr1 from '../../src/assets/extends/infoPop/icon_arr1.png';
import lineIcon from '../../src/assets/extends/infoPop/形状1312.png';
import fileIcon from '../../src/assets/extends/infoPop/11.png';
import {
  initCard,
  getSubTab,
  getAllCardData,
  getMeasureCard,
  getScheduleCard,
  getColumns,
  getFormUrl
} from '../service/api';
import * as tsx from "vue-tsx-support";

@Component({
  name: "infoPopTs",
  components: {
    AButton: Button,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    ATable: Table,
    AIcon: Icon,
    ASpin: Spin,
  }
})
export default class infoPopTs extends Vue {
  @Prop() projectCode!: string;

  @Prop() projectId!: string;

  @Prop() smId!: string;

  @Prop() layerName!: string;

  @Prop() projectName!: string;


  closeIcon: any = closeIcon;
  titleQQ: any = titleQQ;
  icon_arr1: any = icon_arr1;
  lineIcon: any = lineIcon;
  fileIcon: any = fileIcon;

  showID: string = '';

  markStr: string = '';
  markId: string = '';
  tabShow: boolean = true;//判断是否有第二级菜单
  collapseClose: boolean = true;//与markId一起控制折叠面板的折叠
  closeTableID: Array<string> = [];//控制表格内容折叠
  showSpin: boolean = false;


  fatherButtonData: Array<object> | null = [];
  subButtonData: Array<object> | null = [];
  tableData: Array<object> | null = [];
  verticalData: object = {};

  @Watch('smId', {immediate: true})
  smIdListener(val: string) {
    if (val) {
      this.markStr = val;
      this.initTab();
    }
  }

  /**
   * 初始化tab
   */
  initTab() {
    this.subButtonData = [];
    this.tableData = [];
    this.verticalData = {};
    this.fatherButtonData = [];
    const {projectCode, projectId} = this;
    initCard({
      appCode: projectCode,
      projectId: projectId
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.fatherButtonData = res.data as unknown as Array<object> | null;
      if (this.fatherButtonData !== null && this.fatherButtonData.length !== 0) {
        // @ts-ignore
        document.documentElement.style.setProperty('--foo', Number(90 / this.fatherButtonData.length) + 'vw');
      }
      // @ts-ignore
      this.pressFather(this.fatherButtonData[0].id)
    });
  }

  /**
   * 初始化按钮（点击tab触发）
   * @param fatherId 所点击tab的key
   */
  initButton(fatherId) {
    const {projectCode, projectId} = this;
    this.tabShow = true;
    getSubTab({
      appCode: projectCode,
      projectId: projectId,
      fatherTabId: fatherId
    }).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.subButtonData = res.data as unknown as Array<object> | null;
      if (this.subButtonData?.length == 0) {
        this.tabShow = false;
        this.pressSubButton({id: fatherId});
      }
    });
  }

  /**
   * 变换tab触发事件
   * @param key 所点击tab的key
   */
  pressFather(key) {
    this.subButtonData = [];
    this.tableData = [];
    this.verticalData = {};
    this.markId = '';
    this.collapseClose = true;
    this.initButton(key);
  }

  pressSubButton(value) {
    this.showSpin = true;
    this.markId = value.id;
    this.collapseClose = !this.collapseClose;
    this.verticalData = {};
    if (!this.collapseClose) {
      const {projectCode, projectId, layerName, markStr, projectName} = this;
      if (value.buttonName === '计量信息') {
        getMeasureCard({
          appCode: projectCode,
          projectId: projectId,
          projectName: projectName,
          bimCardId: value.id,
          dataSource: layerName,
          smid: markStr
        }).then(res => {
          if (res.data?.dataDisplay == "纵向") return this.verticalTable(res.data.tableDatas)
        });
      } else if (value.buttonName === '进度信息') {
        getScheduleCard({
          appCode: projectCode,
          projectId: projectId,
          projectName: projectName,
          bimCardId: value.id,
          dataSource: layerName,
          smid: markStr
        }).then(res => {
          if (res.data?.dataDisplay == "纵向") return this.verticalTable(res.data.tableDatas)
        });
      } else {
        getAllCardData({
          appCode: projectCode,
          projectId: projectId,
          projectName: projectName,
          bimCardId: value.id,
          dataSource: layerName,
          smid: markStr
        }).then(res => {
          if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
          if (res.data?.dataDisplay == "纵向") return this.verticalTable(res.data.tableDatas)
        });
      }
    }
  }

  verticalTable(value) {
    // this.isHorizontal = false;
    for (const key in value) {
      const temptData: object = {};
      this.$set(temptData, 'columns', [{
        title: '属性',
        dataIndex: 'name',
        width: '30%',
        key: 'name',
        scopedSlots: {customRender: 'name'},
      }, {
        title: '值',
        dataIndex: 'msg',
        key: 'msg',
        scopedSlots: {customRender: 'msg'},
      }]);
      this.$set(temptData, 'data', value[key]);
      this.$set(this.verticalData, key, temptData)
    }
    this.showSpin = false;
  }

  toUrl(value) {
    const token = localStorage.getItem("token");
    if (value.property.indexOf("/") != -1) return window.open(`${env.apiHost}/${value.property}&access_token=${token}`)
    if (value.property.indexOf("/") == -1) {
      getFormUrl({
        bizObjectId: value.property,
        schemaCode: value.schemaCode,
      }).then(res => {
        return window.open(`${env.portalHost}${res}&access_token=${token}`)
      })
    }
  }

  closeTable(value) {
    if (this.closeTableID.indexOf(value) != -1) {
      this.closeTableID = this.closeTableID.filter(function (item) {
        return item != value
      });
    } else {
      this.closeTableID.push(value)
    }
  }
}

</script>

<style lang="less" scoped>
@import (reference) '../styles/theme.less';

.main {
  width: 100%;
  height: 100%;
  .flex;
  flex-direction: column;

  & > nav {
    .flex;
    font-size: 4.8vw;
    color: #fff;
  }
}


html {
  --foo: 88px;
}

.sub_collapse {
  .img_left {
    float: left;
    width: 2vw;
    height: 4vw;
    margin-left: 2px;
    cursor: pointer;
  }

  .img_right {
    float: right;
    width: 4vw;
    height: 4vw;
    cursor: pointer;
  }

  .img_right_close {
    float: right;
    width: 4vw;
    height: 4vw;
    cursor: pointer;
    transform: rotate(270deg);
  }

  .font_mid {
    float: left;
    color: #FFFFFF;
    font-size: 3vw;
    font-family: Source Han Sans CN;
    font-weight: 400;
    margin-left: 10px;
    line-height: 3vw;
    cursor: pointer;
  }

  .img_bottom {
    clear: both;
    width: 100%;
  }
}

.father_tab {
  clear: both;
  //margin: 30px;

  .table_img_close {
    cursor: pointer;
    transform: rotate(180deg);
  }

  /deep/ .ant-tabs-nav-container {
    font-size: 3vw;
    line-height: 2.8vw;
  }

  /deep/ .ant-tabs-nav .ant-tabs-tab {
    background-color: #152137;
    margin: 0;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #7B909A;
    line-height: 2.8vw;
    text-align: center;
    width: var(--foo);
  }

  /deep/ .ant-tabs-nav .ant-tabs-tab-active {
    color: #FFFFFF;
    background-color: #0659C3;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 2.8vw;
  }

  .table_title {
    height: 3.5vw;
    color: #C5DFFF;
    background: url("../../src/assets/extends/infoPop/pic.png");
    background-size: 100% 100%;
    margin-top: 0.1vw;

    .table_p {
      text-align: center;
      font-size: 4.8vw;
      font-family: '楷体';
      line-height: 2.8vw;
      font-weight: 600;
    }
  }


  .devOps_table {
    margin-top: 1%;
    margin-bottom: 0.05vw;
    width: 100%;
    //clear: both;
    .underline {
      border-bottom: 1px solid white;
      padding-bottom: 3px
    }

    /deep/ .ant-table {
      height: auto;
      line-height: 3vw;
    }

    /deep/ .ant-table-tbody > tr:hover > td {
      background: #558fab !important
    }

    /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
      background: transparent;
      color: #ffffff;
    }

    /deep/ .ant-table-thead {
      display: none;
    }

    /deep/ .ant-table-tbody > tr > td {
      padding: 0 0 !important;
      border-bottom: 0px solid transparent;
      color: #ffffff;
      text-align: center;
      font-size: 3.0vw;
    }


    /deep/ .ant-table-placeholder {
      //position: relative;
      //z-index: 1;
      //margin-top: -1px;
      //padding: 2px 8px;
      //color: #ffffff;
      //font-size: 2.5vw;
      //text-align: center;
      //background: transparent;
      display: none;

      //.ant-empty-normal {
      //  margin: 15px 0;
      //}
    }
  }

  ::-webkit-scrollbar-track {
    border-radius: 0;
    background: transparent;
  }
}

/deep/ .vdr.active:before {
  outline: 0px dashed #d6d6d6;
}
</style>
