<template>
  <article class="mainContainer">
    <!--    左 侧边栏 显示状态-->
    <a-card class="left_class" :class="isLeftShow ? 'cardShow' : 'cardHide'">
      <a-tabs defaultActiveKey="1">
        <a-tab-pane key="1" tab="模型管理">
          <div class="mainTree">
            <nav class="title">
              <a-input-search
                placeholder="请输入关键字进行搜索"
                size="small"
                :allowClear="true"
                @search="onSearch"
              />
            </nav>
            <div class="left_tree">
              <a-tree
                v-if="treeData.length !== 0"
                checkable
                selectable
                :defaultCheckedKeys="defaultCheckedKeys"
                :selectedKeys="selectedKeys"
                :loadData="onLoadData"
                :treeData="treeData"
                :replaceFields="replaceFields"
                @rightClick="calcAmount"
                @select="onSelect"
                @check="onCheck"
                :defaultExpandedKeys="treeExpandData"
              >
                <a-dropdown
                  slot="custome"
                  slot-scope="item"
                  :getPopupContainer="(triggerNode) => triggerNode"
                  :trigger="['contextmenu']"
                >
                  <span
                    v-if="highLightKeys.indexOf(item.eventKey) > -1"
                    style="color: #0bcda3"
                  >{{ item.taskName }}</span
                  >
                  <span v-else>{{ item.taskName }}</span>
                  <template #overlay>
                    <span
                      class="calcAmountPanel"
                      @click="calcAmount(item)"
                    >工程算量</span
                    >
                  </template>
                </a-dropdown>
              </a-tree>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="图层管理">
          <div class="mainTree">
            <nav class="title">
              <a-input-search
                placeholder="请输入关键字进行搜索"
                size="small"
                :allowClear="true"
                @change="onSearchTM"
                @pressEnter="EnterSearchOne"
                @search="onSearchOne"
              />
            </nav>
            <div class="left_tree">
              <a-tree
                v-if="TtreeData.length !== 0"
                :key="keyNum"
                checkable
                selectable
                :defaultCheckedKeys="TdefaultCheckedKeys"
                :checkedKeys="TcheckedKeys"
                :selectedKeys="TselectedKeys"
                :treeData="TtreeData"
                :defaultExpandedKeys="TtreeExpandData"
                :autoExpandParent="autoExpandParent"
                @check="setLayersVisible"
                @select="locationSymbolLayer"
                @Expand="onExpand"
              >
                <template slot="customeT" slot-scope="item">
                  <div class="customeT">
                    <span v-if="searchValue!==''&&item.title.indexOf(searchValue)>-1" style="color: #0bcda3">{{ item.title }}</span>
                    <span v-else>{{ item.title }}</span>
                    <slider
                      v-if="item.symbolId?false:true"
                      v-model="layeList[item.key].opacity"
                      :step="0.1"
                      :max="1"
                      @change="opacityChange(item.key)"/>
                  </div>
                </template>
              </a-tree>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
      <div class="cardOpt">
        <img
          v-show="isLeftShow"
          src="../../../../src/assets/extends/bim/frame_left_a1.png"
          @click="
            () => {
              this.isLeftShow = false;
            }
          "
          style="height: 100%; width: 100%"
        />
        <img
          v-show="!isLeftShow"
          src="../../../../src/assets/extends/bim/frame_left_a.png"
          @click="
            () => {
              this.isLeftShow = true;
            }
          "
          style="height: 100%; width: 100%"
        />
      </div>
    </a-card>
    <div
      :style="`display:${calcAmountStatus.visible ? 'flex' : 'none'}`"
      class="calcAmountContent"
    >
      <nav>
        <span>工程算量</span>
        <a-button type="primary" @click="exportCalcAmount">导出</a-button>
        <span class="closeCalcIcon" @click="initCalcAmount">x</span>
      </nav>
      <vxe-virtual-tree
        ref="CalcTableIns"
        :columns="calcAmountColumns"
        :data="calcAmountData.dataSources"
        :loading="calcAmountData.loading"
        border
        class="calcTable"
        height="285"
        highlightCurrentRow
        resizable
        rowKey
        showOverflow
        size="mini"
      />
    </div>
  </article>
</template>

<script lang="ts">
import {
  Component,
  InjectReactive,
  Prop,
  Ref,
  Vue,
  Emit,
  Watch,
} from "vue-property-decorator";
import {
  Card,
  Button,
  Icon,
  Table,
  Input,
  Tree,
  Dropdown,
  Spin,
  Tabs,
  Slider
} from "@h3/antd-vue";
import { Table as VXETable } from "vxe-table";
import { Utils } from "@ctesi/core";
import { Icon as CIcon } from "@ctesi/component";
import * as Type from "../../../type";
import {Layer} from "../type";
import OAuthApi from "@/apis/oauth";
import axios from "axios";
Vue.use(Tabs);

  interface KeyValue<T>{
    [key:string]:T
  }

@Component({
  name: "Measure",
  components: {
    ASpin: Spin,
    ADropdown: Dropdown,
    ACard: Card,
    AButton: Button,
    AInputSearch: Input.Search,
    ATree: Tree,
    ATable: Table,
    AIcon: Icon,
    CIcon: CIcon,
    ATabs: Tabs,
    Slider
  },
})
export default class measure extends Vue {
  // tabBarGutter:number=20;
  @Prop()
  private projectCode!: string;
  @Prop()
  private projectName!: string;
  @Prop()
  private tTreeData!:{
    S3MLayers: Layer[],
    OSGBLayers: Layer[],
    DOMLayers: Layer[],
    DEMLayers: Layer[],
    markerLayers:Layer[],
    modelLayers:Layer[],
    planeLayers:Layer[],
  };
  @InjectReactive("project")
  private appCode?: string;
  @InjectReactive("projectConfig")
  private projectConfig?: Type.ProjectConfig;
  @Ref()
  private CalcTableIns!: VXETable;
  private calcAmountStatus: { x: number; y: number; visible: boolean } = {
    x: 0,
    y: 0,
    visible: false,
  };
  private calcAmountColumns = [
    {
      title: "序号",
      field: "index",
      align: "center",
      width: 60,
    },
    {
      title: "构建类型",
      field: "type",
      align: "center",
      width: 200,
    },
    {
      title: "构建数量",
      field: "num",
      align: "center",
      width: 80,
    },
    {
      title: "造价",
      field: "price",
      align: "center",
      width: 60,
    },
    {
      title: "构建材质",
      field: "material",
      align: "center",
      width: 199,
    },
  ];
  private calcAmountData = {
    currentId: null,
    datas: [],
    loading: false,
    exportLoading: false,
    dataSources: [],
  };
  isLeftShow: boolean = true;
  //左侧项目树
  replaceFields = {
    key: "id",
    title: "taskName",
  };
  treeData: Array<any> = [];
  treeExpandData: Array<any> = [];
  checkedKeys: Array<any> = [];
  defaultCheckedKeys: Array<any> = [];
  selectedKeys: Array<any> = [];
  highLightKeys: Array<any> = [];

  TtreeData: Array<any> = [];
  TtreeExpandData: Array<any> = [];
  TcheckedKeys: Array<any> = [];
  TdefaultCheckedKeys: Array<any> = [];
  TselectedKeys: Array<any> = [];
  ThighLightKeys: Array<any> = [];
  autoExpandParent:boolean=false;
  searchValue:string="";

  layeList:KeyValue<Layer>={};
  keyNum:number=1;

  onSearch(value) {
    this.treeExpandData = [];
    this.treeData = [];
    if (value.length == 0) {
      this.initTree();
    } else {
      OAuthApi.getByCodeName({
        codeType: "MBS",
        projectCode: this.projectCode,
        projectName: this.projectName,
        name: value,
      }).then((res) => {
        if (res.errcode !== 0) return;
        //@ts-ignore
        this.slotAdapter(res.data.tree);
        this.treeData = res.data.tree;
        this.highLightKeys = res.data.selectedIds;
        this.treeExpandData = res.data.fatherIds;
      });
    }
  }

  //初始化左侧树
  initTree() {
    this.treeExpandData = [];
    //清空树默认勾选
    this.defaultCheckedKeys = [];
    OAuthApi.topTreeList({
      projectCode: this.projectCode,
      projectName: this.projectName,
      codeType: "",
    }).then((res) => {
      if (res.errcode === 0) {
        let resData = res.data;
        for (let i = 0; i < resData.length; i++) {
          if (!resData[i].children) {
            resData[i].isLeaf = true;
          }
          this.treeExpandData.push(resData[i].id);
          this.defaultCheckedKeys.push(resData[i].id);
        }
        this.slotAdapter(resData);
        this.treeData = resData;
        let temptKeys: any[] = [];
        if (this.treeData.length === 0) {
          // @ts-ignore
          this.$message.warn("暂无模型数据");
          this.isLeftShow = false;
        } else {
          temptKeys.push(this.treeData[0].id);
        }
        this.onCheck(this.defaultCheckedKeys, "start");
      } else {
        this.treeData = [];
        //@ts-ignore
        this.$message.warn(res.errmsg);
      }
    });
  }

  initTreeT(){
    this.TtreeExpandData = [];
    this.TtreeData=[
      {title:"模型图层",key:"S3MLayers",children:[]},
      {title:"倾斜图层",key:"OSGBLayers",children:[]},
      {title:"影像图层",key:"DOMLayers",children:[]},
      {title:"地形图层",key:"DEMLayers",children:[]},
      {title:"标注图层",key:"symbolLayers",children:[
        {title:"图片图层",key:"markerLayers",children:[]},
        {title:"模型图层",key:"modelLayers",children:[]},
        {title:"平面图层",key:"planeLayers",children:[]}
      ]}
    ];
    this.layeList={};
    //清空树默认勾选
    this.TdefaultCheckedKeys = [];
    for(let key in this.tTreeData){
      if(this.tTreeData[key].length>0){
        let children = this.createChildren(this.tTreeData[key],this.TdefaultCheckedKeys);
        let layers;
        if(key==="markerLayers"||key==="modelLayers"||key==="planeLayers"){
          layers=this.TtreeData.find(item=>item.key==="symbolLayers").children.find(item=>item.key===key);
        }else{
          layers=this.TtreeData.find(item=>item.key===key);
        }
        layers.children=children;
        if(this.TtreeExpandData.length<=0){
          this.TtreeExpandData.push(key);
        }
      }
    }
    this.TcheckedKeys=this.TdefaultCheckedKeys;
  }

  createChildren(items:Layer[],defaultCheckedKeys:string[]){
    let children=[];
    for (let index = 0; index < items.length; index++) {
      //@ts-ignore
      children.push({title:items[index].layerAlias,key:items[index].layerID,opacity:items[index].opacity,scopedSlots:{title:"customeT"},symbolId:items[index].symbolId,symbolPath:items[index].symbolPath});
      this.layeList[items[index].layerID]=items[index];
      if(items[index].visable)
      defaultCheckedKeys.push(items[index].layerID);
    }
    return children;
  }

  // @Emit("getSceneLayers")
  // @Emit("getSymbolLayers")
  created(){
  }

  mounted() {
    this.initTree();
    this.initTreeT();

  }

  // 左侧弹窗-树-多选
  async onCheck(checkedKeys, info) {
    this.checkedKeys = [];
    if (info == "start") {
      this.checkedKeys = checkedKeys;
      this.$emit("getShowHideData", true, "模型管理", this.checkedKeys);
    } else {
      if (info.checked === false) {
        this.checkedKeys.push(info.node.eventKey);
        this.$emit("getShowHideData", false, "模型管理", this.checkedKeys);
      } else {
        this.checkedKeys.push(info.node.eventKey);
        this.$emit("getShowHideData", true, "模型管理", this.checkedKeys);
      }
    }
  }

  @Emit("setLayersVisible")
  setLayersVisible(checkedKeys:string[],event){
    let layes:Layer[]=[];
    let checked=event.checked
    for (const key in this.layeList){
      if(checkedKeys.includes(key)===checked&&this.layeList[key].visable!=checked){
        let laye=this.layeList[key];
        laye.visable=checked;
        layes.push(laye);
      }
    }
    this.TcheckedKeys=checkedKeys;
    return {layers:layes,visible:checked};
  }

  @Emit("setSceneLayerOpacity")
  opacityChange(key:string){
    let laye = this.layeList[key];
    return {layerId:laye.layerID , layerType:laye.layerType , opacity:laye.opacity}
  }

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
      // 没有值根据当前父节点获取下面子节点并挂在树节点中，添加到对应父节点的children中
      OAuthApi.childTreeList({
        projectCode: this.projectCode,
        projectName: this.projectName,
        id: treeNode.$vnode.data.key,
        codeType: "MBS",
      }).then((res) => {
        for (let i = 0; i < res.data.length; i++) {
          if (!res.data[i].children) {
            res.data[i].isLeaf = true;
          }
        }
        this.slotAdapter(res.data);
        treeNode.dataRef.children = res.data;
        _this.treeData = [..._this.treeData];
      });
      //@ts-ignore
      resolve();
    });
  }

  // 树-选择
  async onSelect(selectedKeys) {
    if (selectedKeys.length == 0) {
      await this.onSelect(this.selectedKeys);
    } else {
      this.selectedKeys = selectedKeys;
      OAuthApi.getMBSData({
        projectCode: this.projectCode,
        mbsId: this.selectedKeys[0],
        projectName: this.projectName,
      }).then((res) => {
        if (res.errcode !== 0) return this.$message.warn(res.errmsg);
        this.$emit("modelHight", res.data);
      });
    }
  }

  @Emit("locationSymbolLayer")
  locationSymbolLayer(selectedKeys){
    if(selectedKeys.length<=0)return;
    let key=selectedKeys[0];
    let layer=this.layeList[key];
    this.TselectedKeys=selectedKeys;
    return layer
  }

  /*
   *  工程算量菜单
   * */
  private calcAmount(item) {
    if (!item.eventKey) return;
    const { appCode, projectConfig, calcAmountStatus, calcAmountData } = this;
    calcAmountStatus.visible = true;
    calcAmountData.currentId = item.id;
    this.getCalcAmount(item.id);
  }

  private slotAdapter(datas) {
    if (!Array.isArray(datas)) return;
    Utils.deepFind(
      datas,
      (item) => {
        item.scopedSlots = { title: "custome" };
        return false;
      },
      "children"
    );
  }

  public receiveModelInfoFromBim(data, requestData) {
    const { calcAmountStatus, calcAmountData, CalcTableIns } = this;
    if (!data) return;
    calcAmountStatus.visible = true;
    calcAmountData.dataSources = data;
    calcAmountData.datas = requestData;
    CalcTableIns.scrollTo(0, 0).then((instance) => {
      instance.scrollTo(0, 0);
    });
  }

  private initCalcAmount() {
    const { calcAmountStatus, calcAmountData } = this;
    calcAmountStatus.visible = false;
    calcAmountData.dataSources = [];
    calcAmountData.loading = false;
    calcAmountData.currentId = null;
    calcAmountData.datas = [];
  }

  private getCalcAmount(id: string) {
    const { projectConfig, appCode, calcAmountData, CalcTableIns } = this;
    if (!id || calcAmountData.loading) return;
    calcAmountData.loading = true;
    OAuthApi.engineerCalculation({
      appCode: appCode ?? "",
      projectName: projectConfig?.projectName ?? "",
      mbsId: id,
      pageSize: 99999,
    }).then((res) => {
      calcAmountData.loading = false;
      if (res.errcode !== 0) return this.$message.error(res.errmsg);
      if (res.data) {
        calcAmountData.dataSources = res.data.hits ?? [];
        CalcTableIns.scrollTo(0, 0).then((instance) => {
          instance.scrollTo(0, 0);
        });
      }
    });
  }

  private exportCalcAmount() {
    const { calcAmountData, appCode, projectConfig } = this;
    if (calcAmountData.exportLoading) return;
    if (calcAmountData.currentId) {
      this.engineerCalculationExport({
        appCode: appCode ?? "",
        projectName: projectConfig?.projectName ?? "",
        mbsId: calcAmountData.currentId ?? "",
      })
        .then((response) => {
          this.isExcel("xlsx", "工程算量", response);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      this.engineerCalculationExport({
        appCode: appCode ?? "",
        projectName: projectConfig?.projectName ?? "",
        datas: calcAmountData.datas,
      })
        .then((response) => {
          this.isExcel("xlsx", "工程算量", response);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  engineerCalculationExport(data) {
    return axios({
      method: "post",
      url: `/bim/data/treeNode/engineerCalculation/export`,
      responseType: "blob",
      data: data,
    });
  }

  isExcel(type, name, data) {
    const link = document.createElement("a");
    const blob = new Blob([data]);
    link.style.display = "none";
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${name}.` + type);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  dataList:any = [];

  generateList(data){
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const key = node.key;
      this.dataList.push({ key, title: node.title });
      if (node.children) {
        this.generateList(node.children);
      }
    }
  }

  getParentKey(key, tree){
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  }

  onSearchTM(e){
    this.searchValue=e.target.value;
    // if (e.target.value.length == 0) {
    //   this.$emit("getSceneLayers");
    //   this.$emit("getSymbolLayers");
    // } else {
    //   this.generateList(this.TtreeData);
    //   let treeExpandData = this.dataList
    //     .map(item => {
    //       if (item.title.indexOf(e.target.value) > -1) {
    //         return this.getParentKey(item.key, this.TtreeData);
    //       }
    //       return null;
    //     })
    //     .filter((item, i, self) => item && self.indexOf(item) === i);
    //     this.keyNum+=1;
    //     Object.assign(this,{TtreeExpandData:treeExpandData,autoExpandParent:true,searchValue:e.target.value});
    // }
  }
  EnterSearchOne(e){//图层管理回车搜索
    this.searchValue=e.target.value;
    if (e.target.value.length == 0) {
      this.$emit("getSceneLayers");
      this.$emit("getSymbolLayers");
    } else {
      this.generateList(this.TtreeData);
      let treeExpandData = this.dataList
        .map(item => {
          if (item.title.indexOf(e.target.value) > -1) {
            return this.getParentKey(item.key, this.TtreeData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
        this.keyNum+=1;
        Object.assign(this,{TtreeExpandData:treeExpandData,autoExpandParent:true,searchValue:e.target.value});
    }
  }
  onSearchOne(value){//图层管理点击搜索
    this.searchValue=value;
    if (value.length == 0) {
      this.$emit("getSceneLayers");
      this.$emit("getSymbolLayers");
    } else {
      this.generateList(this.TtreeData);
      let treeExpandData = this.dataList
        .map(item => {
          if (item.title.indexOf(value) > -1) {
            return this.getParentKey(item.key, this.TtreeData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      this.keyNum+=1;
      Object.assign(this,{TtreeExpandData:treeExpandData,autoExpandParent:true,searchValue:value});
    }
  }
  onExpand(expandedKeys){
    this.TtreeExpandData = expandedKeys;
    this.autoExpandParent = false;
  }

  // @Watch("tTreeData",{deep:true})
  treeDataChange(newVal,oldVal){
    this.initTreeT();
  }
}
</script>

<style lang="less" scoped>
@import "../BIMPlatform.module.less";
@import "../../../styles/antd.less";
/deep/.ant-tabs-nav-scroll {
  height: 2.3vw;
}

/deep/.ant-tabs-nav-animated {
  font-size: 1.3vw;
  color: #f3feff;
  font-weight: 900;
  height: 2.3vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

/deep/.ant-tabs-tab-active {
  // color: #04c3ad;
  font-weight: 900;
}

/deep/.ant-tabs-tab {
  padding: 0.7vw 0;
  font-size: 1vw;
  height: 2.3vw;
  line-height: .3vw;
}
/deep/.ant-tabs {
  width: 100%;
  padding-right: 1vw;
  .ant-tabs-bar{
    // margin-bottom: 0.42vw;
  }
}

.ant-card-bordered {
  border: 0 solid transparent;
  border-radius: 0;
}

.mainContainer {
  .flex;

  & .left_class {
    .flex;
    position: fixed;
    background: url("../../../../src/assets/extends/bim/frame_left.png");
    background-size: 100% 100%;
    border-color: transparent;
    padding: 0.05vw;
    width: 100%;
    .mainTree {
      // .flex;
      width: 100%;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;

      .title {
        float: left;
        width: 100%;
        height: auto;
        font-size: 20px;
        font-family: Microsoft YaHei, serif;
        font-weight: bolder;
        color: #ffffff;
        margin-bottom: 5px;

        & span[class~="ant-input-search"] {
          width: 95%;
          margin-top: 5px;
          margin-left: 2px;
        }
      }

      .left_tree {
        width: 95%;
        // height: 90%;
        overflow: auto;
        margin-top: 0;
        position: relative;

        /deep/ .ant-tree {
          height: 21.5vw !important;
        }
        .tree-transparent
      }
    }

    .cardOpt {
      // display: flex;
      height: 100%;
      // align-items: center;
      position: relative;
      top: 13.1vw;
      left: 0;
      // padding-top: 1.7vw;
      & > img {
        width: 1.4vw !important;
        height: 1.9vw !important;
        cursor: pointer;
      }
    }
  }
}

.cardShow {
  margin-left: 0 !important;
}

.cardHide {
  margin-left: -18vw !important;
}

.calcAmountPanel {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  background: #ffffff;
  z-index: 99999;
  background: url("../../../../src/assets/extends/bim/calcAmountBGNav.png")
    no-repeat;
  background-size: 100% 100%;
  font-size: 16px;
  font-family: Source Han Sans CN;
  font-weight: 400;
  color: #ffffff;
  width: 114px;
  height: 37px;
}

.calcAmountContent {
  flex-direction: column;
  width: 639px;
  height: 368px;
  background: url("../../../../src/assets/extends/bim/calcAmountBG.png")
    no-repeat;
  background-size: 100% 100%;
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 17px;
  margin: auto;

  & > nav {
    display: flex;
    align-items: center;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 10px;

    & > span:first-of-type {
      font-size: 18px;
      font-family: Source Han Sans CN;
      font-weight: bold;
      color: #ffffff;
      line-height: 24px;
    }

    & > button:first-of-type {
      margin-left: auto;
      min-width: 70px;
      height: 24px;
      border-radius: 4px;
    }
  }
}

.calcTable {
  & /deep/ div[class~="body--wrapper"] {
    background-color: transparent !important;
    color: #ffffff !important;
  }

  & /deep/ div[class~="vxe-table--header-border-line"] {
    border-bottom: none !important;
  }

  & /deep/ div[class~="vxe-table--border-line"] {
    border: none;
  }

  & /deep/ div[class~="vxe-table--header-border-line"] {
    border: none;
  }

  & /deep/ th[class~="vxe-header--column"] {
    //background: none !important;
    background: rgba(53, 130, 243, 0.1);
  }

  & /deep/ tr[class~="row--current"] {
    background: #5f6d74 !important;
  }

  & /deep/ td[class~="vxe-body--column"] {
    background: none !important;
  }
}

.closeCalcIcon {
  margin-left: 25px;
  margin-right: 10px;
  color: #ffffff;
  transform: scale(1.5);
  cursor: pointer;
}

::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent !important;
}

/deep/ .ant-card-body {
  flex-direction: row;
  display: flex;
  width: 21vw;
  justify-content: space-between;
  padding: 0 1.25vw;
}
.customeT {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  .ant-slider {
    width: 4.17vw;
    padding: 0 0 0 0;
    margin: 10px 6px 10px;
  }
}
</style>
