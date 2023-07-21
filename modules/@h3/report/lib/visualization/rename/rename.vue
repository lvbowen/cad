<!-- 输入框组件 -->
<template>
  <div>
    <input 
      class="au-input"
      type="text"
      :id="inputID"
      :style="{maxWidth: maxWidthValue + 'px', minWidth: minWidthValue + 'px'}"
      :value="inputValue"
      @input="inputFun($event)"
      @blur="inputBlur($event)"
      @focus="inputFocus($event)"
    />
    <div class="emptyDivClass" :id="'emptyDiv-' + inputID">{{ inputValue }}</div>
  </div>
</template>

<script lang=ts>
import {Component, Watch, Vue, Prop} from 'vue-property-decorator';
@Component({})

export default class Home extends Vue {
  @Prop({ default: () => 250 }) maxWidthValue !: number;
  @Prop({ default: () => 50 }) minWidthValue !: number;
  @Prop({ default: () => '' }) inputValue !: string;
  @Prop({ default: () => '' }) inputID !: string;

  @Watch('inputValue')
  handleValue(newVal, oldVal) {
    // 处理输入框宽度
    this.handleInputWidth(newVal);
  }
  /**
   * 输入框input事件
   * @param e
   */
  inputFun(e) {
    this.handleInputWidth(e.target.value);
    this.$emit('inputFun', e.target.value);
  }

  /**
   * 输入框焦点事件
   * @param e
   */
  inputFocus(e) {
    this.$emit('inputFocus');
  }

  /**
   * 输入框失去焦点事件
   * @param e
   */
  inputBlur(e) {
    this.$emit('inputBlur');
  }

  /**
   * 处理输入框宽度
   */
  handleInputWidth(val?: string) {
    this.$nextTick(() => {
      let divEl: any = (document.getElementById('emptyDiv-' + this.inputID)) as HTMLElement;
      divEl.innerText = val || this.inputValue;
      let inputEl: any = (document.getElementById(this.inputID)) as HTMLElement;
      // 修改input宽度
      inputEl.style.width = divEl.clientWidth + 5 + 'px';
      // 超过最大宽度，添加省略号css
      if (divEl.clientWidth > this.maxWidthValue) {
        inputEl.style.textOverflow = 'ellipsis';
      } else {
        inputEl.style.textOverflow = 'inherit';
      }
    });
  }

  mounted () {
    // 处理输入框宽度
    this.handleInputWidth();
  }
}
</script>

<style lang='less'>
  .au-input {
    width: auto;
    border: 0;
    outline: none;
    border-bottom: 1px dashed #8893A7;
    margin: 0;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
    text-overflow: inherit;
  }
  .emptyDivClass {
    visibility: hidden;
    display: inline-block;
    position: absolute;
    z-index: 1;
  }
</style>
