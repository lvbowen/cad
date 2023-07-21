import {Component, InjectReactive, Ref, Vue, Watch} from 'vue-property-decorator';
import Class from './BIM.module.less';
import {LayerStandardData} from "../../type";
import {bimLoad} from '../../icon';
import {
  getProjectTree
} from "../../service/api";

import {Carousel, Tree} from '@h3/antd-vue';

import ProjectSelection from "../../basicCustomComponent/projectSelection/ProjectSelection";
import InfoBox from "../../basicCustomComponent/infoBox.vue";
import env from "@/config/env";
import * as Type from "../../type";
import { Toast} from 'vant';

@Component({
  name: 'bim',
  components: {
    Carousel,
    ProjectSelection,
    InfoBox,
    Tree
  }
})
export default class BIM extends Vue {

  @InjectReactive('project') projectCode?: string;

  @InjectReactive('layerData') layerSources?: Array<LayerStandardData>;

  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  @InjectReactive('bimUrl') BIMURL?: string;

  @Ref() superMap?: HTMLIFrameElement;

  @Ref() container?: HTMLElement;
  private mapReady: boolean = false;

  private showBuildInfo: boolean = false;

  private initChoseProject: boolean = false;

  private hasInit: boolean = false;

  private treeData: Array<{ [propsName: string]: string }> = [];

  private defaultSelectedKeys: Array<string> = [];

  private markNum: number = 0;
  private projectId: string = '';
  private projectName: string = '';
  private smId: string = '';
  private LAYERNAME: string = '';

  get mapNdLayerSourcesReady() {
    return {
      state: !!(this.layerSources && this.mapReady),
      target: this.superMap?.contentWindow,
      data: this.layerSources
    };
  }

  @Watch('mapNdLayerSourcesReady', {immediate: true})
  readyStateListener(res: { state: boolean, target: WindowProxy, data: Array<LayerStandardData> }) {
    const {change3Dserver} = this;
    switch (res.state) {
      case true:
        // this.showBuildInfo = true;
        return;
      case false:
        return;
      default:
        return;
    }
  }

  private change3DServerAdapter(resourcesList: LayerStandardData) {
    const {projectCode} = this;
    return {
      list: {
        url: `${env.apiHost}/api/runtime/query/list`,
        params: {
          filters: [
            {
              propertyCode: "owner_project",
              propertyType: 0,
              propertyValue: resourcesList.ownerProject,
              propertyValueName: ""
            }
          ],
          customized: this.projectConfig?.multiProjectFlag ? true : false,
          mobile: false,
          queryCode: `${projectCode}_model_config`,
          schemaCode: `${projectCode}_model_config`,
          page: 0,
          size: 99999
        }
      },
      datasource: {
        url: `${env.apiHost}/api/runtime/form/load`,
        params: {
          schemaCode: `${projectCode}_model_config`,
          objectId: "",
          sheetCode: `${projectCode}_model_config`,
        }
      },
      token: localStorage.getItem('token')
    }
  }

  private change3Dserver(resourcesList: LayerStandardData) {
    const adapter = this.change3DServerAdapter(resourcesList);
    return {
      methodName: 'change3Dserver',
      //data: [ resourcesList ]
      data: adapter
    }
  }

  private mapListener(ev) {
    if (ev.data.feature) {
      this.LAYERNAME = ev.data.feature.layerName;
      this.smId = ev.data.feature.ids[0];
      // this.showBuildInfo = true;
    } else if (ev.data.globeViewer && !this.hasInit) {
      this.mapReady = ev.data.globeViewer;
      this.hasInit = true;
    }
  }

  private choseProject(Pkid: string) {
    const {change3Dserver, mapNdLayerSourcesReady} = this;
    mapNdLayerSourcesReady.target?.postMessage(change3Dserver(this.layerSources?.find(item => item.Pkid === Pkid) as LayerStandardData), '*');
    this.showBuildInfo = false;
    this.initChoseProject = true;
  }

  private onSelect(val,selectedNodes) {
    const temptKey = selectedNodes.node.dataRef;
    this.showBuildInfo = false;
    const {choseProject} = this;
    if (JSON.stringify(temptKey) !== '{}') {
      this.defaultSelectedKeys[0] = temptKey.id;
      this.projectName = temptKey.title;
      this.projectId = temptKey.id;
      let isFind:boolean=false;
      this.layerSources?.forEach(function (e) {
        if (e.ownerProject === temptKey.title) {
          isFind=true;
          return choseProject(e.Pkid)
        }
      })
      if(!isFind) return Toast.fail('暂无相关模型')
    }
  }


  private getTreeData() {
    this.treeData.length = 0;
    this.defaultSelectedKeys.length = 0;
    getProjectTree({
      appCode: this.projectCode as string
    }).then(res => {
      if (res.errcode === 0) {
        //@ts-ignore
        this.treeData = res.data;
        const obj: object = {
          node: {
            dataRef: {
              title: "",
              id: ""
            }
          }
        }
        //@ts-ignore
        if(res.data[0].children.length == 0){
          //@ts-ignore
          obj.node.dataRef.id = res.data[0].id
          //@ts-ignore
          obj.node.dataRef.title = res.data[0].title
          setTimeout(() => {
            this.onSelect("",obj)
          }, 3000);
        }else {
          //@ts-ignore
          res.data[0].children.forEach(e => {
            if(e.title == this.projectConfig?.projectName) {
              //@ts-ignore
              obj.node.dataRef.id = e.id
              //@ts-ignore
              obj.node.dataRef.title = e.title
              setTimeout(() => {
                this.onSelect("",obj)
              }, 3000);
            }
          });
        }
        if (this.treeData.length > 0) {
          this.markNum += 1;
        }
      }
    })
  }

  private onTitleClick() {
    this.initChoseProject = false;
    this.showBuildInfo = !this.showBuildInfo;
  }

  mounted() {
    const {mapListener} = this;
    this.projectName = this.projectConfig?.projectName as string
    this.getTreeData();
    window.addEventListener('message', ev => mapListener(ev));
  }

  beforeDestroy() {
    const {mapListener} = this;
    window.removeEventListener('message', mapListener);
  }

  render() {
    const {
      projectCode,
      projectId,
      projectName,
      smId,
      LAYERNAME,
      showBuildInfo,
      mapNdLayerSourcesReady,
      initChoseProject,
      defaultSelectedKeys,
      treeData,
      onSelect,
      onTitleClick,
      markNum,
      BIMURL
    } = this;
    return (
      <article ref={'container'} class={Class.main}>
        <nav class={Class.bimNav} onClick={onTitleClick}>BIM模型</nav>
        <div class={`${Class.bimLoad} ${mapNdLayerSourcesReady.state && Class.closeLoading}`}
             domPropsInnerHTML={bimLoad}/>
        <iframe
          ref={'superMap'}
          src={BIMURL}
        />
        <div class={`${Class.buildInfoMask} ${showBuildInfo && Class.showMask}`}
             onClick={() => this.showBuildInfo = false}/>
        <div class={`${Class.buildInfoCard} ${showBuildInfo && Class.infoCardShow}`}>
          {
            !initChoseProject &&
            <tree
              key={markNum}
              treeData={treeData}
              defaultSelectedKeys={defaultSelectedKeys}
              defaultExpandAll={true}
              onSelect={onSelect}/>
            ||
            <infoBox
              projectCode={projectCode}
              projectId={projectId}
              projectName={projectName}
              smId={smId}
              layerName={LAYERNAME}/>
          }
        </div>
      </article>
    );
  }
}
