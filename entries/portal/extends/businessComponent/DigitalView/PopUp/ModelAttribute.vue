<template>
  <div class="model-attribute">
    <vue-drag-resize :isResizable="false">
      <div class="Model-attribute-detail">
        <h4>模型属性</h4>
        <div class="desgin-info">
          <h5>设计信息</h5>
          <div class="info-content">
            <div class="info-data" v-for="(item, index) in attributeList" :key="index">
              <span>{{ item.name }}</span>
              <span>{{ item.msg }}</span>
            </div>
          </div>
        </div>
        <div class="correlation">
          <h5>关联信息</h5>
          <div>
            <div class="info-tab">
              <div
                :class="index + 1 === tabNum ? 'ischecked' : ''"
                v-for="(item, index) in tabList"
                :key="index"
                @click="tabClick(item)"
              >
                {{ item.name }}
              </div>
            </div>
            <div class="info-detail">
              <div v-if="tabNum == 1">
                <el-table :data="tableData" style="width: 100%" height="290px">
                  <el-table-column align="center" prop="name" label="名称"></el-table-column>
                  <el-table-column align="center" prop="price" label="单价"></el-table-column>
                  <el-table-column align="center" prop="quantity" label="数量"></el-table-column>
                  <el-table-column align="center" prop="TotalPrice" label="总价"></el-table-column>
                </el-table>
              </div>
              <div v-if="tabNum == 2">
                <p v-for="(item, index) in docList" :key="index">
                  <span @click="operation(item.fileExtension)">{{ item.name }}</span>
                  <img
                    @click="operation(item.refId)"
                    src="../../../../src/assets/extends/cim/下载.png"
                    alt=""/>
                </p>
              </div>
              <div v-if="tabNum == 3">
                <p v-for="(item, index) in drawingList" :key="index">
                  <span @click="operation(item.fileExtension)">{{ item.name }}</span>
                  <img
                    @click="operation(item.refId)"
                    src="../../../../src/assets/extends/cim/下载.png"
                    alt=""/>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="close-png" @click="closePop">X</p>
    </vue-drag-resize>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop} from "vue-property-decorator";
import VueDragResize from "vue-drag-resize";
import * as Api from "../../../service/api";

@Component({
  name: "ModelAttribute",
  components: {
    VueDragResize,
  },
})
export default class ModelAttribute extends Vue {
  @Prop()
  private codeValue!: string;
  @Prop()
  private projectId!: string;
  @Prop()
  private projectName!: string;
  @InjectReactive("project") projectCode?: string;

  tabNum: number = 2;
  ischecked: string = "ischecked";
  tableData: Array<object> = [];
  attributeList: Array<object> = [];
  drawingList: Array<object> = [];
  docList: Array<object> = [];
  tabList: Array<object> = [
    // {
    //   name: "造价",
    //   id: 1,
    // },
    {
      name: "文档",
      id: 2,
    },
    {
      name: "图纸",
      id: 3,
    },
  ];

  tabClick(val) {
    this.tabNum = val.id;
  }

  mounted() {
    this.projectName = this.projectName ?? "孝义河湿地水质净化工程CIM平台";
    Api.getDesignDataByCodeValue({
      projectName: this.projectName,
      projectId: this.projectId ?? '',
      appCode: this.projectCode ?? '',
      codeValue: this.codeValue ?? '',
      // projectName: "黄石新港",
      // projectId: "7fa8e1c3ffbd4b3c87bda982de6dcdc9",
      // appCode: "HSGK",
      // codeValue: "0001.0003.0001.0002.0002",
      // bimCardId: "7375c37a52014490952ad2898cdf9e53",
    }).then((res) => {
      if (res.data?.dataDisplay == "纵向") {
        for (const key in res.data?.tableDatas) {
          if (key == "构件设计信息") {
            this.attributeList = res.data?.tableDatas[key];
          }
        }
        for (const key in res.data?.tableDatas?.attachments) {
          const val = res.data?.tableDatas?.attachments[key];
          if (key == "造价") {
            this.tableData = val;
          }
          if (key == "文档") {
            this.docList = val;
          }
          if (key == "图纸") {
            this.drawingList = val;
          }
        }
      }
    });
  }

  closePop() {
    this.$emit('closePop')
  }

  operation(val) {
    window.open(val)
  }

}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';

* {
  color: #fff;
  box-sizing: border-box;
}

.model-attribute {
  position: absolute;
  top: 150px;
  left: 586px;
  z-index: 99;

  .Model-attribute-detail {
    width: 410px;
    height: 745px;
    padding: 20px 40px;
    background: url("../../../../src/assets/extends/cim/bg_pop.png");
    background-size: 100% 100%;

    h4 {
      font-size: 18px;
      width: 49%;
      font-weight: 500;
      height: 35px;
      line-height: 35px;
      margin: 0 auto;
      margin-bottom: 10px;
      text-align: center;
      color: #01ffff;
      background: url("../../../../src/assets/extends/cim/kuang_shuizhi_title.png");
      background-size: 100% 100%;
    }

    /*  .model-title {
        .flex-space-between;
        padding: 5px;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.5);
        height: 40px;
        margin-bottom: 10px;

        &>span {
          font-size: 18px;
          font-weight:700;
        }

        p {
          font-size: 28px;
          cursor: pointer;
        }
      }*/

    h5 {
      border-left: 3px solid #40a9ff;
      height: 18px;
      line-height: 18px;
      padding-left: 10px;
      font-size: 15px;
      margin-bottom: 10px;
    }

    .desgin-info {
      margin-bottom: 10px;

      .info-content {
        height: 300px;
        overflow-y: auto;
        padding-left: 15px;
      }

      .info-data {
        margin-bottom: 10px;
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        :nth-child(1) {
          width: 25%;
          color: #4adffd;
        }

        :nth-child(2) {
          width: 70%;
          word-wrap: break-word;
        }
      }
    }

    .correlation {
      .info-tab {
        display: flex;
        margin-bottom: 20px;

        div {
          width: 70px;
          height: 28px;
          line-height: 28px;
          background: #fff;
          color: #333;
          margin-right: 20px;
          text-align: center;
          border-radius: 8px;
          cursor: pointer;
        }

        div:hover {
          background: #40a9ff;
          color: #fff;
        }

        .ischecked {
          background: #40a9ff;
          color: #fff;
        }
      }

      .info-detail {
        span {
          margin-right: 20px;
          cursor: pointer;
        }

        img {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
      }
    }
  }

  .vdr.active:before {
    display: none;
  }
   .close-png{
    position: absolute; top: 20px; right: -180px; cursor: pointer;
  }
}

.scrollbar-default;
</style>

<style lang="less">
.model-attribute {
  .el-table {
    color: #fff;
    background-color: rgba(234, 237, 243, 0.1); // transparent;
    border: 1px solid rgba(119, 171, 210, 1);
  }

  /deep/ .el-table__fixed {
    height: 100% !important; //设置高优先，以覆盖内联样式
  }

  .el-table th {
    color: rgba(255, 255, 255, 1);
    border: 1px solid #5073a1;
    background-color: transparent;
    font-weight: 800;
    font-size: 14px;
    text-align: center;
  }

  .el-table tr,
  .el-table td {
    font-size: 13px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: rgba(255, 255, 255, 1);
    border: 1px solid #5073a1;
    background-color: transparent;
    text-align: center;
    cursor: pointer;
  }

  .el-table .warning-row {
    background: rgba(234, 237, 243, 0.1);
  }

  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background: rgba(233, 237, 243, 0.3) !important;
  }
}
</style>
