<template>
  <article class="analysis-pop">
    <vue-drag-resize :isResizable="false" :parentLimitation="false">
      <div class="analysis-container">
        <h4>{{ title }}</h4>
        <a-table
          :pagination="false"
          :columns="tableLabel"
          :data-source="tableData"
          :scroll="{ y: 350}"
        >
          <template v-slot:msg="record">
            <a
              v-if="record.property&&record.msg!=='查看/编辑'"
              @click="toUrl(record)"
              class="underline">
              <img
                src="../../../../src/assets/extends/bim/infoPop/11.png"
                style="width: 18px;height:17px;"/>{{ "\xa0" + "." + "\xa0" + record.msg }}</a>
            <a
              v-else-if="record.property&&record.msg==='查看/编辑'"
              @click="toUrl(record)">{{ record.msg }}</a>
            <p v-else>{{ record.msg }}</p>
          </template>
          <template v-slot:name="record">
            <p style="color: #0BCDA3">{{ record.name }}</p>
          </template>
        </a-table>
      </div>
      <p class="close-png" @click="closePop">X</p>
    </vue-drag-resize>
  </article>
</template>

<script lang="ts">
/// <reference path="../../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";
import VueDragResize from "vue-drag-resize";
import * as ModelApi from "../../../service/modelInterface";
import {listApi} from '@cloudpivot/api';
import env from "@/config/env";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";

@Component({
  name: "AnalysisPop",
  components: {VueDragResize, ATable: Table},
})
export default class AnalysisPop extends Vue {
  @InjectReactive('project') projectCode!: string;

  @Prop() private analysisDetail!: any;

  tableData: Array<object> | null = [];
  tableLabel: Array<object> = [
    {
      title: '属性',
      width: '120px',
      align: 'center',
      key: 'name',
      scopedSlots: {customRender: 'name'},
    },
    {
      title: '值',
      key: 'msg',
      align: 'center',
      scopedSlots: {customRender: 'msg'},
    }];
  title: string = '';

  @Watch('analysisDetail', {immediate: true})
  analysisDetailListener(v) {
    console.log('analysisDetail', v)
    if (v) {
      this.init(v)
    }
  }

  init(v) {
    ModelApi.getDataFromCoordinate({
      appCode: this.projectCode,
      dataId: v.id,
      schemaCode: v.schemaCode
    })
      .then(res => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg as string)
        this.title = Object.keys(res.data ?? {})[0] ?? '';
        this.tableData = res.data?.[this.title]
      })
  }

  closePop() {
    this.$emit('closePop', 'AnalysisDetailPop')
  }

  toUrl(value) {
    const token = localStorage.getItem("token");
    if (value.property.indexOf("/") != -1) return window.open(`${env.apiHost}/${value.property}&access_token=${token}`)
    if (value.property.indexOf("/") == -1) {
      listApi.getFormUrl({
        bizObjectId: value.property,
        schemaCode: value.schemaCode,
      }).then(res => {
        return window.open(`${env.portalHost}${res}&access_token=${token}`)
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../styles/antd.less";
@import "../../../styles/public.module.less";

.vdr.active:before {
  outline: 0px;
}

.analysis-pop {
  position: absolute;
  top: 100px;
  right: 600px;
  z-index: 9;

  .analysis-container {
    .flex-column;
    width: 400px;
    height: 500px;
    padding: 20px 40px;
    background: url("../../../../src/assets/extends/cim/bg_pop.png");
    background-size: 100% 100%;
    .table-small-transparent;

    h4 {
      font-size: 18px;
      width: 150px;
      height: 35px;
      line-height: 35px;
      margin: 0 auto 20px auto;
      text-align: center;
      color: #01ffff;
      background: url("../../../../src/assets/extends/cim/kuang_shuizhi_title.png");
      background-size: 100% 100%;
    }
  }

  .close-png {
    color: #fff;
    z-index: 9999;
    position: absolute;
    top: 10px;
    right: -170px;
    cursor: pointer;
  }
}
</style>
