<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__add-btn`]" @click="addCompute">+ 添加计算字段</div>

    <div :class="`${prefixCls}__list`" v-if="computeFields.length">
      <h3-loading v-if="loading"/>
      <div
        v-else
        :class="`${prefixCls}__item`"
        v-for="(item, index) in computeFields"
        :key="index"
      >
        <div :class="`${prefixCls}__content`">
          <div :class="`${prefixCls}__number`">{{ index + 1 }}</div>
          <div :class="`${prefixCls}__formula`">
            {{ item.text }} = {{ mapFormulaValue(item.source.formula) }}
          </div>
        </div>
        <div :class="`${prefixCls}__icons`">
          <i
            :class="[`${prefixCls}__icon`, `h3-report-icon edit`]"
            @click="editCompute(item, index)"
          ></i>
          <i
            :class="[`${prefixCls}__icon`, `h3-report-icon delete`]"
            @click="deleteCompute(index)"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Inject } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/data-source/types";
import H3Loading from "@h3/report/basics/components/loading";
import computeEditor from "../../compute-editor";
import { clearStageSetting } from "../../help/node";
import { StageType } from "../../enum/stage";
import { uuid } from "@h3/report/basics/utils/uid";

const ReportDataSource = namespace("dataSource");
@Component({
  name: "h3-report-stage-compute",
  components: {
    H3Loading
  }
})
export default class ReportStageCompute extends Vue {
  @Prop() node!: H3.Falls.Node;
  @Prop() source!: H3.Falls.Source;
  @Prop() nodeRelationField!: Array<H3.Falls.NodeRelationField>;
  @ReportDataSource.Action(ReportAction.CHECKCOMPUTE) checkCompute!: Function; // 校验计算字段
  @ReportDataSource.Mutation(ReportMutation.UPDATESETTING) updateSetting!: Function; // 更新某个节点配置
  @ReportDataSource.Mutation(ReportMutation.UPDATESTAGE) updateStage!: Function; // 更新所有节点配置
  @ReportDataSource.State("computes") computes!: Array<H3.Falls.Compute>;
  prefixCls: string = "h3-report-stage-compute"; // 类名

  compute: H3.Falls.Compute | null = null; // 计算字段节点配置
  oriFields: Array<H3.Falls.Field> = [];
  computeFields: Array<H3.Falls.DynamicField> = []; // compute字段集
  formulaFields: Array<H3.FormulaEditor.Field> = []; // 计算字段组件字段集
  loading: boolean = false; // 加载中

  /**
   * 初始化计算字段
   */
  initCompute() {
    if (this.nodeRelationField.length) {
      this.oriFields = this.nodeRelationField[0].fields.map(item => {
        return {
          id: item.id,
          text: item.text,
          type: item.type
        };
      });
      this.formulaFields = this.mapFields(this.oriFields) as any;
    }
    let compute = this.computes.find((item: H3.Falls.Compute) => {
      return item.id === this.node.id;
    });
    if (compute) {
      this.compute = compute;
      if (!this.compute.fields) {
        this.compute.fields = [];
      }

      this.computeFields = this.compute.fields;
    }
  }

  /**
   *  映射计算公式展示值
   *  @param formula
   */
  mapFormulaValue(formula: string) {
    let fieldRegex = /(\@\@[0-9a-zA-Z#_]+)/g;
    let wordList = formula.split(fieldRegex);
    let field: H3.FormulaEditor.Field | undefined;
    let formulaText: string = "";
    wordList.forEach((str: string) => {
      if (fieldRegex.test(str)) {
        if (this.formulaFields) {
          field = this.formulaFields.find(
            (itemFiled: H3.FormulaEditor.Field) => itemFiled.key === str.replace("@@", "")
          );
          if (!field) {
            field = { title: "无效字段", key: "invalid", type: "other" };
          }
          formulaText += field.title;
        }
      } else {
        formulaText += str;
      }
    });
    return formulaText;
  }

  /**
   * 生成新字段
   * @param title
   * @param type
   * @param formula
   */
  createField(title: string, type: string, formula: string) {
    let newField: H3.Falls.DynamicField = {
      id: `F_${uuid(8, 16)}`, // 追加合并生成的字段UUID
      type: type.toLowerCase(), // 生成的字段类型
      text: title, // 字段名称
      source: {
        formula: formula
      }
    };
    return newField;
  }
  /**
   * 新增计算字段
   */
  addCompute() {
    computeEditor({
      fields: this.formulaFields,
      complete: async (ref: any) => {
        this.loading = true;
        return await new Promise(resolve => {
          this.checkCompute({ formula: ref.formula, fields: this.oriFields })
            .then((res: string) => {
              this.loading = false;
              if (res) {
                let obj = JSON.parse(res);
                let newField: H3.Falls.DynamicField = this.createField(
                  ref.title,
                  obj.returnType,
                  ref.formula
                );
                if (this.compute) {
                  this.compute.fields.push(newField);
                  this.handleSetStage();
                }
              }
              resolve(res);
            })
            .catch(res => {
              this.loading = false;
            });
        });
      }
    });
  }
  /**
   *  删除字段
   *  @param index
   */
  deleteCompute(index) {
    if (this.compute) {
      this.compute.fields.splice(index, 1);
      this.handleSetStage();
    }
  }
  /**
   *  编辑字段
   *  @param field
   *  @param index
   */
  editCompute(field: H3.Falls.DynamicField, index: number) {
    computeEditor({
      formula: field.source.formula,
      fields: this.formulaFields,
      title: field.text,
      complete: async (ref: any, callback) => {
        this.loading = true;
        return new Promise(resolve => {
          this.checkCompute({ formula: ref.formula, fields: this.oriFields })
            .then((res: string) => {
              this.loading = false;
              if (res) {
                let obj = JSON.parse(res);
                let newField: H3.Falls.DynamicField = this.createField(
                  ref.title,
                  obj.returnType,
                  ref.formula
                );
                if (this.compute) {
                  this.compute.fields.splice(index, 1, newField);
                  this.handleSetStage();
                }
              }
              resolve(res);
            })
            .catch(res => {
              this.loading = false;
            });
        });
      }
    });
  }
  /**
   *  更新配置
   */
  handleSetStage() {
    let tmpSource = clearStageSetting(this.node, this.source, true);
    this.updateStage({
      models: tmpSource.models,
      merges: tmpSource.merges,
      relations: tmpSource.relations,
      computes: tmpSource.computes
    });
    this.updateSetting({ stage: this.compute, stageType: StageType.computes });
  }

  /**
   *  转换field
   *  @fields
   */
  mapFields(fields: Array<H3.Falls.Field>) {
    let newFields: H3.FormulaEditor.Field = fields.map((item: H3.Falls.Field) => {
      return {
        key: item.id,
        title: item.text,
        type: item.type
      };
    });
    return newFields;
  }

  created() {
    this.initCompute();
  }
  mounted() {}
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/index";
.h3-report-stage-compute {
  height: 100%;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  .vertical-scrollbar();

  &__add-btn {
    display: inline-block;
    height: 40px;
    line-height: 40px;
    color: #107fff;
  }
  &__list {
    flex: 1;
  }
  &__item {
    display: flex;
    align-items: center;
    height: 48px;
    margin-bottom: 12px;
  }
  &__content {
    display: flex;
    flex: 1;
    height: 48px;
    border: 1px solid rgba(224, 227, 233, 1);
    border-radius: 4px;
  }
  &__number {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    background: rgba(244, 248, 252, 1);
  }
  &__formula {
    flex: 1;
    line-height: 48px;
    padding: 0 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__icons {
    height: 48px;
    line-height: 48px;
  }
  &__icon {
    height: 100%;
    line-height: 48px;
    padding: 8px;
  }
}
</style>
