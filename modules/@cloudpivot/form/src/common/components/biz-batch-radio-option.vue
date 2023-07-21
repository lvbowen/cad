<template>
  <div class="batch-btn-div">
    <div class="add batch-add" @click="batchVisible = true">
      <span>
        <i class="icon aufontAll h-icon-all-plus-o"></i>
      </span>
      <span>批量设置选项</span>
    </div>

    <a-modal
      :cancelText="$t('languages.Apps.Cancel')"
      :closable="false"
      :maskClosable="false"
      :okText="$t('languages.Apps.Ok')"
      :title="$t('languages.Apps.FormDesignPage.BatchSettingTitle')"
      :visible="batchVisible"
      @cancel="cancel"
      @ok="ok"
    >
      <a-textarea
        v-model="batchValue"
        :autosize="{ minRows: 6, maxRows: 6 }"
        :maxLength="100000"
        :placeholder="$t('languages.Apps.FormDesignPage.BatchSettingTextarea')"
      ></a-textarea>
      <input v-model="initValue" type="hidden"/>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  name: "ExtBatchAddRadioModal",
})
export default class ExtBatchAddRadioModal extends Vue {
  batchVisible = false;
  batchValue: string = "";

  @Prop({
    default: () => [],
  })
  options!: any[];

  get updateOptions() {
    let tempArr: any[] = [];
    const _return: any[] = [];
    if (this.batchValue) {
      tempArr = this.batchValue.split("\n");
      for (const [ idx, item ] of tempArr.entries()) {
        _return.push({
          default: this.options[idx] && this.options[idx].default ? true : false,
          value: item,
        });
      }
    }
    return _return;
  }

  get initValue(): string {
    const tempArr: string[] = [];
    if (this.options.length && this.batchVisible) {
      for (const item of this.options) {
        item.value && tempArr.push(item.value);
      }
    }
    const _return = tempArr.join("\n");
    this.batchValue = _return;
    return _return;
  }

  created() {
    console.log(this.options);
    if (this.initValue) {
      this.batchValue = this.initValue;
    }
  }

  ok() {
    console.log(this.updateOptions);
    this.$emit('update:options', this.updateOptions);
    this.cancel();
  }

  cancel() {
    this.batchVisible = false;
  }
}
</script>

<style lang="less" scoped>
.batch-btn-div {
  .batch-add {
    color: #17BC94;
    cursor: pointer;
  }
}
</style>
