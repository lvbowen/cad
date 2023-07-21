<template>
  <div class="risk-list-report full-height">
    <div class="title">
      <a-button size="small" type="primary" @click="bizModelGo(menuRiskListReport)">编辑</a-button>
      <Icon src="goBack" :clickEvent="()=> {$router.go(-1)}"/>
      <span> {{ title }}</span>
    </div>
    <iframe :src="url" class="iframe-style" frameborder="0"></iframe>
  </div>
</template>

<script lang="ts">
import { Vue, Component, InjectReactive, Prop } from 'vue-property-decorator';
import { Icon } from "@ctesi/component";
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import { getReportUrl, getAppList } from "../../service/api";
import * as Type from "../../type";

@Component( {
  name: 'RiskListReport',
  components: {
    Icon,
    AButton: Button
  }
} )
export default class RiskListReport extends Vue {
  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;
  @InjectReactive( 'project' ) projectCode?: string;
  @Prop( {
    default: () => ''
  } ) reportId?: string;
  @Prop( {
    default: () => ''
  } ) title?: string;
  url: string = '';
  menuRiskListReport: { appCode: string, parentId: string, code: string }[] = [];

  //获取安全检查统计数据
  async getReportUrl() {
    const { data, errcode } = await getReportUrl( {
      schemaCode: this.reportId || '',
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? ''
    } )
    if ( errcode === 0 && data ) {
      this.url = data;
    }
  }

  //获取菜单列表
  async getAppList() {
    const { data, errcode } = await getAppList( {
      isMobile: false,
      appCode: this.projectCode
    } )
    if ( errcode === 0 ) {
      if ( data ) {
        this.menuRiskListReport = this.treeArrFilter( data, 'children', 'code', `${ this.projectCode }_${ this.reportId }` );
      }
    }
  }

  treeArrFilter( arr, attChildren = 'children', key, value ) {
    let finalArr = [];
    arr.map( ( item ) => {
      if ( item[key] === value ) {
        //@ts-ignore
        finalArr.push( item );
      }
      if ( item[attChildren] ) {
        const p = this.treeArrFilter( item[attChildren], attChildren, key, value );
        finalArr = finalArr.concat( p )
      }
    } );
    return finalArr;
  }

  bizModelGo( menu: any[] ) {
    if ( !menu.length ) {
      this.$router.push({
        name: 'applicationList',
        params: {
          appCode: this.projectCode??'',
          schemaCode: `${ this.projectCode }_${ this.reportId }`
        }
      })
      return
      // this.$message.error( '未找到相关配置，请联系管理员' )
    }
    this.$router.push( {
      name: 'applicationList',
      params: {
        appCode: menu[0].appCode,
        schemaCode: menu[0].code
      },
      query: {
        parentId: menu[0].parentId,
        code: menu[0].code
      },
    } ).catch( ( err: any ) => {
      err
    } );
  }

  mounted() {
    this.getReportUrl();
    this.getAppList();
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';

@base-color: #FFFFFF;
@font-f: Source Han Sans CN;

.risk-list-report {
  > .title {
    font-family: @font-f;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: @spacing-base;
    position: relative;

    .ant-btn {
      position: absolute;
      right: @spacing-medium;
    }
  }

  .iframe-style {
    margin-top: @spacing-large;
    width: 100%;
    height: calc(100% - 60px);
  }
}
</style>
