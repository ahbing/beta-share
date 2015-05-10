var mongoose = require('./connect');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
	email:String,
	name:String,
	password:String,
	url:String,
	header:String,
	motto:String,
	bg:String,
	root:Number  // 默认为0表示没有发文章权限
});

UserSchema.methods.addUser = function(user,callback){
	this.email = user.email;
	this.name = user.name;
	this.password = user.password;
	this.url = user.url;
	this.header = '/images/userheader/header.jpg';
	this.motto = '你好吗？在努力吗？有微笑吗？';
	this.bg = '/images/userbg/bg.jpg';
	this.root = '0';
	this.save(callback);
};

//users 的一个集合
var User = mongoose.model('users',UserSchema);

module.exports = User;
