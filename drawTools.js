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

// Setup Constants
//cleanTools["PropertyD"] = 4
var DRAW_TOOLS_ID = 'drawTools';
var DRAWCEPTION_TOOLBAR = document.getElementById('redo-button').parentNode.parentNode;
var DRAWCEPTION_BRUSHES = [{id: 'brush-2', size: 2},{id: 'brush-5', size: 5},
                 {id: 'brush-12', size: 12},{id: 'brush-35', size: 35}];

// Setup Clean Tools Object
var cleanTools = {
	'id': DRAW_TOOLS_ID,
	
	'dcToolbar': DRAWCEPTION_TOOLBAR,
	'dcBrushes': DRAWCEPTION_BRUSHES,
	
	'canvas': drawApp.canvas,
	'context': drawApp.context,
	
	'mouseX': 0,
	'mouseY': 0,
	
	'canvasOffset':{top:0,left:0},
	'canvasWidth':0,
	'canvasHeight':0,
	"updateCanvasLocation": function() {
		this.canvasOffset = $('#drawingCanvas').offset();    // Update canvas offset variable
		this.canvasWidth = this.canvas.width();              // Update canvas width variable
		this.canvasHeight = this.canvas.height();            // Update canvas width variable
	},
	"restoreCanvas": function() {
		this.context.constructor.prototype.putImageData.call(this.context, restorePoints[restorePosition], 0, 0);
	},
	"isWithinCanvasBounds": function(x,y) {
		if(!y)
			return (x.x>=0 && x.y>=0 && x.x<this.canvasWidth && x.y<this.canvasHeight);
		else
			return (x>=0 && y>=0 && x<this.canvasWidth && y<this.canvasHeight);
	},
	"isWithinDrawingBounds": function(x,y) {
		return (x>=(-12) && y>=(-12) && x<(this.canvasWidth+12) && y<(this.canvasHeight+12));
	},
	
};
var xfasdfadf = 2+3;
var doasfasdf = xfasdfadf +34;
var doasdsasdffasdf = xfasdfadf +33;

// Setup Some Global Variables
window.DTToolsIsCurrentlyInstalled = true;	// State variable that helps prevent double installation of script
cleanTools.context.putImageData = CanvasRenderingContext2D.prototype.putImageData;


  /*-----------------------------------------------------------------------------*/
 /*--------------------- Custom Objects/Structures/enums -----------------------*/
/*-----------------------------------------------------------------------------*/
var DTOptionsClass = function (idNameString) {
	this.idName = idNameString;
	
	// Fill Options
	this.useStrokeAsFill = false;
	this.fillColor = ''; // Will be null if no fill for shapes
	
	this.lineToolsShouldClose = false;
	
	this.curveTension = 0.5;
};
DTOptionsClass.prototype.getOffset = function () {
	return $(this.idName).offset();
};
DTOptionsClass.prototype.toggleMenu = function () {
	var h = 175;	// Height of the options div
	var opacity = $(this.idName).css('opacity');
	
	if(opacity == 0) {
		$(this.idName).stop(true, true).animate({
			height: (h + "px"),
			marginTop: ("-=" + h + "px"),
			opacity: "1"
		},200, "swing");
	} else if(opacity == 1) {
		$(this.idName).stop(true, true).animate({
			height: "0px",
			marginTop: ("+=" + h + "px"),
			opacity: "0"
		},200, "swing");
	}
};
DTOptionsClass.prototype.isWithinBounds = function (x, y) {
	var x2 = x - $(this.idName).offset().top;
	var y2 = y - $(this.idName).offset().left;
	var width = $(this.idName).width();
	var height = $(this.idName).height();
	//outputDebug("[x:" + x2 + ", y:" + y2 + "] [width:" + width + ", height:" + height + "]");
	return (x2>=0 && y2>=0 && x2<width && y2<height);
};

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
	this.a = (a) ? a : 0;
}
RGBColor.prototype.equals = function(color) {
	return (this.r===color.r && this.g===color.g && this.b===color.b && this.a===color.a);
};
// Tool type enum
var toolType={BRUSH:0,FILL:1,LINE:2,LINECHAIN:3,CURVE:4,RECT:5,ELLIPSE:6,UTIL:99};

  /*-----------------------------------------------------------------------------*/
 /*----------------------------------- Main ------------------------------------*/
/*-----------------------------------------------------------------------------*/

// Setup Some State Variables
var options = new DTOptionsClass('#' + cleanTools.id + '-options');
cleanTools["currentToolType"] = toolType.BRUSH;
cleanTools["toolInUse"] = false;

cleanTools.updateCanvasLocation();

// Setup Debug Stuff
var debugLabel; //Go to createDrawToolsElements to find assignment
function outputDebug(outputString){
	debugLabel.getElementsByTagName('div')[0].innerHTML = outputString;
}
// Setup tool state/event variables
var DTPoints = new Array();     // Will contain user input point sets for shapes/lines/etc

createDrawToolsContainer();     // Create Draw Tools Container
setupCSS();                     // Setup necessary CSS for DrawTools
modifyExistingElements();       // Make Necessary Modifications to Existing Elements
createDrawToolsElements();      // Create Draw Tools Elements and Interface

/*---------------------- Setup Listeners ----------------------*/

// Setup Mousedown Listener
cleanTools.canvas.off('mousedown');
cleanTools.canvas.on('mousedown', function(e){
	if(0 && $('#drawTools-options').css('opacity') == 1){
		painting = !1;
		cleanTools.restoreCanvas();
		return;
	} else if(cleanTools.currentToolType === toolType.BRUSH)
		return;
	cleanTools.toolInUse = true;
	cleanTools.updateCanvasLocation();
	
	// Translate mouse location to point relative to canvas
	cleanTools.mouseX = e.pageX-cleanTools.canvasOffset.left;
	cleanTools.mouseY = e.pageY-cleanTools.canvasOffset.top;
	
	if(cleanTools.currentToolType === toolType.FILL) {
		var stopwatch = new StopWatch();
		stopwatch.start();
		painting = !1;
		try{
			floodFill(cleanTools.context,e);
		}catch(err){alert(err);}
		stopwatch.stop();
		stopwatch.printElapsed();
	} else if(cleanTools.currentToolType === toolType.LINE) {
		painting = !1;
		DTPoints[0] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
	} else if(cleanTools.currentToolType === toolType.LINECHAIN) {
		painting = !1;
	} else if(cleanTools.currentToolType === toolType.CURVE) {
		painting = !1;
	} else if(cleanTools.currentToolType === toolType.RECT) {
		painting = !1;
		DTPoints[0] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
	} else if(cleanTools.currentToolType === toolType.ELLIPSE) {
		painting = !1;
		DTPoints[0] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
	} 
});
// Setup Mousemove Listener
$(document).off('mousemove');
$(document).on('mousemove', function(e){
/*	if(cleanTools.isWithinCanvasBounds(e.pageX-cleanTools.canvasOffset.left,e.pageY-cleanTools.canvasOffset.top)) {
		try{
			var p = cleanTools.context.getImageData(e.pageX-cleanTools.canvasOffset.left, e.pageY-cleanTools.canvasOffset.top, 1, 1).data;
			outputDebug("[r:" +p[0] + ", g:" + p[1] + ", b:" + p[2] + ", a:" + p[3] + "]");
		} catch(err){alert(err);}
	} else {
		outputDebug("Out of bounds.")
	}
	*/
	if(cleanTools.currentToolType === toolType.BRUSH)
		return;	// default behaviors
	else if(!cleanTools.toolInUse)
		return;	// If no tool is in use, ignore event
		
	// Translate mouse location to point relative to canvas
	cleanTools.mouseX = e.pageX-cleanTools.canvasOffset.left;
	cleanTools.mouseY = e.pageY-cleanTools.canvasOffset.top;
	
	if(cleanTools.currentToolType === toolType.FILL) {
		// Do nothing
	} else if(cleanTools.currentToolType === toolType.LINE) {
		cleanTools.restoreCanvas();
		drawLine(cleanTools.context,DTPoints[0].x,DTPoints[0].y,cleanTools.mouseX,cleanTools.mouseY);
	} else if(cleanTools.currentToolType === toolType.LINECHAIN) {
		if(DTPoints.length > 0) {
			var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
			cleanTools.restoreCanvas();
			DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
			drawLineChain(cleanTools.context,pointsToArray(DTPoints),true,options.lineToolsShouldClose,fillColor);
			DTPoints.length = DTPoints.length - 1;
		}
	} else if(cleanTools.currentToolType === toolType.CURVE) {
		if(DTPoints.length > 0) {
			var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
			cleanTools.restoreCanvas();
			DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
			try{
			drawSpline(cleanTools.context,pointsToArray(DTPoints),0.5,options.lineToolsShouldClose,fillColor,true);
			}catch(err){alert(err);}
			DTPoints.length = DTPoints.length - 1;
		}
	} else if(cleanTools.currentToolType === toolType.RECT) {
		var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
		cleanTools.restoreCanvas();
		DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
		drawRect(cleanTools.context,pointsToArray(DTPoints),fillColor);
		DTPoints.length = DTPoints.length - 1;
	} else if(cleanTools.currentToolType === toolType.ELLIPSE) {
		var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
		cleanTools.restoreCanvas();
		DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
		drawEllipse(cleanTools.context,pointsToArray(DTPoints),fillColor);
		DTPoints.length = DTPoints.length - 1;
	}
});
// Setup Mouseup Listener
$(document).off('mouseup');
$(document).on('mouseup', function(e){
	if(0 && $('#drawTools-options').css('opacity') == 1){
		if(!options.isWithinBounds(e.pageX, e.pageY))
			options.toggleMenu();
		return;
	} else if(cleanTools.currentToolType === toolType.BRUSH)
		return;
	else if(!cleanTools.toolInUse)	// If no tool is in use, ignore event
		return;
		
	// Translate mouse location to point relative to canvas
	cleanTools.mouseX = e.pageX-cleanTools.canvasOffset.left;
	cleanTools.mouseY = e.pageY-cleanTools.canvasOffset.top;
	
	if(cleanTools.currentToolType === toolType.FILL) {
		// Do nothing
	} else if(cleanTools.currentToolType === toolType.LINE) {
		cleanTools.restoreCanvas();
		drawLine(cleanTools.context,DTPoints[0].x,DTPoints[0].y, cleanTools.mouseX, cleanTools.mouseY);
	} else if(cleanTools.currentToolType === toolType.LINECHAIN) {
		if(cleanTools.isWithinDrawingBounds(cleanTools.mouseX,cleanTools.mouseY)){
			DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
			if(e.which == 3) {	// If right mouse click, finish the chain
				var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
				cleanTools.restoreCanvas();
				drawLineChain(cleanTools.context,pointsToArray(DTPoints),false,options.lineToolsShouldClose,fillColor);
			} else {
				return;
			}
		} else {
			cleanTools.restoreCanvas();
			DTPoints.length = 0;
			cleanTools.toolInUse = false;
			return;
		}
	} else if(cleanTools.currentToolType === toolType.CURVE) {
		if(cleanTools.isWithinDrawingBounds(cleanTools.mouseX,cleanTools.mouseY)){
			DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
			if(e.which == 3) {	// If right mouse click, finish the curve
				var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
				cleanTools.restoreCanvas();
				drawSpline(cleanTools.context,pointsToArray(DTPoints),0.5,options.lineToolsShouldClose,fillColor,false);
			} else {
				return;
			}
		} else {	// If user clicks out of acceptable boundaries, cancel all tool progress
			cleanTools.restoreCanvas();
			DTPoints.length = 0;
			cleanTools.toolInUse = false;
			return;
		}
	} else if(cleanTools.currentToolType === toolType.RECT) {
		var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
		cleanTools.restoreCanvas();
		DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
		drawRect(cleanTools.context,pointsToArray(DTPoints),fillColor);
	} else if(cleanTools.currentToolType === toolType.ELLIPSE) {
		var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
		cleanTools.restoreCanvas();
		DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
		drawEllipse(cleanTools.context,pointsToArray(DTPoints),fillColor);
	}
	DTPoints.length = 0;
	cleanTools.toolInUse = false;
	save();
	
});

$(document).keydown(function(e) {
	//if (r.keyCode == e.charCodeAt(0) && r.ctrlKey) {
	//	t.apply(this, n);
	//	return !1
	//}
	if(e.keyCode == 39) {
		alert('Right was pressed');
	} if(e.keyCode == "Q".charCodeAt(0)) {
		
		if(cleanTools.currentToolType === toolType.LINECHAIN || cleanTools.currentToolType === toolType.CURVE) {
			if(DTPoints.length) {
				DTPoints.length -= 1;
				if(DTPoints.length == 0) {
					cleanTools.toolInUse = false;
				}
				var fillColor = (options.useStrokeAsFill) ? cleanTools.context.strokeStyle : options.fillColor;
				cleanTools.restoreCanvas();
				DTPoints[DTPoints.length] = {x: cleanTools.mouseX, y: cleanTools.mouseY};
				if(cleanTools.currentToolType === toolType.LINECHAIN)
					drawLineChain(cleanTools.context,pointsToArray(DTPoints),true,options.lineToolsShouldClose,fillColor);
				else
					drawSpline(cleanTools.context,pointsToArray(DTPoints),0.5,options.lineToolsShouldClose,fillColor,true);
				DTPoints.length = DTPoints.length - 1;
			}
		}
	} else {
		//alert('Keycode for that key is: ' + e.keyCode);
	}
});

  /*-----------------------------------------------------------------------------*/
 /*----------------------------- Drawing Algorithms ----------------------------*/
/*-----------------------------------------------------------------------------*/

function drawLine(ctx,startX,startY,finishX,finishY)
{
	ctx.beginPath();
	ctx.moveTo( startX, startY );
	ctx.lineTo( finishX, finishY);
	ctx.stroke();
}
function drawRect(ctx,pts,fillColorHex)
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
function drawEllipse(ctx,pts,fillColorHex){
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

function floodFill(ctx,e){
	// This restoreCanvas() fix avoids issues with brush placing dot over flood fill seed area
	cleanTools.restoreCanvas();
	
	var w = cleanTools.canvasWidth;
	var h = cleanTools.canvasHeight;
	var p = ctx.getImageData(0,0,w,h);
	var d = p.data;
	var targetColor = getColorFromCoords(e.offsetX,e.offsetY);
	var c = parseInt(ctx.strokeStyle.substr(1,6),16);
	var fillColor = new RGBColor((c>>16)&255,(c>>8)&255,c&255,255);
	
	// Note: target color must be different to execute function f
	// If something is already colored the fill color, nothing needs to be done
	if(!targetColor.equals(fillColor))
		//colorPixel(new Point(5,5),fillColor);
		//paint(5,w-5,50,fillColor);
		f(e.offsetX,e.offsetY);

	ctx.putImageData(p,0,0);
	
	//----------------------------------------------------------------------------------------------------------
	
	
	
	
	
	
	
function f(xSeed,ySeed){
	var edgeQueue = [];
	//[x,y,goingUp(1 vs -1)
	var stack = [[xSeed,ySeed,1]];
	if(test(xSeed,ySeed-1))
		stack.push([xSeed,ySeed-1,-1]);
	var edgeQueue = [];
	
	var x = 0;
	var y = 0;
	var direction = 0;
	
	while(stack.length>0) {
		var line = stack.pop();
		x = line[0];
		y = line[1];
		direction = line[2];
		if(test(x,y)) {	// If pixel hasn't been colored continue.
			// Check if pixel above is eligible to be seed pixel for next line.
			if(test(x,y+direction))
				stack.push([x,y+direction,direction]);
			
			var xMax;
			var xMin;
			var i;
			// Travel right
			for(i = x+1; test(i,y); i++) { // While pixel line meets continues to meet its target color
				var topFillable = test(i,y+direction);
				var bottomFillable = test(i,y-direction);
				var topSideUnfillable = !test(i-1,y+direction);
				var bottomSideUnfillable = !test(i-1,y-direction);
				//if(topSideUnfillable) {
				//}
				// Two if statements to know when to add a new seed
				if(topFillable && topSideUnfillable)
					stack.push([i,y+direction,direction]);
				if(bottomFillable && bottomSideUnfillable)
					stack.push([i,y-direction,-direction]);
			}
			xMax = i-1;
			
			// Travel left
			for(i = x-1; test(i,y); i--) { // While pixel line meets continues to meet its target color
				var topFillable = test(i,y+direction);
				var bottomFillable = test(i,y-direction);
				var topSideUnfillable = !test(i-1,y+direction);
				var bottomSideUnfillable = !test(i-1,y-direction);
				// Two if statements to know when to add a new seed
				if(topFillable && topSideUnfillable)
					stack.push([i,y+direction,direction]);
				if(bottomFillable && bottomSideUnfillable)
					stack.push([i,y-direction,-direction]);
			}
			xMin = i+1;
			paint(xMin,xMax,y,fillColor);
		}
	}
}
function paint(xMin,xMax,y,color) {
	//alert("Starting linepaint");
	var r = color.r, g = color.g, b = color.b, a = color.a;
	var limit = (xMax+1 + y * w) * 4;
	for(var i = (xMin + y * w) * 4; i<limit; i+=4) {
		d[i]=r;
		d[i+1]=g;
		d[i+2]=b;
		d[i+3]=a;
	}
	//alert("Ending linepaint");
}
function test(x,y) {
	var point = new Point(x,y);
	return (cleanTools.isWithinCanvasBounds(point) && targetColor.equals(getColorFromPoint(point)));
}
	
	
	
	
	
	
	
	
	
	//------------------------------------------------------------------------------------------------------------
	function f2(xinitial,yinitial){
		var queue = [new Point(xinitial,yinitial)];
		var edgeQueue = [];
		var x = 0;
		var y = 0;
		var point;
		while(queue.length>0) {
			point=queue.shift();
			x=point.x;
			y=point.y;
			if( cleanTools.isWithinCanvasBounds(point) && targetColor.equals(getColorFromPoint(point)) ) {
				colorPixel(point,fillColor);
				queue.push(new Point(x-1,y));
				queue.push(new Point(x+1,y));
				queue.push(new Point(x,y-1));
				queue.push(new Point(x,y+1));
			} else if(cleanTools.isWithinCanvasBounds(point) && !(fillColor.equals(getColorFromPoint(point)))){
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
			if(cleanTools.isWithinCanvasBounds(point2))
				colorPixelBlend(point2,fillColor,getColorFromCoords(x-1,y));
			point2 = new Point(x+1,y);
			if(cleanTools.isWithinCanvasBounds(point2))
				colorPixelBlend(point2,fillColor,getColorFromCoords(x+1,y));
			point2 = new Point(x,y-1);
			if(cleanTools.isWithinCanvasBounds(point2))
				colorPixelBlend(point2,fillColor,getColorFromCoords(x,y-1));
			point2 = new Point(x,y+1);
			if(cleanTools.isWithinCanvasBounds(point2))
				colorPixelBlend(point2,fillColor,getColorFromCoords(x,y+1));
		}
	}
	/*---------------------- Color Methods ----------------------*/
	//Colors a pixel with a given color
	function colorPixel(point,color) {
		var i = (point.x + point.y * w) * 4;
		d[i]=color.r;
		d[i+1]=color.g;
		d[i+2]=color.b;
		d[i+3]=color.a;
	}
	// [Experimental] Colors a pixel with a blend of 2 colors (helpful for assimilating anti-aliasing)
	function colorPixelBlend(point,color1,color2){
		var r=Math.ceil((color1.r+color2.r)/2);
		var g=Math.ceil((color1.g+color2.g)/2);
		var b=Math.ceil((color1.b+color2.b)/2);
		colorPixel(point,new RGBColor(r,g,b,255));
	}
	function getColorFromPoint(point){
		return getColorFromCoords(point.x,point.y);
	}
	function getColorFromCoords(x,y){
		var i = (x + y * w) * 4;
		return new RGBColor(d[i],d[i+1],d[i+2],d[i+3]);
	}
}
function drawLineChain(ctx,pts,editMode,closeShape,closedFillColorHex)
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
	ctx.restore();
}
function drawSpline(ctx,pts,t,closed,closedFillColorHex,editMode){
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
 /*--------------------------- Auxiliary Functions -----------------------------*/
/*-----------------------------------------------------------------------------*/

  /*-----------------------------------------------------------------------------*/
 /*----------------------------- CSS Style Sheets ------------------------------*/
/*-----------------------------------------------------------------------------*/

function setupCSS()
{
	// Calculate variables used in css
	var optionsMarginTop = cleanTools.canvasOffset.top + cleanTools.canvasHeight - $('#' + cleanTools.id).offset().top;
	
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
 /*---------------------- Elements Creation/Manipulation -----------------------*/
/*-----------------------------------------------------------------------------*/
function modifyExistingElements() 
{
	/*	// TODO:Figure this out. This doesn't work for some reason, so i hardcoded it.
	for(var j=0;j<cleanTools.dcBrushes.length;j++)
		document.getElementById(cleanTools.dcBrushes[j].id).parentNode.onclick = function(){selectBrushAUX(cleanTools.dcBrushes[j].size);};
	*/
	document.getElementById(cleanTools.dcBrushes[0].id).parentNode.onclick = function(){selectBrushAUX(cleanTools.dcBrushes[0].size);};
	document.getElementById(cleanTools.dcBrushes[1].id).parentNode.onclick = function(){selectBrushAUX(cleanTools.dcBrushes[1].size);};
	document.getElementById(cleanTools.dcBrushes[2].id).parentNode.onclick = function(){selectBrushAUX(cleanTools.dcBrushes[2].size);};
	document.getElementById(cleanTools.dcBrushes[3].id).parentNode.onclick = function(){selectBrushAUX(cleanTools.dcBrushes[3].size);};
	
	function selectBrushAUX(brushSize) {
		drawApp.setSize(brushSize);				// Set default brush size
		cleanTools.currentToolType = toolType.BRUSH;		// Update tool type
		
		// Visually unselect any other tools
		var ele = document.getElementsByName(cleanTools.id + "-btn-radio");
		for(var i=0;i<ele.length;i++)
			ele[i].checked = false;
	}
}

function createDrawToolsContainer(){
	//Create DIV in which DrawTools will be placed in
	var drawToolsDiv = document.createElement('div');
	drawToolsDiv.id = cleanTools.id;
	//drawToolsDiv.className = 'drawTools-btn-group';
	cleanTools.dcToolbar.appendChild(drawToolsDiv);
}

function createDrawToolsElements() 
{
	var drawToolsDiv = document.getElementById(cleanTools.id);
	
	// Create Tool Buttons
	createToolButton(toolType.FILL,"fill");
	createToolButton(toolType.LINE,"line");
	createToolButton(toolType.LINECHAIN,"linechain");
	createToolButton(toolType.CURVE,"curve");
	createToolButton(toolType.RECT,"rect");
	createToolButton(toolType.ELLIPSE,"ellipse");
	
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
	button.id = cleanTools.id + '-btn-' + name;
	button.className = 'drawTools-btn';
	button.onclick = function(){cleanTools.currentToolType=type;};
	document.getElementById(cleanTools.id).appendChild(button);
	
	//Now create input tag: <input type="radio" name="options" id="brush-35"> 
	var radio = document.createElement('input');
	radio.id = cleanTools.id + '-btn-radio-' + name;
	radio.setAttribute("type","radio");
	radio.setAttribute("name", (cleanTools.id + "-btn-radio"));
	button.appendChild(radio);

	//Create container div
	var container = document.createElement('div');
	container.className = cleanTools.id + '-btn-container';
	button.appendChild(container);
	
	// Create icon div
	var icon = document.createElement('div');
	icon.id = cleanTools.id + '-btn-icon-' + name;
	container.appendChild(icon);
	
	return button;
}
//Creates Tool Buttons (no innerHTML)
function createUtilityButton(name)
{
	//create button
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = cleanTools.id + '-btn-' + name;
	button.className = cleanTools.id + '-btn';
	document.getElementById(cleanTools.id).appendChild(button);

	//Create container div
	var container = document.createElement('div');
	container.className = cleanTools.id + '-btn-container';
	button.appendChild(container);
	
	// Create icon div
	var icon = document.createElement('div');
	icon.id = cleanTools.id + '-btn-icon-' + name;
	container.appendChild(icon);
	
	return button;
}

function createOptionsMenu(drawToolsDiv)
{
	//Create DIV in which Options will be placed in
	var optionsDiv = document.createElement('div');
	optionsDiv.id = cleanTools.id + '-options';
	optionsDiv.innerHTML = "\
		<div id='drawTools-options-content'>\
			<div id='drawTools-options-leftPanel'></div>\
			<div id='drawTools-options-palette'></div>\
		</div>";
	drawToolsDiv.appendChild(optionsDiv);
	
	//----- BEGIN ----- LeftPanel --------------------------------------------------
	var leftPanelHtml = "";
	leftPanelHtml += 
		'<label onclick=setLineToolsOpen(); class="switch">\
			<input type="checkbox" class="switch-input" id="drawTools-options-checkbox-lineToolsOpen">\
			<span class="switch-label" data-on="Line Tools Closed" data-off="Line Tools Open"></span>\
			<span class="switch-handle"></span>\
		</label>';
	document.getElementById('drawTools-options-leftPanel').innerHTML = leftPanelHtml;
	//----- BEGIN ----- ColorPicker --------------------------------------------------
	var colorElements = document.getElementsByClassName('colorPicker');
	var optionsPaletteHtml = "";
	
	optionsPaletteHtml += 
		'<label style="width:120px;">\
			<input type="radio" name="drawTools-options-palette-radio" checked>\
			<div onclick=setOptionsColor(""); style="width:120px;background:#333333;color:#c2c2c2;">No Fill</div>\
		</label>';
	optionsPaletteHtml += 
		'<label style="width:120px;">\
			<input type="radio" name="drawTools-options-palette-radio">\
			<div onclick=setOptionsColor("",1); style="width:120px;background:#333333;color:#c2c2c2;">Brush Color</div>\
		</label>';
	
	for(var i=0;i<colorElements.length;i++) {
		//paletteArray.push(hexColorElements[i].getAttribute("data-color"));
		var color = colorElements[i].getAttribute("data-color");
		optionsPaletteHtml += 
			'<label>\
				<input type="radio" name="drawTools-options-palette-radio">\
				<div onclick=setOptionsColor("' + color + '"); style="background:' + color + ';"></div>\
			</label>';
	}
	document.getElementById('drawTools-options-palette').innerHTML = optionsPaletteHtml;
	
	
}
function setLineToolsOpen() {
	options.lineToolsShouldClose = document.getElementById('drawTools-options-checkbox-lineToolsOpen').checked;
}

function setOptionsColor(color,normalfill) {
	if(normalfill) {
		options.useStrokeAsFill = true;
		options.fillColor = '';
	} else {
		options.useStrokeAsFill = false;
		options.fillColor = color;
	}
}

// Destroys all elements, styling and javascript
function DTDestroy() 
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

function pointsToArray(points) {
	var arr = new Array();
	for(i = 0, l=points.length; i<l; i++)
		arr.push(points[i].x, points[i].y);
	return arr;
}
