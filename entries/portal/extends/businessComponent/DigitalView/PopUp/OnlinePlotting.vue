<template>
  <article class="plotting-main">
    <vue-drag-resize :isResizable="false" :parentLimitation="false">
      <div class="plotting-container">
        <div class="navigation">
          <div
            v-for="(v,i) in naviList"
            class="navi-btn"
            :key="i"
            :class="v.name===naviChoose.name?'navi-hover':''"
            @click="getGroupSymbol(v)">
            <span>{{ v.name }}</span>
          </div>
        </div>
        <div class="plotting-detail">
          <p>{{ naviChoose.name }}</p>
          <div class="divider-line"></div>
          <div class="group-container">
            <div
              v-for="(v,i) in groupsData"
              :key="i"
              class="group-item"
              :class="groupChoose===v?'group-hover':''"
              @click="chooseGroup(v)">
              <span>{{ v.groupName }}</span>
            </div>
          </div>
          <div class="symbol-container">
            <div
              v-for="(v,i) in groupChoose.symbols"
              :key="i"
              class="symbol-item"
              :class="itemIndex===i||otherIndex===i?'item-hover':''">
              <img
                :id="v.symbolName"
                :src="require('../../../../src/assets/extends/cim/drawHandler'+v.thumbnail.split('drawHandler')[1])"
                alt=""
                v-if="v.thumbnail"
                @click="chooseSymbol(v,i)"
                @mouseenter="()=>{itemIndex=i}"
                @mouseleave="()=>{itemIndex=null}"/>
              <p
                @click="chooseSymbol(v,i)"
                @mouseenter="()=>{itemIndex=i}"
                @mouseleave="()=>{itemIndex=null}">{{ v.symbolName }}</p>
            </div>
          </div>
          <div class="detail-container">
            <div v-for="(v,i) in symbolList" :key="i" class="detail-item">
              <span @click="positon(v)" v-if="v.modelName">{{ v.modelName }}</span>
              <span @click="positon(v)" v-else>{{ v.symbolName }}</span>
              <div>
                <img
                  src="../../../../src/assets/extends/cim/drawonline/icon7.png"
                  alt=""
                  @click="()=>{isEdit=true;detailChoose=v;editIndex++}"/>
                <img
                  src="../../../../src/assets/extends/cim/drawonline/icon8.png"
                  alt=""
                  @click="deleteSymbol(v)"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="close-png" @click="closePop">X</p>
    </vue-drag-resize>
    <PlotEditting
      v-if="isEdit"
      :key="editIndex"
      :detailChoose="detailChoose"
      :projectName="projectName"
      @closeEdit="closeEdit"/>
  </article>
</template>

<script lang="ts">
/// <reference path="../../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";
import VueDragResize from "vue-drag-resize";
import * as ModelApi from "../../../service/modelInterface";
import PlotEditting from "./PlotEditting.vue";
import Utils from "../../../utils";

@Component({
  name: "OnlinePlotting",
  components: {VueDragResize, PlotEditting},
})
export default class OnlinePlotting extends Vue {
  @InjectReactive('project') projectCode!: string;

  @Prop() private projectName!: string;
  @Prop() private onlinePlotValue?: any;

  naviList: any[] = [
    {name: '图片标注', value: 'DRAW_MARKER'},
    /*    {name: '绘制点线面', value: 'DRAW_GEOMETRIC_PLANE'},
        {name: '绘制模型', value: 'DRAW_SYMBOL'},*/
    {name: '绘制文字', value: 'DRAW_LABEL'},
  ];
  naviChoose: { name: string, value: string } = {name: '图片标注', value: 'DRAW_MARKER'};
  groupsData: Array<{ [propsName: string]: any }> = [];
  groupChoose: { [propsName: string]: any } = {};
  symbolList: Array<{ [propsName: string]: any }> = [];
  isEdit: boolean = false;
  itemIndex: number | null = null;
  otherIndex: number | null = null;
  editIndex:number =0;
  detailChoose: { [propsName: string]: any } = {};//模型属性弹窗初始化数据

  @Watch('onlinePlotValue', {immediate: true})
  onlinePlotValueListener(v, oldV) {
    console.log('onlinePlotValueListener', v);
    if (!v || v === oldV) return;
    const value = v;
    // value.id=Utils.uuid();
    // value.modelName=v.symbolName;
    this.$set(value, 'projectName', this.projectName);
    const temp = {
      width: "52px",
      height: "52px",
      distanceDisplayCondition: {
        _near: 0,
        _far: 8400
      },
      isShowIcon: true,
      color: {
        red: 1,
        green: 1,
        blue: 1,
        alpha: 1
      },
      scale: 1,
      rotation: 0,
      fontStyle: {
        fontSize: "30px",
        fillColor: {
          red: 1,
          green: 0,
          blue: 0,
          alpha: 1
        }
      },
      scaleByDistance: {
        near: 0,
        nearValue: 1,
        far: 6000,
        farValue: 1.2
      },
      verticalOrigin: 1
    }
    this.$set(value, 'optionConfig', JSON.stringify(temp));
    if (v) {
      ModelApi.saveSymbolList({
        appCode: this.projectCode,
        symbolList: [value]
      }).then(res => {
        if (res.errcode !== 0) return this.$message.warning('保存失败');
        this.getSymbolList();
        this.detailChoose = value;
        this.isEdit = true;
        return this.$message.success('保存成功');
      })
    }
  }

  mounted() {
    this.getGroupSymbol(this.naviList[0]);
    this.getSymbolListLabel();
  }

  chooseGroup(v) {
    this.groupChoose = v;
  }

  closePop() {
    this.$emit('closePop', 'OnlineMapping')
  }

  closeEdit() {
    this.itemIndex = null;
    this.otherIndex = null;
    this.isEdit = false;
    this.getSymbolList();
  }

  chooseSymbol(v, i) {
    this.otherIndex = i;
    const temp = JSON.parse(JSON.stringify(v));
    temp.symbolId = v.id;
    temp.id = Utils.uuid();
    if (temp.symbolPath) {
      temp.symbolPath = v.symbolPath.indexOf('drawHandler') !== -1 ? v.symbolPath.split('drawHandler')[1] : v.symbolPath;
    }
    if (!temp.modelName) {
      temp.modelName = v.symbolName;
    }
    this.detailChoose = temp;
    if (temp.geometryType === "MARKER") {
      this.$emit("submitMessage", 'ImageMark_Create_Ready', temp);
    } else if (temp.geometryType === 'LABEL') {
      this.$emit("submitMessage", 'LabelMark_Create_Ready', temp);
    }
  }

  deleteSymbol(v) {
    ModelApi.deleteSymbolList({
      appCode: this.projectCode,
      id: v.id as string
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warning('删除失败');
      if (v.geometryType === "MARKER") {
        this.$emit("submitMessage", 'ImageMark_Delete', v);
      } else if (v.geometryType === 'LABEL') {
        this.$emit("submitMessage", 'LabelMark_Delete', v);
      }
      this.getSymbolList();
      this.isEdit = false;
      this.$message.success('删除成功');
    })
  }

  getGroupSymbol(v) {
    this.naviChoose = v;
    this.getSymbolList();
    ModelApi.getGroupSymbol({
      appCode: this.projectCode,
      projectName: this.projectName,
      groupOnwer: v.value
    }).then(res => {
      if (res.errcode === 0) {
        this.groupsData = res.data ?? [];
        this.chooseGroup(this.groupsData[0])
      }
    })
  }

  getSymbolList() {
    const geometryTypes: string = this.naviChoose.value.split('_')[1] as string;
    ModelApi.getSymbolList({
      appCode: this.projectCode,
      projectName: this.projectName,
      geometryTypes: geometryTypes
    }).then(res => {
      if (res.errcode === 0) {
        this.symbolList = res.data ?? [];
        this.symbolList.forEach(item => {
          const temp = JSON.parse(JSON.stringify(item));
          if (!temp.symbolId) {
            temp.symbolId = item.id;
          }
          if (temp.symbolPath) {
            temp.symbolPath = item.symbolPath.indexOf('drawHandler') !== -1 ? item.symbolPath.split('drawHandler')[1] : item.symbolPath;
          }
          if (geometryTypes === 'MARKER') {
            this.$emit("submitMessage", 'ImageMark_Show', temp);
          } else if (geometryTypes === 'LABEL') {
            this.$emit("submitMessage", 'LabelMark_Show', temp);
          }
        })
      }
    })
  }

  getSymbolListLabel() {
    const geometryTypes: string = this.naviChoose.value.split('_')[1] as string;
    ModelApi.getSymbolList({
      appCode: this.projectCode,
      projectName: this.projectName,
      geometryTypes: 'LABEL'
    }).then(res => {
      if (res.errcode === 0) {
        res.data?.forEach(item => {
          const temp = JSON.parse(JSON.stringify(item));
          if (!temp.symbolId) {
            temp.symbolId = item.id;
          }
          if (temp.symbolPath) {
            temp.symbolPath = item.symbolPath.indexOf('drawHandler') !== -1 ? item.symbolPath.split('drawHandler')[1] : item.symbolPath;
          }
          this.$emit("submitMessage", 'LabelMark_Show', temp);
        })
      }
    })
  }


  // 本地图片转换为base4的主要方法
  getBase64Image(img, width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width || img.width;
    canvas.height = height || img.height;
    let ctx = canvas.getContext('2d');
    //@ts-ignore
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL();
    return dataURL;
  }

  positon(v) {
    const temp = JSON.parse(JSON.stringify(v));
    // temp.symbolId = v.id;
    temp.symbolPath = v.symbolPath.indexOf('drawHandler') !== -1 ? v.symbolPath.split('drawHandler')[1] : v.symbolPath;
    this.detailChoose = temp;
    this.$emit("submitMessage", 'ImageMark_Positioning', temp);
  }

}
</script>

<style lang="less" scoped>
@import "../../../styles/antd.less";
@import "../../../styles/public.module.less";

.vdr.active:before {
  outline: 0px;
}

.plotting-main {
  position: absolute;
  top: 100px;
  left: 586px;
  z-index: 9;

  .plotting-container {
    .flex;
    width: 550px;
    height: 800px;
    padding: 20px 40px;

    .navigation {
      .flex-column;
      margin-right: 10px;

      .navi-btn {
        .flex;
        height: 35px;
        width: 132px;
        line-height: 35px;
        justify-content: center;
        margin-bottom: 6px;
        background: url("../../../../src/assets/extends/cim/drawonline/btn4.png");
        background-size: 100% 100%;
        cursor: pointer;

        & > span {
          color: #c9d5d7;
        }
      }

      .navi-hover {
        background: url("../../../../src/assets/extends/cim/drawonline/btn4-light.png");
        background-size: 100% 100%;

        & > span {
          color: #00bcd4;
        }
      }
    }

    .plotting-detail {
      background: url("../../../../src/assets/extends/cim/drawonline/bg.png");
      background-size: 100% 100%;
      width: 320px;
      height: 760px;
      padding: 20px 20px;

      & > p {
        color: #c9d5d7;
        display: inline-block;
        font-size: 18px;
        font-family: Microsoft YaHei, serif;
        font-weight: bolder;
      }

      .divider-line {
        height: 2px;
        margin: 10px 0;
        width: 80%;
        background-color: #00fdff59;
      }

      .group-container {
        .flex-wrap;
        width: 100%;
        max-height: 140px;
        overflow: auto;

        .group-item {
          width: 80px;
          margin: 5px;
          text-align: center;
          height: 25px;
          line-height: 25px;
          background-position: center center;
          background-repeat: no-repeat;
          background-image: url('../../../../src/assets/extends/cim/drawonline/btn1.png');
          background-size: 100% 100%;
          cursor: pointer;

          & > span {
            color: #fff;
          }
        }

        .group-hover {
          background-image: url('../../../../src/assets/extends/cim/drawonline/btn1-light.png');
          background-size: 100% 100%;

          & > span {
            color: #00bcd4;
          }
        }
      }

      .symbol-container {
        .flex-wrap;
        width: 100%;
        height: 220px;
        background-image: url('../../../../src/assets/extends/cim/drawonline/kuang3.png');
        background-size: 100% 100%;
        margin: 10px 0;
        overflow: auto;

        .scrollbar-default;

        .symbol-item {
          width: 20%;
          margin: 5px;
          text-align: center;

          & > img {
            width: 40px;
          }

          & > p {
            color: #ffff;
          }
        }

        .item-hover {

          & > p {
            color: #0a55fd;
          }
        }
      }

      .detail-container {
        .flex-column;
        width: 100%;
        height: 220px;
        background-image: url('../../../../src/assets/extends/cim/drawonline/kuang3.png');
        background-size: 100% 100%;
        margin: 30px 0;
        overflow: auto;

        .detail-item {
          .flex-space-between;
          width: 90%;
          height: 30px;
          margin-left: 5%;
          margin-right: 5%;

          & > span {
            color: #fff;
          }
        }
      }
    }
  }

  .close-png {
    color: #fff;
    z-index: 9999;
    position: absolute;
    top: 40px;
    right: -280px;
    cursor: pointer;
  }
}
</style>
