<template>
  <div class="info_title">
    <div>
      <img src="../../Img/title@2x.png" alt="" />
      <span>{{ title }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    title: {
      type: String,
      default: "",
    },
  },
};
</script>

<style lang="less" scoped>
.info_title {
  display: flex;
  padding: 10px 20px;
  div {
    flex: 1;
  }
  div:nth-child(1) {
    text-align: left;
    line-height: 25px;
  }
  div:nth-child(2) {
    text-align: right;
  }
  img {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    vertical-align: middle;
  }
  i {
    display: inline-block;
    vertical-align: middle;
    font-size: 25px;
  }
  span {
    font-size: 16px;
    vertical-align: middle;
    color: #666666;
  }
}
</style>