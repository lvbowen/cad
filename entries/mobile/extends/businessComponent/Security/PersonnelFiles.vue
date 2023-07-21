<template>
  <div class="PersonnelFiles">
    <apptitle :title="'人员档案'"></apptitle>
    <div class="PersonnelFiles_search">
      <el-input placeholder="搜索" v-model="filterText"> </el-input>
    </div>
    <div class="PersonnelFiles_Tree">
      <el-tree
        class="filter-tree"
        :data="data"
        :props="defaultProps"
        defaultExpandAll
        :filterNodeMethod="filterNode"
        ref="tree"
        @node-click="treeClick"
      >
      </el-tree>
    </div>
  </div>
</template>

<script>
import apptitle from "../components/appTitle.vue";
import Tree from "element-ui/lib/tree";
import Input from "element-ui/lib/input";
import { getPersonTeamList } from "../service/index.js";
import env from "@/config/env";
export default {
  components: {
    apptitle,
    ElTree: Tree,
    ElInput: Input,
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },

  methods: {
    treeClick(val) {
      if(val.type == "person") {
        this.$router.push({
        name: 'PersonDetail',
        query: {
          id: val.id
        }
      })
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 隔行变色
    changeColor() {
      var content = document.getElementsByClassName("el-tree-node__content");
      for (var i = 0; i < content.length; i++) {
        if (i % 2 === 0) {
          content[i].style.background = "#F8F9FE";
        } else {
          content[i].style.background = "";
        }
      }
    },
  },
  inject: ["projectConfig"],
  data() {
    return {
      filterText: "",
      data: [],
      defaultProps: {
        children: "childs",
        label: "name",
      },
      projectName: "",
      projectCode: "",
    };
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    getPersonTeamList(this.projectCode, this.projectName).then((res) => {
      this.data = res.data;
    });
  },
  updated() {
    this.changeColor();
  },
};
</script>

<style lang="less" scoped>
.PersonnelFiles {
  background: #fff;
  .PersonnelFiles_search {
    padding: 15px;
  }
  .PersonnelFiles_Tree {
    padding: 0 15px;
    .el-tree {
      border: 1px solid rgba(217, 217, 217, 0.4);
    }
  }
}
</style>

<style lang="less">
.PersonnelFiles {
  .el-input__inner {
    border-radius: 28px;
    background: #f3f4f8;
    height: 30px;
    line-height: 30px;
  }
  .el-tree-node__content {
    height: 40px;
  }
}
</style>
