<template>
  <a-modal
    :visible="showOpinionModal"
    :title="`确认${opinionTitle}此项目策划`"
    @ok="saveChiefOpinion"
    @cancel="closeModal"
    :maskClosable="false"
    :keyboard="false"
    :closable="true"
    wrapClassName="opinions-modal"
    :destroyOnClose="true">
    <div class="rich-text-style">
      <rich-text
        :key="opinionId"
        :class="`${opinionId}`"
        ref="opinionRichTextEditor"
        :objectId="opinionId"
        :contentValue="opinion"
        class="full-height"
      />
    </div>
  </a-modal>
</template>

<script lang="ts">
import {Component,Vue,Prop,InjectReactive,Watch} from "vue-property-decorator";
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal';
import RichText from '../../../../basicCustomComponent/RichText/RichText';
import { saveChiefOpinion } from "../../../../service/CoordinateDesign/WorkingOutline/ProjectPlanning";
import Utils from "../../../../utils";
@Component({
  name:"OpinionsModal",
  components: {
    AModal: Modal,
    RichText
  }
})
export default class OpinionsModal extends Vue {
  @Prop() showOpinionModal!:boolean;
  @Prop() opinionTitle!:string;
  @Prop() workOutlineDataId!:string;
  @Prop() job!:string;
  @InjectReactive('project') projectCode!:string;
  @Watch('showOpinionModal', { deep: true,immediate: true})
  showOpinionModalListener(val) {
    if (val) {
      setTimeout(()=> {
        this.opinionId = this.getOpinionId();
        setTimeout(()=> {
          this.opinionId = this.getOpinionId();
        },50)
      },50)
    }
  }
  opinion: string = '';
  opinionId: string = '';
  getOpinionId() {
    return Utils.uuid();
  }
  saveChiefOpinion() {
    const userInfo = sessionStorage.getItem('user')
    saveChiefOpinion({
      appCode: this.projectCode??'',
      workoutlineId: this.workOutlineDataId??'',
      //@ts-ignore
      opinion:  this.$refs?.['opinionRichTextEditor']?.content as string ?? '',
      title: this.job??'',
      type:this.opinionTitle,
      userId: userInfo?JSON.parse(userInfo).id:''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.$message.success(`${this.opinionTitle}成功`);
      this.$emit('updateForm')
    })
  }
  closeModal() {
    this.$emit('closeOpinionModal')
  }
}
</script>

<style scoped lang="less">
@import '../../../../styles/public.module.less';
/deep/ .opinions-modal {
  .ant-modal {
    width: 900px !important;
    .ant-modal-body {
      height: 500px;
      .rich-text-style {
        width: 100%;
        height: 100%;
        .ck-editor {
          .full-height;
          .ck-editor__main {
            height: calc(100% - 40px);
            .ck-content {
              .full-height;
            }
          }
        }
      }
    }
  }
}
</style>
