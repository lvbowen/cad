<template>
  <article class="mainContainer">
    <!--    左 侧边栏 显示状态-->
    <div :class="isScale?'cardShow':'cardHide'" class="tree-container">
      <a-input-search
        class="search-input"
        v-if="isScale"
        placeholder="请输入关键字"
        @change="onSearch"/>
      <div class="left-tree">
        <a-tree
          v-if="isScale&&treeData.length>0"
          checkable
          selectable
          :defaultCheckedKeys="defaultCheckedKeys"
          :selectedKeys="selectedKeys"
          :loadData="onLoadData"
          :treeData="treeData"
          :replaceFields="replaceFields"
          @select="onSelect"
          @check="onCheck"
          :defaultExpandedKeys="treeExpandData"
        >
          <template v-slot:title="item">
            <span
              v-if="searchKeys.indexOf(item.eventKey) > -1"
              style="color: #0bcda3">{{ item.taskName }}</span>
            <span v-else>{{ item.taskName }}</span>
          </template>
        </a-tree>
      </div>
    </div>
    <img
      alt=""
      :src="closePng"
      @click="() => {this.isScale = !this.isScale}"
      class="array-png"
      :style="{marginLeft:isScale?'16.6vw':'1vw',transform:isScale?'rotateY(-180deg)':'rotateY(0deg)' }"/>
    <!--    底部 信息栏 显示状态 -->
    <div
      class="bottom-class"
      :class="isBottomShow?'showContainer':'hideContainer'"
      ref="MainTable"
      :key="cardKey">
      <img
        alt=""
        :src="closePng"
        @click="() => {this.isBottomShow = !this.isBottomShow }"
        class="bottom-array"
        :style="{bottom:isBottomShow?'calc(32.5vh - 40px)':'calc(1.5vh - 40px)', transform:isBottomShow?'rotate(90deg)':'rotate(270deg)'}"/>
      <main class="bottom-main">
        <div style="width: 85%">
          <a-tabs @tabClick="pressTab">
            <a-tab-pane v-for="(value,key) in tabData" :key="value" :tab="key">
              <div class="table-button">
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
                  <img :src="addDataIcon" class="icon-button" alt=""/>新增
                </a-button>
                <a-button
                  size="small"
                  type="link"
                  @click="filterAll"
                  style="margin-right: 4px">
                  <img :src="allDataIcon" class="icon-button" alt=""/>全部数据
                </a-button>
                <a-button
                  size="small"
                  type="link"
                  @click="filterAllModelData"
                  style="margin-right: 4px">
                  <img :src="mxDataIcon" class="icon-button" alt=""/>模型数据
                </a-button>
                <a-button
                  size="small"
                  type="link"
                  @click="filterAllCoorData"
                  style="margin-right: 4px">
                  <img :src="zbDataIcon" class="icon-button" alt=""/>坐标数据
                </a-button>
              </div>
              <a-table
                class="bottom-table"
                size="small"
                rowKey="id"
                :columns="tableLabel"
                :data-source="tableData"
                :scroll="{ x: '85%', y: tableHeight}"
                :scrollToFirstRowOnChange="true"
                :customRow="rowClick"
                :rowClassName="setRowClass"
              >
                <template slot="操作" slot-scope="text, record,index">
                  <a @click="showConnect(record,index)">关联详情</a>
                </template>
                <template v-for="(val,key) in allOptions" :slot="key" slot-scope="text, record">
                  <template v-for="(value,index) in val.data">
                    <div
                      v-show="record[key]===value.optionName"
                      :key="index"
                      :style="{ background: [record[key]===value.optionName?value.color:''],width:'100%',height:'100%'}">
                      {{ record[key] }}
                    </div>
                  </template>
                </template>
                <template v-for="(val,index) in attachment" :slot="val" slot-scope="text, record">
                  <img
                    v-if="record[val]"
                    :key="index"
                    alt=""
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
          <div class="button-list">
            <a-select
              size="small"
              :value="filterOption"
              style="float: left;margin-right: 4px;width: 120px;"
              @change="filterChange">
              <a-select-option v-for="(value,key,index) in allOptions" :key="index" :value="key">
                {{ value.propertyName }}
              </a-select-option>
            </a-select>
            <a-button size="small" style="float: left;margin-right: 4px" @click="distribution('distribution')">数据分布
            </a-button>
          </div>
          <div id="myChart"></div>
        </div>
      </main>
    </div>
    <connect-info
      v-if="isConnectShow"
      @closeConnectInfo="closeConnectInfo"
      @sendMessage="sendMessage"
      :projectCode="projectCode"
      :rowData="rowData"
      :codeData="codeData"
      :projectName="projectName"
      :schemaCode="schemaCode"
      :location="location"
      :index="index"></connect-info>
  </article>
</template>

<script src="./analysis.ts"></script>

<style lang="less" scoped>
@import "../../../styles/antd.less";
@import '../../../styles/public.module.less';

.mainContainer {
  .flex;
  width: 0;
  height: 0;
  z-index: 5;
  .tree-transparent;

  & .tree-container {
    .flex-column;
    transition: all .3s;
    position: fixed;
    background: url("../../../../src/assets/extends/cim/frame_left.png");
    background-size: 100% 100%;
    width: 18vw;
    height: 28vw;
    padding: 1vh 1.5vw;

    .search-input {
      width: 100%;
    }

    .left-tree {
      width: 100%;
      overflow: auto;
      margin-top: 0;
      position: relative;
      .tree-transparent;
      .scrollbar-default;
    }

  }

  & .array-png {
    transition: all .3s;
    position: relative;
    width: 40px;
    height: 80px;
    z-index: 9;
    margin-top: 22vh;
    cursor: pointer;
  }

  .cardShow {
    margin-left: 0;
  }

  .cardHide {
    margin-left: -16.5vw;
  }

  & .bottom-class {
    .flex;
    z-index: 10;
    transition: all .3s;
    flex-direction: column;
    position: fixed;
    background: url("../../../../src/assets/extends/cim/bottom_kuang.png");
    background-size: 100% 100%;
    border-color: transparent;
    height: 35vh;
    width: 99.8vw;
    margin-left: 0.1vw;


      & > .bottom-array {
        transition: all .3s;
        position: fixed;
        left: calc(50vw - 70px);
        z-index: 99;
        //margin: auto;
        height: 80px;
        width: 15px;
      }

    & > .bottom-main {
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

      /deep/ .ant-select-selection {
        color: #FFFFFF;
        background-color: transparent;
        border: 1px solid #307AE4 !important;
      }

      /deep/ .ant-select-arrow > * {
        line-height: 1;
        color: #FFFFFF;
      }

      & > #myChart {
        width: 100%;
        height: 100%;
      }
    }


    .table-button {
      //margin: -10px 15px 4px 0;
      width: 99%;
      margin-top: -8px;
      margin-bottom: 5px;

      .icon-button {
        width: 15px;
        height: 15px;
      }
    }

    .button-list {
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

    .bottom-table {
      width: 99%;

      .pagnition-transparent;
      .table-small-transparent;
    }

    /deep/ .ant-tabs-nav .ant-tabs-tab {
      background-color: #152137;
      margin: 0;
      color: #7B909A;
      text-align: center;
      height: 30px;
      padding: 4px 16px 4px 16px;
    }

    /deep/ .ant-tabs-nav .ant-tabs-tab-active {
      color: #FFFFFF;
      background-color: #0659C3;
      font-weight: 400;
      line-height: 24px;
    }
  }

  .showContainer {
    bottom: 0;
  }

  .hideContainer {
    bottom: -33vh;
  }
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

