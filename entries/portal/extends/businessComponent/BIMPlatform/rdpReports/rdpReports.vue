<template>
  <article style="height: 0;width: 0">
    <div class="left_rdp" v-show="dataRDP.leftReport">
      <iframe :src="dataRDP.leftReport" class="rdp_report" frameborder="0"/>
    </div>
    <div :class="dataRDP.leftReport?'mid_rdp':'Allmid_rdp'" v-show="dataRDP.middleReport">
      <iframe :src="dataRDP.middleReport" class="rdp_report" frameborder="0"/>
    </div>
    <div class="up_rdp" v-show="dataRDP.upReport">
      <iframe :src="dataRDP.upReport" class="rdp_report" frameborder="0"/>
    </div>
    <div class="right_rdp" v-show="dataRDP.rightReport">
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
  @Prop() dataRDP: any;
  mid_rdp: string = "mid_rdp"
  Allmid_rdp: string = "Allmid_rdp"
  mounted() {
    console.log('dataRDP', this.dataRDP);
  }
}
</script>

<style lang="less" scoped>
@import '../BIMPlatform.module.less';


.right_rdp {
  position: fixed;
  z-index: 999;
  right: 15px;
  width: 18vw;
  height: 44vw;
  bottom: 1vw;
}

.left_rdp {
  position: fixed;
  left: 15px;
  z-index: 999;
  width: 18vw;
  height: 44vw;
  bottom: 1vw;
}

.mid_rdp {
  position: fixed;
  left: 20vw;
  z-index: 999;
  width: 60vw;
  height: 15vw;
  bottom:1vw;
}

.Allmid_rdp {
  position: fixed;
  left: 0vw;
  z-index: 999;
  width: 100%;
  height: 15vw;
  bottom:1vw;
}

.up_rdp {
  position: fixed;
  left: 20vw;
  z-index: 999;
  width: 60vw;
  height: 50px;
  bottom:calc(45vw - 50px);
}

.rdp_report {
  height: 100%;
  width: 100%
}
</style>

<style>

</style>
