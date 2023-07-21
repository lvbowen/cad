import {Component, Vue, Watch, Prop, InjectReactive} from "vue-property-decorator";
import {Menu, Badge} from "@h3/antd-vue";
import * as WorkflowCenterNS
  from "@cloudpivot/flow-center/src/components/pc/typings/workflow-center";
import * as localeTemplate from "../../locales/index";
import Class from "./aggregationMenu.module.less";
// 引入流程中心store
import WorkflowCenterStore from "@cloudpivot/flow-center/src/components/pc/store/workflow-center";

// customService
import generateAppsMenu, {EachAppMenu, masterAppMenu, AppMenu} from "../../service/menuServices";

import Utils from "../../utils";
import OAuthApi from "@/apis/oauth";

@Component({
  name: "AggregationMenu",
  components: {
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ASubMenu: Menu.SubMenu,
    ABadge: Badge,
  },
})
export default class AggregationMenu extends Vue {
  name: string = "AggregationMenu";

  selectedKeys: Array<string> = [];

  openKeys: Array<string> = [];

  appMenuMap: Map<string, EachAppMenu> = new Map();

  flatMenuArr: Array<EachAppMenu> = [];

  specStyle: boolean = false;

  isLoaded: boolean = false;

  @Prop(Number) dragWidth!: number;

  @Prop() flatMenu?: boolean;

  @Prop()
  public noQueue?: boolean;

  @InjectReactive("project") projectCode?: string;

  @Watch("dragWidth")
  ondragWidthChange(v: any) {
    if (v > 230) {
      this.specStyle = true;
    } else {
      this.specStyle = false;
    }
  }

  get isChinese() {
    return this.$i18n.locale === "zh";
  }

  queryCode: string = "";

  get unFinishedListCount() {
    return (
      this.$store &&
      this.$store.state.WorkflowCenterStore &&
      this.$store.state.WorkflowCenterStore.unFinishedListCount
    );
  }

  get unReadListCount() {
    return (
      this.$store &&
      this.$store.state.WorkflowCenterStore &&
      this.$store.state.WorkflowCenterStore.unReadListCount
    );
  }

  get admin() {
    return (
      this.$store && this.$store.state.WorkflowCenterStore && this.$store.state.System.System.admin
    ); // 引入系统store的字段
  }

  get rootAdmin() {
    return (
      this.$store &&
      this.$store.state.WorkflowCenterStore &&
      this.$store.state.System.System.isRootAdmin
    );
  }

  @Watch("admin")
  onAdminChange(val: any) {
    // console.log('admin change: ', val);
    this.setSelectedKeys();
  }

  @Watch("$route")
  routeChange() {
    this.setSelectedKeys();
  }

  created() {
    // 动态注册模块
    this.$store && this.$store.registerModule("WorkflowCenterStore", WorkflowCenterStore);
  }

  beforeMount() {
    this.setSelectedKeys();
    //
    this.handleGetWorkCount();
  }

  //Map转化为对象数组
  mapToObjectArr<T>(map: Map<string | number, T>, index: number): Array<T> {
    //is Tuple
    const array2d: Array<unknown | []> = Array.from(map);
    const objArr: Array<T> = [];
    array2d.forEach((item) => {
      objArr.push(Array.isArray(item) && item[index]);
    });
    return objArr;
  }

  unique(arr: Array<string>): Array<string> {
    return [...new Set(arr)];
  }

  flatMenuRouter(): void {
    const {name, query} = this.$route,
      {id} = query;
    if (!id) return;
    if (id === "index") {
      this.$nextTick(() => {
        this.selectedKeys = ["index"];
      });
    } else {
      const activeMenu = this.flatMenuArr?.find((item) => item.code === id);
      if (!activeMenu) return;
      this.$nextTick(() => {
        this.selectedKeys = [activeMenu.code];
      });
    }
  }

  // 根据当前路由判断当前选中
  setSelectedKeys() {
    let {name} = this.$route;
    if (!name) return;
    if (name === "flatMenu") return this.flatMenuRouter();
    if (!this.admin && ["queryInstance", "queryParticipantWorkItem"].includes(name)) {
      name = "myUnfinishedWorkItem";
    }
    name = name.substring(0, 1).toUpperCase() + (name as any).substring(1);
    console.log(name);

    // let skey: number = 0;
    let skey: string = "0";
    const tempOpenKeys: Array<string> = [];
    switch (name) {
      case "Workbench":
        skey = WorkflowCenterNS.SelectKeysMapping.workbench.toString();
        tempOpenKeys.push("subIndex3");
        break;
      case "MyUnfinishedWorkItem":
        skey = WorkflowCenterNS.SelectKeysMapping.MyUnfinishedWorkItem.toString();
        tempOpenKeys.push("subIndex3");
        break;
      case "MyUnReadWorkItem":
        skey = WorkflowCenterNS.SelectKeysMapping.MyUnReadWorkItem.toString();
        tempOpenKeys.push("subIndex3");
        break;
      case "MyFinishedWorkItem":
        skey = WorkflowCenterNS.SelectKeysMapping.MyFinishedWorkItem.toString();
        tempOpenKeys.push("subIndex3");
        break;
      case "MyReadWorkItem":
        skey = WorkflowCenterNS.SelectKeysMapping.MyReadWorkItem.toString();
        tempOpenKeys.push("subIndex3");
        break;
      case "MyWorkflow":
        skey = WorkflowCenterNS.SelectKeysMapping.MyWorkflow.toString();
        tempOpenKeys.push("subIndex3");
        break;
      case "QueryInstance":
        skey = WorkflowCenterNS.SelectKeysMapping.QueryInstance.toString();
        tempOpenKeys.push("subIndex3", "sub2");
        break;
      case "QueryParticipantWorkItem":
        skey = WorkflowCenterNS.SelectKeysMapping.QueryParticipantWorkItem.toString();
        tempOpenKeys.push("subIndex3", "sub2");
        break;
      case "MyComments":
        skey = WorkflowCenterNS.SelectKeysMapping.MyComments.toString();
        tempOpenKeys.push("subIndex3", "sub2");
        break;
      case "DelegationWorkflow":
        skey = WorkflowCenterNS.SelectKeysMapping.DelegationWorkflow.toString();
        tempOpenKeys.push("subIndex3", "sub2");
        break;
      // case 'ApplicationList':
      default:
        const {appCode, schemaCode} = this.$route.params,
          {flatMenu} = this.$props;
        if (this.appMenuMap) {
          //debugger;
          const parent = this.appMenuMap.get(appCode);
          let currentCode: string;
          // if (parent) {
          if (!schemaCode) {
            //无schemaCode为自定义页面
            currentCode = Utils.GetRequest()?.code;
          } else {
            currentCode = schemaCode;
          }
          const pathArr: Array<AppMenu> = Utils.deepFind<AppMenu>(
            this.mapToObjectArr<AppMenu>(this.appMenuMap, 1),
            (item, i, level) => item.code === currentCode,
            "children"
          );
          if (pathArr.length >= 2) {
            pathArr[0].parentId && tempOpenKeys.push(pathArr[0].parentId);
            pathArr.forEach((item) => {
              tempOpenKeys.push(item.id as string);
            });
            tempOpenKeys.length = tempOpenKeys.length - 1;
            skey = pathArr[pathArr.length - 1][flatMenu ? "code" : "id"] as string;
          } else if (pathArr.length === 1) {
            skey = pathArr[pathArr.length - 1][flatMenu ? "code" : "id"] as string;
          } else {
            skey = "-1";
          }
        }
        break;
    }

    //console.log('selectKeys', skey);
    const _k = skey?.toString();
    if (_k) this.selectedKeys = [_k];

    const afterSet: Array<string> = this.unique(this.openKeys.concat(tempOpenKeys));
    this.openKeys = afterSet;
    
    /*this.$nextTick(()=>{
      this.openKeys = afterSet;
    })*/
  }

  // 获取任务数
  handleGetWorkCount() {
    this.$store.dispatch("WorkflowCenterStore/getWorkCount", this.projectCode);
  }

  destroyed() {
    this.$store.unregisterModule("WorkflowCenterStore");
  }

  /**
   * 目录切换
   */
  switchRouter(menu: any) {
    if (menu.type === "BizModel") {
      this.$nextTick(() => {
        this.bizModelGo(menu);
      });
    } else if (menu.type === "Report") {
      OAuthApi.getPageOrigin({appCode: menu.appCode, reportCode: menu.code}).then((res) => {
        if (!res.data || res.data.length === 0) return;
        if (res.data[0].origin === "yunshu") return this.reportGo(menu);
        return this.rdpGo(menu);
      });
    } else if (menu.pcUrl) {
      this.pageGo(menu);
    } else {
      this.$message.error("页面地址未设置，请联系管理员！");
    }
  }

  pageGo(menu: any) {
    if (menu.openMode === "RECENT_PAGE_MODE") {
      this.$router
        .push({
          name: "applicationDefine",
          params: {
            url: menu.pcUrl,
          },
          query: {
            parentId: menu.parentId,
            code: menu.code,
            openMode: menu.openMode,
            pcUrl: menu.pcUrl,
            queryCode: this.queryCode,
          },
        })
        .catch((err: any) => {
          err;
        });
    } else if (menu.openMode === "NEW_PAGE_MODE") {
      window.open(menu.pcUrl);
    } else {
      this.$router
        .push({
          path: menu.pcUrl,
          query: {
            parentId: menu.parentId,
            code: menu.code,
            openMode: menu.openMode,
            pcUrl: menu.pcUrl,
            queryCode: this.queryCode,
          },
        })
        .catch((err: any) => {
          err;
        });
    }
  }

  bizModelGo(menu: any) {
    this.$router
      .push({
        name: "applicationList",
        params: {
          appCode: menu.appCode,
          schemaCode: menu.code,
        },
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode,
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  reportGo(menu: any) {
    this.$router
      .push({
        name: "applicationReport",
        params: {
          appCode: menu.appCode,
          reportCode: menu.code,
        },
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode,
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  rdpGo(menu: any) {
    this.$router
      .push({
        name: "applicationRdp",
        params: {
          appCode: menu.appCode,
          reportCode: menu.code,
        },
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode,
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  router2flatMenu(menu: EachAppMenu): void {
    switch (menu.type) {
      case "index":
        //TODO:流程首页
        this.$router.push({
          name: "flatMenu",
          query: {
            id: "index",
          },
        });
        break;
      case "BizModel":
        this.$nextTick(() => {
          this.bizModelGo(menu);
        });
        break;
      case "Report":
        this.reportGo(menu);
        break;
      case "Folder":
        this.$router.push({
          name: "flatMenu",
          query: {
            id: menu.code,
          },
        });
        break;
      default:
        if (menu.pcUrl) {
          this.pageGo(menu);
        } else {
          this.$message.error("页面地址未设置，请联系管理员！");
        }
        break;
    }
  }

  //生成除流程之外的菜单
  generateMultilevelMenus(
    menuItem: Array<EachAppMenu> | EachAppMenu | null | masterAppMenu
  ): Array<JSX.Element | Array<unknown>> {
    const {switchRouter, isChinese, $i18n, specStyle} = this;
    const vDom: Array<JSX.Element | Array<unknown>> = [];
    if (!menuItem) return vDom;
    if (menuItem instanceof Array) {
      const list: Array<JSX.Element | Array<unknown>> = [];
      menuItem.forEach((item) => {
        list.push(this.generateMultilevelMenus(item));
      });
      vDom.push(list);
    } else {
      // @ts-ignore
      if (menuItem?.children?.length > 0) {
        switch (menuItem.type) {
          case "Folder":
            vDom.push(
              //侧边栏一级菜单
              <a-sub-menu key={menuItem.id}>
                <span slot={"title"} style={{display: "flex", alignItems: "center"}}>
                  {
                    // !menuItem.icon?.includes('data')&&
                    (
                      <img
                        style={{
                          width: (menuItem.icon && "17px") || 0,
                          height: (menuItem.icon && "17px") || 0,
                        }}
                        src={menuItem.icon as string}
                        alt={""}
                      />
                    ) || (
                      <i
                        role-style="icon"
                        class={`icon aufontAll ${menuItem?.icon || "h-icon-all-folder-open-o"} `}
                      />
                    )
                  }
                  <span
                    class={specStyle ? "specStyle" : ""}
                    title={isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}
                  >
                    {isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}
                  </span>
                </span>
                {this.generateMultilevelMenus(menuItem.children)}
              </a-sub-menu>
            );
            break;
          default:
            vDom.push(
              <a-menu-item
                key={menuItem.id}
                onClick={() => switchRouter(menuItem)}
                // isSelected={this.selectedKeys[0] === menuItem.id}
              >
                {(menuItem.type === "BizModel" && (
                  <router-link
                    to={""}
                    title={isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}
                  >
                    {(!menuItem.icon?.includes("data") && (
                      <img src={menuItem.icon as string} alt={""}/>
                    )) || <i role-style="icon" class={`icon aufontAll ${menuItem?.icon}`}/>}
                    <span class={specStyle ? "specStyle" : ""}>
                      {isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}
                    </span>
                  </router-link>
                )) || (
                  <a title={isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}>
                    {(!menuItem.icon?.includes("data") && (
                      <img src={menuItem.icon as string} alt={""}/>
                    )) || <i role-style="icon" class={`icon aufontAll ${menuItem.icon}`}/>}
                    <span class={specStyle ? "specStyle" : ""}>
                      {isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}
                    </span>
                  </a>
                )}
              </a-menu-item>
            );
            break;
        }
      } else {
        vDom.push(
          <a-menu-item key={menuItem.id} onClick={() => switchRouter(menuItem)}>
            {(menuItem.type === "BizModel" && (
              <router-link
                to={""}
                title={isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}
              >
                <i role-style="icon" class={`icon aufontAll ${menuItem?.icon}`}/>
                <span class={specStyle ? "specStyle" : ""}>
                  {isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}
                </span>
              </router-link>
            )) || (
              <a title={isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}>
                <i role-style="icon" class={`icon aufontAll ${menuItem.icon}`}/>
                <span class={specStyle ? "specStyle" : ""}>
                  {isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}
                </span>
              </a>
            )}
          </a-menu-item>
        );
      }
    }
    return vDom;
  }

  renderFlatMenu(menuArr: Array<EachAppMenu>): Array<JSX.Element> | JSX.Element {
    const vDom: Array<JSX.Element> = [],
      {isChinese, $i18n, router2flatMenu} = this;
    vDom.push(
      <a-menu-item key="index" onClick={() => router2flatMenu({type: "index"} as EachAppMenu)}>
        <router-link to="">
          <i role-style="icon" class="icon aufontAll h-icon-all-align-left"/>
          <span class={this.specStyle ? "specStyles" : ""}>
            {localeTemplate.default("languages.common.myIndex")}
          </span>
        </router-link>
      </a-menu-item>
    );
    if (!menuArr) return vDom;
    menuArr.forEach((item) => {
      if (item.name.includes("后台模型")) return;
      vDom.push(
        <a-menu-item key={item.code} onClick={() => router2flatMenu(item)}>
          <router-link to="">
            {(item.icon?.includes("data") && (
              <i role-style="icon" class={Class.folderMenuIcon}>
                <img src={item.icon as string} alt={""}/>
              </i>
            )) || <i role-style="icon" class="icon aufontAll h-icon-all-folder-open-o"/>}
            <span class={this.specStyle ? "specStyles" : ""}>
              {isChinese ? item.name : item.name_i18n[$i18n.locale]}
            </span>
          </router-link>
        </a-menu-item>
      );
    });
    return vDom;
  }

  async mounted() {
    const {flatMenu} = this.$props,
      {projectCode, noQueue} = this;
    if (!flatMenu && !noQueue) {
      const menuMap = await generateAppsMenu(false, true, false, undefined, projectCode);
      if (!menuMap) return;
      const aggMenu: Map<string, EachAppMenu> = new Map();
      const menuMapArr: [string | number, masterAppMenu][] = Array.from(menuMap);
      menuMap.forEach((item) => {
        /*const chApp = item.name;
        if(!chApp.includes('CH-')){
          menuMap.delete(item.code);
        };
        item.name=item.name.split('CH-')[1];*/
        const chApp = item.name;
        if (!chApp.includes("_model")) {
          menuMap.delete(item.code);
        }
      });
      let targetMenu: [string | number, masterAppMenu] | undefined;
      if (menuMapArr.length === 1) {
        targetMenu = menuMapArr[0];
      } else {
        //只选取长江航道局 CHZHGKJJXT_001
        targetMenu = menuMapArr.find((item) => item[1].code === projectCode);
      }
      targetMenu &&
      targetMenu[1].children?.forEach((item) => {
        aggMenu.set(item.code, item);
      });
      //this.appMenuMap = new Map(menuMap);
      this.appMenuMap = aggMenu;
      this.setSelectedKeys();
    } else {
      const menuMap = (await generateAppsMenu(false, false, true, projectCode)) as unknown;
      if (!menuMap) return;
      this.appMenuMap = menuMap as Map<string, EachAppMenu>;
      this.flatMenuArr = (menuMap as Map<string, Array<EachAppMenu>>)?.get(
        projectCode as string
      ) as Array<EachAppMenu>;
      this.setSelectedKeys();
      this.$store.commit("setProjectMenu", this.flatMenuArr);
    }
  }

  render() {
    const {flatMenu} = this.$props,
      {renderFlatMenu, flatMenuArr, noQueue} = this;
    return (
      <div class={`menu-content ${Class.workflowMenu}`}>
        <a-menu
          theme="dark"
          mode="inline"
          selectedKeys={this.selectedKeys}
          openKeys={this.openKeys}
          onOpenChange={(openKeys) => {
            const appMenuMap:any = [];
            for (const [key, val] of this.appMenuMap.entries()) {
              appMenuMap.push(val);
            }
            const subMenuIds:string[]=["subIndex3"];
            function getSubMenuId(menu,menuIds:string[]){
              for (let index = 0; index < menu.length; index++) {
                const element = menu[index];
                  menuIds.push(element.id);                
              }
            }
            getSubMenuId(appMenuMap,subMenuIds);
            let latestOpenKey:string="";
            if(openKeys.length>0){
              if(!openKeys.find(key=>subMenuIds.includes(key))){
                latestOpenKey="";
              }else{
                latestOpenKey=openKeys[openKeys.length-1];
              }
            }
            const finalOpenkeys:any = [];
            function Menus(data, openKey, newOpenkeys) {
              for (let i = 0; i < data.length; i++) {
                const childrenList = data[i].children;
                if (data[i].id === openKey) {
                  newOpenkeys.push(data[i].id);
                  return;
                } else {
                  if (childrenList) {
                    Menus(childrenList, openKey, newOpenkeys);
                    if (newOpenkeys.length > 0) {
                      newOpenkeys.push(data[i].id);
                      return;
                    }
                  }
                }
              }
            }         
            if(latestOpenKey==="subIndex3"){
              finalOpenkeys.push(latestOpenKey);
            }else{
              Menus(appMenuMap, latestOpenKey, finalOpenkeys);
            }
            this.openKeys = finalOpenkeys;
          }}
        >
          {(flatMenu && !noQueue && renderFlatMenu(flatMenuArr)) || (
            <a-sub-menu key="subIndex3">
              <span slot="title">
                <i role-style="icon" class="icon aufontAll h-icon-all-align-left"/>
                <span class={this.specStyle ? "specStyles" : "search-flow"}>
                  {localeTemplate.default("languages.common.myIndex")}
                </span>
              </span>
              <a-menu-item key="10">
                <router-link to="/workflow-center/workbench">
                  <i role-style="icon" class="icon aufontAll h-icon-all-list-work-o"/>
                  <span class={this.specStyle ? "specStyles" : ""}>个人工作台</span>
                </router-link>
              </a-menu-item>

              {/* <a-menu-item key="1">
                <router-link to="/workflow-center/my-unfinished-workitem">
                  <i role-style="icon" class="icon aufontAll h-icon-all-list-work-o"/>
                  <span class={this.specStyle ? 'specStyles' : ''}>
                  {localeTemplate.default('cloudpivot.flowCenter.pc.todoList')}
                    <a-badge count={this.unFinishedListCount} overflowCount={99}/>
                </span>
                </router-link>
              </a-menu-item>

              <a-menu-item key="2">
                <router-link to="/workflow-center/my-unread-workitem">
                  <i role-style="icon" class="icon aufontAll h-icon-all-leave-application-o"/>
                  <span class={this.specStyle ? 'specStyles' : ''}>
                  {localeTemplate.default('cloudpivot.flowCenter.pc.toreadList')}
                    <a-badge count={this.unReadListCount} overflowCount={99}/>
                </span>
                </router-link>
              </a-menu-item>

              <a-menu-item key="3">
                <router-link to="/workflow-center/my-finished-workitem">
                  <i role-style="icon" class="icon aufontAll h-icon-all-clock-edit-o"/>
                  <span class={this.specStyle ? 'specStyles' : ''}>
                  {localeTemplate.default('cloudpivot.flowCenter.pc.doneList')}
                </span>
                </router-link>
              </a-menu-item>

              <a-menu-item key="4">
                <router-link to="/workflow-center/my-read-workitem">
                  <i role-style="icon" class="icon aufontAll h-icon-all-resumption-applicati"/>
                  <span class={this.specStyle ? 'specStyles' : ''}>
                  {localeTemplate.default('cloudpivot.flowCenter.pc.readList')}
                </span>
                </router-link>
              </a-menu-item>

              <a-menu-item key="5">
                <router-link to="/workflow-center/my-workflow">
                  <i role-style="icon" class="icon aufontAll h-icon-all-department-o"/>
                  <span class={this.specStyle ? 'specStyles' : ''}>
                  {localeTemplate.default('cloudpivot.flowCenter.pc.myFlow')}
                </span>
                </router-link>
              </a-menu-item> */}

              {/* {
                this.rootAdmin &&
                <a-menu-item key="9">
                  <router-link to="/workflow-center/delegation-workflow">
                    <i role-style="icon" class="icon aufontAll h-icon-all-sales-order-o"/>
                    <span class={this.specStyle ? 'specStyles' : ''}>
                      {localeTemplate.default('cloudpivot.flowCenter.pc.delegationFlow')}
                  </span>
                  </router-link>
                </a-menu-item>
                ||
                undefined
              }

              {
                this.admin &&
                <a-sub-menu key="sub2">
               <span slot={"title"}>
                 <i role-style="icon" class="icon aufontAll h-icon-all-search-o"/>
                 <span class={this.specStyle ? 'specStyles' : 'search-flow'}>
                   {localeTemplate.default('cloudpivot.flowCenter.pc.searchFlow')}
                 </span>
               </span>
                  <a-menu-item key="6">
                    <router-link to="/workflow-center/query-instance">
                    <span class={this.specStyle ? 'specStyle' : ''}>
                      {localeTemplate.default('cloudpivot.flowCenter.pc.instanceSearch')}
                    </span>
                    </router-link>
                  </a-menu-item>

                  <a-menu-item key="7">
                    <router-link to="/workflow-center/query-participant-workItem">
                    <span class={this.specStyle ? 'specStyle' : ''}>
                      {localeTemplate.default('cloudpivot.flowCenter.pc.taskSearch')}
                    </span>
                    </router-link>
                  </a-menu-item>
                </a-sub-menu>
                ||
                undefined
              } */}
            </a-sub-menu>
          )}
          {!flatMenu &&
          this.appMenuMap &&
          Array.from(this.appMenuMap).map((item) => this.generateMultilevelMenus(item[1]))}
        </a-menu>
      </div>
    );
  }
}
