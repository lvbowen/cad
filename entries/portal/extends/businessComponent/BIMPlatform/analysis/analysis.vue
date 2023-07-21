<template>
  <article class="mainContainer">
    <!--    左 侧边栏 显示状态-->
    <a-card class="left_class" :class="isLeftShow?'cardShow':'cardHide'">
      <div class="mainTree">
        <nav class="title">
          <p class="title">{{ tabName }}</p>
          <a-input-search
            placeholder="请输入关键字进行搜索"
            size="small"
            :allowClear="true"
            @search="onSearch"/>
        </nav>
        <!--        <br style="clear:both">-->
        <div class="left_tree">
          <a-tree
            checkable
            selectable
            :defaultCheckedKeys="defaultCheckedKeys"
            :selectedKeys="selectedKeys"
            :key="treeKey"
            :loadData="onLoadData"
            :treeData="treeData"
            :replaceFields="replaceFields"
            @select="onSelect"
            @check="onCheck"
            :defaultExpandedKeys="treeExpandData"
          >
            <template slot="title" slot-scope="text,record">
              <span
                v-if="highLightKeys.indexOf(text.eventKey)>-1"
                style="color: #0BCDA3">{{ text.taskName }}</span>
              <span v-else>{{ text.taskName }}</span>
            </template>
          </a-tree>
        </div>
      </div>
      <div class="cardOpt">
        <img
          v-show="isLeftShow"
          src="../../../../src/assets/extends/bim/frame_left_a1.png"
          @click="() => {this.isLeftShow = false}"
          style="height: 100%;width: 100%"
        />
        <img
          v-show="!isLeftShow"
          src="../../../../src/assets/extends/bim/frame_left_a.png"
          @click="() => {this.isLeftShow = true}"
          style="height: 100%;width: 100%"
        />
      </div>
    </a-card>
    <!--    底部 信息栏 显示状态 -->
    <div
      class="bottom_class"
      :role="isBottomShow?'showContainer':'hideContainer'"
      ref="MainTable"
      :key="cardKey">
      <nav class="bottomOption">
        <img
          :src="bottomArray"
          @click="() => {this.isBottomShow = false}"
          class="bottom_array"
          v-show="isBottomShow"
        />
        <img
          :src="bottomArrayHide"
          @click="() => {this.isBottomShow = true}"
          class="bottom_array"
          v-show="!isBottomShow"
        />
      </nav>
      <main class="bottomMain">
        <div style="width: 85%">
          <a-tabs @tabClick="pressTab">
            <a-tab-pane
              v-for="(value,key) in tabData"
              :key="value"
              :tab="key">
              <div class="table_button">
                <a-input-search
                  size="small"
                  placeholder="输入关键字"
                  style="float: right;margin-right:8px;width:150px"
                  @search="onTableSearch"/>
                <a-button
                  size="small"
                  type="link"
                  @click="addNew"
                  style="float: right;margin-right: 4px">
                  <img :src="addDataIcon" class="icon_button"/>新增
                </a-button>
                <a-button
                  size="small"
                  type="link"
                  @click="filterAll"
                  style="margin-right: 4px">
                  <img :src="allDataIcon" class="icon_button"/>全部数据
                </a-button>
                <a-button
                  size="small"
                  type="link"
                  @click="filterAllModelData"
                  style="margin-right: 4px">
                  <img :src="mxDataIcon" class="icon_button"/>模型数据
                </a-button>
                <a-button
                  size="small"
                  type="link"
                  @click="filterAllCoorData"
                  style="margin-right: 4px">
                  <img :src="zbDataIcon" class="icon_button"/>坐标数据
                </a-button>
              </div>
              <a-table
                class="bottom_table"
                size="small"
                :columns="tableLabel"
                :data-source="tableData"
                :scroll="{ x: '85%', y: tableHeight}"
                :scrollToFirstRowOnChange="true"
                :customRow="rowClick"
                :rowClassName="setRowClass"
              >
                <template
                  slot="操作"
                  slot-scope="text, record,index"
                >
                  <!--                <a @click="viewDetail(record)">查看 | </a>-->
                  <!--                <a @click="distribution(record)">定位 | </a>-->
                  <a @click="showConnect(record,index)">关联详情</a>
                </template>
                <template
                  v-for="(val,key) in allOptions"
                  :slot="key"
                  slot-scope="text, record"
                >
                  <template v-for="(value,index) in val.data">
                    <div
                      v-show="record[key]==value.optionName"
                      :key="index"
                      :style="{ background: [record[key]==value.optionName?value.color:''],width:'100%',height:'100%'}">
                      {{ record[key] }}
                    </div>
                  </template>
                </template>
                <template
                  v-for="(val,index) in attachment"
                  :slot="val"
                  slot-scope="text, record"
                >
                  <img
                    v-if="record[val]!==undefined"
                    :key="index"
                    src="../../../../src/assets/extends/bim/infoPop/11.png"
                    style="width: 18px;height:17px"
                    @click="download(record,val)"
                  />
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </div>
        <div class="chart">
          <a-divider style="margin-top:14px"/>
          <div class="button_list">
            <a-select
              size="small"
              class="select_option"
              :value="filterOption"
              style="float: left;margin-right: 4px;width: 120px;"
              @change="filterChange">
              <a-select-option v-for="(value,key,index) in allOptions" :key="index" :value="key">{{
                value.propertyName
              }}
              </a-select-option>
            </a-select>
            <a-button
              size="small"
              style="float: left;margin-right: 4px"
              @click="distribution('分布')">数据分布
            </a-button>
          </div>
          <div id="myChart"></div>
        </div>
      </main>
    </div>
    <connect-info
      v-if="isConnectShow"
      @closeConnectInfo="closeConnectInfo"
      :projectCode="projectCode"
      getMeasureDetailChilds
      :rowData="rowData"
      :codeData="codeData"
      :projectName="projectName"
      :schemaCode="schemaCode"
      :locationData="locationData"
      :index="index"></connect-info>
  </article>
</template>

<script src="./analysis.ts"></script>

<style lang="less" scoped>
@import '../BIMPlatform.module.less';
@import "../../../styles/antd.less";
.bottom_class {
  .flex;
  transition: all .3s;
  flex-direction: column;
  position: fixed;
  background: url("../../../../src/assets/extends/bim/frame_bottom.png");
  background-size: 100% 100%;
  border-color: transparent;
  height: 17.625vw;
  width: 99.8%;
  bottom: -1px;
  margin-left: 0.1%;

  & > .bottomOption {
    .flex;
    width: 1.7187vw;
    height: 1.3028vw;
    margin-left: auto;
    margin-right: auto;

    & > .bottom_array {
      margin: auto;
      width: 100%;
    }
  }

  & > .bottomMain {
    .flex;
    width: 98%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 0.9375vw;
  }

  & .chart {
    width: 15%;
    margin-top: 15px;
    display: flex;
    flex-direction: column;

    & > #myChart {
      width: 100%;
      height: 100%;
    }
  }


  .table_button {
    //margin: -10px 15px 4px 0;
    width: 99%;
    margin-top: -8px;
    margin-bottom: 5px;

    .icon_button {
      width: 15px;
      height: 15px;
    }
  }

  .button_list {
    float: right;
    margin-top: -18px;
    margin-bottom: 0px;

    .ant-btn {
      background-color: transparent;
      color: #FFFFFF;
      border: 1px solid #307AE4 !important;
    }

    .ant-btn:active, .ant-btn:focus {
      color: #17e5fd;
    }

    .ant-btn:hover, .ant-btn:focus {
      color: #17e5fd;
    }
  }

  .bottom_table {
    width: 99%;

    /deep/ .ant-table {
      border: 0;
    }

    /deep/ .ant-table-tbody > tr:hover > td {
      background: #019ce3 !important
    }

    /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
      background: transparent;
      color: #ffffff;
    }

    /deep/ .ant-table-thead > tr > th {
      //表头背景色
      background-color: rgba(53, 130, 243, 0.2) !important;
      padding: 6px 8px !important;
      overflow-wrap: break-word;
      border-bottom: 1px solid transparent;
      color: rgba(248, 245, 245, 0.85);
      font-weight: 400;
      font-size: 13px;
    }

    /deep/ .ant-table-tbody > tr > td {
      padding: 4px 8px !important;
      border-bottom: 1px solid transparent;
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
      position: relative;
      z-index: 1;
      margin-top: -1px;
      padding: 4px 8px;
      color: #ffffff;
      font-size: 12px;
      text-align: center;
      background: transparent;
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

    /deep/ .ant-table-row-expand-icon {
      background: transparent;
    }
  }

  /deep/ .ant-tabs-nav .ant-tabs-tab {
    background-color: #152137;
    margin: 0;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #7B909A;
    line-height: 24px;
    text-align: center;
    height: 30px;
    padding: 4px 16px 4px 16px;
  }

  /deep/ .ant-tabs-nav .ant-tabs-tab-active {
    color: #FFFFFF;
    background-color: #0659C3;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 24px;
  }

  /deep/ .ant-dropdown-menu-item {
    color: black;
  }


}

div[role=showContainer] {
  bottom: 0;
}

div[role=hideContainer] {
  bottom: -15.625vw;
}

/deep/ .ant-card-body {
  padding-bottom: 0 !important;
  zoom: 1;
  flex-direction: row;
  display: flex;
  width: 21vw;
}

.ant-card-bordered {
  border: 0 solid transparent;
  border-radius: 0;
}

/deep/ .ant-select-selection {
  color: #FFFFFF;
  background-color: transparent;
  border: 1px solid #307AE4 !important;
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

    .mainTree {
      .flex;
      width: 100%;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;

      .title {
        .flex;
        flex-direction: column;
        width: 100%;
        height: auto;
        font-size: 20px;
        font-family: Microsoft YaHei, serif;
        font-weight: bolder;
        color: #FFFFFF;
        margin-bottom: 5px;

        & span[class~=ant-input-search] {
          width: 95%;
          margin-top: 5px;
          margin-left: 2px;
        }
      }

      .left_tree {
        width: 100%;
        overflow: auto;
        margin-top: 0;
        position: relative;

        /deep/ .ant-tree {
          height: 22vw !important;
        }

        .tree-transparent
      }
    }

    .cardOpt {
      display: flex;
      height: 100%;
      align-items: center;

      & > img {
        width: 27px !important;
        height: 36px !important;
        cursor: pointer;
      }
    }
  }
}

/deep/ .ant-select-arrow > * {
  line-height: 1;
  color: #FFFFFF;
}

.cardShow {
  margin-left: 0 !important;
}

.cardHide {
  margin-left: -18vw !important;
}

/deep/ ::-webkit-scrollbar-track {
  border-radius: 0;
  background: transparent !important;
}
</style>

<style>
.evenRowStyl {
  background-color: rgba(53, 130, 243, 0.1) !important;
}
</style>
