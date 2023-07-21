<template>
  <a-modal
    width="480px"
    title="批量添加字段"
    :visible="show"
    cancelText="取消"
    okText="确定"
    @cancel="cancel"
    @ok="ok"
  > 
    <div :class="[`${prefixCls}__search`]">
      <a-input
        placeholder="搜索"
        v-model="searchValue"
        @change="search"
      >
        <a-icon slot="prefix" type="search"/>
      </a-input>
    </div>
    <div v-if="renderList.length > 0" :class="[`${prefixCls}__content`]">
      <!-- <div :class="[`${prefixCls}__content-item`]">
        <a-checkbox
          :indeterminate="indeterminate"
          @change="onCheckAllChange"
          :checked="checkAll"
        >
          全选
        </a-checkbox>
      </div> -->
      <div :class="[`${prefixCls}__content-list`]">
        <div
          v-for="(item,index) in renderList"
          :key="index" 
          :class="[`${prefixCls}__content-item`]"
        >
          <a-checkbox
            :checked="item.check"
            :disabled="!item.check && selectedList.length === max"
            @change="onChange($event, item)"
          >{{ item.name }}</a-checkbox>
        </div>
      </div>
    </div>
    <div v-if="searchValue && searchList.length === 0" :class="[`${prefixCls}__empty`]">暂无数据</div>
  </a-modal>
</template>

<script lang='ts'>
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import { Modal, Input, Checkbox, Icon } from '@h3/antd-vue';
import H3SearchTree from '@h3/report/basics/components/search-tree';
import { uuid } from '@h3/report/basics/utils/uid';

@Component({
  name: 'h3-report-add-fields-modal',
  components: {
    H3SearchTree,
    AModal:Modal,
    AInput: Input,
    AIcon: Icon,
    ACheckbox: Checkbox,
  }
})
export default class BatchAddFields extends Vue {
  @Prop({default: () => null}) list!: Array<H3.Report.FieldColumn>; // 字段序列
  @Prop({default: () => null}) value!: Array<H3.Report.FieldColumn>; // 选择的值
  @Prop({default: false}) show!: boolean; // 是否显示
  @Prop({default: 20}) max!: number; // 最多可选

  prefixCls: string = 'h3-report-add-fields-modal';

  // 是否显示弹窗
  showModal: boolean = false;
  // 搜索值
  searchValue: string = ''
  // 是否全选
  checkAll: boolean = false;
  // 数据序列
  sourceList: Array<any> = [];
  // 搜索序列
  searchList: Array<any> = [];

  // 是否非半选状态
  get indeterminate() {
    return this.selectedList.length > 0 && this.selectedList.length < this.list.length;
  }

  // 渲染序列
  get renderList() {
    return this.searchValue === '' ? this.sourceList : this.searchList;
  }
  // 选中序列
  get selectedList() {
    let temp :Array<any>= [];
    let value = this.sourceList.filter(i => i.check)
    .map(m => {
      const data = Object.assign({}, m, {
        uid: m.uid === '' ? uuid(8, 16) : m.uid,
      })
      delete data.check;
      return data;
    });
    this.value.forEach((i,index) => {
      let alreadynList = value.find(l => l.uid === i.uid);
      if (alreadynList) {
        alreadynList.options = i.options;
        temp.push(alreadynList);
      }
    });
    let newFildes = value.filter(f => {
      return !this.value.find(v => v.uid === f.uid);
    });

    value = [...temp, ...newFildes];

    return value;
  }

  /**
   * 确认回调
   */
  ok() {
    this.$emit('update', JSON.parse(JSON.stringify(this.selectedList)));
    this.$emit('close');
  }

  /**
   * 取消回调
   */
  cancel() {
    this.$emit('close');
  }

  /**
   * 搜索框搜索
   */
  search(val) {
    this.searchList = this.sourceList.filter(s => {
      return s.name.indexOf(this.searchValue) > -1;
    });
  }

  /**
   * 选中值改变
   */
  onChange(e:Event, item) {
    let check = !!(e.target as any).checked;
    this.$set(item, 'check', check);
  }

  /**
   * 点击全选
   */
  onCheckAllChange(e) {
    let check = !!(e.target as any).checked;
    this.sourceList.forEach(item => {
      this.$set(item, 'check', check);
    });
    this.checkAll = check;
  }

  async created() {
    this.sourceList = this.list.map(i => {
      let item = this.value.find(d => d.field === i.field && i.tableId === d.tableId);
      return Object.assign({}, i, {
        uid: !!item ? item.uid : '',
        check: !!item
      });
    });
  }
}
</script>

<style lang="less">
  .h3-report-add-fields-modal {
   &__content{
    margin-top: 12px;
    &-list{
      height: 160px;
      overflow-y: scroll;
      overflow-x: hidden;
    }
    &-item{
      height: 32px;
      line-height: 32px;
    }
   }
  }
</style>
