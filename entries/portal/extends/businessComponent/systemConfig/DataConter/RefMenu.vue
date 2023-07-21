<template>
  <div class="ref-menu flex flex-column full-height">
    <div
      v-show="selectedKeys"
      :class="editingKey!==''?'disable disabled-bg':''"
      @click="addMenu"
      class="add-btn">
      新增菜单
    </div>
    <a-table
      v-show="selectedKeys"
      :key="treeMenuKey"
      :columns="menuTreeColumns"
      :data-source="treeDataMenu"
      :pagination="false"
      :defaultExpandAllRows="true"
      rowKey="id"
      bordered
      :customRow="rowClick"
      :rowClassName="setRowClassName"
      :childrenColumnName="childrenColumnName">
      <template v-for="col in ['name','icon','deptIds','users']" :slot="col" slot-scope="text, record, index">
        <span :key="col" class="flex-1">
          <a-input v-if="col==='name' && record.editable" :value="text" @change="e => handleChange(e.target.value, record.id, col)"></a-input>
          <img v-else-if="col==='icon' && !record.editable && record.icon" :src="record.icon" class="icon-menu"/>
          <div v-else-if="col==='icon' && record.editable" class="input-icon-menu">
            <span v-if="!record.icon" @click="showIconsModal=true">请选择</span>
            <img
              v-else
              class="icon-menu"
              :src="record.icon"
              @click="showIconsModal=true"/>
          </div>
          <template v-else-if="col==='deptIds' && !record.editable">
            <template v-if="record">
              <span v-for="(dep,index) in record.deptIds" :key="index" class="span-inner"><a-icon
                type="apartment"/>{{ dep.name }}
              </span>
            </template>
          </template>
          <span
            v-else-if="col==='deptIds' && record.editable"
            style="margin: 5px 0;">
            <staff-selector
              :options="depOptions"
              :disabled="false"
              @change="onValueChangePermission"
              :value="text"/>
          </span>
          <template v-else-if="col==='users' && !record.editable">
            <template v-if="record">
              <span v-for="(dep,index) in record.users" :key="index" class="span-inner"><a-icon
                type="user"/>{{ dep.name }}</span>
            </template>
          </template>
          <span
            v-else-if="col==='users' && record.editable"
            style="margin: 5px 0;">
            <staff-selector
              :options="personOptions"
              :disabled="false"
              @change="onValueChangePerson"
              :value="text"/>
          </span>
          <template v-else>
            <span>{{ text }}</span>
          </template>
        </span>
      </template>
      <template slot="operation" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click.stop="() => saveMenuInfo(record.id,record)" :class="editingKey===record.id?'success-color':''">保存</a>
            <a @click.stop="() => cancel(record.id,record)" :class="editingKey===record.id?'cancel-color':''">取消</a>
          </span>
          <span v-else>
            <a :disabled="editingKey !== ''" @click.stop="() => editMenu(record.id,record)" :class="editingKey || editingKey.indexOf('-')>-1?'':'base-color'">编辑</a>
            <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm.stop="deleteMenu(record.id)">
              <a :disabled="editingKey !== ''" :class="editingKey || editingKey.indexOf('-')>-1?'':'warning-color'">删除</a>
            </a-popconfirm>
            <a @click.stop="() => searchRdpList(record.id,record.name)" :disabled="editingKey !== ''" :class="editingKey || editingKey.indexOf('-')>-1?'':'base-color'">查看</a>
          </span>
        </div>
      </template>
    </a-table>
    <rdp-list
      :showRdpModal="showRdpModal"
      :currentMenuId="currentSelectedMenuId"
      :currentMenuName="currentMenuName"
      @cancelRdpListModal="cancelRdpListModal"
      :projectGroupId="selectedKeys"/>
    <icons-modal :showIconsModal="showIconsModal" @closeIconsModal="closeIconsModal" @setIconValue="setIconValue"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive,Prop,Watch} from 'vue-property-decorator';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Switch from 'ant-design-vue/lib/switch';
import 'ant-design-vue/lib/switch/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import {TableColumn} from "../../../type";
import {CenterMenu} from "../type";
import {getMenuTree,updateMenuTree,deleteMenu} from "../../../service/api";
import Utils from "../../../utils";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import RdpList from "./RDPList.vue";
import IconsModal from "./IconsModal.vue";
@Component({
  name: 'RefMenu',
  components: {
    ATable: Table,
    staffSelector,
    ASwitch: Switch,
    AInput: Input,
    AButton: Button,
    RdpList,
    IconsModal
  }
})
export default class RefMenu extends Vue {
  @InjectReactive("project") projectCode!: string;
  @Prop() selectedKeys?:string;
  menuTreeColumns: TableColumn<any>[] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      scopedSlots: { customRender: 'name'}
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      scopedSlots: { customRender: 'icon'}
    },
    {
      title: '部门多选',
      dataIndex: 'deptIds',
      key: 'deptIds',
      width: '25%',
      scopedSlots: {customRender: 'deptIds'},
    },
    {
      title: '人员多选',
      dataIndex: 'users',
      key: 'users',
      width: '25%',
      scopedSlots: {customRender: 'users'}
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'},
      width:160
    }
  ];
  treeDataMenu: CenterMenu[] = [];
  cacheTreeDataMenu: CenterMenu[] = [];
  childrenColumnName: string = 'children';
  treeMenuKey: number = 1;
  currentRow: CenterMenu | null = null;

  editingKey: string | undefined = '';
  //组织机构权限
  personOptions: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    title: '人员多选'
  };
  depOptions:any = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    title: '部门多选'
  };

  //rdp-list
  showRdpModal: boolean = false;
  currentSelectedMenuId: string = '';
  currentMenuName: string = '';

  //icons-modal
  showIconsModal: boolean = false;
  @Watch('selectedKeys')
  selectedKeysListener(val) {
    console.log(val,'selectedKeys')
    if(val && val.length!==4) {
      this.getTabs();
    }
  }
  getTabs() {
    getMenuTree({ appCode: this.projectCode ?? "", id: this.selectedKeys??'' }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.treeDataMenu = JSON.parse(JSON.stringify(res.data));
        this.cacheTreeDataMenu = JSON.parse(JSON.stringify(res.data));
        // Utils.deepFind(this.treeDataMenu, item => {
        //   item.scopedSlots = {title: 'icons'};
        //   return false;
        // }, 'children');
        // // this.treeArrFilter(this.treeDataMenu,'children');
        // console.log(this.treeDataMenu, 'treeArrFilter')
        this.currentRow= null;
        this.treeMenuKey++;
      }
    });
  }
  onValueChangePermission(val) {
    this.handleChange(val,this.editingKey,'deptIds')
  }
  onValueChangePerson(val) {
    this.handleChange(val,this.editingKey,'users')
  }
  handleChange(value, key, column) {
    Utils.deepFind(this.treeDataMenu,(item)=> {
      if(item.id===key) {
        item[column] = value;
        return true
      }
      return false
    },'children')
  }
  // 点击行时
  rowClick(record, index) {
    return {
      on: {
        click: (e) => {
          if(!this.currentRow) {
            this.currentRow = record;
          }else if(record.id === this.currentRow.id || record.id.indexOf('-')>-1) {
            this.currentRow = null;
          }else {
            this.currentRow = record;
          }
          // this.currentRow = record;
          //新增
        }
      }
    }
  };
  // 行样式
  setRowClassName(record, index) {
    if (!this.currentRow) {
      return
    }
    return record.id === this.currentRow.id ? "clickRowStyl" : '';//赋予点击行样式
  }
  addMenu() {
    if(this.editingKey) return;
    const addMenu: CenterMenu = {
      id: Utils.uuid(),
      name: '',
      parentId: '',
      children: [],
      icon: '',
      users: [],
      deptIds: [],
      editable: true
    }
    this.editingKey = addMenu?.id??'';
    if(!this.currentRow) {
      this.treeDataMenu.push(addMenu);
    }else {
      Utils.deepFind(this.treeDataMenu,(item)=> {
        if(item.id===this.currentRow?.id) {
          addMenu.parentId = this.currentRow?.id??'';
          item.children.push(addMenu)
        }
        return false
      },'children')
    }
  }
  cancel(key:string) {
    //add
    if(key.indexOf('-')>-1) {
      this.spliceRow(this.treeDataMenu,'children','id',key);
      this.editingKey = '';
      return
    }else { //edit
      console.log(this.treeDataMenu)
      this.treeDataMenu = JSON.parse(JSON.stringify(this.cacheTreeDataMenu));
      this.editingKey = '';
    }
  }
  deleteMenu(id:string) {
    deleteMenu({
      appCode: this.projectCode ?? "",
      id: id,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("删除成功！");
      this.getTabs();
    });
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
  editMenu(key:string) {
    this.editingKey = key;
    Utils.deepFind(this.treeDataMenu,(item)=> {
      if(item.id===key) {
        item.editable = true
      }
      return false
    },'children')
  }

  //rdp-list
  searchRdpList(id:string,name:string) {
    this.showRdpModal = true;
    this.currentSelectedMenuId = id;
    this.currentMenuName = name;
  }

  cancelRdpListModal() {
    this.showRdpModal = false;
    this.currentSelectedMenuId = '';
    this.currentMenuName = '';
  }

  saveMenuInfo(id:string,record:CenterMenu) {
    if (!record.name || !(record.name && record.name.trim().length)) return this.$message.warning("菜单名输入无效，请重新输入！");
    const params = {
      appCode: this.projectCode ?? "",
      name: record.name as string,
      icon: record.icon as string,
      groupId: this.selectedKeys??'',
      parentId: record.parentId as string,
      deptIds: record.deptIds && record.deptIds.map(item => item.id),
      userIds: record.users && record.users.map(item => item.id)
    };
    //edit-save
    if(id.indexOf('-')===-1) {
      Object.assign(params, { id: id,parentId:record.parentId });
    }
    console.log(params,'params')
    updateMenuTree(params)
      .then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("保存成功！");
        this.getTabs();
      })
      .finally(() => {
        // this.visibleAddMenu = false;
        // this.addMenuName = "";
        // this.selectIcon = "";
        this.editingKey = '';
      });
  }
  //icons
  closeIconsModal() {
    this.showIconsModal = false;
  }
  setIconValue(icon:string) {
    console.log(icon,'11')
    this.handleChange(icon,this.editingKey,'icon');
    this.closeIconsModal();
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import "../system.module.less";

.ref-menu {
  .disabled-bg {
    color: rgba(0, 0, 0, 0.25) !important;
    background-color: #f5f5f5 !important;
    border-color: #d9d9d9 !important;
    border-width: 1px;
    border: 1px solid;
  }
  .add-btn {
    height: 32px;
    line-height: 32px;
    color: #fff;
    background-color: #2970ff;
    border-color: #2970ff;
    padding:0 @spacing-base;
    font-size: 14px;
    border-radius: 4px;
    margin-bottom: @spacing-base;
    width: max-content;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  /deep/ .ant-table-wrapper {
    overflow: auto;
  }
  /deep/ .ant-table {
    .ant-table-row {
      >td:first-child {
        min-width: 150px;
        white-space: nowrap;
        .ant-input {
          width: 100px;
        }
      }
    }
  }
  .input-icon-menu {
    >span {
      color: slategrey;
      opacity: 0.5;
      border: 1px solid;
      border-radius: 5px;
      padding: 1/2 * @spacing-base @spacing-base;
      cursor: pointer;
    }
  }
  .icon-menu {
    width: 50px;
    height: 50px;
    background: #9cc1ec;
  }
  .span-inner {
    .staff-selector-span-inner;
  }
}
</style>
