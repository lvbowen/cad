<template>
  <article style="height: 0;width: 0">
    <div :class="isScale?'left_rdp':'left_rdp_hide'" v-show="dataRDP.leftReport">
      <iframe :src="dataRDP.leftReport" class="rdp_report" frameborder="0"/>
    </div>
    <div :class="isScale?'mid_rdp':'mid_rdp_hide'" v-show="dataRDP.middleReport">
      <iframe :src="dataRDP.middleReport" class="rdp_report" frameborder="0"/>
    </div>
    <div :class="isScale?'up_rdp':'up_rdp_hide'" v-show="dataRDP.upReport">
      <iframe :src="dataRDP.upReport" class="rdp_report" frameborder="0"/>
    </div>
    <div :class="isScale?'right_rdp':'right_rdp_hide'" v-show="dataRDP.rightReport">
      <iframe :src="dataRDP.rightReport" class="rdp_report" frameborder="0"/>
    </div>
  </article>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component({
  name: 'rdpReports',
})
export default class rdpReports extends Vue {
  @Prop() dataRDP!: any;
  @Prop() isScale!: boolean;

  mounted() {
    console.log('dataRDP', this.dataRDP);
  }
}
</script>

<style lang="less" scoped>

.right_rdp {
  position: fixed;
  z-index: 3;
  right: 0px;
  width: 18vw;
  height: 44vw;
  bottom: 0;
}

.left_rdp {
  position: fixed;
  left: calc(256px + 10px);
  z-index: 3;
  width: 18vw;
  height: 44vw;
  bottom: 0;
}

.mid_rdp {
  position: fixed;
  left: calc(269px + 18vw);
  z-index: 3;
  width: calc(100vw - 275px - 36vw);
  height: 16vw;
  bottom:0;
}
.up_rdp {
  position: fixed;
  left: calc(269px + 18vw);
  z-index: 3;
  width: calc(100vw - 275px - 36vw);
  height: 50px;
  bottom:calc(44vw - 50px);
}
.right_rdp_hide {
  position: fixed;
  z-index: 3;
  right: 0;
  width: 18vw;
  height: 44vw;
  bottom: 0;
}

.left_rdp_hide {
  position: fixed;
  left: 40px;
  z-index: 3;
  width: 18vw;
  height: 44vw;
  bottom: 0;
}

.mid_rdp_hide {
  position: fixed;
  left: calc(40px + 18vw);
  z-index: 3;
  width:  calc(100vw - 40px - 36vw);
  height: 16vw;
  bottom:0;
}
.up_rdp_hide {
  position: fixed;
  left: calc(40px + 18vw);
  z-index: 3;
  width:  calc(100vw - 40px - 36vw);
  height: 50px;
  bottom:calc(44vw - 50px);
}
.rdp_report {
  height: 100%;
  width: 100%
}
</style>

<style>

</style>
