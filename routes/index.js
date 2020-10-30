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
  const user = req.body
})

module.exports = router;


