<template>
  <div class="document full-height">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="帮助文档" class="custom-style flex flex-column full-height">
        <manage-help-doc/>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';
import manageHelpDoc from "../../manageHelpDoc/ManageHelpDoc.vue";
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
@Component({
  name: 'Document',
  components: {
    manageHelpDoc: manageHelpDoc,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
  }
})
export default class Document extends Vue {
  activeKey: string[] = ['1']
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';
.document {
  /deep/ .ant-collapse {
    height: 100%;
    .ant-collapse-content {
      flex: 1;
      .ant-collapse-content-box {
        height: 100%;
      }
    }
  }
}
/deep/ .manage-user-manual {
  >.ant-card {
    >.ant-card-body {
      height: 100% !important;
      overflow: hidden !important;
      flex: none ;
    }
  }
  .ant-card {
    .ant-card {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
