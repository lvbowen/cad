<template>
  <div class="all-application">
    <!--<ListPanel />-->
    <div class="header flex-center-align">
      <Icon name="arrow-left" @click="$router.go(-1)"/>
      <div>全部应用</div>
    </div>
    <div class="content-t">
      <div class="commonly-used">
        <div class="flex-justify-between full-width in">
          <div>常用应用</div>
          <Button type="primary" shape="round" @click="edit()">保存</Button>
        </div>
        <div class="select" v-if="commonAppsArr.length">
          <Row v-for="(i,index) in commonAppsArr" :key="index" class="select-row">
            <Col :span="6" v-for="(item,key) in i" :key="key">
            <div class="inner" :style="{backgroundColor:`${imgBC[key%4]}`}" @click="deleteApp(item.id,index,key)"><img :src="item.icon" v-if="item.icon && item.icon.indexOf('base64')>-1"/><img v-else src="../../Img/mo.png"/><img src="../../Img/clear-app.png" class="app" alt=""/></div>
            <div class="line-height">{{ item.name }}</div>
            </Col>
          </Row>
        </div>
        <div v-else class="blank">
          <img src="../../Img/blank.png"/>
          <p>将常用的应用添加到此处</p>
        </div>
      </div>
      <Divider class="small">以上应用展示在业务页面</Divider>
      <Divider />
      <div class="all">
        <div class="flex-justify-between full-width title">
          <div>全部应用</div>
        </div>
        <div class="select" v-if="appArr.length">
          <Row v-for="(i,index) in appArr" :key="index" class="select-row">
            <Col :span="6" v-for="(item,key) in i" :key="key">
            <div class="inner" :style="{backgroundColor:`${imgBC[key%4]}`}" @click="addApp(item,index,key)"><img :src="item.icon" v-if="item.icon && item.icon.indexOf('base64')>-1"/><img v-else src="../../Img/mo.png"/><img src="../../Img/add-app.png" class="app" v-show="!item.published"/></div>
            <div class="line-height">{{ item.name }}</div>
            </Col>
          </Row>
        </div>
        <div v-else class="blank">
          <img src="../../Img/blank.png"/>
          <p>暂无应用</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Vue,Component} from 'vue-property-decorator';
import { Icon,Search,Divider,Row,Col,Notify } from 'vant';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import AntIcon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import {getCommonApps, getAllApps, editEntryData} from "../../service/business";
import env from '@/config/env';
@Component({
  name:'editAllApplication',
  components: {
    Icon,
    Search,
    Button,
    Divider,
    Row,
    Col,
    AntIcon
  }
})
export default class EditAllApplication extends Vue {
  searchVaule: String = '';
  commonAppsArr: Array<any> = [];
  allApps:Array<any> = [];
  addAppList:Array<any> = [];
  appArr:Array<any> = [];
  imgBC: Array<String> = ['#4798FF','#F99341','#19BE6C', '#FFA800', '#545EEC', '#0999F0'];
  async edit() {
    const params = {
      folder: 1, //app入口
      projectCode: env.project,
      quickEntryBaseCmdList: []
    };
    let arr = this.commonAppsArr.flat();
    arr.map((item) => {
      params.quickEntryBaseCmdList.push({
        //@ts-ignore
        appFunctionId: item.id,
        //@ts-ignore
        code: item.code,
        //@ts-ignore
        codeName: item.name,
        //@ts-ignore
        type: item.type
      })
    })
    //@ts-ignore
    const {data, errcode, errmsg} = await editEntryData(params);
    if (errcode === 0) {
      Notify({type: 'success', message: '保存成功',duration:1500});
      setTimeout(()=> {
        this.$router.go(-1);
      },1500)
    } else {
      Notify({type: 'warning', message: `${errmsg}`});
    }
  };
  addApp(item,index,key) {
    if (item.published) return Notify({type:'warning',message:'已添加，请重新选择！'});
    this.$set(this.appArr[index][key],'published',true);
    let arr = this.commonAppsArr.flat();
    //@ts-ignore
    this.commonAppsArr = this.fakePagination(arr.concat(item))
  };
  deleteApp(id,index,key) {
    this.commonAppsArr[index].splice(key,1);
    //@ts-ignore
    this.commonAppsArr = this.fakePagination(this.commonAppsArr.flat());
    this.appArr.flat().map((item)=> {
      if(item.id === id) {
        this.$set(item,'published',false);
      }
    })
  };
  async getCommonApps() {
    //@ts-ignore
    const {data, errcode, errmsg} = await getCommonApps({projectCode: env.project, isMobile: true});
    if(errcode === 0) {
      if(data && Array.isArray(data) && data.length)  this.commonAppsArr = this.fakePagination(data);
    }else {
      this.$message.error(errmsg)
    }
  }
  async getAllApps() {
    //@ts-ignore
    const {data, errcode, errmsg} = await getAllApps({projectCode: env.project, isMobile: true});
    if(errcode === 0) {
      if(data && Array.isArray(data) && data.length)  this.appArr = this.fakePagination(data);
    }else {
      this.$message.error(errmsg)
    }
  };
  //分组处理
  fakePagination(data:any=[]) {
    let minArr = []; //小数组
    const maxArr = [];
    data.forEach((c) => {
      // 小数组有4条数据，生成一个新数组
      if (minArr.length === 4) {
        minArr = [];
      }
      // 小数组满4条数据，放进大数组内
      if (minArr.length === 0) {
        //@ts-ignore
        maxArr.push(minArr);
      }
      //@ts-ignore
      minArr.push(c);
    });
    return maxArr;
  };
  mounted() {
    this.getCommonApps();
    this.getAllApps();
  }
}
</script>

<style scoped lang="less">
@import '~@/styles/mixins.less';
@import '~@/styles/common.less';
.all-application {
  height: inherit;
  .px2rem(padding-bottom,60);
  .header {
    .px2rem(padding, @spacing-large);
    color: @font-color-base;
    .px2rem(font-size, 32);
    background-color: #004898;
    .px2rem(height, 88px);

    > div {
      margin: 0 auto;
      font-weight: bold;
    }
  }
  .content-t {
    overflow: auto;
    height: inherit;
    background-color: @font-color-base;
    .px2rem(padding, @spacing-large);
    //.px2rem(margin, @spacing-base);
    .commonly-used {
      .px2rem(margin-top,@spacing-base);
      .px2rem(margin-bottom,@spacing-base);
      .in {
        color: @font-color-weight;
        .px2rem(font-size, @font-size-medium + 2);
        font-weight: bold;
        .px2rem(margin-bottom,@spacing-large);
      }
      .select {
        .select;
      }
    }
    .small {
      .px2rem(font-size,@font-size-small);
    }
    .all {
      .title {
        color: @font-color-weight;
        .px2rem(font-size, @font-size-medium + 2);
        font-weight: bold;
        .px2rem(margin-bottom,@spacing-large);
      }
      .select {
        .select;
      }
    }
    .select {
      text-align: left;
      .select-row {
        text-align: center;
        color: #666666;
        .px2rem(margin-bottom,@spacing-large);
        .inner {
          display: inline-block;
          border-radius: 10px;
          position: relative;
          .px2rem(margin-bottom,@spacing-base);
          > img {
            display: inline-block;
            .px2rem(width, 50);
            .px2rem(height, 50);
            .px2rem(margin, @spacing-base)
          }
          > .app {
            position: absolute;
            .px2rem(font-size,@font-size-large);
            .px2rem(right,-30px);
            .px2rem(top,-30px);
            .px2rem(width, 40);
            .px2rem(height, 40);
          }
        }
        .line-height {
          line-height: 1.3;
        }
      }
    }
  }
  /deep/ .van-search__content {
    border-radius: 30px;
  }
  .blank {
    color: #8D8C8C;
    p {
      .px2rem(margin-top, 20);
      .px2rem(margin-bottom, 20);
    }
    img {
      width: 50%;
    }
  }
}
</style>
