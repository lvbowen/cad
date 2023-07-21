<template>
  <div class="h3-report-header">
    <slot></slot>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'h3-report-header'
})
export default class ReportHeader extends Vue {
}
</script>
