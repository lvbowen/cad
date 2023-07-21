<template>
  <div class="qy-library">
    <div class="header">
      <a-icon type="left" @click="back"/>
      <span> {{ title }}</span>
    </div>
    <a-input-search
      placeholder="请输入搜索关键词"
      size="default"
      v-model="value"
      shape="round"
      @input="onSearch"
      @search="onSearch"
    />
    <div class="file">
      <div
        v-for="(item,index) in filesDataCopy"
        :key="index"
        v-if="filesData.length"
        class="list">
        <a-icon type="credit-card" v-if="!item.fileDirFlag"/>
        <a-icon type="file-text" v-else/>
        <span> {{ item.name }}</span>
        <a-icon
          type="right"
          class="next"
          @click="next(item)"
          v-if="!item.fileDirFlag"/>
        <a-icon
          type="right"
          class="next"
          @click="searchFormDetail(item)"
          v-else/>
      </div>
      <div v-if="isResult" class="result">无结果</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import env from "@/config/env";
import { Icon, Input } from '@h3/antd-vue';
export default {
  name: "index",
  components: {
    AIcon:Icon,
    AInputSearch:Input.Search
  },
  inject: ['project'],
  data: function () {
    return {
      bimURL: `${env.apiHost}`,
      filesData: [], //目录数据
      filesDataCopy: [],
      value: '', //关键字
      title: '', //标题(文件目录名称)
      isResult: true
    }
  },
  watch: {
    '$route': {
      handler:function (n){
        if(!n.query.title){
          this.title = '文件目录'; //首次
          this.getFilesInfo(); //methods中封装的加载数据函数
        }else { //文件切文件夹，文件夹的切换
          this.title = this.$route.query.title;
          this.nodeId = this.$route.query.nodeId;
          this.getFilesInfo(this.nodeId)
        }
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    next(item) {
      this.value = '';
      let isFiles = !item.fileDirFlag; //是否文件夹
      if(isFiles) {
        this.$router.push({
          name: 'qyLibrary',
          query: {
            nodeId: item.id,
            title: item.name
          }
        })
      }else {
        this.$router.push({
          name: 'fileList',
          params: {
            title: item.name,
            id: item.id
          }
        });
      }
    },
    getFilesInfo(nodeId = '') {
      axios
        .get(this.bimURL + '/api/File/Directory/dbsTreeNode', {
          params: {
            projectCode: this.project,
            nodeId: nodeId
          }
        })
        .then(res => {
          if (res.errcode === 0) {
            this.filesData = res.data || [];
            this.filesDataCopy = res.data || [];
            if(this.filesDataCopy.length) {
              this.isResult = false;
            }
          }
        })
    },
    //前端搜索
    onSearch(val) {
      this.filesDataCopy = this.filesData.filter((item)=> {
        return item.name.indexOf(this.value) !== -1;
      })
    },
    back() {
      this.value = '';
      this.$router.go(-1);
    },
    searchFormDetail(item) {
      window.open(item.onlineViewUrl)
    }
  }
}
</script>

<style lang="less" scoped>
.qy-library {
  font-size: 4vw;
  text-align: left;
  .header {
    height: 12vw;
    line-height: 12vw;
    display: flex;
    font-size: 5vw;
    .anticon {
      display: flex;
      align-items: center;
      padding-left: 2vw;
    }
    span {
      display: inline-block;
      margin: 0 auto;
      padding-right: 2vw;
      color: #000;
      font-weight: 500;
    }
  }
  .ant-input-search {
    font-size: 4vw;
    padding: 0 5vw;
    /deep/ .ant-input {
      font-size: 4vw;
      background-color: rgba(244,244,244);
      border-radius: 0.37333333rem;
      border: none;
    }
    /deep/ .ant-input-suffix {
      display: none;
    }
  }
  .file {
    padding: 3vw 2vw 2vw 2vw;
    .list {
      background-color: white;
      padding: 2vw 3vw;
      display: flex;
      align-items: center;
      margin: 2vw;
      border-radius: 10px;
      span {
        padding-left: 2vw;
      }
      .next {
        flex: 1;
        text-align: right;
      }
    }
    .result {
      text-align: center;
    }
  }
}
</style>
