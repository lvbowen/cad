<template>
  <div class="system-config full-height flex flex-column">
    <div class="title" img-role="logo">
      <span> 系统设置 </span>
    </div>
    <div class="content_sys flex-1">
      <a-card title="设置分类" class="tree full-height flex flex-column">
        <a-input-search
          style="margin-bottom: 8px"
          placeholder="请输入关键字"
          @pressEnter="EnterSearchOne"
          @search="onSearchOne"/>
        <a-tree
          :key="num"
          :treeData="treeData"
          :defaultExpandAll="true"
          :replaceFields="replaceFields"
          @select="selectNode"
        >
          <template slot="title" slot-scope="title">
            <span v-if="title.title.indexOf(searchValue) > -1">
              {{ title.title.substr(0, title.title.indexOf(searchValue)) }}
              <span style="color: #f50">{{ searchValue }}</span>
              {{ title.title.substr(title.title.indexOf(searchValue) + searchValue.length) }}
            </span>
            <span v-else>{{ title.title }}</span>
          </template>
        </a-tree>
      </a-card>
      <a-card :title="curTitle" class="is full-height flex-column">
        <a-radio-group
          v-if="curTitle.indexOf('监控')>-1&&String(videoType)"
          slot="extra"
          :value="videoType"
          :options="[{ label: '萤石云', value: 0 },{ label: '青柿', value: 1 }]"
          @change="chooseVideoType"/>
        <component :is="curModule"/>
      </a-card>
    </div>
    <application-list class="divide    "/>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import ProjectStructureConfig from "./ProjectStructureConfig/ProjectStructureConfig.vue";
import LoginConfig from "./LoginConfig/LoginConfig.vue";
import BusinessPlatformConfig from "./BusinessPlatformConfig/BusinessPlatformConfig.vue";
import BIMPlatformConfig from "./BIMPlatformConfig/BIMPlatformConfig.vue";
import BIMContentConfig from "./BIMContentConfig/BIMContentConfig.vue";
import ManageHelpDoc from './HelpDocument/Document.vue';
import DataCenter from './DataConter/DataCenter.vue';
import DataDictionary from "./DataDictionary/DataDictionary.vue";
import MonitoringCenter from "./MonitoringCenter/MonitoringCenter.vue";
import QingMonitor from "./MonitoringCenter/QingMonitor.vue"
import IconsConfig from './IconsConfig/IconsConfig.vue';
import DepartmentConfig from './DepartmentConfig/DepartmentConfig.vue';
import PlatformConfig from "./PlatformConfig/PlatformConfig.vue"
import EngineeringArchivesConfig from "./EngineeringArchivesConfig/EngineeringArchivesConfig.vue"
import config from './publicConfig';
import {TableColumn} from "../../type";
import ApplicationList from "@cloudpivot/list/src/components/pc/application-list.vue";
import * as Api from "../../service/api";

@Component({
  name: 'SystemConfig',
  components: {
    ATree: Tree,
    ACard: Card,
    AInputSearch: Input.Search,
    ApplicationList
  }
})
export default class SystemConfig extends Vue {
  @InjectReactive('project') projectCode!: string;
  treeData: TableColumn<any>[] = [];
  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'title', key: 'id'
  }
  curModule: any = ProjectStructureConfig;
  curTitle: string = '项目架构配置';
  dataList: Array<{ [propsName: string]: string }> = [];
  searchValue: string = '';
  num: number = 0;
  videoType: number|null = null;

  chooseVideoType(e) {
    this.videoType = e.target.value;
    this.changeVideoTypeQingVideo(this.videoType===null?0:this.videoType)
    if (this.videoType === 1) {
      this.curModule = QingMonitor;
    } else {
      this.curModule = MonitoringCenter;
    }
  }

  changeVideoTypeQingVideo(type: number) {
    Api.changeVideoTypeQingVideo({appCode: this.projectCode ?? '', type: type}).then(res => {
      if (res.errcode !== 0 || !res.data) return this.$message.warn(res.errmsg as string);
    })
  }

  getVideoTypeQingVideo() {
    Api.getVideoTypeQingVideo({appCode: this.projectCode ?? ''}).then(res => {
      console.log('getVideoTypeQingVideo', res);
      if (res.errcode !== 0) return;
      this.videoType = res.data ?? 0;
      if (this.videoType === 1) {
        this.curModule = QingMonitor;
      } else {
        this.curModule = MonitoringCenter;
      }
    })
  }

  Search(value) {
    const expandedKeys = this.dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.id, this.treeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    //@ts-ignore
    Object.assign(this, {
      searchValue: value
    });
  }

  //左侧树回车搜索
  EnterSearchOne(e) {
    const value = e.target.value;
    this.Search(value)
  }

  //左侧树点击搜索
  onSearchOne(value) {
    this.Search(value)
  }

  generateList(data) {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.title;
      this.dataList.push({key: node.id, title: key});
      if (node.children) {
        this.generateList(node.children);
      }
    }
  }

  getParentKey(key, tree) {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.id === key)) {
          parentKey = node.id;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  }

  toprev() {
    //@ts-ignore
    this.$router.go(-1);
  }

  selectNode(selectedKeys, e) {
    this.curTitle = e.node.dataRef.title;
    switch (selectedKeys[0]) {
      case '2':
        this.curModule = ProjectStructureConfig;
        break;
      case '3':
        this.curModule = LoginConfig;
        break;
      case '4':
        this.curModule = DataCenter;
        break;
      case '5':
        this.getVideoTypeQingVideo()

        break;
      case '7':
        this.curModule = BusinessPlatformConfig;
        break;
      case '8':
        this.curModule = BIMPlatformConfig;
        break;
      case '10':
        this.curModule = DataDictionary;
        break;
      case '11':
        this.curModule = BIMContentConfig;
        break;
      case '12':
        this.curModule = ManageHelpDoc;
        break;
      case '13':
        this.curModule = IconsConfig;
        break;
      case '14':
        this.curModule = DepartmentConfig;
        break;
      case '15':
        this.curModule = PlatformConfig;
        break;
      case '16':
        this.curModule = EngineeringArchivesConfig;
        break;
      default:
        break;
    }
  }

  disableTreeArrFilter(arr, attChildren = 'children') {
    arr.map((item) => {
      if (item[attChildren] && item[attChildren].length) {
        item.disabled = true;
        this.disableTreeArrFilter(item[attChildren], attChildren);
      }
    });
  }

  mounted() {
    this.treeData = config.sysTreeConfig as TableColumn<any>[];
    this.disableTreeArrFilter(this.treeData, 'children');
    this.num++;
  }

}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';

.system-config {
  .title {
    font-size: 17px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .content_sys {
    display: flex;

    /deep/ .ant-card-body {
      display: flex;
      flex-direction: column;
      overflow: auto;
      flex: 1;
    }

    .tree {
      width: 18%;
      margin-right: @spacing-large;
    }

    .is {
      width: calc(82% - @spacing-large);
    }
  }

  .divide {
    position: absolute;
    left: -9999px;
  }
}
</style>
