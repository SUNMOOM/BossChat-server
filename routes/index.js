// 主页路由模块

// 引入 express 
var express = require('express');
// 获取 router 对象
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

// 注册 register 路由

/*
注册一个路由: 用户注册
a)path为: /register
b)请求方式为: POST
c)接收username和password参数
d)admin是已注册用户
e)注册成功返回: {code: 0, data: {_id: 'abc', username: ‘xxx’, password:’123’}
f)注册失败返回: {code: 1, msg: '此用户已存在'}
 */
router.post('/register', function (req, res, next) {
  // 1. 获取请求参数
  const {
    username,
    password
  } = req.body;
  // 2. 处理请求
  if (username !== 'admin') { // 注册成功返回
    // 3. 返回响应
    res.send({
      code: 0,
      data: {
        _id: '123456',
        username: username,
        password: password
      }
    })
  } else { // 注册失败返回
    // 3. 返回响应
    res.send({
      code: 1,
      msg: '此用户已存在'
    })

  }
})

module.exports = router;