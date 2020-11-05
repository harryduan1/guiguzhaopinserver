var express = require('express');
var router = express.Router();
const md5 =  require('blueimp-md5')
const {UserModel, ChatModel} = require('../db/models');

const filter = {password: 0, __v: 0}
const baseUrl = '/zhaopin'

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 用户注册test
// router.post('/register', function(req, res) {
//   const {username, password} = req.body
//   if(username === 'admin') {
//     res.send({code: 1, msg: '此用户已存在！'})
//   } else {
//     res.send({code: 0,data: {id: '123', username, password}})
//   }
// })

// 1.用户注册
router.post(`${baseUrl}/register`, (req, res) => {
  // console.log(req.body, 'req.body')
  // 读取请求参数数据
  const {username, password, type} = req.body

  // console.log(UserModel);

  // 查询已有用户，根据用户名
  UserModel.findOne({username}, function (err, user) {
    if (err) {
      console.log('数据库出错了');
    }
    if (user) {
      res.send({code: 1, msg: '用户已存在！'})
    } else {
      new UserModel({username, password: md5(password), type}).save((err, user) => {
        // console.log(user, 'user');
        // 生成一个cookie， 保存用户id
        res.cookie('userid', user._id, {maxAge: 1000*60*60})

        const data = {username, type, _id: user._id}
        res.send({code: 0, data})
      })
    }
  })
})


// 2.登录路由
router.post(`${baseUrl}/login`, (req, res) => {
  const {username} = req.body
  const password = md5(req.body.password)
  UserModel.findOne({username, password}, {password: 0, __v: 0}, (err, user) => {
    if (user) {
      res.cookie('userid', user._id, {maxAge: 1000*60*60})
      res.send({code: 0, data: user})
    } else {
      res.send({code: 1, msg: '用户名或密码错误！'})
    }
  })
})

// 3.更新用户信息的路由
router.post(`${baseUrl}/update`, (req, res) => {
  const userid = req.cookies.userid
  if (!userid) {
    return res.send({code: 1, msg: '请先登录！'})
  }

  const user = req.body
  UserModel.findByIdAndUpdate({_id: userid}, user, (err, oldUser) => {
    const {_id, username, type} = oldUser
    const data = Object.assign({_id, username, type}, user)
    if (!oldUser) {
      res.clearCookie('userid')
      res.send({code: 1, msg: '请先登录！'})
    } else {
      res.send({code: 0, data})
    }
  })
})

// 4.获取用户的信息，同构浏览器中的cookie中的userid
router.get(`${baseUrl}/user`, (req, res) => {
  // 从请求的cookie中得到userid
  const userid = req.cookies.userid
  if (!userid) {
    return res.send({code: 1, msg: '请先登录！'})
  }
  UserModel.findOne({_id: userid}, {password: 0, __v: 0}, (err, user) => {
    res.send({code: 0, data: user})
  })
})


// 5.获取用户列表
router.get(`${baseUrl}/userlist`, (req, res) => {
  const {type} = req.query
  UserModel.find({type}, {password: 0, __v: 0}, (err, users) => {
    res.send({code: 0, data: users})
  })
})

/*
6.获取当前用户所有相关聊天信息列表
 */
router.get(`${baseUrl}/msglist`, function (req, res) {
  // 获取cookie中的userid
  const userid = req.cookies.userid
  // 查询得到所有user文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
    /*const users = {} // 对象容器
    userDocs.forEach(doc => {
      users[doc._id] = {username: doc.username, header: doc.header}
    })*/

    const users = userDocs.reduce((users, user) => {
      users[user._id] = {username: user.username, header: user.header}
      return users
    } , {})
    /*
    查询userid相关的所有聊天信息
     参数1: 查询条件
     参数2: 过滤条件
     参数3: 回调函数
    */
    ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function (err, chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({code: 0, data: {users, chatMsgs}})
    })
  })
})


/*
7.修改指定消息为已读
 */
router.post(`${baseUrl}/readmsg`, function (req, res) {
  // 得到请求中的from和to
  const from = req.body.from
  const to = req.cookies.userid
  /*
  更新数据库中的chat数据
  参数1: 查询条件
  参数2: 更新为指定的数据对象
  参数3: 是否1次更新多条, 默认只更新一条
  参数4: 更新完成的回调函数
   */
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err, doc) {
    console.log('/readmsg', doc)
    res.send({code: 0, data: doc.nModified}) // 更新的数量
  })
})

module.exports = router;


