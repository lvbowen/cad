<template>
  <div class="manage-user-manual">
    <a-card>
      <div class="title">
        <!--        <img src="../../../src/assets/extends/icon/icon.png" alt="" @click="toprev"/>-->
        <span> {{ ['systemConfig','ManageHelpDoc'].includes($route.name) ? '管理帮助文档' : '帮助文档' }}</span>
        <a-button
          type="primary"
          class="save-btn"
          v-if="['systemConfig','ManageHelpDoc'].includes($route.name) "
          @click="saveRichText">保存</a-button>
      </div>
      <a-row :gutter="8" class="content">
        <a-col :span="leftwidth" class="full-height">
          <a-card
            title="导航目录"
            class="full-height"
            size="small"
            @contextmenu.prevent="isClickBlank ? show($event) : null">
            <a-button
              v-if="['systemConfig','ManageHelpDoc'].includes($route.name) "
              slot="extra"
              type="primary"
              ref="add"
              @click="menuClick({key:'添加',keyPath:'新增根节点'})">+根目录</a-button>
            <a-input-search style="margin-bottom: 8px" placeholder="请输入关键字" @change="onChange"/>
            <a-tree
              :key="markNum"
              :autoExpandParent="autoExpandParent"
              :treeData="treeData"
              showIcon
              ref="treeRef"
              :expandedKeys="expandedKeys"
              :defaultSelectedKeys = "[fileDirectoryId]"
              @expand="onExpand"
              @select="clickTree"
              @rightClick="rightClick"
              :replaceFields="replaceFields"
            >
              <template slot="title" slot-scope="title">
                <span v-if="title.manualName.indexOf(searchValue) > -1">
                  {{ title.manualName.substr(0, title.manualName.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{ title.manualName.substr(title.manualName.indexOf(searchValue) + searchValue.length) }}
                </span>
                <span v-else>{{ title.manualName }}</span>
              </template>
              <template
                v-for="value in iconOptions"
                :slot="value.id"
                slot-scope="record">
                <img
                  :src="bimURL+value.url"
                  :key="value.id"
                  style="height: 15px;width: 15px"
                />
              </template>
            </a-tree>
            <a-menu :style="menuStyle" v-if="menuVisible&&isEdit" @click="menuClick">
              <a-menu-item key="添加">
                <a-icon type="plus-circle"/>
                添加
              </a-menu-item>
              <!-- p判断有没有pid（父节点），无父节点不可操作-->
              <a-menu-item key="删除" v-show="!isClickBlank">
                <a-icon type="close-circle"/>
                删除
              </a-menu-item>
              <!--控修改权限-->
              <a-menu-item key="修改" v-show="!isClickBlank">
                <a-icon type="edit"/>
                修改
              </a-menu-item>
              <a-menu-item key="上移" v-show="!isClickBlank">
                <a-icon type="up-circle"/>
                上移
              </a-menu-item>
              <a-menu-item key="下移" v-show="!isClickBlank">
                <a-icon type="down-circle"/>
                下移
              </a-menu-item>
              <a-menu-item key="升级" :disabled="!rightClickData.pid" v-show="!isClickBlank">
                <a-icon type="left-circle"/>
                升级
              </a-menu-item>
              <a-menu-item key="降级" v-show="!isClickBlank">
                <a-icon type="right-circle"/>
                降级
              </a-menu-item>
            </a-menu>
          </a-card>
        </a-col>
        <a-col :span="rightwidth" class="full-height">
          <div class="rich-text-style">
            <rich-text
              :key="fileDirectoryId"
              ref="richTextEditor"
              :objectId="richTextId"
              :contentValue="articleData"
              :disabled="!['systemConfig','ManageHelpDoc'].includes($route.name) "
              class="full-height"
            />
          </div>
        </a-col>
      </a-row>
    </a-card>
    <a-modal
      :key="modalNum"
      :title="modalTitle"
      :visible="isModalShow"
      @ok="modalOk"
      @cancel="modalCancel"
      okText="确认"
      cancelText="取消"
    >
      <span>文件夹名称</span>
      <a-input
        v-model="titleDefault"
        placeholder="请输入名称"
        style="width: 200px;margin:0 0 20px 10px"
        allowClear/>
      <br>
      <span>图标样式</span>
      <a-select :defaultValue="iconDefault" style="width: 200px;margin:0 0 20px 25px" @select="iconChange">
        <a-select-option
          v-for="value in iconOptions"
          :key="value.id">
          <img :src="bimURL+value.url" style="width: 25px;height: 25px"/>
          {{ value.iconName }}
        </a-select-option>
      </a-select>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import axios from "axios";
import {
  Card, Row, Col, Tree, Input, Menu, Icon, Modal, Select, Button
} from "@h3/antd-vue";
import * as Type from '../../type';
import * as Constant from '../../constant';

//@ts-ignore
import {v4 as uuidv4} from "uuid";
import env from "@/config/env";
import RichText from '../../basicCustomComponent/RichText/RichText'

@Component({
  name: "ManageHelpDoc",
  components: {
    ACard: Card,
    ARow: Row,
    ACol: Col,
    ATree: Tree,
    AInput: Input,
    AInputSearch: Input.Search,
    AIcon: Icon,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
    RichText
  }

})
export default class docManagement extends Vue {
  @InjectReactive('project') projectCode?: string;
  @InjectReactive('projectConfig') projectConfig?:Type.ProjectConfig;
  leftwidth: number = 6;
  rightwidth: number = 18;
  expandedKeys: Array<string> = [];
  searchValue: string = '';
  autoExpandParent: boolean = true;
  treeData: Array<{ [propsName: string]: string }> = [];
  dataList: Array<{ [propsName: string]: string }> = [];
  menuVisible: boolean = false;
  menuStyle: { [propsName: string]: string|number } = {
    position: "absolute",
    top: "0",
    left: "0",
    border: "1px solid #eee",
    zIndex: 10
  };
  bimURL: string = `${env.apiHost}`;
  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'manualName', key: 'id'
  }
  markNum: number = 0;
  rightClickData: any = {};
  modalTitle: string = '';
  isModalShow: boolean = false;
  iconOptions: Array<any> = [];
  iconDefault: string = '';
  titleDefault: string = '';
  state: string = '';
  modalNum: number = 0;
  fileDirectoryId: string = ''; //选择树节点id
  manualName: string = ''
  articleData: string = '';
  isAddRoot: boolean = false;
  richTextId: string = '';//id:当前richText
  isEdit: boolean = true;
  isClickBlank: boolean = true; //是否点击空白区域
  mounted() {
    this.getTreeData();
    this.getIconHub();
  }
  show(event) {
    this.rightClickData = {};
    if(['systemConfig','ManageHelpDoc'].includes(this.$route?.name??'')) {
      const x = event.offsetX;
      const y = event.layerY;
      //@ts-ignore
      this.menuVisible = true;
      this.menuStyle.top = y + 6 + "px";
      this.menuStyle.left = x + 20 + "px";
      document.body.addEventListener("click", this.bodyClick);
    }
  }
  //点界面的监听（关闭右键菜单）
  bodyClick() {
    this.menuVisible = false;
    document.body.removeEventListener("click", this.bodyClick);
    this.isClickBlank = true;
  }

  //树的升级降级
  changRankDBS(event) {
    let tempData: any = {};
    if (event === 'UPGRADE') {
      tempData = {
        manualName: this.rightClickData.manualName,
        manualSort: this.rightClickData.manualSort,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        iconId: this.rightClickData.scopedSlots.icon,
        state: event,
      }
    } else if (event === 'DOWNGRADE') {
      tempData = {
        manualName: this.rightClickData.manualName,
        manualSort: this.rightClickData.manualSort,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        iconId: this.rightClickData.scopedSlots.icon,
        state: event,
      }
    }
    axios
      .post(this.bimURL + '/api/helpDocs/changRank', Object.assign(tempData,{projectCode: this.projectCode}))
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          //@ts-ignore
          this.$message.success(res.data);
          this.getTreeData();
        } else {
          //@ts-ignore
          this.$message.warn('操作失败')
        }
      })
  }

  //点击树事件
  clickTree(selectedKeys, e) {
    const value = e.node.dataRef;
    this.manualName = value.manualName;
    this.fileDirectoryId = value.id;
    this.getRichText(this.fileDirectoryId);
  }

  //获取图标选项
  getIconHub() {
    this.iconOptions.length = 0;
    axios
      .get(this.bimURL + '/api/File/Directory/iconHub', {
        params: {
          projectCode: this.projectCode,
          // projectName: window.Environment.markName ?? ''
          projectName: this.projectConfig?.projectName??''
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.iconOptions = res.data
        }
      })
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

  //获取树数据
  getTreeData() {
    this.treeData.length = 0;
    axios
      .get(this.bimURL + '/api/helpDocs/tree', {
        params: {
          projectCode: this.projectCode
        }
      })
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.markNum += 1;
          this.treeData = res.data;
          this.fileDirectoryId = res.data[0].id;
          this.generateList(this.treeData);
          this.getRichText(this.treeData[0]?.id ?? '');
          if (this.expandedKeys.length == 0) return this.expandedKeys.push(this.treeData[0].id)
        }
      })
  }

  getRichText(id: string) {
    axios.get(this.bimURL + '/api/helpDocs/getRichText',{
      params: {
        projectCode: this.projectCode,
        helpDocsId: id
      }
    }).then((res)=> {
      //@ts-ignore
      if(res.errcode === 0) {
        this.articleData = res.data?.content ?? "";
        this.richTextId = res.data?.id ?? "";
      } else {
        this.articleData = '';
        this.richTextId = '';
        //@ts-ignore
        this.$message.error(res.errmsg)
      }
    })
  }

  saveRichText() {
    //@ts-ignore
    const textString = this.$refs?.['richTextEditor']?.content ?? '';
    axios.put(this.bimURL + '/api/helpDocs/updateRichText',{
        content: textString as string,
        helpDocsId: this.fileDirectoryId,
        id: this.richTextId.length ? this.richTextId : ''
    }).then((res)=> {
      //@ts-ignore
      if(res.errcode === 0) {
        //@ts-ignore
        this.$message.success('保存成功');
      }else {
        //@ts-ignore
        this.$message.error(res.errmsg)
      }
    })
  }

  generateList(data) {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.manualName;
      this.dataList.push({key: node.id, title: key});
      if (node.children) {
        this.generateList(node.children);
      }
    }
  }

  //选择图标
  iconChange(value) {
    this.iconDefault = value;
  }

  //右键菜单选择事件
  menuClick({item, key, keyPath}) {
    this.modalNum += 1;
    if (key === '添加') {
      this.state = 'ADD';
      if( keyPath === '新增根节点') {
        // this.titleDefault = '';
        // this.iconDefault = '';
        this.isAddRoot = true;
        // this.isClickBlank = false;
      }
      this.isAddRoot || this.isClickBlank ?  this.modalTitle = '新增根节点' : this.modalTitle = '新增子节点' ;
      this.isModalShow = true;
      return;
    } else if (key === '删除') {
      return this.refreshDBS('DELETE');
    } else if (key === '修改') {
      this.modalTitle = '编辑节点';
      this.state = 'UPDATE';
      this.titleDefault = this.rightClickData.manualName;
      this.iconDefault = this.rightClickData.scopedSlots.icon;
      this.isModalShow = true;
      return;
    } else if (key === '上移') {
      return this.moveDBS('UP')
    } else if (key === '下移') {
      return this.moveDBS('DOWN')
    } else if (key === '升级') {
      return this.changRankDBS('UPGRADE')
    } else if (key === '降级') {
      return this.changRankDBS('DOWNGRADE')
    }
  }

  //弹窗确认事件
  modalOk() {
    if (this.state === 'UPDATE') {
      this.refreshDBS('UPDATE');
    } else if (this.state === 'ADD') {
      this.refreshDBS('ADD');
    }
  }

  //弹窗取消事件
  modalCancel() {
    this.titleDefault = '';
    this.iconDefault = '';
    this.isModalShow = false;
    this.isAddRoot = false;
  }

  //树子节点上移下移
  moveDBS(event) {
    let tempData: any = {};
    if (event === 'UP') {
      tempData = {
        manualName: this.rightClickData.manualName,
        manualSort: this.rightClickData.manualSort,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        //@ts-ignore
        projectName: this.rightClickData.projectName,
        iconId: this.rightClickData.scopedSlots.icon,
        state: event,
      }
    } else if (event === 'DOWN') {
      tempData = {
        manualName: this.rightClickData.manualName,
        manualSort: this.rightClickData.manualSort,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        //@ts-ignore
        projectName: this.rightClickData.projectName,
        iconId: this.rightClickData.scopedSlots.icon,
        state: event,
      }
    }
    axios
      .post(this.bimURL + '/api/helpDocs/move',
        Object.assign(tempData,{projectCode: this.projectCode}))
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          //@ts-ignore
          this.$message.success(res.data);
          this.getTreeData();
        } else {
          //@ts-ignore
          this.$message.warn('操作失败')
        }
      })
  }

  //左侧树的关键字搜索
  onChange(e) {
    const value = e.target.value;
    const expandedKeys = this.dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, this.treeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    //@ts-ignore
    Object.assign(this, {
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }

  //左侧树的展开事件
  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }

  //树的增删改
  refreshDBS(event) {
    let tempData: any = {};
    let temptUuid = uuidv4();
    let uuid = temptUuid.split("-").join("");
    // debugger
    if (event === 'ADD') {
      tempData = {
        manualName: this.titleDefault,
        id: uuid,
        //@ts-ignore
        pid:'',
        //@ts-ignore
        iconId: this.iconDefault,
        state: event
      }
      if(this.isAddRoot) {
        tempData.pid = '';
      } else if(this.rightClickData?.id?.length) {
        tempData.pid = this.rightClickData.id;
      } else {
        tempData.pid = '';
      }
    } else if (event === 'UPDATE') {
      tempData = {
        manualName: this.titleDefault,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        //@ts-ignore
        iconId: this.iconDefault,
        state: event,
      }
    } else if (event === 'DELETE') {
      tempData = {
        manualName: this.rightClickData.manualName,
        manualSort: this.rightClickData.manualSort,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        //@ts-ignore
        iconId: this.rightClickData.scopedSlots.icon,
        state: event,
      }
    }
    axios
      .post(this.bimURL + '/api/helpDocs/refresh',
        Object.assign(tempData,{projectCode: this.projectCode})
      )
      .then(res => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.isModalShow = false;
        //@ts-ignore
          this.$message.success('操作成功');
         //@ts-ignore
          this.getTreeData();
        } else {
          //@ts-ignore
          this.$message.warn('操作失败')
        }
      }).finally(()=> {
      this.isAddRoot = false;
      this.titleDefault = '';
      this.iconDefault = '';
    })
  }

  //树的右键点击事件
  rightClick({event, node}) {
    //@ts-ignore
    if(['systemConfig','ManageHelpDoc'].includes(this.$route.name) ) {
      const x = event.currentTarget.offsetLeft + event.currentTarget.clientWidth;
      const y = event.currentTarget.offsetTop;
      //@ts-ignore
      this.menuVisible = true;
      //@ts-ignore
      this.menuStyle.top = (y-190 - this.$refs.treeRef.$el.scrollTop) + "px";
      this.menuStyle.left = x + 10 + "px";
      document.body.addEventListener("click", this.bodyClick);
      //@ts-ignore
      this.rightClickData = node.dataRef;
      this.isClickBlank = false;
    }
  }

  toprev() {
    //@ts-ignore
    this.$router.go(-1);
  }

}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
.manage-user-manual {
  //overflow: auto;
  .full-height;
  .title {
    font-size: 17px;
    font-weight: bold;
    margin-bottom: 10px;
    .save-btn {
      float: right;
    }
  }

  .content {
    height: calc(100% - 48px);
    .rich-text-style {
      width: 100%;
      height: 100%;
      /deep/ .ck-editor {
        .full-height;
        .ck-editor__main {
          height: calc(100% - 40px);
          .ck-content {
            .full-height;
          }
        }
      }
    }
  }
}

.ant-card {
  .full-height;
  /deep/ .ant-card-body {
    height: calc(100% - 5px);
    .ant-tree {
      overflow: auto;
      height: 89%;
    }
  }
}
/deep/ .ant-menu-vertical .ant-menu-item {
  margin-top: 0;
  margin-bottom: 0 !important;
  height: 35px;
}
</style>
