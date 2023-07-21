<template>
  <div>
    <!--    <img @click="toprev" src="../../icon.png" alt="">-->
    <span>选择项目</span>
    <div>
      <div class="chooseProject">
        <el-scrollbar style="height: 100%">
          <p
            @click="rowClick(item)"
            v-for="(item, index) in tableData"
            :key="index"
          >
            {{ item }}
          </p>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script>
import { getProjectName } from "./serve/index.js";
import env from "@/config/env";
export default {
  data() {
    return {
      tableData: [],
      projectCode: "",
    };
  },
  mounted() {
    this.projectCode = `${env.project}`;
    getProjectName(this.projectCode).then((res) => {
      this.tableData = res.data;
    });
  },
  methods: {
    toprev(){
      this.$router.go(-1)
    },
    rowClick(val) {
        this.$router.push({
          name: "progressAnalysis",
          query: { projectName: val, parentId:this.$route.query.parentId },
        });
    },
  },
};
</script>

<style lang="less" scoped>
img{
  cursor: pointer;
}
.chooseProject {
  background: #fff;
  width: 100%;
  height: 833px;
  padding: 10px;
  p {
    cursor: pointer;
    height: 44px;
    line-height: 44px;
    text-align: center;
    font-size: 15px;
  }
  p:hover {
    background: #f5f7fa;
  }
}
</style>
