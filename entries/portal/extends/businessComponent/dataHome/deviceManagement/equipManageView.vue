<template>
  <div class="main">
    <Row v-if="!imgShow" :gutter="[16,16]">
      <Col :span="7">
      <div class="containerBox">
        <span class="mainTitle">丨  设备统计</span>
        <h5 style="color:#fff;margin:15px">类型分布</h5>
        <article class="equipRunStatics">
          <div v-for="(v,k,i) in allData.equipRunStatics" :key="i">
            <p>{{ k }}</p>
            <span :style="{color:k==='总数'?'#00C6FB':k==='正常'?'#00FE65':'#fe3300'}">{{ v }}</span>
          </div>
        </article>
        <BarEchart id="bacharts1" :chartData="barData" style="width: 95%;height: 220px;margin-left: 3%"></BarEchart>
      </div>
      </Col>
      <Col :span="10">
      <div class="containerBox">
        <baidu-map
          :scrollWheelZoom="true"
          :center="center"
          :zoom="zoom"
          style="height: 100%"
          enableDragging="false"
          @ready="handler"
        >
          <bml-marker-clusterer :averageCenter="true">
            <div
              :key="index"
              v-for="(item, index) in mapList">
              <bm-marker
                :icon="{ url: item.alertState==='预警'?img2:item.alertState==='正常'?img1:img3, size: { width: 40, height: 30 } }"
                :position="{ lng: item.longitude, lat: item.latitude }"
                @click="infoWindowOpen(this,item)"
                :title="item.personName"
              >
                <bm-info-window
                  style="z-index: 9999;"
                  :show="item.show"
                  :position="{ lng: item.longitude, lat: item.latitude }"
                  @close="infoWindowClose(item)"
                >
                  <p>设备名称 : {{ item.equipmentName }}</p>
                  <p>设备类别 : {{ item.equipmentCategory }}</p>
                  <p>负责人员 : {{ item.manager }}</p>
                  <p>定位状态 : {{ item.alertState }}</p>
                  <p>定位时间 : {{ item.locationUpdateTime }}</p>
                  <Button
                    v-if="!isTrackShow"
                    type="primary"
                    style="width: 100%;margin-top:5px"
                    @click="showTrack(true)">轨迹查询
                  </Button>
                  <div v-if="isTrackShow" style=" margin-top:5px">
                    <span>起止时间ㅤㅤ</span>
                    <a-range-picker
                      showTime
                      size="small"
                      @change="trailTime"
                      :disabledDate="disabledDate"
                      @calendarChange="calendarChange"
                      style="width:320px">
                    </a-range-picker>
                    <br>
                    <Button style="width: 45%;margin-top:5px;margin-right: 10%" @click="showTrack(false)">
                      取消
                    </Button>
                    <Button type="primary" style="width: 45%;margin-top:5px" @click="getLocus(item)">确认</Button>
                  </div>
                </bm-info-window>
              </bm-marker>
            </div>
          </bml-marker-clusterer>
        </baidu-map>
      </div>
      </Col>
      <Col :span="7">
      <div class="containerBox">
        <span class="mainTitle">丨  设备维保</span>
        <article class="alertStateStatics">
          <div v-for="(v,k,i) in allData.alertStateStatics" :key="i">
            <p>{{ k }}</p>
            <span :style="{color:k==='提醒'?'#ead332':k==='正常'?'#00FE65':'#fe3300'}">{{ v }}</span>
          </div>
        </article>
        <h5 style="color:#fff;margin:15px">设备列表</h5>
        <div style="height: calc(100% - 100px);overflow: auto">
          <article v-for="(v,i) in allData.dataList" :key="i" class="address">
            <img :src="v.alertState==='预警'?img2:v.alertState==='提醒'?img3:img1" @click="infoRelate(v,i)"/>
            <span>{{ v.equipmentName }}</span>
            <span :style="{color:v.alertState==='预警'?'red':v.alertState==='提醒'?'yellow':'green'}">{{
              v.alertState
            }}</span>
          </article>
        </div>
      </div>
      </Col>
    </Row>
    <Row v-if="!imgShow" :gutter="[16,16]">
      <Col :span="7">
      <div class="containerBox">
        <span class="mainTitle">丨  设备登记</span>
        <article class="inOutStateStatics">
          <div v-for="(v,k,i) in allData.inOutStateStatics" :key="i" v-if="k!=='无状态'">
            <p>{{ k }}</p>
            <span :style="{color:k=='进场'?'green':'red'}">{{ v }}</span>
          </div>
        </article>
        <h5 style="color:#fff;margin:5px auto 0px 25px">在场状态</h5>
        <CircleEchart
          :chartData="circleData"
          id="CircleEchart"
          style="width: 95%;height: 230px;margin-left: 3%"></CircleEchart>
      </div>
      </Col>
      <Col :span="17">
      <div class="containerBox">
        <span class="mainTitle">丨  设备进退场</span>
        <Table
          bordered
          :columns="tableColumns"
          :data-source="mapList"
          rowKey="id"
          :scroll="{ x: '100%', y: 250}"
          :customRow="infoWindowRelate"
          :pagination="pagination"
          @change="tableChange"
        >
          <template
            slot="testResult"
            slot-scope="text, record"
          >
            <span v-if="record.testResult==='合格'" style="color: green">合格</span>
            <span v-else style="color: red">{{ record.testResult }}</span>
          </template>
        </Table>
      </div>
      </Col>
    </Row>
    <div class="imgshow" v-if="imgShow">
      <img src="./Img/bg1.png" alt="">
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Col, Row, Table, Button, DatePicker} from "@h3/antd-vue";
import * as Api from '../../../service/api';
import img1 from "./Img/green_point.png";
import img2 from "./Img/red_point.png";
import img3 from "./Img/yellow_point.png";
import BaiduMap, {BmlMarkerClusterer, BmMarker, BmPolyline} from "vue-baidu-map";
import {BarEchart} from '../../../basicCustomComponent';
import CircleEchart from './circleEcharts.vue'
import moment from "moment";

Vue.use(BaiduMap, {
  ak: "61MnoymEFY5Kp1H2vu6pshGQc0ME6YSM",
});
//@ts-ignore
Vue.use(BmMarker, BmPolyline);
const {RangePicker} = DatePicker;
@Component({
  name: "equipManageView",
  components: {
    Row, Col, Table, Button, BmlMarkerClusterer, BarEchart, CircleEchart, ARangePicker: RangePicker,
  }
})
export default class allProtect extends Vue {
  @Prop() projectName!: string;
  @Prop() appCode!: string;

  isShow: boolean = true;
  mapList: Array<{ [propsName: string]: string | number | null | boolean }> = [];
  allData: { [propsName: string]: any } | null = {};
  center: { lng: number, lat: number } | null = null;
  zoom: number = 17;
  map: any = null;
  BMap: any = null;
  markers: Array<{ [propsName: string]: string | number | null }> = [];
  img1: any = img1;
  img2: any = img2;
  img3: any = img3;
  lastInfoBox: any = null;
  barData: { [propsName: string]: any } = {
    xAxis: [],
    yAxis1: [],
    yAxis2: [],
    legendData: [],
    unitName: '台',
    dataZoom: false,
    minInterval:1,
  };
  stackData: Array<{ [propsName: string]: any }> = [];
  pagination: any = {
    current: 1,
    defaultPageSize: 10,
    onChange: this.tableChange.bind(this)
  };
  tableColumns: Array<{ [propsName: string]: any }> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 100,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '设备类型',
      dataIndex: 'equipmentCategory',
      key: 'equipmentCategory',
      align: 'center',
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      align: 'center',
    },
    {
      title: '进场日期',
      dataIndex: 'inDate',
      key: 'inDate',
      align: 'center',
    },
    {
      title: '退场日期',
      dataIndex: 'outDate',
      key: 'outDate',
      align: 'center',
    }];
  circleData: { data: any, isLabelLineShow: boolean, midText: string, unitName: string } = {
    data: [],
    isLabelLineShow: true,
    midText: '总设备',
    unitName: '台'
  }
  isTrackShow: boolean = false;
  selectPriceDate: string = '';
  offsetDays: number = 259200 * 1000 //最多选择范围31天ms;
  endTime: string = '';
  startTime: string = '';
  imgShow: boolean= true

  i: number = 0;
  points: Array<any> = [];

  mounted() {
    this.getPersonView();
  }

  infoWindowRelate(item, index) {
    const {map,BMap} = this;
    return {
      on: {
        click: () => {
          map.centerAndZoom(new BMap.Point(item.longitude, item.latitude), 20);
          this.infoWindowOpen(null, item);
        },
      }
    }
  }
  infoRelate(item, index){
    const {map,BMap} = this;
    map.centerAndZoom(new BMap.Point(item.longitude, item.latitude), 20);
    this.infoWindowOpen(null, item);
  }

  tableChange(pagination, filters, sorter){
    this.pagination.current = pagination.current;
  }

  getPersonView() {
    this.barData = {
      xAxis: [],
      yAxis1: [],
      yAxis2: [],
      legendData: [],
      unitName: '台',
      dataZoom: false,
      minInterval:1
    };
    this.allData = {};
    this.mapList = [];
    Api.getEquipView({appCode: this.appCode, projectName: this.projectName}).then(res => {
      if(res.errmsg == "暂无设备数据") {
        this.imgShow = true
      }else {
        this.imgShow = false
      }
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.allData = res.data;
      this.mapList = res.data.dataList;
      for (let key in this.allData?.['equipClassStatics']) {
        this.barData.xAxis.push(key);
        this.barData.yAxis1.push(this.allData?.['equipClassStatics']?.[key]);
        this.stackData.push({name: key, value: [this.allData?.['equipClassStatics']?.[key]]})
      }
      for (let key in this.allData?.['inOutStateStatics']) {
        this.circleData.data.push({
          'name': key as string,
          'value': this.allData?.['inOutStateStatics'][key] as number
        })
      }
    })
  }

  @Watch('mapList', {immediate: true})
  mapListListener(val) {
    if (val.length!==0) {
      this.center = {
        lng: val[0].longitude,
        lat: val[0].latitude
      };
      // this.zoom = 20;
    }
  }

  handler({BMap, map}) {
    this.BMap = BMap;
    this.map = map;
  }

  infoWindowOpen(marker, item) {
    item.show = true;
    const {map, BMap} = this;
    const allOverlay:Array<any> = map.getOverlays();
    for (let i = 0; i < allOverlay.length; i++) {
      if (allOverlay[i].imei === 'remove') {//删除折线
        map.removeOverlay(allOverlay[i]);
      }
    }
  }

  infoWindowClose(item) {
    item.show = false;
    this.isTrackShow = false;
  }

  getLocus(item) {
    const {BMap, map} = this;
    Api.getLocusEquip({
      appCode: this.appCode,
      startTime: this.startTime,
      endTime: this.endTime,
      idList: [item.id]
    }).then(res => {
      if (res.errcode !== 0) return;
      if (!res.data || res.data.length === 0)  return this.$message.warn('现无轨迹可回放');
      let arrPois = [];
      for (let i = 0; i < res.data.length; i++) {
        const p0 = res.data?.[i].lng;
        const p1 = res.data?.[i].lat;
        const point = new BMap.Point(p0, p1);
        //@ts-ignore
        arrPois.push(point);
      }
      this.i = 0;
      this.points = [];
      this.dynamicLine(arrPois);
    })
  }


  dynamicLine(arrPois) {
    const {map, BMap} = this;
    if (this.i == arrPois.length) return;
    if (this.i === 0) {
      const mkr = new BMap.Marker(arrPois[this.i]);
      mkr.imei = 'remove'
      map.addOverlay(mkr); //标点
      const label = new BMap.Label('起点');
      label.imei = 'remove'
      mkr.setLabel(label);
    }
    if (this.i === arrPois.length - 1) {
      const mkr = new BMap.Marker(arrPois[this.i]);
      mkr.imei = 'remove'
      map.addOverlay(mkr); //标点
      const label = new BMap.Label('终点');
      label.imei = 'remove'
      mkr.setLabel(label);
    }
    this.points.push(arrPois[this.i]);
    this.setZoom(this.points)
    this.driveline(this.points);
    this.i++;
    const _this = this;
    setTimeout(function () {
      _this.dynamicLine(arrPois)
    }, 1000);
  }

  //画折线
  driveline(points) {
    const {map, BMap} = this;
    const polyLine = new BMap.Polyline(points, {
      strokeColor: "blue", //设置颜色
      strokeWeight: 4, //宽度
      strokeOpacity: 0.5, //透明度
    });
    polyLine.imei = 'remove'
    map.addOverlay(polyLine);
  }

  //根据点信息实时更新地图显示范围，让轨迹完整显示。设置新的中心点和显示级别
  setZoom(bPoints) {
    const {map, BMap} = this;
    const centerPoint = map.getViewport(eval(bPoints)).center;
    map.centerAndZoom(centerPoint, 20);
  }

  trailTime(dates, dateStrings) {
    this.endTime = dateStrings[1];
    this.startTime = dateStrings[0];
  }

  disabledDate(current) {
    if (this.selectPriceDate) {
      let selectV = moment(this.selectPriceDate, 'YYYY-MM-DD').valueOf()
      return current > moment(this.formatDate(new Date(selectV + this.offsetDays).getTime()), 'YYYY-MM-DD') ||
        current > moment().endOf('day')
    } else {
      return current > moment().endOf('day')
    }
  }

  //选择开始时间/结束时间
  calendarChange(date) {
    this.selectPriceDate = date[0]
  }

  formatDate(value) {
    let date = new Date(value)
    let Y = date.getFullYear() + '-'
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    let D = date.getDate()
    return Y + '-' + M + '-' + D
  }

  showTrack(v) {
    this.isTrackShow = v
  }
}
</script>

<style lang="less" scoped>
.containerBox {
  background-color: rgb(24 38 71);
  width: 100%;
  height: calc((100vh - 64px - 32px - 48px) / 2);
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .mainTitle {
    font-size: 24px;
    color: #FFFFFF;
    margin: 5px;
    line-height: 50px;
  }

  .equipRunStatics {
    display: flex;
    flex-direction: row;

    & > div {
      width: 33%;
      height: 65px;
      text-align: center;

      & > p {
        font-size: 15px;
      }

      & > span {
        font-size: 35px;
      }
    }

  }

  .alertStateStatics {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;

    & > div {
      width: 33%;
      height: 65px;
      text-align: center;

      & > p {
        font-size: 15px;
      }

      & > span {
        font-size: 35px;
      }
    }
  }

  .inOutStateStatics {
    display: flex;
    flex-direction: row;

    & > div {
      width: 35%;
      margin-left: 10%;
      height: 65px;
      text-align: center;

      & > p {
        font-size: 15px;
      }

      & > span {
        font-size: 35px;
      }
    }


  }

  .address {
    height: 55px;

    & > img {
      margin-left: 20px;
    }

    & > span:nth-child(2) {
      font-size: 20px;
      width: 73%;
      margin-left: 15px;
      display: inline-block;
    }

    & > span:nth-child(3) {
      font-size: 18px;
      //margin-left: 5%;
      //margin-right: 10%;
    }

  }

  /deep/ .ant-table {
    height: calc(100% - 60px);
    border: 0;
    //padding: 0 17px;
  }


  /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
    background: transparent;
    color: #ffffff;
  }

  /deep/ .ant-table-thead > tr > th {
    //表头背景色
    background-color: #5b8dd0 !important;
    //padding: 8px 8px !important;
    overflow-wrap: break-word;
    //border-bottom: 1px solid transparent;
    color: rgba(248, 245, 245, 0.85);
    font-weight: 400;
    font-size: 13px;
  }

  /deep/ .ant-table-thead > tr:only-child > th:last-child {
    border-right-color: white !important;
  }

  /deep/ .ant-table-body {
    margin-top: 6px;
    height: 280px;
    overflow: auto!important;
    padding: 0 17px;
  }

  /deep/ .ant-table-header {
    overflow: auto!important;
    padding: 0 21px 0 17px;
  }

  /deep/ .ant-table-tbody > tr > td {
    //padding: 8px 8px !important;
    //border-bottom: 1px solid transparent;
    color: #ffffff;
  }

  /deep/ .ant-table-fixed-header .ant-table-scroll .ant-table-header {
    background-color: transparent;
  }

  /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
    position: relative;
    background-color: transparent;
  }

  /deep/ .ant-table-placeholder {
    display: none;
  }

  /deep/ ::-webkit-scrollbar {
    width: 4px;
  }

  /deep/ ::-webkit-scrollbar-track {
    border-radius: 0;
    background: transparent;
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: #136186 !important
  }

  //表格分页
  /deep/ .ant-pagination-item-active {
    font-weight: 500;
    background: transparent;
    color: white;
    border-color: #2970ff;
  }

  /deep/ .ant-pagination-item {
    color: #ffffff !important;
    background-color: transparent;
    border: 1px solid #d9d9d9;
  }

  /deep/ .ant-table-pagination.ant-pagination {
    float: right;
    margin: 1px !important;
  }

  //表格页码-数字
  /deep/ .ant-pagination-item a {
    color: #ffffff;
  }

  //表格页码-数字-点击
  /deep/ .ant-pagination-item-active a {
    color: #2970ff;
  }

  //表格页码向前向后跳转
  /deep/ .ant-pagination-item-link {
    color: #ffffff;
    background-color: transparent;
  }

  /deep/ .ant-pagination-item-ellipsis {
    color: #ffffff;
  }
}
.imgshow {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
}

</style>
