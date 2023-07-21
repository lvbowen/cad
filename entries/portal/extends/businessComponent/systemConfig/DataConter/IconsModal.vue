<template>
  <a-modal
    :visible="showIconsModal"
    width="380px"
    class="icons-modal"
    centered
    :closable="false"
    :maskClosable="false"
    @cancel="addMenuhandleCancel"
    @ok="addMenuOk"
  >
    <!--    <div class="flex nowrap flex-center-align row">-->
    <!--      <div class="label">菜单名称:</div>-->
    <!--      <a-input v-model="addMenuName" class="flex-1"></a-input>-->
    <!--    </div>-->
    <div class="flex nowrap flex-center-align row">
      <div class="label">选择图标:</div>
      <a-select
        @change="onIconChange"
        placeholder="请选择图标"
        :value="selectIcon"
        :selectedIcon="true"
        :dropdownClassName="'select-icon-wrap'"
      >
        <a-select-option :value="icon.icon" v-for="(icon, index) in allIcons" :key="index">
          <img :src="icon.icon" />
        </a-select-option>
      </a-select>
      <a-button type="primary" @click="uploadIcon">上传</a-button>
    </div>
    <input
      class="file-input"
      ref="fileInput"
      type="file"
      accept="image/png, image/jpeg"
      @change="(e) => fileUpload(e)"
    />
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component,Prop,Watch} from 'vue-property-decorator';
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import {IconDataType} from "../type";
import {addIcon, getIcons} from "../../../service/api";

@Component({
  name: '',
  components: {
    AModal: Modal,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button
  }
})
export default class  extends Vue {
  @Prop() showIconsModal!:boolean;
  allIcons: IconDataType[] = [];
  selectIcon: string = "";
  @Watch('showIconsModal')
  showIconsModalListener(val) {
    if(val) {
      this.getIcons();
    }
  }
  getIcons() {
    getIcons().then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.allIcons = res.data;
      }
    });
  }
  addMenuhandleCancel() {
    this.$emit('closeIconsModal')
  }
  addMenuOk() {
    this.$emit('setIconValue',this.selectIcon)
  }
  onIconChange(val) {
    this.selectIcon = val;
  }

  fileUpload(e) {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileFormat = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (["png", "jpg", "jpeg"].indexOf(fileFormat) === -1)
        return this.$message.error("只能上传*.png/*.jpg/*.jpeg的图片文件!");
      if (file.size > 1024 * 20) return this.$message.error("图标大小不能超过20kb!");
      const allIconsNames = this.allIcons.map((item) => item.name);
      if (allIconsNames.includes(file.name)) return this.$message.error("已有重名文件!");
      this.$message.loading("上传图片中");
      const formData = new FormData();
      formData.append("file", file);
      addIcon(formData).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("图标上传成功");
        this.getIcons();
      });
    }
  }

  uploadIcon() {
    const { $refs } = this;
    if ($refs.fileInput) {
      ($refs.fileInput as HTMLInputElement).click();
    }
  }
}
</script>

<style scoped lang="less">
@import "../../../styles/public.module.less";
@import "../system.module.less";
.icon-img {
  width: 18px;
  height: 18px;
  background: #9cc1ec;
}
.icons-modal {
  .row {
    margin-bottom: @spacing-medium;

    .ant-btn {
      margin-left: @spacing-base;
    }
  }

  .label {
    margin-right: @spacing-base;
  }

  /deep/ .ant-select {
    width: 100%;

    img {
      .icon-img;
    }
  }

  .file-input {
    display: none;
  }
}
.ant-select-dropdown-menu-item > img {
  .icon-img;
}
</style>
