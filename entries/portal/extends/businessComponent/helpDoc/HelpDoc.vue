<template>
  <div>
    <Header />
    <ManageUserManual />
  </div>

</template>

<script>
import ManageUserManual from "../manageHelpDoc/ManageHelpDoc.vue";
import Header from "../../../src/components/shared/header/header.vue";

export default {
  name: "UserManual",
  components: {
    ManageUserManual,
    Header
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
/deep/  .ck-editor__top {
  display: none;
}
/deep/ .ck-editor__main {
  .full-height !important;
  .ck-content {
    .full-height;
  }
}
.ant-card {
  .full-height;
  /deep/ .ant-card-body {
    height: calc(100% - 20px);
  }
}
/deep/ .ant-menu-vertical .ant-menu-item {
  margin-top: 0;
  margin-bottom: 0;
  height: 35px;
}
</style>
