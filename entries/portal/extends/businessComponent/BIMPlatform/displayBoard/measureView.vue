<template>
  <article style="height: 0;width: 0">
    <div class="left_pic" style="height: 550px">
      <p class="title">计量汇总</p>
      <div class="divider">
        <a-divider/>
      </div>
      <div class="pie_pic">
        <div id="measurePie" style="width:345px;height:250px"></div>
      </div>
      <p class="title">计量进度</p>
      <div class="divider">
        <a-divider/>
      </div>
      <div id="measureLine" style="width:345px;height:220px;margin-top:-10px"></div>
    </div>
    <div class="right_pic" style="height: 550px">
      <p class="title">支付汇总</p>
      <div class="divider">
        <a-divider/>
      </div>
      <div class="pie_pic">
        <div id="payPie" style="width:345px;height:250px"></div>
      </div>
      <p class="title">支付进度</p>
      <div class="divider">
        <a-divider/>
      </div>
      <div id="scheduleLine" style="width:345px;height:220px;margin-top:-10px"></div>
    </div>
  </article>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import axios from "axios";
import env from "@/config/env";
import {Carousel, Divider} from '@h3/antd-vue';

import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

@Component({
  name: 'projectView',
  components: {
    ACarousel: Carousel,
    ADivider: Divider
  }
})
export default class projectView extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName?: string;

  bimURL: string = `${env.apiHost}/`;

  mounted() {
    this.getView()
  }

  getView() {
    axios
      .get(this.bimURL + `bim/measure/getView`, {
        params: {
          appCode: this.projectCode,
          projectName: this.projectName
        }
      })
      .then(res => {
        this.drawPie("measurePie", res.data['计量汇总']);
        this.drawPie("payPie", res.data['支付汇总']);
        this.drawLine("measureLine", res.data['计量进度']);
        this.drawLine("scheduleLine", res.data['支付进度']);
      })
  }

  /**
   *折线图
   */
  drawLine(name, data) {
    let xAxisData: Array<string> = [];
    let seriesData: Array<number> = [];
    let color: Array<string> = []
    for (let i = 0; i < data.length; i++) {
      xAxisData.push(data[i].period);
      seriesData.push(data[i].money);
    }
    if (name === 'measureLine') {
      color.push('#FECA16')
    } else {
      color.push('#FECA16')
    }
    //@ts-ignore
    const lineChart = echarts.init(document.getElementById(name));
    lineChart.clear()
    //@ts-ignore
    lineChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      color: color,
      grid: {
        top: "30px",
        left: "50px",
        right: "25px",
        bottom: "25px"
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          textStyle: {
            color: '#ffffff'
          },
        },
        axisLine: {
          lineStyle: {
            color: '#094E8B'
          }
        }
      },
      yAxis: {
        name: '金额/万元',
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#094E8B'
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          textStyle: {
            color: '#ffffff'
          }
        },
      },
      series: [
        {
          name: '金额(万元)',
          type: 'line',
          data: seriesData
        }
      ]
    });
    window.onresize = function () {
      lineChart.resize();
    };
  }

  /**
   *画饼图
   */
  drawPie(name, data) {
    let total: number = 0;
    let pieData: Array<object> = [];
    let legend: Array<string> = [];
    for (let key in data) {
      pieData.push({
        name: key,
        value: data[key].count
      });
      legend.push(key)
      total += data[key].count
    }
    //@ts-ignore
    const pieChart = echarts.init(document.getElementById(name));
    pieChart.clear()
    pieChart.setOption({
      color: ['#FECA16', '#31ABE3'],
      legend: {
        top: "bottom",
        icon: "rect",
        data: legend,
        textStyle: {color: "#fff", fontSize: 12},
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      graphic: {
        //图形中间文字
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: "总金额" + "\n" + total + "\n" + '万元',
          textAlign: "center",
          fill: "#fff",
          fontSize: 20,
        },
      },
      series: [
        {
          name: '选项',
          type: 'pie',
          radius: ['40%', '60%'],
          data: pieData,
        }
      ]
    });
    window.onresize = function () {
      pieChart.resize();
    };
  }
}
</script>

<style lang="less" scoped>
@import './board.module.less';

.pie_pic {
  width: 100%;
  margin-top: -40px
}
</style>
