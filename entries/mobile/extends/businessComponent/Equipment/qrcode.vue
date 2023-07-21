<template>
  <div class="qrcode">
    <div class="code">
      <!-- decode是扫描结果的函数，torch用于是否需要打开手电筒，init用于检查该设备是否能够调用摄像头的权限，camera可用于打开前面或者后面摄像头  -->
      <qrcode-drop-zone @decode="onDecode">
        <qrcode-stream @decode="onDecode" :torch="torchActive" @init="onInit" :camera="camera" />
      </qrcode-drop-zone>
      <div class="code-button" @click="turnCameraOff">关闭相机</div>
    </div>
  </div>
</template>

<script>
// 引用vue-qrcode-reader插件
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'

export default {
  name: 'Approve',
  props: {
    camera: {
      type: String,
      default: 'rear',
    },
    torchActive: {
      type: Boolean,
      default: false,
    },
    qrcode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  created() {},

  components: {
    // 注册组件
    QrcodeStream,
    QrcodeDropZone,
    QrcodeCapture,
  },
  methods: {
    // 扫码结果回调
    onDecode(result) {
      this.$emit('onDecode', result)
    },
    // 关闭相机？？？？？？
    turnCameraOff() {
      this.$emit('turnCameraOff')
    },
    // 检查是否调用摄像头
    onInit(promise) {
      this.$emit('onInit', promise)
    },
  },
}
</script>

<style lang="less" scoped>
.code-button {
  margin-bottom: 20px;
  background: #1989fa;
  height: 35px;
  line-height: 35px;
  color: #fff;
}
</style>