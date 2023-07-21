<template>
  <div class="login">
    <div class="login-head">
      <img src="../../../../../src/assets/extends/coordinate/ModelAnnotation/logo.png" alt=""/>
      <span>二航院数字交付平台</span>
    </div>
    <div class="login-content">
      <div class="login-content-contain">
        <div class="login-types">
          <div class="tab-bar only-one">
            <div class="tab-bar-item active">登录</div>
          </div>
          <div class="tab-content">
            <template>
              <div class="login-account" :class="{'login-err-box':passwordErr}">
                <p v-if="passwordErr" class="err-tips">{{ errTips }}</p>
                <a-input
                  placeholder="请输入账号/手机号"
                  autocomplete="off"
                  class="newInput bottom22"
                  v-model="userName"
                  @change="becanLogin"
                >
                  <i class="newInputIcon" slot="prefix">
                    <img src="@/assets/extends/icon/user.png" alt=""/>
                  </i>
                </a-input>
                <!--style="width: 280px;margin-bottom: 16px;"-->
                <a-input
                  placeholder="请输入密码"
                  class="newInput bottom29"
                  v-model="passWord"
                  @change="becanLogin"
                  @pressEnter="enterLogin"
                  :type="passwordType"
                  autocomplete="off"
                >
                  <i class="newInputIcon" slot="prefix">
                    <img src="@/assets/extends/icon/password.png" alt=""/>
                  </i>
                  <i
                    class="icon aufontAll"
                    :class="{'h-icon-all-eye-close': !showPassword,'h-icon-all-eye-o': showPassword}"
                    slot="suffix"
                    @click="passwordVisible"
                  ></i>
                </a-input>
                <div
                  class="login-btn loginButton"
                  :class="{'loginDisabled': !loginDisabled}"
                  @click="login">登 录
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
/// <reference path="../../../../../src/typings/shims-tsx.d.ts" />
import {Component, Vue} from "vue-property-decorator";
import {getPermissionById, validateDigitalDelivery} from "../../../../service/api";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";

@Component({
  name: "login",
  components: {AModal:Modal},
})
export default class login extends Vue {
  passwordErr: boolean = false; // 账户密码错误

  passwordType: string = 'password'; // 密码的展示形式

  loginDisabled: boolean = false; // 登录禁用状态

  userName: string = ''; // 登录账号

  passWord: string = ''; // 登录密码

  showPassword: boolean = false;

  errTips: string = '';
  id: string = '';

  isShow:boolean = false;

  mounted() {
    this.id = this.$route.query.id as string;
    this.getPermissionById()
  }


  getPermissionById() {
    getPermissionById({id: this.id}).then(res => {
      if (res.errcode === 0 && res.data.permit && res.data.url) {
        window.location.replace(res.data.url);
      } else if (res.data.msg==='未生效'||res.data.msg==='已过期') {
        this.isShow=true;
        const modal = Modal.info({
          title: '提示',
          content: res.data.msg as string,
          onOk() {},
        });

      } else {
        this.$message.info('请输入账号密码登录！')
      }
    })
  }

  passwordVisible() {
    if (this.showPassword) {
      this.passwordType = 'password';
    } else {
      this.passwordType = 'text';
    }
    this.showPassword = !this.showPassword;
  }

  becanLogin() {
    if (this.userName && this.passWord) {
      this.loginDisabled = true;
    } else {
      this.loginDisabled = false;
    }
  }

  /**
   * 回车登陆
   */
  enterLogin() {
    const {userName, passWord} = this;

    if (!passWord || !userName) return;

    this.login();
  }

  login() {
    if(this.isShow) return this.$message.info('链接不在有效期内')
    validateDigitalDelivery({
      id: this.id,
      uname: this.userName,
      key: this.passWord
    }).then(res => {
      if (res.errcode === 0 && res.data.result) {
        window.location.replace(res.data.directUrl);
      } else {
        this.$message.warn(res.errmsg as string)
      }
    })

  }
}
</script>
<style lang="less" scoped>
.login {
  .login-head {
    width: 100%;
    height: 64px;
    line-height: 64px;
    padding-left: 24px;

    & > img {
      max-height: 30px !important;
    }

    & > span {
      font-size: 24px;
      font-family: Source Han Sans CN;
      font-weight: bold;
      color: #333333;
      line-height: 30px
    }
  }

  .login-content {
    height: calc(100vh - 64px);
    min-width: 1066px;
    background-image: url("../../../../../src/assets/extends/coordinate/ModelAnnotation/bg.png");

    &-contain {
      width: 1200px;
      height: 100%;
      overflow: hidden;
      margin: 0 auto;

      &__left {
        position: relative;
        height: 100%;
        float: left;

        h1 {
          font-size: 40px;
          margin-top: 80px;
          margin-left: 82px;
          font-weight: 400;
          line-height: 48px;
          color: #fff;
        }

        h2 {
          font-size: 28px;
          margin-top: 8px;
          margin-left: 82px;
          margin-bottom: 8px;
          font-weight: 400;
          color: #fff;
        }

        .bj-image {
          margin-top: 102px;
        }
      }
    }
  }

  .login-types {
    float: right;
    margin-top: 200px;
    width: 360px;
    height: 400px;
    position: relative;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 6px;
    text-align: center;
    padding: 40px;

    & > .tab-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(240, 243, 242, 0.5);
      padding-bottom: 16px;

      &.only-one {
        justify-content: space-around;

        .tab-bar-item {
          width: 100%;
        }
      }

      & > .tab-bar-item {
        cursor: pointer;
        user-select: none;
        color: rgba(0, 0, 0, 0.65);
        width: auto;
        position: relative;

        &.active {
          font-size: 20px;
          margin-left: 2%;
          padding-left: 10%;
          color: #0b73ef;

          &:after {
            content: "";
            display: block;
            position: absolute;
            left: 0;
            bottom: -17px;
            width: 40%;
            height: 3px;
            background: #064FA6;
          }
        }
      }
    }

    .login-account {
      padding-top: 30px;
      text-align: center;

      &-header {
        font-size: 30px;
        color: #333;
        line-height: 40px;
        margin: 50px 0 42px 0;
      }

      &-type {
        position: absolute;
        top: 32px;
        right: 32px;
        cursor: pointer;

        img {
          width: 44px;
        }
      }

      &-forget {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
        text-align: right;
        cursor: pointer;
      }

      .login-btn {
        width: 280px;
        background: #2ca3ee;
        border-radius: 4px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        color: #fff;
        margin: 42px auto;
        cursor: pointer;
      }

      .loginDisabled {
        color: rgba(255, 255, 255, 0.6);
      }

      .icon {
        cursor: pointer;
      }

      .bottom22 {
        margin-bottom: 22px;
      }

      .bottom29 {
        margin-bottom: 29px;
      }

      /deep/ .ant-input-affix-wrapper .ant-input:not(:first-child) {
        padding-left: 40px;
      }
    }
  }
}

.login-err-box {
  position: relative;

  /deep/ .ant-input {
    border-color: #f5222d !important;

    &:focus {
      box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
    }
  }

  .err-tips {
    font-size: 12px;
    color: #f5222d;
    text-align: left;
    line-height: 20px;
    position: absolute;
    top: 5px;
    left: 0;
  }
}
</style>
