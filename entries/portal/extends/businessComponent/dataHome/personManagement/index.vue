<template>
  <div class="person-management flex flex-column full-height">
    <div class="pre">
      <img alt="" src="../../../../src/assets/extends/icon/icon.png" @click="back"/>
      <div>人员档案</div>
    </div>
    <Card class="content full-height">
      <div class="left flex-1">
        <div class="title">组织架构</div>
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
        <div class="title">部门成员</div>
        <Button type="primary" @click="addPerson">新建</Button>
        <Button type="danger" @click="deletePerson">删除</Button>
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
            <a @click="editPerson(text,record)">编辑 |</a>
            <a @click="go2detail(text,record)"> 查看</a>
          </template>
        </Table>
      </div>
    </Card>
    <Modal
      wrapClassName="personInfo"
      :visible="isShow"
      title="人员信息"
      width="1300px"
      :destroyOnClose="true"
      :afterClose="personInfoAfterClose"
      @ok="()=>{this.isShow=false;}"
      @cancel="()=>{this.isShow=false;}"
      okText="确认"
    >
      <div class="right-top">
        <div class="flex">
          <div class="pic text-center">
            <img :src="photo.length? photo: require('./img/mr.png')"/>
            <div>登记照</div>
          </div>
          <div class="basic flex-1">
            <div class="box">
              <div class="title">基本信息</div>
              <div>
                <Col :span="6" v-for="(item,index) in basicInfo" :key="index">
                {{ item.name }} : {{ item.value }}
                </Col>
              </div>
            </div>
            <div class="box">
              <div class="title">岗位信息</div>
              <div>
                <Col :span="6" v-for="(item,index) in positionInfo" :key="index+item.name">
                {{ item.name }} : {{ item.value }}
                </Col>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-bottom">
        <Tabs :activeKey="tabsActiveKey" @change="callback">
          <TabPane key="1" tab="证件信息">
            <Table :columns="certificateColumns" :data-source="certificateTableData" rowKey="id">
              <span slot="certificateAttachment" slot-scope="text, record">
                <template v-for="(value,i) in record.certificateAttachment">
                  <Tooltip placement="bottom" :key="i+value">
                    <template slot="title">
                      <span>单击预览</span>
                      <br/>
                      <span>双击下载</span>
                    </template>
                    <a @click="dealFile(value)" @dblclick="downLoad(value)">{{ value.name }}</a>
                  </Tooltip>
                  <br :key="i"/>
                </template>
              </span>
            </Table>
          </TabPane>
          <TabPane key="2" tab="岗位信息">
            <div class="postBox">
              <h4 class="postTitle">安全职责</h4>
              <h4 class="postTitle">项目职责</h4>
            </div>
            <div class="postBox">
              <div class="postContext">
                <p v-for="(safe,index) in jobDescribe.safeJobDescribe" :key="index">{{ safe }}</p>
              </div>
              <div class="postContext">
                <p v-for="(project,index) in jobDescribe.projectJobDescribe" :key="index">{{ project }}</p>
              </div>
            </div>
          </TabPane>
          <TabPane key="3" tab="考勤信息">
            <Table
              style="margin:0 10px"
              rowKey="id"
              :scroll="{y:230}"
              :columns="attendanceColumns"
              :data-source="attendanceTableData"
              :pagination="attendancePagination">
              <div
                class="attendancImgBox"
                slot="imgeRender"
                slot-scope="text"
                @click="attendanceClick(text)">
                <img :src="text" alt="" srcset="">
              </div>
            </Table>
          </TabPane>
          <TabPane key="4" tab="培训信息">
            <Tabs type="card" style="margin:0 10px">
              <TabPane key="4-1" tab="受训">
                <Table
                  :pagination="trainingSPagination"
                  :dataSource="trainingTableDataS"
                  :scroll="{y:180}"
                  :columns="trainingColumns"
                  @change="(pagination)=>handleTablePaginationChange(pagination,trainingSPagination)"
                  rowKey="id">
                  <div class="wrap" slot="contentSlot" slot-scope="text">{{ text }}</div>
                  <template slot="trainingAction" slot-scope="text,record">
                    <Button v-if="text&&text.length>0" type="link" @click="actionClick(record.url)">查看详情</Button>
                  </template>
                </Table>
              </TabPane>
              <TabPane key="4-2" tab="组织">
                <Table
                  :pagination="trainingTPagination"
                  :dataSource="trainingTableDataT"
                  :scroll="{y:180}"
                  :columns="trainingColumns"
                  @change="(pagination)=>handleTablePaginationChange(pagination,trainingTPagination)"
                  rowKey="id">
                  <div class="wrap" slot="contentSlot" slot-scope="text">{{ text }}</div>
                  <template slot="trainingAction" slot-scope="text,record">
                    <Button v-if="text&&text.length>0" type="link" @click="actionClick(record.url)">查看详情</Button>
                  </template>
                </Table>
              </TabPane>
            </Tabs>
          </TabPane>
          <TabPane key="5" tab="交底信息">
            <Tabs type="card" style="margin:0 10px">
              <TabPane key="5-1" tab="受训">
                <Table
                  :pagination="technicalDisclosureSPagination"
                  :dataSource="technicalDisclosureDataS"
                  :scroll="{y:180}"
                  :columns="technicalDisclosureColumns"
                  @change="(pagination)=>handleTablePaginationChange(pagination,technicalDisclosureSPagination)"
                  rowKey="id">
                  <div class="wrap" slot="contentSlot" slot-scope="text">{{ text }}</div>
                  <template slot="trainingAction" slot-scope="text,record">
                    <Button v-if="text&&text.length>0" type="link" @click="actionClick(record.url)">查看详情</Button>
                  </template>
                </Table>
              </TabPane>
              <TabPane key="5-2" tab="组织">
                <Table
                  :pagination="technicalDisclosureTPagination"
                  :dataSource="technicalDisclosureDataT"
                  :scroll="{y:180}"
                  :columns="technicalDisclosureColumns"
                  @change="(pagination)=>handleTablePaginationChange(pagination,technicalDisclosureTPagination)"
                  rowKey="id">
                  <div class="wrap" slot="contentSlot" slot-scope="text">{{ text }}</div>
                  <template slot="trainingAction" slot-scope="text,record">
                    <Button v-if="text&&text.length>0" type="link" @click="actionClick(record.url)">查看详情</Button>
                  </template>
                </Table>
              </TabPane>
            </Tabs>
          </TabPane>
          <TabPane key="6" tab="整改信息">
            <Tabs type="card" style="margin:0 10px">
              <TabPane key="6-1" tab="责任整改">
                <Table
                  :pagination="safeRectificationDataSPagination"
                  :dataSource="safeRectificationDataS"
                  :scroll="{y:180}"
                  :columns="safeRectificationDataSColumns"
                  @change="(pagination)=>handleTablePaginationChange(pagination,safeRectificationDataSPagination)"
                  rowKey="id">
                  <div class="wrap" slot="contentSlot" slot-scope="text">{{ text }}</div>
                  <template slot="trainingAction" slot-scope="text,record">
                    <Button v-if="text&&text.length>0" type="link" @click="actionClick(record.url)">查看详情</Button>
                  </template>
                </Table>
              </TabPane>
              <TabPane key="6-2" tab="通知整改">
                <Table
                  :pagination="safeRectificationDataTPagination"
                  :dataSource="safeRectificationDataT"
                  :scroll="{y:180}"
                  :columns="safeRectificationDataTColumns"
                  @change="(pagination)=>handleTablePaginationChange(pagination,safeRectificationDataTPagination)"
                  rowKey="id">
                  <div class="wrap" slot="contentSlot" slot-scope="text">{{ text }}</div>
                  <template slot="trainingAction" slot-scope="text,record">
                    <Button v-if="text&&text.length>0" type="link" @click="actionClick(record.url)">查看详情</Button>
                  </template>
                </Table>
              </TabPane>
            </Tabs>
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
    <Modal
      :visible="isImgShow"
      :footer="null"
      :closable="false"
      :centered="true"
      @ok="isImgShow=false"
      @cancel="isImgShow=false">
      <div @click="isImgShow=false">
        <img :src="bigImgUrl" alt="" srcset="">
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from "vue-property-decorator";
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
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
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Dropdown from 'ant-design-vue/lib/dropdown';
import 'ant-design-vue/lib/dropdown/style/index.css';
import Menu from 'ant-design-vue/lib/menu';
import 'ant-design-vue/lib/menu/style/index.css';
import Number from 'ant-design-vue/lib/input-number';
import 'ant-design-vue/lib/input-number/style/index.css';
import {
  getPersonTeamTree,
  getPersonByTeamAndLike,
  getChildTableData,
  getTableList,
  getPersonTraining,
  deleteTeamTreePerson,
  editTeamTreePerson,
  insertTeamTreePerson,
  deletePersonById
} from "../../../service/api";
import env from "@/config/env";
import * as Type from "../../../type";
import Store from "@/store";
import moment from "moment";
import {getJobDescribeByName,JobDescribe,getPersonTrainingByName,TrainingData,
  getTechnicalDisclosureByName,TechnicalDisclosureData,getSafeRectificationByName,
  SafeRectificationData} from "./server/personManagement";
import { HttpResponse } from "@cloudpivot/api/src/response";
@Component({
  name: 'PersonManagement',
  components: {
    Card, Tree, Row, Col, Tabs, Table, Tooltip, Modal, Button,
    AMenu: Menu, AMenuItem: Menu.Item, ADropdown: Dropdown,
    TabPane: Tabs.TabPane, Search: Input.Search, Number, Input
  }
})
export default class PersonManagement extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive("project") projectCode;
  treeData: Array<any> = [];
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
      name: '人员姓名',
      key: 'personName',
      value: ''
    },
    {
      name: '人员性别',
      key: 'sex',
      value: ''
    },
    {
      name: '籍贯',
      key: 'homeAddress',
      value: ''
    },
    {
      name: '婚姻情况',
      key: 'marriageStatus',
      value: ''
    },
    {
      name: '文化程度',
      key: 'educationLevel',
      value: ''
    },
    {
      name: '嗜好',
      key: 'hobby',
      value: ''
    },
    {
      name: '入职时间',
      key: 'startWorkDate',
      value: ''
    },
    {
      name: '手机号',
      key: 'phone',
      value: ''
    },
    {
      name: '身份证号',
      key: 'Identity',
      value: ''
    },
  ];
  //岗位信息
  positionInfo: Array<Type.basicInfoItem> = [
    {
      name: '所属公司',
      key: 'company',
      value: ''
    },
    {
      name: '所属部门',
      key: 'department',
      value: ''
    },
    {
      name: '职位角色',
      key: 'workType',
      value: ''
    }
  ];
  //证件照
  photo: string = '';
  certificate: Array<any> = [];
  certificateColumns: { title: string, dataIndex: string, width?: number, scopedSlots?: { customRender: string } }[] = [
    {
      title: '证件名称',
      dataIndex: 'certificateName',
      width: 150
    },
    {
      title: '附件',
      dataIndex: 'certificateAttachment',
      width: 150,
      scopedSlots: {customRender: "certificateAttachment"}
    }
  ];
  certificateTableData: { certificateName?: string, certificateAttachment?: Array<any> }[] = [];//证照信息
  memberColumns: { title: string, dataIndex?: string, width?: number, customRender?: any, scopedSlots?: { customRender: string } }[] = [
    {
      title: '序号',
      dataIndex: 'index',
    },
    {
      title: '姓名',
      dataIndex: 'personName',
    },
    {
      title: '公司',
      dataIndex: 'company',
    },
    {
      title: '工种',
      dataIndex: 'workType',
    },
    {
      title: '操作',
      dataIndex: '操作',
      scopedSlots: {customRender: "操作"}
    }
  ];
  memberData: Array<{ [propsName: string]: string | null }> = [];
  isShow: boolean = false;
  tabsActiveKey: string = '1';
  selectId: string = '';
  timeFn: any;
  phoneNumber: string = '';
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

  back() {
    this.$router.go(-1)
  }

  async getPersonTeamList() {
    const params = {
      projectCode: env.project,
      projectName: this.projectConfig?.projectName ?? '',
    }
    const {data, errcode} = await getPersonTeamTree(params);
    if (errcode === 0) {
      if (data && Array.isArray(data)) {
        this.treeData = data;
        this.selectNode([this.treeData[0].id],'')
        this.treeData.map((item) => {
          this.expandedKeys.push(item.id)
        })
        this.generateList(data);
      }
    }
  }

  async getPersonInfo(id: string = '') {
    this.photo='';
    try {
      const {data, errcode, errmsg} = await getChildTableData({
        sheetCode: `${this.projectCode}_PersonInfo`,
        objectId: id,
        schemaCode: `${this.projectCode}_PersonInfo`
      });
      if(errcode!==0){
        this.$message.error(`获取人员信息失败,${errmsg}`);
        return false;
      }
      //@ts-ignore
      const person = data?.bizObject?.data;
      this.userName=person["personName"];
      this.personId=person["id"];
      this.personProjectName=person["xmjc_1"];
      if (person.photo) {
        this.photo = person.photo[0]?.base64ImageStr ?? '';
        //this.photo = `${env.apiHost}/api/aliyun/download?refId=${person.photo[0].refId}&name=${person.photo[0].name}&webp=true`;
      }
      let cer_key = `${this.projectCode}_certificate`;
      if (person[cer_key]) {
        this.certificateTableData = person[cer_key];
      }
      this.basicInfo.map((item) => {
        for (let key in person) {
          if (person[key] && item.key === key) {
            item.value = person[key];
          }
        }
        if (item.key === 'phone') {
          this.phoneNumber = person[item.key]
        }
      })
      this.positionInfo.map((item,) => {
        for (let key in person) {
          if (person[key] && item.key === key) {
            item.value = person[key];
          }
        }
      })
      return true;
    } catch (error) {
        this.$message.error(`获取人员信息异常,${error}`);
        return false;
    }
  }

  async go2detail(text, record) {
    // this.isShow = true;
    this.selectId = record.id;
    if(await this.getPersonInfo(record.id)){
      this.isShow = true;
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
    this.positionInfo.map((item) => {
      item.value = '';
    })
    this.photo = '';
    // this.certificate = [];
    this.certificateTableData = [];
    this.isShow = false;
    this.attendanceTableData = [];
    this.teamId = selectedKeys[0] as string;
    this.memberData = []
    getPersonByTeamAndLike({
      appCode: this.projectCode as string,
      teamId: selectedKeys[0] as string
    }).then(res => {
      if (res.errcode !== 0 || !res.data) return;
      this.memberData = res.data;
    })
  }

  submitTreeNode() {
    if (this.isEdit) {
      editTeamTreePerson({
        appCode: this.projectCode ?? '',
        teamDTO: this.currentTree
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warn('编辑该节点失败！')
        this.getPersonTeamList();
      })
    } else {
      insertTeamTreePerson({
        appCode: this.projectCode ?? '',
        teamDTO: this.currentTree
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warn('添加子节点失败！')
        this.getPersonTeamList();
      })
    }
    this.isTreeDetailShow = false;
    this.isEdit = false;
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
    // const value = e.target.value;
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
  leftSearch(value){
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
    this.leftSearch(value)
  }
  //左侧树点击搜索
  onSearchOne(value){
    this.leftSearch(value)
  }


  onTableChange(e) {//@change="onTableChange" 输入搜索
    this.memberData = [];
    let value = '';
    if (e !== '') {
      value = e.target.value;
    }
    getPersonByTeamAndLike({
      appCode: this.projectCode as string,
      teamId: this.teamId as string,
      like: value as string
    }).then(res => {
      if (res.errcode !== 0 || !res.data) return;
      this.memberData = res.data;
    })
  }
  EnterSearchTwo(e){//部门成员回车搜索
    this.onTableChange(e)
  }
  onSearchTwo(value){//部门成员点击搜索
    this.memberData = [];
    getPersonByTeamAndLike({
      appCode: this.projectCode as string,
      teamId: this.teamId as string,
      like: value as string
    }).then(res => {
      if (res.errcode !== 0 || !res.data) return;
      this.memberData = res.data;
    })
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
      deleteTeamTreePerson({
        appCode: this.projectCode ?? '',
        id: id as string
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string)
        this.getPersonTeamList();
      })
    }
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

  async callback(key) {
    this.tabsActiveKey = key;
    switch (key) {
      case '2':
        this.isShow&&(await this.getJobDescribeByName());
        break;
      case '3':
        this.isShow&&(await this.getPersonAttendance());
        break;
      case '4':
        this.isShow&&(await this.getPersonTrainingByName())
        break;
      case '5':
        this.isShow&&(await this.getTechnicalDisclosureByName())
        break;
      case '6':
        this.isShow&&(await this.getSafeRectificationByName())
        break;
    }
  }

  dealFile(value) {
    // 取消上次延时未执行的方法
    clearTimeout(this.timeFn);
    this.timeFn = setTimeout(() => {
      const sysConfig = (Store.state as any).config;
      window.open(`${sysConfig.idocvServiceUrl}?url=${env.apiHost}/api/aliyun/download?refId=${value.refId}=name=${value.name}`);
    }, 300)
  }

  downLoad(record) {
    clearInterval(this.timeFn);
    window.open(`${env.apiHost}/api/aliyun/download?refId=${record.refId}`)
  }

  deletePerson() {
    if (this.selectedRowKeys.length === 0) return this.$message.warn('请选择需删除人员！')
    deletePersonById({
      appCode: this.projectCode ?? '',
      idList: this.selectedRowKeys
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('删除失败！')
      this.onTableChange('')
    })
  }

  editPerson(text, record) {
    const token = localStorage.getItem("token");
    const url = `/form/detail?schemaCode=${this.projectCode}_PersonInfo&objectId=${record.id}&sheetCode=${this.projectCode}_PersonInfo&projectName=${this.projectConfig?.projectName ?? ''}&access_token=${token}`;
    const urlReturn = `${this.$route.fullPath}&iframeAction=detail`;
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${env.portalHost}${url}`)
  }

  addPerson() {
    let urlReturn = `/application/${this.projectCode}/application-list/${this.projectCode}_PersonInfo?iframeAction=add&version=2.5.50001.71&platform=win`;
    if(!this.isDingTalk) {
      urlReturn = `/${this.projectCode}${urlReturn}`
    }
    const token = localStorage.getItem("token");
    const url = `/form/detail?schemaCode=${this.projectCode}_PersonInfo&queryCode=${this.projectCode}_PersonInfo&sheetCode=${this.projectCode}_PersonInfo&projectName=${this.projectConfig?.projectName ?? ''}&access_token=${token}&return=${encodeURIComponent(urlReturn)}`;
    this.isDingTalk?this.$router.push(url):window.open(`${env.portalHost}${url}`)
  }

  onSelectChange(selectedRowKeys, info) {
    this.selectedRowKeys = selectedRowKeys;
  }

  mounted() {
    this.getPersonTeamList();
  }


  userName:string="";
  personId :string="";
  personProjectName:string="";
  personInfoAfterClose(){
    this.tabsActiveKey="1";
    this.photo="";
    for(const key in this.basicInfo){
      this.basicInfo[key].value="";
    }
    for(const key in this.positionInfo){
      this.positionInfo[key].value="";
    }
    this.attendancePagination.current=1;
    this.attendancePagination.total=0
    this.trainingSPagination.current=1;
    this.trainingSPagination.total=0;
    this.trainingTPagination.current=1;
    this.trainingTPagination.total=0;
    this.technicalDisclosureSPagination.current=1;
    this.technicalDisclosureSPagination.total=0;
    this.technicalDisclosureTPagination.current=1;
    this.technicalDisclosureTPagination.total=0;
    this.safeRectificationDataSPagination.current=1;
    this.safeRectificationDataSPagination.total=0;
    this.safeRectificationDataTPagination.current=1;
    this.safeRectificationDataTPagination.total=0;

  }
  /* 岗位责任 */
  jobDescribe:JobDescribe={safeJobDescribe:[],projectJobDescribe:[]};
  async getJobDescribeByName(){
    const projectCode = env.project;
    const {userName,phoneNumber:phone,personProjectName:projectName}=this;
    this.jobDescribe={safeJobDescribe:[],projectJobDescribe:[]};
    try {
      const {errcode,errmsg,data} =await getJobDescribeByName({projectCode,projectName,userName,phone});
      if(errcode!==0){
        this.$message.error(`获取人员档案获取安全/项目岗位内容失败,${errmsg}`);
        return;
      }
      this.jobDescribe=data??{safeJobDescribe:[],projectJobDescribe:[]};
    } catch (error) {
      this.$message.error(`获取人员档案获取安全/项目岗位内容异常,${error}`);
    }
  }

  /* 考勤信息 */
  attendanceColumns: { title: string, dataIndex: string, width?: number, defaultSortOrder?: string, sorter?: Function,align:string,scopedSlots?:{customRender:string} }[] = [
    {
      title: '进出场',
      dataIndex: 'InOrOut',
      width: 100,
      align:"center"
    },
    {
      title: '进出日期',
      dataIndex: 'InorOutDate',
      width: 200,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.InorOutDate > b.InorOutDate ? 1 : -1,
      align:"center"
    },
    {
      title: '人体体温',
      dataIndex: 'temperature',
      width: 100,
      align:"center"
    },
    {
      title: '抓拍图片',
      dataIndex: 'imgUrl',
      width: 200,
      align:"center",
      scopedSlots:{customRender:"imgeRender"}
    },
    {
      title: '地点',
      dataIndex: 'place',
      width: 300,
      align:"center"
    },
  ];
  attendanceTableData: {personName:string,InOrOut:string,InorOutDate:string
    ,place:string,temperature:string,imgUrl:string,id:string}[] = [];
  attendancePagination={
    hideOnSinglePage:true,
    defaultCurrent:1,
    current:1,
    pageSize:10,
    total:0,
    onChange:async(pageNum:number)=>{
      this.attendancePagination.current=pageNum;
      await this.getPersonAttendance();
    }
  };
  async getPersonAttendance() {
    this.attendanceTableData = [];
    try {
      const {data, errcode, errmsg} = await getTableList({
        filters: [{propertyCode: 'personId', propertyType: 0, propertyValue: this.selectId, propertyValueName: ''}],
        mobile: false,
        page: this.attendancePagination.current-1,
        queryCode: `${this.projectCode}_personAttendance`,
        schemaCode: `${this.projectCode}_personAttendance`,
        size: this.attendancePagination.pageSize,
      });
      if(errcode!==0){
        this.$message.error(`获取人员出勤内容失败,${errmsg}`);
        return;
      }
      this.attendanceTableData = data?.content?.map(item=>{
        return {
          personName:item.data["personName"],
          InorOutDate:item.data["InorOutDate"],
          InOrOut:item.data["InOrOut"],
          place:item.data["place"]??"",
          temperature:item.data["personTemp"]??"",
          imgUrl:item.data["imageUrl"],
          id:item.data["id"],
        }
      })??[];
      this.attendancePagination.total=data?.totalElements??0;
    } catch (error) {
      this.$message.error(`获取人员出勤内容异常,${error}`);
    }
  }

  /* 培训信息 */
  trainingColumns:{ title: string, dataIndex?: string, width?: number,
    defaultSortOrder?: string, sorter?: Function,align:string,scopedSlots?:{customRender:string},
    customRender?:(text:string, record:TrainingData, index:number)=>string}[]=[
    {
      title: '培训时间',
      dataIndex: 'trainingDate',
      width: 150,
      align:"center",
      customRender:(text,record,index)=>{
        return moment(record.trainingDate).format("YYYY-MM-DD");
      }
    },
    {
      title: '培训主题',
      dataIndex: 'subjectName',
      width: 200,
      align:"center"
    },
    {
      title: '培训目的',
      dataIndex: 'trainingPurpose',
      width: 200,
      align:"center"
    },
    {
      title: '培训内容',
      dataIndex: 'content',
      width: 400,
      align:"center",
      scopedSlots:{customRender:"contentSlot"},
    },
    {
      title: '培训学时',
      dataIndex: 'trainingHour',
      width: 100,
      align:"center"
    },
    {
      title: '',
      width: 100,
      dataIndex: 'url',
      align:"center",
      scopedSlots:{customRender:"trainingAction"}
    },
  ]
  trainingSPagination={
    hideOnSinglePage:true,
    defaultCurrent:1,
    current:1,
    pageSize:10,
    total:0,
  };
  trainingTPagination={
    hideOnSinglePage:true,
    defaultCurrent:1,
    current:1,
    pageSize:10,
    total:0,
  };
  trainingTableDataS: TrainingData[] = [];
  trainingTableDataT: TrainingData[] = [];
  async getPersonTrainingByName(){
    const projectCode = env.project;
    const {userName,phoneNumber:phone,personProjectName:projectName,personId}=this;
    try {
      const result= await Promise.allSettled([getPersonTrainingByName({projectCode,projectName,userName,phone,personId,type:1})
        ,getPersonTrainingByName({projectCode,projectName,userName,phone,personId,type:2})]);
      this.trainingTableDataS=this.handleResult(result[0],"人员档案获取安全培训岗位内容");
      this.trainingSPagination.total=this.trainingTableDataS.length;
      this.trainingTableDataT=this.handleResult(result[1],"人员档案获取安全培训岗位内容");
      this.trainingTPagination.total=this.trainingTableDataT.length;
    } catch (error) {
      this.$message.error(`获取人员档案获取安全培训岗位内容异常,${error}`);
    }
  }

  /* 交底信息 */
  technicalDisclosureColumns:{ title: string, dataIndex?: string, width?: number,
    defaultSortOrder?: string, sorter?: Function,align:string,scopedSlots?:{customRender:string},
    customRender?:(text:string, record:TechnicalDisclosureData, index:number)=>string}[]=[
    {
      title: '交底时间',
      dataIndex: 'disclosurDate',
      width: 150,
      align:"center",
      customRender:(text,record,index)=>{
        return moment(record.disclosurDate).format("YYYY-MM-DD");
      }
    },
    {
      title: '交底内容',
      dataIndex: 'content',
      width: 400,
      align:"center",
      scopedSlots:{customRender:"contentSlot"},
    },
    {
      title: '',
      width: 100,
      dataIndex: 'url',
      align:"center",
      scopedSlots:{customRender:"trainingAction"}
    },
  ]
  technicalDisclosureSPagination={
    hideOnSinglePage:true,
    defaultCurrent:1,
    current:1,
    pageSize:10,
    total:0,
  };
  technicalDisclosureTPagination={
    hideOnSinglePage:true,
    defaultCurrent:1,
    current:1,
    pageSize:10,
    total:0,
  };
  technicalDisclosureDataS:TechnicalDisclosureData[]=[];
  technicalDisclosureDataT:TechnicalDisclosureData[]=[];
  async getTechnicalDisclosureByName(){
    const projectCode = env.project;
    const {userName,phoneNumber:phone,personProjectName:projectName}=this;
    try {
      const result= await Promise.allSettled([getTechnicalDisclosureByName({projectCode,projectName,userName,phone,type:1})
        ,getTechnicalDisclosureByName({projectCode,projectName,userName,phone,type:2})]);
      this.technicalDisclosureDataS=this.handleResult(result[0],"人员档案获取技术交底内容");
      this.technicalDisclosureSPagination.total=this.technicalDisclosureDataS.length;
      this.technicalDisclosureDataT=this.handleResult(result[1],"人员档案获取技术交底内容");
      this.technicalDisclosureTPagination.total=this.technicalDisclosureDataT.length;
    } catch (error) {
      this.$message.error(`获取人员档案获取技术交底内容异常,${error}`);
    }
  }

  /* 整改信息 */
  safeRectificationDataSColumns:{ title: string, dataIndex?: string, width?: number,
    defaultSortOrder?: string, sorter?: Function,align:string,scopedSlots?:{customRender:string},
    customRender?:(text:string, record:SafeRectificationData, index:number)=>string}[]=[
    {
      title: '整改时间',
      dataIndex: 'disclosurDate',
      width: 150,
      align:"center",
      customRender:(text,record,index)=>{
        return moment(record.rectificationDate).format("YYYY-MM-DD");
      }
    },
    {
      title: '隐患类型',
      dataIndex: 'hazardType',
      width: 150,
      align:"center",
    },
    {
      title: '隐患分类',
      dataIndex: 'hazardClassification',
      width: 150,
      align:"center",
    },
    {
      title: '隐患情况',
      dataIndex: 'hazardContent',
      width: 200,
      align:"center",
    },
    {
      title: '整改落实情况',
      dataIndex: 'result',
      width: 200,
      align:"center",
    },
    {
      title: '',
      width: 100,
      dataIndex: 'url',
      align:"center",
      scopedSlots:{customRender:"trainingAction"}
    },
  ]
  safeRectificationDataTColumns:{ title: string, dataIndex?: string, width?: number,
    defaultSortOrder?: string, sorter?: Function,align:string,scopedSlots?:{customRender:string},
    customRender?:(text:string, record:SafeRectificationData, index:number)=>string}[]=[
    {
      title: '通知时间',
      dataIndex: 'noticeDate',
      width: 150,
      align:"center",
      customRender:(text,record,index)=>{
        return moment(record.noticeDate).format("YYYY-MM-DD");
      }
    },
    {
      title: '隐患类型',
      dataIndex: 'hazardType',
      width: 150,
      align:"center",
    },
    {
      title: '隐患分类',
      dataIndex: 'hazardClassification',
      width: 150,
      align:"center",
    },
    {
      title: '隐患情况',
      dataIndex: 'hazardContent',
      width: 200,
      align:"center",
    },
    {
      title: '整改落实情况',
      dataIndex: 'result',
      width: 200,
      align:"center",
    },
    {
      title: '',
      width: 100,
      dataIndex: 'url',
      align:"center",
      scopedSlots:{customRender:"trainingAction"}
    },
  ]
  safeRectificationDataSPagination={
    hideOnSinglePage:true,
    defaultCurrent:1,
    current:1,
    pageSize:10,
    total:0,
  };
  safeRectificationDataTPagination={
    hideOnSinglePage:true,
    defaultCurrent:1,
    current:1,
    pageSize:10,
    total:0,
  };
  safeRectificationDataS:SafeRectificationData[]=[];
  safeRectificationDataT:SafeRectificationData[]=[];
  async getSafeRectificationByName() {
    const projectCode = env.project;
    const {userName,phoneNumber:phone,personProjectName:projectName,personId}=this;
    try {
      const result= await Promise.allSettled([getSafeRectificationByName({projectCode,projectName,userName,phone,personId,type:1})
        ,getSafeRectificationByName({projectCode,projectName,userName,phone,type:2,personId})]);
      this.safeRectificationDataS=this.handleResult(result[1],"人员档案获取安全整改内容");
      this.safeRectificationDataSPagination.total=this.safeRectificationDataS.length;
      this.safeRectificationDataT=this.handleResult(result[0],"人员档案获取安全整改内容");
      this.safeRectificationDataTPagination.total=this.safeRectificationDataT.length;
    } catch (error) {
      this.$message.error(`获取人员档案获取安全整改内容异常,${error}`);
    }
  }

  isImgShow=false;
  bigImgUrl="";
  attendanceClick(url:string){
    if(url){
      this.isImgShow=true;
      this.bigImgUrl=url;
    }
  }
  /* Common */
  //处理分页点击
  handleTablePaginationChange(pagination,targetPagination){
    const pager={...targetPagination};
    pager.current=pagination.current;
    this.$set(targetPagination,"current",pagination.current);
  }
  //处理详情跳转
  actionClick(url:string){
    const router = this.$router.resolve({
      path: `/form/detail?${url}`,
    });
    window.open(router.href);
  }
  //数据处理
  handleResult<T>(result:PromiseSettledResult<HttpResponse<T>>,dataName:string){
    if(result.status==="rejected"){
      this.$message.error(`获取${dataName}异常,${result.reason}`);
      return [];
    }
    const {errcode,errmsg,data}=result.value;
    if(errcode!==0){
      this.$message.error(`获取${dataName}失败,${errmsg}`);
      return [];
    }
    return data??[];
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

.person-management {
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

/deep/.personInfo{
  .ant-modal-content{
    display: flex;
    flex-flow: column nowrap;
    max-height: 800px;
    .ant-modal-body{
      display: flex;
      flex-flow: column nowrap;
      flex: 1;
      padding: 5px;
      overflow: hidden;
    }
  }
}

.right-top {
  > .p_title {
    .title;
    margin-bottom: @spacing-large;
  }

  .pic {
    padding-right: 2 * @spacing-large;
    padding-left: @spacing-large;

    img {
      width: 200px;
      height: 210px; //7/5
    }
  }

  .basic {
    /deep/ .ant-col {
      padding: 1/2 * @spacing-base 0 @spacing-base 0;
    }

    .box {
      display: flow-root;
      margin-bottom: @spacing-large;

      .title {
        .title
      }

      > div:last-child {
        padding-left: @spacing-large;
      }
    }
  }
}

.right-bottom {
  flex: 1;
  margin-top: @spacing-large;
  padding-bottom: @spacing-base;
  .postBox{
    padding: 0 20px;
    display: flex;
    flex-flow: row nowrap;
    .postTitle{
      height: 50px;
      padding-left: 20px;
      flex: 1;
      line-height: 50px;
      background-color: #fafafa;
      border-bottom: 1px solid #e8e8e8;
    }
    .postContext{
      flex: 1;
      min-height: 180px;
      max-height: 280px;
      padding-left: 20px;
      overflow-y: auto;
      p{
        word-break: break-word;
      }
    }
  }
  .attendancImgBox{
    height: 100px;
    img{
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
    }
  }
  .trainingAction{
    margin-bottom: 5px;
  }
  .wrap{
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
