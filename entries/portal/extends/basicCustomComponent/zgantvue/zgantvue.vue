<template>
  <div
    class="zgant"
    :style="gantStyle"
  >
    <div class="zgant-content">
      <div class="zgant-tool">
        <slot :name="options.toolSlot"></slot>
      </div>
      <div
        ref="zangBody"
        class="zgant-body"
        @mouseup="moveUp"
        @mouseleave="moveUp"
      >
        <div
          ref="zgantLeft"
          class="zgant-left"
        >
          <zgant-table
            ref="zgant-table"
            :colums="colums"
            :datas="dataSource"
            :options="options"
            :checked="checked"
            :gRows="rows"
            @showChild="showChild"
            @setGraphicesScrollTop="setGraphicesScrollTop"
          >
            <template
              v-for="(colum,index) in colums"
              :slot="colum.slot"
              slot-scope="record"
            >
              <slot
                :name="colum.slot"
                v-bind="record"
              ></slot>
            </template>
          </zgant-table>
          <div
            class="zgant-left-move"
            @mousedown="moveDown"
          ></div>
        </div>
        <!--        <div class="zgant-right">-->
        <!--          <zgant-graphics-->
        <!--            ref="zgant-graphics"-->
        <!--            :dataList="dataSource"-->
        <!--            :timelines="timelines"-->
        <!--            @setTableBodyScrollTop="setTableBodyScrollTop"-->
        <!--            :timeType="options.timeType"-->
        <!--            :options="options"-->
        <!--          >-->
        <!--          </zgant-graphics>-->
        <!--        </div>-->
      </div>
    </div>

  </div>
</template>

<script>
import ZgantTable from "./zgantTable";
import ZgantGraphics from "./zgantGraphics";

export default {
  name: "zgantvue",
  components: {
    // ZgantGraphics,
    ZgantTable
  },
  data() {
    return {
      moveStart: 0,
      tableWidth: 0,
      bodyWidth: 0,
      dataSource: this.getDataSource(this.dataList),
      gantStyle: {
        '--zgant-row-height': this.options.style.rowHeight,
        '--zgant-border-color': this.options.style.borderColor,
        '--zgant-table-width': this.options.tableWidth,
        '--zgant-title-background-color': this.options.style.titleBackgroundColor
      },
      rows: []
    }
  },
  props: {
    options: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {
        rowHeight: '35px',
        borderColor: '#c5c5c5',
        titleBackgroundColor: "#f8f8f8"
      }
    },
    colums: {
      type: Array
    },
    dataList: {
      type: Array
    },
    timelines: {
      type: Array
    },
    checked: {
      type: Array,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: []
    }
  },
  methods: {
    showChild(c) {
      if (c.zgant_show_child === true) {
        c.zgant_show_child = false;
      } else {
        c.zgant_show_child = true;
        this.$emit('getChildTree', c);
      }
    },

    getDataSource(l) {
      this.rows = [];
      this.initDataSource(l);
      let d = JSON.parse(JSON.stringify(l));
      return d;
    },
    initDataSource(d) {
      for (let i = 0; i < d.length; i++) {
        let item = d[i];
        this.rows.push(item);
        item.zgant_show_child = false;
        if (item.children && item.children.length > 0) {
          this.initDataSource(item.children);
        }
      }
    },
    setTableBodyScrollTop(t) {
      this.$refs['zgant-table'].setBodyScrollTop(t);
    },
    setGraphicesScrollTop(t) {
      this.$refs['zgant-graphics'].setGraphicesScrollTop(t);
    },
    moveUp() {
      this.$refs.zangBody.onmousemove = null;

    },
    moveDown(e) {
      this.tableWidth = this.$refs.zgantLeft.clientWidth;
      this.moveStart = e.screenX;
      this.bodyWidth = this.$refs.zangBody.clientWidth;
      this.$refs.zangBody.onmousemove = this.moveDo;
    },
    moveDo(e) {
      let c = this.moveStart - e.screenX;
      let tny = this.tableWidth - c;
      if (tny <= 50 || this.bodyWidth - tny <= 50) {
        return;
      }
      this.gantStyle['--zgant-table-width'] = `${tny}px`;
    }
  },
  watch: {
    dataList(n) {
      this.dataSource = this.getDataSource(n);
    }
  }
}
</script>

<style lang="less" scoped>
.zgant {
  --zgant-row-height: 35px;
  --zgant-border-color: #c5c5c5;
  --zgant-table-width: 100%;
  --zgant-title-background-color: #f8f8f8;
  width: 100%;
  height: 100%;
  position: relative;

  .zgant-content {
    width: 100%;
    height: 100%;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
  }

  .zgant-tool {
    width: 100%;
  }

  .zgant-body {
    width: 100%;
    position: relative;
    flex: 1;
  }

  .zgant-left {
    width: var(--zgant-table-width);
    height: 100%;
    border: 1px solid var(--zgant-border-color);
    position: absolute;
    top: 0;
    left: 0;
    min-width: 100%;
  }

  .zgant-right {
    width: calc(100% - var(--zgant-table-width));
    height: 100%;
    border: 1px solid var(--zgant-border-color);
    min-width: 30px;
    position: absolute;
    top: 0;
    right: 0;
  }

  .zgant-left-move {
    position: absolute;
    width: 12px;
    background-color: #e1e3e1;
    right: 0;
    top: calc(10px + var(--zgant-row-height));
    opacity: 0.25;
    cursor: ew-resize;
    bottom: 10px;
  }

  .zgant-left-move:hover {
    opacity: 0.7;
  }
}
</style>
