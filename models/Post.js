var mongoose = require('./connect');
var Schema = mongoose.Schema;
var PostSchema = new Schema({
	title:String,
	content:String,
	time:Object,
	userId:String,
	author:Object,
	pv:Number,
	updatetime:Object
	// img:String   //封面  给一个默认
});

PostSchema.methods.addPost = function(post,callback){
	this.title = post.title;
	this.content = post.content;
	// 上传时间
	this.time = post.time;
	this.userId = post.userId;
	this.author = post.author;
	this.pv = post.pv;
	this.updatetime = post.updatetime;
	this.save(callback);
};

var Post = mongoose.model('posts', PostSchema);

module.exports = Post;