<template>
  <div class="comment full-height overflow-hidden flex flex-column" :class="themeType==='dark'?'dark':''">
    <div class="flex flex-space-between flex-center-align">
      <span class="comment-title">{{ title }}</span>
      <a-icon type="close" @click="closeWindow"></a-icon>
    </div>
    <div class="flex flex-center-align flex-space-between">
      <span>{{ auditor }}</span>
      <span>{{ auditTime }}</span>
    </div>
    <div class="pic">
      <template v-if="capturePicUrl">
        <img
          :src="p"
          alt=""
          v-for="(p,index) in capturePicUrl.split(',')"
          :key="index"/>
      </template>
      <template v-if="bimUrl">
        <img
          @click="goModelAnnotation"
          class="model"
          src="../../../../../src/assets/extends/CoordinateDesign/External/模型.png"
          alt="暂无批注图片！">
      </template>
    </div>
    <div class="content flex-auto">{{ comment }}</div>
  </div>
</template>

<script lang="ts">
import {Component,Vue,Prop} from "vue-property-decorator";
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import {EventBus} from './bus';
@Component({
  name:"Comment",
  components: {
    AIcon: Icon
  }
})
export default class Comment extends Vue {
  @Prop() id!:string;
  @Prop() title!: string;
  @Prop() comment!: string;
  @Prop() capturePicUrl!: string;
  @Prop() bimUrl!: string;
  @Prop() auditor!: string;
  @Prop() auditTime!:string;
  closeWindow() {
    window.close();
  }
  goModelAnnotation() {
    const token = localStorage.getItem('token');
    if (!this.bimUrl) this.$message.warning('模型不存在！')
    window.close();
    window.open(`${this.bimUrl}&access_token=${token}`,'_blank')
  }
  themeType: string = '';
  mounted() {
    this.themeType = sessionStorage.getItem('themeType') as string
    EventBus.$on('themeType',(themeType)=> {
      this.themeType = themeType;
    })
  }
}
</script>

<style scoped lang="less">
@import './v2-public.less';
@import '../../../../styles/public.module.less';
.comment {
  padding:@spacing-large 2.5*@spacing-large;
  .anticon {
    margin-left: @spacing-base;
  }
  >div {
    margin-bottom: @spacing-base;
    font-weight: bold;
  }
  .comment-title {
    color: #0A28A9;
    font-size: 18px;
    font-weight: bold;
  }
  .pic {
    height: 80%;
    position: relative;
    overflow: auto;
    border-radius: 5px;
    img {
      margin-bottom: @spacing-large;
      border-radius: 10px;
      max-width: 100%;
      //.bg-full
    }
    .model {
      position: absolute;
      right: @spacing-large;
      top: @spacing-medium;
      &:hover {
        transition: all 0.3s;
        transform: scale(1.2);
      }
    }
  }
  .content {
    color: #333333;
    text-indent: 2em;
    overflow: auto;
    .scrollbar-default
  }
}
</style>
