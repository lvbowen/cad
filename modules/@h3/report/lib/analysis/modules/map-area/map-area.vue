<template>
  <div :class="prefixCls">
    <row-select
      :title="moduleOptions.title"
      :placeholder="placeholder"
      :options="options"
      v-model="selectArea"
      @change="changeValue($event, 'area')"
    ></row-select>
    <div :class="`${prefixCls}__title`" v-if="visibleControl.showMore">
      <div :class="`${prefixCls}__inner`">
        <div v-if="visibleControl.showProvince">
          <row-select
            title="显示省/直辖市"
            :placeholder="placeholder"
            :options="provinceOptions"
            v-model="selectShowProvince"
            @change="changeValue($event, 'province')"
          ></row-select>
        </div>
        <div v-if="visibleControl.showCity">
          <row-select
            title="显示市/直辖区"
            :placeholder="placeholder"
            :options="cityOptions"
            v-model="selectShowCity"
            @change="changeValue($event, 'city')"
          ></row-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import RowSelect from "../../component/row-select";
import ModulesMixin from "../../mixins/modules-mixins";
import { mapArea, mapColor } from "@h3/report/basics/enum/map";
import addresses from "@h3/report/basics/enum/pca-code";
import { getRelationByType, getProvinceDataByType, getCityDataByProvince } from "./choseArea";

@Component({
  name: "h3-analysis-map-area",
  components: {
    RowSelect
  }
})
export default class AnalysisMapArea extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!: H3.Analysis.MapAreaModule;
  // 模块值
  @Prop({ default: () => {} }) value!: H3.Report.MapArea;
  @Prop({ default: "请选择" }) placeholder!: string;

  prefixCls: string = "h3-analysis-map-area";

  options: Array<{ value: string | number; label: string }> = [...mapArea];

  selectArea = this.value.area;

  selectShowProvince =
    this.value.province && this.value.province.code ? this.value.province.code : "auto";

  selectShowCity = this.value.city && this.value.city.code ? this.value.city.code : "auto";

  innerValue = this.value;
  // 常量
  autoOption = [
    {
      value: "auto",
      label: "自动"
    }
  ];

  /**
   * 显示控制
   */
  get visibleControl() {
    let arr = [];
    if (this.value && this.value.area) {
      arr = getRelationByType(this.value.area);
    }
    return arr;
  }
  /**
   * 获取省级选择范围
   */
  get provinceOptions() {
    let options = addresses.map(item => {
      return {
        value: item.code,
        label: item.name
      };
    });
    return this.autoOption.concat(options);
  }
  /**
   * 获取城市选择范围
   */
  get cityOptions() {
    let self = this.autoOption;
    if (this.selectShowProvince !== "auto") {
      let province = addresses.find(item => {
        return item.code === this.selectShowProvince;
      });
      if (province && province.children && province.children.length) {
        let cities = province.children.map(item => {
          return {
            value: item.code,
            label: item.name
          };
        });
        self = self.concat(cities);
      }
    }
    return self;
  }

  /**
   * 改变显示范围
   * @param val
   * @param type
   */
  changeValue(val, type) {
    switch (type) {
      case "area":
        this.handleChangeArea(val);
        this.innerValue.area = val;
        break;
      case "province":
        let province = this.provinceOptions.find(item => item.value === val);
        if (province) {
          this.innerValue.province = {
            name: province.label,
            code: province.value
          };
        }
        if (val === "auto") {
          delete this.innerValue.province;
          delete this.innerValue.city;
          this.selectShowCity = "auto";
        }
        break;
      case "city":
        let city = this.cityOptions.find(item => item.value === val);
        if (city) {
          this.innerValue.city = {
            name: city.label,
            code: city.value
          };
        }
        if (val === "auto") {
          delete this.innerValue.city;
        }
        break;
    }
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }
  /**
   * 处理改变显示范围数据联动
   * @param val
   */
  handleChangeArea(val) {
    switch (val) {
      case "all":
        delete this.innerValue.province;
        delete this.innerValue.city;
        this.selectShowProvince = "auto";
        this.selectShowCity = "auto";
        break;
      case "province":
        delete this.innerValue.city;
        this.selectShowCity = "auto";
        break;
      case "city":
        break;
    }
  }

  mounted() {}

  created() {}
}
</script>

<style lang="less" scoped>
.h3-analysis-map-area {
  &__title {
    span {
      display: flex;
      width: 146px;
      padding: 0 16px;
    }
  }
}
</style>
