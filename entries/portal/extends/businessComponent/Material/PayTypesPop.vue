<template>
  <div class="pay-types-pop">
    <span v-if="selectedPayType" class="condition">采购类型：{{ selectedPayType }}
      <a-icon type="close" @click="handleChange('')"/>
    </span>
    <a-popover trigger="click">
      <el-button type="primary" icon="el-icon-attract">筛选</el-button>
      <template slot="content">
        <template>
          <span>采购类型:</span>
          <a-select @change="handleChange" :value="selectedPayType">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(type,index) in payTypes" :key="index" :value="type">{{ type }}</a-select-option>
          </a-select>
        </template>
      </template>
    </a-popover>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import Select from 'ant-design-vue/lib/select';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Button from 'element-ui/lib/button';
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import {getReserveSchema} from "../../service/api";
@Component({
  name: 'PayTypesPop',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    ElButton: Button,
    AIcon: Icon,
    APopover: Popover
  }
})
export default class PayTypesPop extends Vue {
  @InjectReactive('project') projectCode!: string;
  payTypes:string[] = [];
  selectedPayType: string = '';
  getReserveSchemaFn() {
    getReserveSchema({appCode: this.projectCode}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      this.payTypes = res.data?.payTypes??[]
    })
  }
  handleChange(val) {
    this.selectedPayType = val;
    this.$emit('changePayType',this.selectedPayType)
  }
  mounted() {
    this.getReserveSchemaFn();
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
.pay-types-pop {
  margin-right: @spacing-base;
  .condition {
    @f-color:#2970ff;
    border: 1px solid #2970ff;
    border-radius: 4px;
    cursor: pointer;
    margin-right: @spacing-base;
    padding: 1/4 *@spacing-base @spacing-base;
    color: @f-color;
    .anticon:hover {
      opacity: 0.8;
    }
  }
}
.ant-popover-inner-content {
  display: flex;
  align-items: center;
  .anticon {
    position: relative;
    display: contents;
  }
  .ant-popover-message-title {
    padding-left: @spacing-base;
  }
  .ant-select {
    margin-left: @spacing-base;
    min-width: 120px;
  }
}
</style>
