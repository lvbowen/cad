<template>
  <div class="login-input" :data-type="type">
    <p v-show="showTitle" class="login-input-label">{{ lable }}</p>
    <input
      :type="inputType"
      :placeholder="placeholder"
      @focus="focus"
      @blur="blur"
      @change="chang"
      v-model="val"
      autocomplete="off"
    />
    <i
      v-if="type === 'password'"
      class="icon aufontAll icon-eye"
      :class="{'h-icon-all-eye-close': !showPassWord, 'h-icon-all-eye-o': showPassWord}"
      @click="switchType"
    ></i>
    <!--v-show="val && showTitle"-->
    <i
      @click="clearValue"
      v-show="val"
      class="clear icon aufontAll icon-clear"
      :class="{'password-clear': type === 'password'}"
    >&#xe994;</i>
  </div>
</template>
<script lang="ts">
// eslint-disable-next-line no-shadow
enum inputType {
  text = "text",

  password = "password"
}

import {Component, Vue, Prop, Model, Watch} from "vue-property-decorator";

@Component({
  name: "login-input",
  components: {}
})
export default class LoginInput extends Vue {
  @Prop({
    default: ""
  })
  placeholder!: boolean;

  @Model("change")
  val!: string;

  @Prop({
    default: ""
  })
  lable!: string;

  @Prop({
    default: inputType.text
  })
  type!: inputType;

  showTitle = false;

  showPassWord = false;

  inputType = inputType.text;

  created() {
    this.inputType = this.type;
  }

  focus() {
    //this.showTitle = true;
  }

  blur() {
    this.showTitle = false;
  }

  chang(e: any) {
    this.$emit("change", e.target.value);
  }

  switchType() {
    this.showPassWord = !this.showPassWord;
    this.inputType = this.showPassWord ? inputType.text : inputType.password;
  }

  clearValue() {
    this.$emit("change", "");
    // this.val = '';
  }
}
</script>
<style lang="less" scoped>
@inputPadding: 4.2666vw;
@inputHeight: 13.493vw;

.login-input {
  position: relative;
  text-align: left;

  .login-input-label {
    color: @primary-color;
    font-size: 0.373rem;
    line-height: 0.533rem;
    position: absolute;
    top: 0;
  }

  input {
    width: 100%;
    //new add
    color:#fff;
    height: 100%;
    background: rgba(66, 125, 255, 0.15);
    border-radius: 2vw;
    padding-left: @inputPadding;
    padding-right: @inputPadding*2+2vw;
    //border-bottom: 0.04rem solid rgba(230, 235, 246, 1);
    //background-color: inherit;
    //padding: 0.13rem 0;
    font-size: 0.43rem;
    //padding-top: 0.68rem;
    &::-webkit-input-placeholder {
      color: #999;
    }
  }

  .icon-eye {
    position: absolute;
    //right: 0;
    //top: 0.6rem;
    //new add
    line-height: @inputHeight;
    right: @inputPadding;
    color: rgba(204, 204, 204, 1);
  }

  .icon-clear {
    position: absolute;
    //right: 0;
    //top: 0.6rem;
    //new add
    line-height: @inputHeight;
    right: @inputPadding;
    color: rgba(204, 204, 204, 1);

    &.password-clear {
      //right: 0.74rem;
      right: @inputPadding*3;
    }
  }
}

.login-input[data-type=password]{
  & input{
    padding-right: @inputPadding*4 + 2vw;
  }
}
</style>
