<template>
  <div class="global-search flex flex-column">
    <Header/>
    <div class="search-g flex-1 flex-column overflow-hidden">
      <div class="flex flex-center-align">
        <tIcon :src="'goBack'" :clickEvent="()=> $router.go(-1)"/>
        <div>全局搜索</div>
      </div>
      <div class="content flex-1 flex flex-column">
        <div class="search-key flex flex-space-between">
          <a-input placeholder="请输入关键字" v-model="searchNode.searchKey" @pressEnter="refreshListByKeyword"/>
          <a-select
            :disabled="!searchNode.searchKey.length"
            @change="selectChange"
            :value="selectedValue"
            :dropdownClassName="'select-icon-wrap'">
            <a-select-option v-for="(i,key) in selectOptions" :key="key" :value="i.value">
              {{ i.label }}
            </a-select-option>
          </a-select>
          <a-button type="primary" @click="refreshList" :loading="searchNode.loading">搜索</a-button>
        </div>
        <a-card class="flex-1 data">
          <div class="condition flex flex-space-between">
            <div class="left full-width">
              <div class="flex flex-space-between">
                <div>
                  <span class="f-title">搜索类型：</span>
                  <span
                    v-for="(t,key) in searchTypes"
                    :key="key"
                    @click="changeActive('search',t.key)"
                    v-show="t.isShow"
                    class="t-m-r"
                    :class="t.key===searchNode.activeSearchType?'active-type':!searchNode.searchKey.length?'disable':''">
                    {{ `${t.text}(${!overWindowFlag?t.value:t.value===upperLimit?upperLimit:t.value}` }}<span v-if="overWindowFlag && t.value===upperLimit">+</span>)
                  </span>
                </div>
                <div>
                  <span class="filters">更多筛选条件</span>
                  <a-icon type="right" @click="isDown=!isDown" v-show="!isDown"/>
                  <a-icon type="down" @click="isDown=!isDown" v-show="isDown"/>
                </div>
              </div>
              <div class="extre-condition" v-show="isDown">
                <div v-show="searchNode.activeSearchType!==0">
                  <span class="f-title">状态类型：</span>
                  <span
                    v-for="(t,key) in statusTypes"
                    :key="key"
                    @click="changeActive('status',t.key)"
                    class="t-m-r"
                    :class="t.key===searchNode.activeStatusType?'active-type':!searchNode.searchKey.length?'disable':''">
                    {{ `${t.text}(${!overWindowFlag?t.value:t.value===upperLimit?upperLimit:t.value}` }}<span v-if="overWindowFlag && t.value===upperLimit">+</span>)
                  </span>
                </div>
                <div>
                  <span class="f-title">日期范围：</span>
                  <a-date-picker
                    v-model="searchNode.startTime"
                    :allowClear="false"
                    :format="dateFormat"
                    :disabledDate="rangeStartPicker"></a-date-picker>
                  <span>-</span>
                  <a-date-picker
                    v-model="searchNode.endTime"
                    :allowClear="false"
                    :format="dateFormat"
                    :disabledDate="rangeEndPicker"></a-date-picker>
                </div>
              </div>
            </div>
          </div>
          <div class="result flex-1">
            <a-spin :spinning="searchNode.loading">
              <div class="total n-title">
                <span v-if="!searchNode.total">暂无结果</span>
                <span v-else>共找到搜索结果<span>{{ searchNode.total }}</span>个</span>
              </div>
              <div class="res flex-1" v-if="searchNode.dataSource.length">
                <div
                  v-for="(item,index) in searchNode.dataSource"
                  :key="index"
                  class="res-item flex flex-space-between"
                  @click="toUrl(item)"
                  @mouseenter="mouseenterFn(index)"
                  @mouseleave="mouseleaveFn">
                  <div class="left-item">
                    <div class="f-title">
                      <div v-html="item.name"></div>
                    </div>
                    <div>
                      <span>所属类型：<span style="color: #3BB141" v-if="item.type===0">菜单页面</span><span style="color: #409eff" v-else>数据标题</span></span>
                      <span>所属路径： <span v-html="item.path"></span></span>
                      <span v-if="item.type===1">所属菜单： <span v-html="item.menuName"></span></span>
                      <span>创建人：<span v-html="item.creator"></span>
                      </span>
                      <span v-if="item.type!==0">创建日期：{{ item.createTime }}</span>
                      <span v-if="item.type!==0">状态类型：{{ item.status===1?'进行中':'已完成' }}</span>
                    </div>
                  </div>
                  <img
                    src="../../../src/assets/extends/next-default.png"
                    v-if="index!==heightLightIndex"/>
                  <img src="../../../src/assets/extends/next-active.png" v-else/>
                </div>
              </div>
              <div class="not-res flex-1 flex-center" v-else>
                <img src="extends/businessComponent/dataHome/deviceManagement/1.png" alt="" class=""/>
              </div>
            </a-spin>
          </div>
        </a-card>
        <a-pagination
          showQuickJumper
          :total="typeof searchNode.total === 'string'? parseInt(searchNode.total.split('+')[0]):searchNode.total"
          :current="searchNode.currentPage+1"
          :pageSize="searchNode.pageSize"
          @change="onChangePage"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Watch} from 'vue-property-decorator';
import Header from "../../../src/components/shared/header/header.vue";
import {Icon as tIcon} from '@ctesi/component';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Pagination from 'ant-design-vue/lib/pagination';
import 'ant-design-vue/lib/pagination/style/index.css';
import * as Type from "../../type";
import moment, {Moment} from "moment";
import {exampleData} from "../engineeringArchives/mock";
import { StaticUtils } from '@cloudpivot/form/utils/utils';
import {getPageOrigin, getWorkFlowFormDetailUrl, getPageOrFormList} from "../../service/api";
// eslint-disable-next-line no-shadow
enum proType {
  menu = 0,
  bizForm = 1,
  all = -1
}

@Component({
  name: 'GlobalSearch',
  components: {
    Header,
    tIcon,
    AInput: Input,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACard: Card,
    AIcon: Icon,
    ADatePicker: DatePicker,
    ASpin: Spin,
    APagination: Pagination
  }
})
export default class GlobalSearch extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode!: string;
  selectOptions: { label: string, value: number }[] = [
    {
      label: '全部',
      value: -1
    },
    {
      label: '菜单页面',
      value: 0
    },
    {
      label: '数据标题',
      value: 1
    }
  ];
  selectedValue: number = -1;
  isDown: boolean = false;
  dateFormat:string= 'YYYY-MM-DD hh:mm:ss';
  searchTypes: Type.DefineTypes[] = [
    {
      text: '全部',
      key: -1,
      value: 0,
      isShow: true,
      field: 'all'
    },
    {
      text: '菜单页面',
      key: 0,
      value: 0,
      isShow: true,
      field: 'menuHits'// 后台约定字段值
    },
    {
      text: '数据标题',
      key: 1,
      value: 0,
      isShow: true,
      field: 'tableHits'
    }
  ];
  statusTypes: Type.DefineTypes[] = [
    {
      text: '全部',
      key: -1,
      value: 0,
      field: 'all' //约定
    },
    {
      text: '进行中',
      key: 0,
      value: 0,
      field: 'doingHits'
    },
    {
      text: '已完成',
      key: 1,
      value: 0,
      field: 'doneHits'
    }
  ];
  searchNode: Type.SearchNode = {
    searchKey: '',
    startTime: '',
    endTime: '',
    loading: false,
    total: 0,
    pageSize: 10,
    currentPage: 0, //0开始
    activeStatusType: -1,
    activeSearchType: -1,
    dataSource: []
  };
  heightLightIndex: number | null = null;
  upperLimit: number = 0;
  overWindowFlag: boolean = false;
  timer: any = null;
  isRefreshTotal: boolean = false;
  isMounted: boolean = false;

  @Watch('searchNode.searchKey',{immediate:true})
  watchKeyword(val) {
    if(val && val.trim().length) {
      if(val.length>100) {
        this.searchNode.searchKey = this.searchNode.searchKey.substring(0,100);
        return this.$message.warning('关键字不得超过100个字符！')
      }
      if(!this.isMounted){
        this.isRefreshTotal = true;
        this.searchNode.activeStatusType = -1;
        this.searchNode.activeSearchType = -1;
        this.refreshListByKeyword();
      }else {
        this.getList()
      }
    }
  }

  refreshListByKeyword() {
    StaticUtils.debound(this.refreshList,1000)
  }

  changeActive(flag: string, key: number) {
    if (!this.searchNode.searchKey.trim().length) return this.$message.warning('搜索关键字必填！')
    if (flag === 'search') {
      this.searchNode.activeSearchType = key;
    } else {
      this.searchNode.activeStatusType = key
    }
    this.isRefreshTotal = false;
    this.refreshList();
  }

  rangeStartPicker(val: Moment) {
    return moment(val).valueOf() > moment(this.searchNode.endTime).valueOf();
  }

  rangeEndPicker(val: Moment) {
    return moment(this.searchNode.startTime).valueOf() >= moment(val).valueOf();
  }

  selectChange(val: number) {
    this.selectedValue = val;
    switch (this.selectedValue) {
      case proType.menu:
        this.searchTypes.map((i) => {
          if (i.key !== proType.menu) {
            i.isShow = false
          } else {
            i.isShow = true
          }
        })
        this.searchNode.activeSearchType = proType.menu;
        this.isRefreshTotal = false;
        this.refreshList();
        break;
      case proType.bizForm:
        this.searchTypes.map((i) => {
          if (i.key !== proType.bizForm) {
            i.isShow = false
          } else {
            i.isShow = true
          }
        })
        this.searchNode.activeSearchType = proType.bizForm;
        this.isRefreshTotal = false;
        this.refreshList();
        break;
      default:
        this.searchTypes.map((i) => {
          i.isShow = true
        })
        this.searchNode.activeSearchType = proType.all;
        this.isRefreshTotal = false;
        this.refreshList();
        break;
    }
  }

  mouseenterFn(index: number) {
    this.heightLightIndex = index
  }

  mouseleaveFn() {
    this.heightLightIndex = null
  }

  refreshList() {
    this.searchNode.currentPage = 0;
    this.getList();
  }

  getList() {
    this.isMounted = false;
    if (!this.searchNode.searchKey.trim().length) return this.$message.warning('搜索关键字必填！')
    this.searchNode.dataSource = [];
    this.searchNode.total = 0;
    if(this.searchNode.activeSearchType===proType.menu) {
      this.searchNode.activeStatusType = -2;
    }
    this.searchNode.loading = true;
    getPageOrFormList({
      appCode: this.projectCode ?? '',
      keyword: this.searchNode.searchKey,
      startTime: this.searchNode.startTime ? moment(this.searchNode.startTime).format(this.dateFormat) : '',
      endTime: this.searchNode.endTime ? moment(this.searchNode.endTime).format(this.dateFormat) : '',
      status: this.searchNode.activeStatusType,
      type: this.searchNode.activeSearchType,
      currentPage: this.searchNode.currentPage,
      pageNum: this.searchNode.pageSize,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return;
      this.searchNode.dataSource = res.data?.datas ?? [];
      this.searchNode.total = !res.data?.overWindowFlag ? res.data?.totalHits?? 0 : `${(res.data?.pageNum??0) * (res.data?.totalPage??0 )}+`;
      if(this.isRefreshTotal) {
        this.upperLimit = (res.data?.pageNum??0) * (res.data?.totalPage??0 );
        this.overWindowFlag = res.data?.overWindowFlag;
        this.arrangeValue(this.searchTypes,res.data);
        this.searchTypes[0].value = !res.data?.overWindowFlag ? (this.searchTypes[1].value + this.searchTypes[2].value):(this.searchTypes[1].value + this.searchTypes[2].value)>this.upperLimit?this.upperLimit:(this.searchTypes[1].value + this.searchTypes[2].value)
        this.arrangeValue(this.statusTypes,res.data);
        this.statusTypes[0].value = !res.data?.overWindowFlag ? (this.statusTypes[1].value + this.statusTypes[2].value):(this.statusTypes[1].value + this.statusTypes[2].value)>this.upperLimit?this.upperLimit:(this.statusTypes[1].value + this.statusTypes[2].value)
      }
      //记录参数
      sessionStorage.setItem('searchParams',JSON.stringify({
        keyword: this.searchNode.searchKey,
        startTime: this.searchNode.startTime ? moment(this.searchNode.startTime).format(this.dateFormat) : '',
        endTime: this.searchNode.endTime ? moment(this.searchNode.endTime).format(this.dateFormat) : '',
        status: this.searchNode.activeStatusType,
        type: this.searchNode.activeSearchType,
        currentPage: this.searchNode.currentPage,
        total: this.searchNode.total,
        searchTypes: this.searchTypes,
        statusTypes: this.statusTypes,
        upperLimit: this.upperLimit,
        overWindowFlag: this.overWindowFlag
      }))
      }).finally(()=> {
      this.searchNode.loading = false
    })
  }

  arrangeValue(arr:Type.DefineTypes[],obj:Type.SearchNodeRes) {
    arr.map((i) => {
      for (const dataKey in obj) {
        if (i.field===dataKey) {
          i.value = !obj?.overWindowFlag?obj[i.field]:obj[i.field]>this.upperLimit?this.upperLimit:obj[i.field]
        }
      }
    })
  }

  onChangePage(pageNumber: number) {
    this.searchNode.currentPage = pageNumber - 1
    //更新列表
    this.getList();
  }

  toUrl(item: Type.SearchList) {
    if (item.type === proType.menu) {
      switch (item.menuType) {
        case 3:
          this.pageGo(item)
          break;
        case 2:
          this.bizModelGo(item)
          break;
        case 4:
          getPageOrigin({
            appCode: this.projectCode ?? '',
            reportCode: item.schemaCode
          }).then((res) => {
            if (!res.data || res.data.length === 0) return;
            if (res.data[0].origin === 'yunshu') return this.reportGo(item, 'applicationReport');
            return this.reportGo(item, 'applicationRdp');
          })
          break;
      }
    } else if (item.type === proType.bizForm) {
      getWorkFlowFormDetailUrl({
        schemaCode: item.schemaCode,
        bizObjectId: item.objectId as string
      }).then((res) => {
        let urlDetail = '';
        let urlReturn = `/${this.projectCode}/GlobalSearch?code=${item.schemaCode}&openMode&pcUrl&queryCode=&iframeAction=detail`;
        if(this.isDingTalk) {
          urlReturn = `${this.$route.fullPath}?iframeAction=detail`
        }
        urlDetail = `${res}&return=${encodeURIComponent(urlReturn)}`;
        //@ts-ignore
        this.isDingTalk?this.$router.push(urlDetail):window.open(`/${this.projectCode}${urlDetail}`)
      })
    }
  }

  pageGo(menu: Type.SearchList) {
    if (menu.openMode === 0) {
      if(!menu.pcUrl) return this.$message.warning('页面地址未设置，请联系管理员！')
      this.$router.push({
        name: 'applicationDefine',
        params: {
          url: menu.pcUrl
        },
        query: {
          parentId: menu.parentId,
          code: menu.schemaCode,
          openMode: 'RECENT_PAGE_MODE',
          pcUrl: menu.pcUrl
        },
      })
    } else if (menu.openMode === 2) {
      if(!menu.pcUrl) return this.$message.warning('页面地址未设置，请联系管理员！')
      window.open(menu.pcUrl);
    } else {
      if(!menu.pcUrl) return this.$message.warning('页面地址未设置，请联系管理员！')
      this.$router.push({
        path: menu.pcUrl,
        query: {
          parentId: menu.parentId,
          code: menu.schemaCode,
          pcUrl: menu.pcUrl
        },
      })
    }
  }

  bizModelGo(menu: Type.SearchList) {
    this.$router.push({
      name: 'applicationList',
      params: {
        appCode: menu.appCode,
        schemaCode: menu.schemaCode
      },
      query: {
        parentId: menu.parentId,
        code: menu.schemaCode,
        pcUrl: menu.pcUrl
      },
    })
  }

  reportGo(menu: Type.SearchList, routeName: string) {
    // debugger
    this.$router.push({
      name: routeName,
      params: {
        appCode: menu.appCode,
        reportCode: menu.schemaCode
      },
      query: {
        parentId: menu.parentId,
        code: menu.schemaCode,
        pcUrl: menu.pcUrl
      },
    })
  }

  mounted() {
    if(!sessionStorage.getItem('searchParams')) return
    //@ts-ignore
    const searchParams = JSON.parse(sessionStorage.getItem('searchParams'));
    this.searchNode.searchKey = searchParams.keyword;
    this.searchNode.startTime = searchParams.startTime;
    this.searchNode.endTime = searchParams.endTime;
    this.searchNode.activeStatusType = searchParams.status;
    this.searchNode.activeSearchType = searchParams.type;
    this.searchNode.currentPage = searchParams.currentPage;
    this.searchNode.total = searchParams.total;
    this.searchTypes = searchParams.searchTypes;
    this.statusTypes = searchParams.statusTypes;
    this.upperLimit = searchParams.upperLimit;
    this.overWindowFlag = searchParams.overWindowFlag;
    this.isMounted = true;
    // const mockData = exampleData.response.data;
    // this.searchNode.dataSource = mockData.globalSearchRes.searchRes
  }
}
</script>

<style scoped lang="less">
@import "../../styles/public.module.less";

@inner-padding: 16px;
.global-search {
  .search-g {
    padding: @spacing-large;
    font-family: Adobe Heiti Std;

    .base-title {
      font-family: Adobe Heiti Std;
      font-weight: bold;
      font-size: 14px;
    }

    .f-title {
      .base-title;
      color: #0A0A0A;
    }

    .n-title {
      .base-title;
      color: #666666;
    }

    .base-border {
      border-bottom: 1px solid #e6e1e1;
    }

    > div:first-child {
      .f-title;
    }

    .content {
      .search-key {
        margin: @spacing-medium @spacing-base;

        .ant-btn {
          margin-left: @spacing-base;
        }

        /deep/ .ant-select {
          .ant-select-selection__rendered {
            min-width: 70px;
          }
        }
      }

      .ant-card {
        /deep/ .ant-card-body {
          padding: 0 !important;
          .full-height;
          .flex-column
        }
      }

      .data {
        margin: 0 @spacing-base;

        .filters {
          margin-right: @spacing-base;
        }

        .condition {
          .base-border;
          padding: @spacing-medium;

          .left {
            .t-m-r {
              margin-right: @spacing-base;
              cursor: pointer;

              &:hover {
                font-weight: bold;
              }
            }

            color: #666666;

            .extre-condition {
              div {
                margin-top: @spacing-medium;
              }
            }

            .active-type {
              color: #2970FF;
              font-weight: bold;
            }
          }
        }

        .result {

          /deep/ .ant-spin-nested-loading {
            height: 100% !important;

            .ant-spin-container {
              .full-height;
              .flex-column
            }
          }

          .total {
            padding: @spacing-base @spacing-base @spacing-base @spacing-medium;
            .base-border;
          }

          .res {
            overflow-y: auto;

            .res-item {
              padding: @spacing-large 2*@spacing-medium;
              .base-border;

              .left-item {
                > div:first-child {
                  margin-bottom: @spacing-base;
                  font-weight: normal;
                }

                > div:last-child {
                  color: #AEAEAE;
                  > span {
                    margin-right: @spacing-large;
                  }

                }
              }

              &:hover {
                background: rgba(41, 112, 255, 0.08);
              }
            }
          }

          .not-res {
            img {
              width: min-content;
            }
          }
        }
      }

      .ant-pagination {
        text-align: right;
        margin: @spacing-large @spacing-base @spacing-base 0;
      }
    }
  }
}
</style>
<style lang="less">
.select-icon-wrap {
  .ant-select-dropdown-menu-item-selected {
    color: #2970FF !important;
  }
}
</style>
