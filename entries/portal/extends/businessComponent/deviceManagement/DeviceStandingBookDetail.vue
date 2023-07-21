<template>
  <a-modal
    :title="selectDeviceName"
    :visible="showDeviceDetail"
    :footer="null"
    @cancel="closeDeviceDetailModal"
    wrapClassName="device-standing-book-detail"
    :destroyOnClose="true">
    <div class="top flex">
      <div class="left text-center full-height flex flex-column">
        <a-carousel autoplay>
          <img v-for="(pic,index) in deviceInfo.pics" :key="index" :src="pic"/>
        </a-carousel>
        设备图片
      </div>
      <div class="medium full-height">
        <h3 class="flex flex-center-align h3-img">
          <img src="../../../src/assets/extends/device/arrow.png" alt="">
          <b>基本信息</b>
        </h3>
        <div class="item" v-for="(item1,index1) in [{label:'设备名称',key:'deviceName'},{label:'设备编码',key:'deviceSn'},{label:'设备类型',key:'deviceType'},{label:'责任人',key:'manager'},{label:'登记(验收)日期',key:'registerDate'}]" :key="index1">
          {{ item1.label }}：<span class="key">{{ deviceInfo[item1.key] }}</span>
        </div>
        <h3 class="flex flex-center-align h3-img">
          <img src="../../../src/assets/extends/device/arrow.png" alt="">
          <b>仓库信息</b>
        </h3>
        <div class="item" v-for="item2 in [{label:'生产厂家',key:'industry'},{label:'厂家联系人',key:'producer'},{label:'联系方式',key:'phone'},{label:'出厂日期',key:'birth'}]" :key="item2.label">
          {{ item2.label }}：<span class="key">{{ deviceInfo[item2.key] }}</span>
        </div>
        <h3 class="flex flex-center-align h3-img">
          <img src="../../../src/assets/extends/device/arrow.png" alt="">
          <b>设备状态</b>
        </h3>
        <div class="item" v-show="deviceInfo.deviceState"><span class="state-s">{{ deviceInfo.deviceState }}</span></div>
      </div>
      <div class="right full-height">
        <div class="flex flex-space-between flex-center-align">
          <h3 class="flex flex-center-align h3-img">
            <img src="../../../src/assets/extends/device/arrow.png" alt="">
            <b>设备二维码：</b>
          </h3>
          <div>
            <a href="#" @click="showCapture=!showCapture"> {{ showCapture?'取消预览':'设备标识牌' }}</a>
            <a href="#" @click="doCut()" v-show="showCapture">下载</a>
          </div>
        </div>
        <img :src="deviceInfo.qrCodeUrl" alt="">
      </div>
    </div>
    <a-menu
      mode="horizontal"
      v-model="currentMenu"
      @click="changeMenu"
      class="bottom">
      <a-menu-item v-for="(menuName,index) in ['记录汇总','入/离场记录','使用记录','巡检记录','保养记录','维修记录','转交记录','报废记录']" :key="menuName">
        {{ menuName }}
      </a-menu-item>
    </a-menu>
    <component
      :is="currentComponent"
      class="component-base-style"
      :selectDeviceId="selectDeviceId"
      :currentMenu="currentMenu"></component>
    <div id="capture" class="identification" v-show="showCapture">
      <div>设备标识牌</div>
      <img :src="deviceInfo.qrCodeUrl" alt="">
      <table border="1">
        <tr>
          <td class="label">设备名称</td>
          <td class="value">{{ deviceInfo.deviceName }}</td>
        </tr>
        <tr>
          <td class="label">设备编号</td>
          <td class="value">{{ deviceInfo.deviceSn }}</td>
        </tr>
        <tr>
          <td class="label">设备类型</td>
          <td class="value">{{ deviceInfo.deviceType }}</td>
        </tr>
        <tr>
          <td class="label">责任人</td>
          <td class="value">{{ deviceInfo.manager }}</td>
        </tr>
        <tr>
          <td class="label">登记日期</td>
          <td class="value">{{ deviceInfo.registerDate }}</td>
        </tr>
      </table>
      <!--在这里编写需要截图的页面代码-->
    </div>
    <img :src="identification" alt="" class="identification-img">
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component,Prop,Watch,InjectReactive} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Menu from 'ant-design-vue/lib/menu';
import 'ant-design-vue/lib/menu/style/index.css';
import Carousel from 'ant-design-vue/lib/carousel';
import 'ant-design-vue/lib/carousel/style/index.css';
import {getDeviceInfoById} from "../../service/deviceInfo";
import {ProjectConfig,DeviceInfo} from "../../type";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import DeviceInfoSummary from "./DeviceInfoSummary.vue";
import AttendanceRecord from "./AttendanceRecord.vue";
import UsedRecord from "./UsedRecord.vue";
import InspectionRecord from "./InspectionRecord.vue";
import MaintainRecord from './MaintainRecord.vue';
import RepairRecord from "./RepairRecord.vue";
import ForwardRecord from "./ForwardRecord.vue";
import html2canvas from 'html2canvas';
import ScrapRecord from "./ScrapRecord.vue";
//@ts-ignore
@Component({
  name: 'DeviceStandingBookDetail',
  components: {
    AModal: Modal,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ACarousel: Carousel,
    staffSelector,
    DeviceInfoSummary,
    AttendanceRecord,
    UsedRecord,
    InspectionRecord,
    MaintainRecord,
    RepairRecord,
    ForwardRecord,
    ScrapRecord,
    //@ts-ignore
    html2canvas
  }
})
export default class DeviceStandingBookDetail extends Vue {
  @InjectReactive('project') projectCode!:string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig
  @Prop() showDeviceDetail!:boolean;
  @Prop() selectDeviceName!:string;
  @Prop() selectDeviceId!:string;
  @Watch('showDeviceDetail',{ deep: true})
  showDeviceDetailListner(val) {
    if(val) {
      this.initDeviceInfo();
      //获取设备详情数据
      this.getDeviceInfoById();
      this.currentMenu = ['记录汇总'];
    }
  }
  identification: string = '';
  showCapture: boolean = false;
  doCut() {
    //@ts-ignore
    html2canvas(document.querySelector('#capture')).then((canvas) => {
      const _vm = this;
      const img = new Image()
      img.src = canvas.toDataURL('png')
      img.setAttribute('crossOrigin', 'anonymous')
      canvas.height = 500 // 自定义图片宽度
      //@ts-ignore
      const context = canvas.getContext('2d');
      img.onload = function(){
        const w = img.width;
        const h = img.height;
        //@ts-ignore
        context.drawImage(img, 0, 0, w, h, 0, 0, w, h)
        _vm.identification = canvas.toDataURL('image/png');
        const base64 = _vm.identification.toString(); // imgSrc 就是base64哈
        const byteCharacters = atob(
          base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
        );
        const byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: undefined,
        });
        const aLink = document.createElement("a");
        aLink.download = "设备标识牌.jpg"; //这里写保存时的图片名称
        aLink.href = URL.createObjectURL(blob);
        aLink.click();
        // 根据生成的图片地址imgUrl（base64）进行后续保存操作
      }
    })
  }
  //
  currentComponent: any = DeviceInfoSummary;
  //menu
  currentMenu: string[] = [];
  changeMenu({item,key}) {
    switch (key) {
      case '记录汇总':
        this.currentComponent = DeviceInfoSummary;
       break;
      case '入/离场记录':
        this.currentComponent = AttendanceRecord;
       break;
      case '使用记录':
        this.currentComponent = UsedRecord;
        break;
      case '巡检记录':
        this.currentComponent = InspectionRecord;
        break;
      case '保养记录':
        this.currentComponent = MaintainRecord;
        break;
      case '维修记录':
        this.currentComponent = RepairRecord;
        break;
      case '转交记录':
        this.currentComponent = ForwardRecord;
        break;
      case '报废记录':
        this.currentComponent = ScrapRecord;
        break;
    }
  }
  //device-info
  deviceInfo: DeviceInfo = {
    id: '',
    deviceSn: '',
    deviceName: '',
    deviceState: '',
    deviceTypeId: '',
    deviceType: '',
    deviceTypeCode: '',
    deviceDesc: '',
    registerDate: '',
    manager: '',
    industry: '',
    birth: '',
    appCode: '',
    projectName: '',
    lastMaintainDate: '',
    lastCheckTime: '',
    qrCodeUrl: '',
    project: '',
    projectCompleteName: '',
    producer: '',
    phone: '',
    pics: []
  }
  initDeviceInfo() {
    this.deviceInfo = {
      id: '',
      deviceSn: '',
      deviceName: '',
      deviceState: '',
      deviceTypeId: '',
      deviceType: '',
      deviceTypeCode: '',
      deviceDesc: '',
      registerDate: '',
      manager: '',
      industry: '',
      birth: '',
      appCode: '',
      projectName: '',
      lastMaintainDate: '',
      lastCheckTime: '',
      qrCodeUrl: '',
      project: '',
      projectCompleteName: '',
      producer: '',
      phone: '',
      pics: []
    }
  }
  getDeviceInfoById() {
    // Object.assign(this.$data,this.$options.data(this));
    getDeviceInfoById({
      projectName: this.projectConfig?.projectName??'',
      appCode: this.projectCode??'',
      id: this.selectDeviceId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      for (const dataKey in this.deviceInfo) {
        if(res.data[dataKey]) {
          this.deviceInfo[dataKey] = res.data[dataKey]
        }
      }
    })
  }

  closeDeviceDetailModal() {
    this.$emit('closeDeviceDetailModal');
    this.currentComponent = DeviceInfoSummary;
    this.currentMenu = ['记录汇总'];
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
/deep/ .ant-carousel {
  flex: 1;
  .full-height;
  .slick-slide {
    .full-height;
    >div:first-child {
      .full-height;
    }
  }
}
/deep/ .device-standing-book-detail {
  .ant-modal {
    width: 80% !important;
    height: calc(100% - 100px);
    .ant-modal-content {
      .flex;
      .flex-column;
      .full-height;
      .ant-modal-body {
        .flex-1;
        .flex-column;
      }
      .top {
        height: 43%;
        .h3-img {
          img {
            width: 20px;
            height: 17.8px;
            margin-right: @spacing-base;
          }
          margin-bottom: 0;
        }
        .left {
          width: 20%;
          border-right: 2px solid #e8e8e8;
          padding-right: @spacing-base;
          font-weight: bold;
          img {
            width: 100%;
            height: 85%;
            margin-bottom: @spacing-base;
          }
        }
        .medium {
          padding: 0 @spacing-large;
          border-left: 2px solid #e8e8e8;
          border-right: 2px solid #e8e8e8;
          width: calc(60% - 1/2 *@spacing-base);
          margin: 0 1/4 * @spacing-base;
          font-weight: bold;
          h3:first-child {
            margin-bottom: 0;
          }
          h3:nth-child(7),h3:nth-child(12) {
            margin: @spacing-large 0 0 0;
          }
          .item {
            width: calc(33% - @spacing-base);
            margin-right: @spacing-base;
            display: inline-block;
            line-height: 2.5;
            .key {
              font-family: "文道潮黑";
            }
          }
          .state-s {
            background-color: @base-color;
            padding: 1/4 * @spacing-base;
            color: #FFFFFF;
            border-radius: 5px;
          }
        }
        .right {
          border-left: 2px solid #e8e8e8;
          width: 20%;
          padding-left: @spacing-large;
          a {
            margin-right: @spacing-base;
          }

          >img {
            width: 100%;
            height: 90%;
            margin: @spacing-base auto;
            display: block;
          }
        }
      }
      .component-base-style {
        .flex-auto;
        overflow: auto;
        padding: @spacing-base @spacing-medium;
      }
      .bottom {
        //height: calc(57% - @spacing-large);
        margin-top: @spacing-large;
      }
      .identification {
        width: 420px;
        //position: relative;
        position: absolute;
        left: calc(50% - 210px);
        top: calc(50% - 210px);
        background-color: #fff9f9;
        padding: @spacing-base;
        border: 2px solid #e8e8e8;
        box-shadow: 5px 5px #d9d9d9;

        >div:first-child {
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 5px;
          margin-bottom: @spacing-large;
        }
        img {
          position: absolute;
          height: 120px;
          width: 120px;
          right: 10px;
          bottom: 10px;
        }
        .label {
          font-size: 16px;
          font-weight: bold;
          letter-spacing: 2px;
          width: 135px;
          padding: @spacing-base @spacing-large;
        }
        .value {
          width: 300px;
          padding-left: @spacing-base;
          font-weight: bold;
        }
      }
      .identification-img {
        position: absolute;
        left: -10000px;
      }
    }
  }
}
/deep/ .ant-menu-item-selected {
  background: transparent !important;
}
</style>
