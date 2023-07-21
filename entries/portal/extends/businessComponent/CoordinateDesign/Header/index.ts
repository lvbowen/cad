import { Component, Vue, InjectReactive, Prop } from 'vue-property-decorator';
import { Icon, Modal, Dropdown, Badge, Col, Row, Select } from "@h3/antd-vue";
import Application from "@cloudpivot/application/pc";
import OAuthApi from "@/apis/oauth";
import { pluginsDownload, Revit, ProjectImp, DownLoad } from "../../../service/CoordinateDesign/pluginsDownload";
import env from "@/config/env";
import site from "@/config/site";
import { ProjectConfig } from "../../../../extends/type";
import LoginHelper from "../../../../src/views/login/loginHelper";
import { namespace } from "vuex-class";
const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");
const SystemModule = namespace("System/System");
@Component({
  name: "Header",
  components: {
    [Icon.name]: Icon,
    [Modal.name]: Modal,
    [Dropdown.name]: Dropdown,
    [Badge.name]: Badge,
    [Row.name]: Row,
    [Col.name]: Col,
    [Select.name]: Select,
    ASelectOption: Select.Option,
    ApplicationHeader: Application.ApplicationHeader,
  }
})
export default class Header extends Vue {
  @WorkflowCenterModule.Mutation("setAsideTitle") setAsideTitle: any;
  @WorkflowCenterModule.Mutation("setUserId") setUserId: any;
  @SystemModule.State("isAdmin") isAdmin: any;
  @SystemModule.Mutation("setIsAdmin") setIsAdmin: any;
  @SystemModule.Mutation("setAdmin") setAdmin: any;
  @SystemModule.Mutation("setRootAdmin") setRootAdmin: any;
  @InjectReactive('project') projectCode?: string;
  @InjectReactive('single') isSingleProject?: boolean;
  @InjectReactive('singleHost') hostAddr?: string;
  @InjectReactive('title') projectTitle?: string;
  @InjectReactive('logo') projectLogo?: string;
  @InjectReactive('projectConfig') projectConfig?: ProjectConfig;
  @Prop() subtitle?: string;
  @Prop() treeArr!: Array<any>;
  @Prop({required:true}) activeMenu!:string;
  @Prop({required:true}) activeMenuConfig!:{[key:string]:string};
  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&access_token=" + this.token;
    }
    return url;
  }
  /* 插件下载tab切换配置 */
  leftButtonLinks = {
    activeIndex: 0,
    buttonLinks: [
      { name: "Auto CAD", componentName: "DataForm" },
      { name: "Revit", componentName: "Workflow" },
      // {name:"instructions",componentName:"Workflow"},
    ]
  }
  componentName = "DataForm"

  rightButtonLinks = [
    // {name:"提交",type:"primary",visibleKey:"submitButton",showComment:false},
    // {name:"暂存",type:"primary",visibleKey:"retainButton",showComment:false},
    // {name:"接收",type:"primary",visibleKey:"receiveButton",showComment:false},
    // {name:"同意",type:"primary",visibleKey:"agreeButton",showComment:true},
    // {name:"驳回",type:"primary",visibleKey:"rejectButton",showComment:true},
  ]

  getListByType(type: string, value: any[] | string) {
    switch (type) {
    }
  };

  get headerList() {
    return this.treeArr.filter(item => item.pcAble);
  }

  get logo() {
    return site.logo;
  }

  get isShowToggle() {
    return this.$store.state.config.multiLanguageSwitch;
  }

  get isCloudPivot() {
    // 是否已打开内部维护组织开关
    return this.$store.state.config.cloudPivot;
  }

  get apiHost() {
    return window.config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }
  // 用户信息
  userInfo: any = {};
  showModal: boolean = false;
  params: any = {
    oldPwd: "",
    newPwd: "",
    surePwd: "",
    XTSJ: ""
  };

  oldPwdErrTips: string = "";
  newPwdErrTips: string = "";
  surePwdErr: boolean = false;
  // 只有自维护的用户并且不是admin这个账户才能有修改密码入口 #39826
  isShowUpdatePwdBtn: boolean = true;
  loginHelper = new LoginHelper();
  selectedIndustryTypes: string[] = [];
  industryTypes:string[] = [];
  autoExpandParent:any= true
  selectedKeys:any= []
  activeMen="";
  isDown: boolean = false;
  // 定义下拉框数据
  selectArrs: Array<Revit> = [];
  allSelectArrs: object = []
  oneActive: any = ''
  selectOne: string = ''
  comdown: string = ''
  comdownUrl: string = ''
  explain: string = ''
  declare: string = ''
  flagUse: boolean = true
  downFlag: number = 1 //1 下载组件 2 使用说明
  created() {
    this.getUserInfo();
  }
  mounted() {
    // this.headerDown()

  }
  // 文件下载选择
  onSelect(selectedKeys, info) {
    // console.log('selectedssss', selectedKeys, info);
  }
  // 获取当前用户信息
  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      this.userInfo = info;
      this.setUserId(info);
      this.isShowUpdatePwdBtn =
        (res.data.relatedSyncType === "PUSH" ||
          this.$store.state.config.loginType === 0 ||
          this.$store.state.config.loginType === 2) &&
        res.data.username !== "admin"; // admin这个账号 hide || 或者开启了账号密码登陆的时候
      sessionStorage.setItem("user", JSON.stringify(info));
      // 判断当前用户角色
      const isAppAdmin: boolean = info.permissions.includes("APP_MNG");
      const isSysAdmin: boolean = info.permissions.includes("SYS_MNG");
      const isRootAdmin: boolean = info.permissions.includes("ADMIN");
      const isAdmin: boolean = isAppAdmin || isSysAdmin || isRootAdmin;
      this.setIsAdmin(isAdmin);
      this.setRootAdmin(isRootAdmin);
      this.setAdmin(isSysAdmin || isRootAdmin);
      // 禁止无权限访问流程查询页面
      if (
        !isSysAdmin &&
        !isRootAdmin &&
        this.$route.name &&
        ["queryInstance", "queryParticipantWorkItem"].includes(this.$route.name)
      ) {
        this.$router.replace({ name: "myUnfinishedWorkItem" });
      }
      // 禁止超管访问流程委托页面
      if (isRootAdmin && this.$route.name && ["delegationWorkflow"].includes(this.$route.name)) {
        this.$router.replace({ name: "myUnfinishedWorkItem" });
      }
    }
  }




  /**
 * 切换多语言
 */
  toggleLanguage() {
    if (this.$i18n.locale === "zh") {
      this.$i18n.locale = "en";
    } else {
      this.$i18n.locale = "zh";
    }
    this.$forceUpdate();
    localStorage.setItem("locale", this.$i18n.locale);
  }

  /*
* 修改密码
*/
  async changePwd() {
    this.resetErrTips();
    if (!this.params.oldPwd) {
      this.oldPwdErrTips = this.$t("languages.common.oldPwdRequied").toString();
      return;
    }
    if (!this.params.newPwd) {
      this.newPwdErrTips = this.$t("languages.common.newPwdRequied").toString();
      return;
    }
    if (this.params.newPwd !== this.params.surePwd) {
      this.surePwdErr = true;
      this.newPwdErrTips = this.$t("languages.common.newPwdNotSame").toString();
      return;
    }

    const params = {
      username: this.userInfo.username,
      corpId: this.userInfo.corpId,
      oldPassword: this.params.oldPwd,
      newPassword: this.params.newPwd
    };
    const res = await OAuthApi.changePassword(params);
    if (res.errcode) {
      this.$message.error(res.errmsg);
      return;
    }

    this.$message.success(`${this.$t("languages.common.changePwdSuccess")}`);
    this.logout();
  }

  /*
    * 重置密码错误提示
    */
  resetErrTips() {
    this.oldPwdErrTips = "";
    this.newPwdErrTips = "";
    this.surePwdErr = false;
  }

  cancel() {
    this.showModal = false;
    this.params = {
      oldPwd: "",
      newPwd: "",
      surePwd: ""
    };
    this.resetErrTips();
  }

  // 跳转到个人中心
  toUserInfo() {
    // window.location.href = '/user/info';
    this.$router.push("/user").catch((err: any) => {
      err;
    });
  }

  // 跳转后台管理
  toAdmin() {
    const token = localStorage.getItem("token");
    if (this.isDingTalk && token) {
      //env.portalHost
      window.open(`${env.host}/admin?admin_token=${token}`, "_blank");
    } else {
      //env.portalHost
      window.open(`${env.host}/admin`, "_blank");
    }
  }

  // 退出登录
  logout() {
    const logoutIP = env.oauthHost;
    const redirectIP = env.redirectHost;
    const token: string = localStorage.getItem("token") || "";

    // window.location.href = `${logoutIP}/logout?redirect_uri=${redirectIP}/login&access_token=${token}`;
    this.loginHelper.removeUserPassword();
    this.loginHelper.saveUserPasswordToLocalStorage();
    OAuthApi.logout({
      redirect_uri: `${redirectIP}/login`,
      access_token: token
    }).then((res: any) => {
      // console.log(res);
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("expireTime");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem('searchParams');
      this.$router.replace({ name: "login" });
    });
  }

  leftMenuList: Array<any> = [];
  menuTab(val) {
    this.activeMen = val;
    this.leftMenuList = [];
    const menuItem = this.treeArr.find(item => item.name === val);
    if (!menuItem) return this.$message.error(`无效的菜单配置,${val}`)
    if (menuItem.type.toLowerCase() === "page") {
      if (!menuItem.pcUrl) this.$message.error('页面地址未设置，请联系管理员！');
      this.$router.push({ path: menuItem.pcUrl });
    } else if (menuItem.type.toLowerCase() === "bizModel") {
      this.goRouteBizModel(menuItem);
    } else {
      this.leftMenuList = menuItem.children
      if (menuItem.children && menuItem.children.length > 0) {
        if (menuItem.children[0].pcUrl) {
          if (menuItem.children[0].openMode === 'NEW_PAGE_MODE') return window.open(menuItem.children[0].pcUrl + `?access_token=${this.token}`, "_blank");
          this.$router.push({ path: menuItem.children[0].pcUrl });
        } else {
          const key = Object.keys(this.activeMenuConfig).find(item => this.activeMenuConfig[item] === val) as string;
          this.$message.error('页面地址未设置，请联系管理员！');
          this.$router.push({ path: '/' + key + '/Empty' });
        }

      }
    }
    const obj = {
      menuTitle: val,
      leftMenuList: this.leftMenuList,
      activeIndex: 0,
    }
    this.$emit('menuTab', obj)
  }

  goRouteBizModel(item) {
    this.$router
      .push({
        name: "applicationList",
        params: {
          appCode: item.appCode,
          schemaCode: item.code,
        },
        query: {
          parentId: item.parentId,
          code: item.code,
          openMode: item.openMode,
          pcUrl: item.pcUrl,
          queryCode: '',
        },
      })
      .catch((err: any) => {
        err;
      });
  }
  /* 点击头部下载图标打开弹框 */
  async headerDown() {
    this.isDown = true;
    let params = {
      appCode: 'XTSJ'
    }
    // 获取下载插件 icon url 和 版本信息
    const res: any = await pluginsDownload(params);
    if (res.errcode == 0) {
      let { data }: { data: any } = res
      // console.log(data, 4444445555)
      // let { Revit, AutoCAD }: { Revit: Revit, AutoCAD: Revit } = res.data
      let componentDownload = data['AutoCAD'][0]['componentDownload']
      componentDownload = componentDownload.map(v => {
        return { version: v.name, "execFile": v.url }
      })
      let useInstructions = data['AutoCAD'][0]['useInstructions']
      useInstructions = useInstructions.map(v => {
        return { version: v.name, "execFile": v.url }
      })

      // console.log(componentDownload, useInstructions);

      let AutoCAD: Array<Revit> = data['AutoCAD'].map(v => {
        return {
          id: v.id,
          execFile: v.execFile,
          icon: v.icon,
          type: v.type,
          version: v.version
        }
      })
      let maxObj = {
        AutoCAD,
        "组件下载":componentDownload,
        "使用说明":useInstructions
      }
      // console.log("11111", maxObj)

      this.allSelectArrs = maxObj
      this.oneActive = this.getObjFirst(data)
      this.selectArrs = data[this.oneActive]
      this.selectOne = this.selectArrs[0]['version']
      // this.comdown = this.selectArrs[0]['componentDownload']['0']['name']
      // this.comdownUrl = this.selectArrs[0]['componentDownload']['0']['url']
      // this.explain = this.selectArrs[0]['useInstructions'][0]['name']
      // this.declare = this.selectArrs[0]['useInstructions'][1]['name']
      // console.log(data,44444,this.selectArrs,this.oneActive);
      // console.log(6666, res);
      // console.log(8888, this.selectArrs[0]['componentDownload']['0']['url']);
    }
    // console.log(res,555)
  }
  // 动态获取对象的第一个属性名称
  getObjFirst(obj: any) {
    for (let keys in obj) {
      return keys
    }
  }

  changeTabsNum(key: string) {
    this.flagUse = true
    this.selectArrs = this.allSelectArrs[key];
    this.oneActive = key
    this.selectOne = this.selectArrs[0]['version']
    // this.comdown = this.selectArrs[0]['componentDownload']['0']['name']
    // this.comdownUrl = this.selectArrs[0]['componentDownload']['0']['url']
    // this.explain = this.selectArrs[0]['useInstructions'][0]['name']
    // this.declare = this.selectArrs[0]['useInstructions'][1]['name']
  }
  selectChangeOne(value) {
    // console.log(value,44444)
  }
  //点击确定关闭弹框 下载文件
  addList(url: string) {
    this.isDown = false;
    if (this.flagUse) {
      // 获取此时选中的对象
      let minobj: Revit = this.selectArrs.filter(v => v.version == this.selectOne)[0]
      // 清空数据
      // console.log(11111, minobj)
      this.clearmodel()
      // 进行下载跳转
      window.location.href = minobj.execFile
    }
  }
  //清空数据
  clearmodel() {
    this.allSelectArrs = {}
    this.oneActive = ''
    this.selectArrs = []
    this.selectOne = ''
  }
  //关闭弹框
  cancelDown() {
    this.isDown = false;
    this.clearmodel()
  }

    leftButtonClick(item:{name:string,componentName:string},index:number){
    this.leftButtonLinks.activeIndex=index;
    this.componentName=item.componentName;
  }

  actionButtonClick(item:{visibleKey:string,name:string,showComment:boolean}){

  }
  modifyPassword() {
    window.open('https://jjt.ctesi.com.cn/Update/check')
  }
}

