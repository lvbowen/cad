<template>
  <div>
    <div style="width: 100%; height: 100%" :id="id" ref="echarts"></div>
    <div class="back-china" @click="backChina" v-show="mapName!==''">返回</div>
  </div>
</template>

<script>
import echarts from "echarts";
//1.中国地图
import uploadedDataURL from './map.json';
//2.台湾省地图
import taiWanMap from "./provinceJson/taiWan.json";
//3.海南省地图
import haiNanMap from "./provinceJson/haiNan.json";
//4.安徽省地图
import anHuiMap from "./provinceJson/anHui.json";
//5.江西省地图
import jiangXiMap from "./provinceJson/jiangXi.json";
//6.湖南省地图
import huNanMap from "./provinceJson/huNan.json";
//7.云南省地图
import yunNanMap from "./provinceJson/yunNan.json";
//8.贵州省地图
import guiZhouMap from "./provinceJson/guiZhou.json";
//9.广东省地图
import guangDongMap from "./provinceJson/guangDong.json";
//10.福建省地图
import fuJianMap from "./provinceJson/fuJian.json";
//11.浙江省地图
import zheJiangMap from "./provinceJson/zheJiang.json";
//12.江苏省地图
import jiangSuMap from "./provinceJson/jiangSu.json";
//13.四川省地图
import siChuanMap from "./provinceJson/siChuan.json";
//14.重庆市市地图
import chongQingMap from "./provinceJson/chongQing.json";
//15.湖北省地图
import huBeiMap from "./provinceJson/huBei.json";
//16.河南省地图
import heNanMap from "./provinceJson/heNan.json";
//17.山东省地图
import shanDongMap from "./provinceJson/shanDong.json";
//18.吉林省地图
import jiLinMap from "./provinceJson/jiLin.json";
//19.辽宁省地图
import liaoNingMap from "./provinceJson/liaoNing.json";
//20.天津市市地图
import tianJinMap from "./provinceJson/tianJin.json";
//21.北京市市地图
import beiJingMap from "./provinceJson/beiJing.json";
//22.河北省地图
import heBeiMap from "./provinceJson/heBei.json";
//23.山西省地图
import shanXiMap from "./provinceJson/shanXi.json";
//24.陕西省地图
import shanXi2Map from "./provinceJson/shanXi2.json";
//25.宁夏回族自治区省地图
import ningXiaMap from "./provinceJson/ningXia.json";
//26.青海省地图
import qingHaiMap from "./provinceJson/qingHai.json";
//27.西藏自治区地图
import xiZangMap from "./provinceJson/xiZang.json";
//28.黑龙江省地图
import heiLongJiangMap from "./provinceJson/heiLongJiang.json";
//29.内蒙古自治区地图
import neimengGuMap from "./provinceJson/neiMengGu.json";
//30.甘肃省地图
import ganSuMap from "./provinceJson/ganSu.json";
//31.新疆维吾尔自治区省地图
import xinJiangMap from "./provinceJson/xinJiang.json";
//32.广西壮族自治区地图
import guangxiMap from "./provinceJson/guangXi.json";
export default {
  name: "MapEchart",
  components: {},
  props: {
    id: {
      type: String,
      default: "chart",
    },
    chartData: {
      type: Object,
      default: () => ({
        difficultData:[],
        points:[],
        unitName:'',
        labelNum1:'',
        labelNum2:'',
        labelNum3:'',
        labelNum4:'',
        labelNum5:'',
        labelNum6:'',
        visualMapShow:false,
        period: 0,
        scale: 0,
        symbolSize:0,
        tooltipShow:false
      }),
    },
  },
  data() {
    return {
      topHeight:'30%',
      chart: null,
      mapName:'',
      // keyNum:0,
      mapJson : [
        {
          name: "台湾省",
          json: taiWanMap,
        },
        {
          name: "海南省",
          json: haiNanMap,
        },
        {
          name: "安徽省",
          json: anHuiMap,
        },
        {
          name: "江西省",
          json: jiangXiMap,
        },
        {
          name: "湖南省",
          json: huNanMap,
        },
        {
          name: "云南省",
          json: yunNanMap,
        },
        {
          name: "贵州省",
          json: guiZhouMap,
        },
        {
          name: "广东省",
          json: guangDongMap,
        },
        {
          name: "福建省",
          json: fuJianMap,
        },
        {
          name: "浙江省",
          json: zheJiangMap,
        },
        {
          name: "江苏省",
          json: jiangSuMap,
        },
        {
          name: "四川省",
          json: siChuanMap,
        },
        {
          name: "重庆市",
          json: chongQingMap,
        },
        {
          name: "湖北省",
          json: huBeiMap,
        },
        {
          name: "河南省",
          json: heNanMap,
        },
        {
          name: "山东省",
          json: shanDongMap,
        },
        {
          name: "吉林省",
          json: jiLinMap,
        },
        {
          name: "辽宁省",
          json: liaoNingMap,
        },
        {
          name: "天津市",
          json: tianJinMap,
        },
        {
          name: "北京市",
          json: beiJingMap,
        },
        {
          name: "河北省",
          json: heBeiMap,
        },
        {
          name: "山西省",
          json: shanXiMap,
        },
        {
          name: "陕西省",
          json: shanXi2Map,
        },
        {
          name: "宁夏回族自治区",
          json: ningXiaMap,
        },
        {
          name: "青海省",
          json: qingHaiMap,
        },
        {
          name: "西藏自治区",
          json: xiZangMap,
        },
        {
          name: "黑龙江省",
          json: heiLongJiangMap,
        },
        {
          name: "内蒙古自治区",
          json: neimengGuMap,
        },
        {
          name: "甘肃省",
          json: ganSuMap,
        },
        {
          name: "新疆维吾尔自治区",
          json: xinJiangMap,
        },
        {
          name: "广西壮族自治区",
          json: guangxiMap,
        },
      ],
      geoCoordMap : {
        '台湾': [121,23],
        '黑龙江': [129,46],
        '内蒙古': [110.3467, 41.4899],
        "吉林": [125.8154, 44.2584],
        '北京市': [116.4551, 40.2539],
        "辽宁": [123.1238, 42.1216],
        "河北": [114.4995, 38.1006],
        "天津": [117.4219, 39.4189],
        "山西": [112.3352, 37.9413],
        "陕西": [109.1162, 34.2004],
        "甘肃": [103.5901, 36.3043],
        "宁夏": [106.3586, 38.1775],
        "青海": [101.4038, 36.8207],
        "新疆": [87.9236, 43.5883],
        "西藏": [88.388277,31.56375],
        "四川": [103.9526, 30.7617],
        "重庆": [108.384366, 30.439702],
        "山东": [117.1582, 36.8701],
        "河南": [113.4668, 34.6234],
        "江苏": [118.8062, 31.9208],
        "安徽": [117.29, 32.0581],
        "湖北": [114.3896, 30.6628],
        "浙江": [119.5313, 29.8773],
        "福建": [119.4543, 25.9222],
        "江西": [116.0046, 28.6633],
        "湖南": [113.0823, 28.2568],
        "贵州": [106.6992, 26.7682],
        "云南": [102.9199, 25.4663],
        "广东": [113.12244, 23.009505],
        "广西": [108.479, 23.1152],
        "海南": [110.3893, 19.8516],
        '上海': [121.4648, 31.2891],
      },
      data : [
        {name:"台湾",value:1},
        {name:"北京",value:2},
        {name:"天津",value:3},
        {name:"河北",value:4},
        {name:"山西",value:5},
        {name:"内蒙古",value:6},
        {name:"辽宁",value:7},
        {name:"吉林",value:8},
        {name:"黑龙江",value:9},
        {name:"上海",value:10},
        {name:"江苏",value:11},
        {name:"浙江",value:12},
        {name:"安徽",value:13},
        {name:"福建",value:14},
        {name:"江西",value:15},
        {name:"山东",value:16},
        {name:"河南",value:17},
        {name:"湖北",value:18},
        {name:"湖南",value:19},
        {name:"重庆",value:20},
        {name:"四川",value:21},
        {name:"贵州",value:22},
        {name:"云南",value:23},
        {name:"西藏",value:24},
        {name:"陕西",value:25},
        {name:"甘肃",value:26},
        {name:"青海",value:27},
        {name:"宁夏",value:28},
        {name:"新疆",value:29},
        {name:"广东",value:30},
        {name:"广西",value:31},
        {name:"海南",value:32},
      ],
    }
  },
  computed: {},
  methods: {
    backChina(){
      this.topHeight='30%'
      this.initChart('china',uploadedDataURL,1.7);
      // this.$emit('addKeyNum',this.keyNum);
    },
    initChart(mapType,geoJson,zoom) {
      const charts = echarts.init(document.getElementById(this.id));
      charts.showLoading()
      echarts.registerMap(mapType, geoJson)
      charts.hideLoading()
      let option = {
        backgroundColor: "",
        grid: {
          top:0,
          bottom:0,
          left: 0,
          right: 0,
        },
        legend:{
          show:false,
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        visualMap: {
          type:"piecewise",
          min: 0,
          max: 10000,
          left: 26,
          bottom: 0,
          showLabel: !0,
          text: ["高", "低"],//图例文本
          show:this.chartData.visualMapShow,//控制图例
          seriesIndex: 0,//可以用来区分热力图颜色用在热区还是标注点
          textStyle: {
            color: "#fff",
            fontSize: 12,
          },
          pieces: [
            {
              gt: 10000,
              label: this.chartData.labelNum6+this.chartData.unitName,
              color: {//热区渐变背景色
                type: "radial", //radial 径向渐变  linear  线性渐变
                x: 0.5,
                y: 0.5,
                r: 0.4,
                colorStops: [
                  {
                    offset: 0, color: 'rgba(255, 14, 75, 0)' // 0% 处的颜色
                  },
                  {
                    offset: 1, color: 'rgba(255, 14, 75, .8)' // 100% 处的颜色
                  }],
                globalCoord: false // 缺省为 false
              }
            }, {
              gte: 7500,
              lte: 10000,
              label: this.chartData.labelNum5+this.chartData.unitName,
              color: {//热区渐变背景色
                type: "radial", //radial 径向渐变  linear  线性渐变
                x: 0.5,
                y: 0.5,
                r: 0.4,
                colorStops: [
                  {
                    offset: 0, color: 'rgba(255, 90, 0, 0)' // 0% 处的颜色
                  },
                  {
                    offset: 1, color: 'rgba(255, 90, 0, .8)' // 100% 处的颜色
                  }],
                globalCoord: false // 缺省为 false
              }
            },{
              gte: 5000,
              lte: 7500,
              label: this.chartData.labelNum4+this.chartData.unitName,
              color: {//热区渐变背景色
                type: "radial", //radial 径向渐变  linear  线性渐变
                x: 0.5,
                y: 0.5,
                r: 0.4,
                colorStops: [
                  {
                    offset: 0, color: 'rgba(255, 198, 0, 0)' // 0% 处的颜色
                  },
                  {
                    offset: 1, color: 'rgba(255, 198, 0, .8)' // 100% 处的颜色
                  }],
                globalCoord: false // 缺省为 false
              }
            }, {
              gte: 3000,
              lte: 5000,
              label: this.chartData.labelNum3+this.chartData.unitName,
              color: {//热区渐变背景色
                type: "radial", //radial 径向渐变  linear  线性渐变
                x: 0.5,
                y: 0.5,
                r: 0.4,
                colorStops: [
                  {
                    offset: 0, color: 'rgba(0, 230, 130, 0)' // 0% 处的颜色
                  },
                  {
                    offset: 1, color: 'rgba(0, 230, 130, .8)' // 100% 处的颜色
                  }],
                globalCoord: false // 缺省为 false
              }
            }, {
              gte: 1000,
              lt: 3000,
              label:this.chartData.labelNum2+this.chartData.unitName,
              color: {//热区渐变背景色
                type: "radial", //radial 径向渐变  linear  线性渐变
                x: 0.5,
                y: 0.5,
                r: 0.4,
                colorStops: [
                  {
                    offset: 0, color: 'rgba(0, 228, 255, 0)' // 0% 处的颜色
                  },
                  {
                    offset: 1, color: 'rgba(0, 228, 255, .8)' // 100% 处的颜色
                  }],
                globalCoord: false // 缺省为 false
              }
            }, {
              gt: 0,
              lt: 1000,
              label: this.chartData.labelNum1+this.chartData.unitName,
              color: {//热区渐变背景色
                type: "radial", //radial 径向渐变  linear  线性渐变
                x: 0.5,
                y: 0.5,
                r: 0.4,
                colorStops: [
                  {
                    offset: 0, color: 'rgba(0, 150, 255, 0)' // 0% 处的颜色
                  },
                  {
                    offset: 1, color: 'rgba(0, 150, 255, .8)' // 100% 处的颜色
                  }],
                globalCoord: false // 缺省为 false
              }
            }],
        },
        geo: {
          map: mapType,
          aspectScale: 0.75, //长宽比
          top:this.topHeight,
          zoom: zoom,
          roam: true,//是否开启平游或缩放
          itemStyle: {
            normal: {
              borderColor: 'rgba(0, 138, 255,1)',
              areaColor: {
                type: "radial",
                x: 0.5,
                y: 0.5,
                r: 0.4,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(16, 36, 109, 0)' // 0% 处的颜色
                }, {
                  offset: 1,
                  color: 'rgba(16, 36, 109, .8)' // 100% 处的颜色
                }],
                globalCoord: true, // 缺省为 false
              },
              shadowColor: 'rgba(16, 36, 109, 1)',
              // shadowOffsetX: 10, // 阴影x轴
              // shadowOffsetY: 11, // 阴影y轴
            },
            emphasis: {
              areaColor: "#389BB7",
              borderWidth: 0,
              color: "green",
              label: {
                show: false,
              },
            },
          },
          regions: [
            {
              name: "南海诸岛",
              itemStyle: {
                areaColor: "rgba(16, 36, 109, 1)",
                borderColor: "rgba(0, 138, 255, 1)",
                normal: {
                  opacity: 0,
                  label: {
                    show: false,
                    color: "#009cc9",
                  },
                },
              },
            },
          ],
        },
        series: [
          {
            type: "map",
            map: mapType, //使用
            roam: true,//是否开启平游或缩放
            // geoIndex:0,//指定geo属性后，series-map.map 属性，以及 series-map.itemStyle 等样式配置不再起作用，而是采用 geo 中的相应属性。
            zoom: zoom,
            top:this.topHeight,
            label: {
              normal: {
                show: true,
                textStyle: {
                  color: "#ffff",//省份名称颜色
                },
              },
              emphasis: {
                textStyle: {
                  color: "rgb(183,185,14)",
                },
              },
            },
            itemStyle: {
              normal: {
                borderColor: "rgb(0, 138, 255,1)",
                borderWidth: 1,
                areaColor: {
                  type: "radial",
                  x: 0.5,
                  y: 0.5,
                  r: 0.8,
                  colorStops: [{
                    offset: 0,
                    color: 'rgba(16, 36, 109, 0)' // 0% 处的颜色
                  }, {
                    offset: 1,
                    color: 'rgba(16, 36, 109, .2)' // 100% 处的颜色
                  }],
                  globalCoord: true, // 缺省为 false
                },
              },
              emphasis: {
                areaColor: "#389BB7",//hover 省区背景色
                //    shadowColor: 'rgb(12,25,50)',
                borderWidth: 0.1,
              },
            },
            data:this.chartData.HotspotsData //热力图数据   不同区域 不同的底色
          },
          {//地图中闪烁的点
            type: "scatter",//effectScatter => 带光圈散发
            coordinateSystem: "geo",
            zlevel: 1,
            symbolSize: this.chartData.symbolSize,
            symbol: 'pin',
            rippleEffect: {//标注点大小
              period: this.chartData.period,
              scale: this.chartData.scale,
              brushType: "fill",
            },
            hoverAnimation: true,
            itemStyle: {
              normal: {
                color: "#1DE9B6",
                shadowBlur: 10,
                shadowColor: "#333",
              },
            },
            data: this.chartData.points,//标注点数据
          },
        ],
        tooltip:{
          show:this.chartData.tooltipShow,
          backgroundColor:'transparent',
          formatter:function (params){
            if(params.seriesType==="scatter"){
              return `<div class="tips"><p>${params.name}</p>
                        <p class="p-content">
                          <i class="i-round" style="display: ${params.data.nameList!==null?'inline-block':'none'}"></i>
                          ${params.data.nameList!==null?params.data.nameList[0].title:''}
                          <span style="display: ${params.data.nameList!==null?'inline-block':'none'}">：</span>
                          ${params.data.nameList!==null?params.data.nameList[0].content:''}
                        </p>
                      </div>`
            }else {
              return '';
            }
          },
        }
      }
      const _this = this;
      charts.off('click');
      charts.on('click', function(params) {//点击事件
        if(params.seriesType==='map'){
          _this.$emit("mapClick", params);//省区点击事件
          let chooseName = _this.mapJson.filter((item) => {
            //我们根据名字来判断是否选择一种
            return item.name == params.name;
          });
          _this.mapName = chooseName[0].json;
          let provinces=chooseName[0].name;
          _this.topHeight='0';
          _this.initChart(provinces,_this.mapName,0.9)
        } else if(params.seriesType==="scatter"){
          _this.$emit("pointsClick", params);//标注点点击事件
        }
      })
      charts.on('georoam', function(params) {
        // eslint-disable-next-line no-shadow
        const option = charts.getOption(); //获得option对象
        if (params.zoom) { //捕捉到缩放时
          option.geo[0].zoom = option.series[0].zoom; //下层geo的缩放等级跟着上层的geo一起改变
          option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
        } else { //捕捉到拖曳时
          option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
        }
        charts.setOption(option); //设置option
      });
      charts.setOption(option, true)
    },
  },
  mounted() {
    this.initChart('china',uploadedDataURL,1.7);
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  watch: {
    // 监听chartData数据变化
    chartData: {
      handler(newVal, oldVal) {
        if (this.charts) {
          if (newVal) {
            this.charts.setOption(newVal);
          } else {
            this.charts.setOption(oldVal);
          }
        } else {
          this.initChart();
        }
      },
      deep: true,
    },
  },
}
</script>

<style scoped lang="less">
/deep/.tips{
  width:300px;
  background: url("./Img/tipBg.png");
  background-size: 100% 100%;
  padding: 25px 20px;
}
/deep/.p-content{
  white-space: normal;
}
/deep/.i-round{
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #67d4ff !important;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}
.back-china{
  color: #FFFFFF;
  position: absolute;
  right: 2.5vw;
  top: 8vh;
  cursor:pointer;
  z-index: 1;
}
</style>
