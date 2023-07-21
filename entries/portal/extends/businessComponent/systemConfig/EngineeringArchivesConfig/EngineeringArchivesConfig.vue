<template>
  <div class="bim-platform-config">
    <div class="project">
      <span>配置项目：</span>
      <a-select @change="handleChange" :value="projectName">
        <a-select-option
          v-for="i in selectOption"
          :key="i.id"
          :value="i.xmjc">
          {{ i.xmmc }}
        </a-select-option>
      </a-select>
    </div>
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="文档配置" class="custom-style">
        <div class="e-content">
          <a-card class="menu-left" >
            <template v-slot:extra>
              <el-input
                v-model="menuTreeKeyword"
                placeholder="请输入关键字"
                @change="changeMenuTreeKeyword">
                <i slot="suffix" class="el-icon-search el-input__icon" @click="changeMenuTreeKeyword(menuTreeKeyword)"></i>
              </el-input>
            </template>
            <template slot="title">
              <a-icon type="credit-card"/>
              菜单树
            </template>
            <div class="menu-tree">
              <a-tree
                :treeData="menuTreeData"
                :replaceFields="menuTreeReplaceFields"
                :defaultExpandAll="true"
                showIcon
                checkable
                checkStrictly
                :key="menuTreeKey"
                @select="selectTreeNodeOne"
                @check="onBusinessSelectChange"
                @expand="onExpand"
                :autoExpandParent="autoExpandParentMenu"
                :expandedKeys="expandedKeys"
                v-model="checkedKeys"
              >
                <template slot="icon" slot-scope="t">
                  <span class="doc-folder">
                    <img src="./img/file1_yellow拷贝3.png" alt="" v-if="t.type===0"/>
                    <img src="./img/文档(1).png" v-if="t.type===1" :class="t.isExist?'heightlint':''">
                  </span>
                </template>
                <template slot="title" slot-scope="title">
                  <span v-if="title.name.indexOf(menuTreeKeyword) > -1">
                    {{ title.name.substr(0, title.name.indexOf(menuTreeKeyword)) }}
                    <span style="color: #f50">{{ menuTreeKeyword }}</span>
                    {{ title.name.substr(title.name.indexOf(menuTreeKeyword) + menuTreeKeyword.length) }}
                  </span>
                  <span v-else>{{ title.name }}</span>
                </template>
              </a-tree>
            </div>
          </a-card>
          <a-card class="files-menu" @click.right="rightClick">
            <template v-slot:extra>
              <el-input
                v-model="filesMenuTreeKeyword"
                placeholder="请输入关键字"
                @change="changeFilesMenuTreeKeyword">
                <i slot="suffix" class="el-icon-search el-input__icon" @click="changeFilesMenuTreeKeyword(filesMenuTreeKeyword)"></i>
              </el-input>
            </template>
            <template slot="title">
              <div class="title">
                <a-icon type="credit-card"/>
                档案树
                <a-button @click="importDoc" v-show="addBizModels.length>0" size="small">导入文档</a-button>
                <a-button @click="importClick" v-show="filesMenuTree.length==0" size="small">一键导入</a-button>
              </div>
            </template>
            <div class="files-tree">
              <a-tree
                :treeData="filesMenuTree"
                :replaceFields="filesMenuReplaceFields"
                :defaultExpandAll="true"
                showIcon
                :key="filesKey"
                @select="selectTreeNodeTwo"
                @rightClick="handleFun"
                @expand="onExpandFiles"
                :autoExpandParent="autoExpandParentFiles"
                :expandedKeys="filesExpandedKeys"
              >
                <template slot="icon" slot-scope="t">
                  <span class="doc-folder">
                    <img src="./img/file1_yellow拷贝3.png" alt="" v-if="t.type==0"/>
                    <img src="./img/文档(1).png" v-if="t.type==1">
                  </span>
                </template>
                <template slot="title" slot-scope="title">
                  <span v-if="title.name.indexOf(filesMenuTreeKeyword) > -1">
                    {{ title.name.substr(0, title.name.indexOf(filesMenuTreeKeyword)) }}
                    <span style="color: #f50">{{ filesMenuTreeKeyword }}</span>
                    {{ title.name.substr(title.name.indexOf(filesMenuTreeKeyword) + filesMenuTreeKeyword.length) }}
                  </span>
                  <span v-else>{{ title.name }}</span>
                </template>
              </a-tree>
              <!--    新增根节点右键菜单-->
              <div class="popupMenu" v-if="isShowRightMenu" :style="{ top: menu_Rigtop, left: menu_Rigleft }">
                <p @click="addRootNode">新增根节点</p>
              </div>
            </div>
          </a-card>
          <!-- 右键点击树节点的菜单 -->
          <div
            class="popup_menu"
            v-if="isShowMenu||showClickDelTreeNode"
            :style="{ top: menu_top, left: menu_left }"
          >
            <p @click="addTreeNode" v-show="showAddTreeNode">新增</p>
            <a-popconfirm
              title="删除后不可恢复哦，确认删除吗？"
              @confirm="delTreeNode"
              @visibleChange="visibleChange"
              placement="rightBottom"
              class="engineering-pop">
              <p @click="showClickDelTreeNode=true">删除</p>
            </a-popconfirm>
            <p @click="updateTreeNode">重命名</p>
          </div>
        </div>
      </a-collapse-panel>
      <a-collapse-panel key="2" header="归档人设置" class="custom-style">
        <div class="PushSettings">
          <span class="plain">归档责任人：</span>
          <div class="con">
            <staff-selector
              :options="personOptions"
              :disabled="false"
              @change="onValueChange"
              :value="riskData.users"/>
            <div class="btn">
              <a-button type="primary" @click="pushRiskConfig" :loading="riskLoading">确定</a-button>
              <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteRiskConfig">
                <a-button type="danger">清除</a-button>
              </a-popconfirm>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <!-- 新增弹窗 -->
    <div>
      <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
        <el-input v-model="input" placeholder="请输入内容"></el-input>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="define">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, InjectReactive, Vue, Watch,} from 'vue-property-decorator';
import Card from "ant-design-vue/lib/card";
import "ant-design-vue/lib/card/style/index.css";
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import "ant-design-vue/lib/tree/style/index.css";
import Button from "ant-design-vue/lib/button"
import "ant-design-vue/lib/button/style/index.css";
import Utils from "../../../utils";
import * as Type from "../../../type";
import AInput from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Tag from "ant-design-vue/lib/tag"
import "ant-design-vue/lib/tag/style/index.css";
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import {
  getAvailableSheetTree,
  importFromSystem,
  getDirectoryList,
  loadToDocTree,
  addTreeNode,
  updateTreeNode,
  delTreeNode,
  getpushList,
  updateRiskConfig,
  deleteRiskConfig,
  getSystemProjectConfig
} from "../../../service/api";
import Dialog from "element-ui/lib/dialog";
import Input from "element-ui/lib/input";
import {RiskData} from "../type";
import staffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import {isArray} from "xe-utils";
@Component({
  name: "EngineeringArchivesConfig",
  components: {
    ACard: Card,
    AIcon: Icon,
    ATree: Tree,
    AButton:Button,
    ElDialog: Dialog,
    ElInput: Input,
    ATextarea: AInput.TextArea,
    AModal:Modal,
    ATag:Tag,
    APopconfirm: Popconfirm,
    staffSelector,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel
  }
})
export default class EngineeringArchivesConfig extends Vue {
  @InjectReactive('project') projectCode!: string;
  activeKey: string[] = ['1','2'];
  projectName:any="";
  selectOption: Array<any> = [];
  selectedName: string = '';
  projectSelect: { label: any, value: any } | null = null;
  menuTreeData: Array<any>= [];
  menuTreeReplaceFields: { children: string; title: string; key: string } = {
    children: "childs",
    title: "name",
    key: "id",
  };
  menuTreeKey: number = 0;
  filesMenuTree:Array<any> = [];
  filesMenuReplaceFields: { children: string; title: string; key: string } = {
    children: "childs",
    title: "name",
    key: "id",
  };
  filesKey: number = 1;
  addBizModels:Array<any>=[];
  docId:string="";
  pid:string="";
  isShowMenu:boolean=false;
  isShowRightMenu:boolean=false;
  menu_top:string="";
  menu_left:string="";
  menu_Rigtop:string="";
  menu_Rigleft:string="";
  dialogVisible:boolean=false;
  visible:boolean=false;
  confirmLoading:boolean=false;
  input:string="";
  state:string="";
  pid_left:string="";
  id:string=""
  val:object={}
  riskLoading: Boolean = false;
  personOptions: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    title: '人员多选'
  };
  riskData: RiskData = {
    id: '',
    period: 1,
    type: '工程归档',
    periodType: '',
    users: []
  };
  checkedKeys:any=[];
  showClickDelTreeNode: boolean = false;
  showAddTreeNode: boolean = false;
  //menuTree-search
  menuTreeKeyword: string = '';
  menuTreeList:{title:string,key:string}[] = [];
  expandedKeys: string[] = [];
  autoExpandParentMenu: boolean = true;
  //filesTree-search
  filesMenuTreeKeyword: string = '';
  filesList:{title:string,key:string}[] = [];
  filesExpandedKeys: string[] = [];
  autoExpandParentFiles: boolean = true;
  @Watch("checkedKeys",{immediate: true})
  changeAddBizModels(val:string){
    console.log('watch',val)
  };
  getProjectList() {
    getSystemProjectConfig({ appCode: this.projectCode??''}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      if(res.data.single && isArray(res.data.single) && res.data.single.length){
        this.selectOption = res.data.single;
        this.handleChange(this.selectOption[0].xmjc)
      }
    })
  }
  handleChange(val) {
    this.projectName=val;
    this.getAvailableSheetTree();
    this.getDirectoryList();
    this.getRiskConfig(val);
  }
  onBusinessSelectChange(selectedKeys, info){
    if(info.checked==true){
      this.addBizModels.push({name:info.node.dataRef.name,schemaCode:info.node.dataRef.code})
      console.log("this.addBizModels",this.addBizModels)
    }else {
      const val=info.node.dataRef
      this.addBizModels.forEach((item,index)=>{
        if(item.name==val.name){
          this.addBizModels.splice(index,1)
        }
      })
    }
  }
  importClick(){//一键导入
    this.importFromSystem()
    this.getDirectoryList()
  }
  importDoc(){//导入文档
    let params:any={
      addBizModels:this.addBizModels,
      appCode:this.projectCode,
      docId:this.docId,
      projectName:this.projectName
    };
    loadToDocTree(params).then((res)=>{//选中父节点添加文档
     if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.getAvailableSheetTree();
      this.getDirectoryList();
      this.addBizModels=[];
      this.checkedKeys=[];
      if(res.errcode==0) return this.$message.success(res.errmsg as string);
    })
  }
  selectTreeNodeOne(keys, event) {//可添加的文档树事件
    console.log(keys, event)
  }
  selectTreeNodeTwo(keys, event) {//文件目录点击事件
    this.docId=event.node.dataRef.id;
  }
  outClick(e) {
    this.isShowMenu = false;
    this.isShowRightMenu=false
  }
  rightClick(e){
    if(e.button==2){
      this.isShowRightMenu=true;
      this.isShowMenu = false;
      this.menu_Rigtop = e.layerY +"px";
      this.menu_Rigleft = e.layerX+ "px";
      e.preventDefault()
    }
  }
  handleFun(e){//右键菜单事件
    if(e.node.dataRef.type) {
      this.showAddTreeNode = false;
    }else {
      this.showAddTreeNode = true;
    }
    e.event.stopPropagation()
    this.isShowMenu = true;
    this.isShowRightMenu=false;
    this.menu_top = e.event.layerY +"px";
    this.menu_left = e.event.layerX+ 725 + "px";
    const val = e.node.$vnode.data.props;
    this.id=val.id;
    this.pid=val.parentId
  }
  addTreeNode(){//新增
    this.state = "ADD";
    this.input = "";
    this.dialogVisible=true
  }
  //新增根节点
  addRootNode() {
    this.state = "ADDROOT";
    this.input = "";
    this.pid = "";
    this.dialogVisible = true;
  };
  delTreeNode(){//删除
    delTreeNode({appCode: this.projectCode, id:this.id, projectName:this.projectName}).then((res)=>{
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.getDirectoryList()
      if(res.errcode==0) return this.$message.success(res.errmsg as string);
    })
  }
  updateTreeNode(){//重命名
    this.state = "UPDATE";
    this.input = "";
    this.dialogVisible=true
  }
  define(){//确定
    console.log(this.projectCode,this.projectName,this.id,this.pid)
    this.dialogVisible=false
    if(this.state=="ADD"|| this.state =="ADDROOT"){//新增
      if(this.input){
        const cmd={
          appCode: this.projectCode,
          name:this.input,
          pid:this.state == "ADD"? this.id: '',
          projectName:this.projectName
        }
        addTreeNode(cmd).then((res)=>{
          if(res.errcode!==0) return this.$message.error(res.errmsg as string)
          this.getDirectoryList()
          if(res.errcode==0) return this.$message.success(res.errmsg as string);
        })
      }else{
        this.$message.error("未输入名称，添加失败");
      }
    }else  if(this.state=="UPDATE"){//重命名
      if(this.input){
        const cmd={
          appCode: this.projectCode,
          name:this.input,
          pid:this.pid,
          id:this.id,
          projectName:this.projectName
        }
        updateTreeNode(cmd).then((res)=>{
          if(res.errcode!==0) return this.$message.error(res.errmsg as string)
          this.getDirectoryList()
          if(res.errcode==0) return this.$message.success(res.errmsg as string);
        })
      }else{
        this.$message.error("未输入名称，添加失败");
      }
    }

  }
  getAvailableSheetTree(){//获取初始化树列表
    this.menuTreeList = [];
    getAvailableSheetTree({appCode:this.projectCode,isMobile:false,projectName:this.projectName}).then((res)=>{
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(res.errcode===0){
        Utils.deepFind(
          res.data,
          (item) => {
            item.scopedSlots = {icon: "icon"};
            Object.assign(item.scopedSlots,{title: 'title'})
            if(item.type===0 || item.isExist){
              item.disableCheckbox=true;
            }
            this.menuTreeList.push({key:item.id,title:item.name})
            return false;
          },
          "childs"
        );
        this.menuTreeData=res.data
      }
    })
  }
  importFromSystem(){//一键导入文档目录文件夹
    importFromSystem({appCode:this.projectCode,projectName:this.projectName,isMobile:false}).then((res)=>{
      this.getDirectoryList();
      if(res.errcode==50000) return this.$message.error(res.errmsg as string);
      if(res.errcode!==50000) return this.$message.success(res.errmsg as string);
    })
  }
  getDirectoryList(){//获取文档目录
    this.filesList = [];
    getDirectoryList({appCode:this.projectCode,projectName:this.projectName}).then((res)=>{
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      Utils.deepFind(
        res.data,
        (item) => {
          item.scopedSlots = {icon: "icon"};
          Object.assign(item.scopedSlots,{title: 'title'})
          this.filesList.push({title: item.name, key: item.id})
          return false;
        },
        "childs"
      );
      this.filesMenuTree=res.data
    })
  }
  getRiskConfig(proName: string) {//获取推送人名单
    this.riskData.users = [];
    getpushList({
      appCode: this.projectCode ?? '',
      projectName: proName,
      type: this.riskData.type ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.riskData.id = res.data.id;
        this.riskData.periodType = res.data.periodType;
        this.riskData.period = res.data.period;
        res.data && res.data.users ? this.riskData.users = res.data.users.map((item) => {
          return {
            id: item.userId,
            name: item.userName
          }
        }) : ''
      }
    })
  }
  onValueChange(value) {
    this.riskData.users = value
  }
  pushRiskConfig() {//确定修改
    if (!this.riskData.users || (this.riskData.users && !this.riskData.users.length)) return this.$message.warning('请至少选择一个用户！')
    this.riskLoading = true;
    updateRiskConfig({
      appCode: this.projectCode ?? '',
      projectName: this.projectName,
      id: this.riskData.id ?? '',
      type: '工程归档',
      periodType: this.riskData.periodType,
      period: this.riskData.period ?? 0,
      users: this.riskData.users.map((i) => {
        return {
          userId: i.id,
          userName: i.name
        }
      })
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('推送成功！')
      this.getRiskConfig(this.projectName)
    }).finally(() => {
      this.riskLoading = false;
    })
  }
  deleteRiskConfig(){//清除归档人
    deleteRiskConfig({appCode: this.projectCode ?? '', id: this.riskData.id ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.riskData.id = '';
      this.riskData.periodType = '';
      this.riskData.period = 0;
      this.riskData.users = [];
      this.getRiskConfig(this.projectName);
    })
  }
  visibleChange(show:boolean) {
    if(!show) this.showClickDelTreeNode = false
  }
  changeMenuTreeKeyword(value:string) {
    const expandedKeys = this.menuTreeList
      .map( item => {
        if ( item.title.indexOf( value ) > -1 ) {
          return Utils.getTreeParentKey<any>(this.menuTreeData,'childs','id',item.key );
        }
        return null;
      } )
      .filter( ( item, i, self ) => item && self.indexOf( item ) === i );
    //@ts-ignore
    Object.assign( this, {
      expandedKeys: expandedKeys,
      menuTreeKeyword: value,
      autoExpandParentMenu: true
    } );
  }
  //左侧树的展开事件
  onExpand( expandedKeys ) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParentMenu = false;
  }
  changeFilesMenuTreeKeyword(value:string) {
    console.log(this.filesMenuTree)
    const expandedKeys = this.filesList
      .map( item => {
        if ( item.title.indexOf( value ) > -1 ) {
          return Utils.getTreeParentKey<any>(this.filesMenuTree,'childs','id',item.key );
        }
        return null;
      } )
      .filter( ( item, i, self ) => item && self.indexOf( item ) === i );
    //@ts-ignore
    Object.assign( this, {
      filesExpandedKeys: expandedKeys,
      filesMenuTreeKeyword: value,
      autoExpandParentFiles: true
    } );
    console.log(this.filesExpandedKeys,'11')
  }
  onExpandFiles( expandedKeys ) {
    this.filesExpandedKeys = expandedKeys;
    this.autoExpandParentFiles = false;
  }
  mounted(){
    this.filesKey++;
    this.menuTreeKey++;
    this.getProjectList();
    // this.getAvailableSheetTree();
    // this.getDirectoryList();
    document.addEventListener("click", this.outClick);
    // this.getRiskConfig(this.projectName)
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';
.bim-platform-config{
  .project {
    margin-bottom: @spacing-large;
    /deep/ .ant-select {
      width: 30%;
    }
  }
  .A_title{
    display: flex;
    font-weight: bold;
    color: #000000;
    line-height: 22px;
    .pic{
      width: 5px;
      height: 24px;
      background-color: #3071e2;
      margin-right: 13px;
      margin-bottom: 20px;
    }
  }
  .e-content{
    //height: 50%;
    display: flex;
    margin-bottom: 20px;
    position: relative;
    .doc-card-body {
      height: fit-content;
      /deep/ .ant-card-body {
        max-height: 600px;
      }
    }
    .menu-left{
      width: 49%;
      //height: 100%;
      margin-right: 2%;
     .doc-card-body;
      .heightlint {
        background-color: red;
      }
    }
    .files-menu{
      width: 49%;
      //height: 100%;
      .doc-card-body;
      .title{
        button{
          float: right;
          //height: 26px;
          //line-height: 26px;
          margin-left: @spacing-base;
          margin-right: @spacing-base;
        }
      }
      .addRootNode {
        cursor: pointer;
        background-color: #ffffff;
        color: rgba(0, 0, 0, 0.65);
        border: 1px solid #d9d9d9;
        box-shadow: 0 2px 0 rgb(0 0 0 / 2%);
        border-radius: 4px;
        height: 32px;
        text-align: center;
        line-height: 25px;
        width: 100px;
      }
    }
    /deep/.ant-card-head{
      background-color: #fff;
      position: sticky;
      top: -24px;
      z-index: 1000;
      border-top: 1px solid #e8e8e8;
    }
    /deep/.ant-card-bordered {
      border-top: none;
    }
  }
  .popup_menu {
    position: absolute;
    width: 100px;
    //height: 118px;
    background: #ffffff;
    border: 1px solid #d9e9ef;
    box-shadow: 0px 3px 7px 0px rgba(6, 72, 151, 0.1);
    border-radius: 6px;
    z-index: 10;

    p {
      color: #333;
      font-size: 12px;
      font-weight: 700;
      height: 30px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
    }
    p:hover {
      background: rgba(33, 140, 184, 0.21);
    }
  }
  .popupMenu{
    position: absolute;
    width: 100px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #d9e9ef;
    box-shadow: 0px 3px 7px 0px rgba(6, 72, 151, 0.1);
    border-radius: 6px;
    z-index: 10000;
    p {
      color: #333;
      font-size: 12px;
      font-weight: 700;
      height: 30px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
    }
    p:hover {
      background: rgba(33, 140, 184, 0.21);
    }
  }
  .PushSettings{
    display: flex;
    .con{
      .btn{
        float: right;
        margin-top: @spacing-base;
        button:nth-child(1){
          margin-right: 20px;
        }
      }
    }
    .plain{
      color: #ababab;
      font-size: 16px;
      font-weight: 600;
    }
  }

  /deep/.h3-organization__label{
    width: 321px;
    height: 200px;
    overflow: auto;
    min-height: 32px;
    border-radius: 4px;
    position: relative;
    padding: 3px 5px 0 5px;
    line-height: 1.4em;
    border: 1px solid #d9d9d9;
  }

}
</style>
