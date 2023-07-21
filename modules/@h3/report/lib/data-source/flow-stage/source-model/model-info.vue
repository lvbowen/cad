<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__section`">
      <span :class="`${prefixCls}__tip`">主表</span>
      <div :class="`${prefixCls}__list`">
        <a-checkbox
          v-if="mainFields.length > 0"
          :indeterminate="mainIndeterminate"
          :checked="mainCheckAll"
          @change="mainCheckAllChange"
        >全选
        </a-checkbox>
        <a-checkbox-group
          :class="[`${prefixCls}__checkbox-group`]"
          :value="checkedMainFields"
          @change="mainFieldsChange"
        >
          <a-checkbox
            v-for="(field, index) in mainFields"
            :key="index"
            :value="field.name"
          >{{ field.displayName }}
          </a-checkbox>
        </a-checkbox-group>
      </div>
    </div>
    <div 
      :class="`${prefixCls}__section`" 
      v-if="modelInfo.subs && modelInfo.subs.length > 0"
    >
      <div :class="`${prefixCls}__tip`">
        <span>子表</span>
        <a-select
          showSearch
          placeholder="请选择子表"
          :class="[`${prefixCls}__select`]"
          :value="subSchemaCode"
          @change="changeSubForm"
        >
          <a-select-option
            v-for="(item,index) in modelInfo.subs"
            :key="index"
            :value="item.schemaCode"
          >
            {{ item.displayName }}
          </a-select-option>
        </a-select>
      </div>
      <div :class="`${prefixCls}__list`">
        <a-checkbox
          :indeterminate="subIndeterminate"
          :checked="subCheckAll"
          @change="subCheckAllChange"
        >全选
        </a-checkbox>
        <a-checkbox-group
          :class="[`${prefixCls}__checkbox-group`]"
          :value="checkedSubFields"
          @change="subFieldsChange"
        >
          <a-checkbox
            v-for="(field, index) in subFields"
            :key="index"
            :value="field.name"
          >{{ field.displayName }}
          </a-checkbox>
        </a-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue,Watch} from 'vue-property-decorator';
  import { State, Action, Mutation, namespace } from 'vuex-class';
  import { ReportMutation, ReportAction } from '@h3/report/basics/store/data-source/types';
  import {
    Checkbox,
    Select,
  } from '@h3/antd-vue';
  import { uuid } from '@h3/report/basics/utils/uid';

  const ReportDataSource = namespace('dataSource');
  @Component({
    name: 'h3-report-model-info',
    components: {
      ACheckbox: Checkbox,
      ACheckboxGroup: Checkbox.Group,
      ASelect: Select,
      ASelectOption: Select.Option,
    },
  })
  export default class ReportModelInfo extends Vue {
    @Prop() modelInfo!: H3.DataSourceAPI.Model;  // 获取的字段模型
    @Prop() model!: H3.Falls.Model | null;  // 保存的字段模型 
    @Prop() node!: H3.Falls.Node;  // 节点配置

    prefixCls: string = 'h3-report-model-info';
    // 主表字段列表
    mainFields:Array<H3.DataSourceAPI.Field> = [];
    // 主表选中字段列表
    checkedMainFields:Array<string> = [];
    // 控制主表全选按钮
    mainCheckAll: boolean = false;
    // 控制主表全选样式
    mainIndeterminate: boolean = false;
    // 选中的子表
    subSchemaCode: string = '';    
    // 子表字段列表
    subFields:Array<H3.DataSourceAPI.Field>= [];
    // 子表表选中字段列表
    checkedSubFields:Array<string> = [];
    // 控制子表全选按钮
    subCheckAll: boolean = false;
    // 控制子表全选样式
    subIndeterminate: boolean = false;

    // 监听modelInfo
    @Watch("modelInfo",{ deep: true})
    watchModel(newValue: string) {
      this.initModelInfo()
    }
    /**
     * 初始化modelInfo
     */
    initModelInfo(model: H3.Falls.Model| null = null) {
      this.mainFields = [];
      this.subFields = [];
      this.checkedSubFields = [];
      this.checkedMainFields = [];
      this.subIndeterminate = false;
      this.mainIndeterminate = false;
      this.mainFields = this.modelInfo.main.fields;
      if(model && model.main){
        // 验证主表字段及反显保存字段,没有则全选
        if(model.main.fields){
          let tmpCheckedMainFields: Array<H3.DataSourceAPI.Field> = [];
          model.main.fields.forEach((field: H3.Falls.Field)=> {
            this.modelInfo.main.fields.forEach((item: H3.DataSourceAPI.Field)=> {
              if(item.name === field.id) {
                tmpCheckedMainFields.push(item);
              }
            })
          });
          this.checkedMainFields = tmpCheckedMainFields.map((item: H3.DataSourceAPI.Field)=> {
            return item.name;
          })
        }
        // 验证子表字段及反显子表保存字段
        if(model.sub && model.sub.fields && this.modelInfo.subs && this.modelInfo.subs.length > 0){
          // 默认选中子表
          let subSchemaCode = model.sub.schemaCode;
          let subModel: H3.DataSourceAPI.ModelGroup | undefined= this.modelInfo.subs.find((item: H3.DataSourceAPI.ModelGroup)=>{
            return item.schemaCode === subSchemaCode;
          });
          // 检验子表还是否存在，获取子表字段集及反显存的子表字段
          if(subModel && subModel.fields) {
            this.subFields = subModel.fields;
            this.subSchemaCode = subSchemaCode;
            let tmpCheckedSubFields:Array<string> = [];
            model.sub.fields.forEach((field: H3.Falls.Field)=> {
              (subModel as H3.DataSourceAPI.ModelGroup).fields.forEach((item: H3.DataSourceAPI.Field)=> {
                if(item.name === field.id) {
                  tmpCheckedSubFields.push(item.name);
                }
              })
            });
            // 默认选中
            this.checkedSubFields = tmpCheckedSubFields;
          } else {
            this.subSchemaCode = this.modelInfo.subs[0].schemaCode;
            this.subFields = this.modelInfo.subs[0].fields;
          }
        } else if(!model.sub && this.modelInfo.subs && this.modelInfo.subs.length > 0){
          // 若子表没有保存字段，默认第一个子表
          this.subSchemaCode = this.modelInfo.subs[0].schemaCode;
          this.subFields = this.modelInfo.subs[0].fields;
        }
      } else {
        // 默认主表全选
        this.checkedMainFields = this.mainFields.map((item: H3.DataSourceAPI.Field)=> {
           return item.name;
        });
        if(this.modelInfo.subs && this.modelInfo.subs.length > 0) {
          this.subFields = this.modelInfo.subs[0].fields;
          this.subSchemaCode = this.modelInfo.subs[0].schemaCode;
        }
      }
      this.mainCheckAll = this.checkedMainFields.length === this.mainFields.length;
      this.subCheckAll = this.checkedSubFields.length === this.subFields.length;
      this.changeModel();
    }
  
    /**
     * 生成model
     */
    changeModel() {
      let mainFields: Array<H3.Falls.Field> = [];
      let subFields: Array<H3.Falls.Field> = [];
      let sub: H3.Falls.ModelGroup | null;
       this.modelInfo.main.fields.forEach((field: H3.DataSourceAPI.Field)=> {
            this.checkedMainFields.forEach((item: string)=> {
              if(field.name === item){
                mainFields.push({
                  text: field.displayName,
                  id: field.name,
                  type: field.type
                });
              }
            })
      });
       let main:H3.Falls.ModelGroup = {
          displayName: this.modelInfo.main.displayName,
          schemaCode: this.modelInfo.main.schemaCode,
          connId: this.modelInfo.main.dataConnectionId,
          refName:this.modelInfo.main.refName,
          fields: mainFields,
       };
       if(this.modelInfo.subs && this.modelInfo.subs.length > 0) {
         let tmpSubModel: H3.DataSourceAPI.ModelGroup | undefined = this.modelInfo.subs.find((item: H3.DataSourceAPI.ModelGroup)=> {
            return item.schemaCode === this.subSchemaCode
         });
         if(tmpSubModel) {
           tmpSubModel.fields.forEach((field: H3.DataSourceAPI.Field)=> {
             this.checkedSubFields.forEach((item: string)=> {
               if(field.name === item){
                 subFields.push({
                   text: field.displayName,
                   id: field.name,
                   type: field.type
                 });
               }
             })
           });
            sub = {
              displayName: tmpSubModel.displayName,
              schemaCode: tmpSubModel.schemaCode,
              connId: tmpSubModel.dataConnectionId,
              refName: tmpSubModel.refName,
              fields: subFields,
            };
         } else {
           sub = null
         }
       } else {
         sub = null
       }
      
      this.$emit("change-model", {
        id: this.node.id,
        main,
        sub
      })
    }
    /**
     * 选择子表
     * @param schemaCode
     */
    changeSubForm(schemaCode: string) {
      this.subSchemaCode = schemaCode;
      this.subCheckAll = false;
      this.subIndeterminate = false;
      this.checkedSubFields = [];
      if (this.modelInfo) {
        let tmpItem = this.modelInfo.subs.find(item=> item.schemaCode === schemaCode);
        if(tmpItem) {
          this.subFields = tmpItem.fields;
        }
      }
      this.changeModel();
    }
   
    
    /**
     * 主表全选
     * @param e
     */
    mainCheckAllChange(e: Event) {
      this.checkedMainFields = (e.target as HTMLInputElement).checked ? this.mainFields.map((item: H3.DataSourceAPI.Field) => item.name) : [];
      this.mainIndeterminate = false;
      this.mainCheckAll = (e.target as HTMLInputElement).checked;
      this.changeModel();
    }
    /**
     * 子表全选
     * @param e
     */
    subCheckAllChange(e: Event) {
      this.checkedSubFields = (e.target as HTMLInputElement).checked ? this.subFields.map((item: H3.DataSourceAPI.Field) => item.name) : [];
      this.subIndeterminate = false;
      this.subCheckAll =(e.target as HTMLInputElement).checked;
      this.changeModel();
    }
    /**
     * 主表字段改变
     * @param checkedList
     */
    mainFieldsChange(checkedList: Array<string>) {
      this.mainIndeterminate = !!checkedList.length && checkedList.length < this.mainFields.length;
      this.mainCheckAll = checkedList.length === this.mainFields.length;
      this.checkedMainFields = checkedList;
      this.changeModel();
    }
    /**
     * 子表字段改变
     * @param checkedList
     */
    subFieldsChange(checkedList: Array<string>) {
      this.subIndeterminate = !!checkedList.length && checkedList.length < this.subFields.length;
      this.subCheckAll = checkedList.length === this.subFields.length;
      this.checkedSubFields = checkedList;
      this.changeModel();
    }

   
    created() {
    }
    
    mounted() {
      this.initModelInfo(this.model);
    }
    updated() {}


  }
</script>

<style lang="less">
  @import "~@h3/report/basics/styles/index";

  .h3-report-model-info {
    height: 100%;
    display: flex;
    &__tip {
      display: flex;
      align-items: center;
      height: 44px;
      padding-bottom: 12px;
      font-size: 12px;
      color: #8893A7;
    }
   
    &__select{
      width: 160px;
      margin-left: 16px;
    }
    
    &__section {
      width: 50%;
      border-right: 1px solid #E0E3E9;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    &__section + &__section {
      padding-left: 12px;
    }

 

    &__list {
      flex: 1;
      .vertical-scrollbar()
    }

    &__checkbox-group {
      display: flex;
      flex-direction: column;
      > label {
        margin-top: 8px;
      }
      .ant-checkbox-wrapper + .ant-checkbox-wrapper {
        margin-left: 0;
      }
    }
  }
</style>
