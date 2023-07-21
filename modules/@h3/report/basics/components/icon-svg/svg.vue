<template>
  <svg class="icon" aria-hidden="true">
    <use :xlink:href="`#${name}`"></use>
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject, Watch } from "vue-property-decorator";
import "@h3/report/basics/assets/icon/iconfont.js";

@Component({
  name: "h3-report-svg"
})
export default class ReportSVG extends Vue {
  // 图标名称
  @Prop({ default: "" }) name!: string;
}
</script>
