<template>
  <div class="base-select">
    <a-select
      @change="changeValue"
      :value="value"
      :showSearch="showSearch"
      :disabled="disabled"
      @mouseenter="isShowClearIcon=true"
      @mouseleave="isShowClearIcon=false">
      <template slot="suffixIcon">
        <a-icon type="down" v-if="!isShowClearIcon"/>
        <a-icon type="close" v-else-if="!disabled" @click="clearState"/>
      </template>
      <a-select-option
        v-for="state in options"
        :value="state"
        :key="state"
        :title="state"
      >{{ state }}</a-select-option>
    </a-select>
  </div>
</template>

<script lang="ts">
import {Vue, Component,Prop} from 'vue-property-decorator';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
@Component({
  name: 'BaseSelect',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    AIcon: Icon
  }
})
export default class BaseSelect extends Vue {
  // @Prop() placeholder!:string;
  @Prop() options!:string[]|number[];
  @Prop() value!:string|number;
  @Prop() showSearch!: boolean;
  @Prop({default:()=> {
    return false
  }}) disabled!: boolean;
  isShowClearIcon: boolean = false;
  changeValue(val:string) {
    this.$emit('changeValue',val)
  }
  clearState() {
    this.changeValue('');
  }
}
</script>

<style scoped lang="less">
.base-select {

}
</style>
