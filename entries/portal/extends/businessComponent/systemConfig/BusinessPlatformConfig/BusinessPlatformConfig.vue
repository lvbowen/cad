<template>
  <div class="business-platform-config">
    <div class="project">
      <span>配置项目：</span>
      <a-select @change="handleChange" :value="selectedProId">
        <a-select-option v-for="i in selectOption" :key="i.id" :value="i.id">
          {{ i.xmmc }}
        </a-select-option>
      </a-select>
    </div>
    <a-spin :spinning="loadding">
      <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
        <template #expandIcon="props">
          <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
        </template>
        <a-collapse-panel key="1" header="业务模块关联" class="custom-style">
          <div v-if="process.length>2" :key="processNum">
            <div class="bus-style">
              <div style="width: 250px" class="text-center">
                <div class="flex-center-align flex-center-justify">
                  <a-icon
                    @click="updateBusModuleConfig('one',`one1`,`two1`,process[0])"
                    class="one"
                    :ref="`one1`"
                    :type="process[0].flag?'check-circle':'close-circle'"
                    theme="twoTone"
                    :twoToneColor="process[0].flag?'#52c41a':'#FF0000'"/>
                  <a-icon
                    @click="updateBusModuleConfig('two',`two1`,`one1`,process[0])"
                    class="two"
                    :ref="`two1`"
                    :type="process[0].flag?'close-circle':'check-circle'"
                    theme="twoTone"
                    :twoToneColor="process[0].flag?'#FF0000':'#52c41a'"
                  />
                  <!--                <div class="line"></div>-->
                </div>
                <div>{{ process[0].name }}</div>
              </div>
            </div>
            <div style="display: flex">
              <div class="left_arrow">
                <img
                  v-show="process[0].flag && process[1].flag && process[0].rightFlag"
                  src="./img/active.png"
                  alt=""
                  class="left-bottom-arrow"
                  @click="updateBusModuleConfig('arrow','','',process[0],{rightFlag:!process[0].rightFlag},false)">
                <img
                  v-show="process[0].flag && process[1].flag && process[1].leftFlag"
                  src="./img/active.png"
                  alt=""
                  @click="updateBusModuleConfig('arrow','','',process[1],{leftFlag:!process[1].leftFlag},false)"
                  class="right-top-arrow">
                <img
                  v-show="!(process[0].flag && process[1].flag) || (process[0].flag && process[1].flag && !process[0].rightFlag)"
                  src="./img/disabled.png"
                  @click="updateBusModuleConfig('arrow','','',process[0],{rightFlag:!process[0].rightFlag},!(process[0].flag && process[1].flag))"
                  :class="!(process[0].flag && process[1].flag)?'disable':''"
                  alt=""
                  class="left-bottom-arrow">
                <img
                  v-show="!(process[0].flag && process[1].flag) || (process[0].flag && process[1].flag && !process[1].leftFlag)"
                  src="./img/disabled.png"
                  alt=""
                  @click="updateBusModuleConfig('arrow','','',process[1],{leftFlag:!process[1].leftFlag},!(process[0].flag && process[1].flag))"
                  :class="!(process[0].flag && process[1].flag)?'disable':''"
                  class="right-top-arrow">
              </div>
              <div class="left_arrow">
                <img
                  v-show="process[0].flag && process[2].flag && process[2].rightFlag"
                  src="./img/active.png"
                  @click="updateBusModuleConfig('arrow','','',process[2],{rightFlag:!process[2].rightFlag},false)"
                  alt=""
                  class="left-top-arrow">
                <img
                  v-show="process[0].flag && process[2].flag && process[0].leftFlag"
                  src="./img/active.png"
                  alt=""
                  @click="updateBusModuleConfig('arrow','','',process[0],{leftFlag:!process[0].leftFlag},false)"
                  class="right-bottom-arrow">
                <img
                  v-show="!(process[0].flag && process[2].flag) || (process[0].flag && process[2].flag && !process[2].rightFlag)"
                  src="./img/disabled.png"
                  @click="updateBusModuleConfig('arrow','','',process[2],{rightFlag:!process[2].rightFlag},!(process[0].flag && process[2].flag))"
                  :class="!(process[0].flag && process[2].flag)?'disable':''"
                  alt=""
                  class="left-top-arrow">
                <img
                  v-show="!(process[0].flag && process[2].flag) || (process[0].flag && process[2].flag && !process[0].leftFlag)"
                  src="./img/disabled.png"
                  @click="updateBusModuleConfig('arrow','','',process[0],{leftFlag:!process[0].leftFlag},!(process[0].flag && process[2].flag))"
                  :class="!(process[0].flag && process[2].flag)?'disable':''"
                  alt=""
                  class="right-bottom-arrow">
              </div>
            </div>
            <div class="bus-style inline-block">
              <div class="flex-center-align">
                <a-icon
                  @click="updateBusModuleConfig('one',`one2`,`one2`,process[1])"
                  class="one"
                  :ref="`one2`"
                  :type="process[1].flag?'check-circle':'close-circle'"
                  theme="twoTone"
                  :twoToneColor="process[1].flag?'#52c41a':'#FF0000'"/>
                <a-icon
                  @click="updateBusModuleConfig('two',`one2`,`one2`,process[1])"
                  class="two"
                  :ref="`one2`"
                  :type="process[1].flag?'close-circle':'check-circle'"
                  theme="twoTone"
                  :twoToneColor="process[1].flag?'#FF0000':'#52c41a'"
                />
                <!--                <div class="line"></div>-->
              </div>
              <div>{{ process[1].name }}</div>
            </div>
            <div class="left_arrow inline-block" style="margin:0 20px;width: 80px;">
              <img
                v-show="process[1].flag && process[2].flag && process[2].leftFlag"
                src="./img/active.png"
                @click="updateBusModuleConfig('arrow','','',process[2],{leftFlag:!process[2].leftFlag},false)"
                alt=""
                class="left-arrow">
              <img
                v-show="process[1].flag && process[2].flag && process[1].rightFlag"
                src="./img/active.png"
                @click="updateBusModuleConfig('arrow','','',process[1],{rightFlag:!process[1].rightFlag},false)"
                alt=""
                class="right-arrow">
              <img
                v-show="!(process[1].flag && process[2].flag) || (process[1].flag && process[2].flag && !process[2].leftFlag)"
                src="./img/disabled.png"
                :class="!(process[1].flag && process[2].flag)?'disable':''"
                @click="updateBusModuleConfig('arrow','','',process[2],{leftFlag:!process[2].leftFlag},!(process[1].flag && process[2].flag))"
                alt=""
                class="left-arrow"
              >
              <img
                v-show="!(process[1].flag && process[2].flag) || (process[1].flag && process[2].flag && !process[1].rightFlag)"
                src="./img/disabled.png"
                @click="updateBusModuleConfig('arrow','','',process[1],{rightFlag:!process[1].rightFlag},!(process[1].flag && process[2].flag))"
                :class="!(process[1].flag && process[2].flag)?'disable':''"
                alt=""
                class="right-arrow"
              >
            </div>
            <div class="bus-style inline-block">
              <div class="flex-center-align">
                <a-icon
                  @click="updateBusModuleConfig('one',`one3`,`one3`,process[2])"
                  class="one"
                  :ref="`one3`"
                  :type="process[2].flag?'check-circle':'close-circle'"
                  theme="twoTone"
                  :twoToneColor="process[2].flag?'#52c41a':'#FF0000'"/>
                <a-icon
                  @click="updateBusModuleConfig('two',`one3`,`one3`,process[2])"
                  class="two"
                  :ref="`one3`"
                  :type="process[2].flag?'close-circle':'check-circle'"
                  theme="twoTone"
                  :twoToneColor="process[2].flag?'#FF0000':'#52c41a'"
                />
                <!--                <div class="line"></div>-->
              </div>
              <div>{{ process[2].name }}</div>
            </div>
          </div>
          <!--          <div v-for="(item,index) in process" :key="index" class="bus-style">-->
          <!--            <div class="flex-center-align">-->
          <!--              <a-icon-->
          <!--                @click="updateBusModuleConfig('one',`one${index}`,`two${index}`,item)"-->
          <!--                class="one"-->
          <!--                :ref="`one${index}`"-->
          <!--                :type="item.flag?'check-circle':'close-circle'"-->
          <!--                theme="twoTone"-->
          <!--                :twoToneColor="item.flag?'#52c41a':'#FF0000'"/>-->
          <!--              <a-icon-->
          <!--                @click="updateBusModuleConfig('two',`two${index}`,`one${index}`,item)"-->
          <!--                class="two"-->
          <!--                :ref="`two${index}`"-->
          <!--                :type="item.flag?'close-circle':'check-circle'"-->
          <!--                theme="twoTone"-->
          <!--                :twoToneColor="item.flag?'#FF0000':'#52c41a'"-->
          <!--              />-->
          <!--              <div class="line"></div>-->
          <!--            </div>-->
          <!--            <div>{{ item.name }}</div>-->
          <!--          </div>-->
        </a-collapse-panel>
        <a-collapse-panel key="2" header="720全景设置" class="custom-style">
          <a-button
            type="primary"
            @click="toForm('add',{schemaCode:`${projectCode}_panoramic_720`})">新增
          </a-button>
          <a-table
            bordered
            :data-source="tableData"
            :columns="tableColumns"
            :customRow="rowMouseenter"
            :pagination="false">
            <template slot="url" slot-scope="text,record, index">
              <a :href="text" target="_blank">{{ text }}</a>
            </template>
            <template slot="capturePicUrl" slot-scope="text,record, index">
              <div
                @mouseenter="isExitHover=true"
                @mouseleave="isExitHover=false"
                class="fj">
                <img
                  v-show="isExitHover && currentIndex===index"
                  :src="text"/>
                <a :href="text">{{ text }}</a>
              </div>
            </template>
            <template slot="operation" slot-scope="text, record, index">
              <div class="editable-row-operations">
                <a
                  @click="() => toForm('edit',{schemaCode:`${projectCode}_panoramic_720`,id: record.id})"
                  class="base-color">编辑</a>
                <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteConfig(record.id)">
                  <a class="warning-color">删除</a>
                </a-popconfirm>
              </div>
            </template>
          </a-table>
        </a-collapse-panel>
        <a-collapse-panel key="3" header="风险预警设置" class="custom-style">
          <div class="flex risk flex-center-align">
            <span class="plain">预警规则：</span>
            <span>当离进度施工计划部位的</span>
            <a-select :value="riskData.periodType" @change="changeRiskType">
              <a-select-option key="1" value="计划开始时间">计划开始时间</a-select-option>
            </a-select>
            <span>还剩</span>
            <a-input-number
              v-model="riskData.period"
              :min="1"
              @change="changePeriod"></a-input-number>
            天时，对应关联的风险清单进行提示预警，发送通知人
          </div>
          <div class="risk flex">
            <span class="plain">权限设置：</span>
            <staff-selector
              :options="personOptions"
              :disabled="false"
              @change="onValueChange"
              :value="riskData.users"/>
          </div>
          <div class="flex risk">
            <a-button type="primary" @click="pushRiskConfig" :loading="riskLoading">确定</a-button>
            <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteRiskConfig">
              <a-button type="danger">清除</a-button>
            </a-popconfirm>
          </div>
        </a-collapse-panel>
        <a-collapse-panel key="4" header="默认评定表设置" class="custom-style">
          <a-button type="primary" @click="saveEvaluateConfig">保存</a-button>
          <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="delectEvaluateConfig">
            <a-button type="danger">删除</a-button>
          </a-popconfirm>
          <div class="flex">
            <div
              v-for="(i,index) in levels"
              :key="index"
              class="level"
            >
              <div>{{ i.label }}</div>
              <a-cascader
                placeholder="请选择"
                :key="`${index + cascaderKey}`"
                :options="structionTypeOption"
                :fieldNames="fieldNames"
                :displayRender="({labels})=> displayRenderFn(labels,i)"
                @change="(val)=> editNodeStructionType(val,i)"
                :defaultValue="i.value"
              >
              </a-cascader>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </a-spin>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import {ModuleConfig, ProjectPro, Org, Depth} from "../type";
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import InputNumber from 'ant-design-vue/lib/input-number';
import 'ant-design-vue/lib/input-number/style/index.css';
import Switch from 'ant-design-vue/lib/switch';
import 'ant-design-vue/lib/switch/style/index.css';
import Cascader from 'ant-design-vue/lib/cascader';
import 'ant-design-vue/lib/cascader/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import {ApplicationToProject} from '@ctesi/component';
import {
  getSystemProjectConfig,
  getBusModuleConfig,
  updateBusModuleConfig,
  getFormUrl,
  getPanoramic,
  deletePanoramic,
  getSystemRiskConfig,
  updateRiskConfig,
  deleteRiskConfig,
  getQbsSheetConfig,
  updateQbsSheetConfig,
  delectQbsSheetConfig
} from "../../../service/api";
import {isArray} from "xe-utils";
import onActionClick
  from "../../../../../../modules/@cloudpivot/list/src/components/pc/scripts/onActionClick";
import * as Type from "../../../type";
import {Panoramic, RiskData} from "../type";
import * as Api from '../../../service/api';
import Utils from "../../../utils";
import config from '../publicConfig';

interface JBSLevel {
  label:string;
  value:string[];
  id?:string;
  key:string,
  jbsId:string
  // cascaderKey?:number
}
@Component({
  name: 'BusinessPlatformConfig',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    ASpin: Spin,
    AButton: Button,
    ATable: Table,
    ASwitch: Switch,
    APopconfirm: Popconfirm,
    AInputNumber: InputNumber,
    ACascader: Cascader,
    AModal: Modal,
    staffSelector,
    ApplicationToProject
  }
})
export default class BusinessPlatformConfig extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  selectOption: ProjectPro[] = [];
  activeKey: string[] = ['1', '2', '3','4'];
  process: ModuleConfig[] = [];
  loadding: boolean = false;
  selectedProId: string = '';
  selectedProName: string = '';
  tableData: Panoramic[] = [];
  tableColumns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '拍摄日期',
      dataIndex: 'date',
      width: 115,
      key: 'date'
    },
    {
      title: '全景标题',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '全景网址',
      dataIndex: 'url',
      key: 'url',
      scopedSlots: {customRender: 'url'}
    },
    {
      title: '全景封面',
      dataIndex: 'capturePicUrl',
      key: 'capturePicUrl',
      scopedSlots: {customRender: 'capturePicUrl'},
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 200,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  isExitHover: boolean = false;
  currentIndex: number | null = null;
  processNum: number = 0;
  //风险预警
  text: string = '';
  riskData: RiskData = {
    id: '',
    period: 1,
    type: '风险',
    periodType: '计划开始时间',
    users: []
  };
  riskLoading: Boolean = false;
  personOptions: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    title: '人员多选'
  };
  //
  levels: JBSLevel[] = [];
  sheetId:string = '';
  cascaderKey: number = 1;
  structionTypeOption: any = []
  defaultValue: string[] = [];
  fieldNames: any = {
    label: 'name',
    value: 'id',
    children: 'childs'
  };
  getJBSNode() {
    Api.queryJBSTree( {
      appCode: this.projectCode
    }).then((res)=> {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      if(res.data) {
        this.structionTypeOption = res.data;
        this.getQbsConfig()
      }
    })
  }
  getQbsConfig() {
    this.levels = JSON.parse(JSON.stringify(config.levels));
    this.sheetId = '';
    this.cascaderKey++;
    getQbsSheetConfig({
      appCode: this.projectCode ?? '',
      projectName: this.selectedProName
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.sheetId = res.data?.id??'';
        this.levels.map((i)=> {
          for (const dataKey in res.data) {
            if(res.data[dataKey] && dataKey === i.key) {
              //qbsid
              i.jbsId = res.data[dataKey].id;
              Utils.deepFind(this.structionTypeOption,item=> {
                if(item.id===res.data[dataKey].parentId) {
                  i.value.push(item.parentId)
                }
                return false
              },'childs')
              i.value.push(res.data[dataKey].parentId,res.data[dataKey].id);
            }
          }
        })
      }
    })
  }
  displayRenderFn(labels:any,r:JBSLevel) {
    if(labels && labels.length) {
      return labels[2]
    }
    return ''
  }
  saveEvaluateConfig() {
    const parmas = {
      appCode: this.projectCode??'',
      projectName: this.selectedProName,
      dwpd: '',
      dxpd: '',
      fbpd: '',
      fxpd:'',
      bwpd: '',
    }
    if(this.sheetId.length) {
      Object.assign(parmas,{id: this.sheetId})
    }
    this.levels.map((i)=> {
      for (const parmasKey in parmas) {
        if(parmasKey === i.key) {
          parmas[parmasKey] = i.jbsId;
        }
      }
    })
    updateQbsSheetConfig(parmas).then((res)=> {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.$message.success('保存成功');
      this.getQbsConfig();
    })
  }
  delectEvaluateConfig() {
    delectQbsSheetConfig({appCode: this.projectCode ?? '', projectName: this.selectedProName}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.getQbsConfig();
    })
  }

  editNodeStructionType(val:string[],r:JBSLevel) {
    this.levels.map((i)=> {
      if(i.key === r.key) {
        i.jbsId = val[2]
      }
    })
  }

  handleChange(val) {
    this.process = [];
    this.loadding = true;
    this.$nextTick(() => {
      this.selectedProId = val;
    })
    this.getBusModuleConfig(val);
    this.selectOption.map((i) => {
      if (val === i.id) {
        this.selectedProName = i.xmjc
      }
    })
    this.getPanoramic(this.selectedProName);
    this.getRiskConfig(this.selectedProName);
    // this.getPerList();
    this.getJBSNode();
  }

  getProjectList() {
    getSystemProjectConfig({appCode: this.projectCode ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data.single && isArray(res.data.single) && res.data.single.length) {
        this.selectOption = res.data.single;
        this.$nextTick(() => {
          this.handleChange(this.selectOption[0].id);
        })
      }
    })
  }

  getBusModuleConfig(projectId: string = '') {
    getBusModuleConfig({appCode: this.projectCode ?? '', projectId: projectId}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      // this.$nextTick(()=> {
      if (res.data) {
        this.process = JSON.parse(JSON.stringify(res.data))
      }
      // console.log(this.process, 'process')
      // })
    }).finally(() => {
      this.loadding = false;
    })
  }

  /**
   * 模块状态及流向状态修改
   * @param flag 模块状态/流向状态
   * @param el1
   * @param el2
   * @param item 要改变的状态的模块
   * @param p 流向状态值
   * @param isDisabledClick 流向状态是否能改变
   */
  updateBusModuleConfig(flag: string, el1: string, el2: string, item: ModuleConfig, p?: { rightFlag?: boolean, leftFlag?: boolean }, isDisabledClick?: boolean) {
    let node: ModuleConfig = {
      id: item.id,
      name: item.name,
      preId: item.preId,
      leftFlag: item.leftFlag,
      rightFlag: item.rightFlag,
      flag: item.flag
    };
    if (flag === 'arrow') {
      if (isDisabledClick) {
        return;
      } else {
        Object.assign(node, p)
      }
    } else {
      node.flag = !item.flag
    }
    const nodesArr = [];
    //@ts-ignore
    nodesArr.push(node);
    updateBusModuleConfig({
      appCode: this.projectCode ?? '',
      projectId: this.selectedProId,
      nodes: nodesArr
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('修改成功！');
      if (flag === 'arrow') {
        this.process.map((i) => {
          if (item.id === i.id) {
            Object.assign(i, p);
            this.processNum++;
          }
        })
      } else {
        //@ts-ignore
        (this.$refs[el1]).$el.style.transform = 'rotateY(180deg)';
        //@ts-ignore
        (this.$refs[el2]).$el.style.transform = 'rotateY(0deg)';
        setTimeout(() => {
          this.process.map((i) => {
            if (item.id === i.id) {
              i.flag = !item.flag;
            }
          })
          this.getBusModuleConfig(this.selectedProId)
          this.processNum++;
        }, 1000)
      }
    })
  }

  toForm(flag: string, params: { schemaCode: string, id?: string }) {
    switch (flag) {
      case 'add':
        let routeData = this.$router.resolve({
          // 业务表单
          name: "form-detail",
          query: {
            schemaCode: params.schemaCode,
            sheetCode: params.schemaCode,
            return: `${this.$route.fullPath}&iframeAction=add`,
            iframeAction: 'add',
            projectName: this.projectConfig?.projectName,
          },
        });
        this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
        break;
      case 'edit':
        getFormUrl({
          bizObjectId: params?.id ?? '',
          schemaCode: params.schemaCode
        }).then((res) => {
          // 如果报错, 会返回一个对象
          if (typeof res === "object" && res.errcode !== 0) {
            return this.$message.error(res.errmsg as string, 3);
          }
          // 否则返回一个字符串
          else if (typeof res === "string") {
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
            }else{
            const formUrl = onActionClick.getFormRealUrl(this, url);
            window.open(formUrl);
          }
          }
        })
        break;
    }
  }

  getPanoramic(name: string) {
    getPanoramic({appCode: this.projectCode ?? '', projectName: name}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.tableData = res.data;
      }
    })
  }

  deleteConfig(id: string) {
    deletePanoramic({appCode: this.projectCode ?? '', id: id}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.getPanoramic(this.selectedProName);
    })
  }

  rowMouseenter(record, index) {
    return {
      on: {
        mouseenter: (e) => {
          this.currentIndex = index;
        },
        mouseleave: () => {
          this.currentIndex = null;
        }
      }
    }
  };

  changePeriod(val) {
    this.riskData.period = val;
  }

  getRiskConfig(proName: string) {
    this.riskData.users = [];
    getSystemRiskConfig({
      appCode: this.projectCode ?? '',
      projectName: proName,
      type: this.riskData.type ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.riskData.id = res.data.id;
        this.riskData.periodType = res.data.periodType;
        this.riskData.period = res.data.period;
        res.data && res.data.users ? this.riskData.users = res.data.users.map((item) => {
          return {
            id: item.userId,
            name: item.userName
          }
        }) : ''
      }
    })
  }

  changeRiskType(val) {
    this.riskData.periodType = val
  }

  onValueChange(value) {
    console.log(value)
    this.riskData.users = value
  }

  pushRiskConfig() {
    if (!this.riskData.users || (this.riskData.users && !this.riskData.users.length)) return this.$message.warning('请至少选择一个用户！')
    if (!this.riskData.periodType) return this.$message.warning('施工计划部位必填！')
    if (!this.riskData.period) return this.$message.warning('天数必填！')
    this.riskLoading = true;
    updateRiskConfig({
      appCode: this.projectCode ?? '',
      projectName: this.selectedProName,
      id: this.riskData.id ?? '',
      type: '风险',
      periodType: this.riskData.periodType,
      period: this.riskData.period ?? 0,
      users: this.riskData.users.map((i) => {
        return {
          userId: i.id,
          userName: i.name
        }
      })
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('推送成功！')
      this.getRiskConfig(this.selectedProName)
    }).finally(() => {
      this.riskLoading = false;
    })
  }

  deleteRiskConfig() {
    deleteRiskConfig({appCode: this.projectCode ?? '', id: this.riskData.id ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.riskData.id = '';
      this.riskData.periodType = '';
      this.riskData.period = 0;
      this.riskData.users = [];
      this.getRiskConfig(this.selectedProName);
    })
  }

  mounted() {
    this.getProjectList();
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';

.business-platform-config {

  .custom-style {
    .bus-style {
      &:first-child {
        margin-top: @spacing-large;
      }

      font-weight: bold;
      //margin-right: @spacing-large;
      //display: inline-block;
      perspective: 800px;

      .anticon {
        font-size: 50px;
        margin-bottom: @spacing-base;
        margin-right: @spacing-base;
      }

      .one {
        backface-visibility: hidden;
        transition: 1s;

        &:hover {
          transform: scale(1.2);
        }
      }

      .two {
        position: absolute;
        transform: rotateY(-180deg);
        backface-visibility: hidden;
        transition: 1s;

        &:hover {
          transform: scale(1.2);
          //transform: rotateY(0deg);
        }
      }

      //.line {
      //  display: inline-block;
      //  width: 50px;
      //  height: 2px;
      //  background-color: #909399;
      //}
      //
      //&:last-child {
      //  .line {
      //    display: none;
      //  }
      //}
    }

    .fj {
      position: relative;

      img {
        width: 50px;
        height: 50px;
        position: absolute;
        left: 40px;
        top: -25px;
      }
    }

    .left_arrow {
      position: relative;
      width: 125px;
      height: 70px;

      img {
        display: block;
        position: absolute;
        transition: 0.3s;
      }

      .left-bottom-arrow {
        transform: rotate(120deg) scale(0.5);
        left: -27px;

        &:hover {
          transform: scale(1.1) rotate(120deg) scale(0.5);
        }
      }

      .right-top-arrow {
        transform: rotate(-60deg) scale(0.5);
        top: 10px;
        left: -5px;

        &:hover {
          transform: scale(1.1) rotate(-60deg) scale(0.5);
        }
      }

      .left-top-arrow {
        transform: rotate(-120deg) scale(0.5);
        left: -9px;

        &:hover {
          transform: scale(1.1) rotate(-120deg) scale(0.5);
        }
      }

      .right-bottom-arrow {
        transform: rotate(60deg) scale(0.5);
        top: 15px;
        left: -29px;

        &:hover {
          transform: scale(1.1) rotate(60deg) scale(0.5);
        }
      }

      .right-arrow {
        left: -40px;
        transform: scale(0.5);
        top: 24px;

        &:hover {
          transform: scale(1.1) scale(0.5);
        }
      }

      .left-arrow {
        left: -40px;
        transform: rotate(180deg) scale(0.5);

        &:hover {
          transform: scale(1.1) rotate(180deg) scale(0.5);
        }
      }
    }

    .risk {
      font-weight: bold;

      .plain {
        opacity: 0.7;
      }

      /deep/ .ant-select {
        width: 150px;
        margin: @spacing-base;
      }

      /deep/ .ant-input-number {
        width: 80px;
        margin: @spacing-base;
      }

      /deep/ .h3-organization__label {
        width: 321px;
        height: 200px;
        overflow: auto;
      }

      /deep/ .ant-btn {
        margin-right: @spacing-large;
      }
    }

    .level {
      width: 20%;

      div:first-child {
        font-weight: bold;
        margin: @spacing-base;
      }

      /deep/ .ant-cascader-picker {
        width: 90%;
      }
    }

    /deep/ .ant-btn {
      margin-right: @spacing-large;
    }
  }

  .project {
    margin-bottom: @spacing-large;

    /deep/ .ant-select {
      width: 30%;
    }
  }
}
</style>
