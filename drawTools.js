var StopWatch = function (performance) {
    this.startTime = 0;
    this.stopTime = 0;
    this.running = false;
    this.performance = performance === false ? false : !!window.performance;
};
StopWatch.prototype.currentTime = function () {
    return this.performance ? window.performance.now() : new Date().getTime();
};
StopWatch.prototype.start = function () {
    this.startTime = this.currentTime();
    this.running = true;
};
StopWatch.prototype.stop = function () {
    this.stopTime = this.currentTime();
    this.running = false;
};
StopWatch.prototype.getElapsedMilliseconds = function () {
    if (this.running)
        this.stopTime = this.currentTime();
    return this.stopTime - this.startTime;
};
StopWatch.prototype.getElapsedSeconds = function () {
    return this.getElapsedMilliseconds() / 1000;
};
StopWatch.prototype.printElapsed = function (name) {
    var currentName = name || 'Elapsed:';
    console.log(currentName, '[' + this.getElapsedMilliseconds() + 'ms]', '[' + this.getElapsedSeconds() + 's]');
    outputDebug('[' + this.getElapsedMilliseconds() + 'ms]');
};

// State variable that helps prevent double installation of script
window.DTToolsIsCurrentlyInstalled = true;

// Setup Constants
//cleanTools["PropertyD"] = 4
var DRAW_TOOLS_ID = 'drawTools';
var DRAWCEPTION_TOOLBAR = document.getElementById('redo-button').parentNode.parentNode;
var DRAWCEPTION_BRUSHES = 
	[{id: 'brush-2', size: 2},{id: 'brush-5', size: 5},{id: 'brush-12', size: 12},{id: 'brush-35', size: 35}];

var xfasdfadf = 2+3;
var doasfasdf = xfasdfadf +34;
var doasdsasdffasdf = xfasdfadf +33;


  /*-----------------------------------------------------------------------------*/
 /*--------------------- Custom Objects/Structures/enums -----------------------*/
/*-----------------------------------------------------------------------------*/				 
// Setup Clean Tools Object
var cleanTools = {
	'id':DRAW_TOOLS_ID,
	
	'dcToolbar':DRAWCEPTION_TOOLBAR,
	'dcBrushes':DRAWCEPTION_BRUSHES,
	'dcPalette':[],
	
	'canvas':{},               // Canvas related vars and methods
	'Canvas':drawApp.canvas,   // Actual canvas object
	'context':drawApp.context, // Canvas context
	
	'mouseX':0, // Mouse coords
	'mouseY':0,
	
	'shiftDown':0,
	
	'eventHandlers':{},
	
};
cleanTools["canvas"] = {
    'parentObject':cleanTools,
	'Canvas':cleanTools.Canvas,
	'offset':{top:0,left:0},
	'width':0,
	'height':0,
	
	"updateLocation": function() {
		this.offset = $('#drawingCanvas').offset();    // Update canvas offset variable
		this.width = this.Canvas.width();              // Update canvas width variable
		this.height = this.Canvas.height();            // Update canvas width variable
	},
	"isWithinBounds": function(x,y) {
		return (x>=0 && y>=0 && x<this.width && y<this.height);
	},
	"isWithinDrawingBounds": function(x,y) {
		return (x>=(-12) && y>=(-12) && x<(this.width+12) && y<(this.height+12));
	},
	"restore": function() {
		this.parentObject.context.constructor.prototype.putImageData.call(this.parentObject.context, restorePoints[restorePosition], 0, 0);
	},
};
cleanTools["tools"] = {
	'currentToolType':0,
	'toolInUse':false,
	'points':[], // Will contain user input point sets for shapes/lines/etc
	
	'toolType':{BRUSH:0,FILL:1,LINE:2,LINECHAIN:3,CURVE:4,RECT:5,ELLIPSE:6,UTIL:99},
	'reset':function(saveCanvas) {
		this.points.length = 0;
		this.toolInUse = false;
		if(saveCanvas)
			save();
	},
	'paintMethods':{},
};
cleanTools["options"] = {
	'id':'#' + cleanTools.id + '-options',
	
	// Fill Options
	'useStrokeAsFill':false,
	'fillColor':'', // Will be null if no fill for shapes
	
	'lineToolsShouldClose':false,
	
	'curveTension':0.5,
	
	'getOffset':function () {
		return $(this.id).offset();
	},
	'toggleMenu':function () {
		var h = 175;	// Height of the options div
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
	'isWithinBounds':function (x, y) {
		var x2 = x - $(this.id).offset().top;
		var y2 = y - $(this.id).offset().left;
		var width = $(this.id).width();
		var height = $(this.id).height();
		//outputDebug("[x:" + x2 + ", y:" + y2 + "] [width:" + width + ", height:" + height + "]");
		return (x2>=0 && y2>=0 && x2<width && y2<height);
	},
};
cleanTools["html"] = {
	'parentObject':cleanTools,
	
	'init':{}, // HTML initialization methods will be placed here
	
	'buttonHandlers':{
		'cleanToolsObject':cleanTools,
		'brushClick':function(brushSize) {
			drawApp.setSize(brushSize);				// Set default brush size
			this.cleanToolsObject.tools.currentToolType = cleanTools.tools.toolType.BRUSH;		// Update tool type
			
			// Visually unselect any other tools
			var ele = document.getElementsByName(cleanTools.id + "-btn-radio");
			for(var i=0;i<ele.length;i++)
				ele[i].checked = false;
		},
		'setLineToolsOpen':function() {
			this.cleanToolsObject.options.lineToolsShouldClose = document.getElementById('drawTools-options-checkbox-lineToolsOpen').checked;
		},
		'setOptionsColor':function(color,normalfill) {
			if(normalfill) {
				this.cleanToolsObject.options.useStrokeAsFill = true;
				this.cleanToolsObject.options.fillColor = '';
			} else {
				this.cleanToolsObject.options.useStrokeAsFill = false;
				this.cleanToolsObject.options.fillColor = color;
			}
		},
		'setToolType':function(type) {
			this.cleanToolsObject.tools.currentToolType=type;
		},
	},
};
  /*-----------------------------------------------------------------------------*/
 /*----------------------------- Drawing Algorithms ----------------------------*/
/*-----------------------------------------------------------------------------*/
cleanTools.tools.paintMethods["drawLine"] = function(ctx,startX,startY,finishX,finishY)
{
	ctx.beginPath();
	ctx.moveTo( startX, startY );
	ctx.lineTo( finishX, finishY);
	ctx.stroke();
}
cleanTools.tools.paintMethods["drawRect"] = function(ctx,pts,fillColorHex)
{
	ctx.save();
	ctx.lineJoin="round";
	ctx.beginPath();
	ctx.moveTo( pts[0], pts[1] );
	ctx.lineTo( pts[2], pts[1]);
	ctx.lineTo( pts[2], pts[3]);
	ctx.lineTo( pts[0], pts[3]);
	ctx.closePath();
	if(fillColorHex) {
		ctx.fillStyle = fillColorHex;
		ctx.fill();
	}
	ctx.stroke();
	ctx.restore();
}
cleanTools.tools.paintMethods["drawEllipse"] = function(ctx,pts,fillColorHex)
{
	var x = pts[0],
	y =  pts[1],
	w = pts[2] - pts[0],
	h = pts[3] -  pts[1],
	kappa = .5522848,
	ox = ( w / 2 ) * kappa,// control point offset horizontal
	oy = ( h / 2 ) * kappa,// control point offset vertical
	xe = x + w,            // x-end
	ye = y + h,            // y-end
	xm = x + w / 2,        // x-middle
	ym = y + h / 2;        // y-middle
	ctx.save();
	ctx.lineJoin="round";
	ctx.beginPath();
	ctx.moveTo( x, ym );
	ctx.bezierCurveTo( x, ym - oy, xm - ox, y, xm, y );
	ctx.bezierCurveTo( xm + ox, y, xe, ym - oy, xe, ym );
	ctx.bezierCurveTo( xe, ym + oy, xm + ox, ye, xm, ye );
	ctx.bezierCurveTo( xm - ox, ye, x, ym + oy, x, ym );
	ctx.closePath();
	if(fillColorHex) {
		ctx.fillStyle = fillColorHex;
		ctx.fill();
	}
	ctx.stroke();
	ctx.restore();
}
cleanTools.tools.paintMethods["floodFill"] = function(ctx,xSeed,ySeed){
	// Round seed coords in case they happen to be float type
	xSeed = Math.round( xSeed );
	ySeed = Math.round( ySeed );
	/*---------------------- Setup Procedure Variables ----------------------*/
	// This canvas.restore() fix avoids issues with brush placing dot over flood fill seed area
	cleanTools.canvas.restore();
	
	var w = cleanTools.canvas.width;
	var h = cleanTools.canvas.height;
	var p = ctx.getImageData(0,0,w,h);
	var d = p.data;
	var tci = (xSeed+ySeed*cleanTools.canvas.width)*4;
	var targetColor = [d[tci],d[tci+1],d[tci+2],d[tci+3]];//getColorFromCoords(xSeed,ySeed); // Cant use because its not initialized yet
	var c = parseInt(ctx.strokeStyle.substr(1,6),16);
	var fillColor = [(c>>16)&255,(c>>8)&255,c&255,255];
	
	/*---------------------- Supporting functions ----------------------*/
	// Define some useful functions
	var colorCompare = function(color1,color2) {
		return (color1[0]===color2[0] && color1[1]===color2[1] && color1[2]===color2[2] && color1[3]===color2[3]);
	};
	var getColorFromCoords = function(x,y){
		var i = (x + y * w) * 4;
		return [d[i],d[i+1],d[i+2],d[i+3]];
	}
	//Colors a pixel with a given color
	var colorPixel = function(x,y,color) {
		var i = (x + y * w) * 4;
		d[i]=color[0];
		d[i+1]=color[1];
		d[i+2]=color[2];
		d[i+3]=color[3];
	}
	// [Experimental] Colors a pixel with a blend of 2 colors (helpful for assimilating anti-aliasing)
	var colorPixelBlend = function(x,y,color1,color2){
		var r=Math.ceil((color1[0]+color2[0])/2);
		var g=Math.ceil((color1[1]+color2[1])/2);
		var b=Math.ceil((color1[2]+color2[2])/2);
		var a=Math.ceil((color1[3]+color2[3])/2);
		colorPixel(x,y,[r,g,b,a]);
	}
	//---Algorithm helper functions
	var paint = function(xMin,xMax,y,color) {
		var r = color[0], g = color[1], b = color[2], a = color[3];
		var limit = (xMax+1 + y * w) * 4;
		for(var i = (xMin + y * w) * 4; i<limit; i+=4) {
			d[i]=r;
			d[i+1]=g;
			d[i+2]=b;
			d[i+3]=a;
		}
	}
	var test = function(x,y) {
		return (cleanTools.canvas.isWithinBounds(x,y) && colorCompare(targetColor,getColorFromCoords(x,y)));
	}
	var testEdgePoint = function(x,y,originalY) {
		var edge1 = edgeEligible(x,y);
		var edge2 = edgeEligible(x-1,y);
		var edge3 = edgeEligible(x+1,y);
		if( !edge1 ) {
			return false;
		} else if( edge2 && edge3 ) {
			return true;
		} else if ( edge3 && edgeEligible(x-1,originalY)) {
			return true;
		} else if ( edge2 && edgeEligible(x+1,originalY)) {
			return true;
		}
		return false;
	}
	var edgeEligible = function(x,y) {
		var color = getColorFromCoords(x,y);
		return ( cleanTools.canvas.isWithinBounds(x,y) && (!colorCompare(fillColor,color)) && (!colorCompare(targetColor,color)) );
	}
	
	/*---------------------- Begin Procedure ----------------------*/
	// If seed pixel is already colored the fill color, nothing needs to be done, return early
	if(colorCompare(targetColor,fillColor))
		return;
	
	/*---------------------- Algorithm Begin ----------------------*/
	//[x,y,goingUp(1 vs -1)
	var stack = [[xSeed,ySeed,1]];
	if(test(xSeed,ySeed-1))
		stack.push([xSeed,ySeed-1,-1]);
	var edgeArray = [];
	
	var x = 0;
	var y = 0;
	var direction = 0;
	
	while(stack.length>0) {
		var line = stack.pop();
		x = line[0];
		y = line[1];
		direction = line[2];
		if(test(x,y)) {	// If pixel hasn't been colored continue.
			// Check next pixel in "direction" side is eligible to be seed pixel for next line.
			if(test(x,y+direction))
				stack.push([x,y+direction,direction]);
			
			// Before scanning line, find wether or not to add edge pixels from seed point
			if(testEdgePoint(x,y+direction,y))
				edgeArray.push(x,y+direction);
			if(testEdgePoint(x,y-direction,y))
				edgeArray.push(x,y-direction);
			
			var range = [0,0];
			for(var j = 0; j < 2; j++) { // Iterates through left/right line sides
				var incr = (j) ? 1 : -1 ;
				var i;
				for(i = x+incr; test(i,y); i+=incr) { // While pixel line meets continues to meet its target color
					// Setup Bools
					var topFillable = test(i,y+direction);
					var bottomFillable = test(i,y-direction);
					var topLeftUnfillable = (!test(i-incr,y+direction));
					var bottomLeftUnfillable = (!test(i-incr,y-direction));
					
					if(topFillable && topLeftUnfillable) // Find when to add a new seed(top)
						stack.push([i,y+direction,direction]);
					else if(testEdgePoint(i,y+direction,y)) // Find Wether or not to add edge pixels
						edgeArray.push(i,y+direction);
						
					if(bottomFillable && bottomLeftUnfillable) // Find when to add a new seed(bottom)
						stack.push([i,y-direction,-direction]);
					else if(testEdgePoint(i,y-direction,y)) // Find Wether or not to add edge pixels
						edgeArray.push(i,y-direction);
				}
				if(cleanTools.canvas.isWithinBounds(i,y))
					edgeArray.push(i,y);
				range[j] = i-incr; // Save max fill pixel
				
			}
			paint(range[0],range[1],y,fillColor);
		}
	}
	// This loop colors edge pixels and softens them with anti-aliasing
	while(edgeArray.length>0) {
		x=edgeArray.shift();
		y=edgeArray.shift();
		
		colorPixel(x,y,fillColor);
		
		if( (!colorCompare(fillColor,getColorFromCoords(x-1,y))) && cleanTools.canvas.isWithinBounds(x-1,y) )
			colorPixelBlend(x-1,y,fillColor,getColorFromCoords(x-1,y));
		if( (!colorCompare(fillColor,getColorFromCoords(x+1,y))) && cleanTools.canvas.isWithinBounds(x+1,y) )
			colorPixelBlend(x+1,y,fillColor,getColorFromCoords(x+1,y));
		if( (!colorCompare(fillColor,getColorFromCoords(x,y-1))) && cleanTools.canvas.isWithinBounds(x,y-1) )
			colorPixelBlend(x,y-1,fillColor,getColorFromCoords(x,y-1));
		if( (!colorCompare(fillColor,getColorFromCoords(x,y+1))) && cleanTools.canvas.isWithinBounds(x,y+1) )
			colorPixelBlend(x,y+1,fillColor,getColorFromCoords(x,y+1));
	}
	ctx.putImageData(p,0,0);
}
cleanTools.tools.paintMethods["drawLineChain"] = function (ctx,pts,editMode,closeShape,closedFillColorHex)
{
	ctx.save();
	ctx.lineJoin="round";
	ctx.beginPath();
	ctx.moveTo( pts[0], pts[1] );
	for(var i=2;i<pts.length;i+=2)
		ctx.lineTo( pts[i], pts[i+1] );
	if(closeShape) {
		if(editMode) {
			ctx.stroke(); // Stroke all lines previous to this one
			// Get current stroke color and set it to .5 opacity
			var c = parseInt(ctx.strokeStyle.substr(1,6),16);
			ctx.strokeStyle = "rgba(" + ((c>>16)&255) + "," + ((c>>8)&255) + "," + (c&255) + ",0.5)";
			// Make the closing stroke
			ctx.moveTo( pts[pts.length-2], pts[pts.length-1] );
			ctx.lineTo( pts[0], pts[1] );
		} else {
			ctx.closePath()
			if(closedFillColorHex) {
				ctx.fillStyle = closedFillColorHex;
				ctx.fill();
			}
		}
	}
	ctx.stroke();
	// Draw the knot points.
	if(editMode){   
		ctx.save();
		// Determine wether to use dark or light points
		var c = parseInt(ctx.strokeStyle.substr(1,6),16); // Get current stroke color
		var c2 = (0.2126*((c>>16)&255)) + (0.7152*((c>>8)&255)) + (0.0722*(c&255)); // Get its 'lightness' level
		ctx.fillStyle = (c2 > 160) ? "#444444" : "#FFFFFF"; // If (colorIsLight) ? darkGray : white;
		ctx.lineWidth=3;
		for(var i=0;i<pts.length;i+=2){
			ctx.beginPath();
			ctx.arc(pts[i],pts[i+1],2.5,2*Math.PI,false);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
		ctx.restore();
	}
	ctx.restore();
}
cleanTools.tools.paintMethods["drawSpline"] = function(ctx,pts,t,closed,closedFillColorHex,editMode){
	var cp=[];   // array of control points, as x0,y0,x1,y1,...
	var n=pts.length;
	var isClosedSpline = (closed) ? 1 : 0;
	// First check for some base cases
	if(n == 0) {
		return;
	} else if(n == 4) {
		// Draw Line
		ctx.beginPath();
		ctx.moveTo( pts[0], pts[1] );
		ctx.lineTo( pts[2], pts[3]);
		ctx.stroke();
	}
	// For closed spline: Append and prepend knots and control points to close the curve
	if(isClosedSpline){
		pts.push(pts[0],pts[1],pts[2],pts[3]);
		pts.unshift(pts[n-1]);
		pts.unshift(pts[n-1]);
	}
	// Find Control Points
	for(var i=0, m = (n-4+(4*isClosedSpline));i<m;i+=2){
		// Calculate Control Points
		//  x0,y0,x1,y1 are the coordinates of the end (knot) pts of this segment
		//  x2,y2 is the next knot -- not connected here but needed to calculate p2
		//  p1 is the control point calculated here, from x1 back toward x0.
		//  p2 is the next control point, calculated here and returned to become the 
		//  next segment's p1.
		//  t is the 'tension' which controls how far the control points spread.
		//  Scaling factors: distances from this knot to the previous and following knots.
		var x0=pts[i], y0=pts[i+1], x1=pts[i+2], y1=pts[i+3], x2=pts[i+4], y2=pts[i+5];
		// Calculate intermediary values
		var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
		var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
		var fa=t*d01/(d01+d12);
		var fb=t-fa;
	  	// Calculate Control Points
		var p1x=x1+fa*(x0-x2);
		var p1y=y1+fa*(y0-y2);
		var p2x=x1-fb*(x0-x2);
		var p2y=y1-fb*(y0-y2);  
		// Then add them to cp array
		cp=cp.concat(p1x,p1y,p2x,p2y);
	}
	cp = (isClosedSpline) ? cp.concat(cp[0],cp[1]) : cp;
	
	ctx.save(); 
	
	ctx.beginPath();
	ctx.lineJoin="round";
	ctx.moveTo(pts[2],pts[3]);
	for(var i=2;i<n;i+=2)
		ctx.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],pts[i+2],pts[i+3]);
	
	if(isClosedSpline) {
		if(editMode) {
			ctx.stroke(); // Stroke all lines previous to this one
			ctx.save();
			// Get current stroke color and set it to .5 opacity
			var c = parseInt(ctx.strokeStyle.substr(1,6),16);
			ctx.strokeStyle = "rgba(" + ((c>>16)&255) + "," + ((c>>8)&255) + "," + (c&255) + ",0.5)";
			// Make the closing stroke
			ctx.bezierCurveTo(cp[2*n-2],cp[2*n-1],cp[2*n],cp[2*n+1],pts[n+2],pts[n+3]);
			ctx.stroke();
			ctx.restore();
		} else{
			// Make the closing stroke
			ctx.bezierCurveTo(cp[2*n-2],cp[2*n-1],cp[2*n],cp[2*n+1],pts[n+2],pts[n+3]);
			ctx.moveTo(pts[0],pts[1]);
			ctx.closePath();
			if(closedFillColorHex) {
				ctx.fillStyle = closedFillColorHex;
				ctx.fill();
			}
			ctx.stroke();
		}
	} else { 
		// For open curves the first and last arcs are simple quadratics.
		ctx.moveTo(pts[0],pts[1]);
		ctx.quadraticCurveTo(cp[0],cp[1],pts[2],pts[3]);
		ctx.moveTo(pts[n-2],pts[n-1]);
		ctx.quadraticCurveTo(cp[2*n-10],cp[2*n-9],pts[n-4],pts[n-3]);
		ctx.stroke();
	}
	// Draw the knot points.
	if(editMode){   
		ctx.save();
		// Determine wether to use dark or light points
		var c = parseInt(ctx.strokeStyle.substr(1,6),16); // Get current stroke color
		var c2 = (0.2126*((c>>16)&255)) + (0.7152*((c>>8)&255)) + (0.0722*(c&255)); // Get its 'lightness' level
		ctx.fillStyle = (c2 > 160) ? "#444444" : "#FFFFFF"; // If (colorIsLight) ? darkGray : white;
		ctx.lineWidth=3;
		for(var i=(2*isClosedSpline), m = (n-2+(2*isClosedSpline));i<m;i+=2){
			ctx.beginPath();
			ctx.arc(pts[i],pts[i+1],2.5,2*Math.PI,false);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
		ctx.restore();
	}
	ctx.restore();
}
  /*-----------------------------------------------------------------------------*/
 /*----------------------------- CSS Style Sheets ------------------------------*/
/*-----------------------------------------------------------------------------*/
cleanTools.html.init['setupCSS'] = function()
{
	// Calculate variables used in css
	var optionsMarginTop = cleanTools.canvas.offset.top + cleanTools.canvas.height - $('#' + cleanTools.id).offset().top;
	
	var DTSheet = document.createElement('style');
	DTSheet.id = cleanTools.id + 'StyleSheet'; // Give id so destructor can find it if needed
	DTSheet.innerHTML = "\n\
		/*These drawTools-btn-Icon are css only icons*/\n\
		#drawTools-btn-icon-fill{margin:12px 5px 0px 21px;width:12px;height:12px;background:black;border-bottom-right-radius:2px;border-bottom-left-radius:2px;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-ms-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}\n\
		#drawTools-btn-icon-fill:before{border-bottom:5px solid black;border-left:8px solid transparent;border-right:8px solid transparent;display:block;position:absolute;top:-6px;left:-6px;content:'';}\n\
		#drawTools-btn-icon-line{margin:8px 16px 0px 17px;width:5px;height:15px;background:black;-webkit-transform:skew(-50deg);-moz-transform:skew(-50deg);-o-transform:skew(-50deg);transform:skew(-50deg);}\n\
		#drawTools-btn-icon-rect{margin:8px 8px 0px 8px;width:22px;height:15px;background:black;}\n\
		#drawTools-btn-icon-ellipse{margin:8px 8px 0px 8px;width:22px;height:15px;background:black;-moz-border-radius:11px/8px;-webkit-border-radius:11px/8px;border-radius:11px/8px;}\n\
		#drawTools-btn-icon-exit{margin:6px 16px 0px 16px;width:5px;height:21px;background:#c2c2c2;-webkit-transform:skew(43deg);-moz-transform:skew(43deg);-o-transform:skew(43deg);transform:skew(43deg);}\n\
		#drawTools-btn-icon-exit:before{width:5px;height:21px;background:#c2c2c2;-webkit-transform:skew(-62deg);-moz-transform:skew(-62deg);-o-transform:skew(-62deg);transform:skew(-62deg);content:'';display:block;}\n\
		#drawTools-btn-icon-options{margin:5px 8px 0px 8px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;}\n\
		#drawTools-btn-icon-options:before{margin:8px 0px 0px 0px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;content:'';display:block;position:absolute;}\n\
		#drawTools-btn-icon-options:after{margin:16px 0px 0px 0px;width:30px;height:5px;background:#c2c2c2;border-radius:1px;content:'';display:block;position:absolute;}\n\
		#drawTools-btn-icon-linechain{margin:8px 24px 0px 11px;width:3px;height:15px;background:black;border-radius:2px;-webkit-transform:rotate(-25deg);-moz-transform:rotate(-25deg);-o-transform:rotate(-25deg);transform:rotate(-25deg);}\n\
		#drawTools-btn-icon-linechain:before{margin:5px 5px 2px 5px;width:3px;height:13px;background:black;border-radius:2px;content:'';display:block;position:absolute;-webkit-transform:rotate(65deg);-moz-transform:rotate(65deg);-o-transform:rotate(65deg);transform:rotate(65deg);}\n\
		#drawTools-btn-icon-linechain:after{margin:8px 1px 0px 12px;width:3px;height:10px;background:black;border-radius:2px;content:'';display:block;position:absolute;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);}\n\
		#drawTools-btn-icon-curve{margin:6px 15px 0px 11px;position: relative;width: 12px;height: 12px;-webkit-box-shadow:-0px 3px 0px 0px black;box-shadow:-0px 3px 0px 0px black;border-radius:100%;}\n\
		#drawTools-btn-icon-curve:after{margin:10px 0px 0px 10px;position:relative;width:8px;height:10px;-webkit-box-shadow:0px -3px 0px 0px black;box-shadow:0px -3px 0px 0px black;border-radius:100%;content:'';display:block;position:absolute;}\n\
		#drawTools-btn-icon-curve:before{margin:4px 0px 0px -1px;width:2px;height:9px;background:black;border-radius:2px;-webkit-transform:rotate(-30deg);-moz-transform:rotate(-30deg);-o-transform:rotate(-30deg);-ms-transform:rotate(-30deg);transform:rotate(-30deg);content:'';content:'';display:block;position:absolute;}\n\
		\n\
		#drawTools{position:relative;display:inline-block;vertical-align:middle;}\n\
		#drawTools>.drawTools-btn{position:relative;float:left;display:inline-block;}\n\
		\n\
		#drawTools>.drawTools-btn:not(:first-child):not(:last-child):not(.dropdown-toggle){border-radius:0}\n\
		#drawTools>.drawTools-btn:first-child{margin-left:0;}\n\
		#drawTools>.drawTools-btn:first-child:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius: 0;border-top-right-radius: 0;}\n\
		#drawTools>.drawTools-btn:last-child:not(:first-child),#drawTools>.dropdown-toggle:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0;}\n\
		\n\
		.drawTools-btn{height:34px;border-radius:2px;margin-top:5px;}\n\
		.drawTools-btn input{display:none;}\n\
		\n\
		.drawTools-btn-container{background-color:#fffb8d;border-bottom:1px solid #e5e17e;height:34px;padding:0px;margin:0px;font-size:14px;font-weight:normal;line-height:1.428571429;text-align:center;vertical-align:middle;cursor:pointer;border-radius:inherit;border-top:1px solid transparent;}\n\
		.drawTools-btn-container:focus	{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;outline-offset:-2px;}\n\
		.drawTools-btn-container:hover,.drawTools-btn:focus{background-color:#f6f166;border-bottom:1px solid #ddd85b;color:#333333;text-decoration:none;}\n\
		.drawTools-btn-container:active,.drawTools-btn input:focus + div,.drawTools-btn input:checked + div{background-color:#f6f166;border-bottom:1px solid #f6f166;-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,0.5);box-shadow:inset 0 3px 5px rgba(0,0,0,0.5);}\n\
		.drawTools-btn-container.disabled,.drawTools-btn-container[disabled],fieldset[disabled] .drawTools-btn-container{cursor:not-allowed;pointer-events:none;opacity:0.65;filter:alpha(opacity=65);-webkit-box-shadow:none;box-shadow:none;}\n\
		\n\
		#drawTools-btn-options .drawTools-btn-container{background:#252525;border-bottom:1px solid #171717;}\n\
		#drawTools-btn-options .drawTools-btn-container:focus{outline:thin dotted #fff;}\n\
		#drawTools-btn-options .drawTools-btn-container:hover,#drawTools-btn-options .drawTools-btn:focus{background-color:#2e2e2e;border-bottom:1px solid #222222;}\n\
		#drawTools-btn-options .drawTools-btn-container:active{background-color:#252525;border-bottom:1px solid #252525;}\n\
		\n\
		#drawTools-btn-exit .drawTools-btn-container{background:#a50000;border-bottom:1px solid #7c0000;}\n\
		#drawTools-btn-exit .drawTools-btn-container:focus{outline:thin dotted #fff;}\n\
		#drawTools-btn-exit .drawTools-btn-container:hover,#drawTools-btn-exit .drawTools-btn:focus{background-color:#b90c0c;border-bottom:1px solid #980909;}\n\
		#drawTools-btn-exit .drawTools-btn-container:active{background-color:#a50000;border-bottom:1px solid #a50000;}\n\
		\n\
		#drawTools-options{margin-top:"+optionsMarginTop+"px;background:#252525;border-bottom:1px solid #171717;width:420px;height:0px;position:absolute;border-radius:2px 2px 0px 0px;opacity:0;overflow:hidden;-webkit-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);}\n\
		#drawTools-options-content{position:absolute;top:8px;left:8px;right:8px;bottom:8px;}\n\
		\n\
		#drawTools-options-leftPanel{width:160px;height:100%;position:absolute;left:0px;}\n\
		#drawTools-options-leftPanel>.switch{display:block;margin-bottom:20px;}\n\
		\n\
		.switch{font:13px/20px 'Helvetica Neue',Helvetica,Arial,sans-serif;box-sizing:content-box;width:150px;height:26px;position:relative;display:inline-block;vertical-align:top;padding:3px;border-radius:2px;cursor:pointer;box-shadow:inset 0 -1px #525252,inset 0 1px 1px rgba(0,0,0,0.8);}\n\
		.switch-input{position:absolute;top:0;left:0;opacity:0;}\n\
		.switch-label{position:relative;display:block;height:inherit;font-size:12px;text-transform:uppercase;background:#7b0000;border-radius:inherit;box-shadow:inset 0 1px 2px rgba(0,0,0,0.12),inset 0 0 2px rgba(0,0,0,0.15);-webkit-transition:0.15s ease-out;-moz-transition:0.15s ease-out;-o-transition:0.15s ease-out;transition:0.15s ease-out;-webkit-transition-property:opacity background;-moz-transition-property:opacity background;-o-transition-property:opacity background;transition-property:opacity background;}\n\
		.switch-label:before,.switch-label:after{position:absolute;top:50%;margin-top:-.5em;line-height:1;-webkit-transition:inherit;-moz-transition:inherit;-o-transition:inherit;transition:inherit;}\n\
		.switch-label:before{content:attr(data-off);right:11px;color:white;text-shadow:0 1px rgba(0,0,0,0.2);}\n\
		.switch-label:after{content:attr(data-on);left:11px;color:white;text-shadow:0 1px rgba(0,0,0,0.2);opacity:0;}\n\
		.switch-input:checked ~ .switch-label {background:#117b00;box-shadow:inset 0 1px 2px rgba(0,0,0,0.15),inset 0 0 3px rgba(0,0,0,0.2);}\n\
		.switch-input:checked~.switch-label:before{opacity:0;}\n\
		.switch-input:checked~.switch-label:after{opacity: 1;}\n\
		.switch-handle{position:absolute;top:4px;left:4px;width:24px;height:24px;background:#c2c2c2;border-radius:2px;box-shadow:1px 1px 5px rgba(0,0,0,0.2);background-image:-webkit-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:-moz-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:-o-linear-gradient(top, #c2c2c2 40%, #a7a7a7);background-image:linear-gradient(to bottom, #c2c2c2 40%, #a7a7a7);-webkit-transition:left 0.15s ease-out;-moz-transition:left 0.15s ease-out;-o-transition:left 0.15s ease-out;transition:left 0.15s ease-out;}\n\
		.switch-input:checked~.switch-handle{left:128px;box-shadow:-1px 1px 5px rgba(0,0,0,0.2);}\n\
		.switch-green>.switch-input:checked~.switch-label{background:#4fb845;}\n\
		\n\
		#drawTools-options-palette{width:240px;height:100%;position:absolute;right:0px;}\n\
		#drawTools-options-palette label{width:40px;height:40px;float:left;overflow:hidden;display:inline-block;margin:0;padding=0;}\n\
		#drawTools-options-palette input{display:none;visibility:hidden;margin:0px;padding:0px;}\n\
		#drawTools-options-palette input:checked + div{border:2px solid #c2c2c2;}\n\
		#drawTools-options-palette div{width:40px;height:40px;border:2px solid #252525;margin=0;padding=0;line-height:2.428571429;}\n\
		#drawTools-options-palette div:focus{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;}\n\
		#drawTools-options-palette div:hover,#drawTools-options-palette div:focus,#drawTools-options-palette div:active{border:2px solid red;}\n\
		\n\
		.drawTools-buttonText,#drawTools-options-palette div{font-size:14px;font-weight:normal;text-align:center;vertical-align:middle;cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}\n\
		\n\
		";
	document.body.appendChild(DTSheet);
}
  /*-----------------------------------------------------------------------------*/
 /*------------------------------- Event Handlers ------------------------------*/
/*-----------------------------------------------------------------------------*/
cleanTools.eventHandlers["mouseDown"] = function(e) {
	if(0 && $('#drawTools-options').css('opacity') == 1){
		painting = !1;
		cleanTools.canvas.restore();
		return;
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.BRUSH)
		return;
	cleanTools.tools.toolInUse = true;
	cleanTools.canvas.updateLocation();
	
	// Translate mouse location to point relative to canvas
	cleanTools.mouseX = e.pageX-cleanTools.canvas.offset.left;
	cleanTools.mouseY = e.pageY-cleanTools.canvas.offset.top;
	
	if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.FILL) {
		//var stopwatch = new StopWatch();
		//stopwatch.start();
		painting = !1;
		cleanTools.tools.paintMethods.floodFill(cleanTools.context,cleanTools.mouseX,cleanTools.mouseY);
		//stopwatch.stop();
		//stopwatch.printElapsed();
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.LINE) {
		painting = !1;
		cleanTools.tools.points.push(cleanTools.mouseX,cleanTools.mouseY);
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.LINECHAIN) {
		painting = !1;
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.CURVE) {
		painting = !1;
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.RECT) {
		painting = !1;
		cleanTools.tools.points.push(cleanTools.mouseX,cleanTools.mouseY);
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.ELLIPSE) {
		painting = !1;
		cleanTools.tools.points.push(cleanTools.mouseX,cleanTools.mouseY);
	} 
}

cleanTools.eventHandlers["mouseMove"] = function(e) {
/*	if(cleanTools.canvas.isWithinBounds(e.pageX-cleanTools.canvas.offset.left,e.pageY-cleanTools.canvas.offset.top)) {
		var p = cleanTools.context.getImageData(e.pageX-cleanTools.canvas.offset.left, e.pageY-cleanTools.canvas.offset.top, 1, 1).data;
		outputDebug("[r:" +p[0] + ", g:" + p[1] + ", b:" + p[2] + ", a:" + p[3] + "]");
	} else {
		outputDebug("Out of bounds.")
	}
	*/
	if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.BRUSH)
		return;	// default behaviors
	else if(!cleanTools.tools.toolInUse)
		return;	// If no tool is in use, ignore event
		
	// Translate mouse location to point relative to canvas
	cleanTools.mouseX = e.pageX-cleanTools.canvas.offset.left;
	cleanTools.mouseY = e.pageY-cleanTools.canvas.offset.top;
	
	if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.FILL) {
		// Do nothing
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.LINE) {
		cleanTools.canvas.restore();
		cleanTools.tools.paintMethods.drawLine(cleanTools.context,cleanTools.tools.points[0],cleanTools.tools.points[1],cleanTools.mouseX,cleanTools.mouseY);
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.LINECHAIN) {
		if(cleanTools.tools.points.length > 0) {
			var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
			cleanTools.canvas.restore();
			cleanTools.tools.paintMethods.drawLineChain(cleanTools.context,cleanTools.tools.points.concat(cleanTools.mouseX,cleanTools.mouseY),true,cleanTools.options.lineToolsShouldClose,fillColor);
		}
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.CURVE) {
		if(cleanTools.tools.points.length > 0) {
			var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
			cleanTools.canvas.restore();
			cleanTools.tools.paintMethods.drawSpline(cleanTools.context,cleanTools.tools.points.concat(cleanTools.mouseX,cleanTools.mouseY),0.5,cleanTools.options.lineToolsShouldClose,fillColor,true);
		}
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.RECT) {
		var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
		var endPointX = cleanTools.mouseX;
		var endPointY = cleanTools.mouseY;
		if(cleanTools.shiftDown) {
			var width = cleanTools.mouseX - cleanTools.tools.points[0];
			var height = cleanTools.mouseY - cleanTools.tools.points[1];
			if(width > 0) {
				if(height > 0) { // Quadrant I (+width, +height)
					endPointX = cleanTools.tools.points[0] + Math.min(endPointX,endPointY); 
					endPointY = cleanTools.tools.points[1] + Math.min(endPointX,endPointY);
				} else { // Quadrant IV (+width, -height)
					if(Math.abs(height) > width) {
						endPointX = cleanTools.tools.points[0] + width; 
						endPointY = cleanTools.tools.points[1] - width;
					} else {
						endPointX = cleanTools.tools.points[0] - height; 
						endPointY = cleanTools.tools.points[1] + height;
					}
				}
			} else {
				if(height > 0) { // Quadrant II (-width, +height)
					if(Math.abs(width) > height) {
						endPointX = cleanTools.tools.points[0] - height; 
						endPointY = cleanTools.tools.points[1] + height;
					} else {
						endPointX = cleanTools.tools.points[0] + width; 
						endPointY = cleanTools.tools.points[1] - width;
					}
				} else { // Quadrant III (-width, -height)
					endPointX = cleanTools.tools.points[0] + Math.max(endPointX,endPointY); 
					endPointY = cleanTools.tools.points[1] + Math.max(endPointX,endPointY);
				}
			}
		}
		cleanTools.canvas.restore();
		cleanTools.tools.paintMethods.drawRect(cleanTools.context,cleanTools.tools.points.concat(endPointX,endPointY),fillColor);
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.ELLIPSE) {
		var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
		cleanTools.canvas.restore();
		cleanTools.tools.paintMethods.drawEllipse(cleanTools.context,cleanTools.tools.points.concat(cleanTools.mouseX,cleanTools.mouseY),fillColor);
	}
}

cleanTools.eventHandlers["mouseUp"] = function(e) {
	if(0 && $('#drawTools-options').css('opacity') == 1){
		if(!cleanTools.options.isWithinBounds(e.pageX, e.pageY))
			cleanTools.options.toggleMenu();
		return;
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.BRUSH)
		return;
	else if(!cleanTools.tools.toolInUse)	// If no tool is in use, ignore event
		return;
		
	// Translate mouse location to point relative to canvas
	cleanTools.mouseX = e.pageX-cleanTools.canvas.offset.left;
	cleanTools.mouseY = e.pageY-cleanTools.canvas.offset.top;
	
	if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.FILL) {
		cleanTools.tools.reset(true);
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.LINE) {
		cleanTools.canvas.restore();
		cleanTools.tools.paintMethods.drawLine(cleanTools.context,cleanTools.tools.points[0],cleanTools.tools.points[1], cleanTools.mouseX, cleanTools.mouseY);
		cleanTools.tools.reset(true);
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.LINECHAIN) {
		if(cleanTools.canvas.isWithinDrawingBounds(cleanTools.mouseX,cleanTools.mouseY)){
			cleanTools.tools.points.push(cleanTools.mouseX,cleanTools.mouseY);
			if(e.which == 3) {	// If right mouse click, finish the chain
				var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
				cleanTools.canvas.restore();
				cleanTools.tools.paintMethods.drawLineChain(cleanTools.context,cleanTools.tools.points,false,cleanTools.options.lineToolsShouldClose,fillColor);
				cleanTools.tools.reset(true);
			} else {
				return;
			}
		} else {
			cleanTools.canvas.restore();
			cleanTools.tools.reset();
			return;
		}
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.CURVE) {
		if(cleanTools.canvas.isWithinDrawingBounds(cleanTools.mouseX,cleanTools.mouseY)){
			cleanTools.tools.points.push(cleanTools.mouseX,cleanTools.mouseY);
			if(e.which == 3) {	// If right mouse click, finish the curve
				var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
				cleanTools.canvas.restore();
				cleanTools.tools.paintMethods.drawSpline(cleanTools.context,cleanTools.tools.points,0.5,cleanTools.options.lineToolsShouldClose,fillColor,false);
				cleanTools.tools.reset(true);
			} else {
				return;
			}
		} else {	// If user clicks out of acceptable boundaries, cancel all tool progress
			cleanTools.canvas.restore();
			cleanTools.tools.reset();
			return;
		}
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.RECT) {
		var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
		cleanTools.canvas.restore();
		cleanTools.tools.points.push(cleanTools.mouseX,cleanTools.mouseY);
		cleanTools.tools.paintMethods.drawRect(cleanTools.context,cleanTools.tools.points,fillColor);
		cleanTools.tools.reset(true);
	} else if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.ELLIPSE) {
		var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
		cleanTools.canvas.restore();
		cleanTools.tools.points.push(cleanTools.mouseX,cleanTools.mouseY);
		cleanTools.tools.paintMethods.drawEllipse(cleanTools.context,cleanTools.tools.points,fillColor);
		cleanTools.tools.reset(true);
	}
}

cleanTools.eventHandlers["keyDown"] = function(e) {
	if(e.keyCode == 16) {
		cleanTools.shiftDown = 1;
	}
	
	if(e.keyCode == 39) {
		alert('Right was pressed');
	} if(e.keyCode == "Q".charCodeAt(0)) {
		if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.LINECHAIN || cleanTools.tools.currentToolType === cleanTools.tools.toolType.CURVE) {
			if(cleanTools.tools.points.length) {
				cleanTools.tools.points.length -= 2;
				if(cleanTools.tools.points.length == 0) {
					cleanTools.tools.toolInUse = false;
				}
				var fillColor = (cleanTools.options.useStrokeAsFill) ? cleanTools.context.strokeStyle : cleanTools.options.fillColor;
				cleanTools.canvas.restore();
				if(cleanTools.tools.currentToolType === cleanTools.tools.toolType.LINECHAIN)
					cleanTools.tools.paintMethods.drawLineChain(cleanTools.context,cleanTools.tools.points.concat(cleanTools.mouseX,cleanTools.mouseY),true,cleanTools.options.lineToolsShouldClose,fillColor);
				else
					cleanTools.tools.paintMethods.drawSpline(cleanTools.context,cleanTools.tools.points.concat(cleanTools.mouseX,cleanTools.mouseY),0.5,cleanTools.options.lineToolsShouldClose,fillColor,true);
			}
		}
	} else {
		//alert('Keycode for that key is: ' + e.keyCode);
	}
}

cleanTools.eventHandlers["keyUp"] = function(e) {
	if(e.keyCode == 16) {
		cleanTools.shiftDown = 0;
	}
}

  /*-----------------------------------------------------------------------------*/
 /*---------------------- Elements Creation/Manipulation -----------------------*/
/*-----------------------------------------------------------------------------*/
//Creates Tool Buttons (no innerHTML)
cleanTools.html.init['createToolButton'] = function(type, name)
{
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = cleanTools.id + '-btn-' + name;
	button.className = cleanTools.id + '-btn';
	button.innerHTML = 
		'<input id="' + cleanTools.id + '-btn-radio-' + name + '" name="' + cleanTools.id + '-btn-radio" type="radio">' +
		'<div class="' + cleanTools.id + '-btn-container">' +
			'<div id="' + cleanTools.id + '-btn-icon-' + name + '"></div>' +
		'</div>';
	document.getElementById(cleanTools.id).appendChild(button);
	
	button.onclick = function(){cleanTools.html.buttonHandlers.setToolType(type);};
	return button;
}
//Creates Tool Buttons (with a label)
cleanTools.html.init['createToolButtonWithLabel'] = function(type, name, label)
{
	var button = cleanTools.html.init.createToolButton(type, name);
	button.getElementsByTagName('div')[0].innerHTML = label; // Place text inside it
	return button;
}
//Creates Tool Buttons (no innerHTML)
cleanTools.html.init['createUtilityButton'] = function(name)
{
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = cleanTools.id + '-btn-' + name;
	button.className = cleanTools.id + '-btn';
	button.innerHTML = 
		'<div class="' + cleanTools.id + '-btn-container">' +
			'<div id="' + cleanTools.id + '-btn-icon-' + name + '"></div>' +
		'</div>';
	document.getElementById(cleanTools.id).appendChild(button);
	return button;
}

cleanTools.html.init['createOptionsMenu'] = function(drawToolsDiv)
{
	//Create DIV in which Options will be placed in
	var optionsDiv = document.createElement('div');
	optionsDiv.id = cleanTools.id + '-options';
	optionsDiv.innerHTML = 
		'<div id="drawTools-options-content">' +
			'<div id="drawTools-options-leftPanel"></div>' +
			'<div id="drawTools-options-palette"></div>' +
		'</div>';
	drawToolsDiv.appendChild(optionsDiv);
	
	//----- BEGIN ----- LeftPanel --------------------------------------------------
	var leftPanelHtml = "";
	leftPanelHtml += 
		'<label onclick=cleanTools.html.buttonHandlers.setLineToolsOpen(); class="switch">\
			<input type="checkbox" class="switch-input" id="drawTools-options-checkbox-lineToolsOpen">\
			<span class="switch-label" data-on="Line Tools Closed" data-off="Line Tools Open"></span>\
			<span class="switch-handle"></span>\
		</label>';
	document.getElementById('drawTools-options-leftPanel').innerHTML = leftPanelHtml;
	//----- BEGIN ----- ColorPicker --------------------------------------------------
	var colorElements = document.getElementsByClassName('colorPicker');
	var optionsPaletteHtml = "";
	
	optionsPaletteHtml += 
		'<label onclick=cleanTools.html.buttonHandlers.setOptionsColor(""); style="width:120px;">' +
			'<input type="radio" name="drawTools-options-palette-radio" checked>' +
			'<div style="width:120px;background:#333333;color:#c2c2c2;">No Fill</div>' +
		'</label>';
	optionsPaletteHtml += 
		'<label onclick=cleanTools.html.buttonHandlers.setOptionsColor("",1); style="width:120px;">' +
			'<input type="radio" name="drawTools-options-palette-radio">' +
			'<div style="width:120px;background:#333333;color:#c2c2c2;">Brush Color</div>' +
		'</label>';
	
	for(var i=0;i<colorElements.length;i++) {
		var color = colorElements[i].getAttribute("data-color");
		cleanTools.dcPalette.push(color);
		optionsPaletteHtml += 
			'<label onclick=cleanTools.html.buttonHandlers.setOptionsColor("' + color + '");>' + //
				'<input type="radio" name="drawTools-options-palette-radio">' +
				'<div style="background:' + color + ';"></div>' +
			'</label>';
	}
	document.getElementById('drawTools-options-palette').innerHTML = optionsPaletteHtml;
}

// Destroys all elements, styling and javascript
cleanTools.html['DTDestroy'] = function() 
{
	// 1. Destroy HTML
	document.getElementById(cleanTools.id).remove();
	// 2. Destroy CSS
	document.getElementById(cleanTools.id + 'StyleSheet').remove();
	// 3. Remove listeners (async)
	$(document).off('mousedown');
	$(document).off('mousemove');
	$(document).off('mouseup');
	// 4. Set the state variable to reflect DTTools uninstallation
	window.DTToolsIsCurrentlyInstalled = false;
	// 5. Destroy JavaScript
	document.getElementById('DTScript').remove();
}
cleanTools.html.init['setupCssAndHtml'] = function()
{	
	cleanTools.canvas.updateLocation();
	/*---- 1. Create Draw Tools Container - DIV in which DrawTools will be placed in ----*/
	var drawToolsDiv = document.createElement('div');
	drawToolsDiv.id = cleanTools.id;
	cleanTools.dcToolbar.appendChild(drawToolsDiv);
	
	/*---- 2. Setup necessary CSS for DrawTools ----*/
	cleanTools.html.init.setupCSS();
	
	/*---- 3. Make Necessary Modifications to Existing Elements ----*/
	document.getElementById(cleanTools.dcBrushes[0].id).parentNode.onclick = function(){cleanTools.html.buttonHandlers.brushClick(cleanTools.dcBrushes[0].size);};
	document.getElementById(cleanTools.dcBrushes[1].id).parentNode.onclick = function(){cleanTools.html.buttonHandlers.brushClick(cleanTools.dcBrushes[1].size);};
	document.getElementById(cleanTools.dcBrushes[2].id).parentNode.onclick = function(){cleanTools.html.buttonHandlers.brushClick(cleanTools.dcBrushes[2].size);};
	document.getElementById(cleanTools.dcBrushes[3].id).parentNode.onclick = function(){cleanTools.html.buttonHandlers.brushClick(cleanTools.dcBrushes[3].size);};
	/*	// TODO:Figure this out. This doesn't work for some reason, so i hardcoded it.
	for(var j=0;j<cleanTools.dcBrushes.length;j++)
		document.getElementById(cleanTools.dcBrushes[j].id).parentNode.onclick = function(){selectBrushAUX(cleanTools.dcBrushes[j].size);};
	*/
	
	/*---- 4. Create Draw Tools Elements and Interface ----*/
	// Create Tool Buttons
	cleanTools.html.init.createToolButton(cleanTools.tools.toolType.FILL,"fill");
	cleanTools.html.init.createToolButton(cleanTools.tools.toolType.LINE,"line");
	cleanTools.html.init.createToolButton(cleanTools.tools.toolType.LINECHAIN,"linechain");
	cleanTools.html.init.createToolButton(cleanTools.tools.toolType.CURVE,"curve");
	cleanTools.html.init.createToolButton(cleanTools.tools.toolType.RECT,"rect");
	cleanTools.html.init.createToolButton(cleanTools.tools.toolType.ELLIPSE,"ellipse");
	
	debugLabel = cleanTools.html.init.createToolButtonWithLabel(cleanTools.tools.toolType.UTIL,"label", '0');
	
	var optionsButton = cleanTools.html.init.createUtilityButton("options");
	optionsButton.onclick = function(){cleanTools.options.toggleMenu();};
	
	cleanTools.html.init.createOptionsMenu(drawToolsDiv);
	
	// Exitbutton to remove DrawTools
	var exitButton = cleanTools.html.init.createUtilityButton("exit");
	exitButton.onclick = function(){cleanTools.html.DTDestroy();};
}

  /*-----------------------------------------------------------------------------*/
 /*----------------------------------- Main ------------------------------------*/
/*-----------------------------------------------------------------------------*/
// Setup Some Global Variables

cleanTools.context.putImageData = CanvasRenderingContext2D.prototype.putImageData;

// Setup Debug Stuff
var debugLabel; //Go to createDrawToolsElements to find assignment
function outputDebug(outputString){
	debugLabel.getElementsByTagName('div')[0].innerHTML = outputString;
}
cleanTools.html.init.setupCssAndHtml();

// Setup Mousedown Listener
cleanTools.Canvas.off('mousedown');
cleanTools.Canvas.on('mousedown', cleanTools.eventHandlers.mouseDown);
// Setup Mousemove Listener
$(document).off('mousemove');
$(document).on('mousemove', cleanTools.eventHandlers.mouseMove);
// Setup Mouseup Listener
$(document).off('mouseup');
$(document).on('mouseup', cleanTools.eventHandlers.mouseUp);
// Setup keyDown Listener
$(document).keydown(cleanTools.eventHandlers.keyDown);
// Setup keyUp Listener
$(document).keyup(cleanTools.eventHandlers.keyUp);
