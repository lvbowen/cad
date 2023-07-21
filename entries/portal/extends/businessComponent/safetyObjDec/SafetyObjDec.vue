<template>
  <div class="safety-obj-dec">
    <commonComponent :reportId="reportId" :title="title"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component } from 'vue-property-decorator';
import commonComponent from '../riskListReport/common.vue';

@Component({
  name: 'SafetyObjDec',
  components: {
    commonComponent
  }
})
export default class SafetyObjDec extends Vue{
  reportId:string = 'zrmbqd';
  title:string = '安全目标分解'
}
</script>

<style scoped>
.safety-obj-dec {
  height: 100%;
}
</style>
