<template>
  <div class="left-menu">
    <div class="menu-title"><a-icon type="menu-fold" style="margin-right: 12px" />{{ leftMenuObj.menuTitle }}</div>
    <div class="leftMenu-wrap">
      <div
        class="leftMenu-item flex"
        v-for="(item,index) in leftMenuObj.leftMenuList"
        :key="item.id"
        @click="changeItemBar(item,index)"
        :class="activeIndex===index?'activeItem':'leftMenu-item'">
        <div class="left-border"></div>
        <img v-if="item.icon.indexOf('data')>1" :src="item.icon" >
        <i
          v-else
          role-style="icon"
          class="icon aufontAll"
          :class="item.icon"/>
        <div>{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Vue,Prop,Watch} from "vue-property-decorator";
import {Icon} from "@h3/antd-vue";
@Component({
  name: "",
  components: {
    [Icon.name]:Icon,
  },
})
export default class index extends Vue {
  @Prop () leftMenuObj!:any;
  flag:boolean=true;

  @Watch('leftMenuObj',{deep: true})
  leftMenuObjWatch(obj){
    this.activeIndex=obj.activeIndex;
  }
  activeIndex:number | null = 0;
  changeItemBar(item,index){
    sessionStorage.setItem('leftMenuIndex',index)
    this.activeIndex=index;
    this.$emit("changeItemBar",item)
  }
  leftBack(){
    this.flag=!this.flag;
    this.$emit("leftBack",this.flag)
  }
  created() {
    this.activeIndex=this.leftMenuObj.activeIndex;
  }
}
</script>
<style lang="less" scoped>
@import "../../../styles/public.module.less";
*{
  margin: 0;
  padding: 0;
  box-sizing:border-box;
  color: #393939;
}
.left-menu{
  //width: 10%;
  height:100%;
  background-color: #fff;
  position: relative;
  .menu-title{
    padding: 0px 0px 0px 14px;
    width: 100%;
    height: 5.4vh;
    font-size: 16px;
    font-weight: 400;
    line-height: 5.4vh;
    background-color: #005ca9;
    color: #fff;
    .anticon {
      color: #fff;
    }
  }
  .leftMenu-wrap{
    padding: @spacing-large 0;
    .leftMenu-item{
      white-space: nowrap;
      padding:10px @spacing-large 10px 30px;
      font-size: 14px;
      font-family: Microsoft YaHei;
      cursor: pointer;
      position: relative;
      img{
        max-height:22px;
        margin-right:10px;
      }
    }
    .activeItem{
      background:#ebf1f7;
      .left-border{
        width:3px;
        height:100%;
        background-color:#0091F9;
        position:absolute;
        left: 0;
        top: 0;
      }
    }
  }
  .left-back{
    width:10px;
    height:150px;
    position: absolute;
    right: 0;
    top :39%;
    cursor: pointer;
  }
}
</style>
