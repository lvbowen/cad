<template>
  <div class="setup">
    <h2>设置</h2>
    <uploader :afterRead="afterRead">
      <div class="headPortrait">修改头像</div>
    </uploader>
    <div class="changePassword" @click="show = true">修改密码</div>
    <div class="exit" @click="exit">退出登录</div>
    <popup v-model="show">
      <field
        v-model="password1"
        required
        type="password"
        label="原密码" />
      <field
        v-model="password2"
        required
        :errorMessage="passwordError"
        type="password"
        label="新密码"
      />
      <field
        required
        @blur="judgeClick"
        v-model="password3"
        type="password"
        label="确认密码"
      />
      <div class="subButton">
        <div class="submit" @click="submit">确认</div>
        <div class="cancel" @click="cancel">取消</div>
      </div>
    </popup>
  </div>
</template>

<script>
import { Popup } from "vant";
import { field } from "vant";
import { Toast } from "vant";
import { Uploader } from "vant";
import env from "@/config/env";
import {
  getInfo_login,
  getmodify_user_password,
  getUpload,
  getUserModify,
} from "../service/index.js";
export default {
  components: {
    Popup,
    field,
    Uploader,
  },
  data() {
    return {
      password1: "",
      password2: "",
      password3: "",
      username: "",
      projectCode: "",
      corpId: "",
      passwordError: "",
      show: false,
      departmentId: "",
      id: "",
      imgUrl: "",
      imgUrlId: "",
      mobile: "",
      name: "",
    };
  },
  methods: {
    afterRead(val) {
      const newFile = new FormData();
      newFile.append("file", val.file);
      getUpload(newFile).then((res) => {
        this.imgUrlId = res.data.refId;
        this.imgUrl = this.imgUrlId + res.data.name;
        getUserModify(
          this.departmentId,
          this.id,
          this.imgUrl,
          this.imgUrlId,
          this.mobile,
          this.name,
          this.username,
          [],
          null,
          null,
          null,
          null,
          null,
          []
        ).then((ress) => {
          Toast(ress.errmsg);
        });
      });
    },
    judgeClick() {
      if (this.password3 === this.password2) {
        this.passwordError = "";
      } else {
        this.passwordError = "两次密码输入不一致";
      }
    },
    submit() {
      if (this.password3 === this.password2) {
        getmodify_user_password(
          this.corpId,
          this.password1,
          this.password3,
          this.username
        ).then((res) => {
          if (res.errcode) {
            Toast(res.errmsg);
          } else {
            Toast(res.errmsg);
            this.show = false;
            this.passwordError = "";
            this.password1 = "";
            this.password2 = "";
            this.password3 = "";
          }
        });
      }
    },
    cancel() {
      this.show = false;
      this.passwordError = "";
      this.password1 = "";
      this.password2 = "";
      this.password3 = "";
    },
    exit() {
      localStorage.clear();
      this.$router
        .push({
          name: "login",
        })
        .then((res) => {
          // localStorage.clear();
        });
    },
  },
  mounted() {
    this.projectCode = `${env.project}`;
    getInfo_login().then((res) => {
      this.corpId = res.data.corpId;
      this.username = res.data.username;
      this.departmentId = res.data.departmentId;
      this.id = res.data.id;
      this.mobile = res.data.mobile;
      this.name = res.data.name;
    });
  },
};
</script>

<style lang="less" scoped>
.setup {
  height: 100%;
  background: #fff;
  text-align: left;
  padding: 20px;
  h2 {
    font-size: 24px;
    font-family: inpinheiti;
    font-weight: 400;
    margin-bottom: 30px;
    color: #303442;
  }
  .headPortrait {
    height: 40px;
    line-height: 40px;
    font-size: 15px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    border-bottom: 1px solid #e4e4e4;
    color: #333333;
    margin-bottom: 20px;
  }
  .changePassword {
    height: 40px;
    line-height: 40px;
    font-size: 15px;
    font-family: Source Han Sans CN;
    border-bottom: 1px solid #e4e4e4;
    font-weight: 400;
    color: #333333;
    margin-bottom: 30px;
  }
  .exit {
    height: 40px;
    line-height: 40px;
    text-align: center;
    background: #337df7;
    border-radius: 44px;
    color: #fff;
  }
  .subButton {
    display: flex;
    justify-content: flex-end;
  }
  .cancel {
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-radius: 44px;
    border: 1px solid #d9d9d9;
    color: rgba(0, 0, 0, 0.65);
    width: 30%;
  }
  .submit {
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: #337df7;
    border-radius: 44px;
    color: #fff;
    width: 30%;
    margin-right: 10px;
  }
}
</style>

<style lang="less">
.setup {
  .van-popup {
    width: 88%;
    padding: 10px 20px;
  }
  .van-cell {
    margin-bottom: 20px;
  }
  .van-uploader {
    width: 100%;
  }
  .van-uploader__input-wrapper {
    width: 100%;
  }
}
</style>
