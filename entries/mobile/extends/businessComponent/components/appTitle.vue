<template>
  <div class="app_title">
    <div>
      <img @click="toprev" src="../../Img/fanhui1.png" alt="" />
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
    routeUrl:{
      type: String,
      default:null,
    }
  },
  mounted() {},

  methods: {
    toprev() {
      if(this.routeUrl){
        this.$router.push({
          name: this.routeUrl
        })
      }else if(this.$route.name == "ProgressDetails") {
        this.$router.push({
          name: "ProgressSummary",
          query: {
            scheduleDate: this.$route.query.scheduleDate
          }
        })
      }else if(this.$route.name === 'AboutMeDetail'){
        this.$router.push({
          name: 'AboutMeMoment',
          query: this.$route.query.list
        })
      }else {
        this.$router.go(-1);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.app_title {
  width: 100%;
  height: 45px;
  background: #0e79ed;
  display: flex;
  div:nth-child(1) {
    width: 80%;
    display: flex;
    span {
      width: 95%;
      font-size: 17px;
      padding-left: 15px;
      font-weight: 700;
    }
    img {
      padding-top: 12px;
      padding-left: 5px;
      width: 28px;
      height: 30px;
      margin-right: 40px;
    }
  }
  div:nth-child(2) {
    width: 20%;
    span {
      vertical-align: middle;
      width: 75%;
      font-size: 16px;
    }
    img {
      width: 18px;
      vertical-align: middle;
      margin-right: 3px;
      height: 18px;
    }
  }
  span {
    color: #fff;
    line-height: 45px;
  }
}
</style>
