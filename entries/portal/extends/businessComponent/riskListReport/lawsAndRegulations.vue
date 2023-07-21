<template>
  <div class="lawsAndRegulations">
    <commonComponent :reportId="reportId" :title="title"/>
  </div>
</template>

<script lang="ts">
import {Vue, Component } from 'vue-property-decorator';
import commonComponent from './common.vue';

@Component({
  name: 'lawsAndRegulations',
  components: {
    commonComponent
  }
})
export default class lawsAndRegulations extends Vue{
  reportId:string = 'flfgqd';
  title:string = '法律法规清单'
}
</script>

<style scoped>
.lawsAndRegulations {
  height: 100%;
}
</style>
