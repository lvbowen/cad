<template>
  <div class="editable-cell">
    <div
      v-if="editable && isEditable"
      class="editable-cell-input-wrapper"
    >
      <a-input
        ref="inputs"
        style="width:100px"
        :type="type ? 'number' : 'text'"
        :value="value"
        @change="handleChange"
        @pressEnter="check"
      />
      <a-icon
        type="check"
        class="editable-cell-icon-check"
        @click="check"
      />
    </div>
    <div
      v-else
      class="editable-cell-text-wrapper"
      @dblclick="edit"
    >
      <span>{{ value }}</span>
      <a-icon
        type="edit"
        class="editable-cell-icon"
        @click="edit"
      />
    </div>
  </div>
</template>
<script>
import { Input, Icon } from "@h3/antd-vue";

export default {
  components: {
    AIcon: Icon,
    AInput: Input,
  },
  props: {
    text: [String, Number],
    type: Boolean,
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
  methods: {
    handleChange(e) {
      const value = e.target.value;
      this.value = value;
    },
    check() {
      this.editable = false;
      this.$emit("change", this.value);
    },
    edit() {
      this.editable = true;
      this.$nextTick((x) => {
        if (this.$refs.inputs) {
          this.$refs.inputs.focus();
        }
      });
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
