<template>
  <a-date-picker
    mode="year"
    :size="size"
    :value="year"
    :placeholder="placeholder"
    format="YYYY"
    valueFormat="YYYY"
    :open="open"
    @openChange="openChange"
    @panelChange="panelChange"
    @change="change">
  </a-date-picker>
</template>

<script lang="ts">
  import { Component, Vue, Prop, VModel } from 'vue-property-decorator';
  import {DatePicker} from "@h3/antd-vue";
  import moment,{Moment} from "moment";
  @Component({
    name:"YearPicker",
    components:{
      [DatePicker.name]:DatePicker,
    }
  })
  export default class YearPicker  extends Vue {
    @Prop({required:false,default:"default"})size!:string;
    @Prop({required:false,default:"请选择年度"})placeholder!:string;
    @VModel({type:String}) year!:string;

    open=false;
    openChange(status:boolean){
      this.open=status;
    }

    change(date: Moment|string){
      !date&&(this.year="");
    }
    panelChange(value:Moment){
      this.year=value.format("YYYY");
      this.open=!this.open;
    }
  }
</script>

<style lang="less" scoped>
// /deep/.calendarDate{
//   border: 1px solid #ccc;
//   background: red;
// }

</style>
