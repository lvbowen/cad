<template>
  <div class="document-library full-height flex flex-column">
    <div class="flex menu">
      <div
        v-for="(item,index) in ['文档模板库','内容素材库']"
        :key="index"
        @click="changeActiveMenu(index)"
        :class="activeMenu===index?'active-menu':''"
        class="inline-block">
        {{ item }}
      </div>
    </div>
    <document-template-library v-if="activeMenu===0" class="flex-1 table" :conditionConfig="conditionConfig"/>
    <work-outline-source v-if="activeMenu===1" class="flex-1 table" :conditionConfig="conditionConfig"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import DocumentTemplateLibrary from "./DocumentTemplateLibrary.vue";
import WorkOutlineSource from "./WorkOutlineSource.vue";
import { conditionConfig } from "../publicConfig";
import {DefineTypes} from "../../../type";
import { getContentItemRule } from "../../../service/api";
@Component({
  name: 'DocumentLibrary',
  components: {
    DocumentTemplateLibrary,
    WorkOutlineSource
  }
})
export default class DocumentLibrary extends Vue {
  @InjectReactive("project") projectCode?: string;
  activeMenu: number = 0;
  changeActiveMenu(index: number) {
    this.activeMenu = index;
  }
  conditionConfig: DefineTypes[] = [];
  getContentItemRule() {
    getContentItemRule({
      appCode: this.projectCode??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.conditionConfig.map((item)=> {
        for (const dataKey in res.data) {
          if(item.field===dataKey) {
            if (res.data && res.data[dataKey]) {
              item.options = res.data[dataKey]
            }
          }
        }
      })
    })
    console.log(this.conditionConfig)
  }
  created() {
    this.conditionConfig = conditionConfig as DefineTypes[]
    this.getContentItemRule();
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
.document-library {
  .menu {
    margin-bottom: @spacing-medium;
    .inline-block {
      margin-right: @spacing-large;
      color: white;
      font-weight: bold;
      font-size: 17px;
      cursor: pointer;
    }
    .active-menu {
      padding-bottom: @spacing-base;
      border-bottom: 2px solid #ffffff;
    }
  }
  .table {
    background-color: white;
    padding: @spacing-medium @spacing-medium 0 @spacing-medium;
    margin-bottom: @spacing-medium;
  }
}
</style>
