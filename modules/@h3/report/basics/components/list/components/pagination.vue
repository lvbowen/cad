<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__totle`" v-if="showTotal"> {{ showTotal(total) }}</div>

    <div :class="`${prefixCls}__page`">
      <i :class="`h3yun_All left-o ${pageValue === 1 ? 'forbid' : ''}`" @click="changePage"></i>
      <input
        type="text"
        :class="`${prefixCls}__page-num`"
        v-model="pageValue"
        @change="changePage"
      />
      / 
      <span :class="`${prefixCls}__page-total`">{{ maxPagesize }}</span>
      <i :class="`h3yun_All right-o ${pageValue === maxPagesize ? 'forbid' : ''}`" @click="changePage"></i>
    </div>

    <div :class="`${prefixCls}__changer`" v-if="showSizeChanger">
      <div 
        tabindex="1"
        :class="`${prefixCls}__changer__input`"
        @touchstart="showPageSizePane = true"
        @focus="showPageSizePane = true"
        @blur="closePageSize"
      >
        {{ `${currentPageSize} ${pageSizeName}` }}
      </div>
      <div :class="`${prefixCls}__changer-item` " v-show="showPageSizePane">
        <li
          :class="[ item === currentPageSize ? `${prefixCls}__changer-item--selected` : '']"
          v-for="(item,index) in pageSize"
          :key="index"
          @click="selectPageSize(item)" 
        >{{ `${item} ${pageSizeName}` }} </li>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const prefix = 'h3-report';
@Component({
  name: 'h3-report-list-pagination',
  components: {
  },
})
export default class ReportListPagination extends Vue {
  // 共计格式化
  @Prop({ default: () => {} }) showTotal!: Function;
  // 总条数
  @Prop({ default: 0 }) total!: number;
  // 是否显示页数更改器
  @Prop({ default: true }) showSizeChanger!: boolean;
  // 页数配置器
  @Prop({ default: () => [10, 20, 30, 50, 100] }) pageSize!: Array<number>;

  prefixCls: string = `${prefix}-list-pagination`

  pageValue: number = 1

  pageSizeName: string = '条/页'

  currentPageSize: number = this.pageSize[0]

  showPageSizePane: boolean = false

  /**
   * 最大页数
   */
  get maxPagesize () {
    return Math.ceil(this.total / this.currentPageSize) || 1
  }

  /**
   * 关闭页输选择器面板
   */
  closePageSize () {
    // 定时器原因是先选中条数 再关闭面板
    setTimeout(() => {
      this.showPageSizePane = false
    }, 400)
  }

  /**
   * 选择页数大小
   */
  selectPageSize(item) {
    this.currentPageSize = item
    this.pageValue = this.pageValue > this.maxPagesize ? this.maxPagesize : this.pageValue

    let params: H3.List.pageOptions = {
      pageSize: this.currentPageSize,
      pageIndex: this.pageValue
    }
    this.$emit('change', params);
    this.closePageSize();
  }

  /**
   * 改变当前页数
   */
  changePage(e) {
    const target = e.target
    let page = this.pageValue
    if (target.className.indexOf('left-o') > -1) {
      page -=1
    } else if (target.className.indexOf('right-o') > -1) {
      page +=1
    } else {
      page = parseInt(target.value) || 1;
    }

    page = page < 1 ? 1 : page > this.maxPagesize ? this.maxPagesize : page
    if (page === this.pageValue) return
    this.pageValue = page

    let params: H3.List.pageOptions = {
      pageSize: this.currentPageSize,
      pageIndex: this.pageValue
    }
    this.$emit('change', params)
  }
}
</script>

<style lang="less" scoped>
@import '../styles/index.less';
</style>
