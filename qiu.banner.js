/*
 * form qiu
 * 手势轮播图
 */
;(function($){
	$.qiu_banner = function(arr){
		
		var transitionend,
			transform;
		var onstart,
			onmove,
			onend,
			mobile = "ontouchend" in document?true:false;
		if(mobile){
			onstart = "touchstart";
			onmove = "touchmove";
			onend = "touchend";	
		}else{
			onstart = "mousedown";
			onmove = "mousemove";
			onend = "mouseup";	
		}
			
		//transform
		function fn_transform(){
			var transforms = [
				"-webkit-transform",
				"transform",
				"-o-transform",
				"-moz-transform",
				"-ms-transform",
			],
				transitions = [
				 'webkitTransitionEnd',
    			 'transitionend',
    			 'oTransitionEnd',
    	         'transitionEnd',
    	         'msTransitionEnd',
				]
			for(var i=0;i<transforms.length;i++)
			{
				if(transforms[i] in document.documentElement.style)
				{
					transform =  transforms[i];
					transitionend = transitions[i];
				}
			}
		};
		fn_transform();
		var init = {
			obj:'.banner',
			list:'.banner>ul',//
			cell:"cell",//cell's class
			loop:true,//循环
			time:3000,//间隔时间
			duration:200,//速度
			distence:'',
			fun:function(){},
		};
		//初始化
		if (arr) $.extend(init,arr);
		var $obj = $(init.obj),
			$list = $obj.find(init.list),
			$cell = $obj.find('.'+init.cell),			
			start_x = 0,
			start_y = 0,
			move_x = 0,
			old_move_x = 0,//存储上次x的移动距离
			width = $cell.width(),
			distence = init.distence?init.distence:width/2,
			duration = init.duration+'ms',
			size = $cell.size(),
			index = 0,//图片引索
			t = '',//预存循环事件
			translate = 0,//图片集偏移
			fx = '';//播放方向
		//error
		if($obj.size()<1){
			throw new Error("obj is no an object");
		}else if(!$list){
			throw new Error("list is no an object");
		}else if(size == 0){
			throw new Error("cell is no an classname");
		}
		//循环用html
		if(init.loop){			
			$list.append("<div class='"+init.cell+"'>"+$cell.eq(0).html()+"</div>");
			$cell.eq(0).before("<div class='"+init.cell+"'>"+$cell.eq(size-1).html()+"</div>");
			//刷新js的dom;
			$cell = $obj.find('.'+init.cell);
			size = $cell.size();
			index = 1; 
		}
		$cell.eq(index).addClass('active');
		gotocell(index);
		//添加结束时的过渡
		transfun("transition-property",'all');
		transfun("transition-timing-function","linear");
		transfun("transition-duration",'0ms');
		//0,窗口改变
		var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
		window.addEventListener(resizeEvt, recalc, false);
		function recalc(){
			//重新计算宽度
			width = $cell.width();
			if(!init.distence)distence = width/2;
			gotocell(index);
		}
		//1,开始拖动
		$obj[0].addEventListener(onstart,move_start,false);
		function move_start(e){
			start_x = positionX(e);
			start_y = positionY(e)
			old_move_x = 0;
			if(init.time)clearTimeout(t);
			transfun("transition-duration","0ms");			
			 //是否支持touch
			if (!mobile)e.preventDefault();
			document.addEventListener(onmove,move_ing,false);
		}
		//2，拖动中
		function move_ing(e){
				move_x = positionX(e) - start_x;
				move_y = positionY(e) - start_y;
				//获得相对于上次的移动距离
				translate +=(move_x-old_move_x);
				$list.css(transform,"translate3d("+translate+"px,0,0)");
				//进行超出计算,误差4
				var top = $obj.offset().top;
				if(positionX(e)<=4||positionX(e)>=$cell.width()-4||positionY(e)<top+4||positionY(e)>(top+$obj.height())-4){
					move_end();
					
				};
				//存储上次的位置
				old_move_x = move_x;
				//处理浏览器默认事件
				if(move_x>10&&-10<move_y<10||move_x<10&&-10<move_y<10){
					e.preventDefault();	
					//解决pc的触发问题
					if(!mobile)$list.on('click','a',clickfalse);
				}else{
					//mobile 时
					if(mobile)move_end(e);
				}			
		}
		//3，结束拖动
		$obj[0].addEventListener(onend,move_end,false);
		function move_end(e){
				var mo = Math.max(move_x,(move_x*-1));
				//判断的触发
				if(mo>distence){
				//判断方向
					if(move_x < 0&&index<size-1)
					{
						index++;
					}else if(move_x > 0&&index!=0){
						index--;
					}		
				}				
				gotocell(index);
				document.removeEventListener(onmove,move_ing,false);
		}
		//pc取消a触发
		function clickfalse(){
			$list.off('click','a',clickfalse);
			return false;
		}
		//执行轮播
		function timefun(){
			
			if(!init.loop&&fx=='right'){
				index--;
			}else{
				index++;
			}
			gotocell(index);
		}
		//轮播跳转index
		function gotocell(no){
			transfun("transition-duration",duration);
			transitionfun(no);
			if(init.time){
				clearTimeout(t);
				t = setTimeout(timefun,init.time);
			};
			$list[0].addEventListener(transitionend,function(){
				transfun("transition-duration",'0ms');
				//循环
				if(init.loop&&no ==0)
				{
					no = (size-2);
					transitionfun(no);
				}else if(init.loop&&no ==size-1){
					
					no = 1;
					transitionfun(no);
				};
				return add_class(no);
			},false);
		}
		//偏移index
		function transitionfun(no){
			//保护
			if(no<0)
			{
				index = 0;
				return false;
			}else if(no >= size){
				index = size-1;
				return false;
			}
			//转向
			if(!init.loop&&index == size-1){
				fx ='right';  
			}else if(!init.loop&&index == 0)
			{
				fx = false;
			}
			translate = no*width*-1;
			$list.css(transform,"translate3d("+translate+"px,0,0)");
			index = no;	
		}
		//add class
		function add_class(no){
			$cell.eq(no).addClass('active').siblings('.active').removeClass('active');
			if(init.loop)no--;
			if(init.fun)init.fun(no);
		}
		//浏览器判断 css style_name value[string]
		function transfun(str,value){
			var trans = '';
			
			if(transform.match(/webkit/i)){
				trans = '-webkit-'+str;
			}else{
				trans = str;
			}
			return $list.css(trans,value);
		}
		//position page x
		function positionX(e) {
			var x = e.pageX;
			if (e.targetTouches) {
				x = e.targetTouches[0].pageX; //zepto
			} else if (e.originalEvent&&"ontouchend" in document) {
				x = e.originalEvent.touches[0].pageX; //jquery
			}
			return x;
		}
		//position page x
		function positionY(e) {
			var y = e.pageY;
			if (e.targetTouches) {
				y = e.targetTouches[0].pageY; //zepto
			} else if (e.originalEvent&&"ontouchend" in document) {
				y = e.originalEvent.touches[0].pageY; //jquery
			}
			return y;
		}
		
	  //trigger
	  this.trigger= function(i){
	  	gotocell(i);
	  }
	  this.swipe = function (str){
	  	if(str == 'right'){
	  		index--;
	  		gotocell(index);
	  	}else{
	  		index++;
	  		gotocell(index);
	  	}
	  	return index;
	  }
	  this.stop = function(){
	  	clearTimeout(t);
	  }
	  this.start = function(time){
	  	if(time)init.time = time;
	  	clearTimeout(t);
	  	t = setTimeout(timefun,init.time);
	  }
	}//banner
})(window.jQuery||window.Zepto)
