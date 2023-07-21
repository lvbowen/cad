<template>
  <a-modal
    :title="$t('languages.Apps.FormDesignPage.DataLinkage')"
    width="536px"
    :visible="true"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <div>
      <a-row>
        <a-col :span="6">联动目标模型:</a-col>
        <a-col :span="18">
          <config-provider :locale="locale">
            <biz-models-selector
              :appCode="appCode"
              :bizSchemaCode="currentAppCode"
              :folderId="appFunctionCode"
              :isLinkData="true"
              :value="bizModel"
              appManagerFilter="true"
              placeholder="请选择"
              @change="onTreeChange"
              @select="onTreeSelect"
            />
          </config-provider>
        </a-col>
      </a-row>

      <div class="conditions">
        <a-row class="subTitle">联动条件</a-row>
        <a-row>
          <a-col :span="10" class="fieldlab">当前模型数据项</a-col>
          <a-col :span="3"></a-col>
          <a-col :span="8" class="fieldlab">联动模型数据项</a-col>
          <a-col :span="3" class="fieldlab" style="text-align: center;">删除</a-col>
        </a-row>
        <a-row v-for="(row, index) in conditionList" :key="index">
          <a-col :span="10">
            <config-provider :locale="locale">
              <a-select
                style="width: 100%"
                v-model="row.currentDataItem"
                placeholder="请选择"
                @change="currentDataItemChange(row.currentDataItem, index)"
              >
                <template v-for="item in row.currentDataItemList">
                  <a-select-option
                    :value="item.code + '_' + item.type + '_' + (item.formPropertyType ? item.formPropertyType : '')"
                    :key="item.code + '_' + item.type + '_' + (item.formPropertyType ? item.formPropertyType :'' )"
                    :title="item.name"
                    :disabled="item.disabled">{{ item.name }}</a-select-option>
                </template>
              </a-select>
            </config-provider>
          </a-col>
          <a-col :span="3" style="line-height:32px; text-align:center;">值等于</a-col>
          <a-col :span="8">
            <config-provider :locale="locale">
              <a-select style="width: 100%" v-model="row.targetDataItem" placeholder="请选择">
                <template v-for="item in row.targetDataItemList">
                  <a-select-option
                    :value="item.code + '_' + item.propertyType + '_' + (item.formPropertyType ? item.formPropertyType : '')"
                    :key="item.code + '_' + item.propertyType + '_' + (item.formPropertyType ? item.formPropertyType : '' )"
                    :title="item.name"
                  >{{ item.name }}</a-select-option>
                </template>
              </a-select>
            </config-provider>
          </a-col>
          <a-col :span="3" style="text-align:center;padding-top: 4px">
            <span class="delete" @click="deleteCondition(index)" v-if="conditionList.length > 1">
              <i class="icon aufontAll h-icon-all-delete-o"></i>
            </span>
          </a-col>
        </a-row>
        <div class="add">
          <span>
            <span>
              <i class="icon aufontAll h-icon-all-plus-o"></i>
            </span>
            <span @click="addCondition()">新增条件</span>
          </span>
        </div>
      </div>
      <div class="linkage">
        <a-row class="subTitle">联动填充</a-row>
        <a-row>
          <a-col :span="10" class="fieldlab">
            <a-input :disabled="true" v-model="targetItem"></a-input>
          </a-col>
          <a-col :span="3" style="line-height:32px; text-align:center;">值等于</a-col>
          <a-col :span="11" class="fieldlab">
            <config-provider :locale="locale">
              <a-select style="width: 100%" v-model="targetDataItem" placeholder="请选择">
                <template v-for="item in targetDataItemList">
                  <a-select-option :value="item.code + '_' + item.propertyType + '_' + (item.formPropertyType ? item.formPropertyType : '')" :key="item.code + '_' + item.propertyType + '_' + (item.formPropertyType ? item.formPropertyType : '')" :title="item.name">{{ item.name }}</a-select-option>
                </template>
              </a-select>
            </config-provider>
          </a-col>
          <a-col :span="1"></a-col>
        </a-row>
      </div>
    </div>
    <template slot="footer">
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="cancelRelate">取消联动</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import BizModelsSelector from "./biz-models-selector/index.vue";
import * as dataitemStore from "@cloudpivot/form/src/stores/data-items.store-helper";
import { DataItemState } from "@cloudpivot/form/src/stores/data-items.store";
import { listApi } from "@cloudpivot/api";

import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import { ConfigProvider, DatePicker, Input, InputNumber, Switch, } from "@h3/antd-vue";
import { namespace } from "vuex-class";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";
import { FormControlType } from "@cloudpivot/form/schema";

const DataModelModule = namespace("Apps/DataModel");

@Component({
  name: "DataLinkModal",
  components: {
    BizModelsSelector,
    StaffSelector,
    Input,
    InputNumber,
    DatePicker,
    ASwitch: Switch,
    ConfigProvider,
  },
})
export default class DataLinkModal extends Vue {
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({
    default: () => ({}),
  })
  dataItem!: DataItemState;

  @DataModelModule.State("bizSheetCode") bizSheetCode: any;

  bizModel = "";

  // 目标模型字段数据源
  targetFieldList: { main: any[] } = { main: [] };

  // 当前模型数据字段数据源
  currentFieldList: { main: any[]; origin: any[] } = { main: [], origin: [] };

  targetDataItem = "";

  targetDataItemList: any[] = [];

  filterType = [1, 2, 3, 4, 5, 7, 8, 50, 60, 80];

  targetItem = "";
  targetItemKey = "";


  // 选人
  staffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    showModel: true,
    mulpitle: this.modalData.type === "bizRadioOption" ? false : true,
    showSelect: true,
    placeholder: "请选择",
  };

  conditionList: any[] = [];

  onTreeChange(val) {
    this.bizModel = val;
    this.getTargetItem(this.bizModel, this.bizModel).then((res) => {
      this.currentFieldList.main = this.currentFieldList.origin.filter((x) =>
        this.filterType.includes(x.formPropertyType) && x.code !== (this.dataItem.parentCode ? `${this.dataItem.parentCode}.${this.dataItem.code}`: this.dataItem.code)
      );
      this.currentFieldList.main.forEach(item => {
        item.disabled = false;
      })
      this.targetDataItem = "";
      this.conditionList = [
        {
          currentDataItem: undefined,
          targetDataItem: undefined,
          currentDataItemList: this.currentFieldList.main.slice(),
          targetDataItemList: this.targetFieldList.main.slice().filter((x) => this.filterType.includes(x.formPropertyType) || x.code === "sequenceNo" ||
          x.code === "id")
        },
      ];
    });
  }
  appCode = "";
  appFunctionCode = "";
  currentAppCode = "";

  onTreeSelect(val: any) {
    this.appCode = val[0];
    if (val.length > 2) {
      this.appFunctionCode = val[1];
    }
  }

  getTargetItem(schemaCode: string, sheetCode: string) {
    return new Promise((resolve, reject) => {
      const params = {
        schemaCode,
        formCode: schemaCode,
      };
      listApi.getDataItemList(params).then((res: any) => {
        let data: any[] = [];
        if (res.status || res.data.errcode === 0) {
          data = res.data.data;
        }
        if (res.errcode === 0) {
          data = res.data;
        }
        this.targetFieldList.main = data;
        let currentDataItem = this.currentFieldList.origin.find((item) => {
          let opItem = this.dataItem.parentCode ? `${this.dataItem.parentCode}.${this.dataItem.code}`: this.dataItem.code;
          return item.code === opItem;
        });
        if (currentDataItem) {
          this.targetDataItemList = this.targetFieldList.main
            .slice()
            .filter(
              (x) =>
                this.filterFunc(currentDataItem.formPropertyType, x) ||
                this.filterFuncEx(currentDataItem.formPropertyType, x)
            );
        }
        resolve(1);
      });
    });
  }

  addCondition(val?: any) {
    if (val) {
      this.conditionList.push(val);
    } else {
      this.conditionList.push({
        currentDataItem: undefined,
        targetDataItem: undefined,
        currentDataItemList: this.currentFieldList.main.slice(),
        targetDataItemList: this.targetFieldList.main.slice().filter((x) => this.filterType.includes(x.formPropertyType) || x.code === "sequenceNo" ||
          x.code === "id"),
      });
    }
  }

  deleteCondition(index: number) {
    // 删除时释放
    let item: any = this.conditionList[index];
    if (item.currentDataItem) {
      let {key} = this.formatKey(item.currentDataItem);
      // eslint-disable-next-line no-shadow
      let chosenItem = this.currentFieldList.main.find(item => {
        return item.code === key;
      })
      chosenItem.disabled = false;
    }
    if (item.targetDataItem) {
      let {key} = this.formatKey(item.targetDataItem);
      // eslint-disable-next-line no-shadow
      let chosenItem = this.targetFieldList.main.find(item => {
        return item.code === key;
      })
      chosenItem.disabled = false;
    }
    this.conditionList.splice(index, 1);
  }

  deepCopy(item) {
    const str = JSON.stringify(item);
    return JSON.parse(str);
  }

  defaultValue: number = -1;
  hasDefault = false;
  created() {
    // debugger
    this.currentAppCode = this.$route.params.bizSchemaCode;
    const data = this.modalData.data;
    const _items = dataitemStore.getDataItems(this).filter((x) => x.used);
    let items = JSON.parse(JSON.stringify(_items));

    if (this.dataItem.parentCode) {
      const sheet = items.find((x) => x.code === this.dataItem.parentCode);
      if (sheet) {
        this.targetItem = `${sheet.name}.${this.dataItem.name}`
        this.targetItemKey = `${sheet.code}.${this.dataItem.code}`;
        if (Array.isArray(sheet.properties)) {
          const sheetItems = sheet.properties.filter((x: any) => {
            const flag = x.used;
            x.name = `${sheet.name}.${x.name}`;
            x.code = `${this.dataItem.parentCode}.${x.code}`;
            return flag;
          }) as any;
          items = items.concat(sheetItems);
        }
      }
    } else {
      this.targetItem = `${this.dataItem.name}`
      this.targetItemKey = `${this.dataItem.code}`;
    }

    items.forEach((x: any) => {
      x.disabled = false;
    })
    this.currentFieldList.origin = JSON.parse(JSON.stringify(items));
    this.currentFieldList.main = items.filter((res) =>
      this.filterType.includes(res.formPropertyType) && res.code !== (this.dataItem.parentCode ? `${this.dataItem.parentCode}.${this.dataItem.code}`: this.dataItem.code)
    );

    if (data.value) {
      try {
        const obj = JSON.parse(data.value);
        this.setBizmodel(data);
        this.hasDefault = true;
      } catch {}
    } else {
      this.addCondition();
    }
  }

  setBizmodel(data: any) {
    const obj: any = JSON.parse(data.value);
    this.bizModel = obj.targetModel;
    this.appCode = obj.appCode;
    this.appFunctionCode = obj.appFunctionCode;
    this.getTargetItem(this.bizModel, this.bizModel).then((res) => {
      if (obj.condition) {
        const op = obj.condition.split("&&").forEach((condition) => {
          const arr = condition.split(" ");
          if (arr.length > 0) {
            let currentDataItemKey = arr[0].substring(1, arr[0].length - 1);
            let {key:currentCode} = this.formatKey(currentDataItemKey);
            let item: any = {
              currentDataItem: currentDataItemKey,
              targetDataItem: arr[2].substring(1, arr[2].length - 1),
            };
            let currentDataItem = this.currentFieldList.main.find(
              (x) => x.code === currentCode
            );
            if (currentDataItem) {
              currentDataItem.disabled = true;
              let {key} = this.formatKey(item.targetDataItem);
              // eslint-disable-next-line no-shadow
              let chosenItem = this.targetFieldList.main.find(item => {
                return item.code === key;
              })
              if (chosenItem) {
              chosenItem.disabled = true;
              }
              console.log(this.targetFieldList.main);
              let targetDataItemList = this.targetFieldList.main
                .slice()
                .filter((x) =>
                  this.filterFunc(currentDataItem.formPropertyType, x)
                );
              let currentDataItemList = this.currentFieldList.main.slice();
              item.targetDataItemList = targetDataItemList;
              item.currentDataItemList = currentDataItemList;
            }
            this.addCondition(item);
          }
        });
      }
      if (obj.fillProperty) {
        const arr = obj.fillProperty.split(" ");
        if (Array.isArray(arr) && arr.length === 3) {
          this.targetDataItem = arr[2].substring(1, arr[2].length - 1);
        }
      }
    });
  }
  /**
   * 弹框关闭
   */
  closeModal() {
    this.$emit("closeModal");
  }
  /**
   * 将数据传出
   */
  handleOk() {
    let backData: any = "";
    backData = this.bizmodeBack();
    if (!backData) {
      return;
    }

    this.$emit("backData", backData);
  }
  bizmodeBack() {
    if (!this.bizModel) {
      this.$message.error("请选择联动模型");
      return false;
    }
    if (!this.targetDataItem) {
      this.$message.error("联动填充项不能为空");
      return false;
    }
    if (this.conditionList.length > 0) {
      const flag = this.conditionList.some((cond) => {
        return !cond.currentDataItem || !cond.targetDataItem;
      });
      if (flag) {
        this.$message.error("条件配置项不能为空");
        return false;
      }
    } else {
      this.$message.error("条件配置项不能为空");
      return false;
    }

    const condition = this.conditionList
      .map((res) => {
        return `{${res.currentDataItem}} = {${res.targetDataItem}}`;
      })
      .join("&&");
    const obj = {
      targetModel: this.bizModel,
      condition,
      appCode: this.appCode,
      appFunctionCode: this.appFunctionCode,
      currentAppCode: this.currentAppCode,
      fillProperty:
        `{${this.targetItemKey}_${this.dataItem.type}_${this.dataItem.formPropertyType}} = {${this.targetDataItem}}`,
    };

    let isCheckPass = this.checkSettings(obj);
    if (!isCheckPass) {
      this.$message.error("数据关联设置不符合要求");
      return false;
    }

    return {
      value: JSON.stringify(obj),
      default: "",
    };
  }

  checkSettings(obj: any) : boolean {

    return true;
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

  // 当前项发生变化后，目标项控件过滤
  currentDataItemChange(val, index) {
    // 先判断目标控件类型，如果和当前选的一致，不清空，否则清空
    let { key: currrentKey, formControlType } = this.formatKey(val);
    let targetKey = this.conditionList[index].targetDataItem;
    if (targetKey) {
      let {formControlType: controlType} = this.formatKey(targetKey);
      if(controlType !== formControlType) {
        this.conditionList[index].targetDataItem = undefined;
      }
    }

    this.currentFieldList.main.forEach((item: any) => {
      if (this.conditionList.findIndex((x: any) => {
        let {key} = this.formatKey(x.currentDataItem);
        return key === item.code;
      }) > -1) {
        item.disabled = true;
      } else {
        item.disabled = false;
      }
    })

    let currentDataItem = this.currentFieldList.main.find((item) => {
      return item.code === currrentKey;
    });
    this.conditionList[
      index
    ].targetDataItemList = this.targetFieldList.main.filter((x) =>
      this.filterFunc(currentDataItem.formPropertyType, x)
    );
  }

  // // 目标项发生变化时， disabled
  // targetDataItemChange(val, index) {
  //   this.targetFieldList.main.forEach((item: any) => {
  //     if (this.conditionList.findIndex((x: any) => {
  //       let {key} = this.formatKey(x.targetDataItem);
  //       return key === item.code;
  //     }) > -1) {
  //       item.disabled = true;
  //     } else {
  //       item.disabled = false;
  //     }
  //   })
  // }

  // 传入的参数格式key_dataItemType_fromControlType
  formatKey(keyStr: string){
    let _lastIndex = keyStr.lastIndexOf('_');
    let _last2rdIndex = keyStr.lastIndexOf('_', _lastIndex - 1);
    let key = keyStr.substring(0, _last2rdIndex);
    let dataItemType = keyStr.substring(_last2rdIndex + 1, _lastIndex);
    let formControlType = keyStr.substr(_lastIndex + 1);
    return {
      key,
      dataItemType,
      formControlType
    }
  }

  filterFunc(val: any, x: any) {
    switch (val) {
      case FormControlType.Text:
        return (
          x.formPropertyType === FormControlType.Text ||
          x.formPropertyType === FormControlType.Radio ||
          x.formPropertyType === FormControlType.Dropdown ||
          x.code === "sequenceNo" ||
          x.code === "id"
        );
      case FormControlType.Textarea:
        return x.formPropertyType === FormControlType.Textarea;
      case FormControlType.Date:
        return x.formPropertyType === FormControlType.Date;
      case FormControlType.Number:
        return x.formPropertyType === FormControlType.Number;
      case FormControlType.Radio:
        return x.formPropertyType === FormControlType.Radio;
      case FormControlType.Checkbox:
        return x.formPropertyType === FormControlType.Checkbox;
      case FormControlType.Dropdown:
        return x.formPropertyType === FormControlType.Dropdown;
      case FormControlType.Logic:
        return x.formPropertyType === FormControlType.Logic;
      case FormControlType.Address:
        return x.formPropertyType === FormControlType.Address;
      case FormControlType.StaffSelector:
        return x.formPropertyType === FormControlType.StaffSelector;
      case FormControlType.StaffMultiSelector:
        return x.formPropertyType === FormControlType.StaffMultiSelector;
      case FormControlType.DepartmentSelector:
        return x.formPropertyType === FormControlType.DepartmentSelector;
      case FormControlType.DepartmentMultiSelector:
        return x.formPropertyType === FormControlType.DepartmentMultiSelector;
      case FormControlType.RelevanceForm:
        return x.formPropertyType === FormControlType.RelevanceForm;
      case FormControlType.RelevanceFormEx:
        return x.formPropertyType === FormControlType.RelevanceFormEx;
    }
  }

  filterFuncEx(val: any, x: any) {
    switch (val) {
      case FormControlType.Attachment:
        return x.formPropertyType === FormControlType.Attachment;
      case FormControlType.Image:
        return x.formPropertyType === FormControlType.Image;
      case FormControlType.Signature:
        return x.formPropertyType === FormControlType.Signature;
    }
  }
  cancelRelate() {
    let self = this;
    this.$confirm({
      title: '数据联动',
      content: '确定要取消该数据联动吗?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        let backData: any = "";
        self.$emit("backData", backData);
      }
    });
  }
}
</script>
<style lang="less" scoped>
.conditions,
.linkage {
  .subTitle {
    color: #000;
    opacity: 0.85;
    font-weight: 600;
  }
  .add {
    color: #17bc94;
    margin-bottom: 20px;
    text-align: center;
    margin-right: 24px;
    cursor: pointer;
    span {
      margin-right: 8px;
    }
  }
  .fieldlab {
    color: #000;
    opacity: 0.85;
    font-weight: 500;
  }
}
.ant-row {
  margin-bottom: 10px;
  .ant-col-6 {
    line-height: 32px;
  }
  // .ant-col-18{
  //   // line-height: 32px;
  // }
  .radio-col {
    line-height: 32px;
    .ant-radio-wrapper {
      margin-right: 42px;
    }
  }
  .condition-col {
    margin-top: 6px;
    .ant-select {
      margin-right: 8px;
      width: 106px;
    }
    .ant-input {
      padding: 0 11px;
    }
    .delete-wrap {
      float: right;
      line-height: 32px;
    }
    .select-wrap {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
  }
}
.add-option-wrap {
  // margin-right: -24px;
  min-height: 200px;
  overflow: hidden;
  .add {
    color: @primary-color;
    text-align: center;
    margin-right: 24px;
    cursor: pointer;
    span {
      margin-right: 8px;
    }
  }
  .radio-group {
    max-height: 254px;
    overflow: auto;
    /deep/.ant-radio-wrapper {
      margin-right: 0;
    }
    .input {
      width: 240px;
    }
    .delete {
      // float: right;
      margin-left: 8px;
    }
    .radio-item-wrap {
      margin-bottom: 16px;
      & > div {
        float: left;
      }
      .input-wrap {
        margin-left: 8px;
      }
      .radio-wrap,
      .delete-wrap {
        margin-top: 4px;
      }
    }
  }
  ul {
    max-height: 254px;
    overflow-y: auto;
    overflow-x: hidden;
    li {
      margin-bottom: 16px;
      & > div {
        float: left;
        margin-right: 12px;
        &:last-child {
          margin-top: 5px;
          cursor: pointer;
          margin-right: 12x;
        }
      }
      .input-wrap {
        width: 240px;
        .tips {
          color: #f5222d;
          font-size: 12px;
        }
        // .error{
        //   box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
        //   border-right-width: 1px !important;
        //   border-color: #f5222d;
        //   outline: 0;
        // }
      }
      .default {
        margin-top: 6px;
        /deep/.ant-radio-wrapper {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
