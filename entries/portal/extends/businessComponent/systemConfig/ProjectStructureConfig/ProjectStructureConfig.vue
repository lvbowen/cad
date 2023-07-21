<template>
  <div class="project-structure-config">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="项目树配置" class="custom-style">
        <!--        <div class="radio-sty">-->
        <!--          <span>项目类型</span>-->
        <!--          <a-radio-group :value="defaultValue" @change="onChange">-->
        <!--            <a-radio :value="1" :disabled="isMulti">单项目</a-radio>-->
        <!--            <a-radio :value="2">多项目</a-radio>-->
        <!--          </a-radio-group>-->
        <!--        </div>-->
        <div v-show="defaultValue === 1">
          <span>管理项目： <a
            href="#"
            @click="toForm(singleProject.xmmc.length?'edit':'add',{schemaCode:`${projectCode}_gcjsxx_1`,id:singleProject.id.length?singleProject.id:''})">{{
              singleProject.xmmc.length ? singleProject.xmmc : '设置'
            }}</a></span>
        </div>
        <div v-show="defaultValue === 2">
          <div class="flex-space-between operator">
            <span>项目树</span>
            <div>
              <a-dropdown :disabled="editingKey!==''">
                <a-menu slot="overlay" @click="handleMenuClick">
                  <a-menu-item key="1"> <a-icon type="plus" />新增集团</a-menu-item>
                  <a-menu-item key="2"> <a-icon type="plus" />新增公司</a-menu-item>
                  <a-menu-item key="4"><a-icon type="plus" />新增总项目</a-menu-item>
                  <a-menu-item key="3"> <a-icon type="project" />关联项目</a-menu-item>
                </a-menu>
                <a-button type="primary">新增<a-icon type="down" /> </a-button>
              </a-dropdown>
            </div>
          </div>
          <a-table
            :key="num"
            :columns="columns"
            :data-source="tableData"
            :childrenColumnName="childrenColumnName"
            :defaultExpandAllRows="true"
            :pagination="false"
            rowKey="id"
            :customRow="rowClick"
            bordered
            :rowClassName="setRowClassName"
          >
            <template
              v-for="col in ['name','platformFlag']"
              :slot="col"
              slot-scope="text, record, index"
            >
              <span :key="col" class="flex-1">
                <a-input
                  v-if="record.editable && col==='name' && record.type!=='pro'"
                  style="margin: 5px 0;"
                  :value="text"
                  @change="e => handleChange(e.target.value, record.id, col)"
                />
                <span v-else-if="col==='platformFlag' && record.type==='pro'">
                  <a-checkbox-group
                    :options="record.plainOptions"
                    :disabled="!record.editable"
                    :defaultValue="record.defaultCheckedValue"
                    @change="onChangeCheck"></a-checkbox-group>
                </span>
                <template v-else>
                  <span>{{ text }}</span>
                </template>
              </span>
            </template>
            <template slot="operation" slot-scope="text, record, index">
              <div class="editable-row-operations">
                <span v-if="record.editable">
                  <a @click="() => save(record.id,record)" :class="editingKey===record.id?'success-color':''">保存</a>
                  <a @click="() => cancel(record.id,record)" :class="editingKey===record.id?'cancel-color':''">取消</a>
                </span>
                <span v-else>
                  <a :disabled="editingKey !== ''" @click="() => edit(record.id,record)" :class="editingKey || editingKey.length===4?'':'base-color'">编辑</a>
                  <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteConfig(record.id)">
                    <a :disabled="editingKey !== ''" :class="editingKey || editingKey.length===4?'':'warning-color'">删除</a>
                  </a-popconfirm>
                </span>
              </div>
            </template>
            <template slot="appKey" slot-scope="text, record, index">
              <a-input
                v-if="record.editable&& record.type==='pro'"
                placeholder="请输入appKey！"
                :value="text"
                @change="e => handleChange(e.target.value, record.id, 'appKey')"></a-input>
              <span v-else>{{ record.appKey }}</span>
            </template>
            <template slot="appSecret" slot-scope="text, record, index">
              <a-input
                v-if="record.editable&& record.type==='pro'"
                placeholder="请输入appSecret！"
                :value="text"
                @change="e => handleChange(e.target.value, record.id, 'appSecret')"></a-input>
              <span v-else>{{ record.appSecret }}</span>
            </template>
          </a-table>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <RefProDialog
      :showModal="showModal"
      :currentRowId="currentRow && currentRow.id"
      @closeRefProDialog="closeRefProDialog"
      @upDateTreeTable="upDateTreeTable"/>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue,Mixins,Watch} from 'vue-property-decorator';
// import {Button, Collapse, Dropdown, Icon, Menu, Radio, Table, Popconfirm,Modal,Checkbox} from "ant-design-vue";
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Dropdown from 'ant-design-vue/lib/dropdown';
import 'ant-design-vue/lib/dropdown/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Menu from 'ant-design-vue/lib/menu';
import 'ant-design-vue/lib/menu/style/index.css';
import Radio from 'ant-design-vue/lib/radio';
import 'ant-design-vue/lib/radio/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Checkbox from 'ant-design-vue/lib/checkbox';
import 'ant-design-vue/lib/checkbox/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import * as Type from "../../../type";
import {addProjectNode, getFormUrl, getSystemProjectConfig,deleteProjectNode,updateProjectNode,getRefProject,addRefProject,saveProjectSort} from "../../../service/api";
import { MultiPro,RefProList} from "../type";
import {isArray} from "xe-utils";
import Websocket from "../websocket_base";
import onActionClick from "@cloudpivot/list/src/components/pc/scripts/onActionClick";
import RefProDialog from "./RefProDialog.vue";
@Component({
  name: 'ProjectStructureConfig',
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    ARadio: Radio,
    AInput:Input,
    ARadioGroup: Radio.Group,
    AButton: Button,
    ATable: Table,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ASubMenu: Menu.SubMenu,
    ADropdown: Dropdown,
    APopconfirm: Popconfirm,
    ACheckboxGroup: Checkbox.Group,
    RefProDialog
  }
})
export default class ProjectStructureConfig extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode!: string;
  projectName:any=""
  activeKey: string[] = ['1'];
  defaultValue: number = 1;
  singleProject: { id: string, xmmc: string, xmjc: string } = {
    id: '',
    xmmc: '',
    xmjc: ''
  };
  isMulti: boolean = false;
  //start---多项目---表格树--编辑
  tableData: any[] = [];
  childrenColumnName: string = 'children';
  columns: any[] = [
    {
      title: '级别',
      dataIndex: '',
      scopedSlots: {customRender: 'level'},
      customRender: (text,record)=> {
        return record.type==='group'?'集团':record.type==='company'?'公司':record.type==='upPro'?'总项目':'项目'
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      // width: '30%',
      key: 'name',
      scopedSlots: {customRender: 'name'},
    },
    {
      title: '项目模块',
      dataIndex: 'platformFlag',
      width: 500,
      key: 'platformFlag',
      scopedSlots: {customRender: 'platformFlag'},
    },
    {
      title: '云渲染ID',
      dataIndex: 'appKey',
      key: 'appKey',
      scopedSlots: {customRender: 'appKey'},
    },
    {
      title: '云渲染秘钥',
      dataIndex: 'appSecret',
      key: 'appSecret',
      scopedSlots: {customRender: 'appSecret'},
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 120,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  expandedRowKeys: any[] = [];
  currentRow: MultiPro | null = null;
  num: number = 0;
  editingKey: string = '';
  cacheData: any[] = []; //取消-用
  // checkValue: string[] = [];
  defaultCheckedValue: string[] = [];
  isOperate: boolean = false;
  //end
  showModal: boolean = false;
  change1:string = ''; // 源目标数据序号
  change2:string = ''; // 目标数据序号
  foundItemChange1:any={};
  socket: any = null;
  onChange(e) {
    this.defaultValue = e.target.value;
    if(this.defaultValue === 2) {
      this.init();
      this.currentRow = null;
    }
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
            const formUrl = onActionClick.getFormRealUrl( this, url );
            window.open( formUrl );
          }
          }
        })
        break;
    }
  }
  mounted() {
    this.socket = new Websocket();
    this.socket.initWebsocket(this.projectCode??'','project',this.init)
    this.projectName=this.projectConfig?.projectName
  }

  init() {
    this.tableData = [];
    this.isMulti = false;
    // this.currentRow = null;
    getSystemProjectConfig({ appCode: this.projectCode??''}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      if (res.data.defaultType === '多项目') {
        this.defaultValue = 2;
        this.isMulti = true;
        //start - 表格树
        this.tableData = res.data.multi;
        this.initProModules(this.tableData,'children');
        this.cacheData = [...this.getFlatTreeArr(this.tableData,'children')];
        this.editingKey = '';
        this.num++;
        //end
      } else if(res.data.single && isArray(res.data.single) && res.data.single.length){
        for (const key in this.singleProject) {
          this.singleProject[key] = res.data.single[0][key]
        }
      }
    })
  }

  destroyed () {
    this.socket.close();
  }
  //end
  handleMenuClick(e) {
    //优化-表格可以新增多条（）
    switch (e.key) {
      case '1':
        this.tableData.push({
          id: this.rndNum(4),
          name: '',
          type: 'group',
          platformFlag: null,
          parentId: null,
          children: [],
          editable: true
        });
        this.editingKey = this.tableData[this.tableData.length-1].id
        break;
      case '2':
        this.add();
        break;
      case '3':
        if (!this.currentRow) {
          this.tableData.forEach(item=>{
            if(item.type==='group'||item.type==='company'){
              return this.$message.warning('请先点击表格中的集团或公司或总项目！')
            }
          })
        }else if(this.currentRow.type === 'pro'){
          return this.$message.warning('请先点击表格中的集团或公司或总项目！');
        }else {
          this.showModal = true;
        }
        break;
      case '4':
        if(!this.currentRow) {
          return this.$message.warning('请先点击表格中的集团或公司！')
        }else {
          if(this.currentRow.type==='group' || this.currentRow.type==='company') {
            this.addUpPro()
          }else {
            return this.$message.warning('请先点击表格中的集团或公司！')
          }
        }
    }
  }
  addUpPro() {
    const addRow: MultiPro = {
      id: this.rndNum(4), //id
      name: '',
      type: 'upPro',
      platformFlag: null,
      parentId: this.currentRow?.id??'',
      children: [],
      editable: true
    }
    this.editingKey = addRow.id;
    this.treeArrFilter(this.tableData, 'children', 'id', this.currentRow?.id, addRow)
  }

  //产生随机数函数
  rndNum(n){
    let rnd="";
    for(let i=0;i<n;i++)
      rnd+=Math.floor(Math.random()*10);
    return rnd;
  }

  //start---多项目---表格树--编辑
  getFlatTreeArr(arr:any[], attChildren:string = 'children') {
    let finalArr = [];
    arr.map((item) => {
      // @ts-ignore
      finalArr.push({...item});
      if (item[attChildren] && item[attChildren].length) {
        const p = this.getFlatTreeArr(item[attChildren], attChildren);
        finalArr = finalArr.concat(p)
      }
    });
    return finalArr;
  }
  add() {
    if(this.currentRow&&(this.currentRow.type==='pro' || this.currentRow.type==='upPro')) {
      return this.$message.warning('请先点击表格中的集团或公司或者直接新增公司！');
    }
    const addRow: MultiPro = {
      id: this.rndNum(4), //id
      name: '',
      type: 'company',
      platformFlag: null,
      parentId: this.currentRow?.id??'',
      children: [],
      editable: true
    }
    this.editingKey = addRow.id;
    if(!this.currentRow){
      this.tableData.push(addRow)
    }else {
      this.treeArrFilter(this.tableData, 'children', 'id', this.currentRow?.id, addRow)
    }
  };
  //id生成器，原有的id全部打乱，重新生成
  treeArrFilter(arr, attChildren = 'children', key, value, row) {
    arr.map((item) => {
      if (item[key] === value) {
        item[attChildren].push(row)
        return
      }
      if (item[attChildren] && item[attChildren].length) {
        this.treeArrFilter(item[attChildren], attChildren, key, value, row);
      }
    });
  }
  dropInit(){
    getSystemProjectConfig({ appCode: this.projectCode??''}).then((res)=>{
      this.tableData = res.data.multi;
    })
  }
  // 点击行时
  rowClick(record, index) {
    return {
      on: {
        click: (e) => {
          if(!this.currentRow) {
            this.currentRow = record;
          }else if(record.id === this.currentRow.id) {
            this.currentRow = null;
          }else {
            this.currentRow = record;
          }
          // this.currentRow = record;
          //新增
        },
        // 鼠标移入
        mouseenter: (event) => {
          // 兼容IE
          const ev = event || Event;
          ev.target.draggable = true;
        },
        // 开始拖拽
        dragstart:(event)=>{
          // 兼容IE
          const ev = event || Event;
          // 阻止冒泡
          ev.stopPropagation();
          // 得到源目标数据
          this.change1 = index;
          this.foundItemChange1=record
        },
        // 拖动元素经过的元素
        dragover: (event) => {
          // 兼容 IE
          const ev = event || Event;
          // 阻止默认行为
          ev.preventDefault();
        },
        // 鼠标松开
        drop: (event) => {
          // 兼容IE
          const ev = event || Event;
          // 阻止冒泡
          ev.stopPropagation();
          // 得到目标数据序号
          this.change2 = index;
          // 这里就是让数据位置互换，让视图更新 你们可以看record，index的输出，看是什么
          if(this.foundItemChange1.parentId===record.parentId){
            const changeItem=this.tableData[0].children[this.change1]
            const changeItem3=this.tableData[0].children[this.change1+1]
            const keyChange2=this.tableData[0].children[this.change2].sortKey
            this.tableData[0].children[this.change1].sortKey=keyChange2;
            if(this.change1>this.change2){
              this.tableData[0].children.forEach((item) => {
                if(item.sortKey>=changeItem.sortKey&&item.id!==changeItem.id){
                  item.sortKey++;
                }
              });
            }else{
              this.tableData[0].children.forEach((item) => {
                if(item.sortKey>=changeItem3.sortKey&&item.sortKey<=changeItem.sortKey&&item.id!==changeItem.id){
                  item.sortKey--;
                }
              });
            }
            saveProjectSort({appCode:this.projectCode,projectName:this.projectName,multi:this.tableData}).then((res)=>{
              this.dropInit()
            })
            this.dropInit()
          }else {
            this.$message.warning('只能在当前层级拖拽！');
          }

        }
      }
    }
  };
  // 行样式
  setRowClassName(record, index) {
    // let rowColor = (index % 2 === 0) ? "evenRowStyl" : "";//判断单双行，赋予不同样式
    if (!this.currentRow) {
      return
    }
    return record.id === this.currentRow.id ? "clickRowStyl" : '';//赋予点击行样式
  }
  handleChange(value, key, column) {
    const newData = [...this.tableData];
    // const target = newData.filter(item => key === item.id)[0];
    const target:any = this.getRow(newData,'children','id',key)[0];
    if (target) {
      target[column] = value;
      this.tableData = newData;
    }
  }
  edit(key,record) {
    this.defaultCheckedValue = [];
    const newData = [...this.tableData];
    // const target = newData.filter(item => key === item.id)[0];
    const target:any = this.getRow(newData,'children','id',key)[0]
    this.editingKey = key;
    // @ts-ignore
    if (target) {
      target.editable = true;
      this.tableData = newData;
    }
  }
  getRow(arr: any[] = [], attChildren = 'children', key, value) {
    let finalArr = [];
    arr.map((item) => {
      if (item[key]===value) {
        //@ts-ignore
        finalArr.push(item);
      }
      if (item[attChildren]) {
        const p = this.getRow(item[attChildren], attChildren, key, value);
        finalArr = finalArr.concat(p)
      }
    });
    return finalArr;
  }
  save(key,row) {
    if (key.length === 4) {
      //新增集团,新增公司
      addProjectNode({
        appCode: this.projectCode?? '',
        name: row.name,
        parentId: row.parentId,
        type: row.type,
        projectId: ''
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string);
        this.$message.success('保存成功！');
        this.init(); //单个保存---待优化，任意多个保存
        this.currentRow = null;
      })
    }else {
      //修改集团，修改公司，项目
      //处理platformFlag(仅项目)
      if(row.platformFlag) {
        for (const platformFlagKey in row.platformFlag) {
          //已操作
          if(this.isOperate) {
            if(this.defaultCheckedValue.includes(platformFlagKey)) { row.platformFlag[platformFlagKey] = true}else {
              row.platformFlag[platformFlagKey] = false
            }
          }else {
            //未操作,取初始状态
            const target:any = this.cacheData.filter(item => key === item.id)[0];
            if(target.defaultCheckedValue && target.defaultCheckedValue.includes(platformFlagKey)) {
              row.platformFlag[platformFlagKey] = true
            }else {
              row.platformFlag[platformFlagKey] = false
            }
          }
        }
      }
      updateProjectNode({
        appCode: this.projectCode?? '',
        name: row.name,
        id: row.id,
        appKey:row.appKey,
        appSecret:row.appSecret,
        platformFlag: row.platformFlag
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string);
        this.$message.success('修改成功！');
        this.init();
        this.currentRow = null;
      }).finally(()=> {
        this.isOperate = false;
      })
    }
  }
  cancel(key,row) {
    this.isOperate = false;
    this.editingKey = '';
    this.currentRow = null;
    //新增集团id-取消-特殊4位id区分;新增公司
    if (key.length === 4) {
      this.spliceRow(this.tableData,'children','id',key);
      return
    }
    //新增公司-取消-树形筛选
    const newData = [...this.tableData];
    // const target = newData.filter(item => key === item.id)[0];
    const target:any = this.getRow(newData,'children','id',key)[0];
    // @ts-ignore
    // this.editingKey = '';
    if (target) {
      Object.assign(target, this.cacheData.filter(item => key === item.id)[0]);
      delete target.editable;
      this.tableData = newData;
      this.num++;
    }
  }
  //tree,删除指定元素
  spliceRow(arr, attChildren = 'children', key, value) {
    arr.map((item,index) => {
      if (item[key] === value) {
        arr.splice(index,1)
        return
      }
      if (item[attChildren]) {
        this.spliceRow(item[attChildren], attChildren, key, value);
      }
    });
  }
  //删除
  deleteConfig(id:string) {
    deleteProjectNode({appCode:this.projectCode??'',id:id}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.defaultValue = 1;
      this.init();
      this.currentRow = null;
    })
  }
  //初始化项目级-项目模块
  initProModules(arr: any[] = [], attChildren = 'children') {
    arr.map((item) => {
      if (item[attChildren] && item[attChildren].length) {
        this.initProModules(item[attChildren], attChildren);
      }else {
        if(item.type === 'pro' && item.platformFlag) {
          const options:any[] = [],values:string[]=[];
          for (const f_key in item.platformFlag) {
            options.push({
              label: f_key,
              value: f_key
            })
            if(item.platformFlag[f_key]) {
              values.push(f_key)
            }
          }
          item.plainOptions = options;
          item.defaultCheckedValue = values;
        }
      }
    });
  }
  onChangeCheck(checkedValues) {
    this.isOperate = true;
    this.defaultCheckedValue = checkedValues;
  }
  closeRefProDialog() {
    this.showModal = false;
  }
  upDateTreeTable() {
    this.showModal = false;
    this.init();
    this.currentRow = null;
  }
  //end
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';

.project-structure-config {

  .radio-sty {
    margin-bottom: @spacing-large;
    span:first-child {
      margin-right: @spacing-large;
    }
  }

  /deep/ .ant-menu-submenu-popup .ant-menu-light {
    background-color: #f0f0f0 !important;
  }
  .operator {
    margin-bottom: @spacing-large;
    /deep/ .ant-btn {
      margin-right: @spacing-base;
    }
  }

  /deep/ .ant-table-body {
    //table tr td:first-child {
    //  display: flex;
    //  align-items: center;
    //}
  }
  /deep/ .ant-table {
    .ant-table-row {
      >td:first-child {
        min-width: 150px;
        white-space: nowrap;
      }
    }
  }
}
</style>
