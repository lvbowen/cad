<template>
  <div class="organization-view full-height">
    <a-card title="组织机构" class="full-height flex flex-column">
      <div class="flex full-height">
        <a-card class="left full-height">
          <a-input-search
            style="margin-bottom: 8px"
            placeholder="请输入关键字"
            @change="onChange"
            @pressEnter="EnterSearchOne"
            @search="onSearchOne"/>
          <a-tree
            :treeData="treeData"
            :replaceFields="replaceFields"
            :defaultExpandAll="true"
            :defaultSelectedKeys="defaultSelectedKeys"
            :expandedKeys="expandedKeys"
            :autoExpandParent="autoExpandParent"
            @expand="onExpand"
            @select="selectTreeNode"
            :key="treeKey">
            <template slot="title" slot-scope="title">
              <span v-if="title.name.indexOf(searchValue) > -1">
                {{ title.name.substr(0, title.name.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ title.name.substr(title.name.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else>{{ title.name }}</span>
            </template>
          </a-tree>
        </a-card>
        <a-card class="right full-height flex flex-column">
          <div slot="title">
            <span class="title-set">{{
              curSelectedTreeNode ? curSelectedTreeNode.name : '未选择部门'
            }}</span>
            <a-popconfirm :title="`确认删除部门${curSelectedTreeNode && curSelectedTreeNode.name}，删除后不可恢复哦，确认删除吗？`" @confirm="deleteDepInfo">
              <a-icon type="delete" v-show="curSelectedTreeNode&&curSelectedTreeNode.editFlag"/>
            </a-popconfirm>
          </div>
          <div slot="extra" v-show="curSelectedTreeNode&&curSelectedTreeNode.editFlag">
            <a-button type="primary" @click="openDepModal">新建部门</a-button>
            <a-button type="primary" @click="openPerModal">新建员工</a-button>
          </div>
          <a-table
            v-show="curSelectedTreeNode"
            :data-source="tableData"
            :columns="tableColumns"
            :loading="tableLoading"
            :pagination="{
              pageSize: this.pageSize,
              total: this.curNodeUsersTotal,
              pageNum: this.pageNum,
              onChange: this.paginationChange
            }"
            :key="tableKey"
          >
            <template slot="operation" slot-scope="text,record">
              <div class="editable-row-operations">
                <a type="link" @click="getUserInfo(record.id,2)">查看</a>
                <a
                  type="link"
                  style="color: #3BB141"
                  @click="getUserInfo(record.id,1)"
                  v-show="curSelectedTreeNode&&curSelectedTreeNode.editFlag">编辑</a>
                <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteUserInfo(record.id)">
                  <a type="link" style="color: #DE1037" v-show="curSelectedTreeNode&&curSelectedTreeNode.editFlag">删除</a>
                </a-popconfirm>
              </div>
            </template>
          </a-table>
        </a-card>
      </div>
    </a-card>
    <a-modal
      :visible="addDepVisible"
      title="新建部门"
      :maskClosable="false"
      :destroyOnClose="true"
      @ok="addDep"
      @cancel="cancelAddDep"
    >
      <a-form class="add-department" :autoFormCreate="(form) => { this.form = form }">
        <a-form-item
          label="上级部门"
          fieldDecoratorId="department"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          :fieldDecoratorOptions="rules.department"
        >
          <staff-selector
            :options="deptOpts"
            :disabled="true"
            :params="{ corpId: corpId, filterType: 'admin_corp' }"
          ></staff-selector>
        </a-form-item>
        <a-form-item
          label="部门名称"
          fieldDecoratorId="deptName"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          :fieldDecoratorOptions="rules.deptName"
        >
          <a-input
            class="dept__name"
            maxlength="50"
            placeholder="请输入名称"/>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-drawer
      width="850"
      placement="right"
      @close="onCloseInfoModal"
      :closable="true"
      :title="`${!userType?'新建员工':userType===1?'编辑员工信息':'查看员工信息'}`"
      :visible="userVisible"
      wrapClassName="add-user-drawer"
    >
      <div class="add-user-wrapper">
        <div class="box-item">
          <div class="item-title">基本信息</div>
          <div class="item-child">
            <p class="left-header item-avator-name">头像</p>
            <div class="item-avator">
              <a-upload :showUploadList="false" :beforeUpload="beforeUpload">
                <div
                  :class="[
                    'item-avator__icon',
                    { 'item-avator__icon--loading': uploading },
                  ]"
                >
                  <img
                    v-if="userInfo.imgUrl && userInfo.imgUrl.includes('http')"
                    :src="userInfo.imgUrl"
                  />
                  <img v-else-if="userInfo.imgUrl" :src="getDownloadUrl(userInfo.imgUrl)" />
                  <span v-if="!userInfo.imgUrl" class="icon aufontAll h-icon-all-normal_smile"></span>
                  <i class="icon aufontAll h-icon-all-form-o" />
                  <i class="icon aufontAll h-icon-all-loading-o" />
                </div>
              </a-upload>
              <div class="avator-tips">图片为png/jpg格式，大小100K以内</div>
            </div>
          </div>
          <div class="item-child">
            <div class="child-left">
              <p class="left-header required">用户姓名</p>
              <div class="edit-text" :class="{ 'err-input': userValid.name.valid }">
                <a-input
                  v-model="userInfo.name"
                  class="input-text"
                  :maxLength="30"
                  :disabled="userType === 1"
                  @change="userValid.name.valid = false"
                  placeholder="请输入用户名称"
                />
                <p class="err-tips" v-if="userValid.name.valid">{{ userValid.name.errMsg }}</p>
              </div>
            </div>
            <div class="child-right">
              <p class="left-header required">用户账号</p>
              <div class="edit-text" :class="{ 'err-input': userValid.username.valid }">
                <a-input
                  v-model="userInfo.userId"
                  class="input-text"
                  :maxLength="32"
                  :disabled="userType === 1"
                  @change="userValid.username.valid = false"
                  placeholder="请输入账号"
                />
                <p class="err-tips" v-if="userValid.username.valid">{{ userValid.username.errMsg }}</p>
              </div>
            </div>
          </div>
          <div class="item-child">
            <div class="child-left">
              <p class="left-header required">所属主部门</p>
              <!-- //TODO 暂无主部门数据，以多部门中的首个代替 -->
              <div class="edit-text" :class="{ 'err-input': userValid.mainDepartment.valid }">
                <staff-selector
                  v-model="mainDepartment"
                  :params="StuffSelectParams"
                  :options="deptOpts"
                  :disabled="true"
                  :keepDeptIds="mainDeptKeepIds"
                  @change="userValid.mainDepartment.valid = false"
                  class="user-info-staff"
                ></staff-selector>
                <p
                  class="err-tips"
                  v-if="userValid.mainDepartment.valid"
                >{{ userValid.mainDepartment.errMsg }}</p>
              </div>
            </div>
            <!--兼职部门-->
            <div class="child-right">
              <p class="left-header">兼职部门</p>
              <div class="edit-text">
                <staff-selector
                  v-model="userInfo.departmentNames"
                  :params="StuffSelectParams"
                  :options="otherDeptOpts"
                  :keepDeptIds="partTimeDeptKeepIds"
                ></staff-selector>
              </div>
            </div>
          </div>
          <div class="item-child">
            <div class="child-content">
              <p class="left-header">角色</p>
              <div class="edit-text">
                <role-select
                  :defaultValue="userInfo.roleIds"
                  :showParent="false"
                  :expandAll="true"
                  defaultValueKey="id"
                  :params="roleParams"
                  :multiple="true"
                  :filterDefaultRoleGroup="true"
                  @select="selectRole"
                  :keepRoles="keepRolesList"
                  :filterKey="codeProp"
                ></role-select>
              </div>
            </div>
          </div>
        </div>
        <div class="box-item">
          <div class="item-title">联系方式</div>
          <div class="item-child">
            <div class="child-left">
              <p class="left-header required">手机号</p>
              <div class="edit-text" :class="{ 'err-input': userValid.mobile.valid }">
                <a-input
                  v-model="userInfo.mobile"
                  class="input-text"
                  :maxLength="20"
                  :disabled="userType === 1"
                  @change="userValid.mobile.valid = false"
                  placeholder="请输入手机号码"
                />
                <p class="err-tips" v-if="userValid.mobile.valid">{{ userValid.mobile.errMsg }}</p>
              </div>
            </div>
            <div class="child-right">
              <p class="left-header">办公电话</p>
              <div class="edit-text">
                <a-input
                  v-model="userInfo.officePhone"
                  class="input-text"
                  :maxLength="20"
                  placeholder="请输入电话"
                />
              </div>
            </div>
          </div>
          <div class="item-child">
            <div class="child-left">
              <p class="left-header">邮箱</p>
              <div class="edit-text" :class="{ 'err-input': userValid.email.valid }">
                <a-input
                  v-model="userInfo.email"
                  class="input-text"
                  :maxLength="50"
                  @change="userValid.email.valid = false"
                  placeholder="请输入邮箱"
                />
                <p class="err-tips" v-if="userValid.email.valid">{{ userValid.email.errMsg }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="box-item">
          <div class="item-title">员工信息</div>
          <div class="item-child">
            <div class="child-left">
              <p class="left-header">员工编号</p>
              <div class="edit-text" :class="{ 'err-input': userValid.employeeNo.valid }">
                <a-input
                  v-model="userInfo.employeeNo"
                  class="input-text"
                  :maxLength="20"
                  @change="userValid.employeeNo.valid = false"
                  placeholder="请输入员工编号"
                />
                <p
                  class="err-tips"
                  v-if="userValid.employeeNo.valid"
                >{{ userValid.employeeNo.errMsg }}</p>
              </div>
            </div>
            <div class="child-right">
              <p class="left-header">入职时间</p>
              <div class="edit-text">
                <a-date-picker class="entry-date" v-model="userInfo.entryDate" />
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <a-button type="primary" @click="editUserData()" v-show="[0,1].includes(userType)">保存</a-button>
        </div>
      </div>
    </a-drawer>
    <application-list class="divide"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import {DepUser, Department} from "../type";
import {
  getDepartments,
  getDepartmentUsers,
  getDeptInfo,
  addDepartment,
  getUserInfoById,
  addDepartmentUser,
  deleteUserInfo,
  deleteDepInfo, updataDepartmentUser
} from "../../../service/api";
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Form from 'ant-design-vue/lib/form';
import 'ant-design-vue/lib/form/style/index.css';
import Drawer from 'ant-design-vue/lib/drawer';
import 'ant-design-vue/lib/drawer/style/index.css';
import Upload from 'ant-design-vue/lib/upload';
import 'ant-design-vue/lib/upload/style/index.css';
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import {Utils} from "../../../../../../modules/@ctesi/core";
import {nameValidator} from "@cloudpivot/form/utils";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import list from "../../../../../../modules/@cloudpivot/list/pc";
import env from '@/config/env';
import moment from "moment";
import appBaseApi from "./base.api";
import common from "@cloudpivot/common/pc";

@Component({
  name: 'OrganizationView',
  components: {
    ATree: Tree,
    ACard: Card,
    AIcon: Icon,
    ATable: Table,
    AButton: Button,
    APopconfirm: Popconfirm,
    AInputSearch: Input.Search,
    AModal: Modal,
    AForm: Form,
    AFormItem: Form.Item,
    AInput: Input,
    ADrawer: Drawer,
    AUpload: Upload,
    APopover: Popover,
    staffSelector,
    ApplicationList: list.components.ApplicationList,
    RoleSelect: common.components.RoleSelect,
  }
})
export default class OrganizationView extends Vue {
  @InjectReactive('project') projectCode!: string;
  //tree
  treeData: Department[] = [];
  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'name', key: 'id'
  };
  curSelectedTreeNode: Department | null = null;
  treeKey: number = 1;
  autoExpandParent: boolean = true;
  expandedKeys: Array<string> = [];
  //table
  tableData: DepUser[] = [];
  dataList: DepUser[] = [];
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
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 140
    },
    {
      title: '所属角色',
      dataIndex: 'roleName',
      key: 'roleName',
      ellipsis: true
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 150,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  tableKey: number = 1;
  pageSize: number = 10;
  pageNum: number = 1;
  curNodeUsersTotal: number = 0;
  searchValue: string = '';
  defaultSelectedKeys: string[] = [];
  tableLoading: boolean = false;
  visibleSetting: boolean = false;
  //dep
  addDepVisible: boolean = false;
  form: any = {};
  formItemLayout: any = {
    labelCol: {
      span: 6
    },
    wrapperCol: {
      span: 18
    }
  };
  rules: any = {};
  deptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    appManagerFilter: true,
    rootNode: [],
    deptEdit: 'add',
    selectedDepId: ''
  };
  corpId: string = '';//新增部门只能展示当前组织下的部门
  //per
  userVisible: boolean = false;
  userInfo: any = {
    name: "",
    mobile: "",
    userId: "",
    departmentNames: [],
    roleIds: [],
    userExtAttrModels: []
  };
  userValid: any = {
    name: {
      valid: false,
      errMsg: "仅限50个字符以内",
    },
    username: {
      valid: false,
      errMsg: "仅限20个字符以内，且仅支持输入字母和数字",
    },
    mainDepartment: {
      valid: false,
      errMsg: "主部门不允许为空",
    },
    mobile: {
      valid: false,
      errMsg: "请输入正确的手机号码",
    },
    email: {
      valid: false,
      errMsg: "邮箱格式错误",
    },
    employeeNo: {
      valid: false,
      errMsg: "员工编号只允许字母和数字",
    },
  };
  uploading: boolean = false; // 是否上传中
  file: File | null = null; // 上传的图片文件
  userType: number = 0; // 0：新增，1：编辑,2:查看
  mainDepartment: any = []; // 主部门
  curCorpId: string = "";// 当前用户所属组织的corpId
  mainDeptKeepIds: string[] = [];
  partTimeDeptKeepIds: string[] = [];
  otherDeptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: true,
    showSelect: true,
    placeholder: "请选择",
    appManagerFilter: true,
    rootNode: []
  };
  selectUserId: string = '';
  //角色
  codeProp: string = "code";
  keepRolesList: any = [{ code: "SYS_2000000" }, { code: "SYS_1000000" }];
  selectTreeNode(selectedKeys, e) {
    this.deptOpts.selectedDepId = '';
    this.tableData = [];
    this.defaultSelectedKeys = selectedKeys;
    this.pageNum = 1;
    this.pageSize = 10;
    selectedKeys.includes(e.node.dataRef.id) ? this.curSelectedTreeNode = e.node.dataRef : this.curSelectedTreeNode = null;
    if (selectedKeys.length) {
      this.tableKey++;
      this.getDepartmentUsers();
      this.getDepInfo();
    }
  }
  getPerOrg() {
    this.treeData = [];
    this.expandedKeys = [];
    this.defaultSelectedKeys = [];
    getDepartments({appCode: this.projectCode ?? ''}).then((res) => {
      if (res.errcode !== 0 ) return this.$message.error(res.errmsg as string);
      if (res.data && res.data.length) {
        this.treeData = res.data;
        this.generateList(this.treeData);
        Utils.deepFind(this.treeData, (item) => {
          item.scopedSlots = {
            title: "title"
          }
          this.expandedKeys.push(item.id);
          return false
        }, 'children')
        this.treeKey++;
        this.curSelectedTreeNode = res.data[0];
        this.defaultSelectedKeys.push(res.data[0].id);
        this.getDepInfo();
        this.getDepartmentUsers();
      }
    })
  }
  hideSetting() {
    this.visibleSetting = false
  }

  generateList(data) {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.name;
      this.dataList.push({id: node.id as string, name: key as string});
      if (node.children) {
        this.generateList(node.children);
      }
    }
  }

  getDepartmentUsers() {
    this.tableLoading = true;
    getDepartmentUsers({
      appCode: this.projectCode ?? '',
      deptId: this.curSelectedTreeNode?.id ?? '',
      pageNum: this.pageNum-1,
      pageSize: this.pageSize
    }).then((res) => {
      if (res.errcode !== 0 && res.errcode !== 1000) return this.$message.error(res.errmsg as string);
      if (res.errcode === 1000) return this.$message.warning(res.errmsg as string)
      if (res.data && res.data.content) {
        this.tableData = res.data?.content ?? [];
        this.curNodeUsersTotal =  res.data?.totalElements??0;
        // this.pageNum = res.data?.totalPages??1

      }
    }).finally(()=> {
      this.tableLoading = false;
    })
  }

  private paginationChange( page: number, pageSize: number ) {
    console.log(page,'pageNum')
    this.pageNum = page;
    this.pageSize = pageSize;
    this.getDepartmentUsers();
  }

  onChange(e) {
    const value = e.target.value;
    // const expandedKeys = this.dataList
    //   .map(item => {
    //     if (item.name.indexOf(value) > -1) {
    //       return this.getParentKey(item.id, this.treeData);
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
        if (item.name.indexOf(value) > -1) {
          return this.getParentKey(item.id, this.treeData);
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
  EnterSearchOne(e){
    const value = e.target.value;
    this.Search(value)
  }
  onSearchOne(value){
    console.log(value)
    this.Search(value)
  }

  getParentKey(key, tree) {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.id === key)) {
          parentKey = node.id;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  }

  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }

  addDep() {
    this.form.validateFields((err: any) => {
      if (!err) {
        const deptName = this.form.getFieldValue('deptName');
        const department = this.form.getFieldValue('department');
        addDepartment({
          appCode: this.projectCode ?? '',
          departmentName: deptName,
          deptId: department[0].id
        }).then((res) => {
          if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
          this.$message.success('新增部门成功')
          this.addDepVisible = false;
          this.getPerOrg();
        })
      }
    })
  }

  //获取当前节点或部门的信息
  getDepInfo() {
    getDeptInfo({deptId: this.curSelectedTreeNode?.id ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.corpId = res.data.corpId;
        Object.assign(this.deptOpts,{selectedDepId: this.defaultSelectedKeys[0] })
      }
    })
  }

  onValueChangeDep(val) {

  }
  openDepModal() {
    this.addDepVisible = true;
    this.$nextTick(() => {
      if (this.form.setFieldsValue) {
        this.form.setFieldsValue({
          department: [{
            name: this.curSelectedTreeNode?.name ?? '',
            id: this.curSelectedTreeNode?.id ?? '',
            unitType: 1
          }],
        });
      }
    });
  }
  cancelAddDep() {
    this.addDepVisible = false
  }
  openPerModal() {
    this.userVisible = true;
    this.mainDepartment = [
      {
        name: this.curSelectedTreeNode?.name??'',
        id: this.curSelectedTreeNode?.id??'',
        unitType: 1,
      },
    ];
  }
  addPerson() {
  }
  cancelAddPer() {
    this.userVisible = false
  }
  onCloseInfoModal() {
    this.userType = 0;
    this.selectUserId = '';
    this.userVisible = false;
    this.userInfo = {
      departmentNames: [],
      roleIds: [],
      name: "",
      mobile: "",
      userId: "",
      userExtAttrModels: []
    };
    this.resetUserValid();
  }
  resetUserValid() {
    this.userValid = {
      name: {
        valid: false,
        errMsg: "用户姓名不合法",
      },
      username: {
        valid: false,
        errMsg: "账号不合法",
      },
      mainDepartment: {
        valid: false,
        errMsg: "主部门不允许为空",
      },
      mobile: {
        valid: false,
        errMsg: "手机号格式不合法",
      },
      email: {
        valid: false,
        errMsg: "邮箱格式错误",
      },
      employeeNo: {
        valid: false,
        errMsg: "员工编号只允许字母和数字",
      },
    };
  }
  setRules() {
    this.rules = {
      department: {
        rules: [
          {
            required: true,
            message: '上级部门不能为空'
          }
        ]
      },
      deptName: {
        rules: [
          {
            required: true,
            message: '部门名称不能为空'
          },
          {
            validator: nameValidator,
            message: '仅限50个字符以内，并不能以空格开头'
            // 仅限50个字符以内，并不能以空格开头
          }
        ]
      }
    };
  }

  /**
   * 获取上传的应用图标并判断是否符合限制
   */
  beforeUpload(file: File) {
    this.uploading = true;
    this.$nextTick(() => {
      this.uploading = false;
    });
    const isPic = ["image/jpeg", "image/png"].includes(file.type);
    const isLimitSize = file.size / 1024 < 100;
    if (!isPic) {
      this.$message.error('请上传图片类型的文件');
      return false;
    }
    if (!isLimitSize) {
      this.$message.error(`图片大小不得超过100KB`);
      return false;
    }
    if (isPic && isLimitSize) {
      this.file = file;
      const URL = window.URL || (window as any).webkitURL;
      this.userInfo.imgUrl = URL.createObjectURL(file);
    }
    return false;
  }
  get apiHost() {
    return env.apiHost;
  }
  get roleParams() {
    // // 新增人员的时候需要过滤主管角色
    return { roleType: "SYS" };
  }
  getDownloadUrl(refId: string) {
    if (!refId) {
      return "";
    } else if (refId.indexOf("http") > -1) {
      return refId;
    } else {
      let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
      if (localStorage.getItem( "token" )) {
        url += "&access_token=" + localStorage.getItem( "token" );
      }
      return url;
    }
  }
  async getUserInfo(id: string,flag:number) {
    this.selectUserId = id;
    this.userType = flag;
    const params = {
      id: id,
    };
    const res = await getUserInfoById(params);
    if (res.errcode === 0 && res.data) {
      this.curCorpId = res.data.corpId;
      this.userInfo = res.data;
      this.userInfo.entryDate = this.userInfo.entryDate
        ? moment(this.userInfo.entryDate, "YYYY-MM-DD")
        : null;
      // 设置主部门
      this.mainDepartment = this.userInfo.mainDepartmentName
        ? [
          {
            name: this.userInfo.mainDepartmentName.name,
            id: this.userInfo.mainDepartmentName.id,
            unitType: 1,
            operatable: this.userInfo.mainDepartmentName.operatable,
          },
        ]
        : [];
      this.mainDeptKeepIds = this.mainDepartment.map((item: any) => {
        if (!item.operatable) {
          return item.id;
        }
      });
      this.partTimeDeptKeepIds = (res.data.departmentNames || []).map(
        (item: any) => {
          if (!item.operatable) {
            return item.id;
          }
        }
      );
      this.openPerModal();
    }
  }
  get StuffSelectParams() {
    const { userType } = this;
    const cid: string = userType === 1 ? this.curCorpId : this.corpId;
    return { corpId: cid, filterType: "admin_corp" };
  }
  async editUserData(id?:string) {
    const isDataOk: boolean = this.validInfo();
    if (!isDataOk) {
      return;
    }
    let imgUrl = "";
    if (this.file) {
      this.uploading = true;
      const res: any = await appBaseApi.uploadFile({file: this.file});
      this.userInfo.imgUrlId = res.data.refId;
      this.uploading = false;
      this.file = null;
      imgUrl = `${res.data.refId}${res.data.name}` as any;
    }

    const deptIds = this.userInfo.departmentNames
      ? this.userInfo.departmentNames.map((dept: any) => {
        return dept.id;
      })
      : [];

    const entryTime = this.userInfo.entryDate
      ? moment(this.userInfo.entryDate).format("YYYY-MM-DD")
      : null;
    // 新建用户接口
    let params: any = {
      departmentId: this.mainDepartment[0] ? this.mainDepartment[0].id : "",
      deptIds,
      roleIds: this.userInfo.roleIds,
      username: this.userInfo.userId,
      name: this.userInfo.name,
      mobile: this.userInfo.mobile,
      officePhone: this.userInfo.officePhone,
      email: this.userInfo.email,
      employeeNo: this.userInfo.employeeNo,
      entryTime,
      imgUrl: imgUrl ? imgUrl : this.userInfo.imgUrl,
      imgUrlId: this.userInfo.imgUrlId,
      // userUnion: userExtParams
    };
    if(this.userType) {
      Object.assign(params,{ id: this.selectUserId})
    }
    const api = this.userType===1?updataDepartmentUser:addDepartmentUser
    api({appCode: this.projectCode??'',deptId:this.curSelectedTreeNode?.id??'',user:params}).then((res)=> {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('保存成功')
    }).finally(()=> {
      this.onCloseInfoModal();
      this.getDepartmentUsers();
    })
  }
  deleteUserInfo(id:string) {
    deleteUserInfo({appCode: this.projectCode ?? '', deptId: this.curSelectedTreeNode?.id ?? '',userId:id}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.getDepartmentUsers();
    })
  }
  deleteDepInfo() {
    deleteDepInfo({appCode: this.projectCode ?? '', deptId: this.curSelectedTreeNode?.id ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.getPerOrg();
    })
  }
  // 校验用户信息合法性
  validInfo() {
    let flag = true;
    // 校验用户姓名
    if (
      this.isAdd() &&
      (!this.userInfo.name ||
        !/^[a-zA-Z0-9\u4e00-\u9fa5]{1,29}$/.test(this.userInfo.name))
    ) {
      // 仅限30个字符以内，并不能以空格开头
      this.userValid.name.valid = true;
      flag = false;
    }

    // 校验用户账号
    if (
      this.isAdd() &&
      (!this.userInfo.userId ||
        !/^[a-zA-Z0-9]{1,32}$/.test(this.userInfo.userId))
    ) {
      // 仅支持字母、数字、不超过32个字符
      this.userValid.username.valid = true;
      flag = false;
    }

    // 校验主部门
    if (!this.mainDepartment || !this.mainDepartment.length) {
      this.userValid.mainDepartment.valid = true;
      flag = false;
    }

    // 校验手机号
    if (
      this.isAdd() &&
      !/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(this.userInfo.mobile)
    ) {
      this.userValid.mobile.valid = true;
      flag = false;
    }

    // 校验邮箱
    if (
      this.userInfo.email &&
      !/^[A-Za-z0-9\u4e00-\u9fa5]+((\.[a-zA-Z0-9\u4e00-\u9fa5_-]+)+)?@[a-zA-Z0-9\u4e00-\u9fa5_-]+(\.[a-zA-Z0-9\u4e00-\u9fa5_-]+)+$/.test(
        this.userInfo.email
      )
    ) {
      this.userValid.email.valid = true;
      flag = false;
    }

    // 校验员工编号
    if (
      this.userInfo.employeeNo &&
      !/^[a-zA-Z0-9]{1,32}$/.test(this.userInfo.employeeNo)
    ) {
      // 仅支持字母、数字、不超过20个字符
      this.userValid.employeeNo.valid = true;
      flag = false;
    }

    return flag;
  }
  isAdd() {
    return this.userType !== 1;
  }
  selectRole(value: any[]) {
    if (!value || !value.length) {
      this.userInfo.roleIds = [];
      return;
    }
    this.userInfo.roleIds = value.map((role: any) => {
      return role.id;
    });
  }
  beforeMount() {
    this.setRules();
  }
  mounted() {
    this.getPerOrg()
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';

.organization-view {
  .r-corlor {
    color: red;
  }
  .left {
    width: 23%;
    margin-right: @spacing-large;

    /deep/ .ant-card-body {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: @spacing-large 0;

      > span {
        padding-right: @spacing-base;
        padding-left: @spacing-base;
      }
    }
  }

  .right {
    width: calc(77% - @spacing-large);

    /deep/ .ant-card-body {
      height: 100%;
      overflow: auto;
    }

    .title-set {
      margin-right: @spacing-base;
    }

    .ant-btn {
      margin-right: @spacing-base;
    }
    .editable-row-operations a {
      margin-right: 8px;
    }
    .anticon:hover {
      cursor: pointer;
    }
  }

  /deep/ .ant-card-body {
    height: calc(100% - 48px);
  }
  .divide {
    position: absolute;
    left: -9999px;
  }
}

/deep/ .ant-tree {
  overflow: auto;
  height: 100% !important;
  padding-left: @spacing-base;
}

.add-user-wrapper {
  padding: 0;
  height: 100%;
  overflow: auto;

  .role-selector__span {
    float: left;
  }

  .box-item {
    padding: 21px 0 19px;
    border-bottom: 1px solid rgb(232, 232, 232);
    &.last {
      border-bottom: 0 none;
      padding-bottom: 50px;
    }
    .item-title {
      padding-bottom: 6px;
      text-align: left;
      font-size: 16px;
      color: #000;
      font-weight: 600;
    }
    .item-child {
      font-size: 0;
      padding: 8px 0;
      p,
      .edit-text {
        display: inline-block;
        vertical-align: top;
        margin-bottom: 0;
      }
      .edit-text {
        width: 70%;
        .ant-radio-wrapper {
          margin-right: 46px;
        }
        .entry-date {
          width: 100%;
        }
        /deep/ .h3-organization__label {
          max-height: 33px;
          overflow-y: auto;
          overflow-x: hidden;
          white-space: normal;
        }
        &.err-input {
          position: relative;
          /deep/ .ant-input,
          .h3-organization__label {
            border-color: #f5222d !important;
            &:focus {
              box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
            }
          }
          .err-tips {
            font-size: 12px;
            color: #f5222d;
            text-align: left;
            line-height: 20px;
            position: absolute;
            top: 30px;
            left: 8px;
          }
        }
      }
      .item-avator-name {
        display: inline-block;
        vertical-align: top;
        font-size: 14px;
      }
      .item-avator {
        display: inline-block;
        vertical-align: top;
        border-radius: 4px;
        overflow: hidden;
        .avator-tips {
          font-size: 14px;
          margin-top: 8px;
          color: rgba(0, 0, 0, 0.45);
        }
      }
      .child-left,
      .child-right,
      .child-content {
        font-size: 14px;
      }
      .child-left,
      .child-right {
        display: inline-block;
        vertical-align: top;
        width: 50%;
      }
      .child-content {
        width: 100%;
        .edit-text {
          width: 85%;
          .role-selector__wrap {
            width: 100%;
            .role-selector__input {
              width: 100%;
            }
          }
        }
      }
      .left-header {
        width: 80px;
        margin-right: 8px;
        margin-left: 8px;
        color: rgba(0, 0, 0, 0.65);
        &.required {
          position: relative;
          &:before {
            content: "*";
            color: @error-color;
            position: absolute;
            left: -0.5em;
          }
        }
      }
    }
  }
  .footer {
    text-align: center;
    position: absolute;
    height: 50px;
    line-height: 50px;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 6;
    background: #fff;
    border-top: 1px solid #e8e8e8;
  }
}
.item-avator__icon {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  span {
    font-size: 64px;
    line-height: 64px;
    color: #ffb131;
  }
  i {
    visibility: hidden;
  }
  &:hover,
  &--loading {
    i {
      position: absolute;
      z-index: 9;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      color: #fff;
      text-align: center;
      line-height: 64px;
    }
    &:after {
      content: "";
      display: block;
      position: absolute;
      z-index: 5;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.45);
    }
  }
  &:hover:not(.item-avator--loading) {
    i.h-icon-all-form-o {
      visibility: visible;
    }
  }
  &--loading {
    i.h-icon-all-loading-o {
      visibility: visible;
      animation: rotating 1s linear infinite;
    }
  }
}
</style>
