
<template>
  <h3-textarea
    v-if="!readonly && isTextarea"
    v-model="val"
    :title="label"
    :required="ctrl.required"
    :maxLength="maxLength"
    :placeholder="placeholder"
    :readonly="readonlyFormula || readonly"
    :error="ctrl.hasError"
    :labelStyle="styleObj"
    :rows="4"
    autoHeight
    @onChange="onChangeTextarea"
    ref="h3Textarea"
  ></h3-textarea>

  <div v-else-if="!readonly && !isTextarea" class="input-wrap">
    <h3-input
      v-model="val"
      :required="ctrl.required"
      :title="label"
      :placeholder="inputPlaceholder"
      :readonly="readonlyFormula || readonly"
      :clear="true"
      type="text"
      :maxLength="maxLength"
      :error="ctrl.hasError"
      :labelStyle="styleObj"
      @onBlur="onBlur"
      @onChange="onChange"
      :showScan="isScan"
      :class="{'canscan': isScan}"
      @scanClick="scan"
      ref="h3Input"
    ></h3-input>
    <!-- <span @click.stop="scan" v-if="isScan" class="icon aufontAll">&#xe8de;</span> -->
  </div>

  <div class="field" v-else>
    <div class="field__label top" :style="style">{{ label }}</div>
    <div class="field__control">
      <mutil-text v-if="isLangText" :text="val"></mutil-text>
      <div
        v-else 
        v-html="val" 
        class="editor-htm"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";

import {
  RendererFormControl,
  TextOptions,
  FormControlType
} from "@cloudpivot/form/schema";

import { TextInputControl } from "@cloudpivot/form/src/common/controls/input-controls/text-input-control";

import { H3Input, H3Textarea } from "h3-mobile-vue";

import MutilText from "@cloudpivot/form/src/common/components/mutil-text.vue";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control"

@Component({
  name: "mpbile-input-text",
  components: {
    H3Input,
    H3Textarea,
    MutilText
  }
})
export default class MobileInputText extends TextInputControl {
  onBlur() {
    super.validate();
  }

  scan() {
    RelevanceFormControl.service.scan(this.setVal);
  }


  setVal(val) {
    this.ctrl.value = val.length === 0 ? null : val;
    if (!val) {
      return;
    }
    setTimeout(() => {
      let h3Input:any = this.$refs.h3Input;
      if (h3Input && h3Input.onInputChange) {
        // h3Input.onInputChange(val);
        const textinput = h3Input.$refs.textinput;
        if (textinput && textinput.reSetHeight) {
          textinput.reSetHeight(textinput.$refs.textarea);
        }
      }
    },50)
  }

  timer:any = null;
  onChange() {
    if(this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.timer = setTimeout(() => {
      this.ctrl.value = this.val.length === 0 ? null : this.val;
    },500);
  }
  onChangeTextarea() {
    let el = (this.$refs.h3Textarea as any).$el;
    let h = el.offsetHeight;
    el.style.height = `${el.offsetHeight}px`;
    this.ctrl.value = this.val.length === 0 ? null : this.val;
    setTimeout(() => {
      el.style.height = "auto";
    }, 16.66666666);
  }
}
</script>

<style lang="less" scoped>
.field__control {
  padding: 0.5em 0;
}

/deep/.h3-input-control textarea {
  min-height: 40px;
  min-width:80px !important;
}
.input-wrap {
  position: relative;
  .canscan {
    // /deep/.h3-input-control-with-clear {
    //   padding-right: 38px;
    // }
    // /deep/.clear-wrapper {
    //   right: 15px;
    // }
    /deep/.clear-wrapper-ipt{
      right: -4px!important;
      .h3-input-clear{
        margin-top: 0;
      }
    }

  }
  & > .icon {
    position: absolute;
    right: 15px;
    top: 0.34rem;
    font-size: 0.55rem;
    color: rgba(0, 0, 0, 0.65);
  }
}

.editor-html {
  line-height: normal !important;
  word-break: break-all;
  line-height: unset;
}

.field.vertical{
  .field__label{
    padding-top: 10px;
  }
}
</style>

