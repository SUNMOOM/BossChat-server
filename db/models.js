// 1. 引入 mongoose 
const mongoose = require('mongoose');
// 2. 连接数据库
mongoose.connect('mongodb://localhost:27017/zhipin');
const connection = mongoose.connection;
connection.on('connected', function () {
  console.log('数据库连接成功！');
})
// 3. 创建 Schema 数据结构
// 1. 创建 Schema 数据库约束（文档结构）， 调用 mongoose.Schema()

// 创建用户 Model
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  }, // 用户名
  password: {
    type: String,
    required: true
  }, // 密码
  type: {
    type: String,
    required: true
  }, // 用户类型: employer/employee
  header: {
    type: String
  }, // 头像名称
  job: {
    type: String
  }, // 职位
  info: {
    type: String
  }, // 个人或职位简介
  company: {
    type: String
  }, // 公司名称
  salary: {
    type: String
  } // 月薪
})
// 4. 创建 Model 构造函数（集合名称，和集合的操作实体）
const UserModel = mongoose.model('user', userSchema)
// 5. 分别导出 Model
exports.UserModel = UserModel

// 创建消息 Model
const chatMsgSchema = mongoose.Schema({
  createTime: {
    type: Number,
    required: true
  }, // 创建时间戳
  from: {
    type: String,
    required: true
  }, //消息发出者 id
  to: {
    type: String,
    required: true
  }, // 消息接受者 id
  chatId: {
    type: String,
    required: true
  }, // 消息 id
  content: {
    type: String,
    required: true
  }, // 消息内容
  read: {
    type: Boolean,
    default: false
  }, // 是否已读，默认 false
  lastest: {
    type: Boolean,
    required: true
  }
})
const ChatMsgModel = mongoose.model('chatMsg', chatMsgSchema)
exports.ChatMsgModel = ChatMsgModel