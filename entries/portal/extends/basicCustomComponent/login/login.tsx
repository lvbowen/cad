import { Component, InjectReactive, ProvideReactive, Vue,Prop } from "vue-property-decorator";

import QrcodeLogin from '../../../src/views/login/qrcode-login.vue';
import AccountLogin from '../../../src/views/login/account-login.vue';
import WechatLogin from '../../../src/views/login/wechat-login.vue';
import JjtLogin from '../../../src/views/login/jjt-login.vue';
import OAuthApi from '../../../src/apis/oauth';
import { utils } from '@cloudpivot/common';
import { Modal } from "@h3/antd-vue";

import { ApiResponse, ThemeConfig } from "../../type";
import Class from './login.module.less';
import { getProjectConfig, getQrCode } from "../../service/api";
import env from "@/config/env";
import { HttpResponse } from "@ctesi/core/type";

// eslint-disable-next-line no-shadow
enum LoginType {
  OnlyAccount = 0, // 只允许账户密码
  OnlyQrCode = 1,  // 只允许扫码
  BothAccountAndQrCode = 2 // 二者均可
}

/**
 * 组织类型
 * */

// eslint-disable-next-line no-shadow
enum OrgType {
  MAIN = "MAIN",
  RELEVANCE = "RELEVANCE"
}

/**
 * 维护方式
 * */

// eslint-disable-next-line no-shadow
enum SyncType {
  PUSH = "PUSH",
  PULL = "PULL"
}

/**
 * 登录模式
 * */

// eslint-disable-next-line no-shadow
enum LoginMode {
  Account = "account",
  Dingtalk = "dingding",
  Wechat = 'wechat'
}

/**
 * 关联方式
 * 关联钉钉 或者微信
 * */

// eslint-disable-next-line no-shadow
enum RelatedType {
  Dingtalk = "DINGTALK",
  Wechat = 'WECHAT',
  OTHER = "OTHER"
}

//tab interface
interface tab {
  type: string;
  name: string;
}

//sysConfig interface
interface sysConfig {
  pcServerUrl: string;
  ssoServerUrl: string,
  adminServerUrl: string,
  mobileServerUrl: string,
  scanAppId: string,
  loginType: LoginType,
  multiLanguageSwitch: boolean,
  systemVersion: string,
  agentId: string,
  corpId: string,
  isCloudPivot: number,
  organizationRelated: true
}

//depts interface
interface depts {
  agentId: null | string;
  corpId: string;
  mobileServerUrl: string;
  name: string;
  orgType: string;
  orgTypeStr: string;
  pcServerUrl: string;
  relatedType: string;
  scanAppId: null | string;
  syncType: string;
}


@Component( {
  name: 'Login',
  components: {
    QrcodeLogin,
    AccountLogin,
    WechatLogin,
    JjtLogin
  }
} )
export default class Login extends Vue {
  appId: string = '';
  agentid: string = ''; //微信扫码登录
  toggleMode: boolean = false; // 是否展示切换模式
  defaultView: string = 'qrcode'; // 默认展示页面
  depts: Array<depts> | null = [];
  deptId: string = '';
  corpId = '';
  config: any = null;
  loginType: any = -1;
  curTab: string = '';
  tabsAll: Array<tab> = [
    { type: 'account', name: 'AD域账号登录' },
    // {type: 'dingding', name: '钉钉登录'},
    {type: 'wechat', name: '企业微信登录'}
  ];
  tabs: Array<tab> = [];
  tabBarIndex: number = 0;
  qrCodePic: unknown = '';

  loginBoxChange: boolean = true;

  private projectLogo: string | null = null;
  private projectTitle: string | null = null;
  private projectCorpId: string | null = null;

  private backgroundImg: string | null = null;

  @InjectReactive( 'project' ) private projectCode!: string;

  get tabsDisplay(): Array<tab> {
    return this.tabs.filter( ( item: tab ) => !!item ) as Array<tab>;
  }

  get isCloudPivot() { // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  async mounted() {
    //初始化loginType
    localStorage.removeItem('loginType');
    sessionStorage.removeItem('isExternal');
    // 获取环境配置
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expireTime');
    const flag = localStorage.getItem('checked') === 'true';
    if (!flag) {
      localStorage.removeItem('user_name');
      localStorage.removeItem('pwd');
      localStorage.removeItem('checked');
    }
    //get config
    const systemConfig: HttpResponse<ThemeConfig> = await getProjectConfig({path: this.projectCode});

    if (systemConfig) {
      if (systemConfig.errcode !== 0) return this.$message.error(systemConfig.errmsg as string);
      if (!systemConfig.data?.id) return;
      this.projectLogo = systemConfig.data?.logo as string;
      this.projectTitle = systemConfig.data?.title as string;
      this.projectCorpId = systemConfig.data?.corpId as string;
      window.localStorage.setItem('projectLogo', systemConfig.data?.logo);
      window.localStorage.setItem('projectTitle', systemConfig.data?.title);
      if (systemConfig.data?.background) {
        this.backgroundImg = systemConfig.data.background.split("?")[0] + "?webp=true&" + systemConfig.data.background.split("?")[1]
      }
      // this.backgroundImg = systemConfig.data?.background;
      /*(this.$refs['backgroundIcon'] as HTMLElement).style.background = `url(${systemConfig.data?.background}) no-repeat`;
      (this.$refs['backgroundIcon'] as HTMLElement).style.backgroundSize = `100% 100%`;*/
    }

    const config: sysConfig = await OAuthApi.getSystemConfig();
    if (config) {
      this.config = config;
      this.loginType = config.loginType;
    }
    const deptsRes: ApiResponse<depts> = await OAuthApi.getDepts();
    if (deptsRes.errcode !== 0) {
      this.$message.error(deptsRes.errmsg);
      return;
    }
    this.depts = deptsRes.data;
    if (this.depts?.length) {
      let deptId: string = this.depts[0].corpId;
      if (this.$route.query.corpId) {
        deptId = this.$route.query.corpId as string;
        localStorage.setItem('corpId', deptId);
      } else {
        // 如果query中没有corpid 则设置第一个企业的corpid
        //临时选择name:长江航道整治工程智慧管控系统
        // const target: depts | undefined = this.depts.find((item) => item.name === 'RELEVANCE-04ef20b24bf24b4ba2a7daa6be08f150');
        const target: depts | undefined = this.depts.find((item) => item.corpId === this.projectCorpId);
        if (target) {
          deptId = target.corpId;
          localStorage.setItem('corpId', deptId);
        } else {
          localStorage.setItem('corpId', deptId);
        }
        //end
        // localStorage.setItem('corpId', deptId);
      }
      this.deptId = deptId;
      this.onDeptChange(deptId, {});
    } else {
      this.$router.push({
        name: 'loginError'
      }).catch((err: any) => {
        err
      });
      return;
    }
    const errcode: string | null = utils.parseUrlParam(window.location.href, "errcode");
    if (errcode && errcode === "201018") {
      Modal.error({
        title: "该用户已被停用，请联系管理员！"
      });
    } else if (errcode) {
      Modal.error({
        title: "您无此访问权限，请联系管理员！"
      });
    }
  }
  onMyEvent(val:any){
    this.loginBoxChange=val;
  }
  // gologinBoxJJT(){
  //   this.loginBoxChange=true;
  // }
  onMyJjt(val){
    this.loginBoxChange=val;
  }

  onDeptChange( deptId: string, obj: { [key: string]: string } ) {
    const dept: undefined | depts = this.depts?.find( d => d.corpId === deptId );
    if ( !dept ) {
      Modal.error( {
        title: "找不到组织机构记录"
      } );
      return;
    }

    // 切换登录界面的组织时，获取到组织变化，拿到选择的组织对应的pcServerUrl地址，变更浏览器地址栏地址
    let pcServerUrl: string = '';
    // debugger;
    if ( obj.key && this.depts ) {
      for ( const item of this.depts ) {
        if ( item.corpId === deptId ) {
          pcServerUrl = item.pcServerUrl;
          break;
        }
      }

      const index: number = pcServerUrl.indexOf( '/' );
      if ( index > -1 ) pcServerUrl = pcServerUrl.substring( 0, index );
      // window.location.href = pcServerUrl + '/login?corpId=' + dept.corpId;
      window.location.href = env.portalHost + '/login?corpId=' + dept.corpId;
    }

    this.appId = dept.scanAppId as string;
    this.agentid = dept.agentId as string;
    this.corpId = dept.corpId;

    // 展示逻辑更改 20200511  by John
    const { orgType, syncType, relatedType } = dept;

    if ( orgType === OrgType.MAIN ) { // 主组织
      if ( syncType === SyncType.PUSH ) { // 自维护
        if ( this.loginType === LoginType.BothAccountAndQrCode || this.loginType === LoginType.OnlyAccount ) { // 配置文件支持账户登陆
          this.tabs = this.tabsAll.map( ( item: any ) => {
            if ( item.type === LoginMode.Account ) return item;
          } );
        } else {
          Modal.error( {
            title: "账号密码登录方式未打开，请联系系统维护人员处理！"
          } );
        }
      } else { // 第三方维护
        this.showByConfig( this.config, relatedType );
      }
    } else { // 关联组织
      this.showByConfig( this.config, relatedType );
    }
    this.curTab = this.tabsDisplay[0].type as string;
  }

  showByConfig( config: sysConfig, relatedType: string ): void {
    if ( !config ) return;
    const { loginType } = config;
    if ( loginType === LoginType.OnlyAccount ) {
      this.tabs = this.tabsAll.map( ( item: any ) => {
        if ( item.type === LoginMode.Account ) return item;
      } );
    } else if ( loginType === LoginType.OnlyQrCode ) {
      this.tabs = this.showByRelativeType( relatedType );
    } else { // 二者均可
      const temTabs: Array<unknown> = this.tabsAll.map( ( item: any ) => {
        if ( item.type === LoginMode.Account ) return item;
      } );
      this.tabs = this.showByRelativeType( relatedType );
      this.tabs = temTabs.concat( this.tabs ) as Array<tab>;
    }

  }

  showByRelativeType( relatedType: string ): Array<tab> {
    let tabs: Array<tab> = [];
    if ( relatedType === RelatedType.Wechat ) {
      tabs = this.tabsAll.map( ( item: tab ) => {
        if ( item.type === LoginMode.Wechat ) return item;
      } ) as Array<tab>;
    } else if ( relatedType === RelatedType.Dingtalk ) {
      tabs = this.tabsAll.map( ( item: tab ) => {
        if ( item.type === LoginMode.Dingtalk ) return item;
      } ) as Array<tab>;
    } else if ( relatedType === RelatedType.OTHER ) {
      tabs = this.tabsAll.map( ( item: tab ) => {
        if ( item.type === LoginMode.Dingtalk ) return item;
      } ) as Array<tab>;
    }
    return tabs;
  }

  changeTab( type: string ) {
    if ( !type ) return;
    this.curTab = type;
    //setTabBarPosition
    this.tabBarIndex = this.tabsDisplay.findIndex( ( item ) => item.type === type );
  }

  //switchLoginComponent
  switchLoginComponent( tabType: string, corpId: string, appId?: string, agentId?: string, onMyJjt?:any ): JSX.Element {
    switch ( tabType ) {
      case 'account':
        // @ts-ignore
        return <AccountLogin corpId={ corpId } onMyJjt={ onMyJjt } />;
      case 'dingding':
        // @ts-ignore
        return <QrcodeLogin corpId={ corpId } appId={ appId }/>;
      case 'wechat':
        // @ts-ignore
        return <WechatLogin corpId={ corpId } agentid={ agentId } ref={ 'qrcodeLogin' }/>;
      default:
        return <div/>;
    }
  }
  getLoginJjtComponent(onMyEvent?:any ): JSX.Element {
    // @ts-ignore
    return <JjtLogin onMyEvent={ onMyEvent }/>;
  }

  //获取项目配置
  getProjectConfig( projectCode: string ) {
    if ( projectCode === 'login' ) return;
    getProjectConfig( { path: projectCode } ).then( res => {
      if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
      const result = res.data;
      if ( !result?.id ) return;
      //TODO:处理 login project
      this.projectLogo = result?.logo as string;
      this.projectTitle = result?.title as string;
      this.projectCorpId = result?.corpId as string;
      window.localStorage.setItem( 'projectLogo', result?.logo );
      window.localStorage.setItem( 'projectTitle', result?.title );
      this.backgroundImg = result?.background;
      // (this.$refs['logoIcon'] as HTMLImageElement).src = (result?.logo as string);
      /*(this.$refs['backgroundIcon'] as HTMLElement).style.background = `url(${result?.background}) no-repeat`;
      (this.$refs['backgroundIcon'] as HTMLElement).style.backgroundSize = `100% 100%`;*/
    } );
  }


  downloadApp( value: string ) {
    getQrCode( {
      appCode: this.projectCode,
      appType: value,
    } ).then( res => {
      if ( res.data == "无安装包" ) {
        this.$message.warn( value + '端暂无安装包！' );
      } else {
        window.open( res.data as string );
      }
    } )
  }

  render() {
    const {
      downloadApp,
      tabsDisplay,
      tabBarIndex,
      curTab,
      changeTab,
      switchLoginComponent,
      corpId,
      appId,
      agentid,
      backgroundImg,//背景图片
      projectTitle,//标题
      projectLogo,//图标
      getLoginJjtComponent,
      onMyEvent,
      onMyJjt
    } = this;
    return (
      <div class={ Class.main }>
        <nav class={ Class.nav }>
{/*          <div class={ Class.logoIcon }>
            <img ref={ 'logoIcon' } src={ (projectLogo as string) } alt={ '' }/>
          </div>*/}
          <span>{ projectTitle }</span>
        </nav>
        <img src={ backgroundImg ?? '' } class={ Class.loginBackground } alt={ '' }/>
        <article ref={ 'backgroundIcon' } class={ Class.content }>
{/*          <div class={ Class.mobileNoPic }>
            <img src={ require( '../../../src/assets/extends/android.png' ) }
                 class={ Class.android }
                 onClick={ () => downloadApp( 'android' ) }/>
            <img src={ require( '../../../src/assets/extends/ios.png' ) } class={ Class.ios }
                 onClick={ () => downloadApp( 'ios' ) }/>
          </div>*/}
          {
            this.loginBoxChange?
            <div class={Class.loginBox}>
              {getLoginJjtComponent(onMyEvent)}
            </div>
            : <div class={Class.loginBox}>
              <nav class={Class.type}>
                {
                  tabsDisplay && tabsDisplay.map((item, index) =>
                    <div
                      key={index}
                      class={`${Class.tabBar} ${curTab === item.type && Class.tabBarActive || ''}`}
                      onClick={() => changeTab(item.type)}
                    >
                      <span>{item.name}</span>
                    </div>
                  )
                }
              </nav>
              <aside class={Class.slider}>
                <div tab-index={tabBarIndex} class={Class.sliderBar}/>
              </aside>
              <main class={Class.loginMain}>
                {switchLoginComponent(curTab, corpId, appId, agentid,onMyJjt)}
              </main>
            </div>
          }
        </article>
        <footer class={Class.footer}>
          <span>@中交第二航务工程勘察设计院有限公司2020&emsp;隐私和声明</span>
        </footer>
      </div>
    )
  }
}
