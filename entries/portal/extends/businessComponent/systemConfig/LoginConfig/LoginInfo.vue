<template>
  <div class="login-info">
    <div v-if="projectConfig" class="flex flex-space-between">
      <div>
        <span>平台名称：</span>
        <a-input v-model="projectConfig.title"></a-input>
      </div>
      <a-button @click="save" :disabled="!projectConfig" type="primary">保存</a-button>
    </div>
    <div class="base-settings__form-item">
      <applicationToProject
        :projectPath="projectCode"
        :uploadFunc="uploadProjectConfig"
        :setFile="setFile"
        :messageHandle="messageHandle"
        :projectConfig="projectConfig"
      ></applicationToProject>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Watch, InjectReactive} from 'vue-property-decorator';
// import {Upload,Button,Input} from "ant-design-vue";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Upload from 'ant-design-vue/lib/upload';
import 'ant-design-vue/lib/upload/style/index.css';
import {LoginInfoT} from "../type";
import {ApplicationToProject} from '@ctesi/component';
import {updateIconTheme} from "../../../service/api";

@Component({
  name: 'LoginInfo',
  components: {
    AUpload: Upload,
    ApplicationToProject,
    AButton:Button,
    AInput: Input
  }
})
export default class LoginInfo extends Vue {
  @InjectReactive('project') projectCode!: string;
  @Prop({
    default: []
  }) setLoginInfo?: LoginInfoT;
  @Watch('setLoginInfo', {immediate: true})
  loginInfoChange(val) {
    if (val) {
      this.projectConfig = JSON.parse(JSON.stringify(val));
      // console.log(this.projectConfig,this.projectCode)
    }
  }

  projectConfig: LoginInfoT | null = null;

  projectTheme: FormData = new FormData();

  num: number = 1;
  messageHandle() {
    return this.$message;
  }
  /* 上传项目图标和背景图片 */
  uploadProjectConfig() {
    this.projectTheme.set('appCode', this.projectCode);
    if (this.projectConfig) this.projectTheme.set('id', this.projectConfig.id??'');
    if (this.projectConfig) this.projectTheme.set('name', this.projectConfig.title??'');
    if (this.projectTheme.get('appCode')) updateIconTheme(this.projectTheme).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('修改成功')
    });
  }

  /* setFile */
  setFile(fileForm: FormData) {
    for (const files of fileForm.entries()) {
      const [key, value] = [files[0], files[1]];
      if (!this.projectConfig || value !== this.projectConfig[key]) {
        // console.log('key',key,'value',value)
        this.projectTheme.set(key, value);
        // console.log(this.projectTheme.get('logo'))
      }
    }
  }

  save() {
    // console.log('this.projectTheme', this.projectTheme.get('logo'), this.projectTheme.get('background'));
    this.uploadProjectConfig()
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';
.login-info {
  .ant-input {
    width: 300px;
  }
  & > div {
    margin-bottom: @spacing-large;

    & > span:first-child {
      margin-right: @spacing-large;
    }
  }

  .base-settings {
    &__icon {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }

      i {
        visibility: hidden;
      }

      &:hover,
      &--loading {
        i {
          position: absolute;
          z-index: 9;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          color: #fff;
          text-align: center;
          line-height: 48px;
        }

        &:after {
          content: "";
          display: block;
          position: absolute;
          z-index: 5;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.45);
        }
      }

      &:hover:not(&--loading) {
        /deep/ i.h-icon-all-form-o {
          visibility: visible;
        }
      }

      &--loading {
        /deep/ i.h-icon-all-loading-o {
          visibility: visible;
          animation: rotating 1s linear infinite;
        }
      }
    }
  }

  .logo {
    & > div:last-child {
      font-size: 12px;
      font-weight: 400;
      color: rgba(0, 0, 0, .45);
    }
  }
}
</style>
<style lang="less">
.uploadIcon(){
  width: 100px;
  height: 100px;
}

.uploadBgSize(){
  //width: 705px;
  width: 27.3vw;
  //height: 397px;
  height: 15.50vw;
}

.commonAside() {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  & > span:first-child {
    margin-right: 8px;
    min-width: 70px;
  }
}

.ApplicationToProject_main {
  display: flex;
  flex-direction: column;
  width: 100%;

  & > aside {
    display: none;
    //.commonAside;
  }
}

.ApplicationToProject_mask{
  display: flex;
  color: #FFF;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &>span{
    z-index: 99;
  }
  &>.ApplicationToProject_mask_bg{
    background-color: black;
  }
}

.ApplicationToProject_main_config {
  display: flex;
  flex-direction: column;

  &>aside:first-child {
    display: none;
  }

  & > aside {
    .commonAside;
    flex-wrap: wrap;

    & > span:first-child {
      align-self: flex-start;
    }

    & > section {
      display: flex;
      flex: 1;
      flex-direction: column;

      &>span{
        margin-left: 10px;
      }

      &>div[img-role=logo]{
        .uploadIcon;
        &>.ApplicationToProject_mask{
          .uploadIcon;
        }
      }

      &>div[img-role=background]{
        .uploadBgSize;
        &>.ApplicationToProject_mask{
          .uploadBgSize;
        }
      }
    }
  }
}

.ApplicationToProject_main_upload {
  display: flex;
  margin-left: 8px;
  cursor: pointer;
  position: relative;

  & > i {
    display: flex;
    width: 100%;
    height: 100%;

    & > img {
      width: 100%;
      height: 100%;
    }
  }
}

.ApplicationToProject_iconDefault{
  &>img{
    margin:auto;
    width: 60px !important;
    height: 60px !important;
  }
}

.ApplicationToProject_main_config_upload {
  display: none;
}

.ApplicationToProject_tips {
  color: #00000073;
  font-size: 12px;
  margin-left: 20px;
}

.CorpIdPicker{
  &>div[role=combobox]{
    min-width: 160px;
  }
}
</style>
