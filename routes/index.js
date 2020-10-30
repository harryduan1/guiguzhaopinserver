var express = require('express');
var router = express.Router();
const md5 =  require('blueimp-md5')
const {UserModel} = require('../db/modules');

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

// 用户注册
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


// 登录路由
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

// 更新用户信息的路由
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

// 获取用户的信息，同构浏览器中的cookie中的userid
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

module.exports = router;


