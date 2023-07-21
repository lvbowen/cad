<template>
  <a-modal
    :title="$t('languages.Apps.FormDesignPage.UserSelectionMap')"
    :visible="true"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Save')"
    @cancel="closeModal"
    @ok="backData"
    width="618px"
    :maskClosable="false"
    :keyboard="false"
  >
    <div class="user-selection-warp">
      <a-table
        :columns="columns"
        size="small"
        :pagination="false"
        :loading="false"
        :locale="{emptyText: ''}"
        :scroll="{ y: 585 }"
        :dataSource="dataSource"
      >
        <span slot="attributesTitle">{{ $t('languages.Apps.FormDesignPage.Attributes') }}</span>
        <span slot="dataItemTitle">{{ $t('languages.Apps.FormDesignPage.DataItem') }}</span>
        <span slot="actionTitle" class="delete">{{ $t('languages.Operation') }}</span>
        <!-- :dataSource="filterDataItemList" -->
        <div slot="attributes" slot-scope="text,record" class="select-wrap">
          <a-select
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            @change="attributesChange(record, arguments)"
            :defaultValue="record.attributes"
            v-if="record.attributes"
          >
            <a-select-option
              v-for="(attributes, index) in record.userAttributes"
              :key="index"
              :value="attributes.mark"
              :title="attributes.name"
            >{{ attributes.name }}</a-select-option>
          </a-select>
          <a-select
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            @change="attributesChange(record, arguments)"
            v-else
          >
            <a-select-option
              v-for="(attributes, index) in record.userAttributes"
              :key="index"
              :value="attributes.mark"
              :title="attributes.name"
            >{{ attributes.name }}</a-select-option>
          </a-select>
        </div>
        <div slot="dataItem" slot-scope="text,record" class="select-wrap">
          <config-provider :locale="locale">
            <a-select
              class="select"
              :placeholder="$t('languages.PlaceHolder.Select')"
              @change="dataItemChange(record, arguments)"
              v-model="record.dataItem"
            >
              <a-select-option
                v-for="(dataItem, index) in record.dataItemList"
                :key="index"
                :value="dataItem.code"
                :title="`${dataItem.name}[${dataItem.code}]`"
              >{{ `${dataItem.name}[${dataItem.code}]` }}</a-select-option>
            </a-select>
          </config-provider>
        </div>

        <div
          slot="action"
          slot-scope="text,record"
          class="delete"
          @click="deleteRow(record)">
          <span>
            <i class="icon aufontAll h-icon-all-delete-o"></i>
          </span>
        </div>
      </a-table>
      <div class="add">
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        <span @click="addRow">{{ $t('languages.Apps.FormDesignPage.AddDataItem') }}</span>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import OptionsMap from "@cloudpivot/form/src/typings/form-modals-map";

import userSelectionOptionsMap from "@cloudpivot/form/src/typings/user-selection-map";

import { schema } from "@cloudpivot/form";

import * as dataitemStore from "@cloudpivot/form/src/stores/data-items.store-helper";

import { ConfigProvider } from "@h3/antd-vue";

import { formApi } from "@cloudpivot/api";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";

import { namespace } from "vuex-class";

const UserModule = namespace("Organization/User");

declare namespace Common {
  export interface App {
    name: string;
    code: string;
    icon: string;
  }

  export interface AppModule {
    name?: string | any;
    code: string;
    active?: boolean;
    url: string;
    count?: number;
  }

  export interface Data {
    errcode?: number;
    errmsg?: string;
    data: any;
  }
  export interface Response {
    data: Data;
  }

  export interface Res<T> {
    errcode?: number;

    errmsg?: string;

    data?: T;
  }

  // 分页数据返回
  export interface PageResponse {
    data: {
      content: any;
    };
  }

  // 数据项model
  export interface DataItems {
    data: {
      order: number;
      labelName: string;
      uiformId: any;
      uiType: number;
      required: boolean;
      maxLength: number;
      minLength: number;
      pattern: string;
      ruleMsg: string;
      placeholder: string;
      selectCollection?: any;
    };
  }
  // 表格的头
  export interface TableHead {
    title?: string;
    dataIndex: string;
    scopedSlots?: Action;
    filteredValue?: string;
    key?: string;
    onFilter?: any;
    slots?: object;
    align?: string;
    width?: any;
    fixed?: string;
    ellipsis?: boolean;
  }
  // 表格操作
  export interface Action {
    customRender: string;
    filterDropdown?: string;
    filterIcon?: string;
    scopedSlots?: any;
  }
  /* 表单配置 */
  interface FormItemLayout {
    labelCol: {
      span: number;
    };
    wrapperCol: {
      span: number;
    };
  }
}

@Component({
  name: "UserSelectionMap",
  components: {
    ConfigProvider,
  },
})
export default class UserSelectionMap extends Vue {
  @UserModule.Mutation("setUserExtension") setUserExtension: any;
  @UserModule.State("userExtension") userExtList;
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop()
  getControl!: () => schema.FormTabs;

  dataSource: Array<any> = [
    {
      attributes: "",
      dataItem: "",
      key: Math.random(),
      userAttributes: [],
      dataItemList: [],
    },
  ];
  columns: Array<Common.TableHead> = [
    {
      dataIndex: "attributes",
      slots: { title: "attributesTitle" },
      scopedSlots: { customRender: "attributes" },
      key: "attributes",
      align: "left",
      width: 248,
    },
    {
      dataIndex: "dataItem",
      slots: { title: "dataItemTitle" },
      scopedSlots: { customRender: "dataItem" },
      key: "dataItem",
      align: "left",
    },
    {
      dataIndex: "action",
      slots: { title: "actionTitle" },
      scopedSlots: { customRender: "action" },
      key: "action",
      width: 70,
      align: "right",
    },
  ];
  userAttributes: Array<any> = [];

  orgLength: number = 0;

  dataItemListFilter: any = "";

  created() {
    this.getOrgMaxNum();
  }

  get locale() {
    switch (this.$i18n.locale) {
      case "zh":
      default:
        return zhCN;
      case "en":
        return enUS;
    }
  }

  get items() {
    const initiallyArr = dataitemStore
      .getDataItems(this)
      .filter((res: any) => res.used);
    const dataArr = JSON.parse(JSON.stringify(initiallyArr));
    const targetArr: any[] = [];
    const length: number = dataArr.length | 0;
    for (let i = 0; i < length; i += 1) {
      targetArr.push(dataArr[i]);
      if (dataArr[i].type === 8 && dataArr[i].properties) {
        const parentCode: string = dataArr[i].code;
        const subDataItem = dataArr[i].properties as any;
        const subLength: number = subDataItem.length | 0;
        for (let j = 0; j < subLength; j += 1) {
          subDataItem[j].code = `${parentCode}.${subDataItem[j].code}`;
          targetArr.push(subDataItem[j]);
        }
      }
    }
    return targetArr.filter(
      (res: any) =>
        res.type !== 2 &&
        res.type !== 4 &&
        res.type !== 6 &&
        res.type !== 7 &&
        res.type !== 8 &&
        res.type !== 9 &&
        !res.isSystem
    );
  }
  initData() {
    const userSelectionlist: Array<any> =
      userSelectionOptionsMap.zh_CN.orgAttributes;
    let list = OptionsMap.userAttributes.find((item) => {
      return item.mark === "ONE_LEVEL,1"; //判断是否有组织
    });

    if (!list) {
      //根节点属于第0级，不算在组织内
      if (this.orgLength > 1) {
        OptionsMap.userAttributes = userSelectionlist
          .slice(0, this.orgLength - 1)
          .concat(OptionsMap.userAttributes);
        OptionsMap.attributesUserSelection = userSelectionlist
          .slice(0, this.orgLength - 1)
          .concat(OptionsMap.attributesUserSelection);
      }
    }


    this.dataSource[0].userAttributes = OptionsMap.userAttributes.concat(this.userExtList);
    this.userAttributes = OptionsMap.userAttributes.concat(this.userExtList);

    const exp = this.modalData ? this.modalData.data : null;
    if (exp && exp.value) {
      const arr = exp.value.split(";");
      arr.pop();
      this.dataSource = [];
      const length: number = arr.length | 0;
      for (let i = 0; i < length; i += 1) {
        const chars = arr[i].split(":");
        const code = chars[1].substr(1, chars[1].length - 2);

        const dataItemList = [
          ...this.items.filter((m: any) => m.used === true),
        ];

        const selectDateItem = (this.getControl() as any).key;

        const isSheet: any = (this.getControl() as any).parentKey;

        OptionsMap.attributesUserSelection.map((x: any) => {
          if (chars[0] === x.mark) {
            this.dataItemListFilter = dataItemList.filter((res: any) => {
              if (isSheet) {
                return (
                  res.type === 5 &&
                  res.code !== isSheet + "." + selectDateItem &&
                  res.parentCode
                );
              } else {
                return (
                  res.type === 5 &&
                  res.code !== selectDateItem &&
                  !res.parentCode
                );
              }
            });
          }
        });

        OptionsMap.attributesText.map((x: any) => {
          if (chars[0] === x.mark) {
            this.dataItemListFilter = dataItemList.filter((res: any) => {
              if (isSheet) {
                return (
                  (res.type === 0 || res.type === 1) &&
                  res.parentCode === isSheet
                );
              } else {
                return (res.type === 0 || res.type === 1) && !res.parentCode;
              }
            });
          }
        });

        OptionsMap.attributesDate.map((x: any) => {
          if (chars[0] === x.mark) {
            this.dataItemListFilter = dataItemList.filter((res: any) => {
              if (isSheet) {
                return res.type === 3 && res.parentCode === isSheet;
              } else {
                return res.type === 3 && !res.parentCode;
              }
            });
          }
        });
        this.userExtList.forEach((x: any) => {
          if (chars[0] === x.mark) {
            this.dataItemListFilter = dataItemList.filter((res: any) => {
              if (isSheet) {
                return res.formPropertyType === 1 && res.parentCode === isSheet;
              } else {
                return res.formPropertyType === 1 && !res.parentCode;
              }
            });
          }
        })
        const obj = {
          attributes: chars[0],
          dataItem: code,
          key: Math.random(),
          userAttributes: OptionsMap.userAttributes.concat(this.userExtList),
          //dataItemList: this.items
          dataItemList: this.dataItemListFilter,
        };
        this.dataSource.push(obj);
      }
    } else {
      // this.dataSource[0].dataItemList = this.items;
      this.dataSource[0].dataItemList = this.items.filter(
        (m: any) => m.used === true
      );
    }
  }
  async getOrgMaxNum() {
    let res = await formApi.getOrgMaxNum();
    if (res.errcode === 0) {
      this.orgLength = res.data;
    } else {
      this.$message.error(res.errmsg);
    }
    let res1 = await formApi.getUserExtForDingTalk();
    if (res1.errcode === 0) {

      let userExtList = res1.data.content.map(item => {
        return {
          "name": item.name,
          "mark": item.code,
          "type": 1
        }
      });
      this.setUserExtension(userExtList)
    } else {
      this.$message.error(res1.errmsg);
    }
    this.initData();
    console.log("this.dataSource", this.dataSource);
  }

  attributesChange(item: any, arg: any) {
    const selectOption: string = arg[0];
    const itemIndex: number = this.dataSource.indexOf(item);
    this.dataSource[itemIndex].attributes = selectOption;
    const selectAttri: any = OptionsMap.userAttributes.concat(this.userExtList).filter(
      (res: any) => res.mark === selectOption
    );

    /* 获取当前选中控件的数据项名称编码 */
    const selectDateItem: string = (this.getControl() as any).key;

    // 当前选中控件是主表还是子表
    const isSheet: any = (this.getControl() as any).parentKey;

    const dataItemList = [...this.items.filter((m: any) => m.used === true)];
    if (selectAttri[0].type === 0) {
      this.dataSource[itemIndex].dataItemList = dataItemList.filter(
        (res: any) => {
          if (isSheet) {
            return (
              res.type === 5 &&
              res.code !== isSheet + "." + selectDateItem &&
              res.parentCode === isSheet
            ); // 过滤不是自己的数据项
          } else {
            return (
              res.type === 5 && res.code !== selectDateItem && !res.parentCode
            ); // 过滤不是自己的数据项
          }
        }
      );
    } else if (selectAttri[0].type === 1) {
      this.dataSource[itemIndex].dataItemList = dataItemList.filter(
        (res: any) => {
          if (isSheet) {
            return (
              (res.type === 0 || res.type === 1) && res.parentCode === isSheet
            );
          } else {
            return (res.type === 0 || res.type === 1) && !res.parentCode;
          }
        }
      );
    } else if (selectAttri[0].type === 2) {
      this.dataSource[itemIndex].dataItemList = dataItemList.filter(
        (res: any) => {
          if (isSheet) {
            return res.type === 3 && res.parentCode === isSheet;
          } else {
            return res.type === 3 && !res.parentCode;
          }
        }
      );
    }
    this.dataSource[itemIndex].dataItem = ""; //清空已选的数据项
  }
  dataItemChange(item: any, arg: any) {
    const selectOption: string = arg[0];
    const itemIndex: number = this.dataSource.indexOf(item);
    this.dataSource[itemIndex].dataItem = selectOption;
    // 数据项控制属性
    /* console.log(this.dataSource[itemIndex], arg);
    const selectDataItem: any[] = this.items.filter(
      (res: any) => res.code === item.dataItem
    );
     const type = selectDataItem[0].type;
    if (type === 5) {
      this.dataSource[itemIndex].userAttributes =
        OptionsMap.attributesUserSelection;
    } else if (type === 0 || type === 1) {
      this.dataSource[itemIndex].userAttributes = OptionsMap.attributesText;
    } else if (type === 3) {
      this.dataSource[itemIndex].userAttributes = OptionsMap.attributesDate;
    } */
  }
  addRow() {
    const item = {
      attributes: "",
      dataItem: "",
      key: Math.random(),
      userAttributes: OptionsMap.userAttributes.concat(this.userExtList),
      dataItemList: this.items,
    };
    this.dataSource.push(item);
  }
  deleteRow(item: any) {
    const itemIndex: number = this.dataSource.indexOf(item);
    const newData = [...this.dataSource];
    console.log(newData.filter((el: any) => el !== item));
    this.dataSource = newData.filter((el: any) => el !== item);
  }
  backData() {
    let propertyBarText = "";
    const length = this.dataSource.length | 0;
    for (let i = 0; i < length; i += 1) {
      propertyBarText = `${propertyBarText}${this.dataSource[i].attributes}:{${this.dataSource[i].dataItem}};`;
    }
    const backData = {
      value: propertyBarText,
    };
    this.$emit("backData", backData);
  }
  closeModal() {
    this.$emit("closeModal");
  }
}
</script>
<style lang="less" scoped>
.user-selection-warp {
  /deep/ .ant-table-header {
    &::-webkit-scrollbar {
      width: 0;
    }
    .delete {
      cursor: pointer;
    }
  }
  /deep/ .ant-table-body {
    max-height: 279px !important;
    // &::-webkit-scrollbar{
    //   width: 0;
    // }
    td {
      padding: 4px 16px !important;
      .delete {
        cursor: pointer;
        span {
          color: rgba(0, 0, 0, 0.65);
        }
      }
    }
    .select-wrap {
      .select {
        width: 216px;
      }
    }
    .ant-table-tbody{
      .ant-table-row:last-child {
        td {
          border-bottom: 0 !important;
        }
      }
    }
  }
  .add {
    /*border-top: 1px solid #e8e8e8;*/
    color: @primary-color;
    text-align: center;
    cursor: pointer;
    span {
      margin-top: 16px;
      margin-right: 8px;
    }
    padding-top: 16px;
  }
}
</style>
