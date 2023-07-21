<template>
  <div class="standard-template">
    <a-tooltip>
      <template slot="title">预览标准模板</template>
      <a-icon type="eye" @click="toUrl(urlRes.previewUrl)"/>
    </a-tooltip>
    <a-tooltip>
      <template slot="title">下载标准模板</template>
      <a-icon type="vertical-align-bottom" @click="toUrl(urlRes.downloadUrl)"/>
    </a-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Vue,Prop,Watch} from 'vue-property-decorator';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import { getStandardTemplateApi } from "../../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask";
import {StandardTemplateRes} from "../../../../../type";
import {indexOf} from "xe-utils";
import Utils from "../../../../../utils";

@Component({
  name:"StandardTemplate",
  components: {
    AIcon: Icon,
    ATooltip: Tooltip
  }
})
export default class StandardTemplate extends Vue {
  @Prop() type!: string;
  @Prop() taskType!:string;
  @Prop() profession!:string;
  @Watch('taskType',{ deep: true})
  taskTypeListener(val) {
    if (val){
      this.getUrlRes();
    }
  }
  @Watch('profession', {deep: true})
  professionListener(val) {
    if (val) {
      this.getUrlRes();
    }
  }

  urlRes: StandardTemplateRes = {
    previewUrl: '',
    downloadUrl: '',
    attachmentName: '',
    refId: '',
    type: '',
    taskType: '',
    profession: ''
  }
  toUrl(url:string) {
    if (!url) this.$message.warning('暂无模板！')
    window.open(url)
  }
  getUrlRes:any =  Utils.debounceFn(()=> {
    this.getStandardTemplate()
  },10)
  getStandardTemplate() {
    getStandardTemplateApi({
      type: this.type,
      taskType: this.taskType,
      profession: this.profession
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      for (const urlResKey in this.urlRes) {
        if (res.data[urlResKey]) {
          this.urlRes[urlResKey] = res.data[urlResKey]
        }
      }
    })
  }
  mounted() {
    this.getUrlRes();
  }
}
</script>

<style scoped lang="less">
@import '../../../../../styles/public.module.less';
.anticon {
  margin-right: @spacing-base;
}
</style>
