<template>
  <a-modal
    v-model="showModal"
    :title="$t('cloudpivot.list.pc.ImportData')"
    :width="1120"
    :cancelText="$t('cloudpivot.list.pc.Skip')"
    :okText="$t('cloudpivot.list.pc.SureImport')"
    @ok="sureImport"
    @cancel="cancel"
    wrapClassName="import-err-modal"
    :maskClosable="false"
  >
    <div v-if="isHalfSuccess" class="data-import-status--halfsuccess">
      <p class="data-import-status--halfsuccess__success">
        <i class="icon aufontAll h-icon-all-check-circle"/>
        <span>{{
          $t("cloudpivot.list.pc.ImportTips6", {num: successNum})
        }}</span>
      </p>
      <p class="data-import-status--halfsuccess__error">
        <i class="icon aufontAll h-icon-all-close-circle"/>
        <span>{{
          $t("cloudpivot.list.pc.ImportTips7", {num: failNum})
        }}</span>
        <span class="data-import-status--halfsuccess__tip">
          {{ $t("cloudpivot.list.pc.ImportTips8") }}
          <a href="javascript:" @click="exportErrorResult">{{
            $t("cloudpivot.list.pc.DownloadFailedList")
          }}</a>
        </span>
      </p>
    </div>
    <div class="flex">
      <a-button @click="handleOnBatchUpdate">{{
        $t("cloudpivot.list.pc.batchUpdata")
      }}
      </a-button>
      <div class="title-tips">
        <template v-if="!showBacthUpdate">
          {{ $t("cloudpivot.list.pc.importTitleBatchTips") }}12
        </template>
        <template v-else>
          {{ $t("cloudpivot.list.pc.importTitleTips") }}
        </template>
      </div>
    </div>
    <div v-if="showBacthUpdate">
      <div class="batch-updata-style">
        <div class="filters">
          <a-row
            v-for="(row, index) in filterList"
            :key="index"
            :gutter="16"
            style="margin-top: 5px"
          >
            <a-col
              :span="2"
            ><span v-if="index === 0" style="line-height: 32px">{{
              $t("cloudpivot.list.pc.filterCondition")
            }}</span></a-col
            >
            <a-col :span="5">
              <a-select
                v-model="row.data"
                class="data-filter"
                placeholder="请选择"
                @change="handleChangeDataItem(row, index)"
              >
                <a-select-option
                  v-for="(type, ii) in row.dataItem"
                  :key="ii"
                  :title="type.title"
                  :value="`${type.key}${
                    type.parentDataIndex ? '、' + type.parentDataIndex : ''
                  }`"
                >{{ type.title }}
                </a-select-option
                >
              </a-select>
            </a-col>
            <a-col :span="16">
              <div>
                <a-select
                  v-model="row.type"
                  :filterOption="filterOption"
                  class="data-filter"
                  optionFilterProp="children"
                  placeholder="请选择"
                  showSearch
                >
                  <a-select-option
                    v-for="(type, vv) in row.typeList"
                    :key="vv + index"
                    :title="
                      Array.isArray(type)
                        ? type
                          .map((i) =>
                            getNameAndErrorText(i.name, i.excelType)
                          )
                          .join('、')
                        : type
                    "
                    :value="
                      Array.isArray(type)
                        ? type.map((i) => (i.id ? i.id : i.name)).join('、')
                        : type
                    "
                  >
                    <a-tooltip placement="bottom">
                      <span slot="title">{{
                        Array.isArray(type)
                          ? type
                            .map((i) =>
                              getNameAndErrorText(i.name, i.excelType)
                            )
                            .join("、")
                          : type
                      }}</span>
                      <span v-if="Array.isArray(type)">
                        <template v-for="(i, v) in type">
                          <span
                            :key="v + i.name"
                            :class="{ 'error-user-batch': i.excelType }"
                            class="row-inner-user"
                          >
                            {{ getNameAndErrorText(i.name, i.excelType) }}
                            <span v-if="v !== type.length - 1">、</span>
                          </span>
                        </template> </span
                      ><span v-else>{{ type }}</span>
                    </a-tooltip>
                  </a-select-option>
                </a-select>
              </div>
            </a-col>
            <a-col :span="1" style="text-align: center; padding-top: 4px">
              <span class="delete" @click="delRows(index, 'filterList')">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </a-col>
          </a-row>

          <a-row>
            <a-col
              :span="2"
            ><span v-if="filterList.length === 0" style="line-height: 32px">{{
              $t("cloudpivot.list.pc.filterCondition")
            }}</span></a-col
            >
            <div class="add">
              <span
                :style="filterList.length === 0 ? 'margin-left: -86px' : ''"
                @click="addRowsFilter()"
              >
                <span>
                  <i class="icon aufontAll h-icon-all-plus-o"></i>
                </span>
                <span>{{
                  $t("cloudpivot.list.pc.Add") +
                    $t("cloudpivot.list.pc.filterCondition")
                }}</span>
              </span>
            </div>
          </a-row>
        </div>
        <div class="filters">
          <a-row
            v-for="(row, index) in batchList"
            :key="index"
            :gutter="16"
            style="margin-top: 5px"
          >
            <a-col
              :span="2"
            ><span v-if="index === 0" style="line-height: 32px">{{
              $t("cloudpivot.list.pc.batchUpdata")
            }}</span></a-col
            >
            <a-col :span="5">
              <a-select
                v-model="row.data"
                class="data-filter"
                placeholder="请选择"
                @change="handleChangeDataItem(row, index)"
              >
                <a-select-option :key="'allData'" :value="`allData`">{{
                  $t("cloudpivot.list.pc.all")
                }}
                </a-select-option>
                <a-select-option
                  v-for="(type, ii) in row.dataItem"
                  :key="ii"
                  :title="type.title"
                  :value="`${type.key}${
                    type.parentDataIndex ? '、' + type.parentDataIndex : ''
                  }`"
                >{{ type.title }}
                </a-select-option
                >
              </a-select>
            </a-col>
            <a-col :span="9">
              <a-select
                v-model="row.type"
                :filterOption="filterOption"
                class="data-filter"
                optionFilterProp="children"
                placeholder="请选择"
                showSearch
              >
                <a-select-option
                  v-for="(type, vv) in row.typeList"
                  :key="vv + index"
                  :value="type.map((i) => (i.id ? i.id : i.name)).join('、')"
                >
                  <a-tooltip placement="bottom">
                    <span slot="title">{{
                      type
                        .map((i) => getNameAndErrorText(i.name, i.excelType))
                        .join("、")
                    }}</span>
                    <span>
                      <template v-for="(i, v) in type">
                        <span
                          :key="v + i.name + vv"
                          :class="{ 'error-user-batch': i.excelType }"
                          class="row-inner-user"
                        >
                          {{ getNameAndErrorText(i.name, i.excelType) }}
                          <span v-if="v !== type.length - 1">、</span>
                        </span>
                      </template>
                    </span>
                  </a-tooltip>
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="7">
              <div class="batch-update-new-data">
                <div>
                  <template v-for="(user, index) in row.value">
                    <span
                      v-if="index === row.value.length - 1"
                      :key="index"
                      :class="{ 'error-user': user.excelType }"
                      class="row-inner-user"
                    >
                      {{ getNameAndErrorText(user.name, user.excelType) }}
                    </span>
                    <span
                      v-else
                      :key="index"
                      :class="{ 'error-user': user.excelType }"
                      class="row-inner-user"
                    >
                      {{
                        getNameAndErrorText(user.name, user.excelType) + "、"
                      }}
                    </span>
                  </template>
                </div>
                <SelectUser
                  v-model="row.value"
                  :row="row.dataItem"
                ></SelectUser>
              </div>
            </a-col>
            <a-col :span="1" style="text-align: center; padding-top: 4px">
              <span
                v-if="batchList.length > 1"
                class="delete"
                @click="delRows(index, 'batchList')"
              >
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </a-col>
          </a-row>

          <div class="add">
            <span @click="addRows()">
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span>{{ $t("cloudpivot.list.pc.addResult") }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="flex" style="flex-direction: row-reverse; margin-right: 20px">
        <a-button size="small" type="primary" @click="handleOnBatchConfirm">{{
          $t("cloudpivot.list.pc.OK")
        }}
        </a-button>
        <a-button
          size="small"
          style="margin-right: 20px"
          @click="clearBatchData"
        >{{ $t("cloudpivot.list.pc.TakeUp") }}
        </a-button
        >
      </div>
    </div>
    <sheet v-if="showModal" :columns="columns" :dataSource="dataSource"></sheet>
    <div ref="paginationBox" class="pagination-box">
      <a-pagination
        :current="curPage"
        :pageSize="pageSize"
        :pageSizeOptions="pageSizeOptions"
        :showTotal="(total) => $t('cloudpivot.list.pc.Total', { num: total })"
        :total="total"
        showQuickJumper
        showSizeChanger
        @change="onPaginationChange"
        @showSizeChange="onSizeChange"
      />
    </div>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, namespace } from "vuex-class";
import sheet from "./sheet.vue";
import { listApi, listParams } from "@cloudpivot/api";
import SelectUser from "./select-user.vue";

import { DataItemType } from "@cloudpivot/form/schema";

const WorkflowCenterModule = namespace("WorkflowCenter/WorkflowCenter");

@Component({
  name: "import-err-modal",
  components: {
    sheet,
    SelectUser,
  },
})

export default class ImportErrModal extends Vue {
  @WorkflowCenterModule.State("applicationPageTitle") applicationPageTitle: any;

  @Prop() value!: boolean;

  @Prop({
    type: Number,
    default: 0,
  })
  successNum!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  failNum!: number;

  @Prop({
    type: Number,
    default: 8,
  })
  status!: any;

  @Prop({
    type: String,
  }) fileName!: string;

  @Prop() importData!: any;
  // 分页配置项
  pageSizeOptions: string[] = [ "10", "20", "50", "100" ];

  showModal: boolean = false;

  total: number = 0;

  pageSize: number = 20;

  curPage: number = 1;

  columns: any = [];

  dataSource: any = [];
  showBacthUpdate: any = false;
  batchList: any = [
    {
      type: undefined,
      value: undefined,
      data: undefined,
      dataItem: [],
      typeList: [],
    },
  ];
  dataItem: any = [];
  dataItemAll: any = [];
  itemContentList: any = [];
  errType: any = {
    Repeat: 1,
    NoExisted: 2,
    Null: 3,
    DisableDept: 4
  };
  filterList: any = [];

  get isHalfSuccess() {
    return this.status === listParams.ImportResult.PartialSuccess
        || this.status === listParams.ImportResult.FaileReImport;
  }

  /*
  * 初始化表头
  */
  initColumns() {
    const dataItem: any = [];
    const dataItemAll: any = [];
    const _columns = this.importData.headColumns.map((col:any, idx:number) => {
      let colWidth: number = this.caculateColWidth(col);
      let childColumns = null;
          if (col.propertyType === DataItemType.StaffSelector) {
            dataItem.push({
              title: col.name,
              dataIndex: col.propertyCode,
              propertyType: col.propertyType,
              displayFormat: col.displayFormat,
              width: colWidth,
              key: col.propertyCode,
              childColumns,
            });
          }
          if (col.propertyType !== DataItemType.Sheet) {
            dataItemAll.push({
              title: col.name,
              dataIndex: col.propertyCode,
              propertyType: col.propertyType,
              displayFormat: col.displayFormat,
              width: colWidth,
              key: col.propertyCode,
              childColumns,
            });
          }

      // 子表初始化其子数据项
      if (col.propertyType === DataItemType.Sheet) {
        if (!col.childColumns || !col.childColumns.length) {
          return;
        }
        let childSheetWidth:number = 0;
        childColumns = col.childColumns.map((child:any) => {
          const childWidth:number = this.caculateColWidth(child);
          childSheetWidth += childWidth;
              if (child.propertyType === DataItemType.StaffSelector) {
                dataItem.push({
                  title: `${col.name}、${child.name}`,
                  dataIndex: child.propertyCode,
                  propertyType: child.propertyType,
                  displayFormat: child.displayFormat,
                  width: childWidth,
                  parentDataIndex: col.propertyCode,
                  key: child.propertyCode,
                  childColumns: null,
                });
              }
              dataItemAll.push({
                title: `${col.name}、${child.name}`,
                dataIndex: child.propertyCode,
                propertyType: child.propertyType,
                displayFormat: child.displayFormat,
                width: childWidth,
                parentDataIndex: col.propertyCode,
                key: child.propertyCode,
                childColumns: null,
              });
          return {
            title: child.name,
            dataIndex: child.propertyCode,
            propertyType: child.propertyType,
            width: childWidth,
            key: child.propertyCode,
              };
        });
        colWidth = childSheetWidth + 46;
        //子表添加
        //@ts-ignore
        if(Array.isArray(childColumns) && childColumns.length > 0){
          const indexColumn = {
                dataIndex: "index",
            propertyType: 0,
            width: 46,
                key: "index",
          };
          //@ts-ignore
          childColumns.unshift(indexColumn);
        }
      }

      const back = {
        title: col.name,
        dataIndex: col.propertyCode,
        propertyType: col.propertyType,
        displayFormat: col.displayFormat,
        width: colWidth,
        key: col.propertyCode,
            childColumns,
      };

      return back;
    }).filter(Boolean);
    this.dataItem = JSON.parse(JSON.stringify(dataItem));
    this.batchList[0].dataItem = JSON.parse(JSON.stringify(dataItem));
    this.dataItemAll = JSON.parse(JSON.stringify(dataItemAll));
    // 增加序号列
    if (_columns.length) {
      const indexColumn = {
        dataIndex: "index",
        propertyType: 0,
        width: 46,
        key: "index",
        childColumns: null,
      };
      _columns.unshift(indexColumn);
    }

    this.columns = _columns;
  }

  /*
  * 初始化表格数据（本地分页）
  */
  initTableData() {
    if (this.importData && this.importData.secondImportData) {
      this.dataSource = this.importData.secondImportData.slice(0, this.pageSize);
      this.total = this.importData.secondImportData.length;
    }
  }

  /*
  * 分页改变
  */
  onPaginationChange(page: number, size: number) {
    this.curPage = page;
    this.dataSource = this.importData.secondImportData.slice((page-1)*this.pageSize, page*this.pageSize);
  }

  /*
  * 分页pageSize改变
  */
  onSizeChange(current: number, size: number) {
    this.curPage = 1;
    this.pageSize = size;
    this.dataSource = this.importData.secondImportData.slice(0, size);
  }

  /*
   * 计算记录中列的宽度
  */
  caculateColWidth(col:any) {
    const longInput = [1, 5, 8, 9, 10];
    if (longInput.includes(col.propertyType)) {
      return 252;
    }
    return 162;
  }

  /*
  * 确定导入
  */
  async sureImport() {
    this.importData.secondImportData.forEach((data:any) => {
      delete data.index;
      delete data.key;
    });
    const params = {
      headColumns: this.importData.headColumns,
      secondImportData: this.importData.secondImportData,
      queryField: this.importData.queryField,
    };
    const res = await listApi.secondImportData(params);
    if (res.errcode === 0) {
      this.$message.success(
          this.$t("cloudpivot.list.pc.ImportSuccess") as string
      );
      this.cancel();
    } else {
      if (res.errcode === 303030 && res.data) {
        this.$message.error(res.errmsg as string);
        this.importData = {
          headColumns: res.data.headColumns,
          secondImportData: res.data.secondImportData,
          queryField: res.data.queryField,
        };
        this.initColumns();
        this.initTableData();
        return;
      }
      this.$message.error(res.errmsg as string);
    }
  }

  cancel() {
    this.clearBatchData();
    //成功或失败都无需做处理
    listApi.deleteTemporaryFile({fileName: this.fileName});
    this.$emit("reloadList", "reload");
    this.$emit("input", false);
  }

  /**
   * 下载错误信息文档
   */
  async exportErrorResult() {
    const res = await listApi.exportErrorResult(this.fileName);
    if ((res.errcode && res.errcode !== 0) || res.byteLength < 100) {
      this.$message.error(
          this.$t("cloudpivot.list.pc.DownloadFailed") as string
      );
    } else {
      const blob = new Blob([ res ], { type: "application/vnd.ms-excel" });
      const stamp = new Date().getMilliseconds();
      const fileName = `${this.applicationPageTitle}错误信息${this.getTime()}.xlsx`;

      this.downloadFile(blob, fileName);
    }
  }

  getTime() {
    const date = new Date();
    const mounth = date.getMonth() > 8 ? date.getMonth() + 1:  `0${date.getMonth() + 1}`;
    const days = date.getDate() > 9 ? date.getDate():  `0${date.getDate()}`;
    const hours = date.getHours() > 9 ? date.getHours():  `0${date.getHours()}`;
    const minutes = date.getMinutes() > 9 ? date.getMinutes():  `0${date.getMinutes()}`;
    const seconds = date.getSeconds() > 9 ? date.getSeconds():  `0${date.getSeconds()}`;

    const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
    return stamp;
  }

  downloadFile(blob: any, fileName: string) {
    //@ts-ignore
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /*
  * 重置分页器参数
  */
  resetPagination() {
    this.total = 0;
    this.curPage = 1;
    this.pageSize = 20;
  }

  @Watch("value")
  onValueChange(v: boolean) {
    this.showModal = v;
    if (v) {
      this.initColumns();
      this.initTableData();
    } else {
      this.resetPagination();
    }
  }

  handleOnBatchUpdate() {
    this.showBacthUpdate = !this.showBacthUpdate;
  }

  // 删除行
  delRows(index, key) {
    this[key].splice(index, 1);
  }

  // 添加行
  addRows(type: string): void {
    // newRow Data
    const newRow: any = {
      type: undefined,
      value: undefined,
      data: undefined,
      dataItem: this.dataItem,
      typeList: [],
    };
    this.batchList.push(...[ newRow ]);
  }

  addRowsFilter(type: string): void {
    // newRow Data
    const newRow: any = {
      type: undefined,
      data: undefined,
      dataItem: this.dataItemAll,
      typeList: [],
    };
    this.filterList.push(...[ newRow ]);
  }

  handleChangeDataItem(row, index) {
    let arr: any = [];
    let arr2: any = [];
    let parentSheet: any = null;
    let rowArr: any = [];
    if (row.data === "allData") {
      row.dataItem.forEach((o) => {
        this.importData.secondImportData.forEach((i) => {
          const parent = i[o.parentDataIndex];
          if (i[o.dataIndex] || parent) {
            if (parent) {
              parent.forEach((v) => {
                if (v[o.dataIndex]) {
                  if (Array.isArray(v[o.dataIndex])) {
                    const obj = this.changeData(v[o.dataIndex], arr, arr2);
                    if (obj.arr && obj.arr.length > 0) arr = obj.arr;
                    if (obj.arr2 && obj.arr2.length > 0) arr2 = obj.arr2;
                  } else if (typeof v[o.dataIndex] === "string") {
                    // eslint-disable-next-line no-shadow
                    const l = arr.filter((i) => i === v[o.dataIndex]);
                    if (!l || (l && l.length <= 0)) arr.push(v[o.dataIndex]);
                  }
                }
              });
            } else {
              if (Array.isArray(i[o.dataIndex])) {
                const obj = this.changeData(i[o.dataIndex], arr, arr2);
                if (obj.arr && obj.arr.length > 0) arr = obj.arr;
                if (obj.arr2 && obj.arr2.length > 0) arr2 = obj.arr2;
              } else if (typeof i[o.dataIndex] === "string") {
                // eslint-disable-next-line no-shadow
                const l = arr.filter((i) => i === i[o.dataIndex]);
                if (!l || (l && l.length <= 0)) arr.push(i[o.dataIndex]);
              }
            }
          }
        });
      });
    } else {
      if (row.data) {
        rowArr = row.data.split("、");
        if (rowArr.length === 2) {
          parentSheet = rowArr[1];
        }
      }
      this.importData.secondImportData.forEach((e) => {
        if (parentSheet && e[parentSheet]) {
          e[parentSheet].forEach((o) => {
            if (o[rowArr[0]]) {
              if (Array.isArray(o[rowArr[0]])) {
                const obj = this.changeData(o[rowArr[0]], arr, arr2);
                if (obj.arr && obj.arr.length > 0) arr = obj.arr;
                if (obj.arr2 && obj.arr2.length > 0) arr2 = obj.arr2;
              } else if (typeof o[rowArr[0]] === "string") {
                const l = arr.filter((i) => i === o[rowArr[0]]);
                if (!l || (l && l.length <= 0)) arr.push(o[rowArr[0]]);
              }
            }
          });
        } else {
          if (Array.isArray(e[row.data])) {
            const obj = this.changeData(e[row.data], arr, arr2);
            if (obj.arr && obj.arr.length > 0) arr = obj.arr;
            if (obj.arr2 && obj.arr2.length > 0) arr2 = obj.arr2;
          } else if (typeof e[row.data] === "string") {
            const l = arr.filter((i) => i === e[row.data]);
            if (!l || (l && l.length <= 0)) arr.push(e[row.data]);
          }
        }
      });
    }

    row.type = undefined;
    row.typeList = [ ...arr, ...arr2 ];
    console.log(row, "dddd");
  }

  changeData(list, arr, arr2) {
    if (list) {
      let status = list.filter((i) => i.excelType);
      const name = list.map((i) => i.name);
      if (status && status.length > 0) {
        if (arr.length > 0) {
          let a = arr.filter((i) => JSON.stringify(list) === JSON.stringify(i));
          if (!a || (a && a.length <= 0)) {
            if (list && list.length > 0) arr = arr.concat([ list ]);
          }
        } else {
          if (list && list.length > 0) arr = arr.concat([ list ]);
        }
      } else {
        if (arr2.length > 0) {
          let a = arr2.filter(
              (i) => JSON.stringify(list) === JSON.stringify(i)
          );
          if (!a || (a && a.length <= 0)) {
            if (list && list.length > 0) arr2 = arr2.concat([ list ]);
          }
        } else {
          if (list && list.length > 0) arr2 = arr2.concat([ list ]);
        }
      }
    }
    return { arr, arr2 };
  }

  getNameAndErrorText(name: string, type: number) {
    let errCode: string = "";
    switch (type) {
      case this.errType.Repeat:
        errCode = `${this.$t("cloudpivot.list.pc.repeat")}`;
        break;
      case this.errType.NoExisted:
        errCode = `${this.$t("cloudpivot.list.pc.noExisted")}`;
        break;
      case this.errType.Null:
        errCode = `${this.$t("cloudpivot.list.pc.null")}`;
        break;
      case this.errType.DisableDept:
        errCode = `${this.$t("cloudpivot.list.pc.deptDisable")}`;
        break;
    }
    return `${name ? name : ""}${errCode}`;
  }

  filterOption(input, option) {
    return (
        option.componentOptions.propsData.value
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
    );
  }

  handleOnBatchConfirm() {
    let arr: any = [];
    if (this.filterList.length > 0) {
      this.filterList.forEach((i) => {
        let rowArr: any = i.data && i.data.split("、");
        let parentSheet: any = null;
        if (rowArr && rowArr.length === 2) {
          parentSheet = rowArr[1];
        }
        this.importData.secondImportData.map((v) => {
          if (parentSheet && v[parentSheet]) {
            let child = v[parentSheet].filter((o) => {
              if (o[rowArr[0]]) {
                if (Array.isArray(o[rowArr[0]])) {
                  const name = o[rowArr[0]]
                      .map((e) => (e.id ? e.id : e.name))
                      .join("、");
                  if (name === i.type) {
                    return o;
                  }
                } else if (typeof o[rowArr[0]] === "string") {
                  if (o[rowArr[0]] === i.type) {
                    return o;
                  }
                }
              }
            });
            if (child && child.length > 0) {
              const arrs = JSON.parse(JSON.stringify(v));
              arrs[parentSheet] = child;
              arr.push(arrs);
            }
          } else {
            if (v[i.data]) {
              if (Array.isArray(v[i.data])) {
                const name = v[i.data]
                    .map((e) => (e.id ? e.id : e.name))
                    .join("、");
                if (name === i.type) {
                  arr.push(v);
                }
              } else if (typeof v[i.data] === "string") {
                if (v[i.data] === i.type) {
                  arr.push(v);
                }
              }
            }
          }
        });
      });
      if (arr.length > 0) {
        this.importData.secondImportData = arr;
      }
    }
    this.batchList.forEach((i) => {
      if (i.data === "allData") {
        i.dataItem.forEach((o) => {
          this.importData.secondImportData.forEach((v) => {
            const parent = v[o.parentDataIndex];
            if (v[o.dataIndex] || parent) {
              if (parent) {
                parent.forEach((c) => {
                  if (c[o.dataIndex]) {
                    const name = c[o.dataIndex]
                        .map((e) => (e.id ? e.id : e.name))
                        .join("、");
                    if (name === i.type) {
                      c[o.dataIndex] = i.value;
                    }
                  }
                });
              } else {
                const name = v[o.dataIndex]
                    .map((e) => (e.id ? e.id : e.name))
                    .join("、");
                if (name === i.type) {
                  v[o.dataIndex] = i.value;
                }
              }
            }
          });
        });
      } else {
        let rowArr: any = i.data && i.data.split("、");
        let parentSheet: any = null;
        if (rowArr && rowArr.length === 2) {
          parentSheet = rowArr[1];
        }
        this.importData.secondImportData.forEach((v) => {
          if (parentSheet && v[parentSheet]) {
            v[parentSheet].forEach((o) => {
              if (o[rowArr[0]]) {
                const name = o[rowArr[0]]
                    .map((e) => (e.id ? e.id : e.name))
                    .join("、");
                if (name === i.type) {
                  o[rowArr[0]] = i.value;
                }
              }
            });
          } else {
            if (v[i.data]) {
              const name = v[i.data]
                  .map((e) => (e.id ? e.id : e.name))
                  .join("、");
              if (name === i.type) {
                v[i.data] = i.value;
              }
            }
          }
        });
      }
    });
    this.clearBatchData();
    console.log(
        this.importData.secondImportData,
        "this.dataSourcethis.dataSource",
        this.filterList,
        "ddd",
        arr
    );
  }

  clearBatchData() {
    this.showBacthUpdate = false;
    this.batchList = [
      {
        type: undefined,
        value: undefined,
        data: undefined,
        dataItem: [],
        typeList: [],
      },
    ];
    this.filterList = [];
    this.initColumns();
    this.initTableData();
  }
}
</script>

<style lang="less">
.error-user-batch {
  color: #f4454e;
}

.import-err-modal{
  .batch-updata-style {
    max-height: 250px;
    overflow-y: auto;
    overflow-x: hidden;

    .filters {
      margin: 15px;
    }
  }

  .add {
    margin-top: 8px;
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    margin-right: 24px;

    span {
      margin-right: 8px;
    }
  }

  .batch-update-new-data {
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 0 10px;
    min-height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .data-filter {
    width: 100%;
    // margin-left: 5px;
  }

  .data-select {
    width: 220px !important;
  }

  .filter-title {
    color: #000;
    opacity: 0.85;
    font-weight: 600;
  }

  .title-tips {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    padding-left: 5px;
  }

  .fieldlab {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.64);
    font-weight: 500;
  }

  .flex {
    display: flex;
    align-items: center;
  }

  .title-tips{
    font-size: 14px;
    color: rgba(0,0,0,0.45);
    line-height: 24px;
  }
  .pagination-box{
    margin-top: 8px !important;
    text-align: right;
    padding: 8px 16px;
  }
  /deep/.ant-pagination-total-text{
    margin-right: @base4-padding-md;
  }
  /deep/.ant-pagination-options {
    height: 32px;
  }
  /deep/.ant-modal-header{
    border-bottom: none;
  }
  /deep/.ant-modal-body{
    padding-bottom: 8px;
  }
  /deep/.ant-modal-footer{
    border-top: none;
  }
  .data-import-status--halfsuccess {
    text-align: left;
    margin-bottom: 16px;
    p {
      line-height: @line-height-11;
      span {
        margin-left: 16px;
        font-size: @font-size-16;
        color: rgba(0,0,0,0.85);
      }
      .data-import-status--halfsuccess__tip {
        margin-top: 8px;
        padding-left: 32px;
        font-size: @font-size-14;
        color: rgba(0,0,0,0.45);
        a {
          margin-left: 10px;
          color: @primary-color;

        }
      }
      &.data-import-status--halfsuccess__success {
        i {
          color: @success-color;
        }
      }
      &.data-import-status--halfsuccess__error {
        margin-top: 24px;
        i {
          color: @error-color;
        }
      }
    }
  }
}
</style>
