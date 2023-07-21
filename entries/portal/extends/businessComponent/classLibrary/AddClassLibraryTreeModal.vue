<template>
  <a-modal
    :visible="showClassLibraryTreeModal"
    :title="classLibraryTitle"
    class="add-class-library-modal"
    :maskClosable="false"
    :keyboard="false"
    @ok="modalOk"
    @cancel="modalCancel"
    destroyOnClose>
    <div v-if="classLibraryParentId" class="parent">父节点名称：{{ classLibraryParentName }}</div>
    <span class="label">类库名称</span>
    <a-input v-model="name" placeholder="请输入类库名称"></a-input>
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component, Prop, Watch, InjectReactive} from 'vue-property-decorator';
import { addOrUpdateClassLibrary } from "../../service/classLibrary";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import {ProjectConfig} from "../../type";

@Component({
  name: 'AddClassLibraryTreeModal',
  components: {
    AModal: Modal,
    AInput: Input
  }
})
export default class AddClassLibraryTreeModal extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig
  @Prop() showClassLibraryTreeModal!:boolean;
  @Prop() classLibraryTitle!:string;
  @Prop() classLibraryName!:string;
  @Prop() classLibraryParentId!:string;
  @Prop() classLibraryParentName!:string;
  @Prop() classLibraryId!:string;
  @Prop() criterionId!:string;
  @Watch('showClassLibraryTreeModal',{ immediate: true})
  showListener(show) {
    if(show) {
      this.name = this.classLibraryName??''
    }
  }
  name: string =  '';
  modalCancel() {
    this.$emit('closeClassLibraryTreeModal')
  }
  modalOk() {
    if(!this.name.trim().length) return this.$message.warning('类库名称必填!');
    const params = {
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      classLibrary: {
        name: this.name,
        criterionId: this.criterionId,
        parentId: this.classLibraryParentId
      }
    }
    if(this.classLibraryId) {
      Object.assign(params.classLibrary,{ id: this.classLibraryId})
    }
    // console.log(params,'parmas')
    //@ts-ignore
    addOrUpdateClassLibrary(params).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.$message.success(`${this.classLibraryTitle==='新增类库名称'?'新增成功':'修改成功'}`)
      this.$emit('ok')
    })
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
@import '../systemConfig/system.module.less';
.add-class-library-modal {
  .ant-input{
    width: 200px;
    margin: 0 0 @spacing-base @spacing-base;
  }
  .label::before {
    display: inline-block;
    color: #f5222d;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    content: '*';
  }
  .parent {
    color: #bfbfbf;
    margin-bottom: @spacing-base;
  }
}
</style>
