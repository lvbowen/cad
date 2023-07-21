<template>
  <div class="securityExpensesUseLedger">
    <commonComponent :reportId="reportId" :title="title"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component } from 'vue-property-decorator';
import commonComponent from './common.vue';

@Component({
  name: 'securityExpensesUseLedger',
  components: {
    commonComponent
  }
})
export default class securityExpensesUseLedger extends Vue{
  reportId:string = 'aqscfysydj';
  title:string = '安全经费使用台账'
}
</script>

<style scoped>
.securityExpensesUseLedger {
  height: 100%;
}
</style>
