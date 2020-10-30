const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
mongoose.connect('mongodb://localhost:27017/shangguigu')
const conn = mongoose.connection
conn.on('connected', function () {
    console.log('连接成功！')
})

// 2.得到对应集合的model
// 2.1定义Schema（描述文档结构）
const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    type: {type: String, required: true},
    header: {type: String}
})

// 2.2 定义model
const UserModel = mongoose.model('user', userSchema)

//3.1 增
function testAdd () {
    const userModel = new UserModel({username: 'Bob', password: md5('123'), type: 'laoban'})
    userModel.save(function (err, user) {
        console.log('save()', err, user)
    })
}
// testAdd()


//3.2 删
function testDel () {
    UserModel.remove({_id: '5f995c2ce64fac0568649acc'}, function (err, data){
        console.log(err, data)
    })
}
testDel()


//3.3 改
function testEdit () { 
    UserModel.findByIdAndUpdate({_id: '5f9959c47aaa9c2ed432f2ce'}, 
    {username: 'Jack'}, function (err, user) {
        console.log(err, user)
    })
}
// testEdit()


//3.4 查
function testFind () { 
    UserModel.find((err, users) => {
        console.log(users)
    })

    UserModel.findOne({username: 'Bob'}, (err, user) => {
        console.log('findOne()', err, user)
    })
}
// testFind()