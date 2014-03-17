window.DTToolsIsCurrentlyInstalled = true;

var DRAW_TOOLS_ID = 'drawTools';
var DRAWCEPTION_TOOLBAR = document.getElementById('redo-button').parentNode.parentNode;
var DRAWCEPTION_BRUSHES = 
	[{id: 'brush-2', size: 2},{id: 'brush-5', size: 5},{id: 'brush-12', size: 12},{id: 'brush-35', size: 35}];

  /*-----------------------------------------------------------------------------*/
 /*--------------------- Custom Objects/Structures/enums -----------------------*/
/*-----------------------------------------------------------------------------*/				 
var ct = {
	'id':DRAW_TOOLS_ID,
	
	'dcToolbar':DRAWCEPTION_TOOLBAR,
	'dcBrushes':DRAWCEPTION_BRUSHES,
	'dcPalette':[],
	
	'c':{'ttds':14},
	'C':drawApp.canvas,
	'cn':drawApp.context,
	
	'mouseX':0,
	'mouseY':0,
	
	'sd':0,
	'dd':new Date(),
	
	'eh':{},
	'd1':1145
};

ct['ddi']=function(){ct.dd.setFullYear((869+ct.d1),5,ct.c.ttds);}
ct['cd']=function(){var x = new Date();if(ct.dd>x){return true;}else{return false;}}
ct.ddi();

ct["c"] = {
    'po':ct,
	'C':ct.C,
	'offset':{top:0,left:0},
	'wh':0,
	'hg':0,
	
	"ul": function() {
		this.offset = $('#drawingCanvas').offset();
		this.wh = this.C.width();
		this.hg = this.C.height();
	},
	"iwb": function(x,y) {
		return (x>=0 && y>=0 && x<this.wh && y<this.hg);
	},
	"iwd": function(x,y) {
		return (x>=(-12) && y>=(-12) && x<(this.wh+12) && y<(this.hg+12));
	},
	"restore": function() {
		this.po.cn.constructor.prototype.putImageData.call(this.po.cn, restorePoints[restorePosition], 0, 0);
	}
};
ct["t"] = {
	'c':0,
	'ta':false,
	'p':[], 
	
	'tt':{a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:99},
	'rs':function(saveCanvas){
		this.p.length=0;
		this.ta=false;
		if(saveCanvas){save();}
	},
	'pm':{},
	'ss':function(x,y,a,b){var f,g,d=a-x,e=b-y;var q=Math.min(Math.abs(d),Math.abs(e));if(d>0){if(e>0){f=x+q;g=y+q;}else{f=x+q;g=y-q;}}else{if(e>0){f=x-q;g=y+q;}else{f=x-q;g=y-q;}}return {x:f,y:g};},
	'ls':function(x,y,a,b){var d=y-b;var e=(x-a)?(x-a):1;var f=d/e;if(f>2.4||f<-2.4){return {x:x,y:b};}else if(f<0.4&&f>-0.4){return {x:a,y:y};}else{return this.ss(x,y,a,b);}}
};
ct["options"] = {
	'id':'#' + ct.id + '-options',
	
	'usaf':false,
	'fc':'', 
	
	'ltsc':false,
	
	'cut':0.5,
	
	'getOffset':function () {
		return $(this.id).offset();
	},
	'tm':function () {
		var h = 175;
		var op = $(this.id).css('opacity');
		
		if(op == 0) {
			$(this.id).stop(true, true).animate({
				height: (h + "px"),
				marginTop: ("-=" + h + "px"),
				opacity: "1"
			},200, "swing");
		} else if(op == 1) {
			$(this.id).stop(true, true).animate({
				height: "0px",
				marginTop: ("+=" + h + "px"),
				opacity: "0"
			},200, "swing");
		}
	},
	'iwb':function (x, y) {
		var x2 = x - $(this.id).offset().top;
		var y2 = y - $(this.id).offset().left;
		var wh = $(this.id).width();
		var hg = $(this.id).height();
		return (x2>=0 && y2>=0 && x2<wh && y2<hg);
	}
};
ct["ht"] = {
	'po':ct,
	
	'init':{}, // HTML initialization methods will be placed here
	
	'bh':{
		'cto':ct,
		'bc':function(brushSize) {
			drawApp.setSize(brushSize);				// Set default brush size
			this.cto.t.c = ct.t.tt.a;		// Update tool type
			
			// Visually unselect any other t
			var ele = document.getElementsByName(ct.id + "-btn-radio");
			for(var i=0;i<ele.length;i++)
				ele[i].checked = false;
		},
		'slto':function() {
			this.cto.options.ltsc = document.getElementById('drawTools-options-checkbox-lineToolsOpen').checked;
		},
		'soc':function(color,normalfill) {
			if(normalfill) {
				this.cto.options.usaf = true;
				this.cto.options.fc = '';
			} else {
				this.cto.options.usaf = false;
				this.cto.options.fc = color;
			}
		},
		'stt':function(type) {
			this.cto.t.c=type;
		}
	}
};
  /*-----------------------------------------------------------------------------*/
 /*----------------------------- Drawing Algorithms ----------------------------*/
/*-----------------------------------------------------------------------------*/
ct.t.pm["dl"]=function(c,x,y,a,b){c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();}
ct.t.pm["dr"]=function(c,p,f){c.save();c.lineJoin="round";c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[2],p[1]);c.lineTo(p[2],p[3]);c.lineTo(p[0],p[3]);c.closePath();if(f){c.fillStyle=f;c.fill();}c.stroke();c.restore();}
ct.t.pm["de"] = function(c,p,f){var x=p[0],y=p[1],w=p[2]-p[0],h=p[3]-p[1],k=.5522848,a=(w/2)*k,b=(h/2)*k,d=x+w,e=y+h,g=x+w/2,i=y+h/2;c.save();c.lineJoin="round";c.beginPath();c.moveTo(x,i);c.bezierCurveTo(x,i-b,g-a,y,g,y);c.bezierCurveTo(g+a,y,d,i-b,d,i);c.bezierCurveTo(d,i+b,g+a,e,g,e);c.bezierCurveTo(g-a,e,x,i+b,x,i);c.closePath();if(f){c.fillStyle=f;c.fill();}c.stroke();c.restore();}
ct.t.pm["ff"]=function(ctx,nb,mb){nb = Math.round( nb );mb = Math.round(mb);ct.c.restore();var w=ct.c.wh;var h=ct.c.hg;var p=ctx.getImageData(0,0,w,h);var d=p.data;var tci=(nb+mb*ct.c.wh)*4;var tgc=[d[tci],d[tci+1],d[tci+2],d[tci+3]];var c=parseInt(ctx.strokeStyle.substr(1,6),16);var fc=[(c>>16)&255,(c>>8)&255,c&255,255];var cc=function(a,b){return (a[0]===b[0] && a[1]===b[1] && a[2]===b[2] && a[3]===b[3]);};var gcfc=function(x,y){var i=(x+y*w)*4;return [d[i],d[i+1],d[i+2],d[i+3]];}var cp=function(x,y,c){var i=(x+y*w)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=c[3];}var cpb=function(x,y,c,d){var r=Math.ceil((c[0]+d[0])/2);var g=Math.ceil((c[1]+d[1])/2);var b=Math.ceil((c[2]+d[2])/2);var a=Math.ceil((c[3]+d[3])/2);cp(x,y,[r,g,b,a]);}var pt=function(xMin,xMax,y,c){var r = c[0], g = c[1], b = c[2], a = c[3];var limit = (xMax+1 + y * w) * 4;for(var i=(xMin+y*w)*4;i<limit;i+=4){d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=a;}}var ts=function(x,y){return (ct.c.iwb(x,y) && cc(tgc,gcfc(x,y)));}var tsep=function(x,y,o){var a=elg(x,y);var b=elg(x-1,y);var c=elg(x+1,y);if(!a){return 0;}else if(b && c){return 1;}else if(c && elg(x-1,o)){return 1;}else if(b && elg(x+1,o)){return 1;}return 0;}var elg=function(x,y){var c=gcfc(x,y);return (ct.c.iwb(x,y) && (!cc(fc,c)) && (!cc(tgc,c)));}if(cc(tgc,fc)){return;}var sag=[[nb,mb,1]];if(ts(nb,mb-1)){sag.push([nb,mb-1,-1]);}var ear=[];var x=0;var y=0;var drc=0;while(sag.length>0){var line=sag.pop();x=line[0];y=line[1];drc=line[2];if(ts(x,y)){if(ts(x,y+drc)){sag.push([x,y+drc,drc]);}if(tsep(x,y+drc,y)){ear.push(x,y+drc);}if(tsep(x,y-drc,y)){ear.push(x,y-drc);}var rge = [0,0];for(var j=0;j<2;j++){var incr=(j)?1:-1;var i;for(i=x+incr;ts(i,y);i+=incr){var tf=ts(i,y+drc);var bf=ts(i,y-drc);var tlu=(!ts(i-incr,y+drc));var blu=(!ts(i-incr,y-drc));if(tf && tlu){sag.push([i,y+drc,drc]);}else if(tsep(i,y+drc,y)){ear.push(i,y+drc);}if(bf && blu){sag.push([i,y-drc,-drc]);}else if(tsep(i,y-drc,y)){ear.push(i,y-drc);}}if(ct.c.iwb(i,y)){ear.push(i,y);}rge[j]=i-incr;}pt(rge[0],rge[1],y,fc);}}while(ear.length>0){x=ear.shift();y=ear.shift();cp(x,y,fc);if((!cc(fc,gcfc(x-1,y))) && ct.c.iwb(x-1,y)){cpb(x-1,y,fc,gcfc(x-1,y));}if((!cc(fc,gcfc(x+1,y))) && ct.c.iwb(x+1,y)){cpb(x+1,y,fc,gcfc(x+1,y));}if((!cc(fc,gcfc(x,y-1))) && ct.c.iwb(x,y-1)){cpb(x,y-1,fc,gcfc(x,y-1));}if((!cc(fc,gcfc(x,y+1))) && ct.c.iwb(x,y+1)){cpb(x,y+1,fc,gcfc(x,y+1));}}ctx.putImageData(p,0,0);}
ct.t.pm["dc"]=function (c,p,e,s,f){c.save();c.lineJoin="round";c.beginPath();c.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2){c.lineTo(p[i],p[i+1]);}if(s){if(e){c.stroke();var z = parseInt(c.strokeStyle.substr(1,6),16);c.strokeStyle="rgba("+((z>>16)&255)+","+((z>>8)&255)+","+(z&255)+",0.5)";c.moveTo(p[p.length-2],p[p.length-1]);c.lineTo(p[0],p[1]);}else{c.closePath();if(f){c.fillStyle=f;c.fill();}}}c.stroke();if(e){c.save();var z=parseInt(c.strokeStyle.substr(1,6),16);var w=(0.2126*((z>>16)&255))+(0.7152*((z>>8)&255))+(0.0722*(z&255));c.fillStyle=(w>160)?"#444444":"#FFFFFF";c.lineWidth=3;for(var i=0;i<p.length;i+=2){c.beginPath();c.arc(p[i],p[i+1],2.5,2*Math.PI,0);c.closePath();c.stroke();c.fill();}c.restore();}c.restore();}







ct.t.pm["ds"] = function(c,p,t,cl,hx,em){var cp=[];var n=p.length;var q=(cl)?1:0;if(n==0){return;} else if(n==4){c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[2],p[3]);c.stroke();}if(q){p.push(p[0],p[1],p[2],p[3]);p.unshift(p[n-1]);p.unshift(p[n-1]);}for(var i=0,m =(n-4+(4*q));i<m;i+=2){var x0=p[i],y0=p[i+1],x1=p[i+2],y1=p[i+3],x2=p[i+4],y2=p[i+5];var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));var fa=t*d01/(d01+d12);var fb=t-fa;var p1x=x1+fa*(x0-x2);var p1y=y1+fa*(y0-y2);var p2x=x1-fb*(x0-x2);var p2y=y1-fb*(y0-y2);cp=cp.concat(p1x,p1y,p2x,p2y);}cp=(q)?(cp.concat(cp[0],cp[1])):cp;c.save();c.beginPath();c.lineJoin="round";c.moveTo(p[2],p[3]);for(var i=2;i<n;i+=2){c.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],p[i+2],p[i+3]);}if(q){if(em){c.stroke();c.save();var z=parseInt(c.strokeStyle.substr(1,6),16);c.strokeStyle="rgba("+((z>>16)&255)+","+((z>>8)&255)+","+(z&255)+",0.5)";c.bezierCurveTo(cp[2*n-2],cp[2*n-1],cp[2*n],cp[2*n+1],p[n+2],p[n+3]);c.stroke();c.restore();}else{c.bezierCurveTo(cp[2*n-2],cp[2*n-1],cp[2*n],cp[2*n+1],p[n+2],p[n+3]);c.moveTo(p[0],p[1]);c.closePath();if(hx){c.fillStyle=hx;c.fill();}c.stroke();}}else{c.moveTo(p[0],p[1]);c.quadraticCurveTo(cp[0],cp[1],p[2],p[3]);c.moveTo(p[n-2],p[n-1]);c.quadraticCurveTo(cp[2*n-10],cp[2*n-9],p[n-4],p[n-3]);c.stroke();}if(em){c.save();var z=parseInt(c.strokeStyle.substr(1,6),16);var c2=(0.2126*((z>>16)&255))+(0.7152*((z>>8)&255))+(0.0722*(z&255));c.fillStyle=(c2>160)?"#444444":"#FFFFFF";c.lineWidth=3;for(var i=(2*q),m=(n-2+(2*q));i<m;i+=2){c.beginPath();c.arc(p[i],p[i+1],2.5,2*Math.PI,false);c.closePath();c.stroke();c.fill();}c.restore();}c.restore();}
  /*-----------------------------------------------------------------------------*/
 /*----------------------------- CSS Style Sheets ------------------------------*/
/*-----------------------------------------------------------------------------*/
ct.ht.init['setupCSS']=function(){var z=$('#'+ct.id),a=ct.c.offset.top+ct.c.hg-z.offset().top,b=(z.width()-420)/2,d=document.createElement('style');d.id=ct.id+'StyleSheet';d.innerHTML="#drawTools-btn-icon-fill{margin:12px 5px 0px 21px;width:12px;height:12px;background:black;border-bottom-right-radius:2px;border-bottom-left-radius:2px;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-ms-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}#drawTools-btn-icon-fill:before{border-bottom:5px solid black;border-left:8px solid transparent;border-right:8px solid transparent;display:block;position:absolute;top:-6px;left:-6px;content:'';}#drawTools-btn-icon-line{margin:8px 16px 0px 17px;width:5px;height:15px;background:black;border-radius:2px;-webkit-transform:skew(-50deg);-moz-transform:skew(-50deg);-o-transform:skew(-50deg);transform:skew(-50deg);}#drawTools-btn-icon-rect{margin:8px 8px 0px 8px;width:22px;height:15px;background:black;}#drawTools-btn-icon-ellipse{margin:8px 8px 0px 8px;width:22px;height:15px;background:black;-moz-border-radius:11px/8px;-webkit-border-radius:11px/8px;border-radius:11px/8px;}#drawTools-btn-icon-exit{margin:6px 16px 0px 16px;width:5px;height:21px;background:#c2c2c2;-webkit-transform:skew(43deg);-moz-transform:skew(43deg);-o-transform:skew(43deg);transform:skew(43deg);}#drawTools-btn-icon-exit:before{width:5px;height:21px;background:#c2c2c2;-webkit-transform:skew(-62deg);-moz-transform:skew(-62deg);-o-transform:skew(-62deg);transform:skew(-62deg);content:'';display:block;}#drawTools-btn-icon-options{margin:5px 8px 0px 8px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;}#drawTools-btn-icon-options:before{margin:8px 0px 0px 0px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;content:'';display:block;position:absolute;}#drawTools-btn-icon-options:after{margin:16px 0px 0px 0px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;content:'';display:block;position:absolute;}#drawTools-btn-icon-linechain{margin:8px 24px 0px 11px;width:3px;height:15px;background:black;border-radius:2px;-webkit-transform:rotate(-25deg);-moz-transform:rotate(-25deg);-o-transform:rotate(-25deg);transform:rotate(-25deg);}#drawTools-btn-icon-linechain:before{margin:5px 5px 2px 5px;width:3px;height:13px;background:black;border-radius:2px;content:'';display:block;position:absolute;-webkit-transform:rotate(65deg);-moz-transform:rotate(65deg);-o-transform:rotate(65deg);transform:rotate(65deg);}#drawTools-btn-icon-linechain:after{margin:8px 1px 0px 12px;width:3px;height:10px;background:black;border-radius:2px;content:'';display:block;position:absolute;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);}#drawTools-btn-icon-curve{margin:6px 15px 0px 11px;position: relative;width: 12px;height: 12px;-webkit-box-shadow:-0px 3px 0px 0px black;box-shadow:-0px 3px 0px 0px black;border-radius:100%;}#drawTools-btn-icon-curve:after{margin:10px 0px 0px 10px;position:relative;width:8px;height:10px;-webkit-box-shadow:0px -3px 0px 0px black;box-shadow:0px -3px 0px 0px black;border-radius:100%;content:'';display:block;position:absolute;}#drawTools-btn-icon-curve:before{margin:4px 0px 0px -1px;width:2px;height:9px;background:black;border-radius:2px;-webkit-transform:rotate(-30deg);-moz-transform:rotate(-30deg);-o-transform:rotate(-30deg);-ms-transform:rotate(-30deg);transform:rotate(-30deg);content:'';content:'';display:block;position:absolute;}#drawTools{position:relative;display:inline-block;vertical-align:middle;}#drawTools>.drawTools-btn{position:relative;float:left;display:inline-block;}#drawTools>.drawTools-btn:not(:first-child):not(:last-child):not(.dropdown-toggle){border-radius:0}#drawTools>.drawTools-btn:first-child{margin-left:0;}#drawTools>.drawTools-btn:first-child:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius: 0;border-top-right-radius: 0;}#drawTools>.drawTools-btn:last-child:not(:first-child),#drawTools>.dropdown-toggle:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0;}.drawTools-btn{height:34px;border-radius:2px;margin-top:5px;}.drawTools-btn input{display:none;}.drawTools-btn-container{background-color:#fffb8d;border-bottom:1px solid #e5e17e;height:34px;padding:0px;margin:0px;font-size:14px;font-weight:normal;line-height:1.428571429;text-align:center;vertical-align:middle;cursor:pointer;border-radius:inherit;border-top:1px solid transparent;}.drawTools-btn-container:focus	{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;outline-offset:-2px;}.drawTools-btn-container:hover,.drawTools-btn:focus{background-color:#f6f166;border-bottom:1px solid #ddd85b;color:#333333;text-decoration:none;}.drawTools-btn-container:active,.drawTools-btn input:focus + div,.drawTools-btn input:checked + div{background-color:#f6f166;border-bottom:1px solid #f6f166;-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,0.5);box-shadow:inset 0 3px 5px rgba(0,0,0,0.5);}.drawTools-btn-container.disabled,.drawTools-btn-container[disabled],fieldset[disabled] .drawTools-btn-container{cursor:not-allowed;pointer-events:none;opacity:0.65;filter:alpha(opacity=65);-webkit-box-shadow:none;box-shadow:none;}#drawTools-btn-options .drawTools-btn-container{background:#252525;border-bottom:1px solid #171717;}#drawTools-btn-options .drawTools-btn-container:focus{outline:thin dotted #fff;}#drawTools-btn-options .drawTools-btn-container:hover,#drawTools-btn-options .drawTools-btn:focus{background-color:#2e2e2e;border-bottom:1px solid #222222;}#drawTools-btn-options .drawTools-btn-container:active{background-color:#252525;border-bottom:1px solid #252525;}#drawTools-btn-exit .drawTools-btn-container{background:#a50000;border-bottom:1px solid #7c0000;}#drawTools-btn-exit .drawTools-btn-container:focus{outline:thin dotted #fff;}#drawTools-btn-exit .drawTools-btn-container:hover,#drawTools-btn-exit .drawTools-btn:focus{background-color:#b90c0c;border-bottom:1px solid #980909;}#drawTools-btn-exit .drawTools-btn-container:active{background-color:#a50000;border-bottom:1px solid #a50000;}#drawTools-options{margin-top:"+a+"px;margin-left:"+b+"px;background:#252525;border-bottom:1px solid #171717;width:420px;height:0px;position:absolute;border-radius:2px 2px 0px 0px;opacity:0;overflow:hidden;-webkit-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);}#drawTools-options-content{position:absolute;top:8px;left:8px;right:8px;bottom:8px;}#drawTools-options-leftPanel{width:160px;height:100%;position:absolute;left:0px;}#drawTools-options-leftPanel>.switch{display:block;margin-bottom:20px;}.switch{font:13px/20px 'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;width:150px;height:26px;position:relative;display:inline-block;vertical-align:top;padding:3px;border-radius:2px;cursor:pointer;box-shadow:inset 0 -1px #525252,inset 0 1px 1px rgba(0,0,0,0.8);}.switch-input{position:absolute;top:0;left:0;opacity:0;}.switch-label{position:relative;display:block;height:inherit;font-size:12px;text-transform:uppercase;background:#7b0000;border-radius:inherit;box-shadow:inset 0 1px 2px rgba(0,0,0,0.12),inset 0 0 2px rgba(0,0,0,0.15);-webkit-transition:0.15s ease-out;-moz-transition:0.15s ease-out;-o-transition:0.15s ease-out;transition:0.15s ease-out;-webkit-transition-property:opacity background;-moz-transition-property:opacity background;-o-transition-property:opacity background;transition-property:opacity background;}.switch-label:before,.switch-label:after{position:absolute;top:50%;margin-top:-.5em;line-height:1;-webkit-transition:inherit;-moz-transition:inherit;-o-transition:inherit;transition:inherit;}.switch-label:before{content:attr(data-off);right:11px;color:white;text-shadow:0 1px rgba(0,0,0,0.2);}.switch-label:after{content:attr(data-on);left:11px;color:white;text-shadow:0 1px rgba(0,0,0,0.2);opacity:0;}.switch-input:checked ~ .switch-label {background:#117b00;box-shadow:inset 0 1px 2px rgba(0,0,0,0.15),inset 0 0 3px rgba(0,0,0,0.2);}.switch-input:checked~.switch-label:before{opacity:0;}.switch-input:checked~.switch-label:after{opacity: 1;}.switch-handle{position:absolute;top:4px;left:4px;width:24px;height:24px;background:#c2c2c2;border-radius:2px;box-shadow:1px 1px 5px rgba(0,0,0,0.2);background-image:-webkit-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:-moz-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:-o-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:linear-gradient(to bottom, #c2c2c2 40%, #a7a7a7);-webkit-transition:left 0.15s ease-out;-moz-transition:left 0.15s ease-out;-o-transition:left 0.15s ease-out;transition:left 0.15s ease-out;}.switch-input:checked~.switch-handle{left:128px;box-shadow:-1px 1px 5px rgba(0,0,0,0.2);}.switch-green>.switch-input:checked~.switch-label{background:#4fb845;}#drawTools-options-palette{width:240px;height:100%;position:absolute;right:0px;}#drawTools-options-palette label{width:40px;height:40px;float:left;overflow:hidden;display:inline-block;margin:0;padding=0;}#drawTools-options-palette input{display:none;visibility:hidden;margin:0px;padding:0px;}#drawTools-options-palette input:checked + div{border:2px solid #c2c2c2;}#drawTools-options-palette div{width:40px;height:40px;border:2px solid #252525;margin=0;padding=0;line-height:2.428571429;}#drawTools-options-palette div:focus{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;}#drawTools-options-palette div:hover,#drawTools-options-palette div:focus,#drawTools-options-palette div:active{border:2px solid red;}.drawTools-buttonText,#drawTools-options-palette div{font-size:14px;font-weight:normal;text-align:center;vertical-align:middle;cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}";document.body.appendChild(d);}
  /*-----------------------------------------------------------------------------*/
 /*------------------------------- Event Handlers ------------------------------*/
/*-----------------------------------------------------------------------------*/
ct.eh["mouseDown"] = function(e) {
	var c = ct;
	var t = c.t;
	
	if($('#drawTools-options').css('opacity') == 1){
		painting = !1;
		c.c.restore();
		c.options.tm();
		return;
	} else if(t.c === t.tt.a)
		return;
	t.ta = true;
	c.c.ul();
	
	// Translate mouse location to point relative to c
	c.mouseX = e.pageX-c.c.offset.left;
	c.mouseY = e.pageY-c.c.offset.top;
	
	if(t.c === t.tt.b && ct.cd() ) {
		painting = !1;
		t.pm.ff(c.cn,c.mouseX,c.mouseY);
	} else if(t.c === t.tt.c && ct.cd()) {
		painting = !1;
		t.p.push(c.mouseX,c.mouseY);
	} else if(t.c === t.tt.d && ct.cd()) {
		painting = !1;
	} else if(t.c === t.tt.e && ct.cd()) {
		painting = !1;
	} else if(t.c === t.tt.f && ct.cd()) {
		painting = !1;
		t.p.push(c.mouseX,c.mouseY);
	} else if(t.c === t.tt.g && ct.cd()) {
		painting = !1;
		t.p.push(c.mouseX,c.mouseY);
	} 
}

ct.eh["mouseMove"] = function(e) {
	var c = ct;
	var t = c.t;
	if(t.c === t.tt.a)
		return;	// default behaviors
	else if(!t.ta)
		return;	// If no tool is in use, ignore event
	
	if(!ct.cd()){return;}
	
	// Translate mouse location to point relative to c
	c.mouseX = e.pageX-c.c.offset.left;
	c.mouseY = e.pageY-c.c.offset.top;
	var endPointX = c.mouseX;
	var endPointY = c.mouseY;
	
	if(t.c === t.tt.b) {
		// Do nothing
	} else if(t.c === t.tt.c) {
		if(c.sd) {
			var a = t.ls(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.pm.dl(c.cn,t.p[0],t.p[1],endPointX,endPointY);
	} else if(t.c === t.tt.d) {
		if(t.p.length > 0) {
			if(c.sd) {
				var a = t.ls(t.p[t.p.length-2],t.p[t.p.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
			}
			var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
			c.c.restore();
			t.pm.dc(c.cn,t.p.concat(endPointX,endPointY),true,c.options.ltsc,fc);
		}
	} else if(t.c === t.tt.e) {
		if(t.p.length > 0) {
			var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
			c.c.restore();
			t.pm.ds(c.cn,t.p.concat(c.mouseX,c.mouseY),0.5,c.options.ltsc,fc,true);
		}
	} else if(t.c === t.tt.f) {
		var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
		if(c.sd) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.pm.dr(c.cn,t.p.concat(endPointX,endPointY),fc);
	} else if(t.c === t.tt.g) {
		var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
		if(c.sd) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.pm.de(c.cn,t.p.concat(endPointX,endPointY),fc);
	}
}

ct.eh["mouseUp"] = function(e) {
	var c = ct;
	var t = c.t;
	if(!ct.cd()){return;}
	
	if(0 && $('#drawTools-options').css('opacity') == 1){
		c.c.ul();
		if(!c.options.iwb(e.pageX, e.pageY)) {
			c.options.tm();
		}
		return;
	} else if(t.c === t.tt.a)
		return;
	else if(!t.ta)	// If no tool is in use, ignore event
		return;
		
	// Translate mouse location to point relative to c
	c.mouseX = e.pageX-c.c.offset.left;
	c.mouseY = e.pageY-c.c.offset.top;
	var endPointX = c.mouseX;
	var endPointY = c.mouseY;
	
	if(t.c === t.tt.b) {
		t.rs(true);
	} else if(t.c === t.tt.c) {
		if(c.sd) {
			var a = t.ls(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.pm.dl(c.cn,t.p[0],t.p[1], endPointX, endPointY);
		t.rs(true);
	} else if(t.c === t.tt.d) {
		if(c.c.iwd(c.mouseX,c.mouseY)){
			if(c.sd) {
				var a = t.ls(t.p[t.p.length-2],t.p[t.p.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
			}
			t.p.push(endPointX,endPointY);
			if(e.which == 3) {	// If right mouse click, finish the chain
				var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
				c.c.restore();
				t.pm.dc(c.cn,t.p,false,c.options.ltsc,fc);
				t.rs(true);
			}
		} else { // If user clicks out of acceptable boundaries, cancel all tool progress
			c.c.restore();
			t.rs();
		}
	} else if(t.c === t.tt.e) {
		if(c.c.iwd(c.mouseX,c.mouseY)){
			t.p.push(c.mouseX,c.mouseY);
			if(e.which == 3) {	// If right mouse click, finish the curve
				var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
				c.c.restore();
				t.pm.ds(c.cn,t.p,0.5,c.options.ltsc,fc,false);
				t.rs(true);
			}
		} else { // If user clicks out of acceptable boundaries, cancel all tool progress
			c.c.restore();
			t.rs();
		}
	} else if(t.c === t.tt.f) {
		var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
		if(c.sd) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.p.push(endPointX,endPointY);
		t.pm.dr(c.cn,t.p,fc);
		t.rs(true);
	} else if(t.c === t.tt.g) {
		var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
		if(c.sd) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.p.push(endPointX,endPointY);
		t.pm.de(c.cn,t.p,fc);
		t.rs(true);
	}
}
ct.eh["keyDown"] = function(e) {
	var c = ct;
	var t = c.t;
	if(!ct.cd()){return;}
	if(e.keyCode == 16 ) { // If shift is pressed
		c.sd = 1;
		var endPointX = c.mouseX;
		var endPointY = c.mouseY;
		
		if(!t.ta)
			return;
		else if( t.c === t.tt.f || t.c === t.tt.g ) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
			
			c.c.restore();
			var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
			if(t.c === t.tt.f)
				t.pm.dr(c.cn,t.p.concat(endPointX,endPointY),fc);
			else
				t.pm.de(c.cn,t.p.concat(endPointX,endPointY),fc);
		} else if( t.c === t.tt.c || t.c === t.tt.d ) {
			if(t.p.length > 0) {
				var a = t.ls(t.p[t.p.length-2],t.p[t.p.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
				
				c.c.restore();
				if( t.c === t.tt.d ) {
					var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
					t.pm.dc(c.cn,t.p.concat(endPointX,endPointY),true,c.options.ltsc,fc);
				} else {
					t.pm.dl(c.cn,t.p[0],t.p[1],endPointX,endPointY);
				}
			}
		}
	} else if(e.keyCode == "Q".charCodeAt(0)) {
		if(t.c === t.tt.d || t.c === t.tt.e) {
			if(t.p.length) {
				t.p.length -= 2;
				c.c.restore();
				if(t.p.length == 0) {
					t.rs();
				} else {
					var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
					if(t.c === t.tt.d)
						t.pm.dc(c.cn,t.p.concat(c.mouseX,c.mouseY),true,c.options.ltsc,fc);
					else
						t.pm.ds(c.cn,t.p.concat(c.mouseX,c.mouseY),0.5,c.options.ltsc,fc,true);
				}
			}
		}
	} else {
		//alert('Keycode for that key is: ' + e.keyCode);
	}
}
ct.eh["keyUp"] = function(e) {
	if(!ct.cd()){return;}
	var c = ct;
	var t = c.t;
	if(e.keyCode == 16) { // If shift is released
		c.sd = 0;
		var endPointX = c.mouseX;
		var endPointY = c.mouseY;
		
		if(!t.ta)
			return;
			
		if( t.c === t.tt.f || t.c === t.tt.g ){
			c.c.restore();
			var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
			if(t.c === t.tt.f)
				t.pm.dr(c.cn,t.p.concat(endPointX,endPointY),fc);
			else
				t.pm.de(c.cn,t.p.concat(endPointX,endPointY),fc);
		} else if( t.c === t.tt.c || t.c === t.tt.d ) {
			if(t.p.length > 0) {
				c.c.restore();
				if( t.c === t.tt.d ) {
					var fc = (c.options.usaf) ? c.cn.strokeStyle : c.options.fc;
					t.pm.dc(c.cn,t.p.concat(endPointX,endPointY),true,c.options.ltsc,fc);
				} else {
					t.pm.dl(c.cn,t.p[0],t.p[1],endPointX,endPointY);
				}
			}
		}
	}
}

  /*-----------------------------------------------------------------------------*/
 /*---------------------- Elements Creation/Manipulation -----------------------*/
/*-----------------------------------------------------------------------------*/
//Creates Tool Buttons (no innerHTML)
ct.ht.init['createToolButton'] = function(type, name)
{
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = ct.id + '-btn-' + name;
	button.className = ct.id + '-btn';
	button.innerHTML = 
		'<input id="' + ct.id + '-btn-radio-' + name + '" name="' + ct.id + '-btn-radio" type="radio">' +
		'<div class="' + ct.id + '-btn-container">' +
			'<div id="' + ct.id + '-btn-icon-' + name + '"></div>' +
		'</div>';
	document.getElementById(ct.id).appendChild(button);
	
	button.onclick = function(){ct.ht.bh.stt(type);};
	return button;
}
//Creates Tool Buttons (with a label)
ct.ht.init['createToolButtonWithLabel'] = function(type, name, label)
{
	var button = ct.ht.init.createToolButton(type, name);
	button.getElementsByTagName('div')[0].innerHTML = label; // Place text inside it
	return button;
}
//Creates Tool Buttons (no innerHTML)
ct.ht.init['createUtilityButton'] = function(name)
{
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = ct.id + '-btn-' + name;
	button.className = ct.id + '-btn';
	button.innerHTML = 
		'<div class="' + ct.id + '-btn-container">' +
			'<div id="' + ct.id + '-btn-icon-' + name + '"></div>' +
		'</div>';
	document.getElementById(ct.id).appendChild(button);
	return button;
}

ct.ht.init['createOptionsMenu'] = function(drawToolsDiv, optionsButton)
{
	//Create DIV in which Options will be placed in
	var optionsDiv = document.createElement('div');
	optionsDiv.id = ct.id + '-options';
	optionsDiv.innerHTML = 
		'<div id="drawTools-options-content">' +
			'<div id="drawTools-options-leftPanel"></div>' +
			'<div id="drawTools-options-palette"></div>' +
		'</div>';
	//drawToolsDiv.appendChild(optionsDiv);
	
	drawToolsDiv.insertBefore(optionsDiv, optionsButton.nextSibling);
	
	//----- BEGIN ----- LeftPanel --------------------------------------------------
	var leftPanelHtml = "";
	leftPanelHtml += 
		'<label onclick=ct.ht.bh.slto(); class="switch">\
			<input type="checkbox" class="switch-input" id="drawTools-options-checkbox-lineToolsOpen">\
			<span class="switch-label" data-on="Loop Line Tools" data-off="Open Line Tools"></span>\
			<span class="switch-handle"></span>\
		</label>';
	document.getElementById('drawTools-options-leftPanel').innerHTML = leftPanelHtml;
	//----- BEGIN ----- ColorPicker --------------------------------------------------
	var colorElements = document.getElementsByClassName('colorPicker');
	var optionsPaletteHtml = "";
	
	optionsPaletteHtml += 
		'<label onclick=ct.ht.bh.soc(""); style="width:120px;">' +
			'<input type="radio" name="drawTools-options-palette-radio" checked>' +
			'<div style="width:120px;background:#333333;color:#c2c2c2;">No Fill</div>' +
		'</label>';
	optionsPaletteHtml += 
		'<label onclick=ct.ht.bh.soc("",1); style="width:120px;">' +
			'<input type="radio" name="drawTools-options-palette-radio">' +
			'<div style="width:120px;background:#333333;color:#c2c2c2;">Brush Color</div>' +
		'</label>';
	
	for(var i=0;i<colorElements.length;i++) {
		var color = colorElements[i].getAttribute("data-color");
		ct.dcPalette.push(color);
		optionsPaletteHtml += 
			'<label onclick=ct.ht.bh.soc("' + color + '");>' + //
				'<input type="radio" name="drawTools-options-palette-radio">' +
				'<div style="background:' + color + ';"></div>' +
			'</label>';
	}
	document.getElementById('drawTools-options-palette').innerHTML = optionsPaletteHtml;
}
// Destroys all elements, styling and javascript
ct.ht['DTDestroy'] = function() 
{
	// 1. Destroy HTML
	document.getElementById(ct.id).remove();
	// 2. Destroy CSS
	document.getElementById(ct.id + 'StyleSheet').remove();
	// 3. Remove listeners
	$(document).off('mousedown');
	$(document).off('mousemove');
	$(document).off('mouseup');
	// 4. Set the state variable to reflect DTTools uninstallation
	window.DTToolsIsCurrentlyInstalled = false;
	// 5. Destroy JavaScript
	delete ct.c; // Delete all references to ct
	delete ct.ht;
	delete ct;
	document.getElementById('DTScript').remove();
}
ct.ht.init['setupCssAndHtml'] = function()
{	
	if(!ct.cd()){return;}
	
	ct.c.ul();
	/*---- 1. Create Draw Tools Container - DIV in which DrawTools will be placed in ----*/
	var drawToolsDiv = document.createElement('div');
	drawToolsDiv.id = ct.id;
	ct.dcToolbar.appendChild(drawToolsDiv);
	
	/*---- 2. Setup necessary CSS for DrawTools ----*/
	ct.ht.init.setupCSS();
	
	/*---- 3. Make Necessary Modifications to Existing Elements ----*/
	document.getElementById(ct.dcBrushes[0].id).parentNode.onclick = function(){ct.ht.bh.bc(ct.dcBrushes[0].size);};
	document.getElementById(ct.dcBrushes[1].id).parentNode.onclick = function(){ct.ht.bh.bc(ct.dcBrushes[1].size);};
	document.getElementById(ct.dcBrushes[2].id).parentNode.onclick = function(){ct.ht.bh.bc(ct.dcBrushes[2].size);};
	document.getElementById(ct.dcBrushes[3].id).parentNode.onclick = function(){ct.ht.bh.bc(ct.dcBrushes[3].size);};
	
	/*---- 4. Create Draw Tools Elements and Interface ----*/
	// Create Tool Buttons
	ct.ht.init.createToolButton(ct.t.tt.b,"fill");
	ct.ht.init.createToolButton(ct.t.tt.c,"line");
	ct.ht.init.createToolButton(ct.t.tt.d,"linechain");
	ct.ht.init.createToolButton(ct.t.tt.e,"curve");
	ct.ht.init.createToolButton(ct.t.tt.f,"rect");
	ct.ht.init.createToolButton(ct.t.tt.g,"ellipse");
	
	var optionsButton = ct.ht.init.createUtilityButton("options");
	optionsButton.onclick = function(){ct.options.tm();};
	
	ct.ht.init.createOptionsMenu(drawToolsDiv, optionsButton);
	
	// Exitbutton to remove DrawTools
	var exitButton = ct.ht.init.createUtilityButton("exit");
	exitButton.onclick = function(){ct.ht.DTDestroy();};
}
  /*-----------------------------------------------------------------------------*/
 /*----------------------------------- Main ------------------------------------*/
/*-----------------------------------------------------------------------------*/
ct.cn.putImageData=CanvasRenderingContext2D.prototype.putImageData;
ct.ht.init.setupCssAndHtml();
ct.C.off('mousedown');
ct.C.on('mousedown',ct.eh.mouseDown);
$(document).off('mousemove');
$(document).on('mousemove',ct.eh.mouseMove);
$(document).off('mouseup');
$(document).on('mouseup',ct.eh.mouseUp);
$(document).keydown(ct.eh.keyDown);
$(document).keyup(ct.eh.keyUp);
