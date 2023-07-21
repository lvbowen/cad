<template>
  <div
    ref="san"
    class="zgant-table"
  >
    <div class="zgant-table-content">
      <div
        ref="zgantTableTitleBox"
        class="zgant-table-title-box"
        @mouseup="moveUp"
        @mouseleave="moveUp"
      >
        <div
          v-if="options.checkrow === true"
          class="zgant-table-title-check"
        >
          <input
            type="checkbox"
            @change="onCheckAll"
          ></input>
        </div>
        <div
          :ref="`colum-title-${index}`"
          v-for="(item, index) in colums"
          :key="utils.uuid(item)"
          class="zgant-table-title"
          :style="{width: item.width? item.width : '204px', textAlign: item.treeColum? 'left' : item.textAlign? item.textAlign : 'left'}"
        >
          <span v-text="item.title"></span>
          <div
            class="zgant-title-move"
            @mousedown="moveDown($event,index)"
          ></div>
        </div>
      </div>
      <div
        class="zagnt-table-body"
        ref="zgant-t-body"
        @mouseenter="setBodyScroll($event)"
        @mouseleave="delBodyScroll($event)"
      >
        <div
          v-if="options.checkrow === true"
          class="zagnt-table-colum-check"
        >
          <zgant-table-cell
            v-for="(item, index) in datas"
            :key="index"
            :treeIndex="0"
            :colum="{treeColum:false}"
            :data-item="item"
            :data-node-index="`index-${index}`"
            :options="options"
            :pslots="pslots"
            :slotname="'__zgant_check_box___'"
          >
            <template
              slot="__zgant_check_box___"
              slot-scope="record"
            >
              <input
                class="zangt-row-check-box"
                type="checkbox"
                @change="onCheck($event,record)"
              ></input>
            </template>
          </zgant-table-cell>
        </div>
        <div
          class="zagnt-table-colum"
          :ref="`colum-index-${index}`"
          v-for="(colum, index) in colums"
          :key="utils.uuid(colum)"
          :style="{width: colum.width? colum.width : '204px',textAlign: colum.treeColum? 'left' : colum.textAlign? colum.textAlign : 'left'}"
        >
          <zgant-table-cell
            v-for="(item, index) in datas"
            :key="utils.uuid(item)"
            :treeIndex="0"
            :data-item="item"
            :colum="colum"
            :data-node-index="`index-${index}`"
            :options="options"
            :pslots="pslots"
            :slotname="colum.slot"
            @showChild="showChild"
          >
            <template
              :slot="colum.slot"
              slot-scope="record"
            >
              <slot
                :name="colum.slot"
                v-bind="record"
              ></slot>
            </template>
          </zgant-table-cell>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ZgantTableCell from "./zgantTableCell";
import Utils from "../../utils";

export default {
  name: "zgantTable",
  components: { ZgantTableCell },
  data() {
    return {
      moveCheckIndex: null,
      oldWidth: 0,
      startIndex: 0,
      //utils
      utils:Utils
    }
  },
  props: {
    options: {
      type: Object
    },
    colums: {
      type: Array
    },
    datas: {
      type: Array
    },
    pslots: {
      type: Object
    },
    checked: {
      type: Array
    },
    gRows: {
      type: Array,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: []
    }
  },
  methods: {
    showChild(c) {
      this.$emit('showChild', c);
    },
    onCheck(e, d) {
      let _this = this;
      if (e.target.checked === true) {
        this.checked.push(d)
      } else {
        _this.checked.splice(d, 1);
        let s = [];
      }
    },
    onCheckAll(e) {
      let rows = document.getElementsByClassName('zangt-row-check-box');
      this.checked.splice(0, this.checked.length);
      console.log(this.gRows)
      if (e.target.checked === true) {
        for (let i in this.gRows) {
          this.checked.push(this.gRows[i]);
        }
      }
      for (let i = 0; i < rows.length; i++) {
        rows[i].checked = e.target.checked;
      }
    },
    setBodyScrollTop(t) {
      this.$refs['zgant-t-body'].scrollTop = t;
    },
    setBodyScroll(e) {
      e.target.onscroll = this.setGraphicesScrollTop;
    },
    delBodyScroll(e) {
      e.target.onscroll = null;
    },
    setGraphicesScrollTop(e) {
      this.$emit("setGraphicesScrollTop", e.target.scrollTop);
    },
    moveDown(e, i) {
      this.moveCheckIndex = i;
      console.log(this.$refs[`colum-title-${i}`][0]);
      this.oldWidth = this.$refs[`colum-title-${i}`][0].clientWidth;
      this.startIndex = e.screenX;
      this.$refs.zgantTableTitleBox.onmousemove = this.moveDo;

    },
    moveUp(e) {
      let t = `colum-title-${this.moveCheckIndex}`;
      this.$refs.zgantTableTitleBox.onmousemove = null;
      this.moveCheckIndex = null;
    },
    moveDo(e) {

      let c = this.startIndex - e.screenX;
      let tny = this.oldWidth - c;
      if (tny <= 45) {
        return;
      }
      this.$refs[`colum-title-${this.moveCheckIndex}`][0].style.width = `${tny}px`;
      this.$refs[`colum-index-${this.moveCheckIndex}`][0].style.width = `${tny}px`;
    }
  },
}
</script>

<style lang="less" scoped>

  *{
    box-sizing: border-box;
  }

  .zgant /deep/ {

    .zgant-table{
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      .zgant-table-content{
        width: auto;
        white-space:nowrap;
        position: relative;
        height: 100%;
      }
      .zagnt-table-colum{
        border-right: 1px solid var(--zgant-border-color);
        display: inline-block;
        position: relative;
        .zgant-table-cell{
          border-bottom: 1px solid var(--zgant-border-color);
        }
      }
      .zagnt-table-colum-check{
        border-right: 1px solid var(--zgant-border-color);
        display: inline-block;
        width: calc(10px + var(--zgant-row-height));
        position: relative;
      }
      .zgant-table-title-box{
        min-width: 100%;
        display: inline-block;
        height: calc(10px + var(--zgant-row-height));
        white-space:nowrap;
        background-color: var(--zgant-title-background-color);
        border-bottom: 1px solid var(--zgant-border-color);
        .zgant-table-title{
          height: 100%;
          line-height: calc(10px + var(--zgant-row-height));;
          padding: 0 15px;
          border-right: 1px solid var(--zgant-border-color);
          display: inline-block;
          position: relative;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
        }
        .zgant-table-title-check{
          height: 100%;
          line-height: calc(10px + var(--zgant-row-height));;
          border-right: 1px solid var(--zgant-border-color);
          display: inline-block;
          text-align: center;
          width: calc(10px + var(--zgant-row-height));
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
        }
      }
      .zgant-title-move{
        height: 100%;
        width: 12px;
        position: absolute;
        top: 0;
        right: 0;
        background-color: #e1e3e1;
        cursor: ew-resize;
        opacity: 0.15;

      }
      .zgant-title-move:hover{
        opacity: 0.7;
      }
      .zagnt-table-body{
        min-width: 100%;
        position: absolute;
        top: calc(10px + var(--zgant-row-height));;
        bottom: 0;
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
    .zagnt-table-body::-webkit-scrollbar{
      width:0;
    }
    .zangt-row-check-box{
      position: relative;
    }

  }






</style>
