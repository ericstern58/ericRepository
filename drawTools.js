var DTOptionsClass = function (performance) {
    this.mouseOnEventHappened = false;
    
    this.shapeFillEnabled = false;
    this.shapeFillColor;
};
DTOptionsClass.prototype.getOffset = function () {
    return  $("#drawTools-options").offset();
};
DTOptionsClass.prototype.toggleMenu = function () {
	var h = 150;	// Height of the options div
	var opacity = $('#drawTools-options').css('opacity');
	
	if(opacity == 0) {
		$("#drawTools-options").stop(true, true).animate({
			height: (h + "px"),
			marginTop: ("-=" + h + "px"),
			opacity: "1"
		},300, "swing");
	} else if(opacity == 1) {
		$("#drawTools-options").stop(true, true).animate({
			height: "0px",
			marginTop: ("+=" + h + "px"),
			opacity: "0"
		},300, "swing");
	}
};
DTOptionsClass.prototype.isWithinBounds = function (x, y) {
    var x2 = x - $("#drawTools-options").offset().top;
	var y2 = y - $("#drawTools-options").offset().left;
	var width = $('#drawTools-options').width();
	var height = $('#drawTools-options').height();
	//outputDebug("[x:" + x2 + ", y:" + y2 + "]   [width:" + width + ", height:" + height + "]");
	return (x2>=0 && y2>=0 && x2<width && y2<height);
};

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
    if (this.running) {
        this.stopTime = this.currentTime();
    }

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





// Setup Constants
var DRAW_TOOLS_ID = 'drawTools';
var DRAWCEPTION_TOOLBAR = document.getElementById('redo-button').parentNode.parentNode;
var DTBrushes = [{id: 'brush-2', size: 2},{id: 'brush-5', size: 5},{id: 'brush-12', size: 12},
	{id: 'brush-35', size: 35}];

// Setup Some Global Variables
window.DTToolsIsCurrentlyInstalled = true;	// State variable that helps prevent double installation of script
var DA = drawApp;
var DACanvas = drawApp.canvas;
var context = drawApp.context;
context.putImageData = CanvasRenderingContext2D.prototype.putImageData;


  /*-----------------------------------------------------------------------------*/
 /*--------------------- Custom Objects/Structures/enums -----------------------*/
/*-----------------------------------------------------------------------------*/
// Point Object
function Point(x, y) {
	this.x = x;
	this.y = y;
}
// Color Object
function RGBColor(r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = (a) ? a : 255;
}
RGBColor.prototype.equals = function(color) {
	return (this.r===color.r && this.g===color.g && this.b===color.b && this.a===color.a);
};
RGBColor.prototype.setOpacity = function(alpha) {
	
};
// Tool type enum
var toolType={BRUSH:0,FILL:1,LINE:2,LINECHAIN:3,CURVE:4,RECT:5,ELLIPSE:6,POLY:7,UTIL:99};

  /*-----------------------------------------------------------------------------*/
 /*----------------------------------- Main ------------------------------------*/
/*-----------------------------------------------------------------------------*/

// Setup Some State Variables
var options = new DTOptionsClass();
var currentToolType = toolType.BRUSH;
var toolInUse = false;

var canvasOffset;
var canvasWidth;
var canvasHeight;
DTUpdateCanvasStateVariables();

// Setup Debug Stuff
var debugLabel; //Go to createDrawToolsElements to find assignment
function outputDebug(outputString){
	debugLabel.getElementsByTagName('div')[0].innerHTML = outputString;
}
/*
window.onerror = function (msg, url, line) {
    alert("Error on line " + line + ":\n" + msg);
    return true; // return true to prevent browser from displaying error
}*/

// Setup tool state/event variables
var DTPoints = new Array();	// Will contain user input point sets for shapes/lines/etc

createDrawToolsContainer();	// Create Draw Tools Container
setupCSS();					// Setup necessary CSS for DrawTools
modifyExistingElements();	// Make Necessary Modifications to Existing Elements
createDrawToolsElements();	// Create Draw Tools Elements and Interface

/*---------------------- Setup Listeners ----------------------*/

// Setup Mousedown Listener
DACanvas.off('mousedown');
DACanvas.on('mousedown', function(e){
	if(0 && $('#drawTools-options').css('opacity') == 1){
		painting = !1;
		restoreCanvas();
		return;
	} else if(currentToolType === toolType.BRUSH)
		return;
	toolInUse = true;
	DTUpdateCanvasStateVariables();
	
	// Translate mouse location to point relative to canvas
	var mouseX = e.pageX-canvasOffset.left;
	var mouseY = e.pageY-canvasOffset.top;
	
	if(currentToolType === toolType.FILL) {
		var stopwatch = new StopWatch();
		stopwatch.start();
		painting = !1;
		try{
			floodFill(e);
		}catch(err){alert(err);}
		stopwatch.stop();
		stopwatch.printElapsed();
	} else if(currentToolType === toolType.LINE) {
		painting = !1;
		DTPoints[0] = {x: mouseX, y: mouseY};
	} else if(currentToolType === toolType.LINECHAIN) {
		painting = !1;
	} else if(currentToolType === toolType.CURVE) {
		painting = !1;
	} else if(currentToolType === toolType.RECT) {
		painting = !1;
		DTPoints[0] = {x: mouseX, y: mouseY};
	} else if(currentToolType === toolType.ELLIPSE) {
		painting = !1;
		DTPoints[0] = {x: mouseX, y: mouseY};
	} else if(currentToolType === toolType.POLY) {
		painting = !1;
	}
});
// Setup Mousemove Listener
$(document).off('mousemove');
$(document).on('mousemove', function(e){
 	//outputDebug( (e.pageX-canvasOffset.left) + ', ' + (e.pageY-canvasOffset.top));
	if(currentToolType === toolType.BRUSH)
		return;	// default behaviors
	else if(!toolInUse)
		return;	// If no tool is in use, ignore event
		
	// Translate mouse location to point relative to canvas
	var mouseX = e.pageX-canvasOffset.left;
	var mouseY = e.pageY-canvasOffset.top;
	
	if(currentToolType === toolType.FILL) {
		// Do nothing
	} else if(currentToolType === toolType.LINE) {
		restoreCanvas();
		drawLine(DTPoints[0].x,DTPoints[0].y,mouseX,mouseY);
	} else if(currentToolType === toolType.LINECHAIN) {
		if(DTPoints.length > 0) {
			restoreCanvas();
			DTPoints[DTPoints.length] = {x: mouseX, y: mouseY};
			drawLineChain(DTPoints);
			DTPoints.length = DTPoints.length - 1;
		}
	} else if(currentToolType === toolType.CURVE) {
		if(DTPoints.length > 0) {
			restoreCanvas();
			DTPoints[DTPoints.length] = {x: mouseX, y: mouseY};
			try{
			drawSpline(context,pointsToArray(DTPoints),0.5,true,true);
			}catch(err){alert(err);}
			DTPoints.length = DTPoints.length - 1;
		}
	} else if(currentToolType === toolType.RECT) {
		restoreCanvas();
		drawRect(DTPoints[0].x,DTPoints[0].y,mouseX,mouseY);
	} else if(currentToolType === toolType.ELLIPSE) {
		restoreCanvas();
		drawEllipse(DTPoints[0].x,DTPoints[0].y,mouseX,mouseY);
	} else if(currentToolType === toolType.POLY) {
		if(DTPoints.length > 0) {
			restoreCanvas();
			if(DTPoints.length > 1)
				drawLineChain(DTPoints);
			drawLine(DTPoints[DTPoints.length-1].x,DTPoints[DTPoints.length-1].y,mouseX,mouseY);
		}
	}
});
// Setup Mouseup Listener
$(document).off('mouseup');
$(document).on('mouseup', function(e){
	if(0 && $('#drawTools-options').css('opacity') == 1){
		if(!options.isWithinBounds(e.pageX, e.pageY))
			options.toggleMenu();
		return;
	} else if(currentToolType === toolType.BRUSH)
		return;
	else if(!toolInUse)	// If no tool is in use, ignore event
		return;
		
	// Translate mouse location to point relative to canvas
	var mouseX = e.pageX-canvasOffset.left;
	var mouseY = e.pageY-canvasOffset.top;
	
	if(currentToolType === toolType.FILL) {
		// Do nothing
	} else if(currentToolType === toolType.LINE) {
		restoreCanvas();
		drawLine(DTPoints[0].x,DTPoints[0].y, mouseX, mouseY);
	} else if(currentToolType === toolType.LINECHAIN) {
		if(isWithinPolygonToolBounds(mouseX,mouseY)){
			DTPoints[DTPoints.length] = {x: mouseX, y: mouseY};
			if(e.which == 3) {	// If right mouse click, finish the polygon
				restoreCanvas();
				drawLineChain(DTPoints);
			} else {
				return;
			}
		} else {
			restoreCanvas();
			DTPoints.length = 0;
			toolInUse = false;
			return;
		}
	} else if(currentToolType === toolType.CURVE) {
		if(isWithinPolygonToolBounds(mouseX,mouseY)){
			DTPoints[DTPoints.length] = {x: mouseX, y: mouseY};
			if(e.which == 3) {	// If right mouse click, finish the curve
				restoreCanvas();
				drawSpline(context,pointsToArray(DTPoints),0.5,true);
			} else {
				return;
			}
		} else {	// If user clicks out of acceptable boundaries, cancel all tool progress
			restoreCanvas();
			DTPoints.length = 0;
			toolInUse = false;
			return;
		}
	} else if(currentToolType === toolType.RECT) {
		restoreCanvas();
		drawRect(DTPoints[0].x,DTPoints[0].y,mouseX,mouseY);
	} else if(currentToolType === toolType.ELLIPSE) {
		restoreCanvas();
		drawEllipse(DTPoints[0].x,DTPoints[0].y,mouseX,mouseY);
	} else if(currentToolType === toolType.POLY) {
		if(isWithinPolygonToolBounds(mouseX,mouseY)){
			DTPoints[DTPoints.length] = {x: mouseX, y: mouseY};
			if(e.which == 3) {	// If right mouse click, finish the polygon
				restoreCanvas();
				drawLineChain(DTPoints);
			} else {
				return;
			}
		} else {
			restoreCanvas();
			DTPoints.length = 0;
			toolInUse = false;
			return;
		}
	}
	DTPoints.length = 0;
	toolInUse = false;
	save();
	
});

  /*-----------------------------------------------------------------------------*/
 /*------------------------------ Button Methods -------------------------------*/
/*-----------------------------------------------------------------------------*/

function drawLine(startX,startY,finishX,finishY)
{
	context.beginPath();
	context.moveTo( startX, startY );
	context.lineTo( finishX, finishY);
	context.stroke();
}
function drawRect(startX,startY,finishX,finishY)
{
	DTPoints[0] = {x: startX, y: startY};
	DTPoints[1] = {x: finishX, y: startY};
	DTPoints[2] = {x: finishX, y: finishY};
	DTPoints[3] = {x: startX, y: finishY};
	DTPoints[4] = {x: startX, y: startY};
	drawLineChain(DTPoints);
}
function drawLineChain(points)
{
	context.beginPath();
	for(var i=1;i<points.length;i++) {
		context.moveTo( points[i-1].x, points[i-1].y );
		context.lineTo( points[i].x, points[i].y );
	}
	context.stroke(); 
}
function drawEllipse(startX,startY,finishX,finishY){
	var x = startX,
	y = startY,
	w = finishX - startX,
	h = finishY - startY,
	kappa = .5522848,
	ox = ( w / 2 ) * kappa,// control point offset horizontal
	oy = ( h / 2 ) * kappa,// control point offset vertical
	xe = x + w,            // x-end
	ye = y + h,            // y-end
	xm = x + w / 2,        // x-middle
	ym = y + h / 2;        // y-middle
	context.beginPath();
	context.moveTo( x, ym );
	context.bezierCurveTo( x, ym - oy, xm - ox, y, xm, y );
	context.bezierCurveTo( xm + ox, y, xe, ym - oy, xe, ym );
	context.bezierCurveTo( xe, ym + oy, xm + ox, ye, xm, ye );
	context.bezierCurveTo( xm - ox, ye, x, ym + oy, x, ym );
	context.closePath();
	context.stroke();
}

function floodFill(e){
	// This fix avoids issues with brush placing dot over flood fill seed area
	restoreCanvas();
	
	var w = canvasWidth;
	var h = canvasHeight;
	var p = context.getImageData(0,0,w,h);
	var d = p.data;
	var targetColor = getColorFromCoords(e.offsetX,e.offsetY);
	var c = parseInt(context.strokeStyle.substr(1,6),16);
	var fillColor = new RGBColor((c>>16)&255,(c>>8)&255,c&255);
	
	// Note: target color must be different to execute function f
	// If something is already colored the fill color, nothing needs to be done
	if(!targetColor.equals(fillColor))
		f(e.offsetX,e.offsetY);

	context.putImageData(p,0,0);
	
	function f(xinitial,yinitial){
		var queue = [new Point(xinitial,yinitial)];
		var edgeQueue = [];
		var x = 0;
		var y = 0;
		var point;
		while(queue.length>0) {
			point=queue.shift();
			x=point.x;
			y=point.y;
			if( isWithinCanvasBounds(point) && targetColor.equals(getColorFromPoint(point)) ) {
				colorPixel(point,fillColor);
				queue.push(new Point(x-1,y));
				queue.push(new Point(x+1,y));
				queue.push(new Point(x,y-1));
				queue.push(new Point(x,y+1));
			} else if(isWithinCanvasBounds(point) && !(fillColor.equals(getColorFromPoint(point)))){
				// If inside this block, current pixel is an edge pixel
				edgeQueue.push(point);
			}
		}
		// This loop colors edge pixels and softens them with anti-aliasing
		while(edgeQueue.length>0) {
			point=edgeQueue.shift();
			x=point.x;
			y=point.y;

			colorPixel(point,fillColor);
			
			var point2 = new Point(x-1,y);
			if(isWithinCanvasBounds(point2))
				colorPixelBlend(point2,fillColor,getColorFromCoords(x-1,y));
			point2 = new Point(x+1,y);
			if(isWithinCanvasBounds(point2))
				colorPixelBlend(point2,fillColor,getColorFromCoords(x+1,y));
			point2 = new Point(x,y-1);
			if(isWithinCanvasBounds(point2))
				colorPixelBlend(point2,fillColor,getColorFromCoords(x,y-1));
			point2 = new Point(x,y+1);
			if(isWithinCanvasBounds(point2))
				colorPixelBlend(point2,fillColor,getColorFromCoords(x,y+1));
		}
	}
	function isWithinCanvasBounds(point){
		return (point.x>=0 && point.y>=0 && point.x<canvasWidth && point.y<canvasHeight);
	}
	/*---------------------- Color Methods ----------------------*/
	//Colors a pixel with a given color
	function colorPixel(point,color) {
		var i = (point.x + point.y * w) * 4;
		d[i]=color.r;
		d[i+1]=color.g;
		d[i+2]=color.b;
		d[i+3]=255;
	}
	// [Experimental] Colors a pixel with a blend of 2 colors (helpful for assimilating anti-aliasing)
	function colorPixelBlend(point,color1,color2){
		var r=Math.ceil((color1.r+color2.r)/2);
		var g=Math.ceil((color1.g+color2.g)/2);
		var b=Math.ceil((color1.b+color2.b)/2);
		colorPixel(point,new RGBColor(r,g,b));
	}
	function getColorFromPoint(point){
		return getColorFromCoords(point.x,point.y);
	}
	function getColorFromCoords(x,y){
		var i = (x + y * w) * 4;
		return new RGBColor(d[i],d[i+1],d[i+2]);
	}
}

  /*-----------------------------------------------------------------------------*/
 /*--------------------------- Auxiliary Functions -----------------------------*/
/*-----------------------------------------------------------------------------*/
function DTUpdateCanvasStateVariables() {
	canvasOffset = $('#drawingCanvas').offset();    // Update canvas offset variable
	canvasWidth = DACanvas.width();           // Update canvas width variable
	canvasHeight = DACanvas.height();         // Update canvas width variable
}

function restoreCanvas() {
	context.constructor.prototype.putImageData.call(context, restorePoints[restorePosition], 0, 0);
}

function isWithinPolygonToolBounds(x, y){
	return (x>=(-12) && y>=(-12) && x<(canvasWidth+12) && y<(canvasHeight+12));
}
  /*-----------------------------------------------------------------------------*/
 /*----------------------------- CSS Style Sheets ------------------------------*/
/*-----------------------------------------------------------------------------*/

function setupCSS()
{
	// Calculate variables used in css
	var optionsMarginTop = canvasOffset.top + canvasHeight - $("#drawTools").offset().top;
	
	var DTSheet = document.createElement('style');
	DTSheet.id = 'drawToolsStyleSheet'; // Give id so destructor can find it if needed
	DTSheet.innerHTML = "\n\
		/*These drawTools-btn-Icon are css only icons*/\n\
		#drawTools-btn-icon-fill{margin:12px 5px 0px 21px;width:12px;height:12px;background:black;border-bottom-right-radius:2px;border-bottom-left-radius:2px;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-ms-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}\n\
		#drawTools-btn-icon-fill:before{border-bottom:5px solid black;border-left:8px solid transparent;border-right:8px solid transparent;display:block;position:absolute;top:-6px;left:-6px;content:'';}\n\
		#drawTools-btn-icon-line{margin:8px 16px 0px 17px;width:5px;height:15px;background:black;-webkit-transform:skew(-50deg);-moz-transform:skew(-50deg);-o-transform:skew(-50deg);transform:skew(-50deg);}\n\
		#drawTools-btn-icon-poly{margin:16px 9px 0px 9px;width:20px;border-width:8px 4px 0;border-style:solid;border-color:black transparent;}\n\
		#drawTools-btn-icon-poly:before{margin:-17px 0px 0px -4px;content:'';display:block;border-width:0 10px 9px;border-style:solid;border-color:transparent transparent black;}\n\
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
		#drawTools-btn-exit .drawTools-btn-container:hover,#drawTools-btn-options .drawTools-btn:focus{background-color:#b90c0c;border-bottom:1px solid #980909;}\n\
		#drawTools-btn-exit .drawTools-btn-container:active{background-color:#a50000;border-bottom:1px solid #a50000;}\n\
		\n\
		#drawTools-options{margin-top:"+optionsMarginTop+"px;background:#252525;border-bottom:1px solid #171717;width:300px;height:0px;position:absolute;border-radius:2px 2px 0px 0px;opacity:0;overflow:hidden;-webkit-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);}\n\
		\n\
		";
	document.body.appendChild(DTSheet);
}

  /*-----------------------------------------------------------------------------*/
 /*---------------------- Elements Creation/Manipulation -----------------------*/
/*-----------------------------------------------------------------------------*/
function modifyExistingElements() 
{
	/*	// TODO:Figure this out. This doesn't work for some reason, so i hardcoded it.
	for(var j=0;j<DTBrushes.length;j++)
		document.getElementById(DTBrushes[j].id).parentNode.onclick = function(){selectBrushAUX(DTBrushes[j].size);};
	*/
	document.getElementById(DTBrushes[0].id).parentNode.onclick = function(){selectBrushAUX(DTBrushes[0].size);};
	document.getElementById(DTBrushes[1].id).parentNode.onclick = function(){selectBrushAUX(DTBrushes[1].size);};
	document.getElementById(DTBrushes[2].id).parentNode.onclick = function(){selectBrushAUX(DTBrushes[2].size);};
	document.getElementById(DTBrushes[3].id).parentNode.onclick = function(){selectBrushAUX(DTBrushes[3].size);};
	
	function selectBrushAUX(brushSize) {
		drawApp.setSize(brushSize);				// Set default brush size
		currentToolType = toolType.BRUSH;		// Update tool type
		
		// Visually unselect any other tools
		var ele = document.getElementsByName("drawTools-btn-radio");
		for(var i=0;i<ele.length;i++)
			ele[i].checked = false;
	}
}

function createDrawToolsContainer(){
	//Create DIV in which DrawTools will be placed in
	var drawToolsDiv = document.createElement('div');
	drawToolsDiv.id = DRAW_TOOLS_ID;
	//drawToolsDiv.className = 'drawTools-btn-group';
	DRAWCEPTION_TOOLBAR.appendChild(drawToolsDiv);
}

function createDrawToolsElements() 
{
	var drawToolsDiv = document.getElementById(DRAW_TOOLS_ID);
	
	// Create Tool Buttons
	createToolButton(toolType.FILL,"fill");
	createToolButton(toolType.LINE,"line");
	createToolButton(toolType.LINECHAIN,"linechain");
	createToolButton(toolType.CURVE,"curve");
	createToolButton(toolType.RECT,"rect");
	createToolButton(toolType.ELLIPSE,"ellipse");
	createToolButton(toolType.POLY,"poly");
	
	debugLabel = createToolButtonWithLabel(toolType.UTIL,"label", '0');
	
	var optionsButton = createUtilityButton("options");
	optionsButton.onclick = function(){options.toggleMenu();};
	
	createOptionsMenu(drawToolsDiv);
	
	// Exitbutton to remove DrawTools
	var exitButton = createUtilityButton("exit");
	exitButton.onclick = function(){DTDestroy();};
	
}

//Creates Tool Buttons (wit a label)
function createToolButtonWithLabel(type, name, label)
{
	var button = createToolButton(type, name);
	button.getElementsByTagName('div')[0].innerHTML = label; // Place text inside it
	return button;
}
//Creates Tool Buttons (no innerHTML)
function createToolButton(type, name)
{
	//create button
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = 'drawTools-btn-' + name;
	button.className = 'drawTools-btn';
	button.onclick = function(){currentToolType=type;};
	document.getElementById(DRAW_TOOLS_ID).appendChild(button);
	
	//Now create input tag: <input type="radio" name="options" id="brush-35"> 
	var radio = document.createElement('input');
	radio.id = 'drawTools-btn-radio-' + name;
	radio.setAttribute("type","radio");
	radio.setAttribute("name","drawTools-btn-radio");
	button.appendChild(radio);

	//Create container div
	var container = document.createElement('div');
	container.className = 'drawTools-btn-container';
	button.appendChild(container);
	
	// Create icon div
	var icon = document.createElement('div');
	icon.id = 'drawTools-btn-icon-' + name;
	container.appendChild(icon);
	
	return button;
}
//Creates Tool Buttons (no innerHTML)
function createUtilityButton(name)
{
	//create button
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = 'drawTools-btn-' + name;
	button.className = 'drawTools-btn';
	document.getElementById(DRAW_TOOLS_ID).appendChild(button);

	//Create container div
	var container = document.createElement('div');
	container.className = 'drawTools-btn-container';
	button.appendChild(container);
	
	// Create icon div
	var icon = document.createElement('div');
	icon.id = 'drawTools-btn-icon-' + name;
	container.appendChild(icon);
	
	return button;
}

function createOptionsMenu(drawToolsDiv)
{
	//Create DIV in which Options will be placed in
	var optionsDiv = document.createElement('div');
	optionsDiv.id = 'drawTools-options';
	drawToolsDiv.appendChild(optionsDiv);
	
	//Create DIV in which Options Content will be placed in
	var optionsDivContent = document.createElement('div');
	optionsDivContent.id = 'drawTools-options-content';
	optionsDivContent.innerHTML = "<br><br><br><br>HELLO<br>";
	optionsDiv.appendChild(optionsDivContent);
}

// Destroys all elements, styling and javascript
function DTDestroy() 
{
	// 1. Destroy HTML
	document.getElementById(DRAW_TOOLS_ID).remove();
	// 2. Destroy CSS
	document.getElementById('drawToolsStyleSheet').remove();
	// 3. Remove listeners (async)
	$(document).off('mousedown');
	$(document).off('mousemove');
	$(document).off('mouseup');
	// 4. Set the state variable to reflect DTTools uninstallation
	window.DTToolsIsCurrentlyInstalled = false;
	// 5. Destroy JavaScript
	document.getElementById('DTScript').remove();
}

function pointsToArray(points) {
	var arr = new Array();
	for(i = 0, l=points.length; i<l; i++)
		arr.push(points[i].x, points[i].y);
	return arr;
}












function drawSpline(ctx,pts,t,closed,editMode){
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
		
		var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
		var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
		var fa=t*d01/(d01+d12);
		var fb=t-fa;
	  
		var p1x=x1+fa*(x0-x2);
		var p1y=y1+fa*(y0-y2);
		var p2x=x1-fb*(x0-x2);
		var p2y=y1-fb*(y0-y2);  
		
		// Then add them to cp array
		cp=cp.concat(p1x,p1y,p2x,p2y);
	}
	cp = (isClosedSpline) ? cp.concat(cp[0],cp[1]) : cp;
	
	ctx.beginPath();
	ctx.lineJoin="round";
	ctx.moveTo(pts[2],pts[3]);
	for(var i=2;i<n;i+=2)
		ctx.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],pts[i+2],pts[i+3]);
	
	if(isClosedSpline) {
		var c;
		if(editMode) {
			c = parseInt(context.strokeStyle.substr(1,6),16);
			ctx.save(); 
			//ctx.strokeStyle = "rgba("+(c>>16)&255+","+(c>>8)&255+","+c&255+",0.5)";
			ctx.strokeStyle = "#da0000";
		}
		// Draw last curve which closes spline
		//ctx.bezierCurveTo(cp[2*n-2],cp[2*n-1],cp[2*n],cp[2*n+1],pts[n+2],pts[n+3]);
		if(editMode)
			ctx.restore();
		ctx.moveTo(pts[0],pts[1]);
		ctx.closePath();
		ctx.fillStyle = '#8ED6FF';
		ctx.fill();
	} else { 
		//  For open curves the first and last arcs are simple quadratics.
		ctx.moveTo(pts[0],pts[1]);
		ctx.quadraticCurveTo(cp[0],cp[1],pts[2],pts[3]);

		ctx.moveTo(pts[n-2],pts[n-1]);
		ctx.quadraticCurveTo(cp[2*n-10],cp[2*n-9],pts[n-4],pts[n-3]);
	}
	
	ctx.stroke();
	
	if(editMode){   //   Draw the knot points.
		ctx.save(); 
		ctx.fillStyle = '#FFFFFF';
		ctx.strokeStyle = '#000000';
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
}
