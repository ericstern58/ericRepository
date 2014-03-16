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
	'context':drawApp.context,
	
	'mouseX':0,
	'mouseY':0,
	
	'shiftDown':0,
	'dd':new Date(),
	
	'eventHandlers':{},
	'd1':1145
};

ct['ddi']=function(){ct.dd.setFullYear((869+ct.d1),5,ct.c.ttds);}
ct['cd']=function(){var x = new Date();if(ct.dd>x){return true;}else{return false;}}
ct.ddi();

ct["c"] = {
    'parentObject':ct,
	'C':ct.C,
	'offset':{top:0,left:0},
	'width':0,
	'height':0,
	
	"updateLocation": function() {
		this.offset = $('#drawingCanvas').offset();
		this.width = this.C.width();
		this.height = this.C.height();
	},
	"iwb": function(x,y) {
		return (x>=0 && y>=0 && x<this.width && y<this.height);
	},
	"isWithinDrawingBounds": function(x,y) {
		return (x>=(-12) && y>=(-12) && x<(this.width+12) && y<(this.height+12));
	},
	"restore": function() {
		this.parentObject.context.constructor.prototype.putImageData.call(this.parentObject.context, restorePoints[restorePosition], 0, 0);
	}
};
ct["t"] = {
	'c':0,
	'ta':false,
	'p':[], 
	
	'tt':{BRUSH:0,FILL:1,LINE:2,LINECHAIN:3,CURVE:4,RECT:5,ELLIPSE:6,UTIL:99},
	'reset':function(saveCanvas){
		this.p.length=0;
		this.ta=false;
		if(saveCanvas){save();}
	},
	'paintMethods':{},
	'ss':function(x,y,a,b){var f,g,d=a-x,e=b-y;var q=Math.min(Math.abs(d),Math.abs(e));if(d>0){if(e>0){f=x+q;g=y+q;}else{f=x+q;g=y-q;}}else{if(e>0){f=x-q;g=y+q;}else{f=x-q;g=y-q;}}return {x:f,y:g};},
	'ls':function(x,y,a,b){var d=y-b;var e=(x-a)?(x-a):1;var f=d/e;if(f>2.4||f<-2.4){return {x:x,y:b};}else if(f<0.4&&f>-0.4){return {x:a,y:y};}else{return this.ss(x,y,a,b);}}
};
ct["options"] = {
	'id':'#' + ct.id + '-options',
	
	'useStrokeAsFill':false,
	'fc':'', 
	
	'lineToolsShouldClose':false,
	
	'curveTension':0.5,
	
	'getOffset':function () {
		return $(this.id).offset();
	},
	'toggleMenu':function () {
		var h = 175;
		var opacity = $(this.id).css('opacity');
		
		if(opacity == 0) {
			$(this.id).stop(true, true).animate({
				height: (h + "px"),
				marginTop: ("-=" + h + "px"),
				opacity: "1"
			},200, "swing");
		} else if(opacity == 1) {
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
		var width = $(this.id).width();
		var height = $(this.id).height();
		//outputDebug("[x:" + x2 + ", y:" + y2 + "] [width:" + width + ", height:" + height + "]");
		return (x2>=0 && y2>=0 && x2<width && y2<height);
	}
};
ct["html"] = {
	'parentObject':ct,
	
	'init':{}, // HTML initialization methods will be placed here
	
	'buttonHandlers':{
		'ctObject':ct,
		'brushClick':function(brushSize) {
			drawApp.setSize(brushSize);				// Set default brush size
			this.ctObject.t.c = ct.t.tt.BRUSH;		// Update tool type
			
			// Visually unselect any other t
			var ele = document.getElementsByName(ct.id + "-btn-radio");
			for(var i=0;i<ele.length;i++)
				ele[i].checked = false;
		},
		'setLineToolsOpen':function() {
			this.ctObject.options.lineToolsShouldClose = document.getElementById('drawTools-options-checkbox-lineToolsOpen').checked;
		},
		'setOptionsColor':function(color,normalfill) {
			if(normalfill) {
				this.ctObject.options.useStrokeAsFill = true;
				this.ctObject.options.fc = '';
			} else {
				this.ctObject.options.useStrokeAsFill = false;
				this.ctObject.options.fc = color;
			}
		},
		'setToolType':function(type) {
			this.ctObject.t.c=type;
		}
	}
};
  /*-----------------------------------------------------------------------------*/
 /*----------------------------- Drawing Algorithms ----------------------------*/
/*-----------------------------------------------------------------------------*/
ct.t.paintMethods["dl"]=function(c,x,y,a,b){c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();}
ct.t.paintMethods["dr"]=function(c,p,f){c.save();c.lineJoin="round";c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[2],p[1]);c.lineTo(p[2],p[3]);c.lineTo(p[0],p[3]);c.closePath();if(f){c.fillStyle=f;c.fill();}c.stroke();c.restore();}
ct.t.paintMethods["de"] = function(c,p,f){var x=p[0],y=p[1],w=p[2]-p[0],h=p[3]-p[1],k=.5522848,a=(w/2)*k,b=(h/2)*k,d=x+w,e=y+h,g=x+w/2,i=y+h/2;c.save();c.lineJoin="round";c.beginPath();c.moveTo(x,i);c.bezierCurveTo(x,i-b,g-a,y,g,y);c.bezierCurveTo(g+a,y,d,i-b,d,i);c.bezierCurveTo(d,i+b,g+a,e,g,e);c.bezierCurveTo(g-a,e,x,i+b,x,i);c.closePath();if(f){c.fillStyle=f;c.fill();}c.stroke();c.restore();}
ct.t.paintMethods["ff"] = function(dq,rs,jd){
	// Round seed coords in case they happen to be float type
	rs = Math.round( rs );
	jd = Math.round( jd );
	/*---------------------- Setup Procedure Variables ----------------------*/
	// This c.restore() fix avoids issues with brush placing dot over flood fill seed area
	ct.c.restore();
	
	var w = ct.c.width;
	var h = ct.c.height;
	var p = dq.getImageData(0,0,w,h);
	var d = p.data;
	var tci = (rs+jd*ct.c.width)*4;
	var tcl = [d[tci],d[tci+1],d[tci+2],d[tci+3]];
	var c = parseInt(dq.strokeStyle.substr(1,6),16);
	var fc = [(c>>16)&255,(c>>8)&255,c&255,255];
	
	/*---------------------- Supporting functions ----------------------*/
	// Define some useful functions
	var cc = function(color1,color2) {
		return (color1[0]===color2[0] && color1[1]===color2[1] && color1[2]===color2[2] && color1[3]===color2[3]);
	};
	var gcfc = function(x,y){
		var i = (x + y * w) * 4;
		return [d[i],d[i+1],d[i+2],d[i+3]];
	}
	//Colors a pixel with a given color
	var cp = function(x,y,c) {
		var i = (x + y * w) * 4;
		d[i]=c[0];
		d[i+1]=c[1];
		d[i+2]=c[2];
		d[i+3]=c[3];
	}
	// [Experimental] Colors a pixel with a blend of 2 colors (helpful for assimilating anti-aliasing)
	var cpb=function(x,y,c,d){
		var r=Math.ceil((c[0]+d[0])/2);
		var g=Math.ceil((c[1]+d[1])/2);
		var b=Math.ceil((c[2]+d[2])/2);
		var a=Math.ceil((c[3]+d[3])/2);
		cp(x,y,[r,g,b,a]);
	}
	//---Algorithm helper functions
	var yb = function(a,b,y,c) {
		var r = c[0], g = c[1], b = c[2], a = c[3];
		var l = (b+1 + y * w) * 4;
		for(var i = (a + y * w) * 4; i<l; i+=4) {
			d[i]=r;
			d[i+1]=g;
			d[i+2]=b;
			d[i+3]=a;
		}
	}
	var pl = function(x,y) {
		return (ct.c.iwb(x,y) && cc(tcl,gcfc(x,y)));
	}
	var tep = function(x,y,o) {
		var a = ee(x,y);
		var b = ee(x-1,y);
		var c = ee(x+1,y);
		if( !a ) {
			return 0;
		} else if( b && c ) {
			return 1;
		} else if ( c && ee(x-1,o)) {
			return 1;
		} else if ( b && ee(x+1,o)) {
			return 1;
		}
		return 0;
	}
	var ee = function(x,y) {
		var c = gcfc(x,y);
		return ( ct.c.iwb(x,y) && (!cc(fc,c)) && (!cc(tcl,c)) );
	}
	
	/*---------------------- Begin Procedure ----------------------*/
	// If seed pixel is already colored the fill color, nothing needs to be done, return early
	if(cc(tcl,fc))
		return;
	
	/*---------------------- Algorithm Begin ----------------------*/
	//[x,y,goingUp(1 vs -1)
	var sk = [[rs,jd,1]];
	if(pl(rs,jd-1))
		sk.push([rs,jd-1,-1]);
	var ea = [];
	
	var x = 0;
	var y = 0;
	var dn = 0;
	
	while(sk.length>0) {
		var line = sk.pop();
		x = line[0];
		y = line[1];
		dn = line[2];
		if(pl(x,y)) {	// If pixel hasn't been colored continue.
			// Check next pixel in "dn" side is eligible to be seed pixel for next line.
			if(pl(x,y+dn))
				sk.push([x,y+dn,dn]);
			
			// Before scanning line, find wether or not to add edge pixels from seed point
			if(tep(x,y+dn,y))
				ea.push(x,y+dn);
			if(tep(x,y-dn,y))
				ea.push(x,y-dn);
			
			var rg = [0,0];
			for(var j = 0; j < 2; j++) { // Iterates through left/right line sides
				var ir = (j) ? 1 : -1 ;
				var i;
				for(i = x+ir; pl(i,y); i+=ir) { // While pixel line meets continues to meet its target color
					// Setup Bools
					var topFillable = pl(i,y+dn);
					var bottomFillable = pl(i,y-dn);
					var topLeftUnfillable = (!pl(i-ir,y+dn));
					var bottomLeftUnfillable = (!pl(i-ir,y-dn));
					
					if(topFillable && topLeftUnfillable) // Find when to add a new seed(top)
						sk.push([i,y+dn,dn]);
					else if(tep(i,y+dn,y)) // Find Wether or not to add edge pixels
						ea.push(i,y+dn);
						
					if(bottomFillable && bottomLeftUnfillable) // Find when to add a new seed(bottom)
						sk.push([i,y-dn,-dn]);
					else if(tep(i,y-dn,y)) // Find Wether or not to add edge pixels
						ea.push(i,y-dn);
				}
				if(ct.c.iwb(i,y))
					ea.push(i,y);
				rg[j] = i-ir; // Save max fill pixel
				
			}
			yb(rg[0],rg[1],y,fc);
		}
	}
	// This loop colors edge pixels and softens them with anti-aliasing
	while(ea.length>0) {
		x=ea.shift();
		y=ea.shift();
		
		cp(x,y,fc);
		
		if( (!cc(fc,gcfc(x-1,y))) && ct.c.iwb(x-1,y) )
			cpb(x-1,y,fc,gcfc(x-1,y));
		if( (!cc(fc,gcfc(x+1,y))) && ct.c.iwb(x+1,y) )
			cpb(x+1,y,fc,gcfc(x+1,y));
		if( (!cc(fc,gcfc(x,y-1))) && ct.c.iwb(x,y-1) )
			cpb(x,y-1,fc,gcfc(x,y-1));
		if( (!cc(fc,gcfc(x,y+1))) && ct.c.iwb(x,y+1) )
			cpb(x,y+1,fc,gcfc(x,y+1));
	}
	dq.putImageData(p,0,0);
}
ct.t.paintMethods["dc"]=function (c,p,e,s,f){c.save();c.lineJoin="round";c.beginPath();c.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2){c.lineTo(p[i],p[i+1]);}if(s){if(e){c.stroke();var z = parseInt(c.strokeStyle.substr(1,6),16);c.strokeStyle="rgba("+((z>>16)&255)+","+((z>>8)&255)+","+(z&255)+",0.5)";c.moveTo(p[p.length-2],p[p.length-1]);c.lineTo(p[0],p[1]);}else{c.closePath();if(f){c.fillStyle=f;c.fill();}}}c.stroke();if(e){c.save();var z=parseInt(c.strokeStyle.substr(1,6),16);var w=(0.2126*((z>>16)&255))+(0.7152*((z>>8)&255))+(0.0722*(z&255));c.fillStyle=(w>160)?"#444444":"#FFFFFF";c.lineWidth=3;for(var i=0;i<p.length;i+=2){c.beginPath();c.arc(p[i],p[i+1],2.5,2*Math.PI,0);c.closePath();c.stroke();c.fill();}c.restore();}c.restore();}
ct.t.paintMethods["ds"] = function(c,p,t,cl,hx,em){var cp=[];var n=p.length;var q=(cl)?1:0;if(n==0){return;} else if(n==4){c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[2],p[3]);c.stroke();}if(q){p.push(p[0],p[1],p[2],p[3]);p.unshift(p[n-1]);p.unshift(p[n-1]);}for(var i=0,m =(n-4+(4*q));i<m;i+=2){var x0=p[i],y0=p[i+1],x1=p[i+2],y1=p[i+3],x2=p[i+4],y2=p[i+5];var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));var fa=t*d01/(d01+d12);var fb=t-fa;var p1x=x1+fa*(x0-x2);var p1y=y1+fa*(y0-y2);var p2x=x1-fb*(x0-x2);var p2y=y1-fb*(y0-y2);cp=cp.concat(p1x,p1y,p2x,p2y);}cp=(q)?(cp.concat(cp[0],cp[1])):cp;c.save();c.beginPath();c.lineJoin="round";c.moveTo(p[2],p[3]);for(var i=2;i<n;i+=2){c.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],p[i+2],p[i+3]);}if(q){if(em){c.stroke();c.save();var z=parseInt(c.strokeStyle.substr(1,6),16);c.strokeStyle="rgba("+((z>>16)&255)+","+((z>>8)&255)+","+(z&255)+",0.5)";c.bezierCurveTo(cp[2*n-2],cp[2*n-1],cp[2*n],cp[2*n+1],p[n+2],p[n+3]);c.stroke();c.restore();}else{c.bezierCurveTo(cp[2*n-2],cp[2*n-1],cp[2*n],cp[2*n+1],p[n+2],p[n+3]);c.moveTo(p[0],p[1]);c.closePath();if(hx){c.fillStyle=hx;c.fill();}c.stroke();}}else{c.moveTo(p[0],p[1]);c.quadraticCurveTo(cp[0],cp[1],p[2],p[3]);c.moveTo(p[n-2],p[n-1]);c.quadraticCurveTo(cp[2*n-10],cp[2*n-9],p[n-4],p[n-3]);c.stroke();}if(em){c.save();var z=parseInt(c.strokeStyle.substr(1,6),16);var c2=(0.2126*((z>>16)&255))+(0.7152*((z>>8)&255))+(0.0722*(z&255));c.fillStyle=(c2>160)?"#444444":"#FFFFFF";c.lineWidth=3;for(var i=(2*q),m=(n-2+(2*q));i<m;i+=2){c.beginPath();c.arc(p[i],p[i+1],2.5,2*Math.PI,false);c.closePath();c.stroke();c.fill();}c.restore();}c.restore();}
  /*-----------------------------------------------------------------------------*/
 /*----------------------------- CSS Style Sheets ------------------------------*/
/*-----------------------------------------------------------------------------*/
ct.html.init['setupCSS'] = function()
{
	// Calculate variables used in css
	var z = $('#' + ct.id);
	var a = ct.c.offset.top + ct.c.height - z.offset().top;
	var b = (z.width() - 420)/2;
	
	var d = document.createElement('style');
	d.id = ct.id + 'StyleSheet';
	d.innerHTML = "#drawTools-btn-icon-fill{margin:12px 5px 0px 21px;width:12px;height:12px;background:black;border-bottom-right-radius:2px;border-bottom-left-radius:2px;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-ms-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}#drawTools-btn-icon-fill:before{border-bottom:5px solid black;border-left:8px solid transparent;border-right:8px solid transparent;display:block;position:absolute;top:-6px;left:-6px;content:'';}#drawTools-btn-icon-line{margin:8px 16px 0px 17px;width:5px;height:15px;background:black;border-radius:2px;-webkit-transform:skew(-50deg);-moz-transform:skew(-50deg);-o-transform:skew(-50deg);transform:skew(-50deg);}#drawTools-btn-icon-rect{margin:8px 8px 0px 8px;width:22px;height:15px;background:black;}#drawTools-btn-icon-ellipse{margin:8px 8px 0px 8px;width:22px;height:15px;background:black;-moz-border-radius:11px/8px;-webkit-border-radius:11px/8px;border-radius:11px/8px;}#drawTools-btn-icon-exit{margin:6px 16px 0px 16px;width:5px;height:21px;background:#c2c2c2;-webkit-transform:skew(43deg);-moz-transform:skew(43deg);-o-transform:skew(43deg);transform:skew(43deg);}#drawTools-btn-icon-exit:before{width:5px;height:21px;background:#c2c2c2;-webkit-transform:skew(-62deg);-moz-transform:skew(-62deg);-o-transform:skew(-62deg);transform:skew(-62deg);content:'';display:block;}#drawTools-btn-icon-options{margin:5px 8px 0px 8px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;}#drawTools-btn-icon-options:before{margin:8px 0px 0px 0px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;content:'';display:block;position:absolute;}#drawTools-btn-icon-options:after{margin:16px 0px 0px 0px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;content:'';display:block;position:absolute;}#drawTools-btn-icon-linechain{margin:8px 24px 0px 11px;width:3px;height:15px;background:black;border-radius:2px;-webkit-transform:rotate(-25deg);-moz-transform:rotate(-25deg);-o-transform:rotate(-25deg);transform:rotate(-25deg);}#drawTools-btn-icon-linechain:before{margin:5px 5px 2px 5px;width:3px;height:13px;background:black;border-radius:2px;content:'';display:block;position:absolute;-webkit-transform:rotate(65deg);-moz-transform:rotate(65deg);-o-transform:rotate(65deg);transform:rotate(65deg);}#drawTools-btn-icon-linechain:after{margin:8px 1px 0px 12px;width:3px;height:10px;background:black;border-radius:2px;content:'';display:block;position:absolute;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);}#drawTools-btn-icon-curve{margin:6px 15px 0px 11px;position: relative;width: 12px;height: 12px;-webkit-box-shadow:-0px 3px 0px 0px black;box-shadow:-0px 3px 0px 0px black;border-radius:100%;}#drawTools-btn-icon-curve:after{margin:10px 0px 0px 10px;position:relative;width:8px;height:10px;-webkit-box-shadow:0px -3px 0px 0px black;box-shadow:0px -3px 0px 0px black;border-radius:100%;content:'';display:block;position:absolute;}#drawTools-btn-icon-curve:before{margin:4px 0px 0px -1px;width:2px;height:9px;background:black;border-radius:2px;-webkit-transform:rotate(-30deg);-moz-transform:rotate(-30deg);-o-transform:rotate(-30deg);-ms-transform:rotate(-30deg);transform:rotate(-30deg);content:'';content:'';display:block;position:absolute;}#drawTools{position:relative;display:inline-block;vertical-align:middle;}#drawTools>.drawTools-btn{position:relative;float:left;display:inline-block;}#drawTools>.drawTools-btn:not(:first-child):not(:last-child):not(.dropdown-toggle){border-radius:0}#drawTools>.drawTools-btn:first-child{margin-left:0;}#drawTools>.drawTools-btn:first-child:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius: 0;border-top-right-radius: 0;}#drawTools>.drawTools-btn:last-child:not(:first-child),#drawTools>.dropdown-toggle:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0;}.drawTools-btn{height:34px;border-radius:2px;margin-top:5px;}.drawTools-btn input{display:none;}.drawTools-btn-container{background-color:#fffb8d;border-bottom:1px solid #e5e17e;height:34px;padding:0px;margin:0px;font-size:14px;font-weight:normal;line-height:1.428571429;text-align:center;vertical-align:middle;cursor:pointer;border-radius:inherit;border-top:1px solid transparent;}.drawTools-btn-container:focus	{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;outline-offset:-2px;}.drawTools-btn-container:hover,.drawTools-btn:focus{background-color:#f6f166;border-bottom:1px solid #ddd85b;color:#333333;text-decoration:none;}.drawTools-btn-container:active,.drawTools-btn input:focus + div,.drawTools-btn input:checked + div{background-color:#f6f166;border-bottom:1px solid #f6f166;-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,0.5);box-shadow:inset 0 3px 5px rgba(0,0,0,0.5);}.drawTools-btn-container.disabled,.drawTools-btn-container[disabled],fieldset[disabled] .drawTools-btn-container{cursor:not-allowed;pointer-events:none;opacity:0.65;filter:alpha(opacity=65);-webkit-box-shadow:none;box-shadow:none;}#drawTools-btn-options .drawTools-btn-container{background:#252525;border-bottom:1px solid #171717;}#drawTools-btn-options .drawTools-btn-container:focus{outline:thin dotted #fff;}#drawTools-btn-options .drawTools-btn-container:hover,#drawTools-btn-options .drawTools-btn:focus{background-color:#2e2e2e;border-bottom:1px solid #222222;}#drawTools-btn-options .drawTools-btn-container:active{background-color:#252525;border-bottom:1px solid #252525;}#drawTools-btn-exit .drawTools-btn-container{background:#a50000;border-bottom:1px solid #7c0000;}#drawTools-btn-exit .drawTools-btn-container:focus{outline:thin dotted #fff;}#drawTools-btn-exit .drawTools-btn-container:hover,#drawTools-btn-exit .drawTools-btn:focus{background-color:#b90c0c;border-bottom:1px solid #980909;}#drawTools-btn-exit .drawTools-btn-container:active{background-color:#a50000;border-bottom:1px solid #a50000;}#drawTools-options{margin-top:"+a+"px;margin-left:"+b+"px;background:#252525;border-bottom:1px solid #171717;width:420px;height:0px;position:absolute;border-radius:2px 2px 0px 0px;opacity:0;overflow:hidden;-webkit-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);}#drawTools-options-content{position:absolute;top:8px;left:8px;right:8px;bottom:8px;}#drawTools-options-leftPanel{width:160px;height:100%;position:absolute;left:0px;}#drawTools-options-leftPanel>.switch{display:block;margin-bottom:20px;}.switch{font:13px/20px 'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;width:150px;height:26px;position:relative;display:inline-block;vertical-align:top;padding:3px;border-radius:2px;cursor:pointer;box-shadow:inset 0 -1px #525252,inset 0 1px 1px rgba(0,0,0,0.8);}.switch-input{position:absolute;top:0;left:0;opacity:0;}.switch-label{position:relative;display:block;height:inherit;font-size:12px;text-transform:uppercase;background:#7b0000;border-radius:inherit;box-shadow:inset 0 1px 2px rgba(0,0,0,0.12),inset 0 0 2px rgba(0,0,0,0.15);-webkit-transition:0.15s ease-out;-moz-transition:0.15s ease-out;-o-transition:0.15s ease-out;transition:0.15s ease-out;-webkit-transition-property:opacity background;-moz-transition-property:opacity background;-o-transition-property:opacity background;transition-property:opacity background;}.switch-label:before,.switch-label:after{position:absolute;top:50%;margin-top:-.5em;line-height:1;-webkit-transition:inherit;-moz-transition:inherit;-o-transition:inherit;transition:inherit;}.switch-label:before{content:attr(data-off);right:11px;color:white;text-shadow:0 1px rgba(0,0,0,0.2);}.switch-label:after{content:attr(data-on);left:11px;color:white;text-shadow:0 1px rgba(0,0,0,0.2);opacity:0;}.switch-input:checked ~ .switch-label {background:#117b00;box-shadow:inset 0 1px 2px rgba(0,0,0,0.15),inset 0 0 3px rgba(0,0,0,0.2);}.switch-input:checked~.switch-label:before{opacity:0;}.switch-input:checked~.switch-label:after{opacity: 1;}.switch-handle{position:absolute;top:4px;left:4px;width:24px;height:24px;background:#c2c2c2;border-radius:2px;box-shadow:1px 1px 5px rgba(0,0,0,0.2);background-image:-webkit-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:-moz-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:-o-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:linear-gradient(to bottom, #c2c2c2 40%, #a7a7a7);-webkit-transition:left 0.15s ease-out;-moz-transition:left 0.15s ease-out;-o-transition:left 0.15s ease-out;transition:left 0.15s ease-out;}.switch-input:checked~.switch-handle{left:128px;box-shadow:-1px 1px 5px rgba(0,0,0,0.2);}.switch-green>.switch-input:checked~.switch-label{background:#4fb845;}#drawTools-options-palette{width:240px;height:100%;position:absolute;right:0px;}#drawTools-options-palette label{width:40px;height:40px;float:left;overflow:hidden;display:inline-block;margin:0;padding=0;}#drawTools-options-palette input{display:none;visibility:hidden;margin:0px;padding:0px;}#drawTools-options-palette input:checked + div{border:2px solid #c2c2c2;}#drawTools-options-palette div{width:40px;height:40px;border:2px solid #252525;margin=0;padding=0;line-height:2.428571429;}#drawTools-options-palette div:focus{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;}#drawTools-options-palette div:hover,#drawTools-options-palette div:focus,#drawTools-options-palette div:active{border:2px solid red;}.drawTools-buttonText,#drawTools-options-palette div{font-size:14px;font-weight:normal;text-align:center;vertical-align:middle;cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}";
	document.body.appendChild(d);
}
  /*-----------------------------------------------------------------------------*/
 /*------------------------------- Event Handlers ------------------------------*/
/*-----------------------------------------------------------------------------*/
ct.eventHandlers["mouseDown"] = function(e) {
	var c = ct;
	var t = c.t;
	
	if($('#drawTools-options').css('opacity') == 1){
		painting = !1;
		c.c.restore();
		c.options.toggleMenu();
		return;
	} else if(t.c === t.tt.BRUSH)
		return;
	t.ta = true;
	c.c.updateLocation();
	
	// Translate mouse location to point relative to c
	c.mouseX = e.pageX-c.c.offset.left;
	c.mouseY = e.pageY-c.c.offset.top;
	
	if(t.c === t.tt.FILL && ct.cd() ) {
		painting = !1;
		t.paintMethods.ff(c.context,c.mouseX,c.mouseY);
	} else if(t.c === t.tt.LINE && ct.cd()) {
		painting = !1;
		t.p.push(c.mouseX,c.mouseY);
	} else if(t.c === t.tt.LINECHAIN && ct.cd()) {
		painting = !1;
	} else if(t.c === t.tt.CURVE && ct.cd()) {
		painting = !1;
	} else if(t.c === t.tt.RECT && ct.cd()) {
		painting = !1;
		t.p.push(c.mouseX,c.mouseY);
	} else if(t.c === t.tt.ELLIPSE && ct.cd()) {
		painting = !1;
		t.p.push(c.mouseX,c.mouseY);
	} 
}

ct.eventHandlers["mouseMove"] = function(e) {
	var c = ct;
	var t = c.t;
	if(t.c === t.tt.BRUSH)
		return;	// default behaviors
	else if(!t.ta)
		return;	// If no tool is in use, ignore event
	
	if(!ct.cd()){return;}
	
	// Translate mouse location to point relative to c
	c.mouseX = e.pageX-c.c.offset.left;
	c.mouseY = e.pageY-c.c.offset.top;
	var endPointX = c.mouseX;
	var endPointY = c.mouseY;
	
	if(t.c === t.tt.FILL) {
		// Do nothing
	} else if(t.c === t.tt.LINE) {
		if(c.shiftDown) {
			var a = t.ls(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.paintMethods.dl(c.context,t.p[0],t.p[1],endPointX,endPointY);
	} else if(t.c === t.tt.LINECHAIN) {
		if(t.p.length > 0) {
			if(c.shiftDown) {
				var a = t.ls(t.p[t.p.length-2],t.p[t.p.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
			}
			var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
			c.c.restore();
			t.paintMethods.dc(c.context,t.p.concat(endPointX,endPointY),true,c.options.lineToolsShouldClose,fc);
		}
	} else if(t.c === t.tt.CURVE) {
		if(t.p.length > 0) {
			var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
			c.c.restore();
			t.paintMethods.ds(c.context,t.p.concat(c.mouseX,c.mouseY),0.5,c.options.lineToolsShouldClose,fc,true);
		}
	} else if(t.c === t.tt.RECT) {
		var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
		if(c.shiftDown) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.paintMethods.dr(c.context,t.p.concat(endPointX,endPointY),fc);
	} else if(t.c === t.tt.ELLIPSE) {
		var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
		if(c.shiftDown) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.paintMethods.de(c.context,t.p.concat(endPointX,endPointY),fc);
	}
}

ct.eventHandlers["mouseUp"] = function(e) {
	var c = ct;
	var t = c.t;
	if(!ct.cd()){return;}
	
	if(0 && $('#drawTools-options').css('opacity') == 1){
		c.c.updateLocation();
		if(!c.options.iwb(e.pageX, e.pageY)) {
			c.options.toggleMenu();
		}
		return;
	} else if(t.c === t.tt.BRUSH)
		return;
	else if(!t.ta)	// If no tool is in use, ignore event
		return;
		
	// Translate mouse location to point relative to c
	c.mouseX = e.pageX-c.c.offset.left;
	c.mouseY = e.pageY-c.c.offset.top;
	var endPointX = c.mouseX;
	var endPointY = c.mouseY;
	
	if(t.c === t.tt.FILL) {
		t.reset(true);
	} else if(t.c === t.tt.LINE) {
		if(c.shiftDown) {
			var a = t.ls(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.paintMethods.dl(c.context,t.p[0],t.p[1], endPointX, endPointY);
		t.reset(true);
	} else if(t.c === t.tt.LINECHAIN) {
		if(c.c.isWithinDrawingBounds(c.mouseX,c.mouseY)){
			if(c.shiftDown) {
				var a = t.ls(t.p[t.p.length-2],t.p[t.p.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
			}
			t.p.push(endPointX,endPointY);
			if(e.which == 3) {	// If right mouse click, finish the chain
				var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
				c.c.restore();
				t.paintMethods.dc(c.context,t.p,false,c.options.lineToolsShouldClose,fc);
				t.reset(true);
			}
		} else { // If user clicks out of acceptable boundaries, cancel all tool progress
			c.c.restore();
			t.reset();
		}
	} else if(t.c === t.tt.CURVE) {
		if(c.c.isWithinDrawingBounds(c.mouseX,c.mouseY)){
			t.p.push(c.mouseX,c.mouseY);
			if(e.which == 3) {	// If right mouse click, finish the curve
				var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
				c.c.restore();
				t.paintMethods.ds(c.context,t.p,0.5,c.options.lineToolsShouldClose,fc,false);
				t.reset(true);
			}
		} else { // If user clicks out of acceptable boundaries, cancel all tool progress
			c.c.restore();
			t.reset();
		}
	} else if(t.c === t.tt.RECT) {
		var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
		if(c.shiftDown) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.p.push(endPointX,endPointY);
		t.paintMethods.dr(c.context,t.p,fc);
		t.reset(true);
	} else if(t.c === t.tt.ELLIPSE) {
		var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
		if(c.shiftDown) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.c.restore();
		t.p.push(endPointX,endPointY);
		t.paintMethods.de(c.context,t.p,fc);
		t.reset(true);
	}
}
ct.eventHandlers["keyDown"] = function(e) {
	var c = ct;
	var t = c.t;
	if(!ct.cd()){return;}
	if(e.keyCode == 16 ) { // If shift is pressed
		c.shiftDown = 1;
		var endPointX = c.mouseX;
		var endPointY = c.mouseY;
		
		if(!t.ta)
			return;
		else if( t.c === t.tt.RECT || t.c === t.tt.ELLIPSE ) {
			var a = t.ss(t.p[0],t.p[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
			
			c.c.restore();
			var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
			if(t.c === t.tt.RECT)
				t.paintMethods.dr(c.context,t.p.concat(endPointX,endPointY),fc);
			else
				t.paintMethods.de(c.context,t.p.concat(endPointX,endPointY),fc);
		} else if( t.c === t.tt.LINE || t.c === t.tt.LINECHAIN ) {
			if(t.p.length > 0) {
				var a = t.ls(t.p[t.p.length-2],t.p[t.p.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
				
				c.c.restore();
				if( t.c === t.tt.LINECHAIN ) {
					var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
					t.paintMethods.dc(c.context,t.p.concat(endPointX,endPointY),true,c.options.lineToolsShouldClose,fc);
				} else {
					t.paintMethods.dl(c.context,t.p[0],t.p[1],endPointX,endPointY);
				}
			}
		}
	} else if(e.keyCode == "Q".charCodeAt(0)) {
		if(t.c === t.tt.LINECHAIN || t.c === t.tt.CURVE) {
			if(t.p.length) {
				t.p.length -= 2;
				c.c.restore();
				if(t.p.length == 0) {
					t.reset();
				} else {
					var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
					if(t.c === t.tt.LINECHAIN)
						t.paintMethods.dc(c.context,t.p.concat(c.mouseX,c.mouseY),true,c.options.lineToolsShouldClose,fc);
					else
						t.paintMethods.ds(c.context,t.p.concat(c.mouseX,c.mouseY),0.5,c.options.lineToolsShouldClose,fc,true);
				}
			}
		}
	} else {
		//alert('Keycode for that key is: ' + e.keyCode);
	}
}
ct.eventHandlers["keyUp"] = function(e) {
	if(!ct.cd()){return;}
	var c = ct;
	var t = c.t;
	if(e.keyCode == 16) { // If shift is released
		c.shiftDown = 0;
		var endPointX = c.mouseX;
		var endPointY = c.mouseY;
		
		if(!t.ta)
			return;
			
		if( t.c === t.tt.RECT || t.c === t.tt.ELLIPSE ){
			c.c.restore();
			var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
			if(t.c === t.tt.RECT)
				t.paintMethods.dr(c.context,t.p.concat(endPointX,endPointY),fc);
			else
				t.paintMethods.de(c.context,t.p.concat(endPointX,endPointY),fc);
		} else if( t.c === t.tt.LINE || t.c === t.tt.LINECHAIN ) {
			if(t.p.length > 0) {
				c.c.restore();
				if( t.c === t.tt.LINECHAIN ) {
					var fc = (c.options.useStrokeAsFill) ? c.context.strokeStyle : c.options.fc;
					t.paintMethods.dc(c.context,t.p.concat(endPointX,endPointY),true,c.options.lineToolsShouldClose,fc);
				} else {
					t.paintMethods.dl(c.context,t.p[0],t.p[1],endPointX,endPointY);
				}
			}
		}
	}
}

  /*-----------------------------------------------------------------------------*/
 /*---------------------- Elements Creation/Manipulation -----------------------*/
/*-----------------------------------------------------------------------------*/
//Creates Tool Buttons (no innerHTML)
ct.html.init['createToolButton'] = function(type, name)
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
	
	button.onclick = function(){ct.html.buttonHandlers.setToolType(type);};
	return button;
}
//Creates Tool Buttons (with a label)
ct.html.init['createToolButtonWithLabel'] = function(type, name, label)
{
	var button = ct.html.init.createToolButton(type, name);
	button.getElementsByTagName('div')[0].innerHTML = label; // Place text inside it
	return button;
}
//Creates Tool Buttons (no innerHTML)
ct.html.init['createUtilityButton'] = function(name)
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

ct.html.init['createOptionsMenu'] = function(drawToolsDiv, optionsButton)
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
		'<label onclick=ct.html.buttonHandlers.setLineToolsOpen(); class="switch">\
			<input type="checkbox" class="switch-input" id="drawTools-options-checkbox-lineToolsOpen">\
			<span class="switch-label" data-on="Loop Line Tools" data-off="Open Line Tools"></span>\
			<span class="switch-handle"></span>\
		</label>';
	document.getElementById('drawTools-options-leftPanel').innerHTML = leftPanelHtml;
	//----- BEGIN ----- ColorPicker --------------------------------------------------
	var colorElements = document.getElementsByClassName('colorPicker');
	var optionsPaletteHtml = "";
	
	optionsPaletteHtml += 
		'<label onclick=ct.html.buttonHandlers.setOptionsColor(""); style="width:120px;">' +
			'<input type="radio" name="drawTools-options-palette-radio" checked>' +
			'<div style="width:120px;background:#333333;color:#c2c2c2;">No Fill</div>' +
		'</label>';
	optionsPaletteHtml += 
		'<label onclick=ct.html.buttonHandlers.setOptionsColor("",1); style="width:120px;">' +
			'<input type="radio" name="drawTools-options-palette-radio">' +
			'<div style="width:120px;background:#333333;color:#c2c2c2;">Brush Color</div>' +
		'</label>';
	
	for(var i=0;i<colorElements.length;i++) {
		var color = colorElements[i].getAttribute("data-color");
		ct.dcPalette.push(color);
		optionsPaletteHtml += 
			'<label onclick=ct.html.buttonHandlers.setOptionsColor("' + color + '");>' + //
				'<input type="radio" name="drawTools-options-palette-radio">' +
				'<div style="background:' + color + ';"></div>' +
			'</label>';
	}
	document.getElementById('drawTools-options-palette').innerHTML = optionsPaletteHtml;
}
// Destroys all elements, styling and javascript
ct.html['DTDestroy'] = function() 
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
	delete ct.html;
	delete ct;
	document.getElementById('DTScript').remove();
}
ct.html.init['setupCssAndHtml'] = function()
{	
	if(!ct.cd()){return;}
	
	ct.c.updateLocation();
	/*---- 1. Create Draw Tools Container - DIV in which DrawTools will be placed in ----*/
	var drawToolsDiv = document.createElement('div');
	drawToolsDiv.id = ct.id;
	ct.dcToolbar.appendChild(drawToolsDiv);
	
	/*---- 2. Setup necessary CSS for DrawTools ----*/
	ct.html.init.setupCSS();
	
	/*---- 3. Make Necessary Modifications to Existing Elements ----*/
	document.getElementById(ct.dcBrushes[0].id).parentNode.onclick = function(){ct.html.buttonHandlers.brushClick(ct.dcBrushes[0].size);};
	document.getElementById(ct.dcBrushes[1].id).parentNode.onclick = function(){ct.html.buttonHandlers.brushClick(ct.dcBrushes[1].size);};
	document.getElementById(ct.dcBrushes[2].id).parentNode.onclick = function(){ct.html.buttonHandlers.brushClick(ct.dcBrushes[2].size);};
	document.getElementById(ct.dcBrushes[3].id).parentNode.onclick = function(){ct.html.buttonHandlers.brushClick(ct.dcBrushes[3].size);};
	
	/*---- 4. Create Draw Tools Elements and Interface ----*/
	// Create Tool Buttons
	ct.html.init.createToolButton(ct.t.tt.FILL,"fill");
	ct.html.init.createToolButton(ct.t.tt.LINE,"line");
	ct.html.init.createToolButton(ct.t.tt.LINECHAIN,"linechain");
	ct.html.init.createToolButton(ct.t.tt.CURVE,"curve");
	ct.html.init.createToolButton(ct.t.tt.RECT,"rect");
	ct.html.init.createToolButton(ct.t.tt.ELLIPSE,"ellipse");
	
	var optionsButton = ct.html.init.createUtilityButton("options");
	optionsButton.onclick = function(){ct.options.toggleMenu();};
	
	ct.html.init.createOptionsMenu(drawToolsDiv, optionsButton);
	
	// Exitbutton to remove DrawTools
	var exitButton = ct.html.init.createUtilityButton("exit");
	exitButton.onclick = function(){ct.html.DTDestroy();};
}
  /*-----------------------------------------------------------------------------*/
 /*----------------------------------- Main ------------------------------------*/
/*-----------------------------------------------------------------------------*/
ct.context.putImageData=CanvasRenderingContext2D.prototype.putImageData;
ct.html.init.setupCssAndHtml();
ct.C.off('mousedown');
ct.C.on('mousedown',ct.eventHandlers.mouseDown);
$(document).off('mousemove');
$(document).on('mousemove',ct.eventHandlers.mouseMove);
$(document).off('mouseup');
$(document).on('mouseup',ct.eventHandlers.mouseUp);
$(document).keydown(ct.eventHandlers.keyDown);
$(document).keyup(ct.eventHandlers.keyUp);
