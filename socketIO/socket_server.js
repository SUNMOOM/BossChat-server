// 引入数据库，存储所有消息
const {
  ChatMsgModel
} = require('../db/models')

// 将 socket.io 导出为一个 函数模块， 目的是传入 server 服务器对象
module.exports = function (server) {
  // 接收 server ， 并创建 io 对象, 一定需要 server 作为参数
  const io = require('socket.io')(server);
  console.log('服务器 socket 服务已启动');
  // 监听是否有 客户端 成功连接到服务器，
  io.on('connection', function (socket) { // 监听到 socket 时，传入该 socket 对象
    console.log('有客户端连上 socket 服务器！');
    // 对于已成功连接服务器的客户端，进行监听来自客户端发送的 socket 事件消息
    // socket.on('clientMsg', function (data) {
    //   // 收到指定类型(sendMsg)时 socket 执行回调
    //   console.log('服务端接收到来自客户端的消息', data);
    //   (new ChatMsgModel({
    //     ...data,
    //     lastest: true
    //   })).save(function (err, data) {
    //     if (data) {
    //       console.log('消息已成功存储到数据库');
    //       console.log('服务端向自客户端发送消息', data);
    //       // （广播形式）服务器发送消息给客户端
    //       io.emit('serverMsg', data);
    //     } else {
    //       console.log('消息存储错误', err);
    //     }
    //   });
    // })
    socket.on('clientMsg', function (data) {
      // 收到指定类型(sendMsg)时 socket 执行回调
      console.log('服务端接收到来自客户端的消息', data);
      // 消息保存前，对之前的 chatId 最新消息 lastest 改为 false 
      ChatMsgModel.update({
        chatId: data.chatId,
        lastest: true
      }, {
        lastest: false
      }, {
        multi: true
      }, function (err, count) {
        if (count.ok) {
          console.log('查到最新消息记录', count.n);
        } else {
          console.log('查询出错');
        }
        // 不管查到还是未查到， 都进行保存,并且添加  lastest 为 true
        (new ChatMsgModel({
          ...data,
          lastest: true
        })).save(function (err, data) {
          if (data) {
            console.log('消息已成功存储到数据库');
            console.log('服务端向自客户端发送消息', data);
            // （广播形式）服务器发送消息给客户端
            io.emit('serverMsg', data);
          } else {
            console.log('消息存储错误', err);
          }
        });
      })
    })
  })
}
// 最后将该模块引入到有 server 对象的服务器文件中