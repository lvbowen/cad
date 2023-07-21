<template>
  <div class="relevance-form-modal">
    <a-input
      :value="text"
      :readonly="true"
      :placeholder="placeholder"
      @click="onClick"
      @mouseover="onMouseenter"
      @mouseout="onMouseleave">
      <a-icon
        v-show="hover"
        slot="suffix"
        type="close-circle"
        @click="clear"
        @mouseenter="onMouseenter" />
      <a-icon v-show="!hover" slot="suffix" type="file" />
    </a-input>

    <a-modal
      :title="formTitle"
      :visible="visible"
      :width="full ? '100%' : '950px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :class="{ 'full-modal': full, 'relevance-form': true }"
      :closable="!full"
      @ok="onModalOk"
      @cancel="onModalCancel"
    >
      <a-tooltip placement="top" v-show="!full">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.fullScreen") }}</span>
        </template>
        <span @click="fullScreen(true)" class="fullscreen icon aufontAll">&#xe8e5;</span>
      </a-tooltip>

      <a-tooltip placement="top" v-show="full">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.smallScreen") }}</span>
        </template>
        <span @click="fullScreen(false)" class="fullscreen icon aufontAll">&#xe8e7;</span>
      </a-tooltip>

      <list-selector
        v-model="selected"
        :newCol="newCol"
        :listCode="controlOpts.queryCode"
        :schemaCode="controlOpts.schemaCode"
        :cols="2"
        :columns="columns"
        :relevanceFormCode="this.control"
        :showActions="false"
        :query="query"
        :defuaultShowSearch="false"
        @change="onListChange"></list-selector>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";
import cloneDeep from "lodash/cloneDeep";

import { DataItemType, } from "@cloudpivot/form/schema";

import { Modal, Tooltip, Icon, Spin, Input, } from "@h3/antd-vue";
import { listApi } from "@cloudpivot/api";

@Component({
  name: "relevance-form-modal",
  components: {
    ATooltip: Tooltip,
    AModal: Modal,
    AInput: Input,
    AIcon: Icon,
    ASpin: Spin,
  },
})
export default class RelevanceFormModal extends RelevanceFormControl {
  visible = false;

  selected:Array<string> = [];

  query = {};

  hover = false;

  full = false;

  newCol: any = [];

  get text() {
    if (!this.ctrl.value) {
      return "";
    }
    if (!this.ctrl.value[this.getDisplayField]) {
      this.setLinkageValue();
    }
    return this.parseDisplayFieldValue(
      this.ctrl.value[this.getDisplayField],
      this.getDisplayField
    );
  }

  async onClick() {
    this.query = this.getParams();
    if (
        this.control.options.showField &&
        this.control.options.showField.length > 0
    ) {
      const code =
          this.$store.state &&
          this.$store.state.WorkflowCenter &&
          this.$store.state.WorkflowCenter.WorkflowCenter.code;
      let relevanceFormCode = this.control.parentKey
          ? `${this.control.parentKey}.${this.control.key}`
          : this.control.key;
      if (this.control.path) {
        relevanceFormCode = this.control.path.join(".");
      }

      const param = {
        sheetCode: code ? code.split("-")[1] : this.$route.query.sheetCode,
        schemaCode: code ? code.split("-")[0] : this.$route.query.schemaCode,
        relevanceFormCode: relevanceFormCode,
      };
      const res: any = await listApi.selectFormTitle(param);
      if (res.errcode === 0) {
        res.data.configBizPropertyList.map((options) => {
          options.code = options.code === "id" ? "ids" : options.code;
          options.propertyCode = options.code;
          options.width = "120";
          options.childColumns =
              options.subSchema && options.subSchema.properties;
          if (
              options.propertyType === DataItemType.Sheet &&
              options.childColumns
          ) {
            options.childColumns = options.childColumns.map((v) => {
              v.propertyCode = v.code;
              v.vcTitle = v.name;
              v.width = "150";
              return v;
            });
          }
          return options;
        });

        this.newCol = res.data.configBizPropertyList;
    this.visible = true;
    this.formTitleObj = await RelevanceFormControl.service.getBizmodelTitle(
      this.controlOpts.schemaCode || ""
    );
  }
    } else {
      this.visible = true;
    }
  }

  onMouseenter() {
    this.hover = true;
  }

  onMouseleave() {
    this.hover = false;
  }

  clear() {
    this.ctrl.value = null;
    this.selected = [];
  }

  onListChange(rows: any) {
    this.selected = rows;
  }

  fullScreen(full: boolean) {
    this.full = full;
  }

  async onModalOk() {
    console.log('onModalOk')
    let item = await this.convertForMappings(this.selected[0]);
    this.visible = false;
    if (item) {
    this.interceptorValue(item);
    setTimeout(() => {
        this.setValue(cloneDeep(item));
      }, 300);
    }
  }

  onModalCancel() {
    this.visible = false;
    this.full = false;
    if (this.ctrl.value) {
      this.selected = [this.ctrl.value];
    }
  }

  beforeCreate() {
    const comp = RelevanceFormControl.loadListSelector();

    (this.$options as any).components.ListSelector = comp;
  }
}
</script>

<style lang="less" scoped>
.ant-input-suffix > i {
  color: #ccc;
}

.relevance-form-modal .anticon-close-circle {
  cursor: pointer;
  transition: color 0.3s;
  font-size: 12px;

  &:hover {
    color: #999;
  }

  &:active {
    color: #666;
  }
}

.fullscreen {
  position: absolute;
  top: 16px;
  right: 60px;
  cursor: pointer;
}

.full-modal .fullscreen {
  right: 16px;
}
</style>

<style lang="less">
.relevance-form:not(.full-modal) .ant-modal-body .list-selector {
  height: 56vh;
  overflow: auto;
}

.full-modal {
  /deep/ .ant-modal {
    height: 100%;
    top: 0;
    padding-bottom: 0;

    .ant-modal-content {
      height: 100%;
    }
  }
}
</style>
