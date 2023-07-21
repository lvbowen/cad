<template>
  <a-modal
    centered
    :destroyOnClose="true"
    v-model="itemVisible"
    :closable="false"
    :afterClose="afterClose"
    @cancel="itemVisible = false"
    :footer="null">
    <template #title>
      <div class="clearfix">
        <div class="left title flex flex-center-align">
          <span>请勾选需要批量修改的数据</span><span style="padding:0 10px">{{ `(${values.length}/${options.length})` }}</span>
          <a-tooltip title="选项显示规则见后台管理表单配置！">
            <a-icon type="question-circle" />
          </a-tooltip>
        </div>
      </div>
    </template>
    <div>
      <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">全选</a-checkbox>
      <a-checkbox-group
        v-model="values"
        @change="onChange">
        <div class="optionsWrap">
          <a-checkbox
            class="option"
            v-for="(item,index) in options"
            :key="index"
            @change="onChangeItem"
            :value="item.value">{{ item.label }}</a-checkbox>
        </div>
      </a-checkbox-group>
    </div>
    <div class="clearfix">
      <div class="right designButtons clearfix">
        <a-button type="primary" @click="selectValues" class="designButton">确定</a-button>
        <a-button @click="itemVisible = false" class="designButton">取消</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
@import '../../../../../../styles/public.module.less';
</style>
