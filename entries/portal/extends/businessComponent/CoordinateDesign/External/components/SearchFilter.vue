<template>
  <div class="searchFilterWrap">
    <a-input-search
      class="search"
      v-model.trim="keywords"
      :placeholder="placeholder"
      @search="onSearch"
      enterButton
      allowClear/>
    <a-dropdown placement="bottomRight" v-model="visible" @visibleChange="visibleChange">
      <span class="iconFilter"></span>
      <template slot="overlay">
        <div class="filters">
          <a-checkbox-group class="filtersBody" v-model="selectedValues" :options="filterOptions">
          </a-checkbox-group>
          <div class="divider"></div>
          <div class="filtersFoot">
            <a-button size="small" type="link" @click="confirmFilter">确定</a-button>
            <a-button size="small" type="link" @click="resetFilter">重置</a-button>
          </div>
        </div>
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Prop, PropSync } from 'vue-property-decorator';
  import { Input,Button,Dropdown,Checkbox } from "@h3/antd-vue"
  @Component({
    name:"SearchFilter",
    components:{
      [Input.Search.name]:Input.Search,
      [Button.name]:Button,
      [Dropdown.name]:Dropdown,
      [Checkbox.Group.name]:Checkbox.Group,
      [Checkbox.name]:Checkbox,
    }
  })
  export default class SearchFilter extends Vue {
    @Prop({required:false,type:String,default:"请输入项目名称"}) placeholder!:string;
    @Prop({required:true}) filterOptions!:{label:string,value:string}[];
    @PropSync("filters",{type:Array,required:false,default:()=>[]}) syncFilters!:string[];
    keywords="";
    selectedValues:string[]=[];
    visible=false;
    mounted(){
      this.selectedValues=[...this.syncFilters];
    }
    onSearch(value:string,event:Event){
      this.$emit("search",this.keywords,event);
    }
    resetFilter(){
      this.selectedValues=[];
    }
    confirmFilter(){
      this.visibleChange(false);
      this.visible=false;
    }
    visibleChange(visible:boolean){
      if(!visible){
        this.syncFilters=[...this.selectedValues];
        this.$emit("filterChange",[...this.selectedValues]);
      }
    }
  }
</script>

<style lang="less" scoped>
.searchFilterWrap{
  width: 100%;
}
.search{
  width: calc(100% - 42px);
  margin-right: 10px;
}
.iconFilter{
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 1px solid #acacac;
  background: url("../../../../../src/assets/extends/Filtericon.png") no-repeat center;
  background-size: 120% 120%;
  background-color: #2970ff;
}
.filters{
  border-radius: 5px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  background-color: #fff;
  .filtersBody{
    display: flex;
    flex-flow: column nowrap;
    padding: 10px;
  }
  .divider{
    border-top: 1px solid #ccc;
  }
  .filtersFoot{
    padding: 10px;
  }
}
</style>
