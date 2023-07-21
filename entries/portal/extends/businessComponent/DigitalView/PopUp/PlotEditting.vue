<template>
  <article class="editting-main">
    <!--    <vue-drag-resize :isResizable="false" :parentLimitation="false" @activated="onActivated">-->
    <div class="editting-container">
      <div class="navigation">
        <div
          v-for="(v,i) in naviList"
          class="navi-btn"
          :key="i"
          :class="v.name===naviChoose.name?'navi-hover':''"
          @click="()=>{naviChoose=v}">
          <span>{{ v.name }}</span>
        </div>
      </div>
      <div class="editting-detail" v-if="naviChoose.name==='模型属性'">
        <div>
          <span>标注标签:</span>
          <a-input size="small" :value="symbolName" @change="changeData($event,'symbolName')"></a-input>
        </div>
        <div>
          <span>显示标签:</span>
          <a-switch :checked="optionConfig.isShowIcon" @change="changeData($event,'isShowIcon')"/>
        </div>
        <div>
          <span>缩放比例:</span>
          <a-input-number
            size="small"
            :step="0.1"
            v-model="optionConfig.scale"
            @change="changeData($event,'scale')"></a-input-number>
        </div>
        <div>
          <span>可视距离:</span>
          <a-input-number
            style="width: 80px"
            :disabled="true"
            size="small"
            v-model="optionConfig.distanceDisplayCondition['_near']"
            @change="changeData($event,'_near')"></a-input-number>
          <span style="width: 20px"> ~</span>
          <a-input-number
            style="width: 80px"
            size="small"
            v-model="optionConfig.distanceDisplayCondition['_far']"
            @change="changeData($event,'_far')"></a-input-number>
        </div>
        <div>
          <span>字体颜色:</span>
          <a-input
            style="width: 35px"
            size="small"
            type="color"
            :key="fillColor"
            :value="fillColor"
            @change="changeData($event,'fillColor')"></a-input>
        </div>
        <div>
          <span>字体大小:</span>
          <a-input-number
            :step="0.1"
            size="small"
            v-model="optionConfig.fontStyle.fontSize.split('px')[0]"
            @change="changeData($event,'fontSize')"></a-input-number>
          <span>px</span>
        </div>
        <div class="flex-center-justify" style="margin-top: 20px">
          <a-button type="primary" @click="updateSymbolList">保存</a-button>
          <a-button style="margin-left: 30px" @click="closeEdit">取消</a-button>
        </div>
      </div>
      <div class="editting-detail" v-if="symbolName.length!==0&&naviChoose.name==='表单信息'">
        <div style="margin-bottom: 0">
          <span>标注资源类型:</span>
          <a-select
            size="small"
            :value="resourceChoose"
            style="width: 120px"
            @change="changeResource">
            <a-select-option value="resource_media">
              关联资源
            </a-select-option>
            <a-select-option value="resource_video">
              关联视频
            </a-select-option>
          </a-select>
        </div>
        <div v-if="resourceChoose==='resource_media'">
          <quill-editor
            v-model="content"
            ref="myQuillEditor"
            :options="editorOption"
            @change="onEditorChange">
          </quill-editor>
          <div style="margin-top: 10px">
            <a-upload-dragger
              name="file"
              :defaultFileList="defaultFileList"
              :multiple="true"
              :data="dataContract"
              :action="uploadUrl"
              @change="uploadFile"
              :remove="removeFile"
            >
              <p class="ant-upload-drag-icon">
                <a-icon type="inbox"/>
              </p>
              <p class="ant-upload-text">
                点击或拖拽到此处上传
              </p>
            </a-upload-dragger>
          </div>
        </div>
        <div v-if="resourceChoose==='resource_video'">
          <div class="resouce-detail">
            <span>视频类型:</span>
            <a-radio-group v-model="videoParam.videoType" @change="changeVideoParams($event,'videoType')">
              <a-radio :value="1">监控参数</a-radio>
              <a-radio :value="2">视频地址</a-radio>
            </a-radio-group>
          </div>
          <div v-if="videoParam.videoType===1" class="resouce-detail">
            <span>设备序列号:</span>
            <a-input size="small" :value="videoParam.deviceSn" @change="changeVideoParams($event,'deviceSn')"></a-input>
          </div>
          <div v-if="videoParam.videoType===1" class="resouce-detail">
            <span>设备通道号:</span>
            <a-input size="small" :value="videoParam.deviceChannel" @change="changeVideoParams($event,'deviceChannel')"></a-input>
          </div>
          <div v-if="videoParam.videoType===1" class="resouce-detail">
            <span>设备账号:</span>
            <a-input size="small" :value="videoParam.appKey" @change="changeVideoParams($event,'appKey')"></a-input>
          </div>
          <div v-if="videoParam.videoType===1" class="resouce-detail">
            <span>设备秘钥:</span>
            <a-input size="small" :value="videoParam.secret" @change="changeVideoParams($event,'secret')"></a-input>
          </div>
          <div v-if="videoParam.videoType===2" class="resouce-detail">
            <span>视频地址:</span>
            <a-input size="small" :value="videoParam.videoUrl" @change="changeVideoParams($event,'videoUrl')"></a-input>
          </div>
        </div>
        <div style="position: absolute;bottom: 10px;text-align: center;width:300px">
          <a-button type="primary" @click="saveSymbolListSelfMsg">保存</a-button>
          <a-button style="margin-left: 30px" @click="closeEdit">取消</a-button>
        </div>
      </div>
    </div>
    <p class="close-png" @click="closeEdit">X</p>
    <!--    </vue-drag-resize>-->
  </article>
</template>

<script lang="ts">
/// <reference path="../../../../src/typings/shims-tsx.d.ts" />
import {Component, InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";
import VueDragResize from "vue-drag-resize";
import env from "@/config/env";
import * as Api from "../../../service/modelInterface";
import Input from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import InputNumber from "ant-design-vue/lib/input-number";
import "ant-design-vue/lib/input-number/style/index.css";
import Switch from "ant-design-vue/lib/switch";
import "ant-design-vue/lib/switch/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import Upload from "ant-design-vue/lib/upload";
import "ant-design-vue/lib/upload/style/index.css";
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style/index.css";
import Radio from "ant-design-vue/lib/radio";
import "ant-design-vue/lib/radio/style/index.css";
import {Quill, quillEditor} from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";

@Component({
  name: "PlotEditting",
  components: {
    VueDragResize, quillEditor, AInput: Input, AInputNumber: InputNumber,
    ASwitch: Switch, AButton: Button, ASelect: Select, ASelectOption: Select.Option,
    AUploadDragger: Upload.Dragger, AIcon: Icon, ARadioGroup: Radio.Group, ARadio: Radio
  },
})
export default class PlotEditting extends Vue {
  @InjectReactive('project') projectCode!: string;

  @Prop() private detailChoose!: { [propsName: string]: any };
  @Prop() private projectName!: string;

  //导航栏
  naviList: Array<{ name: string, value: string }> = [
    {name: '模型属性', value: 'Model_Property'},
    /*    {name: '绘制点线面', value: 'DRAW_GEOMETRIC_PLANE'},
        {name: '绘制模型', value: 'DRAW_SYMBOL'},*/
    {name: '表单信息', value: 'Form_Information'},
  ];
  naviChoose: { name: string, value: string } = {name: '模型属性', value: 'Model_Property'};

  //模型属性
  optionConfig: { [propsName: string]: any } = {
    width: "52px",
    height: "52px",
    distanceDisplayCondition: {
      _near: 0,
      _far: 8400
    },
    isShowIcon: true,
    color: {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1
    },
    scale: 1,
    rotation: 0,
    fontStyle: {
      fontSize: "30px",
      fillColor: {
        red: 1,
        green: 0,
        blue: 0,
        alpha: 1
      }
    },
    scaleByDistance: {
      near: 0,
      nearValue: 1,
      far: 6000,
      farValue: 1.2
    },
    verticalOrigin: 1
  };
  symbolName: string = '';
  color: string = '';
  fillColor: string = '';

  //表单信息
  isEdit: boolean = false;
  content: string = "";
  resourceChoose: string = 'resource_media';
  editorOption: any = {
    modules: {
      toolbar: [
        [{size: ["small", false, "large", "huge"]}],
        [{color: []}, "link"],
        ["bold", "italic", "underline"],
        [{align: ""}, {align: "center"}, {align: "right"}]
      ]
    },
    placeholder: "在此插入文本"
  };
  uploadUrl: string = `${env.apiHost}/bim/symbol/uploadFile`
  dataContract: { [propsName: string]: string } = {
    appCode: '',
    symbolId: "",
    fileType: 'file'
  };
  defaultFileList: Array<{ [propsName: string]: string }> = [];
  videoParam: { [propsName: string]: string | number } = {
    appKey: '',//设备账号
    deviceChannel: '',//通道号
    deviceSn: '',//序列号
    secret: '',//秘钥
    videoUrl: '',//视频链接
    videoType: 1,
    id:'',
    symbolId:'',
    symbolName:'',
    symbolType:'video_monitor'
  };

  mounted() {
    if(!this.detailChoose.modelName||this.detailChoose.modelName.length===0){
      this.symbolName = this.detailChoose.symbolName;
    }else{
      this.symbolName = this.detailChoose.modelName;
    }
    this.dataContract = {
      appCode: this.projectCode,
      symbolId: this.detailChoose.id,
      fileType: 'file'
    };
    if (this.detailChoose.optionConfig) {
      this.optionConfig = JSON.parse(this.detailChoose.optionConfig);
      const colorList = this.optionConfig.fontStyle.fillColor;
      const color = 'rgb(' + colorList.red + ',' + colorList.green + ',' + colorList.blue + ')'
      this.fillColor = this.setRgbTo16(color) ?? "";
      console.log('this.optionConfig',color,this.fillColor)
    }
    this.getSymbolListSelfMsg();
  }

  /*  onActivated() {
      //@ts-ignore
      this.$nextTick((_: any) => {
        //@ts-ignore
        this.$refs.groupName.$refs.input.focus();
      });
    }*/

  changeData(e, v?) {
    if (v === 'isShowIcon') return this.optionConfig[v] = e;
    if (v === 'scale') return this.optionConfig[v] = e;
    if (v === 'fontSize') return this.optionConfig.fontStyle.fontSize = String(e) + 'px';
    if (v === '_near' || v === '_far') return this.optionConfig.distanceDisplayCondition[v] = e;
    const value = e.target.value;
    if (v === 'color') {
      this.color = value;
      const colorTemp: string[] = this.olorRgb(value).split(',');
      this.optionConfig.color = {
        red: Number(colorTemp[0].split('ba(')[1]),
        green: Number(colorTemp[1]),
        blue: Number(colorTemp[2].split(')')[0]),
        alpha: 1
      };
    } else if (v === 'fillColor') {
      this.fillColor = value;
      const colorTemp: string[] = this.olorRgb(value).split(',');
      this.optionConfig.fontStyle.fillColor = {
        red: Number(colorTemp[0].split('ba(')[1]),
        green: Number(colorTemp[1]),
        blue: Number(colorTemp[2].split(')')[0]),
        alpha: 1
      };
    } else if (v === 'symbolName') {
      this.symbolName = value;
      this.detailChoose.modelName = value;
    }
  }

  changeResource(e) {
    console.log('changeResource', e);
    this.resourceChoose = e;
  }

  changeVideoParams(e,v) {
    this.videoParam[v]=e.target.value;
  }

  closeEdit() {
    this.$emit('closeEdit');
  }

  getSymbolListSelfMsg() {
    Api.getSymbolListSelfMsg({
      appCode: this.projectCode,
      symbolId: this.detailChoose.id
    }).then(res => {
      if (!res.data) return;
      if(res.data?.symbolType){
        this.resourceChoose=res.data?.symbolType.indexOf('video')!==-1?'resource_video':'resource_media';
      }
      if(this.resourceChoose==='resource_video'){
        this.videoParam= {
          appKey: res.data?.appKey??'',//设备账号
          deviceChannel: res.data?.deviceChannel??'',//通道号
          deviceSn: res.data?.deviceSn??'',//序列号
          secret: res.data?.secret??'',//秘钥
          videoUrl: res.data?.videoUrl??'',//视频链接
          videoType: res.data?.videoType??1,
          id:res.data?.id??this.detailChoose.id,
          symbolId:res.data?.symbolId??this.detailChoose.id,
          symbolName:res.data?.symbolName??this.detailChoose.sybolName,
          symbolType:'video_monitor'
        };
      }
      this.defaultFileList = res.data?.allAttachments?.file ?? [];
      this.content = res.data?.symbolDescribe ?? '';
      this.defaultFileList.forEach((item, i) => {
        this.defaultFileList[i].uid = item.fileId;
        this.defaultFileList[i].url = item.downloadUrl
        this.defaultFileList[i].status = 'done';
      })
    })
  }

  //十六进制转rgb
  olorRgb(color) {
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    let sColor = color.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      let sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        //@ts-ignore
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      return "rgba(" + sColorChange.join(",") + ")";
    } else {
      return sColor;
    }
  }

  // // 失去焦点事件
  // onEditorBlur(quill) {
  //   console.log('editor blur!', quill)
  // }
  //
  // // 获得焦点事件
  // onEditorFocus(quill) {
  //   console.log('editor focus!', quill)
  // }
  //
  // // 准备富文本编辑器
  // onEditorReady(quill) {
  //   console.log('editor ready!', quill)
  // }

  // 内容改变事件
  onEditorChange({quill, html, text}) {
    this.content = html
  }

  removeFile(file) {
    Api.deleteFile({
      appCode: this.projectCode,
      symbolId: this.detailChoose.symbolId as string,
      refId: file.fileId as string
    }).then(res => {
      console.log('removeFile', res.data);
      if (res.data) return this.$message.success('删除附件成功！');
      this.$message.warn('删除附件失败！')
    })
  }

  saveSymbolListSelfMsg() {
    const resourceMedia={
      symbolId: this.detailChoose.id,//这个接口symbolId和id保持一致（不知为啥）
      symbolName: this.detailChoose.symbolName,
      symbolType: "normal",
      id: this.detailChoose.id,
      symbolDescribe: this.content
    };
    this.videoParam.id = this.detailChoose.id;
    this.videoParam.symbolName = this.detailChoose.symbolName;
    this.videoParam.symbolId = this.detailChoose.id;//这个接口symbolId和id保持一致（不知为啥）
    //标注资源类型不同，参数不同
    const symbolListSelfMsg=this.resourceChoose==='resource_media'?resourceMedia:this.videoParam;
    Api.saveSymbolListSelfMsg({
      appCode: this.projectCode,
      symbolListSelfMsg: symbolListSelfMsg
    }).then(res => {
      if (res.data) return this.$message.success('保存成功！')
      return this.$message.error('保存失败！')
    })
  }

  //将rgb的转换为16进制
  setRgbTo16(str) {
    let reg = /^(rgb|RGB)/;
    if (!reg.test(str)) {
      return;
    }
    const arr = str.slice(4, str.length - 1).split(",")
    let color = '#';
    for (let i = 0; i < arr.length; i++) {
      let t = Number(arr[i]).toString(16)
      console.log('t',t,reg,Number(arr[i]))
      if(Number(arr[i])<16){//小于16 ，需补0
        t = "0"+t;
      }
      if (t == "0") {   //如果为“0”的话，需要补0操作,否则只有5位数
        t = t + "0"
      }
      color += t;
    }
    return color;
  }

  uploadFile(info) {
    console.log('uploadFile', info)
    // this.dataContract.fileType=info.file.type
    const status = info.file.status;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      this.$message.success(`${info.file.name}上传成功！`);
    } else if (status === 'error') {
      this.$message.error(`${info.file.name}上传失败！`);
    }
  }

  updateSymbolList() {
    this.detailChoose.optionConfig = JSON.stringify(this.optionConfig);
    this.detailChoose.modelName = this.symbolName;
    this.detailChoose.projectName=this.projectName
    Api.updateSymbolList({
      appCode: this.projectCode,
      symbolList: [this.detailChoose]
    }).then(res => {
      if (res.errcode !== 0) return this.$message.success('属性更新失败');
      this.closeEdit();
      return this.$message.success('属性更新成功');
    })
  }
}
</script>

<style lang="less" scoped>
@import "../../../styles/antd.less";
@import "../../../styles/public.module.less";

/*.vdr.active:before {
  outline: 0px;
}*/

.editting-main {
  position: absolute;
  top: 20px;
  left: 850px;
  z-index: 9;

  .editting-container {
    .flex-column;
    width: 360px;
    height: 550px;
    padding: 10px 20px;
    background: url("../../../../src/assets/extends/cim/drawonline/kuang4.png");
    background-size: 100% 100%;

    .navigation {
      .flex;
      margin-right: 10px;

      .navi-btn {
        .flex;
        height: 30px;
        width: 110px;
        line-height: 30px;
        justify-content: center;
        margin: 6px;
        background: url("../../../../src/assets/extends/cim/drawonline/btn1.png");
        background-size: 100% 100%;
        cursor: pointer;

        & > span {
          color: #c9d5d7;
        }
      }

      .navi-hover {
        background: url("../../../../src/assets/extends/cim/drawonline/btn1-light.png");
        background-size: 100% 100%;

        & > span {
          color: #00bcd4;
        }
      }
    }

    .editting-detail {
      .flex-column;
      width: 320px;
      height: 500px;
      overflow: auto;
      padding: 10px 20px;

      & > div {
        //.flex;
        width: 100%;
        margin-bottom: 10px;

        & > .resouce-detail {
          .flex;
          width: 100%;
          margin-bottom: 10px;

          & > span {
            width: 80px;
            color: #fff
          }
        }

        & > span {
          //width: 80px;
          margin-right: 20px;
          color: #fff
        }
      }

      .quill-editor {
        background: #fff;
      }

      /deep/ .ql-container {
        height: 80px;
        overflow-y: auto;
      }

      /deep/ .ant-upload {
        height: 130px;
      }

      /deep/ .ant-upload-list {
        height: 100px;
        overflow-y: auto;
        color: #fff;
      }

      /deep/ .ant-radio-wrapper {
        color: #fff
      }

      /deep/ .ant-input-sm {
        width: 150px;
      }

      /deep/ .ant-input-number-sm {
        width: 150px;
      }
    }
  }

  .close-png {
    color: #fff;
    z-index: 11;
    position: absolute;
    top: 20px;
    right: 30px;
    cursor: pointer;
  }
}
</style>
