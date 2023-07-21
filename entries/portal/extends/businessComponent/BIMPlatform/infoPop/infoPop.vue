<template>
  <article :class="[this.markStr !== '' ? 'show' : 'hide', 'main']">
    <vue-drag-resize
      :w="vw"
      :h="vh"
      :x="left"
      :y="top"
      @clicked="clickHandle"
      :isResizable="false">
      <div
        class="pop_main full flex flex-column"
        :style="{ width: `${vw}px`, height: `${vh}px` }"
      >
        <div>
          <p class="title">属性详情</p>
          <img
            :src="closeIcon"
            class="closeBtn"
            @click="infoPopClose"
          />
        </div>
        <div class="father_tab flex-1">
          <a-tabs @change="pressFather" v-model="activeKey">
            <a-tab-pane
              v-for="item in fatherButtonData"
              :key="item.id"
              :tab="item.buttonName">
              <div class="sub_collapse">
                <div
                  v-for="item in subButtonData"
                  :key="item.id"
                  style="clear: both">
                  <img
                    :src="titleQQ"
                    class="img_left"
                    @click="pressSubButton(item)"
                  />
                  <p class="font_mid" @click="pressSubButton(item)">
                    {{ item.buttonName }}
                  </p>
                  <img
                    v-if="!collapseClose && markId == item.id"
                    :src="icon_arr1"
                    class="img_right"
                    @click="pressSubButton(item)"
                  />
                  <img
                    v-else
                    :src="icon_arr1"
                    class="img_right_close"
                    @click="pressSubButton(item)"
                  />
                  <img :src="lineIcom" class="img_bottom"/>
                  <div
                    style="height: 'auto'"
                    v-if="Object.keys(verticalData).length != 0 &&tabShow &&!collapseClose &&markId == item.id"
                  >
                    <div v-for="(value, key, index) in verticalData" :key="key">
                      <div class="table_title" @click="closeTable(key)" v-if="key!=='关联表单'">
                        <p class="table_p">
                          <img
                            v-if="closeTableID.indexOf(key) == -1"
                            style="cursor: pointer"
                            :src="icon_arr1"
                          />
                          <img
                            v-else
                            :src="icon_arr1"
                            class="table_img_close"
                          />{{ key }}
                        </p>
                      </div>
                      <div
                        class="qualityInformation"
                        v-if="item.buttonName === '质量信息'"
                      >
                        <a-table
                          v-if="closeTableID.indexOf(key) === -1"
                          :key="index"
                          rowKey="id"
                          class="devOps_table"
                          :pagination="false"
                          :columns="value.columns"
                          :data-source="value.data"
                        >
                          <template slot="bizSheetName" slot-scope="text, record">
                            <!--                            <p @click="winOpen(record,value)" style="cursor: pointer;"></p>-->
                            {{ record.sheetName }}
                          </template>
                          <!--                          <template slot="status" slot-scope="text, record">-->
                          <!--                            <p>{{ record.datas && record.datas[0].status }}</p>-->
                          <!--                          </template>-->
                          <template slot="operate" slot-scope="text,record">
                            <a-icon
                              type="plus-circle"
                              class="icon"
                              @click="addForm(record)"></a-icon>
                            <a-icon
                              type="ordered-list"
                              class="icon"
                              :class="record.completeFraction && record.completeFraction.trim()==='0/0'?'disable':''"
                              @click="getFormList(record)"></a-icon>
                          </template>
                        </a-table>
                      </div>
                      <div v-else-if="item.buttonName === '计量信息' ||item.buttonName === '进度信息'">
                        <a-table
                          v-if="closeTableID.indexOf(key) == -1 "
                          :key="index"
                          rowKey="id"
                          class="devOps_table"
                          :pagination="false"
                          :columns="value.columns"
                          :data-source="value.data"
                        >
                          <template slot="msg" slot-scope="text, record">
                            <a
                              v-if="record.property && record.msg !== '查看/编辑'"
                              @click="toUrl(record)"
                              class="underline"
                            >
                              <img
                                :src="fileIcon"
                                style="width: 18px; height: 17px"
                              />{{ "\xa0" + "." + "\xa0" + record.msg }}</a>
                            <a
                              v-else-if="record.property && record.msg === '查看/编辑'"
                              @click="toUrl(record)">
                              {{ record.msg }}</a>
                            <div
                              v-else-if="record.color"
                              :key="index"
                              :style="{background: [record.color],width: '100%',height: '100%',}">
                              {{ record.msg }}
                            </div>
                            <p v-else>{{ record.msg }}</p>
                          </template>
                          <template slot="name" slot-scope="text, record">
                            <p style="color: #0bcda3">{{ record.name }}</p>
                          </template>
                        </a-table>
                      </div>
                      <div v-else>
                        <a-table
                          v-if="closeTableID.indexOf(key) == -1 "
                          :key="index"
                          rowKey="id"
                          class="devOps_table"
                          :pagination="false"
                          :columns="value.columns"
                          :data-source="value.data"
                        >
                          <template slot="msg" slot-scope="text, record">
                            <p v-if="!record.schemaCode">{{ record.msg }}</p>
                            <a v-else @click="openFormDetail(record)">{{ record.msg }}</a>
                          </template>
                          <template slot="name" slot-scope="text, record">
                            <p v-if="!record.schemaCode">{{ record.name }}</p>
                            <a
                              v-else
                              style="color: #0bcda3"
                              @click="openFormDetail(record)">{{ record.name }}</a>
                          </template>
                        </a-table>
                      </div>
                    </div>
                  </div>
                  <p
                    style="text-align: center; color: #ffffff"
                    v-if="Object.keys(verticalData).length == 0 &&tabShow &&!collapseClose &&markId == item.id"
                  >
                    <a-spin
                      v-if="showSpin &&tabShow &&!collapseClose &&markId == item.id"
                    />
                    暂无相关信息
                  </p>
                  <class-library-property
                    v-show="subModelPropertyData.length && markId === item.id"
                    class="modal-property"
                    :modelPropertyData="subModelPropertyData"
                    :modelPropertyTitle="subModelPropertyTitle"
                    :modelPropertyColumns="subModelPropertyColumns"
                    :propertyLoading="subPropertyLoading"
                    :key="subModelPropertyTitle"
                    :showModelPropertyTable="subShowModelPropertyTable"
                    @closeModalProTable="closeSubModalProTable"
                  />
                </div>
              </div>
              <a-spin v-if="showSpin && !tabShow"/>
              <!--                    无第二级菜单（设计阶段）        -->
              <div style="height: 'auto';" v-if="!tabShow">
                <div v-for="(value, key, index) in verticalData" :key="key" v-if="!value.data||value.data.length!==0">
                  <attachments
                    v-if="key ==='attachments' && value.data"
                    :attachData="value.data"
                  ></attachments>
                  <div
                    v-if="key !=='attachments'"
                    :style="{ height: verticalData['attachments'] && verticalData['attachments'].data?'310px':modelPropertyData.length?'auto':'570px',overflow:'auto'}">
                    <div class="table_title" @click="closeTable(key)">
                      <p class="table_p">
                        <img
                          v-if="closeTableID.indexOf(key) == -1"
                          style="cursor: pointer"
                          :src="icon_arr1"
                        />
                        <img v-else :src="icon_arr1" class="table_img_close"/>{{ key }}
                      </p>
                    </div>
                    <a-table
                      v-if="closeTableID.indexOf(key) == -1"
                      :key="index"
                      rowKey="id"
                      class="devOps_table"
                      :pagination="false"
                      :columns="value.columns"
                      :data-source="value.data"
                    >
                      <template slot="msg" slot-scope="text, record">
                        <a
                          v-if="record.property && record.msg !== '查看/编辑'"
                          @click="toUrl(record)"
                          class="underline"
                        >
                          <img
                            :src="fileIcon"
                            style="width: 18px; height: 17px"
                          />{{ "\xa0" + "." + "\xa0" + record.msg }}</a>
                        <a
                          v-else-if="record.property && record.msg === '查看/编辑'"
                          @click="toUrl(record)"
                        >{{ record.msg }}</a>
                        <p v-else>{{ record.msg }}</p>
                      </template>
                      <template slot="name" slot-scope="text, record">
                        <p style="color: #0bcda3">{{ record.name }}</p>
                      </template>
                    </a-table>
                  </div>
                </div>
              </div>
              <class-library-property
                v-show="modelPropertyData.length"
                class="modal-property"
                @updateModelProperty="updateModelProperty"
                :enableEdit="enableEdit"
                :modelPropertyData="modelPropertyData"
                :modelPropertyTitle="modelPropertyTitle"
                :modelPropertyColumns="modelPropertyColumns"
                :propertyLoading="propertyLoading"
                :showModelPropertyTable="showModelPropertyTable"
                @closeModalProTable="closeModalProTable"
              />
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </vue-drag-resize>
    <form-detail
      v-if="formDetailCode"
      :appCode="projectCode"
      :projectName="projectName"
      :smid="SMID"
      :dataSource="LAYERNAME"
      :schemaCode="formDetailCode"
      :modelType="modelType"
      :codeValue="codeValue"
      @closeDetail="()=>{this.formDetailCode=null}"></form-detail>
  </article>
</template>
<script src="./infoPop.ts"></script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import './infoPop.public.less';
html {
  --foo: 88px;
}

.main {
  position: relative;

  &.show {
    height: 0;
    width: 0;
    z-index: 999999999;
  }

  &.hide {
    display: none;
  }
}

.sub_collapse {
  .img_left {
    float: left;
    width: 7px;
    height: 17px;
    margin-left: 2px;
    cursor: pointer;
  }

  .img_right {
    float: right;
    width: 17.8px;
    height: 17.8px;
    cursor: pointer;
  }

  .img_right_close {
    float: right;
    width: 17.8px;
    height: 17.8px;
    cursor: pointer;
    transform: rotate(270deg);
  }

  .font_mid {
    float: left;
    color: #ffffff;
    font-size: 14px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    margin-left: 10px;
    margin-top: -3px;
    cursor: pointer;
  }

  .img_bottom {
    clear: both;
    width: 100%;
  }
}

.pop_main {
  background: url("../../../../src/assets/extends/bim/bg_xk.png");
  background-size: 100% 100%;
  position: fixed;
  margin-left: -30px;
  margin-top: -10px;
}

.title {
  width: 100px;
  height: 48px;
  font-size: 20px;
  font-family: Source Han Sans CN;
  font-weight: bold;
  color: #ffffff;
  line-height: 48px;
  float: left;
  margin-top: 20px;
  margin-left: 30px;
}

.closeBtn {
  float: right;
  width: 14px;
  height: 14px;
  margin-top: 30px;
  margin-right: 30px;
}

.father_tab {
  clear: both;
  //margin: 30px;
  padding: @spacing-base;

  .ant-tabs {
    .flex;
    flex: 1;
    .flex-column;
    .full-height;
    overflow: overlay;

    &::-webkit-scrollbar {
      width: 0.05px;
    }

    /deep/ .ant-tabs-content {
      flex: 1;
      overflow-y: visible;
    }

    /deep/ .ant-tabs-nav-container-scrolling {
      padding: 0 !important;
    }
  }

  //.table_img_close {
  //  cursor: pointer;
  //  transform: rotate(180deg);
  //}

  /deep/ .ant-tabs-nav .ant-tabs-tab {
    background-color: #152137;
    margin: 0;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #7b909a;
    line-height: 24px;
    text-align: center;
    width: var(--foo);
  }

  /deep/ .ant-tabs-nav .ant-tabs-tab-active {
    color: #ffffff;
    background-color: #0659c3;
    font-family: Source Han Sans CN;
    font-weight: 400;
    color: #ffffff;
    line-height: 24px;
  }

  //.table_title {
  //  //height: 14px;
  //  color: #c5dfff;
  //  background: url("../../../../src/assets/extends/bim/infoPop/pic.png");
  //  background-size: 100% 100%;
  //  margin-top: 5px;
  //
  //  .table_p {
  //    text-align: center;
  //    font-size: 20px;
  //    font-family: "楷体";
  //    line-height: 12px;
  //    font-weight: 600;
  //  }
  //}

  //.devOps_table {
  //  margin-top: 1%;
  //  margin-bottom: 10px;
  //  width: 100%;
  //  overflow: auto;
  //  //clear: both;
  //  .underline {
  //    border-bottom: 1px solid white;
  //    padding-bottom: 3px;
  //  }
  //
  //  /deep/ .ant-table {
  //    height: auto;
  //    .ant-empty-description {
  //      color: white;
  //    }
  //  }
  //
  //  /deep/ .ant-table-tbody > tr:hover > td {
  //    background: #558fab !important;
  //  }
  //
  //  /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
  //    background: transparent;
  //    color: #ffffff;
  //  }
  //
  //  /deep/ .ant-table-thead {
  //    display: none;
  //  }
  //
  //  /deep/ .ant-table-tbody > tr > td {
  //    padding: 8px 8px !important;
  //    border-bottom: 0px solid transparent;
  //    color: #ffffff;
  //    text-align: center;
  //  }
  //
  //  /deep/ .ant-table-placeholder {
  //    position: relative;
  //    z-index: 1;
  //    margin-top: -1px;
  //    padding: 4px 8px;
  //    color: #ffffff;
  //    font-size: 12px;
  //    text-align: center;
  //    background: transparent;
  //  }
  //}

  ::-webkit-scrollbar-track {
    border-radius: 0;
    background: transparent;
  }

  .modal-property {
    margin-top: @spacing-large;
    margin-bottom: @spacing-large;

    /deep/ .ant-table-row-cell-break-word:first-child {
      color: rgb(11, 205, 163) !important;
    }
  }
}

/deep/ .vdr.active:before {
  outline: 0px dashed #d6d6d6;
}
</style>

<style lang="less">
@import '../../../styles/public.module.less';

.qualityInformation {
  .ant-table-thead {
    display: contents !important;
  }

  //.ant-table-thead > tr:first-child > th:first-child {
  //  color: rgb(11, 205, 163);
  //  border: none;
  //  background: none;
  //  text-align: center;
  //  width: 56%;
  //}
  //
  //.ant-table-thead > tr:first-child > th:last-child {
  //  color: rgb(11, 205, 163);
  //  border: none;
  //  background: none;
  //  text-align: center;
  //}
  .ant-table-thead > tr:first-child > th {
    color: rgb(11, 205, 163);
    border: none;
    background: none;
    text-align: center;
  }

  .icon {
    margin-left: @spacing-medium;

    &:hover {
      cursor: alias;
    }

    &:first-child {
      margin-left: 0;
    }
  }
}
</style>
