<template>
  <div class="editable-cell">
    <div
      class="editable-cell-text-wrapper"
      @dblclick="edit"
    >
      <span v-if="typeof value ==='string'">{{ value }}</span>
      <span v-else v-for="(item,index) in value" :key="index">
        <span>{{ item.name }}</span>
        <span v-show="value.length>1">,</span>
      </span>
      <a-icon
        v-if="cellEditable"
        type="edit"
        class="editable-cell-icon"
        @click="edit"
      />
      <a-icon
        v-if="editable && isEditable"
        type="check"
        class="editable-cell-icon-check"
        @click="check"/>
    </div>
  </div>
</template>
<script>
import { Input, Icon } from "@h3/antd-vue";

let any;
export default {
  components: {
    AIcon: Icon,
    AInput: Input,
  },
  props: {
    text: {
      type:any
    },
    cellText: String,
    type: Boolean,
    cellEditable: Boolean,
    isEditable: {
      default: true,
      type: Boolean,
    },
  },
  data() {
    return {
      value: this.text,
      editable: false,
    };
  },
  mounted() {

  },
  methods: {
    check() {
      this.editable = false;
      this.$emit("change", this.value);
    },
    edit() {
      this.editable = true;
      this.$emit("editchange");
    },
  },
  watch: {
    cellEditable: {
      handler(val) {
        this.cellEditable = val;
      },
      deep: true,
    },
  },
};
</script>
<style>
/* *, *::before, *::after {
  float:right
} */
.editable-cell {
  position: relative;
}
.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  display: none;
}

.editable-cell-icon-check {
  line-height: 28px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
</style>
