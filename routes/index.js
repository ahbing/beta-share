var express = require('express');
var crypto = require('crypto');
var fs = require('fs');
var router = express.Router();
var User = require('../models/User');
var Post = require('../models/Post');
var markdown= require('markdown').markdown;
var nodemailer = require('nodemailer');


router.get('/',function(req,res){
	Post.count({},function(err,count){
		if(err){
			req.flash('error',err);
			return res.redirect('/');
		}
		var num = 6;  // 每一页显示6篇
		// console.log('文章数量'+count);
		var total = count;
		var page = req.query.p?parseInt(req.query.p):1;
		// console.log(page);
		var query = Post.find({});
		query.skip((page-1)*num);
		query.limit(num);
		query.sort({time:-1});
		query.exec(function(err,posts){
			// console.log(posts.length);
			posts.forEach(function(post){
				post.content = markdown.toHTML(post.content).substring(0,222)+'...';
			});
			res.render('index',{
				title:'主页',
				user:req.session.user || {name:null},
				page:page,
				posts:posts,
				total:total,
				isFirstPage:(page -1) == 0,
				isLastPage :( (page-1)* num + posts.length)== total,
				error:req.flash('error').toString(),
				success:req.flash('sccess').toString()
			});
		});
	});
});

router.post('/',checkNotLogin);
router.post('/',function(req,res){
	if(req.body['re-password']){
		//收到的字段有 rePassword 的话 就是注册
		var user = new User();
		var password = req.body.password;
		var rePassword = req.body['re-password'];
		var email = req.body.email;
		var name = req.body.name;
		if(password !== rePassword){
			req.flash('error','卧槽:( 输入的两次的密码不一样。');
			return res.redirect('/');
		}
		var md5 = crypto.createHash('md5');
		password = md5.update(req.body.password).digest('hex');
		//如果没有注册url 就让他的url转为个人中心
		var url = req.body.url || 'mailto:'+email;
		var newuser = {
			email:email,
			name:name,
			password:password,
			url :url
		};

		User.find({email:email},function(err,theUser){
			if(err){
				req.flash('error',err);
				console.log(err);
				return res.redirect('/');
			}
			if(theUser.length !== 0){
				req.flash('error',':( 邮箱已经被注册了，换一个吧。');
				return res.redirect('/');
			}
			//邮箱没有被注册  就注册
			user.addUser(newuser,function(err,user){
				if(err){
					req.flash('error',err);
					console.log(err);
					return res.redirect('/');
				}
				//注册之后直接登录
				req.session.user = user;
				var userId = user._id;  //验证的用户id
				var acCode = user.password.slice(0,6);  // 激活码
				//@betahouse.us
				// console.log(email.slice(-13));
				if(email.slice(-13) == '@betahouse.us'){
				// 如果是工作室的邮箱 去验证
					active(email,userId,acCode,req,res);
				}else{
					req.flash('success','嘿嘿嘿，你终于来了，：）我还以为我这一生都碰不到你了呢。');
					res.redirect('/');
				}
			});
		});
	}else{
		//登录
		var email = req.body.email;
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		var rememberPsw = req.body['remember-psw'];
		User.find({email:email},function(err,theUser){
			if(err){
				req.flash('error',err);
					console.log(err);
				return res.redirect('/');
			}
			if(theUser.length !== 0){
				if(theUser[0].password == password){
					//密码通过
					req.session.user = theUser[0];
					req.flash('success','嗯，你终于来了，：）我还以为我这一生都碰不到你了呢。');
					res.redirect('/');
				}else{
					req.flash('error','你密码都记错了，肯定没有女朋友吧！！哈哈哈');
					return res.redirect('/');
				}
			}else{
				//错误邮箱
				req.flash('error',':( 这个邮箱还没被注册呢，反了你了  哈哈 :)');
				return res.redirect('/');
			}
		});
	}
});


router.get('/logout',checkLogin);
router.get('/logout',function(req,res){
	req.session.user = null;
	req.flash('success','你来，我去接你，你走，我也送你。 撒杨娜拉 :)');
	res.redirect('/');
});

// router.get('/person/:userId',checkLogin);
router.get('/person/:userId',function(req,res){
	var userId = req.params.userId;
	User.find({_id:userId},function(err,theUser){
		if(err){
			req.flash('error',err);
					console.log(err);
			return res.redirect('back');
		}
		Post.find({userId:userId}).sort({time:-1}).exec(function(err,posts){
			if(err){
				req.flash('error',err);
					console.log(err);
				return res.redirect('back');
			}
			posts.forEach(function(post){
				post.content = markdown.toHTML(post.content);
			});
			res.render('person',{
				title:'个人中心',
				user:req.session.user ||{name:null},
				theUser:theUser[0],
				posts:posts,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
			});
		});
	});
});
router.post('/person',checkLogin);
router.post('/person',function(req,res){
	//console.log(req.body.imgSrc);
	//console.log(req.body.userId);
	var src = req.body.imgSrc;
	var userId = req.body.userId;
	User.update({_id:userId},{$set:{bg:src}},{multi:false},function(err){
		if(err){
			req.flash('error','错误了阿');
					console.log(err);
			return res.redirect('back');
		}
		req.flash('success','修改背景成功');
		req.session.user.bg = src;
		var url = encodeURI('/person/'+userId);
		res.redirect(url);
	});

});

router.get('/editinfo/:userId',checkLogin);
router.get('/editinfo/:userId',function(req,res){
	var userId = req.params.userId;
	User.find({_id:userId},function(err,theUser){
		if(err){
			req.flash('error',err);
					console.log(err);
			return res.redirect('back');
		}
		res.render('editinfo',{
			title:'编辑',
			user:req.session.user,
			theUser:theUser[0],
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
});

router.post('/editusername/:userId',checkLogin);
router.post('/editusername/:userId',function(req,res){
	var userId = req.params.userId;
	var name = req.body.username;
	var motto = req.body.motto;
	var query = {_id:userId},
			update = {$set:{name:name,motto:motto}},
			options = {multi: true};
	if(!/^[A-Za-zd0-9\u4e00-\u9fa5]+$/.test(name)){
		req.flash('error','修改失败，请输入中文或者英文');
		return res.redirect('back');
	}
	User.update(query,update,options,function(err){
		if(err){
			req.flash('error',err);
					console.log(err);
					console.log(err);
			return res.redirect('back');
		}
		req.session.user.name = name;
		req.flash('success','修改成功');
		res.redirect('back');
	});
});

router.post('/editpassword/:userId',checkLogin);
router.post('/editpassword/:userId',function(req,res){
	var userId = req.params.userId,
			newpassword = req.body['new-password'],
			rePassword = req.body['re-new-password'];
	console.log(newpassword.length);
	if(newpassword.length<6){
		console.log('hello world');
		req.flash('error','密码长度不少于6位');
		return res.redirect('back');
	}
	if(newpassword !== rePassword){
		req.flash('error','两次密码输入不一样');
		return res.redirect('back');
	}
	var md5 = crypto.createHash('md5');
	var oldPassword = md5.update(req.body['old-password']).digest('hex');
	User.find({_id:userId},function(err,user){
		if(err){
			req.flash('error',err);
					console.log(err);
			return res.redirect('back');
		}
		var user = user[0];

		if(oldPassword == user.password){
			//输入原有密码通过
			if(newpassword == rePassword){
				var md5 = crypto.createHash('md5');
				var password = md5.update(newpassword).digest('hex');
				var query = {_id:userId},
						update = {$set:{password:password}},
						options = {multi:false};
				User.update(query,update,options,function(err){
					if(err){
						req.flash('error',err);
					console.log(err);
						return res.redirect('back');
					}
					req.flash('success','密码修改成功');
					res.redirect('back');
				});
			}else{
				//输入新密码不一致
				req.flash('error',err);
					console.log(err);
				return res.redirect('back');
			}
		}
	});
});

router.post('/updateheader/:userId',checkLogin);
router.post('/updateheader/:userId',function(req,res){
	var userId = req.params.userId;
	// console.log(userId);
	//文件上传路径
	var tmp_path = req.files.header.path;
	var target_path = './public/images/userheader/'+req.files.header.name;
	var header = '/images/userheader/'+req.files.header.name;
	// console.log(header);
	fs.rename(tmp_path,target_path,function(err){
		if(err){
			req.flash('error','文件移动错误,请将这个bug报告给我');
			return res.redirect('back');
		}
				// console.log('hello');
		var query = {_id:userId},
				update = {$set:{header:header}},
				options ={multi : false};
		User.update(query,update,options,function(err){
			if(err){
				req.flash('error',err);
					console.log(err);
				return res.redirect('back');
			}
			// console.log(req.session.user);
			req.flash('success','头像修改成功');
			res.redirect('back');
		});
	});
	// fs.unlink(tmp_path,function(err){
	// 	if(err){
	// 		req.flash('error','文件删除错误');
	// 		return res.redirect('back');
	// 	}
	// });
});

router.get('/post/:userId',checkLogin);
router.get('/post/:userId',function(req,res){
	res.render('post',{
		title:'发表，记录与分享',
		user:req.session.user,
		imgSrc:req.flash('imgSrc').toString(),
		success:req.flash('success').toString(),
		error:req.flash('error').toString()
	});
});

router.post('/post/:userId',checkLogin);
router.post('/post/:userId',function(req,res){
	var date = new Date();
	var title = req.body.title;
	var userId = req.body.userId;
	var content = req.body.content;
	var nowUserId = req.session.user._id;
	// console.log('当前登录的id'+nowUserId);
	// console.log('url的id'+userId);
	User.find({_id:userId},function(err,author){
		if(err){
			req.flash('error','post user 错误');
			return res.redirect('back');
		}
		// console.log(author[0]);
		var author = author[0];
		var newpost = {
			title :title,
			content : content,
			time: {
				day:date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate(),
				minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
			},
			author:author,
			// 验证这个id  和 登录的id 一样 防止给别人写文章
			userId :userId,
			pv : 0
		};
		var post = new Post();
		if(nowUserId == userId){
			post.addPost(newpost,function(err,post){
				if(err){
					req.flash('error','错误了,我好想静静。  ：（');
					return res.redirect('back');
				}
				var url = encodeURI('/page/'+post._id);
				req.flash('success','文章发表成功，我们工作室因为有你又成长了一步呢 :)');
				res.redirect(url);
			});
		}else{
			req.flash('error','很明显，你是想帮别人写文章，而我很机智的想到并拒绝了，哈哈 我是天才。。');
			return res.redirect('back');
		}
	});
});

router.post('/postimg/:userId',checkLogin);
router.post('/postimg/:userId',function(req,res){
	console.log(req.files.img);
	console.log(req.files);
	var userId = req.params.userId;
	var tmp_path = req.files.img.path;
	var target_path = './public/images/post/'+req.files.img.name;
	var img = '/images/post/'+req.files.img.name;
	// console.log(img);
	fs.rename(tmp_path,target_path,function(err){
		if(err){
			req.flash('error','文件移动错误,请将这个bug报告给我');
			return res.redirect('back');
		}
		req.flash('success','图片上传成功');
		req.flash('imgSrc',img);
		// var url = encodeURI('/post/'+userId);
		// res.redirect(url);
		res.send('<p style="width:100%; text-align:center;"> <em>![]('+img+')</em>'+'    请不要刷新，回退历史,将以上链接复制粘贴到post内');

	});
});


// router.get('/page/:postId',checkLogin);
router.get('/page/:postId',function(req,res){
	var postId = req.params.postId;
	Post.find({_id:postId},function(err,post){
		if(err){
			res.flash('error',err);
					console.log(err);
			return res.redirect('back');
		}
		post = post[0];
		// console.log('post'+post);
		if(post){
			//更新pv
			Post.update({_id:postId},{$inc:{'pv':1}},{multi:false},function(err){
				if(err){

					req.flash('error','err跟新pv');
					return res.redirect('back');
				}
				// bug  文章每行之前不能有空格  有空格markdown就无法渲染成html
			  post.content = markdown.toHTML(post.content);
			  // console.log(post.content);
				var userId = post.userId;
				User.find({_id:userId},function(err,author){
					if(err){
						res.flash('error','找作者');
						return res.redirect('back');
					}
					author = author[0];
					res.render('page',{
						title:'学习，整理，参与',
						user:req.session.user || {name:null},
						author:author,
						post:post,
						success:req.flash('success').toString(),
						error:req.flash('error').toString()
					});
				});
			});
		}else{
			req.flash('error','该篇文章不存在');
			return res.redirect('back');
		}
	});
});

router.get('/editpage/:postId',checkLogin);
router.get('/editpage/:postId',function(req,res){
	var postId = req.params.postId;
	Post.find({_id:postId},function(err,post){
		if(err){
			req.flash('error',err);
			return res.redirect('back');
		}
		post = post[0];
		// console.log(post);
		res.render('editpage',{
			title:'编辑',
			user:req.session.user,
			post:post,
			imgSrc:req.flash('imgSrc').toString(),
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
});

router.post('/editpage/:postId',checkLogin);
router.post('/editpage/:postId',function(req,res){
	// 找到这篇文章的作者id  比对当前登录的用户id   一致才提交表单
	var postId = req.params.postId;
	var date = new Date();
	// console.log(postId);
	var title = req.body.title,
			content = req.body.content,
			updatetime = {
				day:date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate(),
				minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      	date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
			};

	var updatePost = {
		title:title,
		content:content,
		updatetime:updatetime
	};
	var query = { _id:postId };

	Post.find({_id:postId},function(err,post){
		if(err){
			req.flash('error',err);
			return res.redirect('back');
		}
		post = post[0];
		// console.log(post.userId);
		// console.log(req.session.user);
		// console.log(req.session.user._id);
		if(post.userId == req.session.user._id){

			Post.update(query , { $set: updatePost },{multi:false}, function(err){
				if(err){
					req.flash('error',err);
					return res.redirect('back');
				}
				req.flash('success','修改成功');
				var url = encodeURI('/page/'+postId);
				res.redirect(url);
			});

		}else{
			req.flash('error','你想干嘛！！！');
			return res.redirect('back');
		}
	});
});


router.post('/editimg/:postId',checkLogin);
router.post('/editimg/:postId',function(req,res){
	console.log(req.files.img);
	console.log(req.files);
	var postId = req.params.postId;
	console.log(postId);
	var tmp_path = req.files.img.path;
	var target_path = './public/images/post/'+req.files.img.name;
	var img = '/images/post/'+req.files.img.name;
	// console.log(img);
	fs.rename(tmp_path,target_path,function(err){
		if(err){
			req.flash('error','文件移动错误,请将这个bug报告给我');
			return res.redirect('back');
		}
		req.flash('success','图片上传成功');
		req.flash('imgSrc',img);
		var url = encodeURI('/editpage/'+postId);
		res.redirect(url);
	});
});

router.get('/active/:userId/:acCode',checkLogin);
router.get('/active/:userId/:acCode',function(req,res){
	var userId = req.params.userId,
			acCode = req.params.acCode;
			// console.log(userId+'...'+acCode);
	User.find({_id:userId},function(err,user){
		user = user[0];
		var theCode = user.password.slice(0,6);
		if(user._id == userId && theCode == acCode){
			//更新数据库
			var query = {_id:userId},
					updateRoot = {root:1};
			User.update(query,{$set:updateRoot},{multi:false},function(err){
				if(err){
					req.flash('error',err);
					return res.redirect('back');
				}
				var root = 1;
				// console.log('root'+req.session.user.root);
				req.session.user.root = 1;
				//console.log(req.session.user.root == 'undefiend');
				res.render('actived',{
					 user:req.session.user,
					 success:req.flash('success').toString(),
					 error:req.flash('error').toString()
				});
			});
		}else{
			req.flash('error','该邮箱暂不允许验证，如果你有文章想要发表，请与betahouse联系');
			return res.redirect('/');
		}
	});
});

router.get('/sendAct/:userId',checkLogin);
router.get('/sendAct/:userId',function(req,res){
	var userId = req.params.userId;
	User.find({_id:userId},function(err,user){
		user = user[0];
		var acCode = user.password.slice(0,6);
		var email = user.email;
		if(email.slice(-13)=='@betahouse.us'){
			// 如果是工作室的邮箱 去验证
			active(email,userId,acCode,req,res);
		}else{
			req.flash('error','该邮箱暂不允许验证，如果你有文章想要发表，请与betahouse联系');
			return res.redirect('/');
		}
	});
});


function checkLogin(req,res,next){
	if(!req.session.user){
		req.flash('error','如果你登录了，我就让你这么干！:( 嘿嘿嘿');
		res.redirect('/');
	}
	next();
}

function checkNotLogin(req,res,next){
	if(req.session.user){
		req.flash('error','你都已经登录了，你还想干嘛？还想干嘛！:( 知足常乐知不知道');
		res.redirect('back');
	}
	next();
}
function active(email,userId,acCode,req,res){
	var transporter = nodemailer.createTransport({

	  	"aliases": ["QQ Enterprise"],
	    "domains": [
	        "exmail.qq.com"
	    ],
	    "host": "smtp.exmail.qq.com",
	    "port": 465,
	    "secure": true,
		  auth: {
	      user: 'hr@betahouse.us',
	       pass: 'beta22'
		  }
	}

	);
	var mailOptions = {
	    from: 'hr@betahouse.us',
	    to: email ,
	    subject: 'beta-分享 验证注册邮箱',
	    html: '<a href="https://sharebeta.herokuapp.com/active/'+userId+'/'+acCode+'">点此激活你在 beta-分享 的账户</a> <br/><br/><br/>beta-分享  小组  <br/>敬上'
	};
	transporter.sendMail(mailOptions, function(err, info){
    if(err){
      console.log(err);
     	req.flash('error',err);
    	return res.redirect('/');
    }else{
	    res.send('<div style="width:100%; text-align:center;">我们发送了一份验证邮件去往你的邮箱，请及时验证。<a href="https://exmail.qq.com/login">现在就去</a> <a href="/">稍后验证</a></div>');
	    // console.log('Message sent: ' + info.response);
    }
	});
}

module.exports = router;
