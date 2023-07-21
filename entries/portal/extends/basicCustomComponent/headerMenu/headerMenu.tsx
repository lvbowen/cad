import {Component, InjectReactive, Vue,} from 'vue-property-decorator';
import Class from './headerMenu.module.less';

import * as Type from '../../type';
import {ProjectLevel} from '../../constant';

import Icon from "../icon/icon";

import {Cockpit, CockPitConfig} from '../../config/config';

import OAuthApi from "@/apis/oauth";

@Component({
  name: 'HeaderMenu'
})
export default class HeaderMenu extends Vue {
  @InjectReactive('project') projectCode?: string;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  get isChinese() {
    return this.$i18n.locale === 'zh';
  }

  go2page(routerName: string): void {
    const {projectConfig} = this;
    if (projectConfig?.projectLevel === ProjectLevel['项目'] && routerName === 'BIMView') {
      OAuthApi.getProjectInfo({
        appCode: this.projectCode,
        projectName: projectConfig?.projectName as string,
      }).then(res => {
        if (res.errcode === 0) return this.$router.push({name: 'BIMPlatform', query: res.data});
      })
    } else if(routerName === "DataHome"){
      const { href } = this.$router.resolve({
        name: routerName
      });
      // window.open(href, '_blank');
      this.isDingTalk?this.$router.push({name: 'DataHome'}):window.open(href, '_blank');
    }else if (!projectConfig?.multiProjectFlag) {
      this.getProjectInfo()
    } else {
      if (routerName == "DataHome") {
        const { href } = this.$router.resolve({
          name: routerName
        });
        this.isDingTalk?this.$router.push({name: 'DataHome'}):window.open(href, '_blank');
      } else {
        this.$router.push({name: routerName}).catch((err: any) => {
          err
        });
      }
    }
  }

  getProjectInfo() {
    const {projectConfig} = this;
    if (!projectConfig?.multiProjectFlag) {
      this.$router.push({name: 'BIMView'});
    } else {
      OAuthApi.getProjectInfo({
        appCode: this.projectCode,
        projectName: projectConfig?.projectName as string,
      }).then(res => {
        if (res.errcode === 0) return this.$router.push({name: 'BIMPlatform', query: res.data});
      })
    }
  }

  renderCurrentMenu(routeName: string | undefined): JSX.Element | Array<JSX.Element> {
    const vDom: Array<JSX.Element> = [], {projectConfig} = this;
    if (!routeName) return vDom;
    const copyMap: Map<number, Cockpit> = new Map(CockPitConfig);
    copyMap.forEach((item) => {
      //window.Environment.levelName
      if (projectConfig?.projectLevel === ProjectLevel['集团']) {
        if (window.projectRoute !== 'undefined' && item.name === '管理平台') return;
        // if (window.projectRoute !== 'undefined' && item.name === '业务平台') return;
        if (window.projectRoute !== 'undefined' && item.name === '监控中心') return;
      } else if (projectConfig?.projectLevel === ProjectLevel['公司']) {
        if (window.projectRoute !== 'undefined' && item.name === '管理平台') return;
        // if (window.projectRoute !== 'undefined' && item.name === '业务平台') return;
        if (window.projectRoute !== 'undefined' && item.name === '监控中心') return;
      } else if (projectConfig?.projectLevel === ProjectLevel['项目']) {
        if (window.projectRoute !== 'undefined' && item.name === '管理平台') return;
        if (window.projectRoute !== 'undefined' && item.name === '信息门户') return;
        if (window.projectRoute !== 'undefined' && item.name === '监控中心') return;
        if (window.projectRoute !== 'undefined' && item.name === '企业图书馆') return;
      } else {
        if (window.projectRoute !== 'undefined' && item.name === '管理平台') return;
        if (window.projectRoute !== 'undefined' && item.name === '业务平台') return;
        if (window.projectRoute !== 'undefined' && item.name === '监控中心') return;
        if (window.projectRoute !== 'undefined' && item.name === '企业门户') return;
        if (window.projectRoute !== 'undefined' && item.name === 'BIM平台') return;
        if (window.projectRoute !== 'undefined' && item.name === '企业图书馆') return;
      }


      vDom.push(
        <div class={`${(sessionStorage.getItem("BgColor") == "Blue"? Class.blueHover:sessionStorage.getItem("BgColor") == "Green"? Class.Green: Class.TecBlue)}`}>
          <div class={`${item.routeName === routeName && (sessionStorage.getItem("BgColor") == "Blue"? Class.activeMenu: sessionStorage.getItem("BgColor") == "Green"? Class.GreenActive:Class.TecBlueActive)}`} onClick={() => {
            this.go2page(item.routeName)
          }}>
            <Icon src={item.iconName as string} className={Class.icon} />
            <span class={`${sessionStorage.getItem("BgColor") == "Blue"? "":sessionStorage.getItem("BgColor") == "Green"?  Class.greenHover : ''}`} >{item.name}</span>
            {
              item.routeName === routeName && sessionStorage.getItem("BgColor") == "Green" && <img class={Class.iconImg} alt="" />
            }
          </div>
        </div>
      )
    })
    return vDom;
  }

  render() {
    const {go2page, renderCurrentMenu, $route} = this;
    return (
      <div class={Class.main}>
        <aside class={Class.dynamicHeader}>
          {renderCurrentMenu(($route.name as string))}
        </aside>
      </div>
    )

  }
}
