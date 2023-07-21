<template>
  <div class="all-application">
    <!--<ListPanel />-->
    <div class="header flex-center-align">
      <Icon name="arrow-left" @click="back()"/>
      <div>全部应用</div>
    </div>
    <div class="content-t" v-show="!showSearchPanel">
      <div class="search">
        <Search v-model="searchVaule" placeholder="搜索" @focus="focusSearch"></Search>
      </div>
      <div class="commonly-used">
        <div class="flex-justify-between full-width in">
          <div>常用应用</div>
          <div class="edit flex-center-align" @click="$router.push({name:'editAllApplication'})">
            <img src="../../Img/编辑.png"/>
            编辑
          </div>
        </div>
        <div class="select" v-if="commonAppsArr.length">
          <Row v-for="(i,index) in commonAppsArr" :key="index" class="select-row">
            <Col :span="6" v-for="(item,key) in i" :key="key">
            <div class="inner" :style="{backgroundColor:`${imgBC[key%4]}`}" @click="goNext(item)"><img :src="item.icon" v-if="item.icon && item.icon.indexOf('base64')>-1"/><img v-else src="../../Img/mo.png"/></div>
            <div class="line-height">{{ item.name }}</div>
            </Col>
          </Row>
        </div>
        <div v-else class="blank">
          <img src="../../Img/blank.png"/>
          <p>将常用的应用添加到此处</p>
        </div>
      </div>
      <Divider class="small">以上应用展示在业务页面</Divider>
      <Divider />
      <div class="all">
        <div class="flex-justify-between full-width title">
          <div>全部应用</div>
        </div>
        <div class="select" v-if="appArr.length">
          <Row v-for="(i,index) in appArr" :key="index" class="select-row">
            <Col :span="6" v-for="(item,key) in i" :key="key">
            <div class="inner" :style="{backgroundColor:`${imgBC[key%4]}`}" @click="goNext(item)"><img :src="item.icon" v-if="item.icon && item.icon.indexOf('base64')>-1"/><img v-else src="../../Img/mo.png"/></div>
            <div class="line-height">{{ item.name }}</div>
            </Col>
          </Row>
        </div>
        <div v-else class="blank">
          <img src="../../Img/blank.png"/>
          <p>暂无应用</p>
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
          <img :src="item.icon? require(`../../Img/${item.type}.png`):`${require('../../Img/mor.png')}`"/>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div v-show="notRes" class="not-res">
        <div>没有搜索到相关结果</div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {Vue, Component, Watch,Mixins} from 'vue-property-decorator';
import { Icon,Search,Divider,Row,Col } from 'vant';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import AntIcon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import {getCommonApps, appListApps} from "../../service/business";
import env from '@/config/env';
import OpenFormMixin from '@cloudpivot/application/src/components/mobile/open-form';

@Component({
  name:'all-application',
  components: {
    Icon,
    Search,
    Button,
    Divider,
    Row,
    Col,
    AntIcon
  }
})
export default class AllApplication extends Mixins(OpenFormMixin) {
  showSearchPanel: boolean = false;
  searchVaule: String = '';
  searchResult: Array<any> = [];
  notRes: Boolean = false;
  commonAppsArr: Array<any> = [];
  allApps:Array<any> = [];
  addAppList:Array<any> = [];
  appArr:Array<any> = [];
  imgBC: Array<String> = ['#4798FF','#F99341','#19BE6C', '#FFA800', '#545EEC', '#0999F0'];
  @Watch('showSearchPanel',{deep:true})
  watchIsPanel(val) {
    if(val) return;
    this.searchVaule = '';
    this.searchResult = [];
  }
  back() {
    this.notRes = false;
    if(!this.showSearchPanel) this.$router.go(-1);
    this.showSearchPanel = false;
  };
  async getCommonApps() {
    //@ts-ignore
    const {data, errcode, errmsg} = await getCommonApps({projectCode: env.project, isMobile: true});
    if(errcode === 0) {
      if(data && Array.isArray(data) && data.length)  this.commonAppsArr = this.fakePagination(data);
    }else {
      this.$message.error(errmsg)
    }
  }
  async getAllApps() {
    this.allApps = [];
    //@ts-ignore
    const {data, errcode, errmsg} = await appListApps({appCode: env.project, isMobile: true});
    if(errcode === 0) {
      if(data && Array.isArray(data) && data.length)  {
        this.appArr = this.fakePagination(data);
        this.allApps = data;
      }
    }else {
      this.$message.warn(errmsg)
    }
  };
  //分组处理
  fakePagination(data:any[]=[]) {
    let minArr = []; //小数组
    const maxArr = [];
    data.forEach((c) => {
      // 小数组有4条数据，生成一个新数组
      if (minArr.length === 4) {
        minArr = [];
      }
      // 小数组满4条数据，放进大数组内
      if (minArr.length === 0) {
        //@ts-ignore
        maxArr.push(minArr);
      }
      //@ts-ignore
      minArr.push(c);
    });
    return maxArr;
  };
  //移入
  focusSearch() {
    this.showSearchPanel = true;
  };
  //取消
  cancelSearch() {
    this.showSearchPanel = false;
    this.searchResult = [];
  };
  //清除
  clearSearch() {
    this.searchResult = [];
  }
  //查询
  search() {
    this.searchResult = this.treeArrFilter(this.allApps,'children','name',this.searchVaule);
    if(!this.searchResult || !this.searchResult.length) this.notRes = true;
  };
  /**
   * 树形数组筛选:数组对象根据对象中指定的属性
   * @param arr 元素为对象的数组
   * @param attChildren 父子级关联键名
   * @param key 指定属性
   * @param value 指定值
   * @returns {[]}
   */
  treeArrFilter(arr:any[] = [], attChildren = 'children', key, value) {
    let finalArr = [];
    arr.map((item:any) => {
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
  mounted() {
    this.getCommonApps();
    this.getAllApps();
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
.all-application {
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
  .content-t {
    overflow: auto;
    height: inherit;
    background-color: @font-color-base;
    .px2rem(padding, @spacing-large);
    .commonly-used {
      .ant-btn {
        background-color: #9EB1C6;
        font-weight: bold;
        color: #FFFFFF;
      }
      .px2rem(margin-top,@spacing-base);
      .px2rem(margin-bottom,@spacing-base);
      .in {
        color: @font-color-weight;
        .px2rem(font-size, @font-size-medium + 2);
        font-weight: bold;
        .px2rem(margin-bottom,@spacing-large);
        .edit {
          color: #248AF9;
          img {
            .px2rem(width,30);
            .px2rem(height,30);
            .px2rem(margin-right,5);
          }
        }
      }
      .select {
        .select;
      }
    }
    .small {
      .px2rem(font-size,@font-size-small);
    }
    .all {
      .title {
        color: @font-color-weight;
        .px2rem(font-size, @font-size-medium + 2);
        font-weight: bold;
        .px2rem(margin-bottom,@spacing-large);
      }
      .select {
        .select;
      }
    }
    .select {
      text-align: left;
      .select-row {
        text-align: center;
        color: #666666;
        .px2rem(margin-bottom,@spacing-large);
        .inner {
          display: inline-block;
          border-radius: 10px;
          position: relative;
          .px2rem(margin-bottom,@spacing-base);
          > img {
            display: inline-block;
            .px2rem(width, 50);
            .px2rem(height, 50);
            .px2rem(margin, @spacing-base);
          }
        }
        .line-height {
          line-height: 1.3;
        }
      }
    }
  }
  .search-s {
    height: inherit;
    overflow: auto;
    .px2rem(padding-bottom, @spacing-large);
    .px2rem(margin, @spacing-base);
    background-color: @font-color-base;
    .panel {
      position: relative;
      .add-p-i;
    }
    .not-res {
      text-align: center;
      .px2rem(margin-top,2 * @spacing-large);
    }
  }
  //通用样式
  .add-p-i {
    .px2rem(margin, @spacing-base);
    .px2rem(margin-bottom, @spacing-large);
    .px2rem(padding-left, 2 * @spacing-medium);

    .anticon {
      .px2rem(font-size, @font-size-medium);
      .px2rem(margin-right, @spacing-base);
    }

    > img:last-child {
      display: inline-block;
      .px2rem(width, 50);
      .px2rem(height, 50);
      position: absolute;
      right: 0;
    }

    > span:last-child {
      .px2rem(margin-left, @spacing-base);
      .px2rem(padding, 2);
      line-height: 1.3;
    }
  }
  /deep/ .van-search__content {
    border-radius: 30px;
  }
  .blank {
    color: #8D8C8C;
    p {
      .px2rem(margin-top, 20);
      .px2rem(margin-bottom, 20);
    }
    img {
      width: 50%;
    }
  }
}
</style>
