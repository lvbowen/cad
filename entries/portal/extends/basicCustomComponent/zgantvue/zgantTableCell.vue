<template>
  <div class="zgant-table-ul">
    <div
      :class="['zgant-table-cell', `zgant-row-${dataNodeIndex}`]"
      @mouseover="onMouseOver(dataNodeIndex)"
      @mouseleave="onMouseLeave(dataNodeIndex)"
    >
      <i v-if="colum.treeColum">
        <span
          class="zgant-table-open-icon"
          v-if="dataItem"
          @click="showChild(dataItem)"
          :style="colum.treeColum? {marginLeft: 20*treeIndex + 'px'} : {}"
        >
          <svg
            v-if="dataItem.zgant_show_child === false"
            viewBox="64 64 896 896"
            data-icon="plus-square"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M328 544h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"></path>
            <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path>
          </svg>
          <svg
            v-if="dataItem.zgant_show_child === true"
            viewBox="64 64 896 896"
            data-icon="minus-square"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M328 544h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z"></path>
            <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path>
          </svg>
        </span>
        <span
          v-else
          class="zgant-table-open-icon"
          :style="colum.treeColum? {marginLeft: 20*treeIndex + 'px'} : {}"
        >
          <svg
            viewBox="64 64 896 896"
            data-icon="plus-square"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            class=""
          ></svg>
        </span>
      </i>
      <div style="display: inline-block">
        <slot
          :name="slotname"
          v-bind="dataItem"
        >
          <span v-text="dataItem[colum.dataIndex]"></span>
        </slot>
      </div>
    </div>
    <div
      class="zgant-table-ul"
      v-if="dataItem && dataItem.children && dataItem.children.length>0"
      v-show="dataItem.zgant_show_child === true"
    >
      <zgant-table-cell
        v-for="(children, index) in dataItem.children"
        :key="index"
        :colum="colum"
        :data-item="children"
        :treeIndex="treeIndex+1"
        :data-node-index="`${dataNodeIndex}__${index}`"
        :pslots="pslots"
        :slotname="slotname"
        @showChild="showChild"
      >
        <template
          :slot="slotname"
          slot-scope="record"
        >
          <slot
            :name="slotname"
            v-bind="record"
          ></slot>
        </template>
      </zgant-table-cell>
    </div>

  </div>
</template>

<script>
import zgantvue from './zgantvue'
export default {
  name: "zgantTableCell",
  data() {
    return {
      show: false,
    }
  },
  extends: zgantvue,
  props: {
    colum: {},
    dataItem: {},
    treeIndex: { type: Number },
    dataNodeIndex: {},
    pslots: { type: Object },
    slotname: { type: String, default: '' }
  },
  methods: {
    showChild(d) {
      this.$emit("showChild", d);
    },
    onMouseOver(index) {
      let nodes = document.getElementsByClassName(`zgant-row-${index}`);
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].style.backgroundColor = "#edffff"
      }
    },
    onMouseLeave(index) {
      let nodes = document.getElementsByClassName(`zgant-row-${index}`);
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].style.backgroundColor = null;
      }
    }
  },
  created() {
  }
}
</script>

<style lang="less" scoped>
.zgant-table /deep/ {
  .zgant-table-cell {
    padding: 0 15px;
    line-height: var(--zgant-row-height);
    height: var(--zgant-row-height);
    border-bottom: 1px solid var(--zgant-border-color);
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }
  .zagnt-table-colum-check .zgant-table-cell {
    padding: 0 !important;
    text-align: center !important;
  }
}
.zgant-table-open-icon {
  margin: 7px;
  position: relative;
  top: 2px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
