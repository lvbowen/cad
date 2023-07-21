<template>
  <div class="card-header flex flex-center-align flex-space-between">
    <img alt="" src="./img/close.png" @click="closeModal">
    <div class="title"> {{ title }}</div>
    <a-date-picker
      v-model="currentTime"
      :allowClear="false"
      :format="dateFormat"
      @change="changeTime"></a-date-picker>
  </div>
</template>

<script lang="ts">
import {Vue, Component,Prop} from 'vue-property-decorator';
import DatePicker from 'ant-design-vue/lib/date-picker';
import 'ant-design-vue/lib/date-picker/style/index.css';
import moment from 'moment';
@Component({
  name: 'CardHeader',
  components: {
    ADatePicker: DatePicker
  }
})
export default class CardHeader extends Vue {
  currentTime: string = '';
  dateFormat:string= 'YYYY-MM-DD';
  @Prop() title?:string;
  closeModal() {
    this.$emit('closeModal')
  }
  //时间改变
  changeTime(date) {
    this.$emit('changeTime',moment(date).format('YYYY-MM-DD'))
  }
  mounted() {
    this.currentTime =  moment(new Date()).format(this.dateFormat);
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/public.module.less';
.card-header {
  background-image: url("img/title_top.png");
  .bg-full;
  height: 7.42738%;
  position: relative;
  padding: 0 @spacing-medium 0 3 *@spacing-large;
  .title {
    font-size: 24px;
    font-family: Source Han Sans CN;
    font-weight: bold;
    color: #F3FCFF;
  }
  img {
    position: absolute;
    top: -24%;
    right: -0.5%;
  }
  /deep/ .ant-calendar-picker {
    input {
      background-color: transparent;
      background-image: url("./img/header-time.png");
      border: none;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      color: #ffffff;
    }
    .anticon {
      color: #ffffff;
    }
  }
}
</style>
