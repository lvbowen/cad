<template>
  <a-modal
    okText="确定"
    cancelText="取消"
    title="数据源"
    :visible="value"
    :destroyOnClose="true"
    :centered="true"
    :maskClosable="false"
    width="900px"
    @ok="handleOk"
    @cancel="handleCancel"
    :wrapClassName = "prefixCls"
  >
    <div :class="`${prefixCls}__wrap`">
      <div :class="`${prefixCls}__left`">
        <div :class="`${prefixCls}__title`">1.请选择数据源</div>
        <model-list
          v-if="sourceLoading && modelList"
          :modelList="modelList"
          :selectSchemaCode="selectSchemaCode"
          @change-source="changeSource"
        ></model-list>
        <loading v-else></loading>
      </div>
      <div :class="`${prefixCls}__right`" v-if="selectSchemaCode">
        <div :class="`${prefixCls}__title`">2.请选择字段</div>
        <model-info
          v-if="modelInfo && selectSchemaCode"
          :modelInfo="modelInfo"
          :model="model"
          :node="node"
          @change-model="changeModel"
        ></model-info>
        <loading v-else></loading>
      </div>
    </div>
  </a-modal>
</template>

<script lang='ts'>
  import {Component, Prop, Vue, Watch, Mixins} from 'vue-property-decorator';
  import { State, Action, Mutation, namespace } from 'vuex-class';
  import { ReportMutation, ReportAction } from '@h3/report/basics/store/data-source/types';
  import {
    Checkbox,
    Select,
    Modal,
    message
  } from '@h3/antd-vue';
  import { uuid } from '@h3/report/basics/utils/uid';
  import options from '@h3/report/dist/options.js';
  import ModelList from './model-list.vue';
  import ModelInfo from './model-info.vue';
  import Loading from '@h3/report/basics/components/loading';
  
  const ReportDataSource = namespace('dataSource');

  @Component({
    name: 'h3-report-source-model',
    components: {
      ACheckbox: Checkbox,
      ACheckboxGroup: Checkbox.Group,
      ASelect: Select,
      ASelectOption: Select.Option,
      AModal: Modal,
      ModelList,
      ModelInfo,
      Loading
    },
  })
  export default class ReportSourceModel extends Vue {
    @Prop({ default: () => false }) value!: boolean;  // 控制弹窗
    @Prop() model!: H3.Falls.Model | null;
    @Prop() node!: H3.Falls.Node;
    @ReportDataSource.Action(ReportAction.GETMODELINFO) getModelInfo!: Function;
    @ReportDataSource.Action(ReportAction.GETMODELLIST) getModelList!: Function;

    prefixCls: string = 'h3-report-source-model';
    // 更改的model
    readyModel: H3.Falls.Model | null = null;
   // 控制数据源loading
    sourceLoading:boolean = false;
    // 选择字段loading
    fieldsLoading:boolean = false;
    // 选中的表单
    selectSchemaCode :string = '';

    // 模型列表
    modelList: Array<H3.Falls.SourceModel> =  [];
    // 源模型
    modelInfo: H3.DataSourceAPI.Model | null =  null;
    // 监听model
    @Watch('model',{immediate: true})
    watchModel(model: H3.Falls.Model) {
      if(model && model.main) {
        this.selectSchemaCode = model.main.schemaCode;
      }
    } 
    
    
    /**
     * 更改模型
     * @param model
     */
    changeModel(model: H3.Falls.Model) {
      this.readyModel =  model;
    } 
    /**
     * 获取数据源列表
     */
    async initModel() {
      await this.getModelList().then((res)=> {
        this.modelList = res;
      });
      this.sourceLoading = true;
      if(this.modelList && !this.modelList.length){
        options.message.error("模型列表为空！");
      }
      if(this.selectSchemaCode) {
        await this.getModelInfo(this.selectSchemaCode).then((res) => {
          this.modelInfo = res;
        });
      }
    }
    
    /**
     * 选择源
     * @param schemaCode
     */
    async changeSource(schemaCode: string) {
      await this.getModelInfo(schemaCode).then((res)=> {
         this.modelInfo = res;
      });
      this.selectSchemaCode = schemaCode;
    };
    /**
     * 选择源
     */
    handleOk() {
      if(this.readyModel) {
        let fieldsLength = this.readyModel.sub ? (this.readyModel.sub.fields.concat(this.readyModel.main.fields)).length : this.readyModel.main.fields.length;
        if(fieldsLength) {
          this.$emit('change-model', this.readyModel);
          this.$emit('input', false);
        } else {
          message.warning('请选择至少一个字段');
        }
      } else {
        message.warning('请设置数据源');
      }
    }
    handleCancel(){
      this.$emit('input', false);
    }
    
    created() {
    }
    
    mounted() {
      this.initModel();
    }


  }
</script>

<style lang="less">
  @import "~@h3/report/basics/styles/index";

  .h3-report-source-model {
    &__wrap{
      height: 322px;
      display: flex;
    }
    &__title {
      color: #304265;
      padding-bottom: 12px;
    }
    &__select{
      width: 160px;
      margin-left: 16px;
    }
    &__tip {
      font-size: 12px;
      color: #8893A7;
      padding-bottom: 12px;
      display: flex;
      align-items: center;
    }

    &__left {
      display: flex;
      flex-direction: column;
      width: 256px;
      border-right: 1px solid #E0E3E9;
    }

    &__right {
      flex: 1;
      display: flex;
      padding: 10px 0 24px 12px;
      flex-direction: column;
    }
    
  }
</style>
