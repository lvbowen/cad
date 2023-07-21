<template>
  <div :class="prefixCls">
    <span :class="[`${prefixCls}__add-btn`]" @click="addField">+ 添加关联规则</span>
    <div 
      :class="[`${prefixCls}__titles`]"
      v-if ="nodeRelationField.length === 2"
    >
      <div
        v-for ="(item,index) in nodeRelationField"
        :key ="index"
        :class="`${prefixCls}__title`" 
      >
        <i :class="[`${prefixCls}__icon`,`h3-report-icon ${item.type}-stage`]"></i>
        {{ index? '右': '左' }}侧表单: {{ item.text }}
      </div>
    </div>
    <ul :class="`${prefixCls}__list`">
      <li :class="`${prefixCls}__item`" v-for="(item,i) in relationGroups">
        <a-field-select
          :class="[`${prefixCls}__input`]"
          :fields = "leftFields"
          :value = "item.source[nodeRelationField[0].id]"
          :index ="i"
          :nodeId="nodeRelationField[0].id"
          @change-field = "updateFields"
        >
        </a-field-select>
        <span :class="`${prefixCls}__equal`">=</span>
        <a-field-select
          :class="[`${prefixCls}__input`]"
          :fields = "rightFields"
          :value = "item.source[nodeRelationField[1].id]"
          :index ="i"
          :nodeId="nodeRelationField[1].id"
          @change-field = "updateFields"
        >
        </a-field-select>
        <i :class="[`${prefixCls}__icon`,`h3-report-icon delete`]" @click="deleteField(i)"></i>
      </li>
    </ul>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { radio } from '@h3/antd-vue';
import FieldSelect from './field-select.vue';
import { getLastNode,getNodeField } from '@h3/report/lib/data-source/help/utils';


const ReportDataSource = namespace('dataSource');
@Component({
  name: 'h3-report-relation-field',
  components: {
    ARadio: radio,
    ARadioGroup: radio.Group,
    AFieldSelect: FieldSelect,
  }
})
export default class ReportRelationField extends Vue {
  @Prop() node!: H3.Falls.Node;
  @Prop() nodeRelationField!: Array<H3.Falls.NodeRelationField>;
  @Prop() relation!: H3.Falls.Relation;
  @Prop() leftFields!: Array<H3.Falls.Field>;
  @Prop() rightFields!: Array<H3.Falls.Field>;
  prefixCls:string = 'h3-report-relation-field';
  // 关联字段展示
  relationGroups: Array<H3.Falls.RelationGroup> = [];
  
  

  

  // 构造字段列表
  initFields() {
    this.relationGroups = JSON.parse(JSON.stringify(this.relation.groups));
    if(!Object.keys(this.relationGroups).length) {
      this.relationGroups.push({type: '',source:{}});
    }
  }
  
  // 新增关联字段
  addField() {
    this.relationGroups.push({type: '',source:{}});
    this.$emit('field-change', this.relationGroups);
  }
  
  
  /**
   * 更改关联字段
   * @param field 简易通用字段 
   * @param index
   * @param nodeId
   */
  updateFields (field:H3.Falls.Field,index: string,nodeId){
    this.$set(this.relationGroups[index].source,nodeId, field.id);
    this.$emit('field-change',this.relationGroups);
  }
  /**
   * 删除字段
   * @param index
   */
  deleteField(index: number) {
    if(this.relationGroups.length === 1) {
      this.relationGroups.splice(0,1,{type: '',source:{}});
    } else {
      this.relationGroups.splice(index,1);
    }
    this.$emit('field-change',this.relationGroups);
  }
  created() {
    this.initFields();
  }
  
}
</script>
<style lang="less">
  @import "~@h3/report/basics/styles/index";
  .h3-report-relation-field {
    display: flex;
    flex:1;
    flex-direction: column;
    .vertical-scrollbar();
    &__titles {
      display: flex;
    }
    &__title {
      width: 240px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
    &__title ~  &__title {
      margin-left: 44px;
    }
    &__add-btn{
      color : #107FFF;
      padding-bottom: 12px;
      width: 160px;
    }
    &__equal{
      color:#8893A7;
      padding: 0 16px;
    }
    &__list{
      padding-top: 8px;
    }
    &__item{
      display: flex;
      align-items: center;
      height: 32px;
      margin-bottom: 8px;
      .ant-select {
        width: 100%;
      }
    }
    &__input{
      width: 240px;
      height: 100%;
    }
    &__icon.delete {
      padding-left: 10px;
    }
    
  }
</style>
