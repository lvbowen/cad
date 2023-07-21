<template>
  <div class="equipment-board" ref="equipmentBoardRef">
    <div :class="{'device-hidden-hidden':!expand}" class="device-hidden-visible flex flex-column">
      <div class="device-menu flex flex-center flex-auto">
        <div v-for="(item,index) in equipmentBoardData.types" :key="index" :class="activeEquipments.includes(item.type)?'active-types':''">
          <img :alt="item.desc" :src="activeEquipments.includes(item.type)?require(`./img/indexes/${item.type}_active.png`):require(`./img/indexes/${item.type}.png`)" @click="changeActiveEquipments(item.type)">
          <div>{{ item.type==='AI'?'AI识别':item.type==='CAR'?'车辆抓拍':item.type==='DISCHARGE'?'卸料平台':item.type==='EDGEPROTECT'?'临边防护':item.type==='ELECSAFTY'?'安全用电':item.type==='ELECMETER'?'智能电表':item.type==='NUTRISK'?'预警螺母':'智能水表' }}</div>
        </div>
      </div>
      <div class="flex switch">
        <a-checkbox :checked="switchMark" @change="switchMarkFn" v-if="equipmentBoardData.markAuth">标注设备</a-checkbox>
        <!--        <a-checkbox @change="isShowEquipmentsFn" :checked="isShowEquipments">全部显示</a-checkbox>-->
        <div>
          <a-checkbox :checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange">
            全部显示
          </a-checkbox>
        </div>
      </div>
    </div>
    <img
      :src="expand?require('./img/indexes/up.png'):require('./img/indexes/down.png')"
      alt=""
      class="expand"
      @click="expand=!expand"/>
    <div v-show="switchMark" class="mark-equipment-list flex-end">
      <div class="lable flex flex-center-align flex-center-justify" @click="isShowEquipmentsIcons">
        <span v-show="!showNotMarkList" class="label-close">X</span>
        <div>
          <span
            v-for="(item,index) in 3"
            v-show="showNotMarkList"
            :key="index"
            class="label-list"></span>
        </div>
      </div>
    </div>
    <div v-show="!showNotMarkList && switchMark" class="equipment-list">
      <div v-for="(item,index) in equipmentNotMarkList" :key="index">
        <div v-if="item.deviceList.length" class="equipment-not-mark-list">
          <div v-for="(device,key) in item.deviceList" :key="key" class="device-list">
            <drag-resize @dragstop="(e)=> dragstop(e,index,device.id,device)">
              <a-tooltip :title="device.deviceName" placement="rightTop">
                <img :src="require(`./img/${device.type}.png`)" alt="">
              </a-tooltip>
            </drag-resize>
          </div>
        </div>
      </div>
    </div>
    <div :key="markedEquipment.length">
      <div v-for="(item,index) in markedEquipment" :key="index" class="marked-device">
        <!--        :style="{left:`${item.width}%`,top:`${item.height}%`}"-->
        <drag-resize
          :isDraggable="switchMark"
          :class="`drag${index}`"
          :x="item.width/100 *boxWidth"
          :y="item.height/100 *boxHeigth"
          @clicked="openDeviceDialog(item)"
          @dragging="dragging"
          @dragstop="(e)=> dragstop(e,'marked',item.id,item)">
          <a-tooltip :title="item.deviceName">
            <img
              :src="require(`./img/${item.type}.png`)"
              alt=""
            />
          </a-tooltip>
        </drag-resize>
      </div>
    </div>
    <a-modal
      v-model="isShowModal"
      :closable="false"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      wrapClassName="device-modal">
      <component
        :is="curModule"
        :currentDeviceName="currentDeviceName"
        :currentDeviceSn="currentDeviceSn"
        :projectName="projectName"
        @closeModal="closeModal"
      ></component>
    </a-modal>
    <img :src="!equipmentBoardData.backImageUrl?require('./img/bg-device.png'):equipmentBoardData.backImageUrl" alt="" class="board-bg-img full">
    <div v-if="!equipmentBoardData.backImageUrl" class="tip">注意：该项目模型标注图未配置，请联系管理员配置！(现为示例图)</div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from 'vue-property-decorator';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Checkbox from 'ant-design-vue/lib/checkbox';
import 'ant-design-vue/lib/checkbox/style/index.css';
import {exampleData} from '../../engineeringArchives/mock';
import { equipmentNotMarkList } from "./equipmentConfig";
import DragResize from 'vue-drag-resize';
import AIRecognition from './AIRecognition.vue';
import CarCaptured from './CarCaptured.vue';
import EdgeProtect from "./EdgeProtect.vue";
import ElecSafty from "./ElecSafty.vue";
import NutWarning from "./NutWarning.vue";
import WaterMeter from "./Watermeter.vue";
import ElecMeter from "./ElecMeter.vue";
import Discharge from "./Discharge.vue";
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import {DevicePosition, DevicePositionNodes} from "../../../type";
import { getDevicesPosition,updateDevicesPosition } from "../../../service/api";
import * as Type from "../../../type";

@Component({
  name: 'EquipmentBoard',
  components: {
    ATooltip: Tooltip,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    DragResize,
    AIRecognition,
    EdgeProtect,
    CarCaptured,
    ElecSafty,
    NutWarning,
    WaterMeter,
    ElecMeter,
    Discharge,
    AModal: Modal
  }
})
export default class EquipmentBoard extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode?: string;
  @Prop() projectName!: string;
  equipmentBoardData:DevicePosition={
    nodes: [],
    types: [],
    backImageUrl: '',
    markAuth: false
  };
  markedEquipment: DevicePositionNodes[] = [];
  copyMarkedEquipment: DevicePositionNodes[] = [];
  switchMark: boolean = false;
  // isShowEquipments: boolean = true;
  // activeEquipments: string[]= [];
  showNotMarkList: boolean = false;
  equipmentNotMarkList: {key:string,deviceList:any[]}[] = [];
  expand:boolean = true;
  curModule:any = null;
  isShowModal: boolean = false;
  isDragging:boolean = false;
  //全选/全不选/不全选处理
  activeEquipments: string[]= [];
  indeterminate:boolean = false;
  checkAll:boolean = true;
  plainOptions:string[] = [];
  currentDeviceSn: string = '';
  currentDeviceName:string = '';
  //
  boxWidth:number = 0;
  boxHeigth:number = 0;
  mounted() {
    // this.equipmentBoardData = exampleData.response.data.device;
    window.addEventListener('resize',this.init)
    this.init();
  };
  destroyed() {
    window.removeEventListener('resize',this.init)
  }

  init() {
    const ref =this.$refs.equipmentBoardRef as HTMLElement;
    this.boxWidth = ref.offsetWidth;
    this.boxHeigth = ref.offsetHeight;
    this.equipmentBoardData = {
      nodes: [],
      types: [],
      backImageUrl: this.equipmentBoardData.backImageUrl,
      markAuth: this.equipmentBoardData.markAuth
    }
    this.markedEquipment = [];
    this.copyMarkedEquipment = [];
    this.equipmentNotMarkList = [];
    this.activeEquipments = [];
    this.plainOptions = [];
    getDevicesPosition({appCode:this.projectCode??'',projectName:this.projectName??''}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.equipmentBoardData = res.data;
      // this.equipmentBoardData = exampleData.response.data.device;
      this.equipmentNotMarkList = JSON.parse(JSON.stringify(equipmentNotMarkList));
      this.equipmentBoardData.nodes.map((node) => {
        if (node.marked) {
          this.markedEquipment.push(node);
          this.copyMarkedEquipment.push(node);
        }else {
          this.equipmentNotMarkList.map((i) => {
            if(i.key===node.type) {
              i.deviceList.push(node)
            }
          })
        }
      })
      this.equipmentNotMarkList = this.equipmentNotMarkList.filter((t)=> {
        return t.deviceList.length>0;
      })
      //indexs
      this.equipmentBoardData.types.map((item) => {
        this.activeEquipments.push(item.type);
        this.plainOptions.push(item.type);
      })
      this.onChange();
      console.log(this.equipmentBoardData, 'equipmentBoardData','equipmentNotMarkList',this.equipmentNotMarkList,this.markedEquipment,'markedEquipment')

    })
  }

  switchMarkFn(e) {
    this.switchMark = e.target.checked
  };

  // isShowEquipmentsFn(e) {
  //   // this.isShowEquipments = e.target.checked
  //   // if(this.isShowEquipments){
  //   //
  //   // }
  // };

  isShowEquipmentsIcons() {
    this.showNotMarkList = !this.showNotMarkList;
  };
  dragstop(e,index,id,item) {
    let left:number = 0;
    let top:number = 0;
    if(index!=='marked') { //mark   - false
      left = 8 + e.left;
      top = 212 + e.top + index * (65 + 8);
    }else {
      left = e.left;
      top = e.top;
    }
    this.isDragging = false;
    const ref =this.$refs.equipmentBoardRef as HTMLElement
    console.log(ref.offsetHeight,ref.offsetWidth,'11',)
    console.log(e, index,id, '1', left, top,item,'item')
    if(item.width===left&&item.height===top) return;
    //保存标注位置
    updateDevicesPosition({
      appCode:this.projectCode??'',
      id: id,
      width:parseFloat(((left/ref.offsetWidth)*100).toFixed(4)),
      height: parseFloat(((top/ref.offsetHeight)*100).toFixed(4))
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.init();
    })
    //初始化界面 - 注意：标注值保持不变：showNotMarkList/switchMark
  };
  dragging() {
    // console.log('frage')
    this.isDragging = true;
  }
  openDeviceDialog(item:DevicePositionNodes) {
    setTimeout(()=> {
      if(!this.isDragging) {
        this.currentDeviceSn = item.deviceCode;
        this.currentDeviceName = item.deviceName;
        this.isShowModal = true;
        switch (item.type) {
          case 'AI':
            this.curModule = AIRecognition;
            break;
          case 'CAR':
            this.curModule = CarCaptured;
            break;
          case 'DISCHARGE':
            this.curModule = Discharge;
            break;
          case 'EDGEPROTECT':
            this.curModule = EdgeProtect;
            break;
          case 'ELECSAFTY':
            this.curModule = ElecSafty;
            break;
          case 'ELECMETER':
            this.curModule = ElecMeter;
            break;
          case 'NUTRISK':
            this.curModule = NutWarning;
            break;
          case 'WATERMETER':
            this.curModule = WaterMeter;
            break;
          default:
            break;
        }
      }
    },200)
  };
  closeModal() {
    this.isShowModal = false;
    this.curModule = null;
    this.currentDeviceSn = '';
    this.currentDeviceName = '';
  }

  changeActiveEquipments(type:string) {
    if(this.activeEquipments.includes(type)) {
      this.activeEquipments = this.activeEquipments.filter((item)=> {
        return item!==type
      })
      //隐藏type-icon逻辑
      this.markedEquipment = this.markedEquipment.filter((i)=> {
        return i.type!==type
      })
    }else {
      this.activeEquipments.push(type);
      //显示对应type-icon逻辑
      this.copyMarkedEquipment.map((i)=> {
        if(i.type===type) {
          this.markedEquipment.push(i)
        }
      })
    }
    //全选状态
    // this.isShowEquipments = this.equipmentBoardData.types.every((typeItem) => {
    //   return this.activeEquipments.includes(typeItem.type)
    // })
    this.onChange()
  }
  //
  onChange() {
    this.indeterminate = !!this.activeEquipments.length && this.activeEquipments.length < this.plainOptions.length;
    this.checkAll = this.activeEquipments.length === this.plainOptions.length;
  }
  onCheckAllChange(e) {
    Object.assign(this, {
      activeEquipments: e.target.checked ? this.plainOptions : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
    //type-icon显影逻辑
    if(e.target.checked) {
      this.markedEquipment = [...this.copyMarkedEquipment]
    }else {
      this.markedEquipment = [];
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';

@label-height: 36px;
@equipment-icon-width: 44px;
@equipment-icon-height: 65px;
@base-zIndex:10;
.bg-img{
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.equipment-board {
  .board-bg-img {
    position: absolute;
    top: 0;
    left: 0;
  }
  //background-image: url("./img/bg-device.png");
  //.bg-img;
  position: relative;
  color: #ffffff;
  .height(100%);
  padding: 0 !important;
  //.background-full("../basicCustomComponent/systemConfig/EquipmentBoard/img/bg-device.png");
  //.background-full("@/src/assets/extends/bg1.png")
  .device-hidden-visible {
    z-index: @base-zIndex;
    position: relative;
    width: 100%;
    height: 7.83333vw;
    margin: 0 auto;
    padding: @spacing-base 0 @spacing-base 0;
    background: rgba(0,0,0,0.6);
    //&::before {
    //  content: "";
    //  position: absolute;
    //  width: 100%;
    //  height: 100%;
    //  top: 0;
    //  left: 0;
    //  z-index: 5;
    //  background-image: url("../../../src/assets/extends/bim/frame_bottom.png");
    //  .bg-img;
    //
    //  transform: rotate(180deg);
    //}
    .device-menu {
      transition: all 0.5s;
      .active-types {
        color: #00FFFF;
      }
      >div {
        z-index: @base-zIndex;
        margin-left: 2 * @spacing-large;
        color:#909399;
        img {
          width: 50px;
          height: 50px;
          margin-bottom: @spacing-base;
        }
      }
    }
    //>img {
    //  position: absolute;
    //  bottom: 0;
    //  z-index: @base-zIndex;
    //  //left: 50%;
    //}
    //.hide-cursor {
    //  transform: translateX(-50%) translateY(20%);
    //}
    //.show-cursor {
    //  transform: translateX(-50%) rotateX(180deg) translateY(-15%);
    //}
    .switch {
      padding: @spacing-base;

      /deep/ .ant-checkbox-wrapper {
        color: #ffffff;
        z-index: @base-zIndex;
      }
    }
  }
  .expand {
    position: relative;
    z-index: @base-zIndex;
    margin-top: -5px;
  }
  .device-hidden-hidden {
    margin-top: -7.83333vw;
  }
  .marked-device {
    img {
      position: absolute;
      width: @equipment-icon-width;
      height: @equipment-icon-height;
    }
  }

  /deep/ .vdr {
    .content-container {
      width: @equipment-icon-width !important;
      height: @equipment-icon-height !important;
      z-index: @base-zIndex;
    }

  }

  .mark-equipment-list {
    z-index: @base-zIndex - 2;
    align-items: flex-start;
    padding: 2 *@spacing-large 0 0 3/2 *@spacing-base;
    position: absolute;
    top: 112px;
    left: 0;
    .lable {
      background-color: rgb(255, 255, 255);
      width: @label-height;
      height: @label-height;
      line-height: @label-height;
      border-radius: 50%;
      transition: all 0.5s;
      margin-right:1/2 * @spacing-base;

      .label-close {
        font-size: 1.5em;
        font-weight: bold;
        color: #1f5098;
        cursor: pointer;
      }

      .label-list {
        font-size: 0.8em;
        width: 18px;
        height: 3px;
        left: 9px;
        background-color: rgb(31, 80, 152);
        display: block;

        &:nth-child(2) {
          margin: 3px 0;
        }
      }
    }
  }
  .equipment-list {
    position: absolute;
    top: 212px;
    padding-left: @spacing-base;
    .equipment-not-mark-list {
      margin-bottom: @spacing-base;
      height: @equipment-icon-height;
      position: relative;

      .device-list {
        position: absolute;
        left: 0;
        img {
          width: @equipment-icon-width;
          height: @equipment-icon-height;
        };
      }
    }
  }
  .device-modal {
    position: absolute;
    z-index: 15;
    width: 80%;
    left: 10%;
    height: 80%;
  }
  .tip {
    position: absolute;
    z-index: @base-zIndex;
    bottom: @spacing-large;
    right: @spacing-large;
  }
}
/deep/ .device-modal {
  .ant-modal {
    width: 90% !important;
    top: 168px;
    height: calc(100% - 168px);
    padding-bottom: 2.5 *@spacing-large;
    .ant-modal-content {
      background-color: transparent;
      height: 100%;
    }
  }
  .ant-modal-body {
    height: 100%;
    padding: 0;
  }
}
</style>
