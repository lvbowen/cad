<template>
  <div class="analysis-of-hidden-dangers full-height">
    <div class="title">
      <Icon src="goBack" :clickEvent="()=> {$router.go(-1)}"/>
      <span>隐患统计分析</span>
    </div>
    <div class="inner">
      <div
        v-for="(i,index) in tolal"
        :key="index"
        class="block"
        :style="{borderLeft:`4px solid ${i.color}`}">
        <div>
          <div class="text"> {{ i.text }}</div>
          <div class="value"> {{ i.value }}</div>
        </div>
      </div>
      <iframe :src="url" class="iframe-style"></iframe>
    </div>
  </div>
</template>

<script lang="ts">
import { Icon } from "@ctesi/component";
import { Vue, Component, InjectReactive } from 'vue-property-decorator';
import { getSecurityProblem, getReportUrl } from "../../service/api";
import * as Type from "../../type";

@Component( {
  name: 'AnalysisOfHiddenDangers',
  components: {
    Icon
  }
} )
export default class AnalysisOfHiddenDangers extends Vue {
  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;
  @InjectReactive( 'project' ) projectCode?: string;
  tolal: { text: string, key: string, value: number, color: string }[] = [
    {
      text: '今日检查',
      key: 'todeyCheck',
      value: 0,
      color: '#46A2F9'
    },
    {
      text: '累计检查',
      key: 'totalCheck',
      value: 0,
      color: '#7ACEB4'
    },
    {
      text: '今日问题',
      key: 'todayProblem',
      value: 0,
      color: '#ECB05A'
    },
    {
      text: '累计问题',
      key: 'totalProblem',
      value: 0,
      color: '#F55E43'
    },
    {
      text: '未整改问题',
      key: 'unfinishProblem',
      value: 0,
      color: '#EBE300'
    },
    {
      text: '超期问题',
      key: 'alertProblem',
      value: 0,
      color: '#3CCD8E'
    }
  ];
  url: string = '';

  //获取安全检查统计数据
  async getSecurityProblem() {
    const { data, errcode } = await getSecurityProblem( {
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? ''
    } )
    if ( errcode === 0 ) {
      if ( data && Object.keys( data ).length ) {
        this.tolal.map( ( item ) => {
          for ( const dataKey in data ) {
            if ( item.key === dataKey ) {
              item.value = data[dataKey];
            }
          }
        } )
      }
    }
  }

  //获取安全检查统计数据
  async getReportUrl() {
    const { data, errcode } = await getReportUrl( {
      schemaCode: 'zgtzs',
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? ''
    } )
    if ( errcode === 0 && data ) {
      this.url = data;
    }
  }

  mounted() {
    this.getSecurityProblem();
    this.getReportUrl();
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';

@base-color: #FFFFFF;
@font-f: Source Han Sans CN;
.analysis-of-hidden-dangers {
  > .title {
    font-family: @font-f;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: @spacing-base;
  }

  .inner {
    padding: @spacing-large;
    height: calc(100% - 30px);
    background-color: @base-color;

    .block {
      display: inline-block;
      padding: @spacing-medium @spacing-large;
      width: calc(16.6% - @spacing-medium);
      background-color: @base-color;
      border: 1px solid #E8E8E8;
      margin-right: @spacing-medium;

      .text {
        font-size: 16px;
        font-family: Microsoft YaHei;
        font-weight: bold;
        color: #999999;
        margin-bottom: @spacing-large;
      }

      .value {
        height: 33px;
        line-height: 33px;
        font-size: 50px;
        font-family: Arial;
        font-weight: bold;
        color: #000000;
      }
    }

    .iframe-style {
      margin-top: @spacing-large;
      width: 100%;
      height: calc(100% - 140px);
    }
  }
}

/deep/ table {
  width: 96% !important;
}
</style>
