<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__left`"> 
      <span :class="`${prefixCls}__title`">1.请选择关联方式</span>
      <relation-join 
        v-if ="relation"
        :value="relation.join"
        @on-change="joinChange"
      ></relation-join>
    </div>
    <div :class="`${prefixCls}__right`">
      <div :class="`${prefixCls}__title`">2. 请设置关联字段 <span :class="`${prefixCls}__warn`" v-html="warn"></span></div>
      <relation-fields
        v-if = "relation"
        :nodeRelationField="nodeRelationField"
        :node="node"
        :relation="relation"
        :leftFields ="leftFields"
        :rightFields ="rightFields"
        @field-change="fieldChange"
      ></relation-fields>
    </div>
  </div>
</template>

<script lang='ts'>
  import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
  import { namespace } from 'vuex-class';
  import RelationJoin from './join-type.vue';
  import RelationFields from './relation-fields.vue';
  import {ReportAction,ReportMutation} from '@h3/report/basics/store/data-source/types';
  import { clearStageSetting } from '../../help/node';
  import { StageType } from '../../enum/stage';

  const ReportDataSource = namespace('dataSource');
  @Component({
    name: 'h3-report-stage-relation',
    components: {
      RelationJoin,
      RelationFields,
    },
  })
  export default class ReportStageRelation extends Vue {
    @Prop() node!: H3.Falls.Node;
    @Prop() source!: H3.Falls.Source;
    @Prop() nodeRelationField!: Array<H3.Falls.NodeRelationField>;
    @ReportDataSource.State('relations') relations!: Array<H3.Falls.Relation>;
    @ReportDataSource.Mutation(ReportMutation.UPDATESETTING) updateSetting!: Function;
    @ReportDataSource.Mutation(ReportMutation.UPDATESTAGE) updateStage!: Function; // 更新所有节点配置
    prefixCls:string = 'h3-report-stage-relation';
    relation: H3.Falls.Relation | null = null;
    // 左侧字段集合
    leftFields: Array<H3.Falls.Field> = [];
    // 右侧字段集合
    rightFields: Array<H3.Falls.Field> = [];
    // 提示列表
    warnContent = {
       least: '至少要有一组关联字段',
       isSame:'连接字段类型不一致'
    };
    // 当前提示
    warn: string= '';
    // 关联字段类型是否一致
    isSameType: boolean = true;
    

    /**
     * 过滤无效关联字段
     * @param groups
     */
    filterRelation(groups :Array<H3.Falls.RelationGroup>){
      let tmpRelationGroup:Array<H3.Falls.RelationGroup> = [];
      this.isSameType = true;
      groups.forEach((item)=> {
        if(Object.keys(item.source).length === 2) {
          let tmpLeftField = this.leftFields.find(field=> field.id === item.source[this.nodeRelationField[0].id]);
          let tmpRightField = this.rightFields.find(field=> field.id === item.source[this.nodeRelationField[1].id]);
          if(tmpLeftField && tmpRightField ){
            if(tmpLeftField.type === tmpRightField.type) {
              let tmpGroup = { type: tmpLeftField.type, source: item.source};
              tmpRelationGroup.push(tmpGroup);
            } else {
              this.isSameType = false;
            }
          }
        }
      });
      return tmpRelationGroup;
    };
    
    /**
     * 关联字段变化
     * @param groups
     */
    fieldChange(groups: Array<H3.Falls.RelationGroup>) {
      let tmpGroups = this.filterRelation(groups);
      this.warn = '';
      if(!this.isSameType) {
        this.warn = this.warnContent.isSame;
      } else if(!tmpGroups.length) {
        this.warn = this.warnContent.least;
      }
      if (this.relation) {
        this.relation.groups.splice(0,this.relation.groups.length,...tmpGroups);
        let tmpSource = clearStageSetting(this.node, this.source,true);
        this.updateStage({
          models: tmpSource.models,
          merges: tmpSource.merges,
          relations: tmpSource.relations,
          computes: tmpSource.computes,
        });
        this.updateSetting({stage:this.relation,stageType: StageType.relations});
      }
    }
    
    // 初始化关联节点配置
    initRelation() {
       let relation =  this.relations.find((item: H3.Falls.Relation) => {
        return item.id === this.node.id;
      });
      if(relation) {
        if(!relation.groups){
          (relation as any).groups = [];
          relation.join = 'left';
        }
        this.relation = relation;
        this.updateSetting({stage:this.relation,stageType: StageType.relations});
        if(!this.relation.groups.length) {
          this.warn = this.warnContent.least;
        }
      }
     
      this.nodeRelationField.forEach((item: H3.Falls.NodeRelationField,index: number) =>{
        if(index===0) {
          this.leftFields = item.fields
        } else if(index===1){
          this.rightFields = item.fields
        }
      });
      

    }
    /**
     * 改变关联方式
     * @param value 
     */
    joinChange(value:string) {
      if(this.relation) {
        this.relation.join = value;
        let tmpSource = clearStageSetting(this.node, this.source,true);
        this.updateStage({
          models: tmpSource.models,
          merges: tmpSource.merges,
          relations: tmpSource.relations,
          computes: tmpSource.computes,
        });
        this.updateSetting({stage:this.relation,stageType: StageType.relations});
      }
    }

    
    created() {
      this.initRelation()
    }
    mounted() {

    }
   
   
  }
</script>

<style lang="less">
  @import "~@h3/report/basics/styles/index";
  .h3-report-stage-relation{
     height: 100%;
     display: flex;
    &__title {
      padding-bottom: 16px;
      color: #304265
    }
    &__warn {
      padding-left: 8px;
      color: #FF4384;
      font-size:12px;
    }
    &__left {
      padding: 10px 0 0 12px;
      display: flex;
      flex-direction: column;
      width: 256px;
      border-right: 1px solid #E0E3E9;
    }
    &__right {
      flex:1;
      display: flex;
      padding: 10px 0 0 12px;
      flex-direction: column;
    }
    
  }
</style>
