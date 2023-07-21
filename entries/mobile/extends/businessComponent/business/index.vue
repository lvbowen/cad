<template>
  <div class="business">
    <!-- 选择项目-->
    <div v-if="isMultiProject" class="project" @click="isModalShow = true">
      <span>{{ this.projectConfig.projectName }}</span>
      <i class="el-icon-caret-bottom arrow-icon"></i>
    </div>
    <div class="project" v-else>
      <span>{{ this.projectConfig.projectName }}</span>
    </div>
    <!-- <div class="business_title">工作台</div> -->
    <h3-scroll ref="scroll-qu" :loadMore="init" :pageSize="pageSize">
      <!-- 快捷入口-->
      <!-- <div class="quick">
        <div class="all">
          <div>快捷入口</div>
          <div @click="$router.push({ name: 'quickEntrance' })">
            全部
            <Icon type="right" />
          </div>
        </div>
        <div v-if="quickFolderData.length" class="flex-root">
          <Col
            :span="11"
            v-for="(item, index) in quickFolderData"
            :key="index"
            :offset="1"
            @click="goFormList(item)"
            class="quick-content flex-center-align"
          >
            <img :src="item.icon? require(`../../Img/${item.type}.png`): `${require('../../Img/mor.png')}`" />
            <span>{{ item.name }}</span>
          </Col>
        </div>
        <div v-else class="blank">
          <img src="../../Img/blank.png" />
          <p>将常用的表单添加到此处</p>
          <Button shape="round" type="primary" @click="$router.push({ name: 'quickEntrance' })">
            添加
          </Button>
        </div>
      </div> -->
      <!-- <div class="quick">
        <div class="all">
          我的流程
          <div>我的首页</div>
          <div @click="$router.push({name:'quickEntrance'})">全部
            <Icon type="right"/>
          </div>
        </div>
        <div class="home_tag">
          <router-link :to="{ path: '/home/workitems' }">
            <img src="../../Img/img/workbench_icon1.png" alt="" />
            <p>我的待办</p>
          </router-link>
          <router-link :to="{ path: '/home/circulates' }">
            <img src="../../Img/img/workbench_icon2.png" alt="" />
            <p>我的待阅</p>
          </router-link>
          <router-link :to="{ path: '/home/finished-workitems' }">
            <img src="../../Img/img/workbench_icon3.png" alt="" />
            <p>我的已办</p>
          </router-link>
          <router-link :to="{ path: '/home/finished-circulates' }">
            <img src="../../Img/img/workbench_icon4.png" alt="" />
            <p>我的已阅</p>
          </router-link>
        </div>
      </div> -->
      <div class="quick">
        <div class="all">
          <Badge v-if="unfinishListLength!==0" :content="unfinishListLength" max="9">
            <span>我的待办</span>
          </Badge>
          <span v-else>我的待办</span>
          <div @click="$router.push({name: 'workitems'})">更多</div>
        </div>
        <div class="home_tag">
          <div
            class="unfinshBox"
            @click="toDetail(item)"
            v-for="(item,index) in unfinishList"
            :key="index">
            <div>
              <img src="../../Img/daiban (1).png" alt="">
              <div>{{ item.workflowName }}</div>
            </div>
            <span class="unfinshTime">{{ item.startTime.split(" ")[0] }}</span>
          </div>
        </div>
      </div>
      <!--我的消息-->
      <div class="quick">
        <div class="all">
          <Badge :content="!unReadMessageCount?'':unReadMessageCount>9?'9+':unReadMessageCount">
            <span>通知消息</span>
          </Badge>
          <div @click="$router.push({name: 'notice'})">更多</div>
        </div>
        <NoticeBar :scrollable="false" v-show="fakeMyMessageList.length">
          <Swipe
            vertical
            class="notice-swipe"
            :autoplay="15000"
            :showIndicators="false"
          >
            <SwipeItem v-for="(i,key) in fakeMyMessageList" :key="key">
              <div
                v-for="(item,index) in i"
                :key="index"
                class="mes"
                @click="openDetailMessage(item)">
                <div>
                  <img
                    v-if="item.isRead"
                    :src="item.noticeSort===0?require('../../Img/home/message/xmgg.png'): item.noticeSort===1?require('../../Img/home/message/jdyj.png'):item.noticeSort===2?require('../../Img/home/message/fxyj.png'):require('../../Img/home/message/cbyj.png') "
                    alt="">
                  <img
                    v-else
                    :src="item.noticeSort===0?require('../../Img/home/message/unreadxmgg.png'): item.noticeSort===1?require('../../Img/home/message/unreadjdyj.png'):item.noticeSort===2?require('../../Img/home/message/unreadfxyj.png'):require('../../Img/home/message/unreadcbyj.png') "
                    alt="">
                  <div>{{ item.noticeTitle }}</div>
                </div>
                <span class="upload-time">{{ item.uploadTime }}</span>
              </div>
            </SwipeItem>
          </Swipe>
        </NoticeBar>

      </div>
      <!-- 常用应用-->
      <div class="application">
        <div class="all">
          <!-- <div>全部功能</div> -->
          <div></div>
          <!-- <div @click="$router.push({ name: 'allApplication' })">
            全部
            <Icon type="right" />
          </div> -->
        </div>
        <!-- <div class="bimModel">
          <div>BIM模型</div>
          <div class="childMenu">
            <div @click="tobim">
              <img src="../../Img/img/bim.png" alt="" />
              <p>BIM模型</p>
            </div>
          </div>
        </div> -->
        <Collapse v-if="commonApplications.length" class="select" v-model="activeNames">
          <div
            v-for="(item, index) in commonApplications"
            :key="index"
            class="select-row"
            :class="item.type == 'Folder'? '' : inblock ">
            <div v-if="item.type == 'Folder'" class="applicationMenu">{{ item.name }}</div>
            <div v-else class="childMenus">
              <div
                @click="goNext(item)"
              >
                <img
                  :src="item.mobileIcon?item.mobileIcon:item.type === 'BizModel'?BizModelImg:item.type === 'Folder'?FolderImg:item.type === 'Page'?PageImg:item.type === 'Report'?ReportImg:''"
                  alt="">
                <p>
                  {{ item.name }}
                </p>
              </div>
            </div>
            <CollapseItem :title="item.name" v-if="item.type==='Folder'" :name="item.name">
              <div class="childMenu">
                <div
                  v-for="(childItem, childIndex) in item.children"
                  :key="childIndex"
                  @click="goNext(childItem)"
                >
                  <img
                    :src="childItem.mobileIcon?childItem.mobileIcon:childItem.type === 'BizModel'?BizModelImg:childItem.type === 'Folder'?FolderImg:childItem.type === 'Page'?PageImg:childItem.type === 'Report'?ReportImg:''"
                    alt="">
                  <p>
                    {{ childItem.name }}
                  </p>
                </div>
              </div>
            </CollapseItem>
          </div>
          <!-- <Row v-for="(i, index) in commonApplications" :key="index" class="select-row">
            <Col :span="6" v-for="(item, key) in i" :key="key">
              <div class="inner" :style="{ backgroundColor: `${imgBC[key % 4]}` }" @click="goNext(item)">
                <img :src="item.icon" v-if="item.icon && item.icon.indexOf('base64') > -1" />
                <img v-else src="../../Img/mo.png" />
              </div>
              <div class="text">{{ item.name }}</div>
            </Col>
          </Row> -->
        </Collapse>
        <div v-else class="blank">
          <img src="../../Img/blank.png"/>
          <p>将常用的应用添加到此处</p>
          <Button
            type="primary"
            shape="round"
            @click="$router.push({ name: 'editAllApplication' })"
          >
            添加
          </Button>
        </div>
      </div>
      <div class="bimImg" v-if="bimImgUrl">
        <h3>模型浏览</h3>
        <img v-if="!iframeBimShow" :src="IMG_IP + bimImgUrl" alt="">
        <div @click="bimShowClick">
          <img src="../../Img/bimiframe.png" alt="">
        </div>
      </div>
      <Panorama :projectName="projectConfig.projectName"></Panorama>
      <!-- <div class="bim" v-if="iframeBimShow">
        <Bim class="iframeBim" :selectedId="selectedId"></Bim>
      </div> -->
    </h3-scroll>
    <Modal
      :visible="isModalShow"
      v-if="isModalShow"
      :footer="null"
      :maskClosable="true"
      @cancel="modalCancel">
      <tree
        v-if="treeData.length"
        :treeData="treeData"
        :defaultSelectedKeys="defaultSelectedKeys"
        :defaultExpandAll="true"
        @select="onSelect"
      />
    </Modal>
    <DetailMessage
      :showMessage="showMessage"
      :message="selectedMessage"
      @closeMessageOverlay="closeMessageOverlay"/>
  </div>
</template>

<script lang="ts">
import {Notify, Toast, Badge, NoticeBar, Swipe, SwipeItem,Collapse, CollapseItem} from "vant";
import {Component, Vue, Mixins, InjectReactive} from "vue-property-decorator";
import OpenFormMixin from "@cloudpivot/application/src/components/mobile/open-form";
import {getTreeData, getQuickNonFolder, getCommonApps} from "../../service/business";
import env from "@/config/env";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import "ant-design-vue/lib/tree/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style/index.css";
import Row from "ant-design-vue/lib/row";
import "ant-design-vue/lib/row/style/css.js";
import Col from "ant-design-vue/lib/col";
import "ant-design-vue/lib/col/style/css.js";
import mobile from "@cloudpivot/form/src/renderer/components/mobile";
import * as Type from "../../type";
import BizModelImg from "../../Img/img/bizmodel.png";
import FolderImg from "../../Img/img/folder.png";
import PageImg from "../../Img/img/page.png";
import ReportImg from "../../Img/img/report.png";
import {form, homeApi} from "@cloudpivot/api";
import {getMobileHomePagePicture} from "../service/index"
import Bim from "../BIM/BIM";
import Panorama from "../HomePage/Panorama.vue";
import {MyMessage,UrlDetail,AppItem} from "../../type";
import {getMyMessage, addUserMessageRelatio, getPageOrigin} from "../../service/api";
import DetailMessage from "../Notice/detailMessage.vue";
import Utils from "@/utils";
import * as Api from "../../service/api";
import moment from 'moment';

Vue.use(Toast,);
@Component({
  name: "Business",
  components: {
    Button,
    Modal,
    Tree,
    Icon,
    Row,
    Col,
    H3Scroll: mobile.H3Scroll,
    Bim,
    Badge,
    Panorama,
    NoticeBar,
    Swipe,
    SwipeItem,
    DetailMessage,
    Collapse,
    CollapseItem
  },
})
export default class Business extends Mixins(OpenFormMixin) {
  BizModelImg: string = BizModelImg;
  FolderImg: string = FolderImg;
  PageImg: string = PageImg;
  ReportImg: string = ReportImg;
  inblock: string = "inblock";

  isModalShow: boolean = false;
  treeData: Array<any> = [];
  defaultSelectedKeys: Array<string> = [];
  quickFolderData: Array<any> = [];
  commonApplications: Array<any> = [];
  pageSize: number = 24;
  imgBC: Array<String> = ["#4798FF", "#F99341", "#19BE6C", "#FFA800"];
  unfinishList: Array<any> = [];
  unfinishListLength: number = 0;
  bimImgUrl: string = "";
  IMG_IP: string = env.apiHost + "/"
  iframeBimShow: boolean = false
  selectedId: object = {}
  isMultiProject: boolean = true;
  //我的消息
  myMessageList: MyMessage[] = [];
  unReadMessageCount: number = 0;
  showMessage: boolean = false;
  selectedMessage: MyMessage | null = null;
  activeNames:string[] = [];

  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;

  init(page: number, done: Function) {
    Toast.loading({
      duration: 0,
      message: "正在加载",
    });
    this.getTreeData();
    this.getQuickNonFolder(done);
    this.getCommonApplications(done);
    this.currentApp = {
      code: env.project,
    };
  }

  mounted() {
    this.getHomeImg();
    this.getMyMessage();
    this.getUnReadMessageCount();
  }

  getUnReadMessageCount() {
    Api.getUnReadMessageCount({
      projectCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then(res => {
      if (res.errcode === 0) this.unReadMessageCount = res.data;
    })
  }

  getMyMessage() {
    getMyMessage({
      projectCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? '',
      page: 1,
      size: 9
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      this.myMessageList = res?.data?.records ?? [];
    })
  }

  get fakeMyMessageList() {
    let list:MyMessage[] = this.myMessageList
    list.map((i) => {
      i.uploadTime = moment(i.createdTime).format('YYYY-MM-DD')
    })
    //@ts-ignore
    list = Utils.fakePagination(list, 3)
    return !list ? [] : list
  }

  openDetailMessage(item:MyMessage) {
    this.showMessage = true;
    this.selectedMessage = item;
    if(item.isRead) return
    item.isRead = true;
    addUserMessageRelatio({
      projectCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      isRead: false,
      messageId: item.id,
      messageType: item.noticeSort,
      userId: ''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
    })
  }

  closeMessageOverlay(obj:{url:string|null,isModal:boolean}) {
    this.showMessage = false;
    if(obj.url&&!obj.isModal) {
      this.go2page(obj.url)
    }
  }

  go2page(url:string) {
    const urlDetail:UrlDetail =  Utils.parseQueryString(`?${url}`);
    urlDetail.isWorkFlow = urlDetail.isWorkFlow === 'true';
    this.$router.push({
      // 业务表单
      name: "form-detail",
      //@ts-ignore
      query: urlDetail
    })
  }

  bimShowClick() {
    // this.iframeBimShow =!this.iframeBimShow
    this.$router.push({
      name: "bim",
    })
  }

  async getHomeImg() {
    const unfinsh = {
      batchOperate: false,
      page: 0,
      size: 99999,
      // appCode: env.project,
    };
    const unfinishres = await homeApi.searchWorkitems(unfinsh as any);
    this.unfinishListLength = unfinishres.data?.content?.length ?? 0;
    this.unfinishList = unfinishres.data?.content?.slice(0, 5)
    getMobileHomePagePicture(env.project, this.projectConfig?.projectName).then(res => {
      //@ts-ignore
      if (res.errcode == 50000) return
      this.bimImgUrl = res.data
    })
  }

  toDetail(workitem) {
    this.$router.push({
      name: 'form-detail',
      query: {
        workitemId: workitem.id,
        workflowInstanceId: workitem.instanceId,
        return: this.$route.fullPath,
        workitemType: 'unfinishedWorkitem'
      }
    }).catch((err: any) => {
      err
    });
  }

  tobim() {
    this.$router.push({name: 'bim'});
  }

  modalCancel() {
    this.isModalShow = false;
  }

  onSelect(selectedKeys, selectedNodes) {
    const temptKey = selectedNodes.node.dataRef;
    if (temptKey.value.split("-")[1] !== "项目") return Toast(`不能选择${temptKey.value.split("-")[1]}级`);
    this.selectedId = selectedNodes
    if (JSON.stringify(temptKey) !== "{}") {
      this.defaultSelectedKeys[0] = temptKey.id;
      this.projectConfig?.updateProjectConfig(
        temptKey.title,
        temptKey.value.split( "-" )[1] == "集团" ? 0 : temptKey.value.split( "-" )[1] == "公司" ? 1 : 2,
        null
      );
      sessionStorage.setItem("projectname", temptKey.title);
    }
    this.getHomeImg();
    this.getMyMessage();
    this.getUnReadMessageCount();
    this.isModalShow = false;
  }

  //项目树
  async getTreeData() {
    this.treeData.length = 0;
    this.defaultSelectedKeys.length = 0;
    //@ts-ignore
    const {data, errcode, errmsg} = await getTreeData({
      appCode: env.project,
    });
    if (errcode === 0) {
      this.treeData = data;
      if (this.treeData[0].children.length > 0) {
        this.isMultiProject = true
      } else {
        this.isMultiProject = false
      }

      if (this.treeData.length > 0) {
        //默认
        if (!this.isMultiProject) {
          this.defaultSelectedKeys.push(this.treeData[0].id);
          const temptKey = this.treeData;
          const arr = []
          this.findop(temptKey, arr)
        } else {
          if (this.projectConfig?.projectName) return
          const arr = []
          this.findop(this.treeData, arr)
          const item = this.treeArrFilter(
            this.treeData,
            "children",
            "title",
            this.projectConfig?.projectName
          );
          //@ts-ignore
          this.defaultSelectedKeys.push(item[0].children[0].id);
        }
      }
    } else {
      Notify({type: "warning", message: `${errmsg}`});
    }
    this.getHomeImg()
  }

  /**
   * 树形数组筛选:数组对象根据对象中指定的属性
   * @param arr 元素为对象的数组
   * @param attChildren 父子级关联键名
   * @param key 指定属性
   * @param value 指定值
   * @returns {[]}
   */
  treeArrFilter(arr: any[] = [], attChildren = "children", key, value) {
    let finalArr = [];
    arr.map((item) => {
      if (item[key] === value) {
        //@ts-ignore
        finalArr.push(item);
      }
      if (item[attChildren]) {
        const p = this.treeArrFilter( item[attChildren], attChildren, key, value );
        finalArr = finalArr.concat(p);
      }
    });
    return finalArr;
  }

  //获取快捷入口数据
  async getQuickNonFolder(done?: Function) {
    //@ts-ignore
    const {data, errcode, errmsg} = await getQuickNonFolder({
      projectCode: env.project,
      isMobile: true,
    });
    if (errcode === 0) {
      if (data && Array.isArray(data) && data.length) {
        this.quickFolderData = data;
        this.$nextTick(() => {
          if (done && typeof done === "function") done(10, 10);
        });
      }
    } else {
      Notify({type: "warning", message: `${errmsg}`});
    }
  }

  //获取常见应用
  async getCommonApplications(done?: Function) {
    this.commonApplications = [];
    this.activeNames = [];
    //@ts-ignore
    const {data, errcode, errmsg} = await getCommonApps({
      projectCode: env.project,
      isMobile: true,
    }).finally(() => {
      this.$nextTick(() => {
        if (done && typeof done === "function") done(10, 10);
        Toast.clear();
      });
    });
    if (errcode === 0) {
      this.commonApplications = data;
      this.commonApplications.map((item) => {
        this.activeNames.push(item.name);
      })
      // if (data && Array.isArray(data) && data.length) {
      //   this.commonApplications = this.fakePagination(data);
      // }
    } else {
      this.$message.error(errmsg);
    }
  }

  //分组处理
  fakePagination(data: any[] = []) {
    let minArr = []; //小数组
    let maxArr = [];
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
  }

  goNext(item:AppItem) {
    //isFolder
    if (item.type === "Folder") {
      this.$router.push({
        name: "details",
        params: {
          id: item.id,
        },
      });
    } else {
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
        this.goFormList(item);
      }
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
  created() {
    // this.init();
  }

  findop(data, arr) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.children.length == 0) {
        arr.push({title: item.title, value: item.value});
        this.projectConfig?.updateProjectConfig(arr[0]?.title, arr[0]?.value.split("-")[1] == "集团" ? 0 : arr[0]?.value.split("-")[1] == "公司" ? 1 : 2, null);
        return
      } else {
        this.findop(item.children, arr);
      }
    }
    return arr;
  }
}
</script>

<style scoped lang="less">
@import "~@/styles/mixins.less";
@import "~@/styles/common.less";

.business {
  display: flex;
  height: inherit;
  flex-direction: column;
  overflow: hidden;

  .business_title {
    height: 45px;
    line-height: 45px;
    background: #2758fd;
    font-family: PingFang SC;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
  }

  .project {
    background-color: #3D7BFF;
    font-weight: bold;
    .px2rem(font-size, 32);
    .px2rem(padding-top, 20);
    .px2rem(padding-bottom, 20);

    i {
      color: #fff;

      &:active {
        color: #fff;
      }

      // &:active {
      //   color: #0e7fe1;
      // }
    }

    box-shadow: 0 10px 8px #ececec;

    span {
      color: #fff;
    }
  }

  .mescroll {
    position: static;
  }

  .box {
    background: #ffff;
    border-radius: 10px;
    .px2rem(padding, 20);
    .px2rem(margin-top, 15);
    .px2rem(margin-bottom, 15);
    .px2rem(margin-left, 20);
    .px2rem(margin-right, 20);
  }

  .all {
    display: flex;
    justify-content: space-between;
    // .px2rem(margin-bottom, @spacing-large);
    margin-bottom: 10px;

    div:first-child {
      .px2rem(font-size, 32);
      font-weight: bold;
      color: #0b1017;
      font-family: PingFang SC;
    }

    div:last-child {
      color: #8d8c8c;
      .px2rem(font-size, 26);
    }
  }

  .blank {
    color: #8d8c8c;

    p {
      .px2rem(margin-top, 20);
      .px2rem(margin-bottom, 20);
    }

    img {
      width: 50%;
    }
  }

  .quick {
    .box;

    .all {
      .all;
    }

    .flex-root {
      display: flow-root;
    }

    .quick-content {
      display: flex;
      background: #f5f6fa;
      border-radius: 14px;
      color: #000000;
      text-align: left;
      .px2rem(height, 85);
      .px2rem(padding, 20);
      .px2rem(margin-bottom, 20);

      img {
        .px2rem(margin-right, 20);
        .px2rem(width, 40);
        .px2rem(height, 40);
      }

      span {
        display: inline-block;
        line-height: 1.3;
      }
    }

    .home_tag {
      .px2rem(font-size,30);
      .px2rem(margin-top,30);
      .unfinshBox {
        color: #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .px2rem(margin-bottom, 30);
        &:last-child {
          .px2rem(margin-bottom,0);
        }
        >div:first-child {
          width: 74%;
          .text-overflow-ellipsis;
          img {
            .px2rem(width, 40);
            .px2rem(height, 40);
            .px2rem(margin-right,5);
          }
        }
      }

      .unfinshTime {
        color: #999999;
      }

      //span {
      //  font-size: 14px;
      //  font-family: Source Han Sans CN;
      //  color: #333;
      //}
      //
      // a {
      //   width: 25%;
      //   img {
      //     width: 41px;
      //     height: 41px;
      //     margin-bottom: 10px;
      //   }
      //   p {
      //     color: #666;
      //   }
      // }
    }

    .all {
      font-size: 0.42666667rem;
      font-weight: bold;
      color: #0b1017;
      padding-left: 6px
    }
  }

  .application {
    .box;

    .all {
      .all;
    }

    /deep/ .van-collapse {
      .van-cell__title {
        .px2rem(font-size,30);
        font-family: Source Han Sans CN;
        font-weight: 700;
        color: #333333;
      }
      .van-collapse-item__title--expanded::after {
        border: none;
      }
      .van-collapse-item--border::after {
        border: none;
      }
      .van-collapse-item__content {
        .px2rem(padding,10)
      }
    }
    /deep/ .van-hairline--top-bottom::after, .van-hairline-unset--top-bottom::after {
      border: none;
    }

    .select {
      text-align: left;

      .select-row {
        // text-align: center;
        color: #666666;
        //.px2rem(margin-bottom, @spacing-large);

        .inner {
          display: inline-block;
          border-radius: 10px;
          position: relative;
          .px2rem(margin-bottom, @spacing-base);

          > img {
            display: inline-block;
            .px2rem(width, 50);
            .px2rem(height, 50);
            .px2rem(margin, @spacing-base);
          }

          > .app {
            position: absolute;
            .px2rem(font-size, @font-size-large);
            .px2rem(right, -30px);
            .px2rem(top, -30px);
            .px2rem(width, 40);
            .px2rem(height, 40);
          }
        }

        .text {
          line-height: 1.3;
        }

        .applicationMenu {
          display: none;
          margin-bottom: 10px;
          font-size: 14px;
          font-family: Source Han Sans CN;
          font-weight: 700;
          color: #333333;
          padding-left: 6px;
        }
      }
    }

    .childMenus {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      div {
        text-align: center;
        width: 100%;

        img {
          margin-bottom: 8px;
        }

        p {
          font-size: 12px;
          font-family: Source Han Sans CN;
          font-weight: 400;
          color: #333333;
        }

        img {
          width: 41px;
          height: 41px;
        }
      }
    }

    .childMenu {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      div {
        text-align: center;
        width: 25%;

        img {
          margin-bottom: 8px;
        }

        p {
          font-size: 12px;
          font-family: Source Han Sans CN;
          font-weight: 400;
          color: #333333;
        }

        img {
          width: 41px;
          height: 41px;
        }
      }
    }

    .bimModel {
      margin-bottom: 10px;
      text-align: left;
      font-size: 14px;
      font-family: Source Han Sans CN;
      font-weight: 700;
      color: #333333;

      div:nth-child(1) {
        margin-bottom: 10px;
        padding-left: 6px;
      }

      p {
        font-size: 12px;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: #333333;
      }

      img {
        width: 41px;
        margin-bottom: 8px;
        height: 41px;
      }
    }
  }

  .bimImg {
    position: relative;
    margin-bottom: 10px;
    background: #fff;
    margin: 10px;
    padding: 10px;
    border-radius: 4px;

    h3 {
      margin-bottom: 10px;
      font-size: 16px;
      font-family: Source Han Sans CN;
      font-weight: 700;
      color: #333333;
      padding-left: 5px;
      text-align: left;
    }

    img {
      width: 100%;
      height: 100%;
    }

    div {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      img {
        width: 50%;
        height: 50%;
      }
    }
  }
}

.inblock {
  display: inline-block;
  width: 25%;
}

/deep/ .ant-modal {
  margin: 16px auto;

  .ant-modal-content {
    margin: 0 auto;
    width: 80%;
    border-radius: 15px 15px 15px 15px;

    .ant-modal-body {
      overflow: auto;
      border-radius: 15px 15px 15px 15px;
      height: 280px;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  .ant-modal-close-x {
    display: none;
  }

  .anticon svg {
    display: inline-block;
    .px2rem(font-size, 32);
    color: #cccccc;
  }

  .ant-tree {
    .px2rem(font-size, 32);
    font-family: PingFang SC;
    color: #333333;
    font-weight: bold;

    .ant-tree-node-selected {
      background-color: rgba(14, 121, 237, 0.2);
    }
  }
}

.bim {
  height: 700px;

  .iframeBim {
    width: 100%;
    height: 100%;
  }
}
.text-overflow-ellipsis {
  display: flex;
  align-items: center;
  word-break: break-all;

  div {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    .px2rem(font-size,30);
    line-height: 1.2;
    .px2rem(letter-spacing,1);
  }
}
.notice-swipe {
  height: 100px;
  text-align: left;

  .mes {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .px2rem(margin-bottom, 20);
    &:last-child {
      .px2rem(margin-bottom,0);
    }

    img {
      .px2rem(width, 40);
      .px2rem(height, 40);
      .px2rem(margin-right,5);
    }

    div:first-child {
      width: 74%;
      .px2rem(font-size,30);
      .text-overflow-ellipsis;
    }

    .upload-time {
      color: #999999;
      .px2rem(font-size,30);
    }
  }
}

.van-notice-bar {
  height: 100px;
  background-color: #ffff;
  color: #333;
  .px2rem(margin-top, 30);
  .px2rem(padding-right,0);
  .px2rem(padding-left,15);

  /deep/ .van-notice-bar__content {
    width: 100%;
  }
}
</style>

<style lang="less">
.business {
  .mescroll-upwarp {
    display: none !important;
  }
}
</style>
