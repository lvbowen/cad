<template>
  <div class="class-library-define full-height flex flex-column">
    <div class="title">类库定义</div>
    <div class="content flex-1 flex">
      <div class="left full-height flex flex-column">
        <div class="criterion">
          <span>我选择的标准：</span>
          <a-select @change="changeCriterion" v-model="selectedCriterion">
            <a-select-option v-for="i in criterionList" :key="i.id">
              <a-icon :type="i.state===1?'check-circle':i.state===0?'file-exclamation':'file-excel'" :theme="i.state===1?'twoTone':i.state===0?'twoTone':'twoTone'" :twoToneColor="i.state===1?'#52c41a':i.state===0?'#1890ff':'#909399'"></a-icon>{{ i.criterionName }}
            </a-select-option>
          </a-select>
          <a-popover class="tip">
            <template slot="content">
              <div v-for="(i,index) in criterionState" :key="index">
                <a-icon
                  :type="i.type"
                  :theme="i.theme"
                  :twoToneColor="i.twoToneColor"
                  class="tip-text"/><b>{{ i.text }}</b><br/>
              </div>
            </template>
            <a-icon type="question-circle" theme="filled"></a-icon>
          </a-popover>
        </div>
        <div>
          <a-button type="primary" @click="importMount" v-show="isShowImportBtn">导入</a-button>
          <a-button type="primary" @click="exportCriterionTree" :disabled="!treeData.length">导出
          </a-button>
          <a-button type="primary" :disabled="!selectedCriterion" @click="addClassLibraryNode">新增
          </a-button>
        </div>
        <a-input-search
          placeholder="请输入关键词"
          v-model="keyWords"
          @pressEnter="enterSearch"
          @search="getClassLibraryTreeByName"></a-input-search>
        <a-popconfirm
          title="确定启用该标准？"
          :visible="visibleCriterionPop"
          @confirm="startUsing"
          @cancel="cancelUsing"></a-popconfirm>
        <a-spin class="flex-1 tree" tip="加载中..." :spinning="spinning">
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
            <template #title="{ key: treeKey, name }">
              <a-dropdown :trigger="['contextmenu']">
                <span v-if="name.indexOf(keyWords) > -1">
                  {{ name.substr(0, name.indexOf(keyWords)) }}
                  <span style="color: #f50">{{ keyWords }}</span>
                  {{ name.substr(name.indexOf(keyWords) + keyWords.length) }}
                </span>
                <span v-else>{{ name }}</span>
                <template #overlay>
                  <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey,name)">
                    <a-menu-item key="1">修改</a-menu-item>
                    <a-menu-item key="2">
                      <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteClassLibrary(treeKey)">
                        删除
                      </a-popconfirm>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </a-tree>
        </a-spin>
      </div>
      <div class="right full-height">
        <class-library-properties :classLibraryId="classlibraryId"/>
      </div>
    </div>
    <add-class-library-tree-modal
      :showClassLibraryTreeModal="showClassLibraryTreeModal"
      :classLibraryTitle="classLibraryTitle"
      :classLibraryName="classLibraryName"
      :classLibraryParentId="classLibraryParentId"
      :classLibraryId="classLibraryId"
      :classLibraryParentName="classLibraryParentName"
      :criterionId="selectedCriterion"
      @closeClassLibraryTreeModal="closeClassLibraryTreeModal"
      @ok="addSuccess"/>
    <a-modal
      :visible="showImportModal"
      title="导入类库分类树"
      class="import-library-modal"
      :maskClosable="false"
      :keyboard="false"
      :footer="null"
      @cancel="closeImportModal"
      destroyOnClose>
      为确保上传数据与类库树内容匹配，请先<a class="ex" @click="downloadTemplate">下载示例文件</a><br/><br/>
      上传本地文件：
      <a-popconfirm title="导入后将会覆盖原类库分类树，请确定！" @confirm="uploadFile">
        <a-button :loading="uploadLoading">点击上传</a-button>
      </a-popconfirm>
    </a-modal>
    <input
      class="file-input"
      ref="fileInput"
      type="file"
      accept="image/png, image/jpeg"
      @change="(e) => fileInput(e)"
    />
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/index';
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
import Dropdown from 'ant-design-vue/lib/dropdown';
import 'ant-design-vue/lib/dropdown/style/index.css';
import Menu from 'ant-design-vue/lib/menu';
import 'ant-design-vue/lib/menu/style/index.css';
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import {ClassLibraryTree, StandardClass, ProjectConfig} from "../../type";
import Utils from "../../utils";
import AddClassLibraryTreeModal from "./AddClassLibraryTreeModal.vue";
import ClassLibraryProperties from "./ClassLibraryProperties.vue";
import {
  getClassLibraryTree,
  deleteClassLibrary,
  importClassLibrary,
  getCriterionPage,
  addOrUpdateCriterionPro,
} from "../../service/classLibrary";
import { baseConfig } from "./config";

interface CriterionStatePro {
  type: string;
  theme: string;
  twoToneColor: string;
  text: string;
}

@Component({
  name: 'ClassLibraryDefine',
  components: {
    AddClassLibraryTreeModal,
    ClassLibraryProperties,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    AModal: Modal,
    APopconfirm: Popconfirm,
    AInputSearch: Input.Search,
    ASpin: Spin,
    ATree: Tree,
    AIcon: Icon,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    APopover: Popover
  }
})
export default class ClassLibraryDefine extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?: ProjectConfig
  //标准库
  criterionList: StandardClass[] = [];
  selectedCriterion: string = '';
  criterionState: CriterionStatePro[]= [];
  visibleCriterionPop: boolean = false;
  beforeSelectedCriterion: string = '';
  afterSelectedCriterion: string = '';

  startUsing() {
    this.visibleCriterionPop = false;
    this.selectedCriterion = this.afterSelectedCriterion;
    this.beforeSelectedCriterion = this.afterSelectedCriterion;
    this.addOrUpdateCriterion();
  }

  cancelUsing() {
    this.visibleCriterionPop = false;
    this.afterSelectedCriterion = '';
    this.selectedCriterion = this.beforeSelectedCriterion;
  }

  get isShowImportBtn() {
    let show = false;
    this.criterionList.map((item) => {
      if (item.id === this.selectedCriterion && item.criterionName === '默认标准') {
        show = true
      }
    })
    return show;
  }

  //获取标准库list
  getCriterionPage() {
    getCriterionPage({
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      this.criterionList = res.data ?? []
      for (let i = 0; i < this.criterionList.length; i++) {
        if (this.criterionList[i].state === 1) {
          this.selectedCriterion = this.criterionList[i].id;
          this.beforeSelectedCriterion = this.criterionList[i].id;
          this.getClassLibrary();
          break;
        }
      }
    })
  }

  changeCriterion(val: string,option) {
    this.classlibraryId = '';
    this.visibleCriterionPop = true;
    // this.selectedCriterion = '';
    this.afterSelectedCriterion = val;
    // this.selectedCriterion = val;
    // this.addOrUpdateCriterion();
  }

  //添加或者更新项目标准
  addOrUpdateCriterion() {
    addOrUpdateCriterionPro({
      criterionId: this.selectedCriterion,
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      this.getCriterionPage();
      // this.getClassLibrary();
    })
  }

  //tree
  treeKey: number = 0;
  treeData: ClassLibraryTree[] = [];
  replaceFields: any = {
    key: 'id',
    title: 'name',
    children: 'childs'
  };
  spinning: boolean = false;

  getClassLibrary() {
    this.treeData = [];
    this.menuTreeList = [];
    this.afterSelectedCriterion = '';
    if (!this.selectedCriterion) return
    this.spinning = true;
    getClassLibraryTree({
      criterionId: this.selectedCriterion,
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      if (!res.data) return
      this.treeData = res.data
      Utils.deepFind(this.treeData, (item) => {
        Object.assign(item, {scopedSlots: {title: "title", icon: 'icon'}, key: item.id});
        this.menuTreeList.push({key: item.id, title: item.name})
        return false;
      }, 'childs')
    }).finally(() => {
      this.spinning = false;
    })
  }

  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }

  clickTree(selectedKeys, e) {
    this.classlibraryId = '';
    this.classLibraryParentId = '';
    this.classLibraryParentName = '';
    if (selectedKeys.length) {
      this.classLibraryParentId = selectedKeys[0];
      this.classLibraryParentName = e.node.dataRef.name;
      this.classlibraryId = e.node.dataRef.id;
    }
  }

  onContextMenuClick(treeKey: string, menuKey: string, name: string) {
    // console.log(`treeKey: ${treeKey}, menuKey: ${menuKey}`);
    switch (menuKey) {
      case '1':
        this.classLibraryParentId = '';
        this.classLibraryParentName = '';
        this.classLibraryTitle = '编辑类库名称';
        this.showClassLibraryTreeModal = true;
        this.classLibraryName = name;
        this.classLibraryId = treeKey;
        Utils.deepFind(this.treeData, (item) => {
          if (item.id === treeKey) {
            this.classLibraryParentId = item.parentId;
            Utils.deepFind(this.treeData, (i) => {
              if (this.classLibraryParentId === i.id) {
                this.classLibraryParentName = i.name
              }
              return false
            }, 'childs')
          }
          return false
        }, 'childs')
        break;
      case '2':

        break;
    }
  }

  deleteClassLibrary(id: string) {
    deleteClassLibrary({
      classLibraryId: id,
      appCode: this.projectCode ?? '',
      projectName: this.projectConfig?.projectName ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
      this.$message.success('删除成功')
      this.getClassLibrary();
    })
  }

  addClassLibraryNode() {
    if (this.classLibraryTitle === '编辑类库名称') {
      Utils.deepFind(this.treeData, (item) => {
        if (item.id === this.classLibraryId) {
          this.classLibraryParentId = item.parentId;
          this.classLibraryParentName = item.name;
        }
        return false
      }, 'childs')
    }
    this.showClassLibraryTreeModal = true;
    this.classLibraryTitle = '新增类库名称'
  }

  //pro-table
  classlibraryId: string = '';

  //tree-search
  keyWords: string = '';
  autoExpandParent: boolean = true;
  menuTreeList: { title: string, key: string }[] = [];
  expandedKeys: string[] = [];

  //tree-search
  enterSearch(e) {
    this.keyWords = e.target._value;
    this.getClassLibraryTreeByName(this.keyWords);
  }

  getClassLibraryTreeByName(value: string) {
    const expandedKeys = this.menuTreeList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return Utils.getTreeParentKey<any>(this.treeData, 'childs', 'id', item.key);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    //@ts-ignore
    Object.assign(this, {
      expandedKeys: expandedKeys,
      keyWords: value,
      autoExpandParent: true
    });
  }

  //import
  showImportModal: boolean = false;
  uploadLoading: boolean = false;

  importMount() {
    if (!this.selectedCriterion) {
      return this.$message.warning('请先选择标准！')
    }
    this.showImportModal = true
  }

  downloadTemplate() {
    window.open('/api/api/deliveryLibrary/importClasslibraryTemplate')
  }

  uploadFile() {
    const {$refs} = this;
    if ($refs.fileInput) {
      ($refs.fileInput as HTMLInputElement).click();
    }
  }

  fileInput(e) {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (["xlsx", "xls"].indexOf(fileFormat) === -1)
        return this.$message.error("请上传Excel文件!");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("criterionId", this.selectedCriterion as string);
      formData.append('appCode', this.projectCode ?? '');
      formData.append('projectName', this.projectConfig?.projectName ?? '')
      this.uploadLoading = true;
      importClassLibrary(formData).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
        this.$message.success('导入成功！')
        this.getClassLibrary();
        this.showImportModal = false;
      }).finally(() => {
        this.uploadLoading = false;
      })
    }
  }

  closeImportModal() {
    this.showImportModal = false
  }

  //export
  exportCriterionTree() {
    if (!this.treeData.length) {
      return this.$message.warning('暂无可导出的数据！')
    }
    window.open(`/api/api/deliveryLibrary/exportClasslibraryTree?appCode=${this.projectCode ?? ''}&projectName=${this.projectConfig?.projectName ?? ''}&criterionId=${this.selectedCriterion}`)
  }

  //classlibraryTreeModal
  showClassLibraryTreeModal: boolean = false;
  classLibraryTitle: string = '';
  classLibraryName: string = '';
  classLibraryParentId: string = '';
  classLibraryParentName: string = '';
  classLibraryId: string = '';

  //classlibraryTreeModal
  closeClassLibraryTreeModal() {
    // console.log(this.classLibraryTitle,'111')
    this.showClassLibraryTreeModal = false;
    this.classLibraryParentId = '';
    this.classLibraryParentName = '';
    this.classLibraryName = '';
    this.classLibraryId = '';
  }

  addSuccess() {
    this.closeClassLibraryTreeModal();
    this.getClassLibrary();
  }

  mounted() {
    //api-标准库列表,当前项目选择标准库
    this.getCriterionPage();
    this.criterionState = baseConfig.criterionState as CriterionStatePro[]
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';

.class-library-define {
  .title {
    font-size: 17px;
    font-weight: bold;
    margin-bottom: @spacing-base;
  }

  .content {
    @base-bg-color: #ffffff;

    .left {
      background-color: @base-bg-color;
      width: 25%;
      padding: @spacing-medium @spacing-base;

      .criterion {
        margin-bottom: @spacing-medium;

        > span {
          color: #bfbfbf;
        }

        .ant-select {
          min-width: 200px;
          margin-right: @spacing-medium;
        }
      }

      .ant-input-search {
        margin-top: @spacing-base;
      }

      .tree {
        /deep/ .ant-spin-container {
          .full-height;
          overflow: auto;
        }
      }
    }

    .right {
      background-color: @base-bg-color;
      margin-left: @spacing-base;
      width: calc(75% - @spacing-base);
      padding: @spacing-base;
    }
  }

  .ant-btn {
    margin-right: @spacing-base;
  }

  .file-input {
    display: none;
  }
}
.ant-popover-inner-content {
  .tip-text {
    margin-right: @spacing-base;
  }
}
</style>
