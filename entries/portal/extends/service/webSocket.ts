export type Callback = (e: Event) => void;
export type MessageCallback<T> = (e: any) => void

/**
 * websocket 封装
 * 自动重连
 */
  // export default class MSocket {
export class Socket {
  reconnectTimer: any = null;
  heartbeatTimer: any = null;
  isAlive: boolean = false;
  config: any = {
    url: '',
    retry: Infinity,
    reconnectWait: 5 * 1000,
    heartBeatWait: 6 * 1000,
    heartMsg: 'test',
    isHeartBeat: false
  };
  socket: any = '';

  constructor(config) {
    if (!config.url) {
      throw new Error('websocket url is invalid')
    }
    this.reconnectTimer = null
    this.heartbeatTimer = null
    this.isAlive = false
    this.config = {
      url: '',
      retry: Infinity,
      reconnectWait: 5 * 1000,
      heartBeatWait: 6 * 1000,
      heartMsg: 'test',
      isHeartBeat: false
    }
    Object.keys(config).forEach(key => {
      this.config[key] = config[key]
    })
    this.init()
  }

  init() {
    this.socket = new WebSocket(this.config.url)
    this.onopen(this.config.onopen as Callback)
    this.onclose(this.config.onclose as Callback)
    this.onmessage(this.config.onopen as MessageCallback<any>)
    this.onerror(this.config.onerror as Callback)
  }

  onerror(callback: Callback): void {
    this.socket.onerror = (e) => {
      this.reconnect()
      this.isAlive = false;
      if (typeof callback === 'function') {
        callback(e)
      } else {
        typeof this.config.onerror === 'function' && this.config.onerror(e)
      }
    }
  }

  onopen(callback: Callback): void {
    this.socket.onopen = (e) => {
      console.info('websocket was opened')
      this.isAlive = true
      // if (this.config.isHeartBeat) {
      //   this.startHeart()
      // }
      if (typeof callback === 'function') {
        callback(e)
      } else {
        typeof this.config.onopen === 'function' && this.config.onopen(e)
      }
    }
  }

  onclose(callback: Callback): void {
    this.socket.onclose = (e) => {
      this.isAlive = false
      console.info('websocket was closed')
      if (typeof callback === 'function') {
        callback(e)
      } else {
        typeof this.config.onclose === 'function' && this.config.onclose(e)
      }
    }
  }

  onmessage(callback: MessageCallback<any>): void {
    this.socket.onmessage = ({data}) => {
      const res = data.indexOf('{') > -1 ? JSON.parse(data) : data;
      if (typeof callback === 'function') {
        callback(res)
      } else {
        typeof this.config.messageCb === 'function' && this.config.messageCb(res)
      }
    }
  }

  send(data) {
    if (!this.isAlive) return
    const text = typeof data === 'string' ? data : JSON.stringify(data)
    this.socket.send(text)
  }

  reconnect() {
    this.reconnectTimer = setTimeout(() => {
      if (this.config.retry > 0) {
        this.config.retry--
        this.init()
      }
    }, this.config.reconnectWait)
  }

  /** @property 销毁一个socket */
  destroy() {
    this.socket.onclose = (e) => {
      this.isAlive = false
      console.info('websocket was closed')
      typeof this.config.onclose === 'function' && this.config.onclose(e)
    }
  }

  startHeart() {
    this.heartbeatTimer = setInterval(() => {
      this.send(this.config.heartMsg)
    }, this.config.heartBeatWait)
  }
}

