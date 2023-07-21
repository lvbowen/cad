<template>
  <div class="data-dictionary full-height">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="数据字典" class="custom-style full-height flex-column">
        <a-button
          @click="add"
          :disabled="editingKey !== ''"
          type="primary">新增
        </a-button>
        <div class="inner">
          <a-card class="left full-height">
            <div class="title">字典方案</div>
            <a-table
              bordered
              :key="num"
              :data-source="defaultPagesData"
              :columns="defaultPagesColumns"
              :customRow="rowClick"
              :rowClassName="setRowClassName"
              :pagination="false">
              <template
                v-for="col in ['name','userDepths','users']"
                :slot="col"
                slot-scope="text, record, index"
              >
                <span :key="col" class="flex-1">
                  <a-input
                    v-if="col==='name' && record.editable && editingKey==='add'"
                    style="margin: 5px 0;"
                    :value="text"
                    @change="e => handleChange(e.target.value, record.name, col,record.id)"
                  />
                  <template v-else-if="col==='userDepths' && !record.editable">
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
                  <template v-else>
                    <span>{{ text }}</span>
                  </template>
                </span>
              </template>
              <template slot="operation" slot-scope="text, record, index">
                <div class="editable-row-operations">
                  <span v-if="record.editable">
                    <a @click.stop="() => save(record.name,record)" :class="editingKey===record.name || editingKey==='add'?'success-color':''">保存</a>
                    <a @click.stop="() => cancel(record.name,record)" :class="editingKey===record.name || editingKey==='add'?'cancel-color':''">取消</a>
                  </span>
                  <span v-else>
                    <a :disabled="editingKey !== ''" @click.stop="editDicGroups(record.name,record)" :class="editingKey || editingKey.length===4?'':'base-color'">编辑</a>
                    <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm.stop="deleteConfig(record.name)">
                      <a :disabled="editingKey !== ''" @click.s.stop="" :class="editingKey || editingKey.length===4?'':'warning-color'">删除</a>
                    </a-popconfirm>
                  </span>
                </div>
              </template>
            </a-table>
          </a-card>
          <a-card class="right full-height">
            <div class="title">数据字典树</div>
            <div class="flex" v-show="treeData.length">
              <a-button type="primary" @click="visible=true">新增节点</a-button>
              <a-popconfirm
                title="删除后不可恢复哦，确认删除吗？"
                :visible="isShow"
                @confirm="deleteDicNode"
                @visibleChange="handleVisibleChange">
                <a-button>删除</a-button>
              </a-popconfirm>
            </div>
            <a-tree
              :treeData="treeData"
              :replaceFields="replaceFields"
              :defaultExpandAll="true"
              @select="selectTreeNode"
              :key="treeKey">
            </a-tree>
          </a-card>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <add-dic-node-dialog
      :visible="visible"
      :groupName="currentRow && currentRow.name"
      :parentId="seletedNode && seletedNode.id"
      @closeDialog="closeDialog"
      @updateDicTree="getDicTree"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css'
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import {Dictionary, DictionaryNode} from "../type";
import {getDicGroup, addDicGroup, getDicTree,deleteDicTreeNode,deleteDicGroup,updateDicGroup} from "../../../service/api";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import { TableColumn } from "../../../type";
import AddDicNodeDialog from "./AddDicNodeDialog.vue";
@Component({
  name: 'DataDictionary',
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    ACard: Card,
    ATable: Table,
    AButton: Button,
    APopconfirm: Popconfirm,
    ATree: Tree,
    AddDicNodeDialog,
    staffSelector
  }
})
export default class DataDictionary extends Vue {
  @InjectReactive('project') projectCode!: string;
  activeKey: string[] = ['1'];
  num: number = 1;
  editingKey: string = '';
  defaultPagesData: Dictionary[] = [];
  cacheDicGroups: Dictionary[] = [];
  defaultPagesColumns: TableColumn<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      //@ts-ignore
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '方案名称',
      dataIndex: 'name',
      key: 'name',
      // width: 200,
      scopedSlots: {customRender: 'name'},
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
      width: '28%',
      scopedSlots: {customRender: 'users'}
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 120,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  treeData: DictionaryNode[] = [];
  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'name', key: 'id'
  };
  treeKey: number = 1;
  seletedNode: DictionaryNode|null = null;
  currentRow: Dictionary|null = null;
  visible: boolean = false;

  isShow: boolean = false;
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
  init() {
    this.defaultPagesData = [];
    getDicGroup({appCode: this.projectCode ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        res.data.map((n)=> {
          this.defaultPagesData.push({
            name: n.dicName,
            userDepths: n.userDepths,
            users: n.users
          })
        })
        this.cacheDicGroups = JSON.parse(JSON.stringify(this.defaultPagesData));
      }
    })
  }

  rndNum(n) {
    let rnd = "";
    for (let i = 0; i < n; i++)
      rnd += Math.floor(Math.random() * 10);
    return rnd;
  }

  add() {
    const addRow: Dictionary = {
      id: this.rndNum(4),
      name: '',
      editable: true,
      users: [],
      userDepths: []
    }
    this.editingKey = 'add';
    this.defaultPagesData.push(addRow);
  };

  handleChange(value, key, column,id?:string) {
    const newData = [...this.defaultPagesData];
    const target = newData.filter(item => this.editingKey==='add'?item.id===id:key === item.name)[0];
    if (target) {
      target[column] = value;
      this.defaultPagesData = newData;
    }
  }

  cancel(key) {
    if(this.editingKey==='add') {
      this.defaultPagesData = this.defaultPagesData.filter((i) => {
        return i.name !== key
      });
    }else {
      const newData = [...this.defaultPagesData];
      const target = newData.filter(item => key === item.name)[0];
      if (target) {
        Object.assign(target, this.cacheDicGroups.filter(item => key === item.name)[0]);
        delete target.editable;
        this.defaultPagesData = newData;
        this.num++;
      }
    }
    // @ts-ignore
    this.editingKey = '';
  }
  editDicGroups(key:string) {
    const newData = [...this.defaultPagesData];
    const target = newData.filter(item => key === item.name)[0];
    this.editingKey = key;
    // @ts-ignore
    if (target) {
      target.editable = true;
      this.defaultPagesData = newData;
    }
  }
  save(name: string = '', row:Dictionary) {
    //必填验证
    if (!row.name.length) {
      return this.$message.warning('方案名称必填！')
    }
    const params = {
      name: row.name,
      appCode: this.projectCode ?? '',
      userDeptIds: row.userDepths && row.userDepths.map(item => item.id),
      userIds: row.users && row.users.map(item => item.id)
    }
    let api = addDicGroup;
    if(this.editingKey!=='add') {
      api = updateDicGroup
    }
    api(params).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success(`${this.editingKey==='add'?'新增成功！':'修改成功！'}`)
      this.editingKey = '';
      this.init()
    })
  }

  deleteConfig(name: string) {
    deleteDicGroup({appCode: this.projectCode ?? '', name: name}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.init();
    })
  }

  getDicTree(row?: Dictionary | null) {
    getDicTree({appCode: this.projectCode ?? '',name: row?.name??''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.treeData = res.data
        this.treeKey++;
        if(!res.data.length) {
          this.init();
        }
      }
    })
  }

  // 点击行时
  rowClick(record, index) {
    return {
      on: {
        click: (e) => {
          console.log(this.editingKey)
          if(this.editingKey !== '') { return}
          if(!this.currentRow) {
            this.currentRow = record;
            //获取字典树
            this.getDicTree(record)
          }else if(record.name === this.currentRow.name) {
            this.currentRow = null;
            this.treeData = [];
          }else {
            this.currentRow = record;
            this.getDicTree(record)
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
    return record.name === this.currentRow.name ? "clickRowStyl" : '';//赋予点击行样式
  }
  //点击树事件
  selectTreeNode(selectedKeys, e) {
    selectedKeys.includes(e.node.dataRef.id)? this.seletedNode = e.node.dataRef: this.seletedNode =null;
  }

  deleteDicNode() {
    deleteDicTreeNode({appCode: this.projectCode ?? '', id: this.seletedNode?.id??''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.getDicTree(this.currentRow);
    })
  }
  handleVisibleChange(visible) {
    if (!visible) {
      this.isShow = false;
      return;
    }
    if(!this.seletedNode) {
      this.isShow = false;
      this.$message.warning('请先选择树节点！')
    }else {
      this.isShow = true
    }
  }
  onValueChangePermission(val) {
    this.defaultPagesData.map((i) => {
      //初始化、add、修改
      if (i.name === this.editingKey || (i.id&&i.id.length===4)) {
        i.userDepths = val;
      }
    })
  }

  onValueChangePerson(val) {
    this.defaultPagesData.map((i) => {
      if ((i.name === this.editingKey) || (i.id&&i.id.length===4)) {
        i.users = val;
      }
    })
  }
  closeDialog() {
    this.visible = false;
  }
  mounted() {
    this.init()
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';

.data-dictionary {
  .custom-style {
    .inner {
      display: flex;
      height: calc(100% - 30px);

      .title {
        font-weight: bold;
        margin-bottom: @spacing-base;
      }

      .left {
        width: calc(70% - @spacing-large);
        margin-right: @spacing-large;
        overflow: auto;
        .span-inner {
          .staff-selector-span-inner;
        }
      }

      .right {
        width: 30%;
        overflow: auto;

        /deep/ .ant-btn {
          width: fit-content;
          margin-right: @spacing-base;
        }
      }
    }
  }
}

/deep/ .ant-collapse {
  height: 100%;
  .ant-collapse-content {
    flex: 1;
  }
  .ant-collapse-content-box {
    height: calc(100% - 8px);
  }
}
</style>
