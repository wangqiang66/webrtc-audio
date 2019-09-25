import io from 'socket.io-client'

// const host = 'https://wechatmini.ddjf.com/wangqiang-websocket'
const host = 'https://10.96.2.202'
let sock = null
const socket = {
  connect() {
    return new Promise(resolve => {
      sock = io.connect(host, {
        // path: '/socket.io/socket.io'
      })
      resolve(sock)
    })
  },
  close() {
    if (sock) {
      sock.close()
      sock = null
    }
  }
}
export default socket
