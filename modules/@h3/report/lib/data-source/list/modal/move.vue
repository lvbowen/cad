<template>
  <a-modal
    :visible="value"
    :destroyOnClose="true"
    :centered="true"
    :maskClosable="false"
    :wrapClassName="prefixCls"
    @ok="handleOk"
    @cancel="handleCancel"
    title="批量移动"
    okText="确定"
    cancelText="取消"
    width="900px"
  >
    <div :class="`${prefixCls}__wrap`">
      <div :class="`${prefixCls}__section left`">
        <label>选择所属分组：</label>
        <div :class="`${prefixCls}__tree`">
          <h3-tree
            :accord="false"
            :tile="true"
            :keyMappings="keyMappings"
            :treeList="treeList"
            :folderIcon="folderIcon"
            :nodeIcon="nodeIcon"
            :multiple="true"
            @multiple-click="multipleClick"
          >
          </h3-tree>
        </div>
      </div>
      <div :class="`${prefixCls}__section`">
        <label>选择移动到：</label>
        <div :class="`${prefixCls}__tree`">
          <h3-tree
            :accord="false"
            :tile="true"
            :openKeys="openKeys"
            :folderSelected="true"
            :keyMappings="keyMappings"
            :treeList="folderTreeList"
            :folderIcon="folderIcon"
            @folder-click="folderClick"
          >
          </h3-tree>
        </div>
      </div>
    </div>
  </a-modal>

</template>

<script lang='ts'>
  import {Component, Vue, Prop, Watch, Mixins} from 'vue-property-decorator';
  import {Input, message, Button, Modal} from '@h3/antd-vue';
  import H3Tree from '@h3/report/basics/components/tree/index';
  import { dataSourceApi } from '@h3/report/basics/service/data-source';
  import {namespace} from 'vuex-class';
  import {ReportMutation, ReportAction} from '@h3/report/basics/store/data-source/types';
  import options from '@h3/report/dist/options';
  
  options.message = message;
  const ReportDataSource = namespace('dataSource');

  @Component({
    name: 'h3-data-source-move',
    components: {
      AInput: Input,
      AButton: Button,
      H3Tree,
      AModal: Modal
    }
  })

  export default class H3DataSourceMove extends Vue {
    @Prop({default: () => false}) value!: boolean; // 是否展示
    @Prop({default: () => ([])}) treeList!: Array<H3.DataSourceAPI.DataSourceNode>; // 树节点列表
    @Prop({default: () => ([])}) list!: Array<H3.DataSourceAPI.DataSourceNode>; // 树节点列表
    @ReportDataSource.Action(ReportAction.MOVEFUNCTIONNODE) moveFunctionNode!: Function;
    prefixCls = 'h3-data-source-move';
    groupObjectIds: string[] = [];// 要移动的组节点唯一标志集合
    nodeObjectIds: string[] = []; // 要移动的数据源节点唯一标志集合
    parentObjectId: string = '';  //  要移动的到的目标组的唯一标志
    // 目录级icon
    folderIcon: object = { open: 'h3yun_All folder-open-fill', close: 'h3yun_All folder-fill' };
    // 子级icon
    nodeIcon: string = 'h3yun_All sales-order-o';
    openKeys: Array<string> = [];
    keyMappings: any = {
      title: 'displayName',
      key: 'objectId',
      parent: 'parentObjectId',
    };
    folderTreeList: Array<H3.DataSourceAPI.DataSourceNode> = [];
   
    createFolderTreeList() {
      const list: Array<H3.DataSourceAPI.DataSourceNode> = [];
      if(this.list && this.list.length) {
        let nNode: any;
        this.list.sort((itemA,itemB)=>{ return itemA.sort-itemB.sort});
        this.list.forEach((Node: H3.DataSourceAPI.DataSourceNode ) => {
          nNode = {};
          nNode.folder = !Node.nodeType;
          if (!Node.parentObjectId) {
            this.openKeys.push(Node.objectId);
          }
          if(!Node.nodeType) {
            list.push(Object.assign({}, Node, nNode));
          }
        });
      }
      return  list;
    }
    /**
     * 确定批量移动数据源
     */
    handleOk() {
      if(!this.nodeObjectIds.length){
        options.message.error('请选择要移动的数据源');
        return;
      }
      if(!this.parentObjectId){
        options.message.error('请选择要移动到哪个文件夹');
        return;
      }
      let obj = {
        groupObjectIds: [],
        nodeObjectIds: this.nodeObjectIds,
        parentObjectId: this.parentObjectId
      };
      dataSourceApi.moveDataSourceNode(obj).then((res)=> {
        if(res){
          this.$emit('change');
          this.$emit('input', false);
        }
      })
    }
    /**
     * 取消
     */
    handleCancel() {
      this.$emit('input', false);
    }
    /**
     * 选中文件夹
     */
    folderClick(node: H3.DataSourceAPI.DataSourceNode){
     this.parentObjectId =  node.objectId
     
    }
  
    /**
     * 多选
     */
    multipleClick(nodes: { node: H3.Tree.TreeNode,selected:Array<any>}){
      this.nodeObjectIds = Object.keys((nodes as any).selected);
    }
    mounted() {
      this.folderTreeList = this.createFolderTreeList();
    }
  }
</script>

