// 引入 blueimg-md5 加密模块
const md5 = require('blueimp-md5')

// 连接数据库
// 1. 引入 mongoose 
const mongoose = require('mongoose');
// 2. 连接数据库
mongoose.connect('mongodb://localhost:27017/test'); // gzhipin_test 为数据库名称
// 3. 获取数据库链接对象
const connection = mongoose.connection;
// 4. 监听数据库 连接事件 connected 
connection.on('connected', function () {
  console.log('数据库连接成功！');
})

// 创建集合的Model
//  1. 创建 Schema 数据库约束（文档结构）， 调用 mongoose.Schema()
const userSchema = mongoose.Schema({
  username: { // 用户名
    type: String,
    required: true
  },
  password: { // 密码
    type: String,
    required: true
  },
  type: { // 用户类型 (employer / employee)
    type: String,
    required: true
  },
  header: { // 头像
    type: String
  }
})
// 2. 创建 Model (与集合对应，集合的操作实体)【注：UserModel 为构造函数】，调用 mongoose.model()
const UserModel = mongoose.model('user', userSchema) // 集合与文档结构联系

// 操作数据库
// 1. 增加(保存) save
function save() {
  // 创建一个 UserModel 实例
  const userModel = new UserModel({
    username: 'lisi',
    password: md5('123123'),
    type: 'employer'
  })
  // 调用 save() 方法
  userModel.save(function (err, data) {
    console.log('save', err, data);
  })
}
save()

// 2. 删除 remove
function remove() {
  UserModel.remove({
    _id: '5d3c600daef6c5400c26bec7'
  }, function (err, data) {
    console.log('remove', err, data) 
    //操作成功，删除0条： data 为 {n: 0, ok: 1}
    //操作成功，删除成功1条： data 为 {n: 1, ok: 1}
  })
}
// remove()

// 3. 修改 update
function update() {
  UserModel.findByIdAndUpdate({
    _id: '5d3c6281ee021c3c9861218f'
  }, {
    username: 'zhangsan'
  }, function (err, preData) {
    console.log('update', err, preData)
  })
}
// update();

// 4. 查找 find / findById
function find() {
  // 查找所有
  // UserModel.find(function(err, data){
  //   console.log('find', err, data)
  // })
  // 根据 id 查找
  // UserModel.findById({
  //   _id: '5d3c637d2ec8ca3394be84c1'
  // }, function(err, data){
  //   console.log('findById', err, data)
  // })
  // 查找一个
  UserModel.findOne({username: 'zhangsan'}, function(err, data) {
    console.log('findOne', err, data)
  })
}
// find()