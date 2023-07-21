<template>
  <div>
    <!-- <div class="tab-heard">
      <div
        class="tab-heard-wrap clearfix"
        :style="{width: `${width}px`}"
      >
        <div
          class="tab-heard-item"
          v-for="(t) in tabsTitle"
          :key="t.code"
          :ref="`heardItem${t.code}`"
          :id="`heardItem${t.code}`"
          :class="{'active': t.active}"
          @click="tabClick(t.code)"
        >
          {{ t.name }}
        </div>
      </div>
      <div class="border-bottom"></div>
    </div>-->
    <h3-tab
      v-if="tabsTitle.length > 1"
      v-model="activeTab"
      :customBarWidth="'48px'"
      :lineWidth="3"
      activeColor="#2970FF">
      <h3-tab-item
        v-for="(item, index) in tabsTitle"
        :key="index"
        :selected="activeTab === item.code"
        class="h3-center"
        @click="activeTab = item.code"
      >{{ item.name }}
      </h3-tab-item>
    </h3-tab>
    <h3-swiper
      ref="h3swiper"
      v-model="activeTab"
      :itemClass="itemClass"
      :showDots="false"
      :style="{'height': height + 'px', 'min-height': '180px'}"
      class="form-rendere-swiper"
    >
      <slot></slot>
    </h3-swiper>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator';

import { RendererFormControl, StyleControlOptions } from '../../typings';

import { BaseControl } from '../../controls';

import * as typings from '@cloudpivot/form/schema';

import { H3Tab, H3TabItem, H3Swiper, H3SwiperItem } from 'h3-mobile-vue';
// H3Swiper,

// import H3Swiper from "../layout/h3-swraper/h3-swiper.vue";

@Component({
  name: 'form-tabs',
  components: {
    H3Tab,
    H3TabItem,
    H3Swiper,
  },
})
export default class FormTabs extends BaseControl<typings.TabsOptions> {
  @Prop()
  itemList!: any;

  @Prop({
    default: '-1',
  })
  defaultActiveKey!: string;

  @Inject()
  formTabActiveTab!: (tab: number) => void;

  tabsTitle: any = [];
  width = 0;
  height = 0;

  get itemClass() {
    const length = 5;
    return `tabs-${Number(
        Math.random().toString().substr(3, length) + Date.now()
    ).toString(36)}`;
  }

  created() {
    let code = '';
    if (this.ctrl && this.ctrl.value) {
      code = this.ctrl.value;
    } else {
      code = this.defaultActiveKey;
    }
    let source: any = this.itemList.find((i: any) => i.code === code);
    source && (this.activeTab = source.code);
    this.tabsTitle = this.itemList.map((res) => {
      let active = false;
      if (res.code === this.activeTab) {
        active = true;
      }
      return {
        active,
        ...res,
      };
    });
  }

  mounted() {
    this.width = 0;
    this.tabsTitle.forEach((res) => {
      //@ts-ignore
      this.width += this.$refs[`heardItem${res.code}`][0].offsetWidth as number;
      //修复过长换行问题
      this.width += 1;
    });

    setTimeout(() => {
      this.setHeight();
    }, 1000);
  }

  setHeight() {
    const h3swiper: any = this.$refs.h3swiper;
    const childrenGroup = h3swiper.$children;
    let h = 0;
    childrenGroup.forEach((res: any, index) => {
      const height = res.$el.offsetHeight;
      if (height > h) {
        h = height;
      }

    });
    this.height = h;
    console.log(h);
  }

  tabClick(code: any) {
    // const h3swiper:any = this.$refs.h3swiper;
    // const childrenGroup = h3swiper.$children;
    // childrenGroup.forEach((res:any, index) => {

    //   res.$el.style.display = 'none';
    //   if (index+1 === code) {
    //     res.$el.style.display = 'block';
    //   }
    // })

    this.activeTab = code;
    this.formTabActiveTab(parseInt(code, 10));
    this.tabsTitle.forEach((res) => {
      res.active = false;
      if (res.code === code) {
        res.active = true;
      }
    });

    // const ele: HTMLElement  = this.$el.querySelector('.h3-swiper') as HTMLElement;
    // ele.scrollTop = 0;

  }

  activeTab = 0;

  @Watch('activeTab')
  onActiveTabChange(val: number) {
    this.tabClick(val);
  }

  handleValueChange() {
    console.log('值变化时我执行了');
    this.tabsTitle.forEach((res) => {
      res.active = false;
      if (res.code === this.ctrl.value) {
        this.setValue(res.code);
        res.active = true;
      }
    });
  }
}


</script>

<style lang="less" scoped>
@import '~@cloudpivot/common/styles/mixins.less';

.tab-heard {
  overflow-y: hidden;
  overflow-x: auto;
  margin: 0 15px;

  .tab-heard-wrap {
    // margin: 0 15px;
    // padding-right: 0;
    min-width: 100%;

    .tab-heard-item {
      float: left;
      padding: 0.36rem 0.4rem;
      color: rgba(102, 102, 102, 1);
      font-size: 0.4rem;
    }

    .tab-heard-item.active {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      border-bottom: 0.053rem solid @primary-color;
    }
  }

  .border-bottom {
    height: 0;
    position: relative;
    .hairline('bottom', #eee);
  }
}

.form-rendere-swiper {
  /deep/ .h3-swiper {
    height: 100% !important;
    min-height: 180px;

    zoom: 1;

    &:after {
      content: '';
      display: block;
      clear: both;
    }

    // height: calc(100vh - 2.47rem) !important;
    // overflow-x: hidden;
    overflow-y: auto;
    // overflow: hidden !important;
  }

  /deep/ .h3-swiper-item {
    height: auto !important;
    min-height: 20px;
    // min-height: calc(100vh - 96px);
    // position: relative!important;
    float: left;
    overflow-x: hidden;
    overflow-y: hidden;

    & > div {
      // height: calc(100vh - 2.47rem) !important;
    }

  }
}
</style>
<style lang="less">
.reverse-relevance-tabs {
  & > .form-rendere-swiper {
    // height: auto!important;
    height: calc(100vh - 2.47rem) !important;

    & > .h3-swiper {
      overflow-x: hidden;
      overflow-y: auto !important;

      & > .h3-swiper-item {
        height: calc(100vh - 2.47rem) !important;
        overflow-y: auto !important;
      }
    }
  }

  /deep/ .h3-tab-bar-inner {
    border-radius: 3px;
  }
}
</style>
