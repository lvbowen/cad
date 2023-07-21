<template>
  <div :class="prefixCls">
    <label>选择所属分组：</label>
    <div ref="list" :class="[`${prefixCls}__list`]">
      <h3-tree
        :tile="true"
        :folderSelected="true"
        :treeList="list"
        :keyMappings="mappings"
        @node-click="nodeClick"
      >
      </h3-tree>
    </div>
    <div :class="[`${prefixCls}__input`]">
      <a-input></a-input>
    </div>
  </div>
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import { Input } from '@h3/antd-vue';
import H3Tree from '@h3/report/basics/components/tree';
@Component({
  name: 'h3-data-source-group',
  components: {
    AInput: Input,
    H3Tree
  }
})
export default class DataSourceGroup extends Vue {
  @Prop({
    default:() => []
  }) list!: Array<H3.DataSourceAPI.DataSourceNode>;
  @Prop({
    default:() => []
  }) mappings!: any;
  
  prefixCls: string = 'h3-data-source-group';
  nodeClick(node: H3.DataSourceAPI.DataSourceNode) {
    this.$emit('add-click', node);
  }
}
</script>
