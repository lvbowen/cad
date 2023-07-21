
<template>
  <div>
    <a-select
      showSearch
      v-if="!readonly"
      :value="val"
      :mode="mode"
      @change="onChange"
      style="width:100%"
      :allowClear="true"
      :disabled="readonlyFormula"
      :getPopupContainer="getPopupContainer()"
      :placeholder="hasEmpty ? emptyValue : ''"
      @focus="getOPt"
      @search="searchVal"
      :class="hasSelectBatchImport && 'batch-import-select-not-value'"
    >
      <a-select-option :disabled="true" v-if="hasEmpty" key>{{
        emptyValue
      }}</a-select-option>

      <a-select-option
        v-for="(opt,index) in options"
        :key="opt"
        :disabled="disableds[index]"
      >
        <span :title="opt">{{ opt }}</span>
      <!-- <a-tooltip :title="opt">
        <div class="h3-from-select-opinion">{{ opt }}</div>
      </a-tooltip> -->
      </a-select-option>
      <div slot="dropdownRender" slot-scope="menu" >
        <v-nodes :vnodes="menu" />
        <a-divider style="margin: 4px 0;" />
        <div
          v-if="iswlzl"
          style="padding: 4px 8px; cursor: pointer;"
          @mousedown="e => e.preventDefault()"
          @click="addItem"
        >
          <a-icon type="plus" />新增输入项
        </div>
      </div>
    </a-select>
    <!-- </div> -->


    <div class="items" v-else>
      <span v-if="!multiple">{{ text }}</span>

      <template v-else>
        <!-- <span v-for="(x, index) in val" :key="index">{{ x }}</span> -->
        {{ text }}
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  DropdownOptions,
  FormControlType,
} from  "@cloudpivot/form/schema";

import { DropdownControl } from "../control/dropdown-control";

import { H3Dropdown } from "@h3/awesome-ui";

// import { Select, Tooltip } from "@h3/antd-vue";

import { Select, Tooltip,Icon,Divider } from "@h3/antd-vue";
interface UrlParam {
  [propsName: string]: string;
}
@Component({
  name: "dropdown",
  components: {
    ATooltip: Tooltip,
    ASelect: Select,
    ASelectOption: Select.Option,
    AIcon: Icon,
    ADivider: Divider,
    VNodes: {
      functional: true,
      render: (h: any, ctx: { props: { vnodes: any; }; }) => ctx.props.vnodes,
    }
  },
})
export default class Dropdown extends DropdownControl {

  onChange(val : any[]) {
    this.hasSelectBatchImport = false;
    if(val && val.length > 0){
      this.setValue(Array.isArray(val) ? val.slice() : val);
    }else{
      this.ctrl.value = null;
    }

    if (!this.multiple) {
      return;
    }
    super.resetDisableds();
  }

  getOPt() {
    super.getOptions();
  }
  clearOption(change:any) {
    this.options = [];
    this.ctrl.value = null;
  }
  //TODO START 新增选项(单选)
  iswlzl: boolean = false;
  curVal: string = '';
  searchVal(val:string) {
    this.curVal = val;
  }
  addItem() {
    if (!this.curVal) return
    if (this.options.includes(this.curVal)) return this.$message.warning('已存在此选项，无需新增选项！')
    this.options.push(this.curVal)
  }
  GetRequest(): UrlParam {
    const url = decodeURIComponent(window.location.search);
    const theRequest = {} as UrlParam;
    if (url.indexOf("?") != -1) {
      const str = url.substr(1), strs = str.split("&");
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
      }
    }
    return theRequest;
  }
  //TODO END
  created() {
    this.iswlzl = this.GetRequest().hasOwnProperty('startWorkflowCode') && this.GetRequest().startWorkflowCode==="XTSJ_wlzl";
    console.log(this.iswlzl,'1111111111111111111111')
  }
  destroyed() {
    super.destroyed()
  }
}
</script>

<style lang="less">
.h3-from-select-opinion {
  display: inline-block;
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
}
.ant-tooltip {
    max-width: 800px;
}

.items{
  word-break: break-all;
}
.batch-import-select-not-value .ant-select-selection {
  border-color: #f5222d;
  border-right-width: 1px !important;
  outline: 0;
  // box-shadow: 0 0 20px rgba(245, 34, 45, 0.2);
}
// .items > span::after {
//   // margin-right: 0.5em;
//   content: ";";
// }

</style>

