<template>
  <div>
    <!-- <div class="phone_title">通讯录</div> -->
    <div>
      <a
        :href="'tel:' + item.mobile"
        class="phone"
        v-for="(item, index) in list"
        :key="index"
      >
        <img src="../../Img/img/my.png" alt="" />
        <span>{{ item.name }}</span>
        <img src="../../Img/img/maillist_telephone.png" alt="" />
      </a>
    </div>
  </div>
</template>

<script>
import { getUserByDepId, getSearchUser } from "../service/index.js";
export default {
  data() {
    return {
      id: "",
      list: [],
    };
  },
  methods: {
    playPhone(val) {
      window.open(val.mobile);
    },
  },
  mounted() {
    if (this.$route.query.id) {
      this.id = this.$route.query.id;
      getUserByDepId(this.id, 0, 999).then((res) => {
        this.list = res.data.content;
      });
    }else if(this.$route.query.value) {
      getSearchUser(this.$route.query.value,0,999,this.$route.query.corpId).then(res=>{
        this.list = res.data.content;
      })
    }
  },
};
</script>

<style lang="less" scoped>
.phone_title {
  position: fixed;
  top: 0;
  width: 100%;
  height: 45px;
  line-height: 45px;
  background: #2758fd;
  font-family: PingFang SC;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
}
.phone {
  display: inline-block;
  width: 100%;
  height: 55px;
  line-height: 55px;
  background: #fff;
  box-shadow: 0px 1px 0px 0px #e4e4e4;
  border-bottom: 1px solid #e4e4e4;
  img:nth-child(1) {
    width: 38px;
    height: 38px;
    margin-right: 10px;
    vertical-align: middle;
  }
  img:nth-child(3) {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    vertical-align: middle;
  }
  span {
    display: inline-block;
    color: #333;
    font-family: Source Han Sans CN;
    font-size: 15px;
    width: 67%;
    text-align: left;
  }
}
</style>