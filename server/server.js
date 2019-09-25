/**
 * Created by wyw on 2018/10/14.
 */
const Koa = require('koa');
const path = require('path');
const koaSend = require('koa-send');
const static = require('koa-static');
const socket = require('koa-socket');
const fs = require('fs')
const users = {}; // 保存用户
const sockS = {}; // 保存客户端对应的socket
const io = new socket({
  ioOptions: {
    pingTimeout: 10000,
    pingInterval: 5000,
  }
});

async function writeToDisk(blob, fileName) {
  const pathsName = fileName.split('.')
  const fileExtension = pathsName.pop()
  const fileRootName = './upload/' + pathsName.join('.')
  let filePath = fileRootName + '.' + fileExtension
  let fileBuffer

  // if (!fs.existsSync(filePath)) {
  //   await fs.mkdirSync(filePath.split().pop())
  // }

  // const ws = fs.createWriteStream(filePath)
  // ws.write(blob)
  // fileBuffer = new Buffer(blob, 'base64');
  fs.appendFileSync(filePath, blob);
}

// 创建一个Koa对象表示web app本身:
const app = new Koa();
// socket注入应用
io.attach(app);
app.use(static(
  path.join(__dirname, './public')
));

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
  if (!/\./.test(ctx.request.url)) {
    await koaSend(
      ctx,
      'index.html',
      {
        root: path.join(__dirname, './'),
        maxage: 1000 * 60 * 60 * 24 * 7,
        gzip: true,
      } // eslint-disable-line
    );
  }
  else {
    await next();
  }
});
// io.on('join', ctx=>{ // event data socket.id
// });
app._io.on('connection', sock => {
  sock.on('join', data => {
    const roomId = data.roomId
    sock.join(roomId, () => {
      if (!users[roomId]) {
        users[roomId] = []
      }
      const userList = users[roomId] || []
      let obj = {
        name: data.name,
        kind: data.kind,
        id: sock.id,
        sort: userList.length
      }
      let arr = userList.filter(v => v.name === data.name);
      if (!arr.length) {
        users[roomId].push(obj);
      }
      sockS[data.name] = sock;
      app._io.in(roomId).emit('joined', users[roomId], data.name, data.kind, sock.id); // 发给房间内所有人
      // sock.to(data.roomid).emit('joined',data.account);
    });
  });
  sock.on('out', data => {
    const roomId = data.roomId
    const userList = users[roomId]
    const user = userList.filter(v => v.name === data.name)[0] || {}
    if (user.sort !== undefined) {
      userList.splice(user.sort, 1)
      users[roomId] = userList.map(item => {
        if (item.sort > user.sort) {
          item.sort = item.sort - 1
        }
        return item
      })
      sockS[data.name] = null
      delete sockS[data.name]
      app._io.in(roomId).emit('joined', users[roomId], data.name, data.kind, sock.id)
    }
  })
  sock.on('offer', data => {
    // console.log('offer', data);
    sock.to(data.roomid).emit('offer', data);
  });
  sock.on('answer', data => {
    // console.log('answer', data);
    sock.to(data.roomid).emit('answer', data);
  });
  sock.on('__ice_candidate', data => {
    // console.log('__ice_candidate', data);
    sock.to(data.roomid).emit('__ice_candidate', data);
  });

  // 1 v 1
  sock.on('call', data => { // 转发申请
    sockS[data.name].emit('call', data);
  });
  sock.on('reply', data => { // 转发回复
    sockS[data.name].emit('reply', data);
  });
  sock.on('1v1answer', data => { // 转发 answer
    sockS[data.name].emit('1v1answer', data);
  });
  sock.on('1v1ICE', data => { // 转发 ICE
    sockS[data.name].emit('1v1ICE', data);
  });
  sock.on('1v1offer', data => { // 转发 Offer
    sockS[data.name].emit('1v1offer', data);
  });
  sock.on('1v1hangup', data => { // 转发 hangup
    sockS[data.name].emit('1v1hangup', data);
  });
  sock.on('video', data => { // 保存视频流
    // const f = new File('out.wav')
    // console.log(2222222222, data.blob)
    writeToDisk(data.blob, data.name + '.mp4')
    // sockS[data.name].emit('1v1hangup', data);
  });
});
app._io.on('disconnect', (sock) => {
  for (let k in users) {
    users[k] = users[k].filter(v => v.id !== sock.id);
  }
  console.log(`disconnect id => ${users}`);
});

// 在端口3001监听:
let port = 3001;
app.listen(port, _ => {
  console.log('app started at port ...' + port);
});
// https.createServer(app.callback()).listen(3001);
