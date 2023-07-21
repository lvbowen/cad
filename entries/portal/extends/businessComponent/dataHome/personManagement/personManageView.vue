<template>
  <div class="main">
    <Row v-if="!imgShow" :gutter="[16,16]">
      <Col :span="7">
      <div class="containerBox">
        <span class="mainTitle">丨  人员统计</span>
        <article class="workerStatics">
          <div v-for="(v,k,i) in allData.workerStatics" :key="i">
            <p>{{ k }}</p>
            <span :style="{color:k==='在案总人数'?'#00C6FB':'#00FE65'}">{{ v }}</span>
          </div>
        </article>
        <h5 style="color:#fff;margin:15px">工种分布</h5>
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
          <!--        <bm-map-type-->
          <!--          :mapTypes="['BMAP_HYBRID_MAP']"-->
          <!--          anchor="BMAP_ANCHOR_TOP_LEFT"-->
          <!--        ></bm-map-type>-->
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
                  :show="item.show"
                  :position="{ lng: item.longitude, lat: item.latitude }"
                  @close="infoWindowClose(item)"
                >
                  <p>人员姓名 : {{ item.personName }}</p>
                  <p>所属公司 : {{ item.company }}</p>
                  <p>岗位角色 : {{ item.workType }}</p>
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
        <span class="mainTitle">丨  人员定位</span>
        <article class="alertStateStatics">
          <div v-for="(v,k,i) in allData.alertStateStatics" :key="i">
            <p>{{ k }}</p>
            <span :style="{color:k==='预警'?'#fb0000':k==='提醒'?'#fffb11':'#00FE65'}">{{ v }}</span>
          </div>
        </article>
        <h5 style="color:#fff;margin:15px">人员列表</h5>
        <div style="height: calc(100% - 100px);overflow: auto">
          <article v-for="(v,i) in mapList" :key="i" class="address">
            <img :src="v.alertState==='预警'?img2:v.alertState==='提醒'?img3:img1" @click="infoRelate(v,i)"/>
            <span>{{ v.personName }}</span>
            <span :style="{color:v.alertState==='预警'?'#fb0000':v.alertState==='提醒'?'#fffb11':'#00FE65'}">{{
              v.alertState
            }}</span>
            <span>{{ v.locationUpdateTime }}</span>
          </article>
        </div>
      </div>
      </Col>
    </Row>
    <Row v-if="!imgShow" :gutter="[16,16]">
      <Col :span="7">
      <div class="containerBox">
        <span class="mainTitle">丨  人员考勤</span>
        <h5 style="color:#fff;margin:15px">年龄占比</h5>
        <StackBarEchart id="StackBarEchart" :chartData="stackData" style="width: 95%;height: 50px"/>
        <h5 style="color:#fff;margin:15px">地域统计</h5>
        <LineEcharts id="LineEcharts" :chartData="lineData" style="width: 95%;height: 270px;margin-left: 3%"/>
      </div>
      </Col>
      <Col :span="17">
      <div class="containerBox">
        <span class="mainTitle">丨  进出场登记</span>
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
            slot="inOutState"
            slot-scope="text, record"
          >
            <span v-if="record.inOutState==='进场'" style="color: green">进场</span>
            <span v-else-if="record.inOutState==='退场'" style="color: red">退场</span>
            <span v-else-if="record.inOutState==='无状态'" style="color: yellow">无状态</span>
          </template>
        </Table>
      </div>
      </Col>
    </Row>
    <div class="imgshow" v-if="imgShow">
      <img src="./img/1.png" alt="">
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Col, Row, Table, Button, DatePicker} from "@h3/antd-vue";
import * as Api from '../../../service/api';
import img1 from "./img/green_point.png";
import img2 from "./img/red_point.png";
import img3 from "./img/yellow_point.png";
import BaiduMap, {BmlMarkerClusterer} from "vue-baidu-map";
import BmMarker from "vue-baidu-map/components/overlays/Marker.vue";
import {BarEchart, LineEcharts} from '../../../basicCustomComponent/index';
import StackBarEchart from './stackBarChart.vue'
import moment from "moment";

Vue.use(BaiduMap, {
  ak: "61MnoymEFY5Kp1H2vu6pshGQc0ME6YSM",
});
//@ts-ignore
Vue.use(BmMarker);
const {RangePicker} = DatePicker;
@Component({
  name: "personManageView",
  components: {
    Row, Col, Table, Button, BmlMarkerClusterer, BarEchart, StackBarEchart, LineEcharts, ARangePicker: RangePicker,
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
    unitName: '人',
    dataZoom: false,
    minInterval: 1,
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
      width: 80,
      customRender: (text, record, index) => `${(this.pagination.current-1)*this.pagination.defaultPageSize + (index + 1)}`,
    },
    {
      title: '姓名',
      align: 'center',
      dataIndex: 'personName',
      key: 'personName'
    },
    {
      title: '岗位角色',
      align: 'center',
      dataIndex: 'workType',
      key: 'workType'
    },
    {
      title: '进出场状态',
      align: 'center',
      dataIndex: 'inOutState',
      key: 'inOutState',
      scopedSlots: {customRender: "inOutState"}
    },
    {
      title: '进场时间',
      align: 'center',
      dataIndex: 'inDate',
      key: 'inDate',
    },
    {
      title: '出场时间',
      align: 'center',
      dataIndex: 'outDate',
      key: 'outDate',
    }];
  lineData: { [propsName: string]: any } = {
    xAxis: [],
    yAxis: [],
    yName: "考勤统计",
    minInterval: 1,
  };
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
      unitName: '人',
      dataZoom: false,
      minInterval: 1
    };
    this.allData = {};
    this.mapList = [];
    Api.getPersonView({appCode: this.appCode, projectName: this.projectName}).then(res => {
      if(res.errmsg == "暂无人员数据") {
        this.imgShow = true
      }else {
        this.imgShow = false
      }
      if (res.errcode !== 0) return;
      if (!res.data) return;
      this.allData = res.data;
      this.mapList = res.data.dataList;
      for (let key in this.allData?.['ageStatics']) {
        this.stackData.push({name: key, value: [this.allData?.['ageStatics']?.[key]]})
      }
      for (let key in this.allData?.['workType']) {
        this.barData.xAxis.push(key);
        this.barData.yAxis1.push(this.allData?.['workType']?.[key]);
      }
      for (let key in this.allData?.['addressStatics']) {
        this.lineData.xAxis.push(key);
        this.lineData.yAxis.push(this.allData?.['addressStatics']?.[key]);
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
    const allOverlay: Array<any> = map.getOverlays();
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
    Api.getLocusPerson({
      appCode: this.appCode,
      startTime: this.startTime,
      endTime: this.endTime,
      idList: [item.id]
    }).then(res => {
      if (res.errcode !== 0) return;
      //@ts-ignore
      if (!res.data || res.data.length === 0) return this.$message.warn('现无轨迹可回放');
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

  .workerStatics {
    display: flex;
    flex-direction: row;

    & > div {
      width: 50%;
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
      height: 25px;
      width: 20px;
    }

    & > span:nth-child(2) {
      font-size: 20px;
      width: 100px;
      margin-left: 15px;
      display: inline-block;
    }

    & > span:nth-child(3) {
      font-size: 18px;
      margin-left: 8%;
      margin-right: 8%;
    }

    & > span:nth-child(4) {
      font-size: 15px
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

  /deep/ .ant-table {
    height: calc(100% - 60px);
    border: 0;
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
