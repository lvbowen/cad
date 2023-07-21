<template>
  <article class="mainContainer">
    <!--    底部 信息栏 显示状态-->
    <div
      :role="isBottomShow?'showContainer':'hideContainer'"
      ref="MainTable"
      class="bottom_class"
    >
      <nav class="bottomOption">
        <img
          :src="bottomArray"
          @click="() => {this.isBottomShow = false}"
          class="bottom_array"
          v-show="isBottomShow"
        />
        <img
          :src="bottomArrayHide"
          @click="() => {this.isBottomShow = true}"
          class="bottom_array"
          v-show="!isBottomShow"
        />
      </nav>
      <main class="bottomMain">
        <div class="titleContainer">
          <a-icon type="left" @click="backToLast()"/>
          <span>预警设置</span>
          <a-button
            size="small"
            @click="saveAlert()"
            :class="buttonChoose==='保存'?'bottom_hover_button':'bottom_button'">保存
          </a-button>
        </div>
        <a-divider style="margin: 5px 5px 15px 5px"/>
        <div class="settingContainer">
          <div style="width: 33%">
            <a-icon type="caret-right"/>
            <span>提示规则</span>
            <a-form-model :model="alertData" class="formModel">
              <a-form-model-item label="当安全帽位置超过绑定电子围栏">
                <a-input style="width: 150px" size="small" v-model="alertData.remindLimit"></a-input>
                米时
              </a-form-model-item>
              <a-form-model-item label="系统发送提示内容短信通知">
                <a-input
                  style="width: 200px"
                  size="small"
                  type="textarea"
                  v-model="alertData.remindInfo"
                  placeholder="短信提示内容"></a-input>
              </a-form-model-item>
            </a-form-model>
          </div>
          <div style="width: 33%">
            <a-icon type="caret-right"/>
            <span>预警管理</span>
            <a-form-model :model="alertData" class="formModel">
              <a-form-model-item label="当安全帽位置超过绑定电子围栏">
                <a-input style="width: 150px" size="small" v-model="alertData.alertLimit"></a-input>
                米时
              </a-form-model-item>
              <a-form-model-item label="系统发送提示内容短信通知">
                <a-input
                  style="width: 200px"
                  size="small"
                  type="textarea"
                  v-model="alertData.alertInfo"
                  placeholder="短信提示内容"></a-input>
              </a-form-model-item>
            </a-form-model>
          </div>
          <div style="width: 33%">
            <a-icon type="caret-right"/>
            <span>关联管理员</span>
            <a-form-model :model="alertData" class="formModel">
              <a-form-model-item label="管理员姓名">
                <a-input style="width: 150px" size="small" v-model="alertData.managerNames"></a-input>
              </a-form-model-item>
              <a-form-model-item label="管理员手机号">
                <a-input style="width: 150px" size="small" v-model="alertData.managerPhones"></a-input>
              </a-form-model-item>
            </a-form-model>
          </div>
        </div>
      </main>
    </div>
  </article>
</template>

<script lang="ts">
import * as Api from "../../../service/api";
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {Card, Spin, Input, Divider, Form, Button, Icon, FormModel,} from '@h3/antd-vue';
import bottomArray from '../../../../src/assets/extends/bim/frame_bottom_1.png'
import bottomArrayHide from '../../../../src/assets/extends/bim/frame_bottom_2.png'

@Component({
  name: 'alertSettings',
  components: {
    ASpin: Spin,
    AIcon: Icon,
    ACard: Card,
    AInput: Input,
    AButton: Button,
    ADivider: Divider,
    AForm:Form,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item
  }
})
export default class alertSettings extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;
  @Prop() alertData!: string;

  @Ref()
  MainTable?: HTMLElement;

  bottomArray: any = bottomArray;
  bottomArrayHide: any = bottomArrayHide;
  isBottomShow: boolean = true;

  buttonChoose: string = '';

  backToLast(){
    this.$emit('alertShow');
  }

  saveAlert() {
    this.buttonChoose = '保存';
    //@ts-ignore
    this.$set(this.alertData,'appCode',this.projectCode);
    //@ts-ignore
    this.$set(this.alertData,'fenceId',this.alertData.id)
    //@ts-ignore
    Api.updateAlertInfo(this.alertData).then(res=>{
      if(res.errcode===0) {
        this.$emit('alertShow');
        //@ts-ignore
        return this.$message.success('保存成功！');
      }
      //@ts-ignore
      return this.$message.warn('保存失败！');
    })
  }
}

</script>

<style lang="less" scoped>
@import '../BIMPlatform.module.less';

.bottom_class {
  .flex;
  transition: all .3s;
  flex-direction: column;
  position: fixed;
  background: url("../../../../src/assets/extends/bim/frame_bottom.png");
  background-size: 100% 100%;
  border-color: transparent;
  height: 17.625vw;
  width: 99.8%;
  bottom: 0px;
  margin-left: 0.1%;

  & .bottomOption {
    .flex;
    width: 1.7187vw;
    height: 1.3028vw;
    margin-left: auto;
    margin-right: auto;

    & > .bottom_array {
      margin: auto;
      width: 100%;
    }
  }

  & .bottomMain {
    .flex;
    flex-direction: column;
    width: 98%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 0.9375vw;

    i:nth-child(1) {
      font: 16px Source Han Sans CN;
      color: #32bfd2;
    }

    span:nth-child(2) {
      color: #FFFFFF;
      font-family: Source Han Sans CN;
      font-weight: bold;
      font-size: 16px;
    }

    .settingContainer {
      display: flex;
      flex-direction: row;

    }
  }

}

.bottom_class_hide {
  position: fixed;
  background: url("../../../../src/assets/extends/bim/frame_bottom_hide.png");
  background-size: 100% 100%;
  border-color: transparent;
  height: 42px;
  width: 99.8%;
  bottom: 0px;
  margin-left: 0.1%;
}

.mainContainer {
  .flex;
}

div[role=showContainer] {
  bottom: 0;
}

div[role=hideContainer] {
  bottom: -15.625vw;
}

/deep/ .ant-btn > span {
  margin-left: 0 !important;
}
.ant-form-item {
  .flex;
  flex-direction: row;
  /deep/.ant-form-item-children{
    color: #FFFFFF;
  }
}
/deep/.ant-form label {
  color: #FFFFFF;
}
.bottom_button {
  margin-right: 5px;
  float: right;
  z-index: 999;
  color: #fff !important;
  background: rgba(11, 27, 36, 0.8) !important;
  border: 1px solid #307AE4 !important;
  border-radius: 12px !important;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);

  /deep/ .ant-btn:hover, .ant-btn:focus {
    color: white;
  }
}

.bottom_hover_button {
  margin-right: 5px;
  float: right;
  z-index: 999;
  color: #17e5fd !important;
  background: rgba(11, 27, 36, 0.8) !important;
  border: 1px solid #307AE4 !important;
  border-radius: 12px !important;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
}
</style>
