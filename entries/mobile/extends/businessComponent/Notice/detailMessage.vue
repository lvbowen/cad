<template>
  <!--  <div class="detail-message">-->
  <overlay :show="showMessage" @click="()=> {showMessageFn(true)}" class="detail-message">
    <div class="wrapper" v-if="message">
      <div class="block" @click.stop>
        <div style="overflow-y: scroll;max-height: 78vh;">
          <div style="margin: 0 2vw;">
            <div class="block_title">
              <div>
                <span></span>
              </div>
              <h2 @click="go2Route()">{{ message.noticeTitle }}</h2>
              <div>
                <span></span>
              </div>
            </div>
            <div class="block_time">{{ message.uploadTime }}</div>
            <p>
              {{ message.noticeContent }}
            </p>
            <div @click="()=> {showMessageFn()}" class="button">确 定</div>
          </div>
        </div>
      </div>
    </div>
  </overlay>
  <!--  </div>-->
</template>

<script lang="ts">
import {Vue, Component,Prop} from 'vue-property-decorator';
import {MyMessage} from "../../type";
import {Overlay} from "vant";
@Component({
  name: 'DetailMessage',
  components: {
    Overlay
  }
})
export default class DetailMessage  extends Vue {
  @Prop() message!: MyMessage
  @Prop() showMessage!: boolean
  showMessageFn(isModal?:boolean) {
    this.$emit('closeMessageOverlay',{url:this.message.url,isModal:isModal})
  }
  go2Route() {

  }
}
</script>

<style scoped lang="less">
.detail-message {
  z-index: 10;
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .block {
    width: 90%;
    background-color: #fff;
    border-radius: 20px;
    padding: 20px 0;

    .block_time {
      text-align: center;
      font-size: 14px;
      color: #b2b2b2;
      margin-bottom: 10px;
    }

    .block_title {
      display: flex;
      justify-content: center;

      div {
        // width: 20%;
        // min-width: 10%;
        width: 15%;
        max-width: 30%;
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
      // min-width: 40%;
      // max-width: 100%;
      font-size: 18px;
      line-height: 25px;
      font-weight: 700;
      font-family: Adobe Heiti Std;
      text-align: center;
      color: #337df7;
      margin: 0 10px;
    }

    p {
      font-family: Source Han Sans CN;
      font-size: 15px;
      letter-spacing: 2px;
      line-height: 25px;
      text-indent: 20px;
    }

    .button {
      height: 40px;
      background: #337df7;
      color: #fff;
      line-height: 40px;
      font-size: 15px;
      text-align: center;
    }
  }
}
</style>
