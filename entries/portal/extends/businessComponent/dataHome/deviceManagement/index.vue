<template>
  <div class="device-management flex flex-column full-height">
    <div class="pre">
      <img alt="" src="../../../../src/assets/extends/icon/icon.png" @click="back"/>
      <div>设备档案</div>
    </div>
    <Card class="content full-height">
      <div class="left flex-1">
        <div class="title">设备信息</div>
        <Search
          style="margin-bottom: 8px;width: 65%;margin-right: 5%"
          placeholder="请输入关键字进行搜索"
          @change="onChange"
          @pressEnter="EnterSearchOne"
          @search="onSearchOne"/>
        <Button style="width: 30%;" type="primary" @click="() => onContextMenuClick('','','','','add')">新建根节点</Button>
        <Tree
          :treeData="treeData"
          :autoExpandParent="autoExpandParent"
          :expandedKeys="expandedKeys"
          :replaceFields="replaceFields"
          @select="selectNode"
          @expand="onExpand">
          <template slot="title" slot-scope="{ name,id,childs,sortKey }">
            <a-dropdown :trigger="['contextmenu']">
              <span v-if="name.indexOf(searchValue) > -1">
                {{ name.substr(0, name.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ name.substr(name.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else>{{ name }}</span>
              <template slot="overlay">
                <a-menu>
                  <a-menu-item key="add" @click="() => onContextMenuClick(name,id,childs,sortKey,'add')">新增子节点
                  </a-menu-item>
                  <a-menu-item key="delete" @click="() => onContextMenuClick(name,id,childs,sortKey,'delete')">删除本节点
                  </a-menu-item>
                  <a-menu-item key="edit" @click="() => onContextMenuClick(name,id,childs,sortKey,'edit')">编辑本节点
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </Tree>
      </div>
      <div class="black full-height"></div>
      <div class="right full-height">
        <div class="title">设备列表</div>
        <Button type="primary" @click="addEquip">新建</Button>
        <Button type="danger" @click="deleteEquip">删除</Button>
        <Search
          style="width: 250px;float:right"
          placeholder="请输入关键字进行搜索"
          @pressEnter="EnterSearchTwo"
          @search="onSearchTwo"/>
        <Table
          style="clear: both"
          :columns="memberColumns"
          :data-source="memberData"
          rowKey="id"
          :rowSelection="{
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange
          }">
          <template slot="操作" slot-scope="text, record">
            <a @click="editEquip(text,record)">编辑 |</a>
            <a @click="go2detail(text,record)"> 查看</a>
          </template>
        </Table>
      </div>
    </Card>
    <Modal
      :visible="isShow"
      title="设备信息"
      width="1400px"
      @ok="()=>{this.isShow=false;}"
      @cancel="()=>{this.isShow=false;}"
      okText="确认"
    >
      <div class="right-top">
        <!--        <div class="p_title">设备信息</div>-->
        <div class="flex">
          <div class="basic flex-1">
            <div class="box">
              <div class="title"><span class="line"></span>基本信息</div>
              <div>
                <Col :span="6" v-for="(item,index) in basicInfo" :key="index">
                {{ item.name }} : {{ item.value }}
                </Col>
              </div>
            </div>
            <div class="box">
              <div class="title"><span class="line"></span>厂家信息</div>
              <div>
                <Col :span="6" v-for="(item,index) in manufactorInfo" :key="index+item.name">
                {{ item.name }} : {{ item.value }}
                </Col>
              </div>
            </div>
            <!--            <div class="box">-->
            <!--              <div class="title"><span class="line"></span>设备数据</div>-->
            <!--              <div>-->
            <!--                <Col :span="6" v-for="(item,index) in deviceInfo" :key="index+item.name">-->
            <!--                {{ item.name }} : {{ item.value }}-->
            <!--                </Col>-->
            <!--              </div>-->
            <!--            </div>-->
          </div>
        </div>
      </div>
      <div class="right-bottom">
        <Tabs :activeKey="tabsActiveKey" @change="callback">
          <!--          <TabPane key="1" tab="进场验收检测">-->
          <!--            <Table :columns="acceptanceCheckColumns" :data-source="acceptanceCheckTableData"/>-->
          <!--          </TabPane>-->
          <TabPane key="2" tab="进出场登记">
            <Table :columns="inOrOutColumns" :data-source="inOrOutTableData"/>
          </TabPane>
          <TabPane key="3" tab="养护情况">
            <Table :columns="curingColumns" :data-source="curingTableData"/>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
    <Modal
      :visible="isTreeDetailShow"
      :title="isEdit?'修改节点':'新增节点'"
      width="800px"
      @ok="submitTreeNode"
      @cancel="()=>{this.isTreeDetailShow=false;}"
      okText="提交"
    >
      节点名称: <Input placeholder="请输入名称" v-model="currentTree.name" style="width: 120px;margin-right: 50px"></Input>
      节点次序:
      <Number
        placeholder="请输入次序"
        v-model="currentTree.sortKey"
        :min="0"
        style="width: 120px"></Number>
    </Modal>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from "vue-property-decorator";
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css'
import Row from 'ant-design-vue/lib/row';
import 'ant-design-vue/lib/row/style/index';
import Col from 'ant-design-vue/lib/col';
import 'ant-design-vue/lib/col/style/index';
import Tabs from 'ant-design-vue/lib/tabs';
import 'ant-design-vue/lib/tabs/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Dropdown from 'ant-design-vue/lib/dropdown';
import 'ant-design-vue/lib/dropdown/style/index.css';
import Menu from 'ant-design-vue/lib/menu';
import 'ant-design-vue/lib/menu/style/index.css';
import Number from 'ant-design-vue/lib/input-number';
import 'ant-design-vue/lib/input-number/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import {
  getTeamTreeEquip,
  getChildTableData,
  getTableList,
  editTeamTreeEquip,
  insertTeamTreeEquip, deleteTeamTreeEquip, getEquipByTeamAndLike, deleteEquipById
} from "../../../service/api";
import env from "@/config/env";
import * as Type from "../../../type";

@Component({
  name: 'DeviceManagements',
  components: {
    Card, Tree, Row, Col, Tabs, Table, Modal, Button,
    TabPane: Tabs.TabPane, Search: Input.Search, Number, Input,
    AMenu: Menu, AMenuItem: Menu.Item, ADropdown: Dropdown,
  }
})
export default class DeviceManagements extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive("project") projectCode;
  treeData: any[] = [];
  searchValue: string = '';
  dataList: Array<{ [propsName: string]: string }> = [];
  autoExpandParent: boolean = true;
  expandedKeys: Array<string> = [];
  replaceFields: { [propsName: string]: string } = {
    children: 'childs', title: 'name', key: 'id'
  };
  //基本信息
  basicInfo: Array<Type.basicInfoItem> = [
    {
      name: '设备名称',
      key: 'equipmentName',
      value: ''
    },
    {
      name: '设备编号',
      key: 'equipmentCode',
      value: ''
    },
    {
      name: '设备种类',
      key: 'equipmentSpecies',
      value: ''
    },
    {
      name: '设备类别',
      key: 'equipmentCategory',
      value: ''
    },
    {
      name: '规格型号',
      key: 'specification',
      value: ''
    },
    {
      name: '自有/租赁',
      key: 'Ishire',
      value: ''
    },
    {
      name: '管理部门',
      key: 'manageDepartment',
      value: ''
    },
    {
      name: '管理人员',
      key: 'manager',
      value: ''
    },
    {
      name: '使用单位',
      key: 'manager',
      value: ''
    },
    {
      name: '单位负责人',
      key: 'useUnitLeader',
      value: ''
    }
  ];
  //厂家信息
  manufactorInfo: Array<Type.basicInfoItem> = [
    {
      name: '生产厂家',
      key: 'manufacturer',
      value: ''
    },
    {
      name: '厂家联系人',
      key: 'manufacturerEquip',
      value: ''
    },
    {
      name: '厂家联系方式',
      key: 'manufacturerPhone',
      value: ''
    },
    {
      name: '生产日期',
      key: 'productionDate',
      value: ''
    },
    {
      name: '进场日期',
      key: 'inDate',
      value: ''
    },
    {
      name: '养护规则',
      key: 'maintenanceRules',
      value: ''
    }
  ];
  //设备数据
  deviceInfo: Array<Type.basicInfoItem> = [
    {
      name: '设备在场状态',
      key: 'equipmentStatus',
      value: ''
    },
    {
      name: '最新进场时间',
      key: 'lastInDate',
      value: ''
    },
    {
      name: '最新退场时间',
      key: 'LastOutDate',
      value: ''
    },
    {
      name: '最新保养时间',
      key: 'LastOutDate',
      value: ''
    },
    {
      name: '最新维修时间',
      key: 'lastMaintenanceDate',
      value: ''
    }
  ];
  acceptanceCheckColumns: { title: string, dataIndex: string, width?: number, defaultSortOrder?: string, sorter?: unknown, customRender?: unknown }[] = [
    {
      title: '验收日期',
      dataIndex: 'acceptDate',
      width: 150,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.acceptDate > b.acceptDate ? 1 : -1,
      customRender: (text) => {
        return text && text.substring(0, 10)
      }
    },
    {
      title: '验收意见',
      dataIndex: 'acceptOpinion',
      width: 150,
    },
    {
      title: '出场合格证',
      dataIndex: 'qualifiedCertificate',
      width: 150,
    },
    {
      title: '核对生产厂家',
      dataIndex: 'checkManufacturer',
      width: 150,
    }
  ];
  acceptanceCheckTableData: Array<Type.AcceptanceCheck> = [];//验收
  inOrOutColumns: { title: string, dataIndex: string, width?: number, defaultSortOrder?: string, sorter?: unknown, customRender?: unknown }[] = [
    {
      title: '地点',
      dataIndex: 'place',
      width: 150,
    },
    {
      title: '进出场日期',
      dataIndex: 'InOrOutDate',
      width: 150,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.InOrOutDate > b.InOrOutDate ? 1 : -1,
      customRender: (text) => {
        return text && text.substring(0, 10)
      }
    },
    {
      title: '进出场',
      dataIndex: 'InOrOut',
      width: 150,
    }
  ];
  inOrOutTableData: Array<Type.InOrOut> = [];//进出场登记
  curingColumns: { title: string, dataIndex: string, width?: number, defaultSortOrder?: string, sorter?: unknown, customRender?: unknown }[] = [
    {
      title: '养护时间',
      dataIndex: 'maintainDate',
      width: 150,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.maintainDate > b.maintainDate ? 1 : -1,
      customRender: (text) => {
        return text && text.substring(0, 10)
      }
    },
    {
      title: '养护类型',
      dataIndex: 'type',
      width: 150,
    },
    {
      title: '养护内容',
      dataIndex: 'content',
      width: 150,
    },
    {
      title: '养护人员',
      dataIndex: 'person',
      width: 150,
    },
    {
      title: '养护金额',
      dataIndex: 'Money',
      width: 150,
    },
    {
      title: '养护人员联系方式',
      dataIndex: 'phone',
      width: 150,
    }
  ];
  curingTableData: Array<Type.Curing> = [];//养护情况
  isShow: boolean = false;
  tabsActiveKey: string = '2';
  selectId: string = '';

  isTreeDetailShow: boolean = false;
  isEdit: boolean = false;
  currentTree: { name: string, sortKey: number, projectName: string, id: string, pid: string } = {
    name: '',
    sortKey: 1,
    projectName: '',
    id: '',
    pid: ''
  }
  teamId: string = '';
  selectedRowKeys: Array<string> = [];
  memberColumns: { title: string, dataIndex?: string, width?: number, customRender?: any, scopedSlots?: { customRender: string } }[] = [
    {
      title: '序号',
      dataIndex: 'index',
    },
    {
      title: '编号',
      dataIndex: 'equipmentCode',
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
    },
    {
      title: '设备类型',
      dataIndex: 'equipmentCategory',
    },
    {
      title: '设备型号',
      dataIndex: 'specification',
    },
    {
      title: '操作',
      dataIndex: '操作',
      scopedSlots: {customRender: "操作"}
    }
  ];
  memberData: Array<{ [propsName: string]: string | null }> = [];

  back() {
    this.$router.go(-1)
  }

  async getEquipTeamList() {
    const params = {
      projectCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
    }
    const {data, errcode} = await getTeamTreeEquip(params);
    if (errcode !== 0) return
    if (data && Array.isArray(data)) {
      this.treeData = data;
      this.selectNode([this.treeData[0].id],'')
      this.treeData.map((item) => {
        this.expandedKeys.push(item.id)
      })
      this.generateList(data);
    }
  }

  async getEquipInfo(id: string = '') {
    // @ts-ignore
    const {data, errcode} = await getChildTableData({
      sheetCode: `${this.projectCode}_equipmentInfo`,
      objectId: id,
      schemaCode: `${this.projectCode}_equipmentInfo`
    });
    if (errcode === 0) {
      //@ts-ignore
      const person = data?.bizObject?.data;
      this.basicInfo.map((item) => {
        for (let key in person) {
          if (person[key] && item.key === key) {
            item.value = person[key];
          }
        }
      })
      this.manufactorInfo.map((item,) => {
        for (let key in person) {
          if (person[key] && item.key === key) {
            item.value = person[key];
          }
        }
      })
      this.deviceInfo.map((item,) => {
        for (let key in person) {
          if (person[key] && item.key === key) {
            item.value = person[key];
          }
        }
      })
    }
  }

  async getAcceptanceCheck() {
    this.acceptanceCheckTableData = [];
    // eslint-disable-next-line no-shadow
    const {data, errcode} = await getTableList({
      filters: [{
        propertyCode: 'id',
        propertyType: 0,
        propertyValue: '',
        propertyValueName: ''
      }, {propertyCode: "equipmentId", propertyType: 0, propertyValue: this.selectId, propertyValueName: ""}],
      mobile: false,
      page: 0,
      queryCode: `${this.projectCode}_InCheck`,
      schemaCode: `${this.projectCode}_InCheck`,
      size: 10
    });
    if (errcode === 0) {
      //@ts-ignore
      data?.content?.map((i) => {
        this.acceptanceCheckTableData.push({
          acceptDate: i.data.acceptDate,
          acceptOpinion: i.data.acceptOpinion,
          qualifiedCertificate: i.data.qualifiedCertificate,
          checkManufacturer: i.data.checkManufacturer,
          equipmentId: i.data.equipmentId,
          equipmentName: i.data.equipmentName,
          equipmentSelect: i.data.equipmentSelect
        })
      })
    }
  }

  async getInOrOut() {
    this.inOrOutTableData = [];
    // eslint-disable-next-line no-shadow
    const {data, errcode} = await getTableList({
      filters: [{propertyCode: 'equipmentId', propertyType: 0, propertyValue: this.selectId, propertyValueName: ''}],
      mobile: false,
      page: 0,
      queryCode: `${this.projectCode}_InOutRecord`,
      schemaCode: `${this.projectCode}_InOutRecord`,
      size: 10
    });
    if (errcode === 0) {
      //@ts-ignore
      data?.content?.map((i) => {
        this.inOrOutTableData.push({
          place: i.data.place,
          equipmentId: i.data.equipmentId,
          equipmentSelect: i.data.equipmentSelect,
          InOrOutDate: i.data.InOrOutDate,
          InOrOut: i.data.InOrOut
        })
      })
    }
  }

  async getCuring() {
    this.curingTableData = [];
    // eslint-disable-next-line no-shadow
    const {data, errcode} = await getTableList({
      filters: [{propertyCode: 'equipmentId', propertyType: 0, propertyValue: this.selectId, propertyValueName: ''}],
      mobile: false,
      page: 0,
      queryCode: `${this.projectCode}_upKeepInfo`,
      schemaCode: `${this.projectCode}_upKeepInfo`,
      size: 10
    });
    if (errcode === 0) {
      //@ts-ignore
      data?.content?.map((i) => {
        this.curingTableData.push({
          maintainDate: i.data.maintainDate,
          type: i.data.type,
          content: i.data.content,
          person: i.data.person,
          Money: i.data.Money,
          phone: i.data.phone,
          equipmentId: i.data.equipmentId
        })
      })
    }
  }

  //左侧树的展开事件
  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }

  selectNode(selectedKeys, e) {
    this.basicInfo.map((item) => {
      item.value = '';
    })
    this.manufactorInfo.map((item) => {
      item.value = '';
    })
    this.deviceInfo.map((item) => {
      item.value = '';
    })
    this.isShow = false;
    this.inOrOutTableData = [];
    this.acceptanceCheckTableData = [];
    this.curingTableData = [];
    this.teamId = selectedKeys[0] as string;
    this.memberData = []
    getEquipByTeamAndLike({
      appCode: this.projectCode as string,
      teamId: selectedKeys[0] as string
    }).then(res => {
      if (res.errcode !== 0 || !res.data) return;
      this.memberData = res.data;
    })
  }

  go2detail(text, record) {
    this.isShow = true;
    this.selectId = record.id;
    this.getEquipInfo(record.id);
    if (this.tabsActiveKey === '1') {
      this.getAcceptanceCheck()
    } else if (this.tabsActiveKey === '2') {
      this.getInOrOut()
    } else if (this.tabsActiveKey === '3') {
      this.getCuring();
    }
  }

  generateList(data) {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.name;
      this.dataList.push({key: node.id, title: key});
      if (node.childs) {
        this.generateList(node.childs);
      }
    }
  }

  //左侧树的关键字搜索
  onChange(e) {
    const value = e.target.value;
    // const expandedKeys = this.dataList
    //   .map(item => {
    //     if (item.title.indexOf(value) > -1) {
    //       return this.getParentKey(item.key, this.treeData);
    //     }
    //     return null;
    //   })
    //   .filter((item, i, self) => item && self.indexOf(item) === i);
    // //@ts-ignore
    // Object.assign(this, {
    //   expandedKeys,
    //   searchValue: value,
    //   autoExpandParent: true,
    // });
  }
  Search(value){
    const expandedKeys = this.dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, this.treeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    //@ts-ignore
    Object.assign(this, {
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }
  //左侧树回车搜索
  EnterSearchOne(e){
    const value = e.target.value;
    this.Search(value)
  }
  //左侧树点击搜索
  onSearchOne(value){
    this.Search(value)
  }

  getParentKey(key, tree) {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.childs) {
        if (node.childs.some(item => item.id === key)) {
          parentKey = node.id;
        } else if (this.getParentKey(key, node.childs)) {
          parentKey = this.getParentKey(key, node.childs);
        }
      }
    }
    return parentKey;
  }

  callback(key) {
    this.tabsActiveKey = key;
    switch (key) {
      case '1':
        if (this.isShow) {
          this.getAcceptanceCheck();
        }
        break;
      case '2':
        if (this.isShow) {
          this.getInOrOut();
        }
        break;
      case '3':
        if (this.isShow) {
          this.getCuring();
        }
        break;
    }
  }

  submitTreeNode() {
    if (this.isEdit) {
      editTeamTreeEquip({
        appCode: this.projectCode ?? '',
        teamDTO: this.currentTree
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warn('编辑该节点失败！')
        this.getEquipTeamList();
      })
    } else {
      insertTeamTreeEquip({
        appCode: this.projectCode ?? '',
        teamDTO: this.currentTree
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warn('添加子节点失败！')
        this.getEquipTeamList();
      })
    }
    this.isTreeDetailShow = false;
    this.isEdit = false;
  }

  onContextMenuClick(name, id, childs, sortKey, state) {
    this.currentTree = {
      name: '',
      sortKey: 1,
      projectName: this.projectConfig?.projectName ?? '',
      id: '',
      pid: ''
    };
    if (state === 'add') {
      this.isEdit = false;
      this.isTreeDetailShow = true;
      this.currentTree.name = '';
      this.currentTree.sortKey = 0;
      this.currentTree.pid = id;
      this.currentTree.id = '';
    } else if (state === 'edit') {
      this.isTreeDetailShow = true;
      this.isEdit = true;
      this.currentTree.name = name;
      this.currentTree.sortKey = sortKey;
      this.currentTree.pid = '';
      this.currentTree.id = id;
    } else if (state === 'delete') {
      deleteTeamTreeEquip({
        appCode: this.projectCode ?? '',
        id: id as string
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string)
        this.getEquipTeamList();
      })
    }
  }

  deleteEquip() {
    if (this.selectedRowKeys.length === 0) return this.$message.warn('请选择需删除设备！')
    deleteEquipById({
      appCode: this.projectCode ?? '',
      idList: this.selectedRowKeys
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('删除失败！')
      this.onTableChange('')
    })
  }

  onTableChange(e) {// @change="onTableChange" 输入搜索
    this.memberData = [];
    let value = '';
    if (e !== '') {
      value = e.target.value;
    };
    getEquipByTeamAndLike({
      appCode: this.projectCode as string,
      teamId: this.teamId as string,
      like: value as string
    }).then(res => {
      if (res.errcode !== 0 || !res.data) return;
      this.memberData = res.data;
    })
  }
  //设备列表回车搜索
  EnterSearchTwo(e){
    this.onTableChange(e)
  }
  //设备列表点击搜索
  onSearchTwo(value){
    this.memberData = [];
    getEquipByTeamAndLike({
      appCode: this.projectCode as string,
      teamId: this.teamId as string,
      like: value as string
    }).then(res => {
      if (res.errcode !== 0 || !res.data) return;
      this.memberData = res.data;
    })
  }

  editEquip(text, record) {
    const token = localStorage.getItem("token");
    const url = `/form/detail?schemaCode=${this.projectCode}_equipmentInfo&objectId=${record.id}&sheetCode=${this.projectCode}_equipmentInfo&projectName=${this.projectConfig?.projectName ?? ''}&access_token=${token}`;
    const urlReturn = `${this.$route.fullPath}&iframeAction=detail`;
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${env.portalHost}${url}`)
  }

  addEquip() {
    let urlReturn = `/application/${this.projectCode}/application-list/${this.projectCode}_equipmentInfo?iframeAction=add&version=2.5.50001.71&platform=win`;
    if(!this.isDingTalk) {
      urlReturn = `/${this.projectCode}${urlReturn}`
    }
    const token = localStorage.getItem("token");
    const url = `/form/detail?schemaCode=${this.projectCode}_equipmentInfo&sheetCode=${this.projectCode}_equipmentInfo&projectName=${this.projectConfig?.projectName ?? ''}&access_token=${token}&return=${encodeURIComponent(urlReturn)}`;
    this.isDingTalk?this.$router.push(url):window.open(`${env.portalHost}${url}`)
  }

  onSelectChange(selectedRowKeys, info) {
    this.selectedRowKeys = selectedRowKeys;
  }

  mounted() {
    this.getEquipTeamList();
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';

@base-color: #000000;
.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: @spacing-base;
}

.device-management {
  color: @base-color;

  /deep/ .ant-tree li .ant-tree-node-content-wrapper {
    color: @base-color;
  }

  /deep/ .ant-table {
    color: @base-color;

    .ant-table-thead > tr > th {
      font-weight: bold;
    }
  }

  .pre {
    margin-bottom: @spacing-base;

    div {
      display: inline-block;
      font-size: 16px;
    }

    img {
      cursor: pointer;
    }
  }

  .ant-card {
    color: @base-color;
  }

  .content {
    background-color: #FFFFFF;

    .left {
      width: 22%;
      overflow: auto;
      height: 100%;
      padding: @spacing-base @spacing-base @spacing-medium @spacing-base;

      /deep/ .ant-select {
        width: 100%;
      }

      .title {
        .title;
      }
    }

    .black {
      width: 10px;
      background-color: #F4F6FC;
    }

    .right {
      width: calc(78% - @spacing-base);
      overflow: auto;
      padding: @spacing-base;

      & > Button {
        margin-left: 15px;
        float: right;
      }
    }

    /deep/ .ant-card-body {
      padding: 0;
      height: 100%;
      display: flex;
    }

    /deep/ .ant-tabs {
      color: @base-color;
    }
  }
}
.right-top {
  > .p_title {
    .title;
    margin-bottom: @spacing-large;
  }

  .basic {
    /deep/ .ant-col {
      padding: 1/2 * @spacing-base 0 @spacing-base 0;
    }

    .box {
      display: flow-root;
      margin-bottom: @spacing-large;

      .title {
        .title;

        .line {
          padding: 2px;
          background-color: #1890ff;
          margin-right: 1/2 * @spacing-base;
        }
      }

      > div:last-child {
        padding-left: @spacing-large;
      }
    }
  }
}

.right-bottom {
  margin-top: @spacing-large;
  padding-bottom: @spacing-base;
}
</style>
