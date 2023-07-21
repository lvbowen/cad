<template>
  <div class="multi-role full-height">
    <div class="title">
      <Icon src="goBack" :clickEvent="()=> {$router.go(-1)}"/>
      <span>安全组织架构与岗位职责</span>
    </div>
    <div class="content">
      <div class="left">
        <a-button size="small" @click="bizModelGo(menuOrganization,`${ projectCode }_aqzzjg`)">修改</a-button>
        <div class="title">组织架构图</div>
        <a-carousel arrows dotsClass="slick-dots slick-thumb">
          <a slot="customPaging" slot-scope="props">
            <img :src="getImgUrl(props.i)"/>
          </a>
          <div v-for="(url,index) in urls" :key="index">
            <img :src="url"/>
          </div>
        </a-carousel>
      </div>
      <div class="right">
        <a-button size="small" @click="bizModelGo(menuDuty,`${ projectCode }_gwaqsczr`)">修改</a-button>
        <div class="title">岗位职责</div>
        <div class="title">岗位角色</div>
        <div v-if="roles.length">
          <div v-for="(r,r_key) in roles" :key="r_key">
            <div v-if="r && Array.isArray(r) && r.length" class="flex">
              <div
                class="roles"
                :class="active === 4 * r_key + index ? 'active-roles' : ''"
                v-for="(i,index) in r"
                :key="index"
                @click="highLightRole(4 * r_key + index,i.id)">
                <div>{{ i.gw }}</div>
                <template v-if="i.personList && Array.isArray(i.personList) && i.personList.length">
                  <div v-for="(name,key) in i.personList" :key="key" class="person">{{ name }}</div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="title">岗位职责</div>
          <div v-for="(i,index) in duty" :key="index" class="duty-item">
            <div class="icon-duty"></div>
            {{ i }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, InjectReactive } from "vue-property-decorator";
import { Icon } from "@ctesi/component";
import Carousel from 'ant-design-vue/lib/carousel';
import 'ant-design-vue/lib/carousel/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import env from "@/config/env";
import { getJobInfo, getSevurityArch, getJobDescrib, getAppList } from "../../service/api";
import * as Type from "../../type";

@Component( {
  name: 'MultiRole',
  components: {
    Icon,
    ACarousel: Carousel,
    AButton: Button
  }
} )
export default class MultiRole extends Vue {
  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;
  @InjectReactive( 'project' ) projectCode?: string;
  bimURL: string = `${ env.apiHost }`;
  urls: Array<string> = [];
  roles: Array<any> = [];
  bdcArr: Array<any> = [];
  duty: Array<any> = [];
  active: number = 0;
  currentId: string = '';
  menuOrganization: { appCode: string, parentId: string, code: string }[] = [];
  menuDuty: { appCode: string, parentId: string, code: string }[] = [];

  getImgUrl( i ) {
    return `${ this.urls[i] }`;
  }

  //获取安全组织架构图
  async getSevurityArch() {
    const { data, errcode } = await getSevurityArch( {
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? ''
    } )
    if ( errcode === 0 ) {
      if ( data?.length ) {
        this.urls = data;
      }
    }
  }

  //获取安全岗位信息
  async getJobInfo() {
    const { data, errcode } = await getJobInfo( {
      appCode: this.projectCode,
      projectName: this.projectConfig?.projectName ?? ''
    } )
    if ( errcode === 0 ) {
      if ( data && Array.isArray( data ) && data.length ) {
        this.fakePagination( data );
        this.currentId = data[0]?.id ?? '';

        await this.getJobDescrib()
      }
    }
  }

  //获取安全岗位信息
  async getJobDescrib() {
    const { data, errcode } = await getJobDescrib( {
      appCode: this.projectCode,
      id: this.currentId
    } )
    if ( errcode === 0 ) {
      if ( data?.length ) {
        this.duty = data;
      }
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
        this.menuOrganization = this.treeArrFilter( data, 'children', 'code', `${ this.projectCode }_aqzzjg` );
        this.menuDuty = this.treeArrFilter( data, 'children', 'code', `${ this.projectCode }_gwaqsczr` );
      }
    }
  }

  //分页
  fakePagination( data: any = [] ) {
    let bdcMinArr: any[] = []; //小数组
    this.roles = [];
    data.forEach( ( c ) => {
      // 小数组有4条数据，生成一个新数组
      if ( bdcMinArr.length === 4 ) {
        bdcMinArr = [];
      }
      // 小数组满4条数据，放进大数组内
      if ( bdcMinArr.length === 0 ) {
        this.roles.push( bdcMinArr );
      }
      bdcMinArr.push( c );
    } );
  }

  highLightRole( index, id ) {
    this.currentId = id;
    this.active = index;
    this.getJobDescrib();
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

  bizModelGo( menu: any[],code:string ) {
    if ( !menu.length ) {
      this.$router.push({
        name: 'applicationList',
        params: {
          appCode: this.projectCode??'',
          schemaCode: code
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
    this.getSevurityArch();
    this.getJobInfo();
    this.getAppList();
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';

@base-color: #FFFFFF;
@font-f: Source Han Sans CN;


.multi-role {
  > .title {
    font-family: @font-f;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: @spacing-base;
  }

  .content {
    height: calc(100% - 30px);
    display: flex;
    justify-content: space-between;

    > div {
      width: 49%;
      background-color: @base-color;
      padding: @spacing-large;
    }

    .title {
      .title;
      margin-bottom: @spacing-large;
    }

    .left {
      overflow: auto;
      position: relative;
    }

    .right {
      overflow: auto;
      position: relative;

      .roles {
        width: calc(25% - @spacing-large);
        text-align: center;
        display: inline-block;
        position: relative;
        top: 0;
        margin-right: @spacing-large;
        margin-bottom: 2 * @spacing-large;

        div:first-child {
          background: #5c99e5;
          border-radius: 10px 10px 0 0;
          padding: 8px 0;
          font-size: 16px;
          color: #ffffff;
          font-weight: bold;
        }

        .person {
          font-size: 14px;
          font-family: Microsoft YaHei;
          color: #666666;
          line-height: 2;

          &:nth-child(2) {
            margin-top: @spacing-base;
          }
        }

        transition: width, height 0.5s;
        cursor: pointer;

        &:hover {
          transform: scale(1.1);
        }
      }

      .active-roles {
        border: 1px solid #2970FF;
        border-radius: 10px;

        div:first-child {
          background: #2970FF;
        }
      }

      .duty-item {
        font-size: 14px;
        font-family: Source Han Sans CN;
        font-weight: bold;
        color: #666666;
        margin-bottom: 4px;

        .icon-duty {
          width: 10px;
          height: 10px;
          background: #FFFFFF;
          border: 2px solid #2970FF;
          transform: rotate(45deg);
          display: inline-block;
          margin-right: @spacing-base;
        }
      }
    }
  }
}

/deep/ .ant-carousel {
  .slick-dots {
    height: auto;
  }

  .slick-slide img {
    border: 5px solid #fff;
    display: block;
    margin: auto;
    max-width: 80%;
  }

  .slick-thumb {
    bottom: -45px;
  }

  .slick-thumb li {
    width: 60px;
    height: 45px;
  }

  .slick-thumb li img {
    width: 100%;
    height: 100%;
    filter: grayscale(100%);
  }

  .slick-thumb li.slick-active img {
    filter: grayscale(0%);
  }

  .slick-next {
    display: none !important;
  }
}

/deep/ .ant-btn {
  position: absolute;
  right: @spacing-medium;
}
</style>
