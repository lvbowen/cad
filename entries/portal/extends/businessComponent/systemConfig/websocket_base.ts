// @ts-ignore
import env from "@/config/env";
import Vue from 'vue';
import Component from 'vue-class-component';
@Component
export default class Websocket extends Vue{
  private path:string = "";
  private socket:any = null;
  private time: number = 0;
  private timer: any = null;
  private globalCallback: any = null;//定义外部接收数据的回调函数
  //websocket-start
  initWebsocket(projectCode:string,group:string,cb:any) {
    if(typeof(WebSocket) === "undefined"){
      alert("您的浏览器不支持socket")
    }else{
      this.globalCallback = cb;
      // console.log(this.globalCallback,'globalCallback ')
      //环境选择(必须是这两个格式形式):'https://standard.wisdombim.com.cn/api';'http://10.20.90.213/api'
      if(env.apiHost.indexOf('https')>-1) {
        this.path = `wss${env.apiHost.slice(env.apiHost.indexOf(':'),env.apiHost.indexOf('api'))}api/websocket/${projectCode}/${group}`
      }else{
        this.path = `ws${env.apiHost.slice(env.apiHost.indexOf(':'),env.apiHost.indexOf('api'))}api/websocket/${projectCode}/${group}`
      }
      console.log(this.path,'path')
      // 实例化socket
      this.socket = new WebSocket(this.path)
      // 监听socket连接
      this.socket.onopen = this.open
      // 监听socket错误信息
      this.socket.onerror = this.error
      // 监听socket消息
      this.socket.onmessage = this.getMessage
    }
  }
  open() {
    console.log('socket连接成功')
  }
  error() {
    console.log("连接错误")
  }
  getMessage(meg) {
    if(meg) {
      this.time = 0;
      this.timer = setInterval(()=> {
        if(this.time === 0.2) {
          clearInterval(this.timer)
          this.globalCallback?.(); //通知类去调用对应接口
        }
        this.time+=0.2;
        console.log(this.time,'time')
      },100)
    }
  }
  send() {
    this.socket.send(1)
  }
  close() {
    // 销毁监听
    this.socket.close()
    console.log("socket已经关闭")
  }
}
