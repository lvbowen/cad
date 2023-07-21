<template>
  <div class="details flex flex-column collapse-item">
    <div class="header flex-center-align">
      <Icon name="arrow-left" @click="$router.go(-1)"/>
      <div v-if="appItems.length">{{ appItems[0].name }}</div>
    </div>
    <div v-if="appItems.length && appItems[0].children && appItems[0].children.length" class="box">
      <div class="content-t" v-show="!showSearchPanel">
        <div class="search">
          <Search v-model="searchVaule" placeholder="搜索" @focus="focusSearch"></Search>
        </div>
        <div class="menu text-left">
          <div v-for="(i,index) in appItems[0].children" :key="index">
            <div v-show="i.type==='Folder'">
              <Collapse v-model="activeNames">
                <CollapseItem
                  :key="index"
                  :name="index"
                >
                  <template #title>
                    <img class="img-title" :src="i.icon" v-if="i.icon && i.icon.indexOf('base64')>-1"/>
                    <img class="img-title" v-else-if="i.type==='Folder'" src="../../Img/Folder.png"/>
                    <span class="first-title">{{ i.name }}</span>
                  </template>
                  <template v-if="i.children && Array.isArray(i.children) && i.children.length">
                    <div v-for="(item,key) in i.children" :key="item.name+key">
                      <template v-if="item.children && Array.isArray(item.children) && item.children.length">
                        <Collapse v-model="activeNamesChildren">
                          <CollapseItem
                            :name="key"
                          >
                            <template #title>
                              <img class="img-title" :src="i.icon" v-if="i.icon && i.icon.indexOf('base64')>-1"/>
                              <img class="img-title" v-else-if="i.type==='Folder'" src="../../Img/Folder.png"/>
                              <span class="first-title">{{ item.name }}</span>
                            </template>
                            <div v-for="(m,n) in item.children" :key="m.name+n">
                              <div class="not-added-p flex-center-align" @click="goPageByType(item)">
                                <img :src="m.icon? require(`../../Img/${m.type}.png`):`${require('../../Img/mor.png')}`"/>
                                <span>{{ m.name }}</span>
                              </div>
                            </div>
                          </CollapseItem>
                        </Collapse>
                      </template>
                      <template v-else>
                        <div class="not-added-p flex-center-align" @click="goPageByType(item)">
                          <img :src="item.icon? require(`../../Img/${item.type}.png`):`${require('../../Img/mor.png')}`"/>
                          <span>{{ item.name }}</span>
                        </div>
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    <span class="info">暂无信息</span>
                  </template>
                </CollapseItem>
              </Collapse>
            </div>
            <div v-show="i.type!=='Folder'">
              <div class="first-app full-width flex-center-align" @click="goPageByType(i)">
                <img :src="i.icon? require(`../../Img/${i.type}.png`):`${require('../../Img/mor.png')}`"/>
                <span class="first-title">{{ i.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="search-s" v-show="showSearchPanel">
        <form action="/">
          <Search
            v-model="searchVaule"
            placeholder="搜索"
            @cancel="cancelSearch"
            @search="search"
            @clear="clearSearch"
            @input="inputSearch"
            showAction></Search>
        </form>
        <!-- 主体内容 -->
        <div v-show="searchResult.length">
          <div
            v-for="(item,index) in searchResult"
            :key="index"
            class="panel flex-center-align"
            @click="goNext(item)">
            <img v-show="item.type==='Folder'" :src="item.icon && item.icon.indexOf('base64')>-1? item.icon:`${require('../../Img/Folder.png')}`"/>
            <img v-show="item.type!=='Folder'" :src="item.icon? require(`../../Img/${item.type}.png`):`${require('../../Img/mor.png')}`"/>
            <span>{{ item.name }}</span>
          </div>
        </div>
        <div v-show="notRes" class="not-res">
          <div>没有搜索到相关结果</div>
        </div>
      </div>
    </div>
    <Loading v-else class="not">
      加载中…
    </Loading>
  </div>
</template>

<script lang="ts">
import {Component, Vue,Mixins,Watch,InjectReactive} from 'vue-property-decorator';
import env from "@/config/env";
import { appListApps } from "../../service/business";
import { Collapse, CollapseItem, Divider, Icon, Search,Loading} from "vant";
import { AppItem } from "../../type";
import AntIcon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import OpenFormMixin from '@cloudpivot/application/src/components/mobile/open-form';
import { getPageOrigin} from "../../service/api";

@Component({
  name:'Details',
  components: {
    Icon,
    Search,
    Divider,
    Collapse,
    CollapseItem,
    AntIcon,
    Loading
  }
})
export default class Details extends Mixins(OpenFormMixin) {
  @InjectReactive('project') projectCode?: string;
  appItems: Array<AppItem> = [];
  showSearchPanel: boolean = false;
  searchVaule: String = '';
  searchResult: Array<any> = [];
  notRes: Boolean = false;
  activeNames: Array<Number> = [0];
  activeNamesChildren: Array<Number> = [0];
  allApps:Array<any> = [];
  imgBC: Array<String> = ['#19BE6C', '#FFA800', '#545EEC', '#0999F0'];
  @Watch('$route.params.id',{deep:true})
  changeView() {
    this.getAllApps();
    this.cancelSearch();
  }
  async getAllApps() {
    this.currentApp = {
      code: env.project
    };
    //@ts-ignore
    const {data, errcode, errmsg} = await appListApps({appCode:env.project,isMobile: true});
    if(errcode === 0) {
      if(data && Array.isArray(data) && data.length)  {
        this.allApps = data;
        this.appItems = this.treeArrFilter(data,'children','id',this.$route.params.id);
      }
    }else {
      this.$message.error(errmsg)
    }
  }
  /**
   * 树形数组筛选:数组对象根据对象中指定的属性
   * @param arr 元素为对象的数组
   * @param attChildren 父子级关联键名
   * @param key 标识属性
   * @param value 标识属性值
   */
  treeArrFilter(arr, attChildren = 'children', key, value) {
    let finalArr = [];
    arr.map((item) => {
      if (item[key].indexOf(value)> -1) {
        //@ts-ignore
        finalArr.push(item);
      }
      if (item[attChildren]) {
        const p = this.treeArrFilter(item[attChildren], attChildren, key, value);
        finalArr = finalArr.concat(p)
      }
    });
    return finalArr;
  }
  //移入
  focusSearch() {
    this.showSearchPanel = true;
  };
  //取消
  cancelSearch() {
    this.showSearchPanel = false;
    this.searchResult = [];
    this.searchVaule = '';
  };
  //清除
  clearSearch() {
    this.searchResult = [];
  }
  //查询
  search() {
    if(this.appItems[0].children && this.appItems[0].children.length) {
      this.searchResult = this.treeArrFilter(this.appItems[0].children,'children','name',this.searchVaule);
      if(!this.searchResult || !this.searchResult.length) this.notRes = true;
    }
  };
  inputSearch() {
    this.notRes = false;
  };
  goNext(item) {
    //isFolder
    if(item.type === 'Folder') {
      this.$router.push({
        name: 'details',
        params: {
          id:item.id
        }
      })
    }else {
      this.goFormList(item)
    }
  }
  goPageByType(item:AppItem) {
    if(item.type==='Report'){
      getPageOrigin({
        appCode: this.projectCode??'',
        reportCode: item.code
      }).then((res)=> {
        if (!res.data || res.data.length === 0) return;
        //@ts-ignore
        if (res.data[0].origin === 'yunshu') return this.goFormList(item);
        return this.rdpGo(item);
      })
    }else {
      //@ts-ignore
      this.goFormList(item)
    }
  }
  rdpGo(menu: any) {
    this.$router.push({
      name: 'appRdp',
      params: {
        appCode: menu.appCode,
        reportCode: menu.code
      },
      query: {
        parentId: menu.parentId,
        code: menu.code,
        openMode: menu.openMode,
        pcUrl: menu.pcUrl
      },
    })
  }
  mounted() {
    this.getAllApps();
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
.details {
  height: inherit;
  .px2rem(padding-bottom,60);
  .header {
    .px2rem(padding, @spacing-large);
    color: @font-color-base;
    .px2rem(font-size, 32);
    background-color: #004898;
    .px2rem(height, 88px);

    > div {
      margin: 0 auto;
      font-weight: bold;
    }
  }
  .box {
    height: inherit;
    .content-t {
      overflow: auto;
      height: inherit;
      background-color: rgba(255,255,255,1);
      .px2rem(padding, @spacing-large);
      .menu {
        color: @font-color-weight;
        font-weight: bolder;
        .px2rem(margin-bottom, @spacing-large);
        .img-title {
          display: inline-block;
          .px2rem(width, 50);
          .px2rem(height, 50);
          .px2rem(margin, @spacing-base)
        }
        .first-title {
          .px2rem(font-size, @font-size-medium);
        }
        .inner {
          .px2rem(margin-right, @spacing-base);
          .px2rem(font-size, 40);
        }
        .info {
          color: #999999;
        }
        .not-added-p {
          .add-p-i;
        }
        .first-app {
          .px2rem(font-size, @font-size-small);
          .px2rem(margin, @spacing-base);
          .px2rem(margin-bottom, @spacing-large);
          .px2rem(padding-left, @spacing-medium);
          img {
            .px2rem(width, 50);
            .px2rem(height, 50);
            .px2rem(margin-right, @spacing-base);
          }
        }
      }
    }
    .search-s {
      height: inherit;
      overflow: auto;
      .px2rem(padding-bottom, @spacing-large);
      .px2rem(margin, @spacing-base);
      background-color: rgba(255,255,255,0);
      .panel {
        position: relative;
        .add-p-i;
      }
      .not-res {
        text-align: center;
        .px2rem(margin-top,2 * @spacing-large);
      }
    }
  }
  .not {
    .px2rem(margin-top,2 * @spacing-large);
  }
  //通用样式
  .add-p-i {
    .px2rem(margin, @spacing-base);
    .px2rem(margin-bottom, @spacing-large);
    .px2rem(padding-left, @spacing-medium);
    img {
      .px2rem(width, 50);
      .px2rem(height, 50);
      .px2rem(margin-right, @spacing-base);
    }
  }
  /deep/ .van-search__content {
    border-radius: 30px;
  }
  /deep/ .van-collapse {
    .van-cell,.van-cell__title {
      .flex-center-align
    }
    .van-collapse-item__content {
      padding: 0;
      .px2rem(padding-left,50px);
    }
  }
}
</style>
