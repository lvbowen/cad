<template>
  <div class="quick-entrance flex flex-column">
    <div class="header flex-center-align">
      <!-- <Icon name="arrow-left" @click="back()"/> -->
      <div>快捷入口</div>
    </div>
    <h3-scroll
      ref="scroll-apps"
      :loadMore="init"
      :pageSize="pageSize"
    >
      <div class="contents" v-show="!showSearchPanel">
        <div class="flex-justify-between full-width in">
          <div>编辑快捷入口</div>
          <Button type="primary" shape="round" @click="save()">保存</Button>
        </div>
        <Divider/>
        <div class="search">
          <Search v-model="searchVaule" placeholder="搜索" @focus="focusSearch"></Search>
        </div>
        <div class="added text-left">
          <div>已添加（{{ quickFolderData.length }}/12）</div>
          <template v-if="quickFolderData.length">
            <div class="added-p-i full-width flex-center-align" v-for="(i,index) in quickFolderData" :key="index">
              <img :src="i.icon? require(`../../Img/${i.type}.png`):`${require('../../Img/mor.png')}`" class="img-icon"/>
              <span>{{ i.name }}</span>
              <img src="../../Img/clear.png" @click="deleteQuickEntry(i,index)"/>
            </div>
          </template>
          <div v-else class="blank">
            <img src="../../Img/blank.png"/>
            <p class="small">暂无内容</p>
          </div>
          <Divider class="small">以上应用展示在业务页面</Divider>
        </div>
        <Divider/>
        <div class="not-added">
          <div>待添加</div>
          <template v-if="allData.length">
            <Collapse v-model="activeNames">
              <CollapseItem
                v-for="(i,index) in allData"
                :key="index"
                :name="index"
                :class="!i.children? 'none': ''"
              >
                <template #title v-show="i.children">
                  <div class="inner" :style="{backgroundColor:`${imgBC[index%4]}`}"><img :src="i.icon" v-if="i.icon && i.icon.indexOf('base64')>-1"/><img v-else src="../../Img/mo.png"/></div>
                  <span>{{ i.name }}</span>
                </template>
                <template v-if="i.children && Array.isArray(i.children) && i.children.length">
                  <div v-for="(item,key) in i.children" :key="item.name+key">
                    <template v-if="item.children && Array.isArray(item.children) && item.children.length">
                      <Collapse v-model="indexArr[index]">
                        <CollapseItem
                          :name="key"
                        >
                          <template #title>
                            <div class="inner"><img src="../../Img/Folder.png" class="img-small"/></div>
                            <span>{{ item.name }}</span>
                          </template>
                          <template v-if="item.children && Array.isArray(item.children) && item.children.length">
                            <div v-for="(value,m) in item.children" :key="value.name + m">
                              <template v-if="value.children && Array.isArray(value.children) && value.children.length">
                                <Collapse v-model="activeNamesChildrenThree">
                                  <CollapseItem
                                    :name="key"
                                  >
                                    <template #title>
                                      <div class="inner"><img src="../../Img/Folder.png" class="img-small"/></div>
                                      <span>{{ value.name }}</span>
                                    </template>
                                    <div v-for="(i4,key4) in value.children" :key="i4.name+key4">
                                      <div class="not-added-p full-width flex-center-align">
                                        <img :src="i4.icon? require(`../../Img/${i4.type}.png`):`${require('../../Img/mor.png')}`" class="img-icon"/>
                                        <span>{{ i4.name }}<span v-show="i4.published" class="added-log">已添加</span></span>
                                        <img
                                          v-if="!i4.published"
                                          src="../../Img/add-q.png"
                                          @click="addQuickEntry(i4,index,key,m,key4)"/>
                                      </div>
                                    </div>
                                  </CollapseItem>
                                </Collapse>
                              </template>
                              <template v-else>
                                <div class="not-added-p full-width flex-center-align">
                                  <img :src="value.icon? require(`../../Img/${value.type}.png`):`${require('../../Img/mor.png')}`" class="img-icon"/>
                                  <span>{{ value.name }}<span v-show="value.published" class="added-log">已添加</span></span>
                                  <img
                                    v-if="!value.published"
                                    src="../../Img/add-q.png"
                                    @click="addQuickEntry(value,index,key,m,null)"/>
                                </div>
                              </template>
                            </div>
                          </template>
                          <template v-else>
                            <span class="info">暂无信息</span>
                          </template>
                        </CollapseItem>
                      </Collapse>
                    </template>
                    <template v-else>
                      <div class="not-added-p flex-center-align">
                        <img :src="item.icon? require(`../../Img/${item.type}.png`):`${require('../../Img/mor.png')}`" class="img-icon"/>
                        <span>{{ item.name }}<span v-show="item.published" class="added-log">已添加</span></span>
                        <img v-if="!item.published" src="../../Img/add-q.png" @click="addQuickEntry(item,index,key,null,null)"/>
                      </div>
                    </template>
                  </div>
                </template>
                <template v-else>
                  <div class="not-added-last">
                    <div class="not-added-p full-width flex-center-align">
                      <img :src="i.icon? require(`../../Img/${i.type}.png`):`${require('../../Img/mor.png')}`" class="img-icon"/>
                      <span>{{ i.name }}<span v-show="i.published" class="added-log">已添加</span></span>
                      <img
                        v-if="!i.published"
                        src="../../Img/add-q.png"
                        @click="addQuickEntry(i,index,null,null,null)"/>
                    </div>
                  </div>
                </template>
              </CollapseItem>
            </Collapse>
          </template>
          <div v-else class="blank">
            <img src="../../Img/blank.png"/>
            <p class="small">暂无内容</p>
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
          <div v-for="(item,index) in searchResult" :key="index" class="panel flex-center-align">
            <img :src="item.icon? require(`../../Img/${item.type}.png`):`${require('../../Img/mor.png')}`" class="img-icon"/>
            <span>{{ item.name }}</span>
            <img v-if="!item.published" src="../../Img/add-q.png" @click="addQuickEntryBySearch(item)"/>
            <span v-else class="added-log">已添加</span>
          </div>
        </div>
        <div v-show="notRes" class="not-res">
          <div>没有搜索到相关结果</div>
        </div>
      </div>
    </h3-scroll>
  </div>
</template>

<script lang="ts">
import {Icon, Search, Divider, Collapse, CollapseItem, Notify, Toast} from 'vant';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import {Component, Vue,Watch} from "vue-property-decorator";
import env from '@/config/env';
import {getQuickNonFolder, getAllEntryData, editEntryData} from '../../service/business';
import AntIcon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import mobile from '@cloudpivot/form/src/renderer/components/mobile';
import SearchPanel from '@cloudpivot/application/src/components/mobile/search-panel.vue';

@Component({
  name: 'Business',
  components: {
    Icon,
    Button,
    Search,
    Divider,
    Collapse,
    CollapseItem,
    H3Scroll: mobile.H3Scroll,
    AntIcon,
    SearchPanel
  }
})
export default class Business extends Vue {
  searchVaule: String = '';
  quickFolderData: Array<any> = [];
  allData: Array<any> = [];
  activeNames: Array<Number> = [0];
  imgBC: Array<String> = ['#19BE6C', '#FFA800', '#545EEC', '#0999F0'];
  showSearchPanel: boolean = false;
  appList: any = [];
  searchResult: Array<any> = [];
  notRes: Boolean = false;
  pageSize: number = 24;
  activeNamesChildrenThree: Array<Number> = [0];
  indexArr: Array<Array<number>> = [];
  @Watch('showSearchPanel',{deep:true})
  watchIsPanel(val) {
    if(val) return;
    this.searchVaule = '';
    this.searchResult = [];
  }
  init(page: number, done: Function) {
    this.getQuickNonFolder(done);
    this.getAll();
  }
  //获取快捷入口数据
  async getQuickNonFolder(done) {
    //@ts-ignore
    const {data, errcode, errmsg} = await getQuickNonFolder({projectCode: env.project, isMobile: true}).finally(()=> {
      this.$nextTick(() => {
        if (done && typeof (done) === 'function') done(10, 10);
      })
    });
    if (errcode === 0) {
      if (data && Array.isArray(data) && data.length) {
        this.quickFolderData = data;
      }
    } else {
      Notify({type: 'warning', message: `${errmsg}`});
    }
  }

  //获取所有数据
  async getAll() {
    this.indexArr = [];
    //@ts-ignore
    const {data, errcode, errmsg} = await getAllEntryData({projectCode: env.project, isMobile: true});
    if (errcode === 0) {
      if (data && Array.isArray(data) && data.length) {
        this.allData = data;
        //处理遍历层数
        this.allData.map(()=> {
          this.indexArr.push([0])
        })
      }
    } else {
      Notify({type: 'warning', message: `${errmsg}`});
    }
  }

  //添加
  async save() {
    const params = {
      folder: 0, //快捷入口
      projectCode: env.project,
      quickEntryBaseCmdList: []
    };
    this.quickFolderData.map((item) => {
      params.quickEntryBaseCmdList.push({
        //@ts-ignore
        appFunctionId: item.id,
        //@ts-ignore
        code: item.code,
        //@ts-ignore
        codeName: item.name,
        //@ts-ignore
        type: item.type
      })
    })
    //@ts-ignore
    const {errcode, errmsg} = await editEntryData(params);
    if (errcode === 0) {
      Notify({type: 'success', message: '保存成功',duration:1500});
      setTimeout(()=>{
        this.$router.go(-1)
      },1500)
    } else {
      Notify({type: 'warning', message: `${errmsg}`});
    }
  }

  /**
   * 临时保存项
   * @param item 保存项
   * @param index 1层index
   * @param key 2层index
   * @param m 3层index
   * @param key4 4层index
   * 注意：至多支持4层遍历--N?
   */
  addQuickEntry(item, index, key, m,key4) {
    if (this.quickFolderData.length > 11) return Notify({type: 'warning', message: '最多添加12个！'});
    if (key===null && m===null && key4===null) { //1层
      this.$set(this.allData[index], 'published', true);
    }else if (m===null && key4===null) { //2层
      this.$set(this.allData[index].children[key], 'published', true);
    } else if(key4===null && m!==null){ //3层
      this.$set(this.allData[index].children[key].children[m], 'published', true)
    }else { //4层
      this.$set(this.allData[index].children[key].children[m].children[key4], 'published', true)
    }
    this.quickFolderData.push(item);
  };

  //临时删除
  deleteQuickEntry(item, index) {
    this.quickFolderData.splice(index, 1);
    //取消删除
    this.treeArrFilter(this.allData, 'children', 'id', item.id, 'published', false);
  };

  /**
   * 树形数组筛选塞值:数组对象根据对象中指定的属性+指定需要改变的属性和值
   * @param arr 元素为对象的数组
   * @param attChildren 父子级关联键名
   * @param key 标识属性
   * @param value 标识属性值
   * @param field 指定属性
   * @param fieldValue 指定值
   */
  treeArrFilter(arr:any[] = [], attChildren = 'children', key, value, field, fieldValue) {
    arr.map((item) => {
      if (item[key] === value) {
        this.$set(item, field, fieldValue)
      }
      if (item[attChildren]) {
        this.treeArrFilter(item[attChildren], attChildren, key, value, field, fieldValue);
      }
    });
  }

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
    this.searchResult = this.treeArrFilterAll(this.allData,'children','name',this.searchVaule,'children',null);
    if(!this.searchResult || !this.searchResult.length) this.notRes = true;
  };
  inputSearch() {
    this.notRes = false;
  }
  /**
   * 树形数组筛选:数组对象根据对象中指定的属性
   * @param arr 元素为对象的数组
   * @param attChildren 父子级关联键名
   * @param key1 指定属性
   * @param value1 指定值
   * @param key2 指定属性
   * @param value2 指定值
   * @returns {[]}
   */
  treeArrFilterAll(arr:any = [], attChildren = 'children', key1, value1,key2,value2) {
    let finalArr = [];
    arr.map((item) => {
      //@ts-ignore
      if(item[key1].indexOf(value1)> -1 && item[key2] === value2 ) {
        //@ts-ignore
        finalArr.push(item);
      }
      if (item[attChildren]) {
        const p = this.treeArrFilterAll(item[attChildren], attChildren, key1, value1,key2,value2);
        finalArr = finalArr.concat(p)
      }
    });
    return finalArr;
  };

  addQuickEntryBySearch (item) {
    if (this.quickFolderData.length > 11) return Notify({type: 'warning', message: '最多添加12个！'});
    this.treeArrFilter(this.allData,'children','id',item.id,'published',true);
    this.quickFolderData.push(item);
  }

  goAppItem(appCode: any) {
    this.$router
      .push({
        name: "app-item",
        params: {
          appCode,
        },
      })
      .catch((err: any) => {
        err;
      });
  };
  back() {
    if(!this.showSearchPanel) this.$router.go(-1);
    this.showSearchPanel = false;
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
//通用样式
.add-p-i {
  .px2rem(margin, @spacing-base);
  .px2rem(margin-bottom, @spacing-large);
  .px2rem(padding-left, 2 * @spacing-medium);

  .anticon {
    .px2rem(font-size, @font-size-medium);
    .px2rem(margin-right, @spacing-base);
  }

  .img-icon {
    .px2rem(margin-right, 20);
    .px2rem(width,40);
    .px2rem(height,40);
  }
  > img:last-child {
    display: inline-block;
    .px2rem(width, 50);
    .px2rem(height, 50);
    position: absolute;
    right: 0;
  }

  .added-log {
    display: inline-block;
    color: @font-color-base;
    background-color: rgba(158, 177, 198, .4);
    border-radius: 15%;
    .px2rem(margin-left, @spacing-base);
    .px2rem(padding, 6);
    line-height:1 !important;
  }
}
.blank {
  text-align: center;
  color: #8D8C8C;
  p {
    .px2rem(margin-top, 20);
    .px2rem(margin-bottom, 20);
  }
  img {
    width: 50%;
  }
}
.quick-entrance {
  text-align: left;
  height: inherit;
  //.px2rem(padding-bottom,60);
  .header {
    .px2rem(padding, @spacing-large);
    color: @font-color-base;
    .px2rem(font-size, 32);
    background-color: #2758fd;
    .px2rem(height, 88px);

    > div {
      margin: 0 auto;
      font-weight: bold;
    }
  }
  .mescroll {
    position: static;
  }

  .contents {
    background-color: @font-color-base;
    .px2rem(padding, @spacing-large);
    //.px2rem(margin, @spacing-base);

    .in {
      color: @font-color-weight;
      .px2rem(font-size, @font-size-medium + 2);
      font-weight: bold;
    }

    .search {
      .px2rem(margin-top, @spacing-medium);
      .px2rem(margin-bottom, 2 * @spacing-medium);

      /deep/ .van-search {
        .px2rem(padding, 0);
        .px2rem(padding-bottom, 0);
      }
    }

    .added {
      color: @font-color-weight;
      .px2rem(font-size, @font-size-small);
      font-weight: bolder;
      .px2rem(margin-bottom, @spacing-large);

      > div:first-child {
        .px2rem(margin-bottom, @spacing-large)
      }
      .small {
        .px2rem(font-size,@font-size-small);
        font-weight: normal;
        text-align: center;
        color: #969799;
      }
      .added-p-i {
        .add-p-i;
        .px2rem(padding-left, 0);
        position: relative;
        .px2rem(margin-bottom, @spacing-large);
      }

      .van-divider {
        .px2rem(font-size, @font-size-base - 10);
      }
    }

    .not-added {
      position: relative;
      > div:first-child {
        color: @font-color-weight;
        .px2rem(font-size, @font-size-small);
        font-weight: bolder;
        .px2rem(margin-bottom, @spacing-large);
      }
      .not-added-last {
        color: #323233;
        .px2rem(margin-bottom,@spacing-large);
        .px2rem(font-size,@font-size-medium);
        >div:first-child {
          margin: 0;
          padding: 0;
        }
      }
      .inner {
        display: inline-block;
        border-radius: 10px;
        .px2rem(margin-right, @spacing-base);

        > img {
          display: inline-block;
          .px2rem(width, 40);
          .px2rem(height, 40);
          .px2rem(margin, @spacing-base)
        }
      }

      .add-p {
        background-image: url("../../Img/add-q.png");
      }

      .info {
        color: #999999;
      }

      .not-added-p {
        .add-p-i;
      }
    }
  }

  .search-s {
    .px2rem(margin, @spacing-base);
    .px2rem(padding-bottom,@spacing-medium);
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

  /deep/ .van-collapse {
    .none{
      .van-cell{
        .px2rem(padding-right, 0);
        display: none !important;
      }
    }
    .van-cell{
      .px2rem(padding-right, 0);
    }
    .van-collapse-item__content {
      padding: 0;
      .px2rem(padding-left,50px);
    }
  }
  /deep/ .van-search__content {
    border-radius: 30px;
  }
}
</style>
