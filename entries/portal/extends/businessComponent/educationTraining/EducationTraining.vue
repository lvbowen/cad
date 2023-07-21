<template>
  <div class="education-training full">
    <meta name="referrer" content="never">
    <iframe :src="url" class="iframe-style full" frameborder="0">
      <p>你的浏览器不支持iframe页面嵌套，请点击这里访问页面内容。</p>
      <a href="https://edutraining.wisdombim.com.cn/front/showCourseList"></a>
    </iframe>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'EducationTraining'
})
export default class EducationTraining extends Vue{
  url:string = 'https://edutraining.wisdombim.com.cn/front/showCourseList';
}
</script>
<style scoped lang="less">
@import '../../styles/public.module.less';
</style>
