<!-- 组件颜色设置 -->
<template>
  <div :class="[prefixCls, comPrefixCls]">
    <!-- <div :class="prefixCls"> -->
    <div :class="[`${prefixCls}__header`]">
      <label>组件背景</label>
      <a-radio-group :value="coatValue" @change="coatChange">
        <a-radio value="1">
          背景颜色
        </a-radio>
        <a-radio value="2">
          背景图片
        </a-radio>
      </a-radio-group>
      <div :class="`${prefixCls}__body`" v-if="coatValue==='1'">
        <div class="left-wrap">
          <label>背景颜色</label>
        </div>
        <div class="right-wrap">
          <div :class="`${prefixCls}__color-wrap`">
            <colorPicker
              ref="elementRef"
              v-clickoutside="handleFunction"
              :value="data.value || ''"
              :class="`${prefixCls}__color-picker`"
              :defaultColor="getDefaultColor"
              @change="colorChange"
            >
            </colorPicker>
          </div>
        </div>
      </div>
      <div :class="`${prefixCls}__body`" v-if="coatValue==='2'">
        <div class="left-wrap">
          <label>背景图片</label>
        </div>
        <a-select
          size="small"
          placeholder="请选择背景图片"
          :defaultValue="defaultPic"
          style="width: 7.5vw;margin-left: 0.5vw"
          allowClear
          @change="picChange"
        >
          <a-select-option v-for="(v,i) in picOptions" :key="v.downloadUrl">
            {{ v.name }}
          </a-select-option>
        </a-select>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Prop, Watch, Mixins} from "vue-property-decorator";
import {Mutation, Action, State, namespace} from "vuex-class";
import vcolorpicker from "vcolorpicker";
import ClickOutSide from "vue-v-clickoutside";
import ColorMixins from "../mixins/color";
import {Radio,Select} from "@h3/antd-vue";
import {watch} from "fs";
import axios from "axios";
// import env from "../../../../../../../entries/admin/src/env";
import env from "../../../../../../../entries/portal/src/config/env"
const ReportPro = namespace("report");

@Component({
  name: "h3-report-element-coat",
  components: {
    colorPicker: vcolorpicker.colorPicker,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ASelect:Select,
    ASelectOption:Select.Option
  },
  directives: {
    clickoutside: ClickOutSide,
  },
})
export default class ReportElementCoatModule extends Mixins(ColorMixins) {
  @Prop({
    default: () => ({
      type: null,
      value: null,
    }),
  })
  data!: H3.Report.ElementCoat;
  @Prop({default: () => ({})}) chart!: H3.Report.Chart;
  @Prop({default: () => ({})}) module!: H3.ReportModules.ElementCoat;
  @Prop({default: () => ({})}) data!: H3.Report.ElementCoat;
  @Prop({default: () => ""}) comPrefixCls!: string;
  @ReportPro.State("global") global!: H3.Report.Global;
  prefixCls: string = "h3-report-element-coat";
  // 组件背景Options
  moduleRadioOptions: Array<any> = [
    {name: "背景颜色", value: "bgColor"},
    // { name: '背景图片', value: 'bgPicture' },
  ];
  coatValue: string = "1";
  picOptions: Array<any> = [];
  defaultPic:string ='';

  get getDefaultColor() {
    if(this.global.styles.elementCoat.type==='bgPicture'){
      this.coatValue='2';
      this.defaultPic=this.global.styles.elementCoat.value
    }
    return this.global.styles.elementCoat.value||this.module.defaultColor;
  }

  handleFunction() {
    (this.$refs.elementRef as any).openStatus = false;
  }

  coatChange(value) {
    this.coatValue = value.target.value;
  }

  /**
   * 组件背景 - change
   * @param e
   */
  moduleRadioChange(e: any) {
    // this.radioValue = e.target.value;
  }
  /**
   * 组件背景(图片） - color-picker - change
   * @param files
   */
  picChange(files) {
    console.log('files',files)
    if(files!==undefined) return this.$emit("element-coat-color-change", {type: "bgPicture", value:files});
  }

  /**
   * 组件背景 - color-picker - change
   * @param value
   */
  colorChange(value: string) {
    if (value === this.global.styles.elementCoat.value) {
      this.data.value = null;
    } else {
      this.$set(this.data, "type", "bgColor");
      this.$set(this.data, "value", value);
    }
    this.$emit("element-coat-color-change", {type: "bgColor", value});
  }

  getAllPic() {
    axios.get(`${env.apiHost}` + `/api/report/getAllBackgroud`).then((res) => {
      //@ts-ignore
      if (res.errcode === 0) return (this.picOptions = res.data);
    });
  }


  mounted() {
    this.getAllPic();
  }
}
</script>

<style lang="less">
.h3-report-element-coat {
  border-bottom: none !important;

  &__header {
    label {
      font-size: 14px;
      font-weight: 600;
      color: #304265;
    }
  }

  &__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    margin-top: 8px;

    .left-wrap {
      label {
        color: #304265;
        font-size: 14px;
        font-weight: 400;
      }

      .ant-radio-group {
        label {
          font-size: 14px;
          color: #8893a7;
          font-weight: 400;
        }
      }
    }
  }

  &__color-wrap {
    width: 118px;
    height: 32px;
    border-radius: 4px;
    border: 1px solid rgba(212, 215, 224, 1);
    padding: 4px;
    /** 颜色选择器 **/

    .m-colorPicker {
      width: 100% !important;
      height: 100% !important;

      .box {
        width: 212px;
        margin-top: 6px;
      }

      .box.open {
        z-index: 100;
      }

      .colorBtn {
        width: 100% !important;
        height: 100% !important;
      }
    }
  }
}
</style>
