<template>
  <div class="productionTaskListWrap">
    <div class="clearfix">
      <div class="left buttonLinks">
        <span
          class="buttonLink"
          :class="{active:leftButtonLinks.activeIndex===index}"
          v-for="(item,index) in leftButtonLinks.buttonLinks"
          :key="index"
          @click="leftButtonClick(item,index)">{{ item.name }}</span>
      </div>
      <div class="right" v-if="componentName==='DataForm'">
        <template v-for="(button,index) in rightButtonLinks">
          <a-button
            v-if="formData.data[button.visibleKey]"
            class="buttonLink"
            :key="index"
            @click="actionButtonClick(button)"
            :type="button.type">{{ button.name }}</a-button>
        </template>
      </div>
    </div>
    <div class="productionTaskListContent">
      <component
        ref="dataForm"
        :is="componentName"
        v-model="formData"
        :projectId="projectId"
        :workflowInstanceId="formData.data.workflowInstanceId"
        :workItemId="formData.data.workItemId"></component>
    </div>
    <a-modal
      :afterClose="dialogModalConfiguration.afterClose"
      :okText="dialogModalConfiguration.okText"
      :destroyOnClose="true"
      :confirmLoading="dialogModalConfiguration.confirmLoading"
      :wrapClassName="dialogModalConfiguration.showComment?'':'modalWrap'"
      v-model="dialogModalConfiguration.visible"
      @ok="dialogModalConfiguration.OK"
      centered>
      <a-form-model ref="dialogForm" :model="dialogTaskForm.formData" :rules="dialogTaskForm.rules">
        <a-form-model-item
          v-show="dialogModalConfiguration.showComment"
          required
          prop="comment"
          class="modal-model-item">
          <a-textarea
            placeholder="意见/建议"
            v-model.trim="dialogTaskForm.formData.comment"
            allowClear
            :autoSize="{ minRows: 4, maxRows: 6 }"
          />
        </a-form-model-item>
      </a-form-model>
      <div v-if="this.commonReplys">
        <div style="margin-bottom: 10px">常用意见</div>
        <div>
          <a-tag v-for="(item,index) in commonReplys.replys" :key="index" @click="tagChange(item)">{{ item }}</a-tag>
        </div>
      </div>
      <template #title>
        <a-icon style="padding-right: 5px" type="question-circle" theme="twoTone"/>
        <span>{{ dialogModalConfiguration.title }}</span>
      </template>
    </a-modal>
  </div>
</template>

<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
</style>
