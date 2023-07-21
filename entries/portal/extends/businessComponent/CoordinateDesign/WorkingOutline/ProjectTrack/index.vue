<template>
  <div>
    <a-collapse :defaultActiveKey="[1]" :bordered="false" expandIconPosition="right">
      <a-collapse-panel key="1">
        <template #header>
          <div class="collapseHeader">
            <img class="collapseHeaderIcon floatLeft" src="../../../../../src/assets/extends/coordinate/leftIcon.png" alt="">
            <div class="collapseHeaderTitle floatLeft">运行记录</div>
          </div>
        </template>
        <div>
          <h3 class="timelineTitle">2022</h3>
          <a-timeline mode="alternate">
            <a-timeline-item v-for="(item,index) in 10" :key="index">
              <div class="timelineItem">
                <div class="space">
                  <span class="border">07-19</span>
                </div>
                <div class="space">
                  <span class="border">入/离场记录</span>
                </div>
                <div class="space">
                  <span class="border">admin</span>
                  <span class="border">设备名称</span>
                  <span class="border">离场</span>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script src="./index.ts"/>
<style lang="less" scoped>
@import url("./index.less");
</style>
