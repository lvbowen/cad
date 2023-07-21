import {Component, Vue, Watch} from "vue-property-decorator";
import Class from './FlatMenu.module.less';
import Utils from "../../utils";
import {EachAppMenu, masterAppMenu} from "../../service/menuServices";
import OAuthApi from "@/apis/oauth";
import Icon from "../icon/icon";
import * as localeTemplate from "../../locales";
import * as Type from "../../type";

@Component({
  name: 'FlatMenu',
  components: {
    Icon
  }
})
export default class FlatMenu extends Vue {
  private queryCode: string = '';

  private narrowMenu: Array<string> = [];

  private title: string | null = null;

  private menuStore: Array<EachAppMenu> = [];

  private flatMenu: Array<EachAppMenu> = [];

  get unFinishedListCount() {
    return this.$store && this.$store.state.WorkflowCenterStore.unFinishedListCount;
  }

  get unReadListCount() {
    return this.$store && this.$store.state.WorkflowCenterStore.unReadListCount;
  }

  get admin() {
    return this.$store && this.$store.state.System.System.admin; // 引入系统store的字段
  }

  get rootAdmin() {
    return this.$store && this.$store.state.System.System.isRootAdmin;
  }

  get isChinese() {
    return this.$i18n.locale === 'zh';
  }

  renderWorkFlowMenu(): Array<JSX.Element> {
    const vDom: Array<JSX.Element> = [], {narrowMenu, menuExpend} = this;
    vDom.push(
      <div class={Class.menuCard}>
        <article>
          <aside onClick={() => {
            this.$router.push('/workflow-center/my-unfinished-workitem')
          }} card-role={'single'} class={`${Class.card}`}>
            <span>{localeTemplate.default('cloudpivot.flowCenter.pc.todoList')}</span>
            <aside><Icon src={'menuPick'}/></aside>
          </aside>
          <aside onClick={() => {
            this.$router.push('/workflow-center/my-unread-workitem')
          }} card-role={'single'} class={`${Class.card}`}>
            <span>{localeTemplate.default('cloudpivot.flowCenter.pc.toreadList')}</span>
            <aside><Icon src={'menuPick'}/></aside>
          </aside>
          <aside onClick={() => {
            this.$router.push('/workflow-center/my-finished-workitem')
          }} card-role={'single'} class={`${Class.card}`}>
            <span>{localeTemplate.default('cloudpivot.flowCenter.pc.doneList')}</span>
            <aside><Icon src={'menuPick'}/></aside>
          </aside>
          <aside onClick={() => {
            this.$router.push('/workflow-center/my-read-workitem')
          }} card-role={'single'} class={`${Class.card}`}>
            <span>{localeTemplate.default('cloudpivot.flowCenter.pc.readList')}</span>
            <aside><Icon src={'menuPick'}/></aside>
          </aside>
          <aside onClick={() => {
            this.$router.push('/workflow-center/my-workflow')
          }} card-role={'single'} class={`${Class.card}`}>
            <span>{localeTemplate.default('cloudpivot.flowCenter.pc.myFlow')}</span>
            <aside><Icon src={'menuPick'}/></aside>
          </aside>
          {
            this.rootAdmin &&
            <aside onClick={() => {
              this.$router.push('/workflow-center/delegation-workflow')
            }} card-role={'single'} class={`${Class.card}`}>
              <span>{localeTemplate.default('cloudpivot.flowCenter.pc.delegationFlow')}</span>
              <aside><Icon src={'menuPick'}/></aside>
            </aside>
          }
        </article>
      </div>
    );
    if (this.admin) {
      vDom.push(
        <div action-role={narrowMenu.includes('flowSearch') && 'narrow'} class={Class.menuCard}>
          <nav onClick={() => menuExpend('flowSearch')}>
            <aside class={Class.titleBarge}/>
            <span>{localeTemplate.default('cloudpivot.flowCenter.pc.searchFlow')}</span>
            <aside><Icon src={'arrow'}/></aside>
          </nav>
          <article>
            <aside onClick={() => {
              this.$router.push('/workflow-center/query-instance')
            }} card-role={'single'} class={`${Class.card}`}>
              <span>{localeTemplate.default('cloudpivot.flowCenter.pc.instanceSearch')}</span>
              <aside><Icon src={'menuPick'}/></aside>
            </aside>
            <aside onClick={() => {
              this.$router.push('/workflow-center/query-participant-workItem')
            }} card-role={'single'} class={`${Class.card}`}>
              <span>{localeTemplate.default('cloudpivot.flowCenter.pc.taskSearch')}</span>
              <aside><Icon src={'menuPick'}/></aside>
            </aside>
          </article>
        </div>
      )
    }
    return vDom;
  }

  private menuExpend(id): void {
    const {narrowMenu} = this;
    const index = narrowMenu.findIndex(item => item === id);
    if (index !== -1) {
      narrowMenu.splice(index, 1);
    } else {
      narrowMenu.push(id);
    }
  }

  /**
   * 目录切换
   */
  switchRouter(menu: any) {
    if (menu.type === 'BizModel') {
      this.$nextTick(() => {
        this.bizModelGo(menu);
      })
    } else if (menu.type === 'Report') {
      this.reportGo(menu);
    } else if (menu.pcUrl) {
      this.pageGo(menu);
    } else {
      this.$message.error('页面地址未设置，请联系管理员！');
    }
  }

  pageGo(menu: any) {
    if (menu.openMode === 'RECENT_PAGE_MODE') {
      this.$router.push({
        name: 'applicationDefine',
        params: {
          url: menu.pcUrl
        },
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode
        },
      }).catch((err: any) => {
        err
      });
    } else if (menu.openMode === 'NEW_PAGE_MODE') {
      window.open(menu.pcUrl);
    } else {
      this.$router.push({
        path: menu.pcUrl,
        query: {
          parentId: menu.parentId,
          code: menu.code,
          openMode: menu.openMode,
          pcUrl: menu.pcUrl,
          queryCode: this.queryCode
        },
      }).catch((err: any) => {
        err
      });
    }
  }

  bizModelGo(menu: any) {
    this.$router.push({
      name: 'applicationList',
      params: {
        appCode: menu.appCode,
        schemaCode: menu.code
      },
      query: {
        parentId: menu.parentId,
        code: menu.code,
        openMode: menu.openMode,
        pcUrl: menu.pcUrl,
        queryCode: this.queryCode
      },
    }).catch((err: any) => {
      err
    });
  }

  reportGo(menu: any) {
    this.$router.push({
      name: 'applicationReport',
      params: {
        appCode: menu.appCode,
        reportCode: menu.code
      },
      query: {
        parentId: menu.parentId,
        code: menu.code,
        openMode: menu.openMode,
        pcUrl: menu.pcUrl,
        queryCode: this.queryCode
      },
    }).catch((err: any) => {
      err
    });
  }

  rdpGo(menu: any) {
    this.$router.push({
      name: 'applicationRdp',
      params: {
        appCode: menu.appCode,
        reportCode: menu.code
      },
      query: {
        parentId: menu.parentId,
        code: menu.code,
        openMode: menu.openMode,
        pcUrl: menu.pcUrl,
        queryCode: this.queryCode
      },
    }).catch((err: any) => {
      err
    });
  }

  private go2Page(menu: EachAppMenu): void {
    if (menu.type === 'BizModel') {
      this.$nextTick(() => {
        this.bizModelGo(menu);
      })
    } else if (menu.type === 'Report') {
      OAuthApi.getPageOrigin({appCode: menu.appCode, reportCode: menu.code}).then(res => {
        if (!res.data || res.data.length === 0) return;
        if (res.data[0].origin === 'yunshu') return this.reportGo(menu);
        return this.rdpGo(menu);
      })
    } else if (menu.pcUrl) {
      this.pageGo(menu);
    } else {
      this.$message.error('页面地址未设置，请联系管理员！');
    }
  }

  generateMultilevelMenus(menuItem: Array<EachAppMenu> | EachAppMenu | masterAppMenu, isSumChildren?: boolean): Array<JSX.Element> {
    const vDom: Array<JSX.Element | Array<Array<JSX.Element>> | Array<JSX.Element>> = [], {
      narrowMenu,
      isChinese,
      $i18n,
      menuExpend,
      go2Page
    } = this;
    if (!menuItem) return vDom as Array<JSX.Element>;
    if (menuItem instanceof Array) {
      const list: Array<JSX.Element | Array<JSX.Element>> = [];
      menuItem.forEach(item => {
        list.push(
          this.generateMultilevelMenus(item)
        )
      });
      vDom.push(list as Array<JSX.Element>);
    } else {
      if ((menuItem.children as Array<EachAppMenu>)?.length) {
        switch (menuItem.type) {
          case 'Folder':
            vDom.push(
              <div action-role={narrowMenu.includes(menuItem.id) && 'narrow'}
                   class={Class.menuCard}>
                <nav onClick={() => menuExpend(menuItem.id)}>
                  <aside class={Class.titleBarge}/>
                  <span>{isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}</span>
                  <aside><Icon src={'arrow'}/></aside>
                </nav>
                <article>
                  {this.generateMultilevelMenus(menuItem.children as Array<EachAppMenu>)}
                </article>
              </div>
            )
            break;
          default:
            vDom.push(
              <aside onClick={() => go2Page(menuItem as EachAppMenu)} card-role={'single'}
                     color-role={1} class={`${Class.card}`}>
                <span>{isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}</span>
                <aside><Icon src={'menuPick'}/></aside>
              </aside>
            )
            break;
        }
      } else {
        vDom.push(
          <aside onClick={() => go2Page(menuItem as EachAppMenu)} card-role={'single'}
                 color-role={2} class={`${Class.card}`}>
            <span>{isChinese ? menuItem.name : menuItem.name_i18n[$i18n.locale]}</span>
            <aside><Icon src={'menuPick'}/></aside>
          </aside>
        )
      }
    }
    return vDom as Array<JSX.Element>;
  }

  private initProjectMenu(projectMenu: Array<EachAppMenu>) {
    const {id} = Utils.GetRequest();
    if (!Array.isArray(projectMenu)) return;
    this.menuStore = projectMenu;
    if (id === 'index' || !projectMenu || projectMenu.length === 0) return;
    const targetMenu = projectMenu.find(item => item.code === id);
    if (!targetMenu) return this.$message.error('未找到对应菜单，请联系管理员');
    this.flatMenu = targetMenu.children as Array<EachAppMenu>;
    this.title = targetMenu.name;
  }

  @Watch('$route')
  routerListener() {
    const {id} = Utils.GetRequest(), {menuStore} = this;
    if (id === 'index') return this.title = '我的首页';
    const targetMenu = menuStore.find(item => item.code === id);
    if (targetMenu) {
      this.title = targetMenu.name;
      this.flatMenu = targetMenu.children as Array<EachAppMenu>;
    }
  }

  @Watch('$store.state.projectMenu')
  projectMenuListener(menuArr: Array<EachAppMenu>) {
    this.initProjectMenu(menuArr);
  }

  mounted() {
    const {id} = Utils.GetRequest(), {projectMenu} = this.$store.state;
    if (id === 'index') this.title = '我的首页';
    if (!id) this.$router.push({path: 'FlatMenu', query: {id: 'index'}})
    this.initProjectMenu(projectMenu);
  }

  render() {
    const {id} = Utils.GetRequest(), {
      renderWorkFlowMenu,
      generateMultilevelMenus,
      flatMenu,
      title
    } = this;
    return (
      <article class={Class.main}>
        <nav class={Class.title}>{title}</nav>
        <main class={Class.content}>
          {
            id === 'index' &&
            renderWorkFlowMenu()
            ||
            generateMultilevelMenus(flatMenu)
          }
        </main>
      </article>
    );
  }
}
