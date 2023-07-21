<template>
  <div class="department-config">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="组织架构权限组配置" class="custom-style">
        <a-button
          @click="addPermissionGroup"
          :disabled="editingKey !== ''"
          type="primary">新增
        </a-button>
        <a-table
          :data-source="orgPermissionData"
          :columns="orgPermissionColumn"
          :pagination="false"
          :key="num"
        >
          <template
            v-for="col in ['userDepths','users','depth','editFlag']"
            :slot="col"
            slot-scope="text, record, index"
          >
            <span :key="col" class="flex-1">
              <template v-if="col==='userDepths' && !record.editable">
                <template v-if="record">
                  <span v-for="(dep,index) in record.userDepths" :key="index" class="span-inner"><a-icon
                    type="apartment"/>{{ dep.name }}
                  </span>
                </template>
              </template>
              <span
                v-else-if="col==='userDepths' && record.editable"
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
              <template v-else-if="col==='depth' && !record.editable && record.depth">
                <span class="span-inner"><a-icon type="apartment"/><span>{{
                  record.depth.name
                }}</span></span>
              </template>
              <span
                v-else-if="col==='depth' && record.editable"
                style="margin: 5px 0;">
                <staff-selector
                  :options="depOptionsSingle"
                  :disabled="false"
                  @change="onValueChangeDep"
                  :value="text"/>
              </span>
              <span v-else-if="col==='editFlag'">
                <a-switch
                  checkedChildren="编辑"
                  unCheckedChildren="查看"
                  :defaultChecked="text"
                  :disabled="!record.editable"
                  @change="changeEditFlag"
                ></a-switch>
              </span>
              <template v-else>
                <span>{{ text }}</span>
              </template>
            </span>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <a @click="() => savePerGroup(record.id,record)" :class="editingKey===record.id?'success-color':''">保存</a>
                <a @click="() => cancelPerGroup(record.id,record)" :class="editingKey===record.id?'cancel-color':''">取消</a>
              </span>
              <span v-else>
                <a
                  :disabled="editingKey !== ''"
                  @click="() => editPerGroup(record.id,record)"
                  :class="editingKey || editingKey.length===4?'':'base-color'">编辑</a>
                <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deletePerConfig(record.id)">
                  <a :disabled="editingKey !== ''" :class="editingKey || editingKey.length===4?'':'warning-color'">删除</a>
                </a-popconfirm>
              </span>
            </div>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Switch from 'ant-design-vue/lib/switch';
import 'ant-design-vue/lib/switch/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import * as Type from "../../../type";
import {Org} from "../type";
import {
  deleteDepartmentAuthGroup,
  getDepartmentAuthGroups,
  updateDepartmentAuthGroup
} from "../../../service/api";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

@Component({
  name: 'DepartmentConfig',
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AButton: Button,
    ATable: Table,
    APopconfirm: Popconfirm,
    ASwitch: Switch,
    AIcon: Icon,
    staffSelector
  }
})
export default class DepartmentConfig extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  activeKey: string[] = ['1'];
  //组织架构权限
  personOptions: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    title: '人员多选',
    nonExistentAppCode: true
  };
  depOptions:any = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    title: '部门多选',
    nonExistentAppCode: true
  };
  depOptionsSingle:any = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '部门选择'
  };
  orgPermissionData: Org[] = [];
  cacheOrgPermissionData: Org[] = [];
  orgPermissionColumn: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '部门多选',
      dataIndex: 'userDepths',
      key: 'userDepths',
      width: '25%',
      scopedSlots: {customRender: 'userDepths'},
    },
    {
      title: '人员多选',
      dataIndex: 'users',
      key: 'users',
      width: '25%',
      scopedSlots: {customRender: 'users'}
    },
    {
      title: '组织机构',
      dataIndex: 'depth',
      key: 'depth',
      width: '15%',
      scopedSlots: {customRender: 'depth'},
    },
    {
      title: '是否可编辑',
      dataIndex: 'editFlag',
      key: 'editFlag',
      width: 150,
      scopedSlots: {customRender: 'editFlag'}
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 200,
      scopedSlots: {customRender: 'operation'},
    }
  ]
  editingKey: string = '';
  num: number = 1;

  getPerList() {
    getDepartmentAuthGroups({appCode: this.projectCode ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.orgPermissionData = JSON.parse(JSON.stringify(res.data));
        this.cacheOrgPermissionData = JSON.parse(JSON.stringify(res.data));
      }
    })
  }

  addPermissionGroup() {
    const addRow: Org = {
      id: this.rndNum(4),
      editFlag: false,
      depth: null,
      users: [],
      userDepths: [],
      editable: true
    }
    this.editingKey = addRow.id as string;
    this.orgPermissionData.push(addRow)
  }

  rndNum(n) {
    let rnd = "";
    for (let i = 0; i < n; i++)
      rnd += Math.floor(Math.random() * 10);
    return rnd;
  }

  onValueChangePermission(val) {
    this.orgPermissionData.map((i) => {
      if (i.id === this.editingKey) {
        i.userDepths = val;
      }
    })
  }

  onValueChangePerson(val) {
    this.orgPermissionData.map((i) => {
      if (i.id === this.editingKey) {
        i.users = val;
      }
    })
  }

  onValueChangeDep(val) {
    this.orgPermissionData.map((i) => {
      if (i.id === this.editingKey && val.length) {
        i.depth = val[0];
      }
    })
  }

  changeEditFlag(checked) {
    this.orgPermissionData.map((i) => {
      if (i.id === this.editingKey) {
        i.editFlag = checked;
      }
    })
  }

  savePerGroup(id: string, row: Org) {
    if ((!row.userDepths || row.userDepths && !row.userDepths.length) && (!row.users || row.users && !row.users.length)) return this.$message.warning('部门多选和人员多选至少选一个！');
    if (!row.depth) return this.$message.warning('组织架构必填！');
    const params = {
      appCode: this.projectCode ?? '',
      deptId: row.depth?.id ?? '',
      editFlag: row.editFlag,
      userDeptIds: row.userDepths && row.userDepths.map(item => item.id),
      userIds: row.users && row.users.map(item => item.id)
    }
    if (id.length !== 4) {
      Object.assign(params, {id: id});
    }
    updateDepartmentAuthGroup(params).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('修改成功！')
      this.editingKey = '';
      this.getPerList();
    })
  }

  cancelPerGroup(key, row) {
    this.editingKey = '';
    if (key.length === 4) {
      this.orgPermissionData = this.orgPermissionData.filter((i) => {
        return i.id !== key
      });
      return
    }
    const newData = [...this.orgPermissionData];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      Object.assign(target, this.cacheOrgPermissionData.filter(item => key === item.id)[0]);
      delete target.editable;
      this.orgPermissionData = newData;
      this.num++;
    }
  }

  editPerGroup(key) {
    console.log(this.orgPermissionData, 'orgPermissionData')
    const newData = [...this.orgPermissionData];
    const target = newData.filter(item => key === item.id)[0];
    this.editingKey = key;
    // @ts-ignore
    if (target) {
      target.editable = true;
      this.orgPermissionData = newData;
    }
    console.log(this.orgPermissionData, 'orgPermissionData')
  }

  deletePerConfig(id: string) {
    deleteDepartmentAuthGroup({id: id}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.editingKey = '';
      this.getPerList();
    })
  }

  mounted() {
    this.getPerList()
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';

.department-config {
  .span-inner {
    .staff-selector-span-inner;
  }
}
</style>
