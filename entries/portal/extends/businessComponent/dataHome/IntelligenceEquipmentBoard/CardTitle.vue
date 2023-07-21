<template>
  <div class="card-title">
    {{ title }}
  </div>
</template>

<script lang="ts">
import {Vue, Component,Prop} from 'vue-property-decorator';

@Component({
  name: 'CardTitle',
  components: {}
})
export default class CardTitle extends Vue {
  @Prop() title?:string;
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';
.card-title {
  background-image: url("./img/title_bg.png");
  background-size: contain;
  background-repeat: no-repeat;
  margin-bottom: @spacing-medium;
  font-size: 18px;
  font-weight: bold;
  padding-left: 3/2 * @spacing-large;
}
</style>
