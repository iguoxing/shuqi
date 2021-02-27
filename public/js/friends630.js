$(document).ready(function() {
	
	var $nav = $('#nav'),
		$cover = $('#cover'),
		$videoBg = $('#videoBg'),
		$imgBg = $('#imgBg'),
		$tPlayer = null,
		$tips = $('#tips'),/////////////
		$next = $('#next'),///////////////
		$backTop = $('#backtop'),/////////////////
		$logo = $('#logo'),
		$mainTit = $('#maintit'),
		$slider=$('#slider'),///////
		$sliderImgs=$('img',$slider),/////////////
		$sliderDes=$('#slide-figure-des'),//////////////
		$supplement=$('.mode-supplement'),/////////////
		$narrowscreen=$('.narrow-screen');////////////////
		
	//取得页头、页脚、导航尺寸
	var navH = $nav.height(),
		toolbarH = 0,
		footerH = 0;

	//封面图片原始尺寸、窗口大小,封面容器、logo尺寸，标题字号
	var imgW, imgH, winW, winH, coverW, coverH, logoW, logoH, mainTitFontSize = 9;

	//封面、图片、视频比例
	var coverRatio, imgRatio, hRatiov, vRatio = 16 / 9;
	
	var scrollH,documentH;////////////////

	var imgReady = false; //是否加载过图片
	var videoSupport = checkVideoSupport();
	var resizing = null;
	var tPlayerAdded = false;
	var slideFullPage = false;
	var initScrollTop=$(document).scrollTop();//初始滚动条位置
	var scrolling=false;
	
	
	//初始化
	function init() {
		ie6=!-[1,]&&!window.XMLHttpRequest;
		if(ie6){
			$logo.find('img').attr('src','http://mat1.gtimg.com/news/friends/bg/logobig.gif');
			$slider.next().andSelf().hide();
		}
		
		//logo尺寸、比例
		if ($logo.hasClass('home-logo')) {
			logoW = 640;
			logoH = 619;
		} else {
			logoW = 202;
			logoH = 200;
		}
		logoRatio = logoW / logoH;
		
		//初始化封面视频
		coverInit();

		//首屏视频播放按钮
		$('#playBtn').click(function(event) {
			var vid = $(this).attr('data-vid');
			createTplayer(vid, 'tplayer');//创建主要视频容器
			event.preventDefault();
		});

		 
		
		//窗口滚动
		$(window).scroll(function() {
			var tempScrollTop=$(document).scrollTop();
			if(tempScrollTop>initScrollTop){//向下滚
				doScroll('down',tempScrollTop);
			} else {//向上滚动
				doScroll('up',tempScrollTop);
			}
			initScrollTop=tempScrollTop;
		});

 
 
		
		$(window).resize(function() {
			if (resizing) {
				clearTimeout(resizing);
			}
			resizing = setTimeout(function() {
				coverInit();
			}, 30);
		});
		
	 
	}

	/*封面初始化*/
	function coverInit() {
		//窗口尺寸
		winW = $(window).width(),
		winH = $(window).height();
		//cover高度
		coverW = winW,
		coverH = winH - toolbarH - footerH - navH;
/*		
		$cover.css({
			height: coverH + 'px'
		});
*/		
		if(!$cover.is('.thanks')){
			$cover.css({
				height: coverH + 'px'
			});
		} else {
			$cover.css({
				height: (coverW/imgRatio) + 'px'
			});
		}
		
		
		
		//添加移除侧边栏
		if(winW<920){//////////////优化
			$supplement.fadeOut(function(){
				$narrowscreen.css({
					paddingRight:10+'px'
				});
			});
		} else {
				$narrowscreen.css({
					paddingRight:230+'px'
				});
			$supplement.fadeIn();
		}
		if($cover.is('.thanks')){
			  $narrowscreen.css({
				  paddingRight:10+'px'
			  });
		}
		//documentH=$('.content').innerHeight();
		//console.log( document.body.scrollHeight);

		//cover比例
		coverRatio = coverW / coverH;
		hRatio = coverH / 830;
		
		//缩放视频or缩放图片
		if (videoSupport && !$cover.is('.thanks')) {
			scale($videoBg, coverRatio, vRatio);
		} else {
			if (imgReady && !$cover.is('.thanks')) {//是否加载过图片
				scale($imgBg, coverRatio, imgRatio);
			} else {
				imgLoad($imgBg.attr('src'), function() {
					imgReady = true;
					if(!$cover.is('.thanks')){
						scale($imgBg, coverRatio, imgRatio);
					}
				});
			}
		}
		
		//主视频缩放
		if (tPlayerAdded) {
			scaleMainV();
		}

		//缩放logo
		scaleLogo();
	}

	/*缩放封面图、视频（宽高全面覆盖）*/
	function scale(elm, coverRatio, ratio) { //缩放元素，容器尺寸比例，缩放比例
		var tempW, tempH, tempLeft, tempTop;
		if (ratio >= coverRatio) {
			tempH = coverH;
			tempW = tempH * ratio;
		} else {
			tempW = coverW;
			tempH = coverW / ratio;
		}
		tempLeft = (coverW - tempW) / 2;
		tempTop = (coverH - tempH) / 2;
		elm.css({
			width: tempW + 'px',
			height: tempH + 'px',
			left: tempLeft + 'px',
			top: tempTop + 'px'
		})
	}
	
	//缩放logo
	function scaleLogo() {
		var tempW, tempH;
		tempH = logoH * hRatio;
		tempW = tempH * logoRatio;
		//console.log('logoW:' + tempW + ' logoH:' + tempH);
		$logo.css({
			width: tempW + 'px',
			height: tempH + 'px'
		});
		var tempFontSize = mainTitFontSize * hRatio;
		$mainTit.css({
			fontSize: tempFontSize + 'em'
		});
	}

	//加载图片
	function imgLoad(url, callback) {
		var img = new Image();
		img.src = url;
		if (img.complete) {
			imgW = img.width;
			imgH = img.height;
			imgRatio = imgW / imgH;
			callback();
		} else {
			img.onload = function() {
				imgW = img.width;
				imgH = img.height;
				imgRatio = imgW / imgH;
				callback();
				img.onload = null;
			}
		}
	}

	//检测浏览是否支持视频
	function checkVideoSupport() {
		var tempVideo = document.createElement('video');
		if (tempVideo.canPlayType && !$cover.is('.thanks')) {
			$('#main').show();
			$('#loading').hide();
			var videoBg = $videoBg.get(0);
			videoBg.addEventListener('loadstart', function() {
				//alert('还是加载视频');
			});
				videoBg.addEventListener('canplaythrough',function(){
				$videoBg.get(0).play();
			});
			return true;
		} else {
			imgLoad($imgBg.attr('src'), function() {
				$('#main').show();
				$('#loading').hide();
			});
			return false;
		}
		
	}

	//创建首屏主视频播放播放框
	function createTplayer(vid,targetId) {
		if (!tPlayerAdded) {
			var tempV = $('<div class="mainvideo"><div class="close"  id="close"><i class="ico"></i></div><div class="tplayer" id="tplayer"></div></div>');
			$('#mode-share').after(tempV);
			$tPlayer = $('#tplayer');
			scaleMainV(); //缩放视频播放器窗口
			if($cover.is('.home')){
				addTenPlayer(vid,targetId,'100%','100%',function(){
					window.location.href='http://news.qq.com/zt2014/friends/friends1.htm';
				});
			} else {
				addTenPlayer(vid,targetId,'100%','100%',function(){
					doScroll('down');
					removeTenPlayer();
				});
			
			}
			tPlayerAdded = true;
			$('#close').click(removeTenPlayer);
		}
	}
	//缩放首屏主视频播放框
	function scaleMainV() {
		var tempW, tempH, tempLeft, tempTop;
		if (vRatio <= coverRatio) {
			tempH = coverH;
			tempW = (tempH)* vRatio; //视频播放器皮肤有20的边
		} else {
			tempW = coverW;
			tempH = (coverW / vRatio);
		}
		tempLeft = (coverW - tempW) / 2;
		tempTop = (coverH - tempH) / 2;
		$tPlayer.css({
			width: tempW + 'px',
			height: tempH + 'px',
			left: tempLeft + 'px',
			top: tempTop + 'px'
		})
	}

	//添加视频播放器
	function addTenPlayer(vid, place, w, h,callback) {
		var video = new tvp.VideoInfo();
		video.setVid(vid);
		var myplayer = new tvp.Player();
		myplayer.create({
			width: w || 100 + '%',
			height: h || 100 + '%',
			video: video,
			modId: place,
			autoplay:true,
			vodFlashSkin: "http://imgcache.qq.com/minivideo_v1/vd/res/skins/TencentPlayerMiniSkin.swf",
			flashWmode: 'opaque',
			onallended:callback
		});
	}

	//移除首屏主视频
	function removeTenPlayer() {
		//if (tPlayerAdded) {
			$('.mainvideo').remove();
			tPlayerAdded = false;
		//}
	}

 

	

	
 
	
	init();

});/*  |xGv00|2d20d3d71b569197848a857af52115a8 */