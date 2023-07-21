<template>
  <div class="docManagenment">
    <Common-Header headerTitle="企业图书馆" v-if="$route.path==='/qyDocManagement'"/>
    <a-card title="" class="box" style="width: 100%;">
      <a-row :gutter="8">
        <a-col :span="leftwidth">
          <a-card
            title="文件目录"
            style="height:830px"
            size="small"
          >
            <a-button
              slot="extra"
              type="primary"
              v-if="isEdit"
              ref="add"
              @click="menuClick({key:'添加',keyPath:'新增根节点'})">+根目录
            </a-button>
            <a-input-search
              style="margin-bottom: 8px"
              placeholder="请输入关键字"
              @change="onChange"
              @pressEnter="handleSearchOne"
              @search="onSearchOne"/>
            <el-scrollbar style="height: 93%">
              <a-tree
                :key="markNum"
                :autoExpandParent="autoExpandParent"
                :treeData="treeData"
                showIcon
                :expandedKeys="expandedKeys"
                @expand="onExpand"
                @select="clickTree"
                @rightClick="rightClick"
                :replaceFields="replaceFields"
              >
                <template slot="title" slot-scope="title">
                  <span v-if="title.dbsname.indexOf(searchValue) > -1">
                    {{ title.dbsname.substr( 0, title.dbsname.indexOf( searchValue ) ) }}
                    <span style="color: #f50">{{ searchValue }}</span>
                    {{
                      title.dbsname.substr( title.dbsname.indexOf( searchValue ) + searchValue.length )
                    }}
                  </span>
                  <span v-else>{{ title.dbsname }}</span>
                </template>
              <!--              <template-->
              <!--                v-for="value in iconOptions"-->
              <!--                :slot="value.id"-->
              <!--                slot-scope="record">-->
              <!--                <img-->
              <!--                  :src="bimURL+value.url"-->
              <!--                  :key="value.id"-->
              <!--                  style="height: 15px;width: 15px"-->
              <!--                />-->
              <!--              </template>-->
              </a-tree>
              <a-menu :style="menuStyle" v-if="menuVisible&&isEdit" @click="menuClick">
                <a-menu-item key="添加">
                  <a-icon type="plus-circle"/>
                  添加
                </a-menu-item>
                <!-- p判断有没有pid（父节点），无父节点不可操作-->
                <a-menu-item key="删除">
                  <a-icon type="close-circle"/>
                  删除
                </a-menu-item>
                <!--控修改权限-->
                <a-menu-item key="修改">
                  <a-icon type="edit"/>
                  修改
                </a-menu-item>
                <a-menu-item key="上移">
                  <a-icon type="up-circle"/>
                  上移
                </a-menu-item>
                <a-menu-item key="下移">
                  <a-icon type="down-circle"/>
                  下移
                </a-menu-item>
                <a-menu-item key="升级" :disabled="!rightClickData.pid">
                  <a-icon type="left-circle"/>
                  升级
                </a-menu-item>
                <a-menu-item key="降级">
                  <a-icon type="right-circle"/>
                  降级
                </a-menu-item>
              </a-menu>
            </el-scrollbar>
          </a-card>
        </a-col>
        <a-col :span="rightwidth">
          <a-card title="文件列表" style="height:830px" size="small">
            <span>文件名称搜索:</span>
            <a-input-search
              style="margin: 0 20px 0 10px;width: 250px"
              enterButton
              placeholder="请输入关键字"
              size="small"
              @change="onTableChange"
              @pressEnter="handleSearchTwo"
              @search="onSearchTwo"
            />
            <span>日期选择:</span>
            <a-range-picker
              style="margin: 0 20px 0 10px;width: 250px"
              size="small"
              allowClear
              @change="onDateChange"/>
            <span
              style="float: right;color: #5291ff;cursor: pointer"
              @click="getTableData">刷新</span>
            <span
              style="float: right;color: #5291ff;margin-right:15px;cursor: pointer"
              @click="addFile">新增</span>
            <a-table
              style="margin-top: 10px"
              :columns="tableLabel"
              :scroll="{ y: 640 }"
              :pagination="pagination"
              :data-source="tableData">
              <span slot="操作" slot-scope="record">
                <a-popconfirm
                  title="确认要删除吗?"
                  okText="确定"
                  cancelText="取消"
                  @confirm="deleteRow(record)">
                  <a href="javascript:void(0)">删除</a>
                </a-popconfirm>
                <!-- <span style="margin: 0 2px 0 2px">|</span>
                <a @click="detailRow(record)">查看</a> -->
              </span>
              <template slot="attachment" slot-scope="text,scope">
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>单击预览</span>
                    <br/>
                    <span>双击下载</span>
                  </template>
                  <a @click="dealFile(scope)" @dblclick="downLoad(scope)">{{
                    scope.attachment.name
                  }}</a>
                </a-tooltip>
              </template>
            </a-table>
          </a-card>
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
      <!--      <br>-->
      <!--      <span>图标样式</span>-->
      <!--      <a-select-->
      <!--        :defaultValue="iconDefault"-->
      <!--        style="width: 200px;margin:0 0 20px 25px"-->
      <!--        @select="iconChange">-->
      <!--        <a-select-option-->
      <!--          v-for="value in iconOptions"-->
      <!--          :key="value.id">-->
      <!--          <img :src="bimURL+value.url" style="width: 25px;height: 25px"/>-->
      <!--          {{ value.iconName }}-->
      <!--        </a-select-option>-->
      <!--      </a-select>-->
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Inject, InjectReactive, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import {
  Card, Row, Col, Tree, Input, Menu, Icon, DatePicker, Table, Modal, Select, Tooltip, Button,Popconfirm
} from "@h3/antd-vue";
import CommonHeader from "../../../src/components/shared/header/header.vue";
import * as Type from '../../type';
import * as Constant from '../../constant';

//@ts-ignore
import { v4 as uuidv4 } from "uuid";
import env from "@/config/env";
import Store from "@/store";

@Component( {
  name: "docManagement",
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
    ARangePicker: DatePicker.RangePicker,
    ATable: Table,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip,
    AButton: Button,
    CommonHeader,
    APopconfirm:Popconfirm
  }

} )
export default class docManagement extends Vue {
  @InjectReactive( 'project' ) projectCode?: string;
  @InjectReactive( 'projectConfig' ) projectConfig?: Type.ProjectConfig;
  leftwidth: number = 6;
  rightwidth: number = 18;
  expandedKeys: Array<string> = [];
  searchValue: string = '';
  autoExpandParent: boolean = true;
  treeData: Array<{ [propsName: string]: string }> = [];
  dataList: Array<{ [propsName: string]: string }> = [];
  menuVisible: boolean = false;
  menuStyle: { [propsName: string]: string } = {
    position: "absolute",
    top: "0",
    left: "0",
    border: "1px solid #eee"
  };
  tableLabel: Array<any> = [    // 表头数据
    {
      title: '序号',
      align: "center",
      width: 100,
      customRender: ( text, record, index ) => `${ index + 1 }`,
    },
    {
      align: "center",
      title: "文件名称",
      key: "fileName",
      dataIndex: "fileName",
    },
    {
      align: "center",
      title: "上传人",
      key: "uploadPerson",
      width: 120,
      dataIndex: "uploadPerson",
    },
    {
      align: "center",
      title: "上传日期",
      key: "uploadTime",
      width: 240,
      dataIndex: "uploadTime",
    },
    {
      align: "center",
      title: "附件",
      key: "attachment",
      dataIndex: "attachment",
      scopedSlots: { customRender: "attachment" }
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      width: 100,
      scopedSlots: { customRender: "操作" }
    }, ];
  tableData: Array<any> = [];
  bimURL: string = `${ env.apiHost }`;
  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'dbsname', key: 'id'
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
  fileDirectoryId: string = '';
  fileName: string = '';
  endTime: string = '';
  startTime: string = '';
  dbsname: string = ''
  isEdit: boolean = true;
  isAddRoot: boolean = false;
  timeFn: any;
  pagination={
    showSizeChanger:true,
    pageSizeOptions: ['10','20','50','100','200','300','500'],
    defaultPageSize: 20,
    showTotal:total=>`共${total}条`
  };

  mounted() {
    this.getTreeData();
  }

  show( event ) {
    this.rightClickData = {};
    if ( this.$route.name === 'ManageHelpDoc' ) {
      const x = event.offsetX;
      const y = event.layerY;
      //@ts-ignore
      this.menuVisible = true;
      this.menuStyle.top = y + 6 + "px";
      this.menuStyle.left = x + 20 + "px";
      document.body.addEventListener( "click", this.bodyClick );
    }
  }

  //新增文件-跳转路由
  addFile() {
    const url = `/form/detail?schemaCode=${ this.projectCode }_File_list&queryCode=${ this.projectCode }_File_list&FileDirectoryId=${ this.fileDirectoryId }`;
    const urlReturn = `${this.$route.fullPath}&iframeAction=add`;
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${ env.portalHost }${url}`)
  }

  //点界面的监听（关闭右键菜单）
  bodyClick() {
    this.menuVisible = false;
    document.body.removeEventListener( "click", this.bodyClick );
  }

  //树的升级降级
  changRankDBS( event ) {
    let tempData: any = {};
    if ( event === 'UPGRADE' ) {
      tempData = {
        dbsname: this.rightClickData.dbsname,
        dbssort: this.rightClickData.dbssort,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        //@ts-ignore
        projectName: this.rightClickData.projectName,
        iconId: this.rightClickData.scopedSlots.icon,
        state: event,
      }
    } else if ( event === 'DOWNGRADE' ) {
      tempData = {
        dbsname: this.rightClickData.dbsname,
        dbssort: this.rightClickData.dbssort,
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
      .post( this.bimURL + '/api/File/Directory/changRankDBS', {
        projectCode: this.projectCode,
        isMultiple: true,
        // projectName: window.Environment.markName ?? '',
        projectName: this.projectConfig?.projectName ?? '',
        newDbsDTO: tempData,
      } )
      .then( res => {
        //@ts-ignore
        if ( res.errcode == 0 ) {
          //@ts-ignore
          if ( !res.data[0].sucFlag ) return this.$message.warn( res.data[0].log[0] );
          //@ts-ignore
          this.$message.success( '操作成功' );
          this.getTreeData();
        } else {
          //@ts-ignore
          this.$message.warn( '操作失败' )
        }
      } )
  }

  //点击树事件
  clickTree( selectedKeys, e ) {
    const value = e.node.dataRef;
    this.dbsname = value.dbsname;
    this.fileDirectoryId = value.id;
    this.getTableData();
  }

  //预览文件
  dealFile( value ) {
    // 取消上次延时未执行的方法
    clearTimeout( this.timeFn );
    this.timeFn = setTimeout( () => {
      const sysConfig = (Store.state as any).config;
      window.open( `${ sysConfig.idocvServiceUrl }?url=${ env.apiHost }/api/aliyun/download?refId=${ value.attachment.refId }=name=${ value.attachment.name }` );
    }, 300 )
  }
  //删除文件
  deleteRow( record ) {
    axios
      .delete( this.bimURL + '/api/File/FileList/isdelete', {
        params: {
          projectCode: this.projectCode,
          deleteId: record.id,
          attachmentId: record.attachment.id
        }
      } )
      .then( res => {
        //@ts-ignore
        if ( res.errcode == 0 ) return this.getTableData();
        //@ts-ignore
        if ( res.errcode == 1 ) return this.$message.warn( '无删除权限' );
        //@ts-ignore
        this.$message.warn( '删除失败' );
      } )
  }

  //编辑文件
  detailRow( record ) {
    const url =`/form/detail?schemaCode=${ this.projectCode }_File_list&queryCode=${ this.projectCode }_File_list&sheetCode=${ this.projectCode }_File_list&objectId=${ record.id }&isWorkFlow=false`;
    const urlReturn = `${this.$route.fullPath}&iframeAction=detail`;
    this.isDingTalk?this.$router.push(`${url}&return=${encodeURIComponent(urlReturn )}`):window.open(`${ env.portalHost }${url}`)
  }

  //下载文件
  downLoad( record ) {
    clearInterval( this.timeFn );
    window.open( `${ env.apiHost }/api/aliyun/download?refId=${ record.attachment.refId }` )
  }

  //获取图标选项
  getIconHub() {
    this.iconOptions.length = 0;
    axios
      .get( this.bimURL + '/api/File/Directory/iconHub', {
        params: {
          projectCode: this.projectCode,
          // projectName: window.Environment.markName ?? ''
          projectName: this.projectConfig?.projectName ?? ''
        }
      } )
      .then( res => {
        //@ts-ignore
        if ( res.errcode == 0 ) {
          this.iconOptions = res.data
        }
      } )
  }

  getParentKey( key, tree ) {
    let parentKey;
    for ( let i = 0; i < tree.length; i++ ) {
      const node = tree[i];
      if ( node.children ) {
        if ( node.children.some( item => item.id === key ) ) {
          parentKey = node.id;
        } else if ( this.getParentKey( key, node.children ) ) {
          parentKey = this.getParentKey( key, node.children );
        }
      }
    }
    return parentKey;
  }

  //获取表格数据
  getTableData() {
    this.tableData.length = 0;
    axios
      .get( this.bimURL + '/api/File/FileList/page', {
        params: {
          projectCode: this.projectCode,
          pageNum: 0,
          pageSize: 9999,
          fileDirectoryId: this.fileDirectoryId,
          fileName: this.fileName,
          startTime: this.startTime,
          endTime: this.endTime
        }
      } )
      .then( res => {
        //@ts-ignore
        if ( res.errcode == 0 ) {
          this.tableData = res.data.records;
          for ( let i = 0; i < this.tableData.length; i++ ) {
            this.$set( this.tableData[i], 'key', this.tableData[i].id );
          }
        }
      } )
  }

  //获取树数据
  getTreeData() {
    this.treeData.length = 0;
    axios
      .get( this.bimURL + '/api/File/Directory/dbsTree', {
        params: {
          projectCode: this.projectCode,
        }
      } )
      .then( res => {
        //@ts-ignore
        if ( res.errcode == 0 ) {
          this.markNum += 1;
          this.treeData = [ ...res.data.datas ];
          // this.treeData.push(res.data);
          this.generateList( this.treeData );
          this.dbsname = this.treeData[0].dbsname;
          this.fileDirectoryId = this.treeData[0].id;
          this.isEdit = Boolean( res.data.isEdit );
          this.getTableData();
          if ( this.expandedKeys.length == 0 ) return this.expandedKeys.push( this.treeData[0].id )
        }
      } )
  }

  generateList( data ) {
    for ( let i = 0; i < data.length; i++ ) {
      const node = data[i];
      const key = node.dbsname;
      this.dataList.push( { key: node.id, title: key } );
      if ( node.children ) {
        this.generateList( node.children );
      }
    }
  }

  //选择图标
  iconChange( value ) {
    this.iconDefault = value;
  }

  //右键菜单选择事件
  menuClick( { item, key, keyPath } ) {
    this.modalNum += 1;
    if ( key === '添加' ) {
      this.state = 'ADD';
      if ( keyPath === '新增根节点' ) {
        this.isAddRoot = true;
      }
      this.isAddRoot ? this.modalTitle = '新增根节点' : this.modalTitle = '新增子节点';
      this.isModalShow = true;
      return;
    } else if ( key === '删除' ) {
      return this.refreshDBS( 'DELETE' );
    } else if ( key === '修改' ) {
      this.state = 'UPDATE';
      this.titleDefault = this.rightClickData.dbsname;
      // this.iconDefault = this.rightClickData.scopedSlots.icon;
      this.isModalShow = true;
      return;
    } else if ( key === '上移' ) {
      return this.moveDBS( 'UP' )
    } else if ( key === '下移' ) {
      return this.moveDBS( 'DOWN' )
    } else if ( key === '升级' ) {
      return this.changRankDBS( 'UPGRADE' )
    } else if ( key === '降级' ) {
      return this.changRankDBS( 'DOWNGRADE' )
    }
  }

  //弹窗确认事件
  modalOk() {
    if ( this.state === 'UPDATE' ) {
      this.refreshDBS( 'UPDATE' );
    } else if ( this.state === 'ADD' ) {
      this.refreshDBS( 'ADD' );
    }
  }

  //弹窗取消事件
  modalCancel() {
    this.titleDefault = '';
    // this.iconDefault = '';
    this.isModalShow = false;
    this.isAddRoot = false;
  }

  //树子节点上移下移
  moveDBS( event ) {
    let tempData: any = {};
    if ( event === 'UP' ) {
      tempData = {
        dbsname: this.rightClickData.dbsname,
        dbssort: this.rightClickData.dbssort,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        //@ts-ignore
        projectName: this.rightClickData.projectName,
        iconId: this.rightClickData.scopedSlots.icon,
        state: event,
      }
    } else if ( event === 'DOWN' ) {
      tempData = {
        dbsname: this.rightClickData.dbsname,
        dbssort: this.rightClickData.dbssort,
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
      .post( this.bimURL + '/api/File/Directory/moveDBS', {
        projectCode: this.projectCode,
        isMultiple: true,
        // projectName: window.Environment.markName ?? '',
        projectName: this.projectConfig?.projectName ?? '',
        newDbsDTO: tempData,
      } )
      .then( res => {
        //@ts-ignore
        if ( res.errcode == 0 ) {
          //@ts-ignore
          if ( !res.data[0].sucFlag ) return this.$message.warn( res.data[0].log[0] );
          //@ts-ignore
          this.$message.success( '操作成功' );
          this.getTreeData();
        } else {
          //@ts-ignore
          this.$message.warn( '操作失败' )
        }
      } )
  }

  //时间选择
  onDateChange( dates, dateStrings ) {
    this.endTime = dateStrings[1];
    this.startTime = dateStrings[0];
    this.getTableData();
  }

  //左侧树的关键字搜索
  onChange( e ) {
    // const value = e.target.value;
    // const expandedKeys = this.dataList
    //   .map( item => {
    //     if ( item.title.indexOf( value ) > -1 ) {
    //       return this.getParentKey( item.key, this.treeData );
    //     }
    //     return null;
    //   } )
    //   .filter( ( item, i, self ) => item && self.indexOf( item ) === i );
    // //@ts-ignore
    // Object.assign( this, {
    //   expandedKeys,
    //   searchValue: value,
    //   autoExpandParent: true,
    // } );
  }
  leftSearch(value){
    // const value = e.target.value;
    const expandedKeys = this.dataList
      .map( item => {
        if ( item.title.indexOf( value ) > -1 ) {
          return this.getParentKey( item.key, this.treeData );
        }
        return null;
      } )
      .filter( ( item, i, self ) => item && self.indexOf( item ) === i );
    //@ts-ignore
    Object.assign( this, {
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    } );
  }
  //左侧树回车关键字搜索
  handleSearchOne(e){
    const value = e.target.value;
    this.leftSearch(value)
  }
  //左侧树点击搜索
  onSearchOne(value){
    this.leftSearch(value)
  }

  //左侧树的展开事件
  onExpand( expandedKeys ) {
    this.expandedKeys = expandedKeys;
    this.autoExpandParent = false;
  }

  //右侧表格名称搜索
  onTableChange( e ) {
    this.fileName = e.target.value;
    // this.getTableData();
  }
  //右侧表格回车搜索
  handleSearchTwo(e){
    console.log(e.target.value)
    this.fileName = e.target.value;
    this.getTableData();
  }
  //右侧表格点击搜索
  onSearchTwo(value){
    this.fileName = value;
    this.getTableData();
  }

  //树的增删改
  refreshDBS( event ) {
    let tempData: any = {};
    let temptUuid = uuidv4();
    let uuid = temptUuid.split( "-" ).join( "" );
    if ( event === 'ADD' ) {
      this.modalTitle = '新增子节点';
      tempData = {
        dbsname: this.titleDefault,
        id: uuid,
        //@ts-ignore
        pid: this.isAddRoot ? '' : this.rightClickData.id,
        //@ts-ignore
        projectName: this.rightClickData.projectName,
        // iconId: this.iconDefault,
        state: event,
      }
    } else if ( event === 'UPDATE' ) {
      this.modalTitle = '编辑节点';
      tempData = {
        dbsname: this.titleDefault,
        id: this.rightClickData.id,
        //@ts-ignore
        pid: this.rightClickData.pid,
        //@ts-ignore
        projectName: this.rightClickData.projectName,
        // iconId: this.iconDefault,
        state: event,
      }
    } else if ( event === 'DELETE' ) {
      tempData = {
        dbsname: this.rightClickData.dbsname,
        dbssort: this.rightClickData.dbssort,
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
      .post( this.bimURL + '/api/File/Directory/refreshDBS', {
        projectCode: this.projectCode,
        // projectName: window.Environment.markName ?? '',
        projectName: this.projectConfig?.projectName ?? '',
        newDbsDTO: tempData,
        isMultiple: true,
      } )
      .then( res => {
        //@ts-ignore
        if ( res.errcode == 0 ) {
          this.isModalShow = false;
          if ( res.data[0].sucFlag ) {
            //@ts-ignore
            this.$message.success( '操作成功' );
          } else {
            //@ts-ignore
            this.$message.warn( res.data[0].log[0] );
          }
          this.getTreeData();
        } else {
          //@ts-ignore
          this.$message.warn( '操作失败' )
        }
      } ).finally( () => {
      this.isAddRoot = false;
      this.titleDefault = '';
      // this.iconDefault = '';
    } )
  }

  //树的右键点击事件
  rightClick( { event, node } ) {
    var x = event.currentTarget.offsetLeft + event.currentTarget.clientWidth;
    var y = event.currentTarget.offsetTop;
    if(x > 265) {
       x = 275
    }
    if(y > 430) {
       y = y - 230
    }
    this.menuVisible = true;
    this.menuStyle.top = y + 6 + "px";
    this.menuStyle.left = x + 10 + "px";
    document.body.addEventListener( "click", this.bodyClick );
    //@ts-ignore
    this.rightClickData = node.dataRef;
  }

  toprev() {
    //@ts-ignore
    this.$router.go( -1 );
  }

}
</script>

<style lang="less" scoped>
.toprev {
  position: absolute;
  top: 2%;
  left: 0.1%;
  z-index: 999;
  cursor: pointer;
  font-size: 19px;
}

/deep/ .ant-menu-vertical .ant-menu-item {
  margin-top: 0;
  margin-bottom: 0;
  height: 35px;
}
</style>

<style lang="less">
.docManagenment {
  .ant-row {
    .ant-card-body {
    height: 787px;
    }
  }
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}

</style>


