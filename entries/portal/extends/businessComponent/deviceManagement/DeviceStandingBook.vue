<template>
  <div class="device-standing-book flex full-height">
    <a-card title="设备类型" class="device-type full-height flex flex-column">
      <a-input-search
        placeholder="请输入关键词"
        v-model="searchValue"
        @pressEnter="enterSearch"
        @search="searchByName"></a-input-search>
      <a-spin tip="加载中..." :spinning="spinning">
        <a-tree
          :defaultExpandedKeys="defaultExpandedKeys"
          :key="num"
          :loadedKeys="loadedKeys"
          :loadData="onLoadDataPro"
          :treeData="treeDataPro"
          :replaceFields="replaceFields"
          @select="treeProSelect"
        >
          <template slot="title" slot-scope="{ taskName }">
            <span v-if="taskName.indexOf(searchValue) > -1">
              {{ taskName.substr(0, taskName.indexOf(searchValue)) }}
              <span style="color: #f50">{{ searchValue }}</span>
              {{
                taskName.substr(
                  taskName.indexOf(searchValue) + searchValue.length
                )
              }}
            </span>
            <span v-else>{{ taskName }}</span>
          </template>
        </a-tree>
      </a-spin>
    </a-card>
    <a-card title="设备列表" class="ref-list full-height flex flex-column">
      <device-list :selectDeviceTypeId="selectDeviceTypeId" :codeValue="codeValue" :codeId="codeId"></device-list>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';

import {ClassLibraryTree, ProjectConfig} from "../../type";
import Utils from "../../utils";
import { exampleData } from "../engineeringArchives/mock";
import DeviceList from "./DeviceList.vue";
import { listApi } from "@cloudpivot/api";
import {treeArrFilter} from "@cloudpivot/form/utils";

@Component({
  name: 'DeviceStandingBook',
  components: {
    ACard: Card,
    AInputSearch: Input.Search,
    ASpin: Spin,
    ATree: Tree,
    AIcon: Icon,
    DeviceList
  }
})
export default class DeviceStandingBook extends Vue {
  @InjectReactive('project') projectCode!:string;
  @InjectReactive('projectConfig') projectConfig!: ProjectConfig;
  //tree
  treeDataPro: Array<any> = [];
  replaceFields = {
    key: "id",
    title: "nodeName"
  };
  defaultExpandedKeys: Array<string> = [];
  loadedKeys: Array<string> = [];
  num: number = 0;
  spinning: boolean = false;
  dataList: Array<{ [propsName: string]: string }> = [];
  getDicTree() {
    // @ts-ignore
    listApi.getListTreeV2({
      appCode: this.projectCode??'',
      schemaCode: `${this.projectCode}_device_info`,
      projectName: this.projectConfig?.projectName ?? '',
      currentId: '',
      multiProjectFlag: true
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(res.errcode === 0) {
        this.treeDataPro = res?.data.nodes;
        if(this.treeDataPro && this.treeDataPro[0]) {
          //@ts-ignore
          this.dicNodeName = this.treeDataPro[0].nodeName
        }
        this.defaultExpandedKeys = treeArrFilter(this.treeDataPro,'children','children',(obj:{children:any[]})=> {
          return obj['children'] && obj['children'].length
        });
        this.loadedKeys = treeArrFilter(this.treeDataPro,'children','children',(obj:{children:any[],childCount:number})=> {
          return obj['children'] && !obj['children'].length && !obj['childCount']
        })
        ++this.num;
      }
    })
  }
  onLoadDataPro( treeNode ) {
    this.loadedKeys.push(treeNode.$vnode.data.key);
    return new Promise( resolve => {
      if ( treeNode.dataRef.children != undefined && treeNode.dataRef.children != null && treeNode.dataRef.children.length != 0 ) {
        // 有值了直接渲染
        resolve( {} );
        return;
      }
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      // @ts-ignore
      listApi.getListTreeV2( {
        appCode: this.projectCode??'',
        schemaCode: `${this.projectCode}_device_info`,
        projectName: this.projectConfig?.projectName ?? '',
        currentId: treeNode.$vnode.data.key,
        multiProjectFlag: true
      } )
        .then( res => {
          treeNode.dataRef.children = res.data.nodes;
          this.treeDataPro = [ ...this.treeDataPro ];
        } );
      resolve( {} );
    } );
  }
  treeProSelect(selectedKeys, e ) {
    if(selectedKeys.length) {
      this.selectDeviceTypeId = selectedKeys[0];
      this.codeValue = e.selectedNodes[0].data.props.dataRef.codeValue;
      this.codeId = selectedKeys[0];
    }else{
      this.selectDeviceTypeId = '';
      this.codeValue = '';
      this.codeId = ''
    }
  }

  //tree-search
  searchValue: string = '';
  enterSearch(e) {
    this.searchValue = e.target._value;
    this.searchByName(this.searchValue);
  }
  searchByName(val:string) {
    if(val) {
      listApi.getListTreeByName({
        appCode: this.projectCode,
        projectName: this.projectConfig?.projectName?? '',
        schemaCode: `${this.projectCode}_device_info`,
        codeName: val,
        multiProjectFlag: this.projectConfig?.multiProjectFlag??false
      }).then(res => {
        if(res.errcode === 0) {
          // @ts-ignore
          this.treeDataPro = res.data && res.data?.tree??[];
          this.generateList(res?.data);
          Object.assign(this, {
            searchValue: val,
            autoExpandParent: true,
          });
        }
      })
    }else  {
      this.getDicTree();
    }
  }
  generateList(data) {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.name;
      this.dataList.push({key: node.id, title: key});
      if (node.childs) {
        this.generateList(node.childs);
      }
    }
  }
  //device-list
  selectDeviceTypeId: string = '';
  codeValue: string = '';
  codeId: string = '';

  mounted() {
    // this.treeData = exampleData.response.data.deviceStandingBook as ClassLibraryTree[];
    this.getDicTree();
    // Utils.deepFind(this.treeData,(item)=> {
    //   Object.assign(item,{key:item.id});
    //   return false;
    // },'childs')
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
.device-standing-book {
  .device-type {
    width: 25%;
    /deep/ .ant-card-body {
      .flex-1;
      .flex;
      .flex-column;
      .ant-spin-nested-loading {
        .flex-auto;
        overflow: auto;
      }
    }
  }
  .ref-list {
    margin-left: @spacing-large;
    width: calc(75% - @spacing-large);
    /deep/ .ant-card-body {
      .flex-1;
      .flex;
      .flex-column;
    }
  }
}
</style>
