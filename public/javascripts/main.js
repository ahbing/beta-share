// 封装事件兼容
var EventUtil = {
	//添加事件监听
	addHandler:function(element,type,handler){
		if(element.addEventListener){
			element.addEventListener(type,handler,false);
		}else if(element.attachEvent){
			element.attachEvent('on'+type,handler);
		}else{
			element['on'+type] = handler;
		}
	},
	//删除
	removeHandler:function(element,type,handler){
		if(element.removeEventListener){
			element.removeEventListener(type,handler,false);
		}else if(element.detachEvent){
			element.detachEvent('on'+type,handler);
		}else{
			element['on'+type] = null;
		}
	},

	getEvent:function(event){
		return event?event : window.event;
	},
	//事件目标
	getTarget:function(event){
		return event.target || event.srcElement;
	},
	//阻止默认
	preventDefault:function(event){
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = null;
		}
	},
	stopPropagation: function(event){
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
	}
};

window.onload = function(){
	header();
	editinfo();
	flashOut();
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	 editBg();
	 uploadImgList();
	 // addImgSrc();
	} else {
		alert('你的浏览器不支持FileAPI，你将无法个人中心修改背景，或者在文章里上传图片，我们建议你使用chrome等先进浏览器，让我们携手努力早日走进告诉浏览器时代。 -- beta-分享 小组');
	}
};

function header(){
	var oBody = document.getElementsByTagName('body')[0];
	var reg = document.getElementById('showreg');
	var login = document.getElementById('showlogin');
	var regBox = document.getElementById('reg-box');
	var loginBox = document.getElementById('login-box');
	var oUser = document.getElementById('header-person');
	var oList = document.getElementById('header-nav');

	if(reg && regBox && oBody && login && loginBox){
			EventUtil.addHandler(reg,'click',function(event){
				var event = EventUtil.getEvent(event);
				EventUtil.preventDefault(event);   //阻止默认
				EventUtil.stopPropagation(event);  //阻止冒泡
				oBody.className = 'body-bg';
				regBox.style.display = 'block';
				loginBox.style.display = 'none';
				checkReg();
			});

			EventUtil.addHandler(login,'click',function(event){
				var event = EventUtil.getEvent(event);
				EventUtil.preventDefault(event);
				EventUtil.stopPropagation(event);
				oBody.className = 'body-bg';
				regBox.style.display = 'none';
				loginBox.style.display = 'block';
				checkLogin();
			});

			EventUtil.addHandler(document.documentElement,'click',function(event){
				oBody.className = '';
				regBox.style.display = 'none';
				loginBox.style.display = 'none';
			});

			EventUtil.addHandler(regBox,'click',function(event){
				var event = EventUtil.getEvent(event);
				EventUtil.stopPropagation(event);
			});

			EventUtil.addHandler(loginBox,'click',function(event){
				var event = EventUtil.getEvent(event);
				EventUtil.stopPropagation(event);
			});
	}

	if(oUser&&oList){
		EventUtil.addHandler(oUser,'click',function(event){
			var event = EventUtil.getEvent(event);
			EventUtil.preventDefault(event);
			EventUtil.stopPropagation(event);
			oList.style.display='block';
		});

		EventUtil.addHandler(document,'click',function(event){
			oList.style.display='none';
		});
	}
}

function editinfo(){
	var oList = document.getElementById('edit-list');
	var editName = document.getElementById('edit-username');
	var editPsw = document.getElementById('edit-password');
	var editHead = document.getElementById('edit-header');
	if(oList && editName && editHead && editPsw){
		editPsw.style.display=editHead.style.display='none';
		var aA = oList.getElementsByTagName('a');
		EventUtil.addHandler(oList,'click',function(event){
			var event = EventUtil.getEvent(event);
			//事件委托
			EventUtil.preventDefault(event);
			var target = EventUtil.getTarget(event);
			switch(target.title){
				case 'edit-username':
					editPsw.style.display=editHead.style.display='none';
					editName.style.display='block';
					break;
				case 'edit-password':
					editName.style.display=editHead.style.display='none';
					editPsw.style.display='block';
					break;
				case 'edit-header':
					editName.style.display=editPsw.style.display='none';
					editHead.style.display='block';
					break;
			}
		});
		// var editOldPsw = document.getElementById('edit-password');
		//focusout 支持事件冒泡
		EventUtil.addHandler(editPsw,'focusout',function(event){
			var event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);
			switch(target.id){
				case 'edit-new-psw':
					if(target.value.length<6){
						target.nextSibling.nextSibling.style.display='block';
					}else{
						//嘿嘿   这里有一个全局变量
						editpsw = target.value;
						target.nextSibling.nextSibling.style.display='none';
					}
				break;

				// case 'edit-re-new-psw':
				// 	if(target.value != editpsw){
				// 		target.nextSibling.nextSibling.style.display='block';
				// 	}else{
				// 		target.nextSibling.nextSibling.style.display='none';
				// 	}
				// break;
			};
		});
	}
}


function checkReg(){
  var regBox = document.getElementById('reg-box');
	var toLogin = document.getElementById('tologin');

	//focusin  事件冒泡  事件委托
	EventUtil.addHandler(regBox,'focusin',function(event){
		var event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		target.style.backgroundColor = '#FFFFCC';
		if(target.id == 'reg-btn'){
			target.style.backgroundColor = '';
			var aP = regBox.getElementsByTagName('p');
			if(ap){
				for(var i = 0,len = aP.length;i<len;i++){
					if(aP[i].style.display == 'block'){
						EventUtil.preventDefault(event);
					}
				}
			}
		}
	});
	EventUtil.addHandler(regBox,'focusout',function(event){
		var event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		target.style.backgroundColor = '';
		switch(target.id){
			case 'reg-email':
				console.log(target.value);
				console.log(target.nextSibling.nextSibling);
				if(!/^[A-Za-zd0-9]+([-_.][A-Za-zd0-9]+)*@([A-Za-zd0-9]+[-.])+[A-Za-zd]{2,5}$/.test(target.value)){
					target.nextSibling.nextSibling.style.display='block';
				}else{
					target.nextSibling.nextSibling.style.display='none';
				}
			break;
			case 'reg-name':
				if(!/^[A-Za-zd0-9\u4e00-\u9fa5]+$/.test(target.value)){
					target.nextSibling.nextSibling.style.display='block';
				}else{
					target.nextSibling.nextSibling.style.display='none';
				}
			break;
			case 'reg-psw':
				if(target.value.length<6){
					// psw = target.value;
					target.nextSibling.nextSibling.style.display='block';
				}else{
					//嘿嘿   这里有一个全局变量
					psw = target.value;
					console.log(psw);
					target.nextSibling.nextSibling.style.display='none';
				}
			break;
			// case 'reg-repsw':
			// 	if(target.value != psw){
			// 		console.log(psw);
			// 		console.log(target.value);
			// 		target.nextSibling.nextSibling.style.display='block';
			// 	}else{
			// 		target.nextSibling.nextSibling.style.display='none';
			// 	}
			// break;
			case 'reg-url':
				if(target.value != ''){
					// console.log(target.value);
					// url 正则有待改善
					if(!/^([http|https]+:\/\/)+[A-Za-zd0-9\.\:]*$/ig.test(target.value)){
						console.log('不匹配');
						target.nextSibling.nextSibling.style.display='block';
					}else{
						target.nextSibling.nextSibling.style.display='none';
					}
				}
		}
	});
	// 注册进入登录的端口
	EventUtil.addHandler(toLogin,'click',function(event){
		var event = EventUtil.getEvent(event);
		EventUtil.preventDefault(event);
		EventUtil.stopPropagation(event);
		var loginBox = document.getElementById('login-box');
		regBox.style.display='none';
		loginBox.style.display='block';
	});
}

function checkLogin(){
	var loginBox = document.getElementById('login-box');
	EventUtil.addHandler(loginBox,'focusin',function(event){
		var event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		target.style.backgroundColor = '#FFFFCC';
	});
	EventUtil.addHandler(loginBox,'focusout',function(event){
		var event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);
		console.log(target);
		switch(target.id){
			case 'login-emial':
				if(!/^[A-Za-zd0-9]+([-_.][A-Za-zd0-9]+)*@([A-Za-zd0-9]+[-.])+[A-Za-zd]{2,5}$/.test(target.value)){
					target.nextSibling.nextSibling.style.display='block';
				}else{
					target.nextSibling.nextSibling.style.display='none';
				}
			break;
			case 'login-psw':
				if(target.value.length<6){
					target.nextSibling.nextSibling.style.display='block';
				}else{
					target.nextSibling.nextSibling.style.display='none';
				}
			break;
		}
	});
}

//取消注册
function preventReg(){
	var regBtn = document.getElementById('reg-btn');
	EventUtil.addHandler(regBtn,'click',function(event){
		var event = EventUtil.getEvent(event);
		EventUtil.preventDefault(event);
		console.log('阻止注册');
	});
}

function preventLogin(){
	var loginBtn = document.getElementById('login-btn');
	EventUtil.addHandler(loginBtn,'click',function(event){
		var event = EventUtil.getEvent(event);
		EventUtil.preventDefault(event);
		console.log('阻止登录');
	});
}


function flashOut(){
	var sucFlash = document.getElementById('suc-flash');
	var errFlash = document.getElementById('err-flash');
	var timer = null;
	if(sucFlash){
		if(timer){
			clearTimeout(timer);
		}
		timer = setTimeout(function(){
			sucFlash.style.display ='none';
		},2220);
	}

	if(errFlash){
		if(timer){
			clearTimeout(timer);
		}
		timer = setTimeout(function(){
			errFlash.style.display ='none';
		},2220);
	}
}


function editBg(){
	var editBg = document.getElementById('editBg');
	var inputBg = document.getElementById('inputBg');
	if(editBg && inputBg){
		EventUtil.addHandler(editBg,'click',function(event){
			console.log('hello world');
			var event = EventUtil.getEvent(event);
			EventUtil.stopPropagation(event);
			inputBg.click();
		});

		// EventUtil.addHandler(inputBg,'click',function(event){
		// 	var event = EventUtil.getEvent(event);
		// 	var target = EventUtil.getTarget(event);
		// 	EventUtil.stopPropagation(event);
		// 	console.log(target);
		// });
		EventUtil.addHandler(inputBg,'change',function(event){
			var event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);
			console.log('目标'+target);
			uploadFile(event,target);
			console.log(target.files);
		});
	}
}
function uploadImgList(){
	var postInputImg = document.getElementById('post-inputImg');
	var postImgList = document.getElementById('post-imgList');
	var editInputImg = document.getElementById('edit-inputImg');
	var editImgList = document.getElementById('edit-imgList');
	if(postInputImg){
		EventUtil.addHandler(postInputImg,'change',function(event){
			var event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);
			// console.log(target.files);
			uploadFile(event,target);
		});
	}
	if(editInputImg){
		EventUtil.addHandler(editInputImg,'change',function(event){
			var event = EventUtil.getEvent(event);
			var target = EventUtil.getTarget(event);
			// console.log(target.files);
			uploadFile(event,target);
		});
	}
}

//ajax 上传文件
function uploadFile(event,target){
	var files = target.files;
	// console.log('files 类型'+typeof files+',files length'+files.length);
	var output = [];
	for(var i = 0,len = files.length; i < len; i++ ){
		var f = files[i];
		if(!f.type.match('image.*')){
			continue;
		}
		var reader = new FileReader();
		EventUtil.addHandler(reader,'load',(function(theFile){
			return function(e){
				var imgBg = document.getElementById('imgBg');
				var postInputImg = document.getElementById('post-inputImg');
				var editInputImg = document.getElementById('edit-inputImg');
				if(imgBg){
					//编辑个人中心背景
	        imgBg.src=e.target.result;
	        var userId = document.getElementById('inputBg').title;
	        console.log(e.target.result);
	        console.log(userId);
	        var params = formatParams({ imgSrc:e.target.result,userId:userId});
	        createAjax(params);
				}else if(postInputImg){
					//发布文章
					var oUl = document.getElementById('post-imgList');
					var oLi = document.createElement('li');
					var oImg = document.createElement('img');
					oImg.src = e.target.result;
					var filename = escape(theFile.name);
					oLi.appendChild(oImg);
					oLi.appendChild(document.createTextNode(filename));
					oUl.insertBefore(oLi,oUl.firstChild);
					//addImgSrc();
				}else if(editInputImg){
				//编辑文章页
					var oUl = document.getElementById('edit-imgList');
					var oLi = document.createElement('li');
					var oImg = document.createElement('img');
					oImg.src = e.target.result;
					var filename = escape(theFile.name);
					oLi.appendChild(oImg);
					oLi.appendChild(document.createTextNode(filename));
					oUl.insertBefore(oLi,oUl.firstChild);
					//addImgSrc();
				}
			}
		})(f));
		reader.readAsDataURL(f);
	}
}

function createAjax(params){
	var xhr = null;
	if(window.XMLHttpRequest){
		xhr = new window.XMLHttpRequest();
	}else{
		xhr = new XMLHttpRequest();
	}
	xhr.open('POST','/person',true);
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			var result = xhr.responseText;
			console.log(result);
		}
	};
	xhr.send(params);
}
 //格式化参数
function formatParams(data) {
    var arr = [];
    for (var name in data) {
        arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    }
    arr.push(("v=" + Math.random()).replace("."));
    return arr.join("&");
}

// function addImgSrc(){
// 	var postUl = document.getElementById('post-imgList');
// 	var editUl = document.getElementById('edit-imgList');
// 	if(postUl){
// 		var area = document.getElementById('postarea');
// 		var postInputImg = document.getElementById('post-inputImg');
// 		renderImgSrc(postUl,area);
// 	}else if(editUl){
// 		var area = document.getElementById('editarea');
// 		var editInputImg = document.getElementById('edit-inputImg');
// 		renderImgSrc(editUl,area);
// 	}
// }

// function renderImgSrc(node,area){
// 	var oImg = node.getElementsByTagName('img')[0];
// 	console.log('hello ');
// 		console.log(oImg);

// 	if(oImg){
// 		console.log(oImg);
// 		var txt = document.createTextNode('![]('+oImg.src+')');
// 		area.appendChild(txt);
// 		console.log(txt);
// 	}
// }













