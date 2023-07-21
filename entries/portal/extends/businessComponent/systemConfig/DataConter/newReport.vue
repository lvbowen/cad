<template>
  <div class="new-report">
    <a-modal
      title="新建报表"
      v-model="showUpdateModel"
      :width="446"
      cancelText="取消"
      okText="确定"
      @ok="editModel"
      @cancel="closeModel"
      :maskClosable="false"
      :keyboard="false"
    >
      <a-form
        :autoFormCreate="(modelForm) => { this.modelForm = modelForm }"
        class="app-form"
      >
        <a-form-item
          label="所属分组"
          fieldDecoratorId="catalogues"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-tree-select
            v-model="group"
            :treeData="tree"
            :replaceFields="replaceFields"
            allowClear
            placeholder="请选择上级分组"
          />
        </a-form-item>

        <a-form-item
          label="报表编码"
          fieldDecoratorId="modelCode"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          :fieldDecoratorOptions="rules.modelCode"
        >
          <a-input
            placeholder="请输入报表编码"
            :maxLength="24"
            v-model="modelData.modelCode"
            class="app-form__input"
          />
        </a-form-item>

        <a-form-item
          label="报表名称"
          fieldDecoratorId="modelName"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
          :fieldDecoratorOptions="rules.modelName"
        >
          <a-input
            placeholder="请输入报表名称"
            :maxLength="50"
            v-model="modelData.modelName"
            class="app-form__input"
          />
        </a-form-item>
        <a-form-item
          label="图标"
          fieldDecoratorId="icon"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <selected-icon @input="changeIcon" class="app-form__input"></selected-icon>
        </a-form-item>

        <a-form-item
          label="报表源"
          fieldDecoratorId="reportOrigin"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-radio-group v-model="modelData.reportOrigin">
            <a-row>
              <a-col :span="12">
                <a-radio value="rdp">RDP</a-radio>
              </a-col>
              <a-col :span="12">
                <a-radio value="yunshu">云枢</a-radio>
              </a-col>
            </a-row>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          label="是否可见"
          fieldDecoratorId="visibleRange"
          :labelCol="formItemLayout.labelCol"
          :wrapperCol="formItemLayout.wrapperCol"
        >
          <a-checkbox-group
            v-model="modelData.visibleRange"
          >
            <a-row>
              <a-col :span="8"><a-checkbox value="pc">PC可见</a-checkbox></a-col>
              <a-col :span="12"><a-checkbox value="mobile">移动端可见</a-checkbox></a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, InjectReactive,Watch} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Form from 'ant-design-vue/lib/form';
import 'ant-design-vue/lib/form/style/index.css';
import Row from 'ant-design-vue/lib/row';
import 'ant-design-vue/lib/row/style/index';
import Col from 'ant-design-vue/lib/col';
import 'ant-design-vue/lib/col/style/index';
import {FormItemLayout} from "../type";
import TreeSelect from 'ant-design-vue/lib/tree-select';
import 'ant-design-vue/lib/tree-select/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Radio from 'ant-design-vue/lib/radio';
import 'ant-design-vue/lib/radio/style/index.css';
import Checkbox from "ant-design-vue/lib/checkbox";
import 'ant-design-vue/lib/checkbox/style/index.css';
import selectedIcon from './select-icon/index.vue';
import { pattern, bizModelNameValidator } from './utils';
import {addAppReport, changePageOrigin, getFolders} from "../../../service/api";
import env from "@/config/env";
@Component({
  name: 'NewReport',
  components: {
    AForm: Form,
    AModal: Modal,
    AFormItem: Form.Item,
    ARow: Row,
    ACol: Col,
    ATreeSelect: TreeSelect,
    AInput: Input,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    selectedIcon
  }
})
export default class NewReport extends Vue {
  @InjectReactive('project') projectCode!: string;
  @Prop() !showUpdateModel: boolean = false;
  @Watch('showUpdateModel')
  onValueChange(v: boolean) {
    if (v) {
      this.modelData = {
        catalogues: '',
        modelName: '',
        icon: 'h-icon-all-briefcase-o',
        modelCode: '',
        visibleRange: ['pc', 'mobile'],
        reportOrigin: 'rdp'
      }
      this.$nextTick(() => {
        this.modelForm.setFieldsValue(this.modelData);
      });
    }
  }
  formItemLayout: FormItemLayout = {
    labelCol: {
      span: 5
    },
    wrapperCol: {
      span: 19
    }
  };
  modelData:any={

  };
  modelForm:any = {};
  rules:any = {};
  group:string = '';
  tree:any = [];
  existCodes:Array<string> = [];
  errCodeTxt:string = '';
  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'name', key: 'id',value:'id'
  };
  setRules() {
    this.rules = {
      modelCode: {
        rules: [
          {
            required: true,
            message: '请输入报表编码'
          },
          {
            pattern: pattern('modelcode'),
            message: '以字母开头不超过24个字符，仅支持字母、数字、下划线'
          },
          {
            validator: (rules:any, value:any, callback:any) => {
              if (value && this.existCodes.includes(value)) {
                callback(this.errCodeTxt);
              }
              callback();
            }
          }
        ]
      },
      modelName: {
        rules: [
          {
            required: true,
            message: '请输入报表名称'
          },
          {
            validator: bizModelNameValidator,
            message: '仅限50个字符以内，不能以空格、下划线开头且不能包含特殊字符'
          }
        ]
      }
    };
  }
  getFolderTree() {
    getFolders({appCode: this.projectCode ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.tree = res.data;
      }
    })
  }
  editModel() {
    console.log(this.modelData.visibleRange,'modelData');
    console.log(this.modelForm.visibleRange,'modelData');
    this.modelForm.validateFields((err: any) => {
      if (!err) {
        const modelFormData = this.modelForm.getFieldsValue();
        const params = {
          id: this.modelData.id,
          appCode: this.projectCode,
          name: modelFormData.modelName,
          parentId: this.group ? this.group : modelFormData.catalogues,
          code: modelFormData.modelCode,
          icon: modelFormData.icon,
          // name_i18n: JSON.stringify(nameI18n),
          mobileAble: modelFormData.visibleRange.indexOf('mobile') > -1,
          pcAble: modelFormData.visibleRange.indexOf('pc') > -1,
          reportOrigin: modelFormData.reportOrigin
        }
        addAppReport(params).then((res) => {
          if (res.errcode) {
            this.existCodes.push(params.code);
            this.$nextTick(() => {
              this.errCodeTxt = res.errmsg as string;
              this.modelForm.setFieldsValue({ modelCode: params.code });
              this.modelForm.validateFields();
            });
          } else {
            changePageOrigin({
              origin: modelFormData.reportOrigin,
              reportCode: modelFormData.modelCode,
            }).then((resData) => {
              //云枢
              // window.open(`${env.apiHost.slice(0,env.apiHost.indexOf('api'))}admin/#/apps/${this.projectCode}/report-design/${modelFormData.modelCode}`,'_black')
              //rdp
            });
            setTimeout(()=> {
              this.$emit('updateReportList');
            },1000)
            this.closeModel();
            this.$message.success('新增报表成功')
          }
        });
      }
    });
  }
  closeModel() {
    this.existCodes = [];
    this.errCodeTxt = '';
    this.modelForm.resetFields();
    this.$emit('closeReportDia')
  }
  changeIcon(icon:any) {
    this.modelForm.setFieldsValue({
      icon
    });
  }
  mounted() {
    this.setRules();
    this.getFolderTree();
  }
}
</script>

<style scoped lang="less">
/deep/ .ant-select {
  width: 100% !important;
}
.new-report {
  .app-form{
    .app-form__input{
      width: 292px;
    }
  }


}
/deep/.ant-checkbox-group {
  width: 100%;
  line-height: inherit;
}
/deep/ .ant-radio-group {
  line-height: inherit;
}
</style>
