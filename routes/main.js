const {
  UserModel,
  ChatMsgModel
} = require('../db/models');
const md5 = require('blueimp-md5');
// 1. 引入 express
const express = require('express');

// 设置数据库隐私属性（即不暴露）
const dataFilter = {
  password: 0,
  __v: 0
}


// 2. 获取路由对象
const router = express.Router();
// 3. 注册个路由

// 3.1 注册模块路由
router.post('/register', function (req, res) {
  // 3.1.1 获取请求参数
  const {
    username,
    password,
    type
  } = req.body;
  // 3.1.2 处理
  UserModel.findOne({
    username
  }, function (err, user) {
    if (user) {
      // 3.1.3 返回响应
      res.send({
        code: 1,
        msg: '用户已存在！'
      })
    } else {
      // 【注： 保存有一点需要注意， save 方法不是在 Model 构造函数上，而是在 Model 实例上】
      // 1. 生成一个文档实例
      const userModel = new UserModel({
        username,
        type,
        password: md5(password)
      });
      // 2. save() 方法保存 一个文档实例
      userModel.save(function (err, user) {
        // 使用 cookie 保持用户的登录状态
        res.cookie('userId', user._id, {
          maxAge: 1000 * 60 * 60
        });
        res.send({
          code: 0,
          data: {
            _id: user._id,
            username,
            type
          }
        })
      })
    }
  })
})

// 3.2 登录模块路由
router.post('/login', function (req, res) {
  const {
    username,
    password
  } = req.body;
  UserModel.findOne({
    username,
    password: md5(password)
  }, dataFilter, function (err, user) {
    if (user) {
      res.cookie('userId', user._id, {
        maxAge: 1000 * 60 * 60
      });
      res.send({
        code: 0,
        data: user
      })
    } else {
      res.send({
        code: 1,
        msg: '用户名或密码不正确！'
      })
    }
  })
})

// 3.3 更新用户信息
router.post('/update', function (req, res) {
  // 从请求的cookie得到userId
  const userId = req.cookies.userId
  // 如果不存在, 直接返回一个提示信息
  if (!userId) {
    return res.send({
      code: 1,
      msg: '请先登陆',
    })
  }
  // 存在, 根据userId更新对应的user文档数据
  // 得到提交的用户数据
  const user = req.body // 没有_id
  UserModel.findByIdAndUpdate({ // 第二个参数 user 为更新的数据， 若数据库有该数据属性，则更新，没有则表示新增
    // userId 为浏览器中的 cookie，但并不能保证cookie是否正确（可修改）
    _id: userId
  }, user, function (error, oldUser) {
    // 传入一个错误 cookie, 未能找到相应数据， oldUser 为 undefined
    if (!oldUser) {
      //  通知浏览器删除userId cookie
      res.clearCookie('userId')
      // 返回返回一个提示信息
      res.send({
        code: 1,
        msg: '用户信息错误，请重新登录'
      })
    } else {
      // 准备一个返回的user数据对象
      const {
        _id,
        username,
        type
      } = oldUser
      const data = Object.assign({
        _id,
        username,
        type,
      }, user)
      // 返回
      res.send({
        code: 0,
        data
      })
    }
  })
})

// 3.4 获取用户信息
router.get('/user', function (req, res) {
  // 获取请求参数
  const userId = req.cookies.userId
  // 处理
  UserModel.findOne({
    _id: userId
  }, dataFilter, function (err, user) {
    if (user) {
      res.send({
        code: 0,
        data: user
      })
    } else if (err) {
      res.send({
        code: 1,
        msg: '不存在该用户'
      })
    }
  })
  // 返回响应请求
})

// 3.5 获取主页用户信息列表
router.get('/userlist', function (req, res) {
  // 获取请求参数
  const query = (req.query.type === 'employer') ? 'employee' : 'employer'
  // 处理
  UserModel.find({
    type: query
  }, dataFilter, function (err, userlist) {
    // 返回响应数据
    if (userlist) {
      res.send({
        code: 0,
        data: userlist
      })
    } else {
      res.send({
        code: 1,
        msg: '获取信息失败'
      })
    }
  })

})


// 4. 获取指定消息列表
router.get('/msglist', function (req, res) {
  // 获取请求参数
  const chatId = req.query.chatId
  ChatMsgModel.find({
    chatId: chatId
  }, function (err, data) {
    if (data) {
      res.send({
        code: 0,
        data: {
          chatId,
          msgs: data
        }
      })
    } else {
      res.send({
        code: 1,
        msg: err
      })
    }
  })
})

// 5. 获取所有最新消息及用户列表
router.get('/lastestmsgs', function (req, res) {
  const from = req.cookies.userId
  const to = req.cookies.userId
  // 获取所有有关消息 msgs (数组)
  ChatMsgModel.find({
    '$or': [{
      from
    }, {
      to
    }]
  }, function (err, allMsgs) {
    if (allMsgs) {
      // 将所有 allMsgs 消息进行分组 (对象)
      const allMsgslist = {}
      allMsgs.forEach(msg => {
        // 使用对象分组储存
        if (allMsgslist[msg.chatId]) {
          allMsgslist[msg.chatId] = [msg, ...allMsgslist[msg.chatId]]
        } else {
          allMsgslist[msg.chatId] = [msg]
        }
      })
      // 获取最新消息列表 users (数组)
      const msgLastestList = allMsgs.filter(msg => msg.lastest === true)
      // 根据每个最新消息找出每个聊天用户 id (数组)
      const usersId = msgLastestList.map(msg => ({
        _id: (msg.from === req.cookies.userId) ? msg.to : msg.from
      }))
      // 根据每个聊天用户 id 找出对应的聊天用户列表(数组)
      UserModel.find({
        '$or': usersId
      }, dataFilter, function (err, users) {
        if (users) {
          res.send({
            code: 0,
            data: {
              allMsgslist,
              msgLastestList,
              users
            }
          })
        }
      })
    } else {
      res.send({
        code: 1,
        msg: '未查找历史记录'
      })
    }
  })
})

// 6. 对消息已读
router.post('/readmsg', function (req, res) {
  const from = req.body.from
  const to = req.cookies.userId
  const conditions = {
    from,
    to,
    read: false
  }
  ChatMsgModel.update(conditions, {
    read: true
  }, {
    multi: true
  }, function (err, counts) {
    if (counts.ok) {
      res.send({
        code: 0,
        data: {
          counts: counts.n,
        }
      })
    } else {
      res.send({
        code: 1,
        msg: err
      })
    }
  })
})

// 导出路由模块
module.exports = router