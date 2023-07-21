<template>
  <div class="header">
    <div>
      <div class="header-left">
        <a
          v-if="isDingTalk"
          class="aback"
          @click="back">返回</a>
        <img
          class="logo"
          :src="logo"
          @click="goHome"/>

        <a
          v-if="isDingTalk"
          class="open-blank"
          @click="openBlank">在浏览器中打开</a>
        <div class="header-dropdown" v-if="nodes.length > 0">
          <a-dropdown :trigger="['click']">
            <div><span>{{ activeNodes }}</span>
              <a-icon type="down"/>
            </div>
            <!-- <a class="ant-dropdown-link" href="#">  <a-icon type="down" /> </a> -->
            <a-menu slot="overlay">
              <a-menu-item
                v-for="(node, index) in nodes"
                :key="node.activityCode"
                :class="{'a-menu-item-active': node.selected}"
                class="node-switch-menu-item"
              >
                <a href="javascript:" @click="nodesSwitch(index)">{{ node.activityName }}</a>
              </a-menu-item>
              <!-- <a-menu-item>
                <a href="javascript:;">2nd menu item</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;">3rd menu item</a>
              </a-menu-item> -->
            </a-menu>
          </a-dropdown>
        </div>
      </div>


      <div
        @mouseover="showBigQrcode = true"
        @mouseout="showBigQrcode = false"
        @click.stop="showBigQrcode = true"
        v-if="!isEL&&showQrcode"
        class="qrcode"
      >
        <!--<img  @click.stop="showBigQrcode = !showBigQrcode" src="~@/assets/images/qrcode-icon.png"/>-->
        <img src="~@/assets/images/qrcode-icon.png"/>
        <div class="qrcode-enlarge" v-show="showBigQrcode">
          <img :src="url"/>
          <p v-if="isAdd">钉钉扫码查看数据</p>
          <p v-else>钉钉扫码填写数据</p>
        </div>
      </div>
    </div>

    <a-button
      @click="go2StandardTemplatePrint"
      class="standardPrintBtn"
      v-show="standardPrintReady">标准模板打印
    </a-button>
    <a-button @click="openBlankArticle" v-show="withRichText">文章正文</a-button>
    <a-modal
      :visible="printModalVisible"
      :title="standardFileName"
      :destroyOnClose="true"
      wrapClassName="printDoc"
      okText="打印预览"
      @ok="printView"
      @cancel="cancelPrintView"
    >
      <iframe
        ref="docView"
        class="printIframe"
        :src="standardDocSvg"
      />
      <!--      srcdoc="standardDocSvg"-->
    </a-modal>
    <a-modal
      :visible="showRichText"
      :destroyOnClose="true"
      wrapClassName="richTextWrapper"
      okText="提交文本"
      @ok="submitRichText"
      @cancel="cancelRichText"
    >
      <div class="richTextContainer">
        <RichText
          ref="richTextEditor"
          v-show="loadRichTextEditor"
          :objectId="articleTabId"
          :contentValue="articleData"/>
      </div>
    </a-modal>
    <slot></slot>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { Button, Dropdown, Icon, Menu, Modal } from "@h3/antd-vue";

import { Getter } from 'vuex-class';
import site from '@/config/site';
import dd from 'dingtalk-jsapi';
import env from '@/config/env';

import { externalLinkApi } from '@cloudpivot/api';

import OAuthApi from '@/apis/oauth';
import Utils from "../../../extends/utils";
import { getArticleDetail, getPrintView, setArticleDetail } from "../../../extends/service/api";
import { RichText } from '../../../extends/basicCustomComponent';

@Component( {
  name: 'form-detail-header',
  components: {
    AButton: Button,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AIcon: Icon,
    //new add
    AModal: Modal,
    RichText,
  }
} )
export default class FormDetailHeader extends Vue {
  @Getter( "getAntLocale" ) locale!: string;

  @Prop() formObj!: any;

  @Prop() nodes!: any;

  //new add
  @Prop() standardPrintReady!: boolean;

  @Prop()
  public standardUUID?: string;

  @Prop() withRichText!: boolean;

  @Prop() tabId?: string;

  get RichTextData() {
    const { withRichText, tabId } = this;
    return { enable: withRichText, tabId };
  }

  //end


  showBigQrcode = false;

  url = "";

  //new add
  private printModalVisible: boolean = false;
  private standardFileName: string | null = null;
  private standardDocSvg: string | null = null;

  private showRichText: boolean = false;
  private loadRichTextEditor: boolean = false;
  private articleTabId: string | null = null;
  private articleId: string | undefined = undefined;
  private articleData: string | null = null;

  //end

  @Watch( 'standardPrintReady' )
  standardPrintReadyListener( value ) {
    console.log( 'standardPrintReady', value );
  }

  @Watch( 'RichTextData', { immediate: true } )
  routerListener( withRichText: { enable: boolean, tabId: string | null } ) {
    if ( !withRichText || !withRichText.enable ) return;
    //TODO:setID;
    const { objectId } = Utils.GetRequest();
    this.articleTabId = objectId;
    getArticleDetail( {
      tabDataId: objectId as string,
      tabId: withRichText.tabId as string,
      appCode: env.project as string
    } ).then( res => {
      if ( res.errcode === 0 ) {
        this.articleData = res.data?.data?.content as string;
        this.articleId = res.data?.data?.id ?? undefined;
      }
    } );
  }

  @Watch( 'showRichText', { immediate: true } )
  showRichTextListener( flag: boolean ) {
    if ( flag ) {
      setTimeout( () => {
        this.loadRichTextEditor = true;
      }, 500 )
    }
  }

  @Watch( 'standardDocSvg' )
  standardDocSvgListener( value ) {

  }

  @Watch( 'printModalVisible' )
  printModalVisibleListener( value ) {

  }

  go2StandardTemplatePrint() {
    console.log( 'this.formObj===>', this.formObj );
    //const { objectId } = Utils.GetRequest();
    //重新查询模板
    //this.$message.loading('');
    const schemaCode = this.formObj?.bizObject?.schemaCode ?? null;
    const objectId = this.formObj?.bizObject?.id ?? null;
    console.log( 'inGo2Print===>', schemaCode, objectId );
    if ( !schemaCode || !objectId ) return this.$message.error( `缺少${ !schemaCode ? 'schemaCode' : '' } ${ !objectId ? 'objectId' : '' }!` );
    getPrintView( { schemaCode: schemaCode, id: objectId } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      //if (!res.data?.fileName) return this.$message.error('未找到模板文件，请重新上传', 0.8);
      if ( res.data ) {
        //this.standardFileName = res.data.fileName as string;
        this.printModalVisible = true;
        //new add
        this.$nextTick().then( () => {
          this.docFrameLoad();
          try {
            //this.standardDocSvg = res.data as string;
            this.standardDocSvg = `${env.host}/RDP-SERVER/rdppage/main/${ this.standardUUID }?id=${ objectId }`;
            const iframeEntity = this.$refs.docView as HTMLIFrameElement;
          } catch ( e ) {
            this.standardDocSvg = `${ e }`;
          }
        } );
      }
    } );
  }

  printView() {
    const docIframeWindow = document.querySelector( 'iframe[class=printIframe]' ) as HTMLIFrameElement;
    //TODO:need dompurify antiXSS
    docIframeWindow?.contentWindow?.print()
  }

  cancelPrintView() {
    this.printModalVisible = false;
  }

  docFrameLoad() {
    const { $refs, $message } = this;
    if ( $refs ) {
      const iframe = this.$refs.docView as HTMLIFrameElement;
      ($refs.docView as HTMLElement).onload = function () {
        const iframeBody = iframe?.contentDocument?.body;
        const graphics = iframeBody?.querySelectorAll( 'g' );
        const style = document.createElement( 'style' );
        style.innerHTML = "table{margin-left:auto;margin-right:auto}";
        iframe?.contentDocument?.head.appendChild( style );
        graphics?.forEach( g => {
          if ( (g.children[0] as HTMLElement).style.fill === 'rgb(255, 0, 0)' ) g.children[0].innerHTML = '';
        } );
        $message.success( '获取标准模板成功', 0.5 );
      }
    }
  }

  openBlankArticle() {
    this.showRichText = true;
  }

  submitRichText() {
    //@ts-ignore
    const textString = this.$refs?.['richTextEditor']?.content ?? '';
    const { articleTabId, articleId } = this;
    setArticleDetail( {
      id: articleId as string,
      tabDataId: articleTabId as string,
      content: textString as string
    } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      this.$message.success( res.errmsg as string );
    } )
  }

  cancelRichText() {
    this.showRichText = false;
    this.loadRichTextEditor = false;
  }


  //end


  get logo() {
    return site.logo;
  }

  get activeNodes() {
    const theNode = this.nodes.find( ( res ) => res.selected );
    if ( theNode ) {
      return theNode.activityName;
    }
    return '';
  }

  get showQrcode() {
    let user: any = sessionStorage.getItem( 'user' );
    if ( !user ) {
      return;
    }
    user = JSON.parse( user );

    const syncTypeIsCloudPivot = user.relatedType === 'DINGTALK';
    // console.log(this.$store.state.config.isCloudPivot,'this.$store.state.config.cloudPivot');
    if ( !syncTypeIsCloudPivot ) {
      return false;
    }
    // debugger;
    if ( !this.formObj.bizSheet ) {
      return false;
    }
    // 表单二维码码默认开启
    if (
      this.formObj.bizSheet.qrCodeAble === 'open' ||
      !this.formObj.bizSheet.qrCodeAble
    ) {
      return true;
    }
    return false;
  }

  isAdd = false;

  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();
    if ( res.errcode === 0 ) {
      const info: any = res.data;
      sessionStorage.setItem( 'user', JSON.stringify( info ) );
      this.onFormObjChange( this.formObj );
    }
  }

  // 跳转到首页
  goHome() {
    const appCode = window.Environment ? window.Environment.appCode : null;
    if ( appCode ) {
      this.$router.push( {
        name: 'singleApp',
        params: {
          appCode,
        },
      } )
        .catch( ( err: any ) => {
          err;
        } );
    } else {
      this.$router.push( { name: 'myUnfinishedWorkItem' } ).catch( ( err: any ) => {
        err;
      } );
    }
  }

  back() {
    const url = this.$route.query.return as string;
    if ( url ) {
      this.$router.push( {
        path: url
      } ).catch( ( err: any ) => {
        err
      } );
    } else {
      this.isHistory() ? this.$router.go( -1 ) : dd.biz.navigation.close( {} );
    }
    // const back = sessionStorage.getItem('backList');
    // if (back) {
    //   const url : any = sessionStorage.getItem('backListUrl');
    //   sessionStorage.removeItem('backList');
    //   this.$router.push(url);
    //   this.$router.go(-1);
    // } else {
    //   const url : any = sessionStorage.getItem('backListUrl');
    //   this.$router.go(-1);
    // }
  }

  // get url() {
  //   // const config:any = this.$store.state.config;
  //   // const corpId = config.corpId;
  //   // const agentId = config.agentId;

  //   // const locHref = window.location.pathname + window.location.search;

  //   // const signinUrl = '47.107.160.206' + "/mobile/?meetingId="+"&corpId=ding6a0a954b9b413bcf35c2f4657eb6378f&agentId=235111190&mode=create&schemaCode=meeting_signin&sheetCode=signin&num=" + new Date().getTime();
  //   // debugger

  //   return src;
  // }

  get isEL() {
    return (window as any).externalLinkToken;
  }

  /**
   * 判断是否有history记录
   * @return boolean
   */
  isHistory(): boolean {
    if (
      navigator.userAgent.indexOf( 'MSIE' ) >= 0 &&
      navigator.userAgent.indexOf( 'Opera' ) < 0
    ) {
      // IE
      if ( history.length > 0 ) {
        return true;
      } else {
        return false;
      }
    } else {
      //非IE浏览器
      if (
        navigator.userAgent.indexOf( 'Firefox' ) >= 0 ||
        navigator.userAgent.indexOf( 'Opera' ) >= 0 ||
        navigator.userAgent.indexOf( 'Safari' ) >= 0 ||
        navigator.userAgent.indexOf( 'Chrome' ) >= 0 ||
        navigator.userAgent.indexOf( 'WebKit' ) >= 0
      ) {
        if ( window.history.length > 1 ) {
          return true;
        } else {
          return false;
        }
      } else {
        //未知的浏览器
        return true;
      }
    }
  }

  openBlank() {
    let href: any = location.href
    const iframeAction: any = href.match( /%26iframeAction%3Ddetail/g )
    if ( iframeAction.length > 1 ) {
      for ( let i = 0; i < iframeAction.length - 1; i++ ) {
        href = href.replace( '%26iframeAction%3Ddetail', '' )
      }
    }

    const url = `${ href }${
      href.indexOf( "?" ) > -1 ? "&" : "?"
    }access_token=${ localStorage.getItem( "token" ) }`;

    window.open( url, "_blank" );
  }

  nodesSwitch( index: number ) {
    if ( this.nodes[index].selected ) return;
    let theNode = '';
    this.nodes.forEach( ( res, idx ) => {
      if ( idx === index ) {
        res.selected = true;
        theNode = res.activityCode;
      } else {
        res.selected = false;
      }
    } );
    this.nodes = this.nodes.slice();

    this.$emit( 'nodesSwitch', theNode );
  }

  created() {
    const user = sessionStorage.getItem( 'user' );
    if ( !user ) {
      this.getUserInfo();
    }
  }

  mounted() {
    document.addEventListener( 'click', this.outFocus );
  }

  destoryed() {
    document.removeEventListener( 'click', this.outFocus );
  }

  outFocus() {
    this.showBigQrcode = false;
  }

  @Watch( 'formObj', {
    immediate: true,
  } )
  onFormObjChange( formObj: any ) {
    if ( !formObj.bizSheet ) return;

    const { workflowInstanceId, workItemId, workflowCode } = formObj;

    const { id, schemaCode, sheetCode, loadedFromDb } = formObj.bizObject;

    if ( !this.$store ) {
      return;
    }
    let user: any = sessionStorage.getItem( 'user' );
    if ( !user ) {
      return;
    }
    user = JSON.parse( user );
    const config = {
      corpId: user.corpId,
      agentId: user.agentId,
      mobileServerUrl: user.mobileServerUrl,
    };
    // const { config } = this.$store.state;

    // if (!config) {

    // }

    const { corpId } = config;

    const { agentId } = config;

    this.isAdd = loadedFromDb;

    let signinUrl = '';
    // 数据来自数据库 生成查看表单
    if ( loadedFromDb ) {
      // 流程表单
      if ( workflowInstanceId && workItemId ) {
        // 新增
        signinUrl = `${ config.mobileServerUrl }/?workflowInstanceId=${ workflowInstanceId }&workItemId=${ workItemId }&corpId=${ corpId }&agentId=${ agentId }&mode=form`;
        if ( this.nodes.length > 0 ) {
          signinUrl += '&isWorkFlow=true';
        }
      } else {
        // 业务表单
        signinUrl = `${ config.mobileServerUrl }/?corpId=${ corpId }&agentId=${ agentId }&schemaCode=${ schemaCode }&sheetCode=${ sheetCode }&id=${ id }&mode=form`;
      }

      // signinUrl =`${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&id=${id}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&corpId=${corpId}&agentId=${agentId}`;
    } else {
      // 查看
      // 数据无数据，生成新表单或者发起流程

      if ( workflowCode ) {
        // 发起流程
        signinUrl = `${ config.mobileServerUrl }/?workflowCode=${ workflowCode }&corpId=${ corpId }&agentId=${ agentId }&mode=form`;
      } else {
        // 新增业务表单
        signinUrl = `${ config.mobileServerUrl }/?corpId=${ corpId }&agentId=${ agentId }&schemaCode=${ schemaCode }&sheetCode=${ sheetCode }&mode=form`;
      }
      // signinUrl =`${config.mobileServerUrl}/?workflowInstanceId=${workflowInstanceId}&workItemId=${workItemId}&schemaCode=${schemaCode}&sheetCode=${sheetCode}&corpId=${corpId}&agentId=${agentId}`;
    }

    console.log( signinUrl );

    const that = this;
    // const text: string = decodeURI(encodeURIComponent(signinUrl));
    // this.url= `${env.apiHost}/api/qrcode/generate_qrcode?text=${text}`;

    // 将图片二进制流转成base64，兼容IE11
    externalLinkApi.generateQrcode( signinUrl ).then( ( res: any ) => {
      let bytes = new Uint8Array( res );
      let data = '';
      let len = bytes.byteLength;
      for ( let i = 0; i < len; i++ ) {
        data += String.fromCharCode( bytes[i] );
      }
      that.url = 'data:image/png;base64,' + window.btoa( data );
    } );

    // debugger
  }
}
</script>


<style lang="less" scoped>
@import '~@/styles/themes/default.less';

.header {
  padding: 0 @base4-padding-lg !important;
  display: flex;
  &-left {
    display: flex;
    align-items: center;
  }

  &-dropdown {
    display: flex;
    align-items: center;
    margin-left: 16px;
    padding-left: 16px;
    height: 32px;
    border-left: 1px solid rgba(217, 217, 217, 1);

    .ant-dropdown-trigger {
      & > span {
        display: inline-block;
        max-width: 140px;
        // width: 140px;
      }
    }

  }

  .qrcode {
    border: 1px solid rgba(221, 221, 221, 1);
    // margin-left: 33px;
    margin-right: 16px;
    position: relative;

    & > img {
      width: 26px;
      cursor: url('~@/assets/images/enlarge-o.png'), pointer;
      margin: 2px;
      // border:1px solid rgba(221,221,221,1);
    }

    .qrcode-enlarge {
      position: absolute;
      top: 28px;
      border: 1px solid rgba(221, 221, 221, 1);
      background: #fff;

      img {
        width: 250px;
        height: 250px;
        // max-height: 250px !important;
      }

      p {
        text-align: center;
        padding-bottom: 16px;
      }

      // left: 0;
      right: -1px;
    }
  }

  img.logo {
    cursor: pointer;
    max-height: 30px !important;
  }

  & > div:first-child {
    border-right: 1px solid rgba(217, 217, 217, 1);
    flex-grow: 1;
    display: flex;
    justify-content: space-between;

    a.aback {
      font-size: 18px;
      margin-right: 8px;

      &::after {
        content: '';
        height: 18px;
        width: 1px;
        background-color: #d8d8d8;
        display: inline-block;
        position: relative;
        top: 3px;
        margin-left: 8px;
      }
    }
  }
}
</style>

<style lang="less">
.node-switch-menu-item {
  width: 180px;

  &.a-menu-item-active {
    background: rgba(240, 247, 255, 1);
    font-weight: 600;
  }
}

.btnActive() {
  background-color: #6cefb1;
  border-color: #6cefb1;
  outline: #6cefb1;
  color: white;
}

.standardPrintBtn {
  background-color: #50dd97;
  margin-left: 20px;
  color: white;
  border-color: #50dd97;
  outline: #50dd97;

  &:hover {
    .btnActive;
  }

  &:active {
    .btnActive;
  }

  &:focus {
    .btnActive;
  }
}

.printIframe {
  border: 0;
  width: 230mm;
  //height: 297mm;
  //height: 78vh;
  height: 100%;
  @media print {
    html, body {
      width: 210mm;
      height: 297mm;
    }
  }

  & > html, body {
    width: 210mm;
    height: 297mm;
    margin: 0;
  }
}

.printDoc {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;

  & > div[role=document] {
    position: static;
    display: flex;
    padding-bottom: 0 !important;
    width: 242mm !important;
    top: 30px !important;

    & div[class=ant-modal-body] {
      height: 70vh;
    }
  }
}

div[class~=ck-content] {
  min-height: 810px;
}

.richTextContainer {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.richTextWrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;

  & div[class=ant-modal-content] {
    min-width: 1200px;
  }

  & > div[role=document] {
    position: static;
    display: flex;
    padding-bottom: 0 !important;
    min-width: 1200px;
    top: 30px !important;
  }

  & div[class=ant-modal-body] {
    width: 100%;
    height: 70vh;
    padding: 40px;
  }
}
</style>
