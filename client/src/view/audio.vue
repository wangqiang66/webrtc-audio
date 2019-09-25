<template>
  <div class="audio-container">
    <common-graph-line v-if="kind === 0" :data="result" style="position: absolute; top: 0; left: 0; z-index: -1"></common-graph-line>
    <template v-if="!connect">
      <div v-if="kind === 1" class="flex1 row full-height flex-center flex-middle" style="padding-bottom: 20%">
        <p v-if="serverNum === 0">对不起，你来晚了，客户已经下班，请明天在试</p>
        <p v-else-if="pos === 0">客服正在接入中，请耐心等待</p>
        <p v-else-if="pos === -1">接入失败，请重新尝试</p>
        <p v-else>您的前面还有<span style="color: red; font-size: 1.2em;">{{ pos }}</span>人，预计需要等待<span
          style="color: red; font-size: 1.2em;">{{ waitMinite }}</span>分钟</p>
      </div>
      <ul v-else-if="kind === 0">
        <li v-for="(item, index) in clientList" :key="`list-${index}`" class="row flex-middle">
          <span class="flex1">{{ item.name }}</span>
          <button @click="call(item.name)">通话</button>
        </li>
      </ul>
    </template>
    <template v-else>
      <div class="row full-height">
        <div class="flex1">
          <div class="absolute">{{ result }}</div>
          <video id="rtcA" src="" controls autoplay></video>
        </div>
        <div class="absolute audio-b">
          <video id="rtcB" src="" controls autoplay></video>
        </div>
        <button v-if="kind === 0" class="btn-up" @click="hangup">挂断</button>
        <!--<button v-if="kind === 0" class="btn-up" style="right: 200px;" @click="upload">上传</button>-->
        <!--<button v-if="kind === 0" class="btn-up" @click="stopRecording">停止录制</button>-->
      </div>
    </template>
  </div>
</template>

<script>
import CommonGraphLine from './graph'
import socket from '../utils/socket'

let sock = null

export default {
  name: 'Audio',
  components: {
    CommonGraphLine
  },
  data() {
    return {
      connect: false,
      roomId: '112233',
      name: '',
      kind: 1,
      perMinute: 5,
      isToPeer: false,
      userList: [],
      localstream: null,
      peer: null,
      calling: false,
      offerOption: {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      },
      result: [],
      chunks: [],
      recorder: null
    }
  },
  computed: {
    clientList() {
      return this.userList.filter(item => item.kind === 1).sort((item1, item2) => item1.sort - item2.sort)
    },
    serverNum() {
      return this.userList.filter(item => item.kind === 0).length
    },
    pos() {
      let i = 0
      const clientList = this.clientList || []
      for (; i < clientList.length; i++) {
        if (clientList[i].name === this.name) {
          return i
        }
      }
      return -1
    },
    waitMinite() {
      return Math.ceil(this.pos / this.serverNum) * this.perMinute
    }
  },
  created() {
    const $params = this.$route.params || {}
    if (!$params.name) {
      history.back()
      return false
    }
    this.name = $params.name
    this.kind = Number($params.kind)
  },
  mounted() {
    if (this.name) {
      socket.connect().then(data => {
        sock = data
        this.initSocket()
        this.join()
      })
    }
  },
  beforeDestroy() {
    sock.emit('out', { roomId: this.roomId, name: this.name, kind: this.kind })
    sock.close()
  },
  methods: {
    // 传输视频
    // startRecording(stream) {
    //   const recorder = this.recorder = new MediaRecorder(stream)
    //   recorder.ondataavailable = (e) => {
    //     // this.chunks.push(e.data)
    //     this.upload([e.data])
    //   }
    //   recorder.start()
    //   setInterval(() => {
    //     recorder.requestData()
    //   }, 1000)
    // },
    // // 停止传输视频
    // stopRecording() {
    //   const recorder = this.recorder
    //   if (recorder) {
    //     recorder.stop()
    //     this.recorder = null
    //   }
    //   // setTimeout(() => {
    //   //   this.upload()
    //   // }, 800)
    // },
    // 获取画布
    getCanvasContext() {
      if (this._canvasContext) {
        return this._canvasContext
      }
      const canvas = this.canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 240
      return (this._canvasContext = canvas.getContext('2d'))
    },
    send(blob) {
      const appId = '5d887011'
      const time = String(Math.floor(new Date().getTime() / 1000))
      const params = new Buffer(JSON.stringify({
        image_name: 'img.jpg',
        image_url: ''
      })).toString('base64')
      const crypto = require('crypto')
      const hash = crypto.createHash('md5')
      const key = 'efc6844ad0397286b461df655fb0a075'
      const checkSum = hash.update(key + time + params).setEncoding('utf-8').digest('hex')
      fetch('/xunfei', {
        mode: 'cors',
        method: 'POST',
        headers: {
          'content-typ': 'multipart/form-data',
          'X-Appid': appId,
          'X-CurTime': time,
          'X-Param': params,
          'X-CheckSum': checkSum
        },
        body: blob
      })
        .then(response => {
          return response.json()
        })
        .then((data = {}) => {
          console.log(2222, data)
          if (data.code === 0) {
            const data1 = data.data || {}
            const file = (data1.fileList || [])[0] || {}
            const label = file.label
            console.log(2333333333)
            this.result.push(label)
          }
          return data
        })
        .catch(err => {
          console.log(444444444, err)
          throw err
        })
    },
    // 截屏获取图像
    startRecording(stream) {
      const clipVideo = document.getElementById('rtcA')
      const context = this.getCanvasContext()
      // const setting = this.localstream.getVideoTracks()[0].getSettings()
      this.canvasTimer = setInterval(() => {
        // console.log(111111111, setting.width, setting.height)
        context.drawImage(clipVideo, 0, 0, 320, 240)
        this.canvas.toBlob((blob) => {
          this.send(blob)
        })
        // this.canvas.toDataURL('image/png')
      }, 1000)
    },
    // 截屏获取图像
    stopRecording() {
      this.canvasTimer && clearInterval(this.canvasTimer)
    },
    // 停止截屏传输图像
    upload(blobs) {
      const blob = new Blob(blobs, { 'type': 'video/mp4' })
      sock.emit('video', { name: this.name, blob: blob })
      // const audioURL = URL.createObjectURL(blob)
      // document.getElementById('rtcB').src = audioURL
      this.chunks = []
    },
    join() {
      const {
        roomId, name, kind
      } = this
      if (!name) {
        return false
      }
      sock.emit('join', { roomId, name, kind })
    },
    call(name) {
      sock.emit('call', { name, self: this.name })
    },
    hangup() { // 挂断通话
      this.stopRecording()
      sock.emit('1v1hangup', { name: this.calling, self: this.name })
      this.peer.close()
      this.peer = null
      this.isToPeer = false
      this.calling = false
      this.connect = false
    },
    async createP2P(data) {
      this.connect = true
      await this.createMedia(data)
    },
    async createMedia(data) {
      // 保存本地流到全局
      try {
        this.localstream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        const video = document.querySelector('#rtcB')
        video.srcObject = this.localstream
      }
      catch (e) {
        console.log('getUserMedia: ', e)
      }
      this.initPeer(data) // 获取到媒体流后，调用函数初始化 RTCPeerConnection
    },
    initPeer(data) {
      // 创建输出端 PeerConnection
      const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection
      this.peer = new PeerConnection()
      this.peer.addStream(this.localstream) // 添加本地流
      // 监听ICE候选信息 如果收集到，就发送给对方
      this.peer.onicecandidate = (event) => {
        if (event.candidate) {
          sock.emit('1v1ICE', { name: data.self, self: this.name, sdp: event.candidate })
        }
      }
      this.peer.onaddstream = (event) => { // 监听是否有媒体流接入，如果有就赋值给 rtcB 的 src
        this.isToPeer = true
        this.loading = false
        const video = document.querySelector('#rtcA')
        // 开始录制
        if (this.kind === 0) {
          this.startRecording(event.stream)
        }
        video.srcObject = event.stream
      }
    },
    async createOffer(data) { // 创建并发送 offer
      try {
        // 创建offer
        const offer = await this.peer.createOffer(this.offerOption)
        // 呼叫端设置本地 offer 描述
        await this.peer.setLocalDescription(offer)
        // 给对方发送 offer
        sock.emit('1v1offer', { name: data.self, self: this.name, sdp: offer })
      }
      catch (e) {
        console.log('createOffer: ', e)
      }
    },
    async onOffer(data) { // 接收offer并发送 answer
      try {
        // 接收端设置远程 offer 描述
        await this.peer.setRemoteDescription(data.sdp)
        // 接收端创建 answer
        const answer = await this.peer.createAnswer()
        // 接收端设置本地 answer 描述
        await this.peer.setLocalDescription(answer)
        // 给对方发送 answer
        sock.emit('1v1answer', { name: data.self, self: this.name, sdp: answer })
      }
      catch (e) {
        console.log('onOffer: ', e)
      }
    },
    async onAnswer(data) { // 接收answer
      try {
        await this.peer.setRemoteDescription(data.sdp) // 呼叫端设置远程 answer 描述
      }
      catch (e) {
        console.log('onAnswer: ', e)
      }
    },
    async onIce(data) { // 接收 ICE 候选
      try {
        await this.peer.addIceCandidate(data.sdp) // 设置远程 ICE
      }
      catch (e) {
        console.log('onAnswer: ', e)
      }
    },
    reply(name, type) {
      console.log('发送应答', type, name)
      sock.emit('reply', { name, self: this.name, type: type })
    },
    initSocket() {
      const kind = this.kind
      sock.on('joined', data => {
        this.userList = data || []
      })
      if (kind === 0) {
        // 收到回复
        sock.on('reply', async data => {
          console.log('收到回答', data.type)
          switch (data.type) {
            case '1': // 同意
              this.calling = data.self
              // 对方同意之后创建自己的 peer
              await this.createP2P(data)
              // 并给对方发送 offer
              this.createOffer(data)
              break
            case '3': // 正在通话中
              alert('其他客服已经接入')
              break
          }
        })
      }
      else {
        sock.on('call', async data => { // 收到请求
          if (this.calling) {
            this.reply(data.self, '3')
            return false
          }
          await this.createP2P(data) // 同意之后创建自己的 peer 等待对方的 offer
          this.calling = data.self
          this.reply(data.self, '1')
        })
      }
      sock.on('1v1answer', (data) => { // 接收到 answer
        this.onAnswer(data)
      })
      sock.on('1v1ICE', (data) => { // 接收到 ICE
        this.onIce(data)
      })
      sock.on('1v1offer', (data) => { // 接收到 offer
        this.onOffer(data)
      })
      sock.on('1v1hangup', _ => { // 通话挂断
        this.peer.close()
        this.peer = null
        this.isToPeer = false
        this.calling = false
        alert('通话结束')
        history.back()
        // this.$router.push()
      })
    }
  }
}
</script>

<style lang="scss">
  .audio-container {
    width: 100%;
    height: 100%;
    video {
      width: 100%;
      height: 100%;
    }
    & > ul {
      padding-left: 20px;
      & > li {
        padding-right: 20px;
        height: 50px;
        border-bottom: 1px solid #eee;
      }
      button {
        padding: 5px 20px;
        background-color: #00B7FF;
        border: 1px solid #00B7FF;
        color: #fff;
      }
    }
  }

  .btn-up {
    position: absolute;
    right: 0;
    top: 0;
    padding: 5px 20px;
    background-color: #00B7FF;
    border: 1px solid #00B7FF;
    color: #fff;
  }

  .audio-b {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100px;
    height: 150px;
  }
</style>
