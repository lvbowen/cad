<template>
  <div class="workbench">
    <div class="workbench_icon">
      <!-- <img @click="toprev" src="../../assets/images/icon.png" alt="" /> -->
      <span>个人工作台</span>
    </div>
    <component 
      class="component"
      v-for="(component, index) in components"
      :is="component"
      :key="index"
    ></component>
  </div>
</template>

<script>
import env from "@/config/env";
import workTable from "./workbenchcomponents/workTable.vue";
import projectMoment from "./workbenchcomponents/projectMoment.vue";
import schedule from "./workbenchcomponents/schedule.vue";
import safety from "./workbenchcomponents/safety.vue";
import quality from "./workbenchcomponents/quality.vue";
import payment from "./workbenchcomponents/payment.vue";
import { getCode } from "../../config/index"
import Vue from "vue";
import VueLazyload from "vue-lazyload";
Vue.use(VueLazyload);
export default {
  components: {
    workTable,
    projectMoment,
    schedule,
    safety,
    quality,
    payment
  },
  inject: [ "projectConfig" ],
  data() {
    return {
      components: [],
      projectCode:"",
    };
  },
  created(){
    this.projectCode = `${ env.project }`;
    getCode(this.projectCode).then(res=>{
      if(res.errcode!==0){
        this.$message.error(res.errmsg)
      }else{
        this.components=res.data.split(";");
      }
    })
  },
};
</script>

<style lang="less" scoped>

  .workbench {
    height: 100%;
    overflow-y: scroll;
    .workbench_data {
      display: flex;
      padding: 0 12px;
      padding-right: 0;
    }

    .workbench_icon {
        padding-left: 2px;
        font-size: 16px;
        font-weight: 700;
        color: #0a0a0a;
        margin-bottom: 10px;
        img {
          width: 19px;
          height: 19px;
          cursor: pointer;
        }
    }

    .component{
      margin-bottom: 5px;
    }
  }

  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .block {
    background-color: #fff;
    padding: 20px;
    width: 100%;

    .block_time {
      text-align: center;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .block_title {
      display: flex;
      justify-content: center;
      width: 100%;

      div {
        width: 30%;
        height: 30px;
        line-height: 20px;

        span {
          display: inline-block;
          width: 100%;
          background: rgba(51, 125, 247, 0.35);
          height: 1px;
        }
      }
    }

    h2 {
      width: 40%;
      font-size: 18px;
      font-weight: 700;
      font-family: Adobe Heiti Std;
      text-align: center;
      color: #337df7;
    }

    p {
      font-family: Source Han Sans CN;
      font-size: 15px;
      letter-spacing: 1px;
      line-height: 25px;
      margin-bottom: 20px;
      text-indent: 20px;
    }

    .button {
      height: 40px;
      background: #337df7;
      color: #fff;
      line-height: 40px;
      font-size: 15px;
      cursor: pointer;
      text-align: center;
    }
  }
</style>

<style lang="less">
.workbench {
  .el-table th > .cell {
    color: #333333;
    font-size: 15px;
  }

  .el-table th {
    padding: 8px 0;
  }

  .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  .el-dialog {
    border-radius: 12px;
  }

  .el-dialog__header {
    padding: 0 0 10px;
  }
}
</style>
<style lang="less" scoped>
@import '../../../extends/styles/public.module.less';
.comment-list {
  /deep/ .el-carousel__item {
    display: flex;
  }
  .comment-item {
    width: 20%;
  }
}
.operation {
  padding:@spacing-base @spacing-large @spacing-base @spacing-base;
  //margin-bottom: @spacing-large;
  .delete {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  /deep/ .ant-popover-inner-content {
    .flex;
    .like-box {
      margin-right: @spacing-medium;
    }
    >div {
      &:hover {
        color: #0e7fe1;
        cursor: pointer;
      }
      &:active {
        opacity: 0.8;
      }
    }
  }
}
.all-list {
  .divider-line {
    border-top: 1px solid #dcdfe6;
    margin: @spacing-base;
  }
  .inputArea {
    margin-right: @spacing-base;
    margin-bottom: @spacing-base;
    .title {
      & > div:nth-child(1) {
        font-size: 17px;
        font-weight: bold;
        color: #333333;
        margin-left:@spacing-base;
        margin-right: @spacing-base;
        &:active {
          opacity: 0.5;
        }
      }
      & > div {
        font-size: 17px;
        font-weight: bold;
        color: #3D7BFF;
        word-break: keep-all;
        cursor: pointer;
      }
    }
  }
  .base-bg {
    background-color: hsl(0deg 79% 99%);
    border-radius:10px;
    padding:@spacing-base;
    margin-bottom:1/2 * @spacing-base;
  }
  .likes-list {
    font-size: 15px;
    font-family: Source Han Sans CN;
    font-weight: 600;
    color: rgb(103, 136, 162);
    word-wrap: break-word;
    .base-bg;
    margin-top: @spacing-base;
  }
  .comments-list {
    .base-bg;
    & > article {
      padding: 5px 0;

      & > main {
        & > img {
          width: 18px;
          height: 18px;
          margin-bottom: 3px;
        }

        & > span {
          font-size: 15px;
          font-family: Source Han Sans CN;
          font-weight: 600;
          color: #666666;
          word-wrap: break-word;
        }
      }

      & > div {
        text-align: right;

      }
    }
  }
}
/deep/ .inner-dialog-class {
  border-radius: 12px;
  margin-top: 10%;
  margin-left: 121px;
  .el-dialog__body {
    height: 500px;
    overflow: auto;
  }
  .header {
    font-size: 15px;
    font-weight: bold;
  }
}
</style>
