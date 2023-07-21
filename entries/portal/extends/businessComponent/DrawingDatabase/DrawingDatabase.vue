<template>
  <div class="archivesManagement">
    <!--    <Common-Header @isBimData="isBimData" />-->
    <a-spin
      :spinning="disabledPage"
      tip="请选择项目！！！只有项目级别才有图纸资料"
    >
      <a-icon
        slot="indicator"
        type="frown"
        style="font-size: 24px"
        spin />
      <main class="drawing_content">
        <section class="tree">
          <div class="tree_title">
            <h3>项目资料库</h3>
          </div>
          <div class="tree-content">
            <el-input
              class="tree-search"
              v-model="treeSearch"
              @change="onChange"
              placeholder="请输入关键字查找"
              suffixIcon="el-icon-search"
            >
            </el-input>
            <button class="addRootNode" @click="addRootNode">新增根节点</button>

            <a-tree
              class="filter-tree"
              :treeData="data"
              :autoExpandParent="autoExpandParent"
              :expandedKeys="expandedKeys"
              :replaceFields="replaceFields"
              @rightClick="handleFun"
              @select="select"
              @expand="onExpand"
            >
              <template slot="title" slot-scope="text">
                <span
                  v-if="highLight.indexOf(text.eventKey) > -1"
                  style="color: #0bcda3"
                >
                  {{ text.pdbsname }}
                </span>
                <span v-else>{{ text.pdbsname }}</span>
              </template>
            </a-tree>
          </div>
        </section>
        <div class="resize" title="收缩侧边栏">⋮</div>
        <section class="table">
          <div class="table_title flex">
            <h3>资料列表</h3>
            <div class="addTable">
              <el-input
                @change="searchTable"
                @clear="tableClear"
                clearable
                v-model="queryKeywords"
                placeholder="请输入关键字查找"
                suffixIcon="el-icon-search"
              >
              </el-input>
              <button @click="association">批量关联</button>
              <button @click="addFile">新增</button>
              <el-checkbox @change="checkboxChange" v-model="checked">
                显示全部资料
              </el-checkbox>
            </div>
          </div>
          <a-spin
            wrapperClassName="spinContainer"
            :spinning="spinShow"
            size="large"
            :tip="spinText"
          >
            <div class="table_content">
              <el-table
                :data="tableData"
                border
                stripe
                height="760px"
                @sort-change="sortChange"
                style="width: 100%"
                :headerCellStyle="{
                  background: '#EBEBEB',
                  'text-align': 'center',
                }"
                :cellStyle="{ 'text-align': 'center' }"
              >
                <el-table-column prop="index" label="序号" width="100">
                </el-table-column>
                <el-table-column label="附件" :sortable="'custom'">
                  <template slot-scope="scope">
                    <p @click="downloadFile(scope.row)" class="fujian">
                      {{
                        scope.row.attachment ? scope.row.attachment.name : ""
                      }}
                    </p>
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="drawingFileName" label="文件名称">
                </el-table-column> -->
                <el-table-column prop="userName" label="上传人" width="150">
                </el-table-column>
                <el-table-column
                  prop="uploadTime"
                  label="上传日期"
                  :sortable="'custom'"
                  width="400"
                >
                </el-table-column>

                <el-table-column label="操作" width="320">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      @click="handleDownload(scope.$index, scope.row)"
                    >
                      下载
                    </el-button>
                    <el-button
                      size="mini"
                      type="danger"
                      @click="handleDelete(scope.$index, scope.row)"
                    >
                      删除
                    </el-button>
                    <el-button
                      size="mini"
                      @click="handleEdit(scope.$index, scope.row)"
                    >
                      编辑
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div style="text-align: right">
                <el-pagination
                  @current-change="handleCurrentSuper"
                  @size-change="handleSizeChange"
                  :currentPage.sync="currentPage1"
                  :pageSizes="[10,20,50,100,200,300,500]"
                  :pageSize="pageSize"
                  layout="total,prev, pager, next,sizes"
                  :total="total"
                >
                </el-pagination>
              </div>
            </div>
          </a-spin>
        </section>
      </main>
    </a-spin>
    <!-- 右键点击树节点的菜单 -->
    <div
      class="popup_menu"
      v-if="isShowMenu"
      :style="{ top: menu_top, left: menu_left }"
    >
      <p @click="addTreeNode">新增</p>
      <p @click="upTreeNode">上移</p>
      <p @click="downTreeNode">下移</p>
      <p @click="upgradeTreeNode">升级</p>
      <p @click="downgradeTreeNode">降级</p>
      <p @click="delTreeNode">删除</p>
      <p @click="updateTreeNode">重命名</p>
    </div>
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
    <div class="tanchuang">
      <!-- 文件详情 -->
      <el-dialog @close="close" :visible.sync="isShowFile">
        <div class="file_details">
          <div class="file_title">
            <h4>文件详情</h4>
            <i @click="close">×</i>
          </div>
          <div class="information">
            <h5>基本信息</h5>
            <div class="flex">
              <div class="f50">
                <!-- <div class="info_box">
                <span class="spot"></span>
                <span class="info_title">文件名称 : </span>
                <el-input v-model="drawingFileName" placeholder=""> </el-input>
              </div> -->
                <div class="info_box">
                  <span class="spot"></span>
                  <span class="info_title">上传人 : </span>
                  <el-input v-model="userName" disabled placeholder="">
                  </el-input>
                </div>
                <div class="info_box">
                  <span class="spot"></span>
                  <span class="info_title">上传日期 : </span>
                  <el-date-picker
                    v-model="uploadTime"
                    type="datetime"
                    valueFormat="yyyy-MM-dd HH:mm:ss"
                    placeholder="选择日期时间"
                  >
                  </el-date-picker>
                </div>
              </div>
              <div class="info_box f50 flex">
                <div>
                  <span class="spot"></span>
                  <span class="info_title">附件上传 : </span>
                </div>
                <el-upload
                  class="upload-demo"
                  action=""
                  :httpRequest="Upload"
                  :onRemove="handleRemove"
                  multiple
                  :onChange="handleChange"
                  :fileList="attachmentList"
                  :disabled="disabled"
                >
                  <el-button :disabled="disabled" size="small" type="primary">
                    点击上传
                  </el-button>
                </el-upload>
              </div>
            </div>
          </div>
          <div class="relation_model">
            <h5>关联模型</h5>
            <div class="flex">
              <div class="tree">
                <div class="checkout">
                  <el-input
                    v-model="treeInput"
                    clearable
                    @change="onSearch"
                    placeholder="请输入关键字查找"
                    suffixIcon="el-icon-search"
                  >
                  </el-input>
                  <el-checkbox @change="checkboxComponent" v-model="checkeds">
                    勾选关联构件
                  </el-checkbox>
                </div>
                <a-tree
                  checkable
                  selectable
                  :checkStrictly="!checkeds"
                  :defaultCheckedKeys="defaultCheckedKeys"
                  :selectedKeys="selectedKeys"
                  :key="treeKey"
                  :loadData="onLoadData"
                  :treeData="treeData"
                  :replaceFields="replaceFieldss"
                  @check="onCheck"
                  :defaultExpandedKeys="treeExpandData"
                >
                  <template slot="title" slot-scope="text">
                    <span
                      v-if="highLightKeys.indexOf(text.eventKey) > -1"
                      style="color: #0bcda3"
                    >
                      {{ text.taskName }}
                    </span>
                    <span v-else>{{ text.taskName }}</span>
                  </template>
                </a-tree>
              </div>
              <div class="select">
                <h4>选中关联项</h4>
                <div>
                  <p v-for="(item, index) in leafList" :key="index">
                    <span>{{ item.taskName }}</span>
                    <i @click="delClick(item)">×</i>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="button">
            <div @click="close">取消</div>
            <div @click="sumbit">保存</div>
          </div>
        </div>
      </el-dialog>
      <!-- 批量关联 -->
      <el-dialog @close="close_relation" modal :visible.sync="isShowRelation">
        <div class="file_details">
          <div class="file_title">
            <h4>文件详情</h4>
            <i @click="close_relation">×</i>
          </div>
          <div class="tips">
            <img src="../../../src/assets/images/tips.png" alt="" />
            <span>
              如下图纸资料库与模型编码库关联多选框所示，选择图纸需要关联的模型编码点击关联按钮即建立关联绑定关系。
            </span>
          </div>
          <div class="batch_relation">
            <div class="batch_left">
              <h5>批量关联</h5>
              <div class="model_tree">
                <el-input
                  v-model="topTreeInput"
                  clearable
                  @change="onTopSearch"
                  placeholder="请输入关键字查找"
                  suffixIcon="el-icon-search"
                >
                </el-input>
                <a-tree
                  checkable
                  selectable
                  :defaultCheckedKeys="TopdefaultCheckedKeys"
                  :selectedKeys="TopselectedKeys"
                  :key="ToptreeKey"
                  :treeData="toptreeData"
                  :replaceFields="replaceFields"
                  @check="onTopCheck"
                  :defaultExpandedKeys="ToptreeExpandData"
                >
                  <template slot="title" slot-scope="text">
                    <span
                      v-if="TophighLightKeys.indexOf(text.eventKey) > -1"
                      style="color: #0bcda3"
                    >
                      {{ text.pdbsname }}
                    </span>
                    <span v-else>{{ text.pdbsname }}</span>
                  </template>
                </a-tree>
              </div>
            </div>
            <div class="batch_right">
              <h5>模型编码库</h5>
              <div class="model_tree">
                <el-input
                  v-model="treeInput"
                  clearable
                  @change="onSearch"
                  placeholder="请输入关键字查找"
                  suffixIcon="el-icon-search"
                >
                </el-input>
                <a-tree
                  checkable
                  selectable
                  :defaultCheckedKeys="defaultCheckedKeys"
                  :selectedKeys="selectedKeys"
                  :key="treeKey"
                  :loadData="onLoadData"
                  :treeData="treeData"
                  :replaceFields="replaceFieldss"
                  @check="onRelation"
                  :defaultExpandedKeys="treeExpandData"
                >
                  <template slot="title" slot-scope="text">
                    <span
                      v-if="highLightKeys.indexOf(text.eventKey) > -1"
                      style="color: #0bcda3"
                    >
                      {{ text.taskName }}
                    </span>
                    <span v-else>{{ text.taskName }}</span>
                  </template>
                </a-tree>
              </div>
            </div>
          </div>
          <div class="confirm" @click="confimClick">确认关联</div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Input from "element-ui/lib/input";
// import Tree from "element-ui/lib/tree";
// import CommonHeader from "../../../../src/components/shared/header/header.vue";
import DatePicker from "element-ui/lib/date-picker";
import env from "@/config/env";
import Dialog from "element-ui/lib/dialog";
import Upload from "element-ui/lib/upload";
import Checkbox from "element-ui/lib/checkbox";
import MessageBox from "element-ui/lib/message-box";
import Pagination from "element-ui/lib/pagination";
import { v4 as uuidv4 } from "uuid";
import { Tree, Spin } from "@h3/antd-vue";
import axios from "axios";
Vue.prototype.$confirm = MessageBox.confirm;
import {
  getPdbsTree,
  getRefreshPDBS,
  getmovePDBS,
  getChangRankPDBS,
  getUploadWithToken,
  getLeafMbsList,
  getDrawingListIPage,
  getRefreshDrawing,
  getAllDrawingByPdbsid,
  getBatchUpdateFileMbsRelation,
} from "./server/index.js";
import { ProjectLevel } from "../../constant";
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style/index.css";

export default {
  data() {
    return {
      disabled: false,
      replaceFields: {
        key: "id",
        title: "pdbsname",
      },
      replaceFieldss: {
        key: "id",
        title: "taskName",
      },
      leafList_part: [],
      drawingListDTOList: [],
      ToptreeExpandData: [],
      expandedKeys: [],
      attachmentList: [],
      leafList: [],
      toptreeData: [],
      treeData: [],
      BIM_URL: env.apiHost,
      pdbsIdList: [],
      treeExpandData: [],
      treeKey: 0,
      ToptreeKey: 0,
      TopselectedKeys: [],
      selectedKeys: [],
      mbsListArr: [],
      mbsList: [],
      TopdefaultCheckedKeys: [],
      defaultCheckedKeys: [],
      id: "",
      uploadTime: "",
      // drawingFileName: "", //文件名称
      searchValue: "",
      pdbssort: "",
      topTreeInput: "",
      pdbsname: "",
      pageSize: 20,
      pdbsId: "",
      queryKeywords: "",
      queryKeyword: "",
      treeInput: "",
      treeSearch: "",
      pdbs: "",
      state: "",
      fileState: "",
      tableId: "",
      input: "",
      filterText: "",
      dialogTableVisible: false,
      isShowRelation: false,
      isShowFile: false,
      isShowMenu: false,
      dialogVisible: false,
      FilePdbsname: "",
      menu_top: "",
      menu_left: "",
      user_id: "",
      userName: "",
      pid: "",
      currentPage1: 1,
      total: 1,
      data: [],
      highLight: [],
      tableData: [],
      file_mbs: {},
      spinShow: false,
      spinText: "加载中....",
      checked: false,
      checkeds: false,
      isAllDisplay: false,
      sortType: 0,
      disabledPage: true,
      autoExpandParent: true
    };
  },
  components: {
    ElInput: Input,
    // CommonHeader,
    ATree: Tree,
    ElUpload: Upload,
    ElDialog: Dialog,
    ElPagination: Pagination,
    ElCheckbox: Checkbox,
    ASpin: Spin,
    ElDatePicker: DatePicker,
    AIcon: Icon,
  },
  inject: ["projectConfig"],
  mounted() {
    this.dragControllerDiv();
    this.user_id = localStorage.getItem("user_id");
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    this.disabledPage = !(
      this.projectConfig.projectLevel === ProjectLevel["项目"]
    );
    this.userName = JSON.parse(sessionStorage.getItem("user")).name;
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month =
      nowDate.getMonth() + 1 < 10
        ? "0" + (nowDate.getMonth() + 1)
        : nowDate.getMonth() + 1;
    var day =
      nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
    var hours =
      nowDate.getHours() < 10 ? "0" + nowDate.getHours() : nowDate.getHours();
    var minutes =
      nowDate.getMinutes() < 10
        ? "0" + nowDate.getMinutes()
        : nowDate.getMinutes();
    var seconds =
      nowDate.getSeconds() < 10
        ? "0" + nowDate.getSeconds()
        : nowDate.getSeconds();
    this.uploadTime =
      year +
      "-" +
      month +
      "-" +
      day +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds;
    this.getTree();
    // 批量关联弹窗数据初始化，后续在点击事件中触发！！
    this.initTopTree();
    this.initTree();
    document.addEventListener("click", this.outClick);
  },
  methods: {
    checkboxComponent() {
      console.log(this.checkeds);
    },
    checkboxChange() {
      this.isAllDisplay = this.checked;
    },
    sortChange(val) {
      if (val.order == "ascending") {
        if (val.column.label == "附件") {
          this.sortType = 0;
        }
        if (val.column.label == "上传日期") {
          this.sortType = 2;
        }
      } else {
        if (val.column.label == "附件") {
          this.sortType = 1;
        }
        if (val.column.label == "上传日期") {
          this.sortType = 3;
        }
      }
      this.getTable();
    },
    dragControllerDiv() {
      var resize = document.getElementsByClassName("resize");
      var left = document.getElementsByClassName("tree");
      var mid = document.getElementsByClassName("table");
      var box = document.getElementsByClassName("drawing_content");
      for (let i = 0; i < resize.length; i++) {
        // 鼠标按下事件
        resize[i].onmousedown = function (e) {
          //颜色改变提醒
          resize[i].style.background = "#818181";
          var startX = e.clientX;
          resize[i].left = resize[i].offsetLeft;
          // 鼠标拖动事件
          document.onmousemove = function (evt) {
            var endX = evt.clientX;
            var moveLen = resize[i].left + (endX - startX); // （endx-startx）=移动的距离。resize[i].left+移动的距离=左边区域最后的宽度
            var maxT = box[i].clientWidth - resize[i].offsetWidth; // 容器宽度 - 左边区域的宽度 = 右边区域的宽度

            if (moveLen < 32) moveLen = 32; // 左边区域的最小宽度为32px
            if (moveLen > maxT - 150) moveLen = maxT - 150; //右边区域最小宽度为150px

            resize[i].style.left = moveLen; // 设置左侧区域的宽度

            for (let j = 0; j < left.length; j++) {
              left[j].style.width = moveLen + "px";
              mid[j].style.width = box[i].clientWidth - moveLen - 10 + "px";
            }
          };
          // 鼠标松开事件
          document.onmouseup = function (evt) {
            //颜色恢复
            resize[i].style.background = "#d6d6d6";
            document.onmousemove = null;
            document.onmouseup = null;
            resize[i].releaseCapture && resize[i].releaseCapture(); //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
          };
          resize[i].setCapture && resize[i].setCapture(); //该函数在属于当前线程的指定窗口里设置鼠标捕获
          return false;
        };
      }
    },
    // isBimData(val) {
    //   if (val) {
    //     this.toBimModel();
    //   } else {
    //     this.toProjectOverview();
    //   }
    // },
    //搜索表格
    searchTable(val) {
      this.queryKeyword = val;
      this.getTable();
    },
    tableClear() {
      this.queryKeyword = "";
      this.getTable();
    },
    //删除关联项
    delClick(val) {
      this.leafList.splice(
        this.leafList.findIndex((item) => item == val),
        1
      );
    },
    //树的搜索
    onSearch(value) {
      this.treeExpandData = [];
      this.treeData = [];
      if (value.length == 0) {
        this.initTree();
        this.treeKey += this.treeKey;
      } else {
        axios
          .get(this.BIM_URL + "/api/code_mbs/getByCodeName", {
            params: {
              codeType: "MBS",
              projectCode: this.projectCode,
              projectName: this.projectName,
              name: value,
            },
          })
          .then((res) => {
            this.treeKey += this.treeKey;
            this.treeData = res.data.tree;
            this.highLightKeys = res.data.selectedIds;
            this.treeExpandData = res.data.fatherIds;
          });
      }
    },
    //关联树的搜索
    onTopSearch(value) {
      this.ToptreeExpandData = [];
      this.toptreeData = [];
      if (value.length == 0) {
        this.initTopTree();
        this.ToptreeKey += this.ToptreeKey;
      } else {
        axios
          .get(
            this.BIM_URL +
              "/api/ebim/drawingLibrary/drawingManageTreeByKeyWords",
            {
              params: {
                projectCode: this.projectCode,
                projectName: this.projectName,
                queryKeyword: value,
              },
            }
          )
          .then((res) => {
            console.log(res);
            this.ToptreeKey += this.ToptreeKey;
            this.toptreeData = res.data.drawingManageTree;
            this.TophighLightKeys = res.data.selectedIdList;
            this.ToptreeExpandData = res.data.fatherIdList;
          });
      }
    },
    //保存
    sumbit() {
      if (this.fileState == "ADD") {
        // const temptUuid = uuidv4();
        // const uuid = temptUuid.split("-").join("");
        const cmd = {
          newDrawingDTO: {
            attachmentList: this.attachmentList,
            mbsList: this.leafList,
            drawingDirectoryName: this.FilePdbsname,
            // drawingFileName: this.drawingFileName,
            // id: uuid,
            pdbsid: this.pdbsId,
            pdbsname: this.FilePdbsname,
            state: this.fileState,
            uploadTime: this.uploadTime,
            userName: this.userName,
          },
          projectCode: this.projectCode,
          projectName: this.projectName,
          userId: this.user_id,
        };
        getRefreshDrawing(cmd).then((res) => {
          this.$message.success(res.data.message);
          this.getTable();
        });
      } else if (this.fileState == "UPDATE") {
        const cmd = {
          newDrawingDTO: {
            attachmentList: this.attachmentList,
            mbsList: this.leafList,
            drawingDirectoryName: this.FilePdbsname,
            // drawingFileName: this.drawingFileName,
            id: this.tableId,
            pdbsid: this.pdbsId,
            pdbsname: this.FilePdbsname,
            state: this.fileState,
            uploadTime: this.uploadTime,
            userName: this.userName,
          },
          projectCode: this.projectCode,
          projectName: this.projectName,
          userId: this.user_id,
        };
        getRefreshDrawing(cmd).then((res) => {
          this.$message.success(res.data.message);
          this.getTable();
        });
      }
      this.isShowFile = false;
    },
    Upload(val) {
      const newFile = new FormData();
      newFile.append("file", val.file);
      getUploadWithToken(newFile).then((res) => {
        if (res.errcode == 0) {
          this.$message.success(res.errmsg);
          this.attachmentList.push(res.data);
        }
      });
    },
    handleRemove(val, vals) {
      const newFile = new FormData();
      this.attachmentList = [];
      vals.forEach((e) => {
        newFile.append("file", e.raw);
        getUploadWithToken(newFile).then((res) => {
          if (res.errcode == 0) {
            this.attachmentList.push(res.data);
          }
        });
      });
    },
    handleChange(val) {
      console.log(val);
    },
    downloadFile(val) {
      // 取消上次延时未执行的方法
      clearTimeout(this.timeFn);
      this.timeFn = setTimeout(() => {
        window.open(val.previewUrl);
      }, 300);
    },
    //关闭文件详情弹窗
    close() {
      this.isShowFile = false;
      this.getTable();
      this.initTree();
    },
    //关闭批量关联弹窗
    close_relation() {
      this.isShowRelation = false;
      this.initTopTree();
      this.initTree();
    },
    association() {
      this.isShowRelation = true;
    },
    addFile() {
      if (this.pdbsId) {
        this.disabled = false;
        this.fileState = "ADD";
        // this.drawingFileName = "";
        this.attachmentList = [];
        this.leafList = [];
        var nowDate = new Date();
        var year = nowDate.getFullYear();
        var month =
          nowDate.getMonth() + 1 < 10
            ? "0" + (nowDate.getMonth() + 1)
            : nowDate.getMonth() + 1;
        var day =
          nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
        var hours =
          nowDate.getHours() < 10
            ? "0" + nowDate.getHours()
            : nowDate.getHours();
        var minutes =
          nowDate.getMinutes() < 10
            ? "0" + nowDate.getMinutes()
            : nowDate.getMinutes();
        var seconds =
          nowDate.getSeconds() < 10
            ? "0" + nowDate.getSeconds()
            : nowDate.getSeconds();
        this.uploadTime =
          year +
          "-" +
          month +
          "-" +
          day +
          " " +
          hours +
          ":" +
          minutes +
          ":" +
          seconds;
        this.isShowFile = true;
      } else {
        this.$message.error("请先选择图纸");
      }
    },
    deteleObject(obj) {
      var uniques = [];
      var stringify = {};
      for (var i = 0; i < obj.length; i++) {
        var keys = Object.keys(obj[i]);
        keys.sort(function (a, b) {
          return Number(a) - Number(b);
        });
        var str = "";
        for (var j = 0; j < keys.length; j++) {
          str += JSON.stringify(keys[j]);
          str += JSON.stringify(obj[i][keys[j]]);
        }
        if (!stringify.hasOwnProperty(str)) {
          uniques.push(obj[i]);
          stringify[str] = true;
        }
      }
      uniques = uniques;
      return uniques;
    },
    // 左侧弹窗-树-多选
    async onCheck(checkedKeys, info) {
      if (!info.checked) {
        const arr = info.node.$vnode.data.props;
        getLeafMbsList(
          this.projectCode,
          this.projectName,
          arr.id,
          arr.codeValue,
          this.checkeds
        ).then((ress) => {
          var set = ress.data.map((item) => item.id);
          this.leafList = this.leafList.filter(
            (item) => !set.includes(item.id)
          );
        });
      } else {
        this.leafList_part = [];
        if (info.checkedNodes.length > 0) {
          const val = info.node.$vnode.data.props;
          this.leafList_part = [];
          if (info.checkedNodes.length > 0) {
            getLeafMbsList(
              this.projectCode,
              this.projectName,
              val.id,
              val.codeValue,
              this.checkeds
            ).then((res) => {
              res.data.forEach((element) => {
                this.leafList_part.push(element);
              });
              this.leafList_part = this.deteleObject(this.leafList_part);
              this.leafList_part.forEach((ele) => {
                this.leafList.push(ele);
              });
              this.leafList = this.deteleObject(this.leafList);
            });
            // info.checkedNodes.forEach((e) => {
            //   getLeafMbsList(
            //     this.projectCode,
            //     this.projectName,
            //     e.data.props.id,
            //     e.data.props.codeValue
            //   ).then((res) => {
            //     res.data.forEach((element) => {
            //       this.leafList_part.push(element);
            //     });
            //     this.leafList_part = this.deteleObject(this.leafList_part);
            //     this.leafList_part.forEach((ele) => {
            //       this.leafList.push(ele);
            //     });
            //     this.leafList = this.deteleObject(this.leafList);
            //   });
            // });
          } else {
            this.leafList = [];
          }
        }
      }
    },
    //确认关联
    async confimClick() {
      this.mbsListArr.forEach((e) => {
        this.mbsList.push(e.data.props.dataRef);
      });
      this.file_mbs = {
        drawingListDTOList: this.drawingListDTOList,
        mbsList: this.mbsList,
        projectCode: this.projectCode,
        projectName: this.projectName,
        userId: this.user_id,
      };
      await getBatchUpdateFileMbsRelation(this.file_mbs).then((ress) => {
        this.$message.success(ress.errmsg);
        this.isShowRelation = false;
      });
    },
    // 批量关联 树-多选
    onTopCheck(checkedKeys, info) {
      this.pdbsIdList = checkedKeys;
      this.drawingListDTOList = [];
      this.pdbsIdList.forEach((e) => {
        getAllDrawingByPdbsid(this.projectCode, this.projectName, e).then(
          (res) => {
            if (res.data.length > 0) {
              res.data.forEach((element) => {
                this.drawingListDTOList.push(element);
              });
            }
          }
        );
      });
    },
    // 模型编码库-多选
    onRelation(checkedKeys, info) {
      this.mbsListArr = info.checkedNodes;
    },
    getTable() {
      this.spinShow = true;
      getDrawingListIPage(
        this.projectCode,
        this.projectName,
        this.pdbsId,
        this.currentPage1,
        this.pageSize,
        this.isAllDisplay,
        this.sortType,
        this.queryKeyword
      ).then((res) => {
        if (res.data) {
          this.tableData = res.data.records;
          this.total = res.data.total;
          this.spinShow = false;
        }
      });
    },
    select(id, node) {
      this.pdbsId = node.node.$vnode.data.props.id;
      this.FilePdbsname = node.node.$vnode.data.props.pdbsname;
      this.getTable();
    },
    //初始化左侧树
    initTree() {
      this.treeExpandData = [];
      //清空树默认勾选
      this.defaultCheckedKeys = [];
      //配置接口路径
      let url = this.BIM_URL + "/api/code_mbs/top_tree_list";
      axios
        .get(url, {
          params: {
            projectCode: this.projectCode,
            projectName: this.projectName,
            parentId: "",
            codeType: "",
          },
        })
        .then((res) => {
          if (res.errcode === 0) {
            let resData = res.data;
            for (let i = 0; i < resData.length; i++) {
              if (resData[i].children === undefined) {
                resData[i].isLeaf = true;
              }
              this.$set(resData[i], "key", resData[i].id);
              this.treeExpandData.push(resData[i].id);
            }
            this.treeData = resData;
            this.treeKey += 1;
            let temptKeys = [];
            if (this.treeData.length === 0) {
              this.isLeftShow = false;
            } else {
              temptKeys.push(this.treeData[0].key);
            }
            // this.onCheck(this.defaultCheckedKeys, "start");
          } else {
            this.treeData = [];
          }
        });
    },
    //初始化批量关联树
    initTopTree() {
      this.ToptreeExpandData = [];
      //清空树默认勾选
      this.TopdefaultCheckedKeys = [];
      //配置接口路径
      let url = this.BIM_URL + "/api/ebim/drawingLibrary/topDrawingManageTree";
      axios
        .get(url, {
          params: {
            projectCode: this.projectCode,
            projectName: this.projectName,
          },
        })
        .then((res) => {
          if (res.errcode === 0) {
            let resData = res.data;
            for (let i = 0; i < resData.length; i++) {
              if (resData[i].children === undefined) {
                resData[i].isLeaf = true;
              }
              this.$set(resData[i], "key", resData[i].id);
              this.ToptreeExpandData.push(resData[i].id);
            }
            this.toptreeData = resData;
            this.ToptreeKey += 1;
            let temptKeys = [];
            if (this.toptreeData.length === 0) {
              this.isLeftShow = false;
            } else {
              temptKeys.push(this.toptreeData[0].key);
            }
            // this.onCheck(this.defaultCheckedKeys, "start");
          } else {
            this.toptreeData = [];
          }
        });
    },
    // 批量关联树 异步加载
    // onTopLoadData(treeNode) {
    //   const _this = this;
    //   return new Promise((resolve) => {
    //     if (
    //       treeNode.dataRef.children != undefined &&
    //       treeNode.dataRef.children.length > 0
    //     ) {
    //       // 有值了直接渲染
    //       //@ts-ignore
    //       resolve();
    //       return;
    //     }
    //     //配置接口路径
    //     let url =
    //       this.BIM_URL + "/api/ebim/drawingLibrary/childDrawingManageTree";
    //     let params = {
    //       projectCode: this.projectCode,
    //       projectName: this.projectName,
    //       pidList: treeNode.$vnode.data.key,
    //     };
    //     axios
    //       .get(url, {
    //         params: params,
    //       })
    //       .then((res) => {
    //         console.log('res',res)
    //         for (let i = 0; i < res.data.length; i++) {
    //           if (res.data[i].children == undefined) {
    //             res.data[i].isLeaf = true;
    //           }
    //         }
    //         treeNode.dataRef.children = res.data;
    //         _this.treeData = [..._this.treeData];
    //       });
    //     //@ts-ignore
    //     resolve();
    //   });
    // },
    // 树 异步加载
    onLoadData(treeNode) {
      const _this = this;
      return new Promise((resolve) => {
        if (
          treeNode.dataRef.children != undefined &&
          treeNode.dataRef.children.length > 0
        ) {
          // 有值了直接渲染
          //@ts-ignore
          resolve();
          return;
        }
        //配置接口路径
        let url = this.BIM_URL + "/api/code_mbs/child_tree_list";
        let params = {
          projectCode: this.projectCode,
          projectName: this.projectName,
          id: treeNode.$vnode.data.key,
          codeType: "MBS",
        };
        axios
          .get(url, {
            params: params,
          })
          .then((res) => {
            for (let i = 0; i < res.data.length; i++) {
              if (res.data[i].children == undefined) {
                res.data[i].isLeaf = true;
              }
            }
            treeNode.dataRef.children = res.data;
            _this.treeData = [..._this.treeData];
          });
        //@ts-ignore
        resolve();
      });
    },
    //增加
    addTreeNode() {
      this.state = "ADD";
      this.input = "";
      this.dialogVisible = true;
    },
    //重命名
    updateTreeNode() {
      this.state = "UPDATE";
      this.input = "";
      this.dialogVisible = true;
    },
    //新增根节点
    addRootNode() {
      this.state = "ADDROOT";
      this.input = "";
      this.pid = "";
      this.dialogVisible = true;
    },
    //确定
    define() {
      const temptUuid = uuidv4();
      const uuid = temptUuid.split("-").join("");
      if (this.state == "ADD" || this.state =="ADDROOT") {
        if (this.input) {
          const cmd = {
            newPdbsDTO: {
              id: uuid,
              pdbsname: this.input,
              pid: this.state == "ADD"? this.id: '',
              projectName: this.projectName,
              state: this.state,
            },
            projectCode: this.projectCode,
            projectName: this.projectName,
            userId: this.user_id,
          };
          getRefreshPDBS(cmd).then((res) => {
            if (res.data.sucFlag) {
              this.dialogVisible = false;
              this.$message.success(res.data.message);
              this.getTree();
            } else {
              this.dialogVisible = false;
              this.$message.error("添加失败！");
            }
          });
        } else {
          this.dialogVisible = false;
          this.$message.error("未输入名称，添加失败");
        }
      } else if (this.state == "UPDATE") {
        if (this.input) {
          const cmd = {
            newPdbsDTO: {
              id: this.id,
              pdbsname: this.input,
              pdbs: this.pdbs,
              pdbssort: this.pdbssort,
              pid: this.pid,
              projectName: this.projectName,
              state: this.state,
            },
            projectCode: this.projectCode,
            projectName: this.projectName,
            userId: this.user_id,
          };
          getRefreshPDBS(cmd).then((res) => {
            if (res.data.sucFlag) {
              this.dialogVisible = false;
              this.$message.success(res.data.message);
              this.getTree();
            } else {
              this.dialogVisible = false;
              this.$message.error("重命名失败！");
            }
          });
        } else {
          this.dialogVisible = false;
          this.$message.error("未输入名称，重命名失败！");
        }
      }
    },
    //上移
    upTreeNode() {
      this.state = "UP";
      const cmd = {
        newPdbsDTO: {
          id: this.id,
          pdbsname: this.pdbsname,
          pdbs: this.pdbs,
          pdbssort: this.pdbssort,
          pid: this.pid,
          projectName: this.projectName,
          state: this.state,
        },
        projectCode: this.projectCode,
        projectName: this.projectName,
        userId: this.user_id,
      };
      getmovePDBS(cmd).then((res) => {
        if (res.data.sucFlag) {
          this.$message.success(res.data.message);
          this.getTree();
        } else {
          this.$message.error("上移失败！");
        }
      });
    },
    //下移
    downTreeNode() {
      this.state = "DOWN";
      const cmd = {
        newPdbsDTO: {
          id: this.id,
          pdbsname: this.pdbsname,
          pdbs: this.pdbs,
          pdbssort: this.pdbssort,
          pid: this.pid,
          projectName: this.projectName,
          state: this.state,
        },
        projectCode: this.projectCode,
        projectName: this.projectName,
        userId: this.user_id,
      };
      getmovePDBS(cmd).then((res) => {
        if (res.data.sucFlag) {
          this.$message.success(res.data.message);
          this.getTree();
        } else {
          this.$message.error("下移失败！");
        }
      });
    },
    //升级
    upgradeTreeNode() {
      this.state = "UPGRADE";
      const cmd = {
        newPdbsDTO: {
          id: this.id,
          pdbsname: this.pdbsname,
          pdbs: this.pdbs,
          pdbssort: this.pdbssort,
          pid: this.pid,
          projectName: this.projectName,
          state: this.state,
        },
        projectCode: this.projectCode,
        projectName: this.projectName,
        userId: this.user_id,
      };
      getChangRankPDBS(cmd).then((res) => {
        if (res.data.sucFlag) {
          this.$message.success(res.data.message);
          this.getTree();
        } else {
          this.$message.error("升级失败！");
        }
      });
    },
    //降级
    downgradeTreeNode() {
      this.state = "DOWNGRADE";
      const cmd = {
        newPdbsDTO: {
          id: this.id,
          pdbsname: this.pdbsname,
          pdbs: this.pdbs,
          pdbssort: this.pdbssort,
          pid: this.pid,
          projectName: this.projectName,
          state: this.state,
        },
        projectCode: this.projectCode,
        projectName: this.projectName,
        userId: this.user_id,
      };
      getChangRankPDBS(cmd).then((res) => {
        if (res.data.sucFlag) {
          this.$message.success(res.data.message);
          this.getTree();
        } else {
          this.$message.error("降级失败！");
        }
      });
    },
    //删除
    delTreeNode() {
      this.state = "DELETE";
      const cmd = {
        newPdbsDTO: {
          id: this.id,
          pdbsname: this.pdbsname,
          pdbs: this.pdbs,
          pdbssort: this.pdbssort,
          pid: this.pid,
          projectName: this.projectName,
          state: this.state,
        },
        projectCode: this.projectCode,
        projectName: this.projectName,
        userId: this.user_id,
      };
      getRefreshPDBS(cmd).then((res) => {
        if (res.data.sucFlag) {
          this.$message.success(res.data.message);
          this.getTree();
        } else {
          this.$message.error(res.data.message);
        }
      });
    },
    outClick() {
      this.isShowMenu = false;
    },
    getTree() {
      getPdbsTree(this.projectCode, this.projectName).then((res) => {
        // this.expandedKeys = [];
        for (let i = 0; i < res.data.length; i++) {
          this.expandedKeys.push(res.data[i].id);
        }
        this.data = res.data;
      });
    },
    //左侧树的展开事件
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    //左侧树的关键字搜索
    onChange(value) {
      this.expandedKeys = [];
      this.data = [];
      if (value.length == 0) {
        this.getTree();
      } else {
        axios
          .get(
            this.BIM_URL +
              "/api/ebim/drawingLibrary/drawingManageTreeByKeyWords",
            {
              params: {
                projectCode: this.projectCode,
                projectName: this.projectName,
                queryKeyword: value,
              },
            }
          )
          .then((res) => {
            this.data = res.data.drawingManageTree;
            this.highLight = res.data.selectedIdList;
            this.expandedKeys = res.data.fatherIdList;
          });
      }
    },
    handleFun(event) {
      const val = event.node.$vnode.data.props;
      this.isShowMenu = true;
      console.log(event);
      this.menu_top = event.event.clientY - 210 + "px";
      this.menu_left = event.event.clientX + 20 + "px";
      this.pid = val.pid;
      this.id = val.id;
      this.pdbs = val.pdbs;
      this.pdbssort = val.pdbssort;
      this.pdbsname = val.pdbsname;
    },
    handleCurrentSuper(val) {
      this.currentPage1 = val;
      this.getTable();
    },
    handleSizeChange(val){
      console.log(val);
      this.pageSize=val;
      this.getTable();
    },
    handleEdit(index, row) {
      this.disabled = true;
      this.fileState = "UPDATE";
      this.attachmentList = row.attachmentList;
      this.leafList = row.mbsList;
      this.tableId = row.id;
      // this.drawingFileName = row.drawingFileName;
      this.uploadTime = row.uploadTime;
      this.userName = row.userName;
      this.FilePdbsname = row.pdbsname;
      this.pdbsid = row.pdbsid;
      this.isShowFile = true;
    },
    handleDelete(index, row) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          row.state = "DELETE";
          const cmd = {
            newDrawingDTO: row,
            projectCode: this.projectCode,
            projectName: this.projectName,
            userId: this.user_id,
          };
          getRefreshDrawing(cmd).then((res) => {
            this.$message.success(res.data.message);
            this.getTable();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    handleDownload(index, row) {
      window.open(`${env.apiHost}${row.url}`);
      // row.urlList.forEach((e) => {
      //   window.open(this.BIM_URL + e);
      // });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // toProjectOverview() {
    //   this.$router.push({
    //     name: "BimDelivery",
    //     query: {
    //       projectId: this.$route.query.projectId,
    //       projectName: this.$route.query.projectName,
    //       projectCode: this.$route.query.projectCode,
    //       isBim: false,
    //     },
    //   });
    // },
    // toBimModel() {
    //   this.$router.push({
    //     name: "BimDelivery",
    //     query: {
    //       projectId: this.$route.query.projectId,
    //       projectName: this.$route.query.projectName,
    //       projectCode: this.$route.query.projectCode,
    //       isBim: true,
    //     },
    //   });
    // },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
};
</script>

<style lang="less" scoped>
.archivesManagement {
  height: 100%;

  .flex {
    display: flex;
  }
  //
  //.f1 {
  //  flex: 1;
  //}
  //
  //.f20 {
  //  width: 20%;
  //}
  //
  //.f50 {
  //  width: 50%;
  //}
  //
  //.f80 {
  //  width: 80%;
  //}
  //
  //.f100 {
  //  width: 100%;
  //}
  //nav {
  //height: 65px;
  //width: 100%;
  //background: url("../../../src/assets/images/top.png");
  //background-size: 100% 100%;
  //display: flex;
  //color: #fff;
  //div {
  //  text-align: center;
  //  line-height: 53px;
  //  img {
  //    vertical-align: middle;
  //    margin-right: 10px;
  //  }
  //  span {
  //    vertical-align: middle;
  //    cursor: pointer;
  //    color: #fff;
  //    cursor: pointer;
  //  }
  //}
  //.username {
  //  text-align: right;
  //  padding-right: 15px;
  //  line-height: 45px;
  //  img {
  //    cursor: pointer;
  //  }
  //}
  //.title {
  //  font-size: 28px;
  //  padding-left: 42px;
  //  letter-spacing: 5px;
  //  font-weight: 700;
  //  width: 30%;
  //  font-family: MF LiHei;
  //}
  //}
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

  .drawing_content {
    display: flex;
    height: calc(100% - 65px);

    .tree {
      width: 18%;
      padding: 5px;
      box-sizing: border-box;
      //height: 100%;
      background: #fff;
      //background: #202431;
      color: #fff;

      .tree_title {
        width: 100%;
        height: 40px;
        border: 1px solid #e8e8e8;
        background: #f8fbff;
        line-height: 40px;
        padding: 0 20px;
        box-sizing: border-box;

        h3 {
          //color: #fff;
          font-size: 15px;
          height: 80%;
          //text-align: center;
          //line-height: 50px;
          //background: url("../../../src/assets/images/projectselection_.png");
          //background-size: 100% 100%;
        }
      }

      .tree-content {
        //height: calc(100% + 34px);
        height: 105%;
        width: 100%;
        background: #fff;
        padding: 20px;
        box-sizing: border-box;
        .tree-search {
          /deep/ .el-input__inner {
            color: #0a0a0a !important;
          }
        }
        /deep/.el-input__suffix{
            height: 30px;
          /deep/.el-input__icon{
            line-height: 30px;
          }
        }
      }
    }

    .table {
      width: 82%;
      background: #f4f6fc;
      box-sizing: border-box;

      .table_title {
        width: 100%;
        height: 40px;
        border: 1px solid #e8e8e8;
        background: #f8fbff;
        line-height: 40px;
        padding: 0 20px;
        box-sizing: border-box;

        h3 {
          width: 70%;
          //color: #2970ff;
          font-size: 15px;
        }

        .addTable {
          display: flex;
          width: 30%;

          .el-input {
            width: 45%;
            height: 25px;
            margin: 0 30px 0 -70px;
          }
          /deep/.el-input__suffix{
            height: 25px !important;
            line-height: 45px !important;
          }


          button:nth-child(2) {
            width: 70px;
            margin-right: 10px;
          }

          button:nth-child(3) {
            width: 50px;
            margin-right: 20px;
          }

          button {
            cursor: pointer;
            margin-top: 9px;
            //background: #2970ff;
            //color: #fff;
            height: 25px;
            text-align: center;
            line-height: 25px;
            background-color: #ffffff;
            color: rgba(0, 0, 0, 0.65);
            border: 1px solid #d9d9d9;
            box-shadow: 0 2px 0 rgb(0 0 0 / 2%);
            border-radius: 4px;
          }
        }
      }

      .table_content {
        //height: calc(100% - 40px);
        height: 105%;
        width: 100%;
        background: #fff;
        padding: 20px;
        box-sizing: border-box;
      }
    }
  }

  .popup_menu {
    position: absolute;
    width: 100px;
    height: 210px;
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

  .file_details {
    // position: absolute;
    // top: 200px;
    // left: 600px;
    /deep/.el-input__suffix{
      //height: 38px !important;
      /deep/.el-input__icon{
        line-height: 38px !important;
      }
    }
    width: 800px;
    padding: 35px;
    padding-top: 22px;
    height: 650px;
    //background: url("../../../src/assets/images/pop3.png");
    //background-size: 100% 100%;
    .file_title {
      display: flex;
      height: 50px;
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(153, 153, 153, 0.5);

      h4 {
        width: 94%;
        font-size: 18px;
        line-height: 49px;
        padding-left: 10px;
        font-weight: bold;
      }

      i {
        display: inline-block;
        width: 6%;
        cursor: pointer;
        font-size: 30px;
      }
    }

    h5 {
      font-size: 15px;
      font-family: Source Han Sans CN;
      font-weight: bold;
      line-height: 15px;
      color: #333333;
      border-left: 3px solid #40a9ff;
      height: 15px;
      padding-left: 10px;
      margin-bottom: 15px;
    }

    .information {
      margin-bottom: 15px;
      height: 30%;

      .el-input {
        width: 70%;
        height: 30px;
        padding-right: 10px;

      }

      .el-button {
        margin-top: -6px;
      }


    }

    .spot {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #1d83bc;
      border-radius: 50%;
      margin-right: 5px;
      vertical-align: middle;
    }

    .info_title {
      display: inline-block;
      letter-spacing: 2px;
      width: 80px;
      font-size: 13px;
      color: #999;
    }

    .info_box {
      margin-bottom: 30px;
    }

    .button {
      display: flex;
      padding-left: 50%;

      div {
        width: 160px;
        height: 40px;
        border-radius: 4px;
        color: #fff;
        text-align: center;
        cursor: pointer;
        line-height: 40px;
        margin-right: 10px;
      }

      :nth-child(1) {
        background: #b1b6be;
      }

      :nth-child(2) {
        background: #1584ff;
      }
    }

    .tips {
      height: 30px;
      line-height: 25px;
      margin-bottom: 5px;
      padding-left: 10px;

      span {
        color: #999999;
        font-size: 13px;
        vertical-align: middle;
      }

      img {
        width: 15px;
        height: 15px;
        vertical-align: middle;
        margin-right: 10px;
      }
    }

    .batch_relation {
      display: flex;
      margin-bottom: 10px;
      height: 70%;

      .batch_left {
        flex: 1;
        padding: 10px;
        border: 1px solid #cecece;
        margin-right: 10px;
        height: 100%;

        .model_tree {
          height: 85%;
        }
      }

      .batch_right {
        flex: 1;
        padding: 10px;
        border: 1px solid #cecece;
        height: 100%;
        overflow-x: auto;

        .model_tree {
          height: 85%;
        }
      }
    }

    .confirm {
      width: 170px;
      height: 42px;
      background: #1584ff;
      border-radius: 4px;
      text-align: center;
      margin-left: auto;
      color: #fff;
      font-size: 16px;
      line-height: 40px;
      cursor: pointer;
    }
  }

  .relation_model {
    height: 280px;

    .flex {
      height: 90%;
    }

    .tree {
      width: 66%;
      border: 1px solid #cecece;
      height: 90%;
      padding: 5px;
      margin-right: 10px;
    }

    .checkout {
      display: flex;
      justify-content: space-around;
    }

    .select {
      width: 30%;
      height: 90%;
      background: #f4f5fa;
      border-radius: 2px;

      h4 {
        font-size: 14px;
        font-weight: 700;
        height: 30px;
        line-height: 30px;
        margin: 0 10px;
        border-bottom: 1px solid rgba(153, 153, 153, 0.2);
        margin-bottom: 10px;
      }

      div {
        height: 79%;
        overflow-y: auto;
      }

      p {
        color: #666666;
        padding-left: 15px;
        margin-bottom: 5px;
      }

      span {
        vertical-align: top;
      }

      i {
        display: inline-block;
        height: 20px;
        font-size: 28px;
        line-height: 18px;
        cursor: pointer;
        color: #f12c32;
      }
    }
  }

  .fujian {
    color: #2970ff;
    cursor: pointer;
    margin-bottom: 5px;
  }

  /deep/ .ant-spin-nested-loading > div > .ant-spin {
    max-height: 800px;
  }

  /deep/ .tree-content {
    max-height: 800px;
    overflow-y: auto;
  }
}
.resize {
  cursor: col-resize;
  position: relative;
  margin: auto 0;
  background-color: #d6d6d6;
  border-radius: 5px;
  width: 10px;
  height: 50px;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  font-size: 32px;
  color: white;
}
</style>

<style lang="less">
.archivesManagement {
  .drawing_content .ant-tree-switcher {
    color: #333 !important;
  }
  .relation_model {
    .el-input {
      width: 70%;
      height: 15%;
    }

    .el-input__inner {
      height: 27px;
      line-height: 27px;
    }

    .ant-tree {
      height: 85%;
      overflow-y: auto;
    }
  }

  .batch_relation {
    .el-input {
      width: 70%;
      height: 15%;
    }

    .el-input__inner {
      height: 35px;
      line-height: 35px;
    }

    .ant-tree {
      height: 90%;
      overflow-y: auto;
    }
  }

  .info_box {
    .el-input__inner {
      height: 30px !important;
      line-height: 30px;
    }
  }

  .el-input__icon {
    line-height: 30px;
  }

  .drawing_content {
    .tree {
      .el-input__inner {
        height: 30px !important;
        line-height: 30px;
        margin-bottom: 15px;
        background: none;
        color: #fff;
        border: 1px solid #c0c4cc;
      }
    }

    .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
      background: none;
      color: #1584ff;
    }

    .ant-tree li .ant-tree-node-content-wrapper:hover {
      background: none;
      color: #1584ff;
    }

    .ant-tree-switcher {
      color: #fff;
    }

    .el-upload-list {
      margin: 0;
      padding: 0;
      list-style: none;
      height: 120px;
      overflow-y: auto;
    }

    .table {
      .el-input__inner {
        height: 25px;
        line-height: 25px;
      }
    }

    .number:before {
      content: none;
    }
  }

  .tanchuang {
    .el-dialog {
      width: 41%;
      height: 65%;
      //border: none;
      //background: none;
      //box-shadow: none;
      .el-dialog__header {
        padding: 0;
      }

      .el-dialog__body {
        padding: 0;
      }

      .el-dialog__headerbtn {
        display: none;
      }
    }

    .el-header {
      background-color: #b3c0d1;
      color: #333;
      line-height: 60px;
    }

    .el-aside {
      color: #333;
    }

    .el-table {
      tr {
        color: #333;
      }
    }
  }
}

.table_content {
  .el-table {
    margin-bottom: 16px;
  }
}
.el-upload-list {
  overflow-y: auto;
  height: 120px;
}
</style>
