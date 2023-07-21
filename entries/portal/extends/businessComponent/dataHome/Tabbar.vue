<template>
  <div style="width: 100%;height: 100%">
    <div class="menu-box">
      <div
        class="leveltwo-menu"
        :class="isChoose == index ? 'hight-bg' : ''"
        v-for="(item, index) in secMenuLists"
        :key="index"
        @click="choose(item, index)"
      >
        {{ item.tabName }}
      </div>
    </div>
    <div class="content-box">
      <template v-if="isRdp">
        <iframe
          :src="allRdp"
          frameborder="0"
          :style="{ display: isRdp ? 'block' : 'none' ,width:'86vw',height:'84vh'}"
        ></iframe>
      </template>
      <template v-else>
        <component
          class="tab-route"
          :key="projectName"
          :is="routeName"
          :projectName="projectName"
          :projectLevel="projectLevel"
          :treeId="treeId"
          :appCode="appCode"
          :expandKeys="expandKeys"
          :style="{ paddingLeft: isMonitor ? '0' : '8px' }"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import tools from "./utils";
import {getRdpByProjectNameAndTabName} from "./server";
// @ts-ignore
import env from "@/config/env";
// @ts-ignore
import allRouter from "../../routes.ts";

@Component({
  name: "Tabbar",
  components: {},
})
export default class Tabbar extends Vue {
  isChoose: Number = 0;
  hightBg: String = "hightBg";
  routeName: String = "";
  tabItemId: string = ""
  @Prop() secMenuLists!: Array<any>;
  @Prop() projectName!: String;
  @Prop() projectLevel!: String;
  @Prop() treeId!: any;
  @Prop() appCode!: String;
  @Prop() expandKeys!: Array<any>;
  @Prop() isMonitor!: Boolean;
  isRdp: Boolean = true;
  projectCode: String = "";
  notProTreeRouteName: Array<any> = ["MonitorPlatform"];
  allRdp: String = "";

  @Watch("secMenuLists", {immediate: true})
  secMenuListsChange(val) {
    this.choose(this.secMenuLists[0], 0);
  }

  choose(val, index) {
    // this.$emit("choose", val, index);
    this.tabItemId = val.id
    this.$emit('tabItemId', this.tabItemId)
    this.isChoose = index;
    getRdpByProjectNameAndTabName(this.appCode, this.projectName, val.id).then((ress) => {
      this.isRdp = ress.data.isRdp;
      if (ress.data.isRdp === false) {
        const route = tools.getRoute(allRouter, ress.data.routing);
        // @ts-ignore
        this.routeName = route.component;
        //视频监控
        if (this.notProTreeRouteName.includes(ress.data.routing)) {
          this.isMonitor = true;
        }
      } else {
        this.allRdp = ress.data.allRdp;
      }
    });
  }

  // mounted() {
  //   this.choose(this.secMenuLists[0], 0);
  // }
}
</script>

<style lang="less" scoped>
.menu-box {
  width: 99.1%;
  height: 43px;
  background: url("../../../src/assets/extends/datahome/second.png");
  background-size: 100% 100%;
  margin-bottom: 6px;
  margin-left: 8px;
  //min-width: 1520px;
}

.leveltwo-menu {
  cursor: pointer;
  z-index: 99;
  display: inline-block;
  width: 150px;
  text-align: center;
  line-height: 43px;
  margin-left: 15px;
  height: 50px;
  background-size: 100% 100%;
  font-size: 15px;
  color: #147bd7;
  font-weight: bold;
}

.content-box {
  width: 100%;
  height:calc(100vh - 175px);
}

.tab-route {
  padding: 8px;
  width: 100%;
   overflow: auto;
  flex: 1;
  position: relative;
  min-width: 1520px;
}

.hight-bg {
  background: url("../../../src/assets/extends/datahome/second_button.png");
  background-size: 100% 100%;
  color: #29D5F1
}
::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent;
}
</style>
