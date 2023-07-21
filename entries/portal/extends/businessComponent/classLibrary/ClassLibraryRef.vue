<template>
  <div class="class-library-ref flex full-height">
    <a-card title="类库目录" class="menu full-height flex flex-column">
      <a-input-search
        placeholder="请输入关键词"
        v-model="keyWords"
        @pressEnter="enterSearch"
        @search="getClassLibraryTreeByName"></a-input-search>
      <a-spin tip="加载中..." :spinning="spinning">
        <a-tree
          :key="treeKey"
          :autoExpandParent="autoExpandParent"
          :treeData="treeData"
          showIcon
          ref="treeRef"
          :expandedKeys="expandedKeys"
          @expand="onExpand"
          @select="clickTree"
          :replaceFields="replaceFields"
        >
          <a-icon slot="icon" type="folder-open" theme="filled"></a-icon>
          <template v-slot:title="title">
            <span v-if="title.name.indexOf(keyWords) > -1">
              {{ title.name.substr(0, title.name.indexOf(keyWords)) }}
              <span style="color: #f50">{{ keyWords }}</span>
              {{ title.name.substr(title.name.indexOf(keyWords) + keyWords.length) }}
            </span>
            <span v-else>{{ title.name }}</span>
          </template>
        </a-tree>
      </a-spin>
    </a-card>
    <a-card title="关联模型列表" class="ref-list full-height flex flex-column">
      <ref-modal-list :classLibraryId="classLibraryId"/>
    </a-card>
  </div>
</template>

<script lang="ts">
import {Vue, Component,InjectReactive} from 'vue-property-decorator';
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Popconfirm from "ant-design-vue/lib/popconfirm";
import 'ant-design-vue/lib/popconfirm/style/index';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Utils from "../../utils";
import {ClassLibraryTree,ProjectConfig} from "../../type";
import {getClassLibraryTree,getCriterionPage} from "../../service/classLibrary";
import RefModalList from "./RefModelList.vue";
@Component({
  name: 'ClassLibraryRef',
  components: {
    ACard: Card,
    AButton: Button,
    AModal: Modal,
    APopconfirm: Popconfirm,
    AInputSearch: Input.Search,
    ASpin: Spin,
    ATree: Tree,
    AIcon: Icon,
    RefModalList
  }
})
export default class ClassLibraryRef extends Vue {
  @InjectReactive('project') projectCode!:string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig;
  selectedCriterion: string = '';
  //tree
  treeKey: number = 0;
  treeData: ClassLibraryTree[] = [];
  replaceFields: any = {
    key: 'id',
    title: 'name',
    children: 'childs'
  };
  spinning: boolean = false;
  onExpand( expandedKeys ) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }
  clickTree(selectedKeys, e ) {
    this.classLibraryId = '';
    if(selectedKeys.length) {
      if(!e.node.dataRef.childs || !e.node.dataRef.childs.length) {
        this.classLibraryId = selectedKeys[0]
      }else {
        this.$message.warning('仅对叶子节点进行模型关联！')
      }
    }
  }
  //tree-search
  keyWords: string = '';
  autoExpandParent: boolean = true;
  menuTreeList:{title:string,key:string}[] = [];
  expandedKeys: string[] = [];
  enterSearch(e) {
    this.keyWords = e.target._value;
    this.getClassLibraryTreeByName(this.keyWords);
  }
  getClassLibraryTreeByName(value:string) {
    const expandedKeys = this.menuTreeList
      .map( item => {
        if ( item.title.indexOf( value ) > -1 ) {
          return Utils.getTreeParentKey<any>(this.treeData,'childs','id',item.key );
        }
        return null;
      } )
      .filter( ( item, i, self ) => item && self.indexOf( item ) === i );
    //@ts-ignore
    Object.assign( this, {
      expandedKeys: expandedKeys,
      keyWords: value,
      autoExpandParent: true
    } );
  }
  //modal-list
  classLibraryId: string = '';

  getClassLibrary() {
    this.treeData = [];
    this.menuTreeList = [];
    this.spinning = true;
    getClassLibraryTree({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      criterionId: this.selectedCriterion
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      this.treeData = res.data
      Utils.deepFind(this.treeData,(item)=> {
        Object.assign(item,{scopedSlots: {title: 'title',icon: 'icon'},key:item.id});
        this.menuTreeList.push({key:item.id,title:item.name})
        return false;
      },'childs')
    }).finally(()=> {
      this.spinning = false;
    })
  }
  getCriterionPage() {
    getCriterionPage({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) {return }
      for (let i = 0; i < res.data.length; i++) {
        if( res.data[i].state === 1) {
          this.selectedCriterion =  res.data[i].id;
          this.getClassLibrary();
          break;
        }
      }
    })
  }
  mounted() {
    this.getCriterionPage();
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
.class-library-ref {
  .menu {
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
