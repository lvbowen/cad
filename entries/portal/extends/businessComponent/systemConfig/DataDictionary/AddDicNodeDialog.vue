<template>
  <div class="add-dic-node-dialog">
    <a-modal
      :visible="visible"
      title="新增节点"
      @cancel="handleCancel"
      @ok="addDicNode">
      <div class="flex nowrap flex-center-align">
        <div class="label">节点名称:</div>
        <a-input v-model="addNodeName" class="flex-1"></a-input>
        <div class="label">编码值:</div>
        <a-input v-model="addNodeCode" class="flex-1"></a-input>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, InjectReactive} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import {addDicTreeNode} from "../../../service/api";
@Component({
  name: 'AddDicNodeDialog',
  components: {
    AModal: Modal,
  }
})
export default class AddDicNodeDialog extends Vue {
  @InjectReactive('project') projectCode!: string;
  @Prop() visible?:boolean;
  @Prop() groupName?:string;
  @Prop() parentId?:string;
  addNodeName: string= '';
  addNodeCode: string = '';
  handleCancel() {
    // this.visible = false
    this.$emit('closeDialog')
  }
  addDicNode() {
    // this.visible = false;
    const params = {
      appCode: this.projectCode??'',
      name: this.addNodeName,
      code: this.addNodeCode,
      groupName: this.groupName??''
    }
    if(this.parentId){ Object.assign(params,{parentId:this.parentId})}
    addDicTreeNode(params).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('新增成功！')
      // this.getDicTree(this.currentRow);
      this.$emit('updateDicTree',{ name:this.groupName??'' })
    }).finally(()=> {
      this.$emit('closeDialog')
      this.addNodeName ='';
      this.addNodeCode = '';
    })
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
.add-dic-node-dialog {
  .label{
    margin-right: @spacing-base;
    margin-left: @spacing-medium;
  }
  .label:first-child {
    margin-left: 0;
  }
}
/deep/ .ant-input {
  margin-right: @spacing-base;
}
</style>
