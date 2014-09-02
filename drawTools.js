// State variable that helps prevent double installation of script
window.DTToolsIsCurrentlyInstalled = true;

// Setup Constants
//cleanTools["PropertyD"] = 4
var DRAW_TOOLS_ID = 'drawTools';
var DRAWCEPTION_TOOLBAR = document.getElementById('redo-button').parentNode.parentNode;
var DRAWCEPTION_BRUSHES = 
	[{id: 'brush-2', size: 2},{id: 'brush-5', size: 5},{id: 'brush-12', size: 12},{id: 'brush-35', size: 35}];

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
	
	'eventHandlers':{}
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
	}
};
cleanTools["tools"] = {
	'currentToolType':0,
	'toolActive':false,
	'points':[], // Will contain user input point sets for shapes/lines/etc
	
	'toolType':{BRUSH:0,FILL:1,LINE:2,LINECHAIN:3,CURVE:4,RECT:5,ELLIPSE:6,UTIL:99},
	'reset':function(saveCanvas) {
		this.points.length = 0;
		this.toolActive = false;
		if(saveCanvas)
			save();
	},
	'paintMethods':{},
	'squareShiftHold':function(startX,startY,endX,endY) {
		var endPointX, endPointY;
		var width = endX - startX;
		var height = endY - startY;
		var valueToUse = Math.min(Math.abs(width),Math.abs(height));
		if(width > 0) {
			if(height > 0) { // Bottom Right
				endPointX = startX + valueToUse; 
				endPointY = startY + valueToUse;
			} else { // Top Right
				endPointX = startX + valueToUse; 
				endPointY = startY - valueToUse;
			}
		} else {
			if(height > 0) { // Bottom Left
				endPointX = startX - valueToUse; 
				endPointY = startY + valueToUse;
			} else { // Top Left
				endPointX = startX - valueToUse; 
				endPointY = startY - valueToUse;
			}
		}
		return {x: endPointX, y:endPointY};
	},
	'lineShiftHold':function(startX,startY,endX,endY) {
		var rise = startY - endY;
		var run = (startX - endX) ? (startX - endX): 1;
		var slope = rise/run;
		if( slope > 2.4 || slope < -2.4 ) { // Up-Down
			return {x:startX, y:endY};
		} else if( slope < 0.4 && slope > -0.4 ) { // Left-Right
			return {x:endX, y:startY};
		} else {
			return this.squareShiftHold(startX,startY,endX,endY);
		}
	}
};
cleanTools["data"] = {
	
	// Fill Preferences
	'useStrokeAsFill':false,
	'fillColor':'', // Will be null if no fill for shapes
	
	'lineToolsShouldClose':false,
	
	'curveTension':0.5,
};
cleanTools["html"] = {
	'MENU_PALETTE_ID':'#' + cleanTools.id + '-menu',
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
			this.cleanToolsObject.data.lineToolsShouldClose = document.getElementById('drawTools-menu-loop-checkbox').checked;
		},
		'setOptionsColor':function(color,normalfill) {
			if(normalfill) {
				this.cleanToolsObject.data.useStrokeAsFill = true;
				this.cleanToolsObject.data.fillColor = '';
			} else {
				this.cleanToolsObject.data.useStrokeAsFill = false;
				this.cleanToolsObject.data.fillColor = color;
			}
		},
		'setToolType':function(type) {
			this.cleanToolsObject.tools.currentToolType=type;
		}
	},
	
	'getOffset':function () {
		return $(this.MENU_PALETTE_ID).offset();
	},
	'menuIsOpen':function (menuID) {
		
	},
	'toggleMenu':function (menuID) {
		var h = 175;	// Height of the menu div
		var opacity = $(menuID).css('opacity');
		
		if(opacity == 0) {
			this.openMenu(menuID,h);
		} else if(opacity == 1) {
			this.closeMenu(menuID,h);
		}
	},
	'openMenu':function (menuID, h) { /* private */
		var opacity = $(menuID).css('opacity');
		if(opacity == 0) {
			$(menuID).stop(true, true).animate({
				//height: (h + "px"),
				//marginTop: ("-=" + h + "px"),
				opacity: "1"
			},100, "swing");
		}
	},
	'closeMenu':function (menuID, h) { /* private */
		var opacity = $(menuID).css('opacity');
		if(opacity == 1) {
			$(menuID).stop(true, true).animate({
				//height: "0px",
				//marginTop: ("+=" + h + "px"),
				opacity: "0"
			},100, "swing");
		}
	},
	'isWithinMenuBounds':function (menuID, x, y) {
		var x2 = x - $(menuID).offset().top;
		var y2 = y - $(menuID).offset().left;
		var width = $(menuID).width();
		var height = $(menuID).height();
		return (x2>=0 && y2>=0 && x2<width && y2<height);
	}
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
	var cleanToolsObject = $('#' + cleanTools.id);
	var optionsMarginTop = cleanTools.canvas.offset.top + cleanTools.canvas.height - cleanToolsObject.offset().top;
	var optionsMarginLeft = (cleanToolsObject.width() - 420)/2;
	/*
		#drawTools-menu{margin-top:"+optionsMarginTop+"px;margin-left:"+optionsMarginLeft+"px;background:#252525;border-bottom:1px solid #171717;width:420px;height:0px;position:absolute;border-radius:2px 2px 0px 0px;opacity:0;overflow:hidden;-webkit-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);}\n\
		#drawTools-menu-content{position:absolute;top:8px;left:8px;right:8px;bottom:8px;}\n\
		\n\
	*/
	
	var DTSheet = document.createElement('style');
	DTSheet.id = cleanTools.id + 'StyleSheet'; // Give id so destructor can find it if needed
	DTSheet.innerHTML = "\n\
		/*These drawTools-btn-Icon are css only icons*/\n\
		#drawTools-btn-icon-fill{margin:12px 5px 0px 21px;width:12px;height:12px;background:black;border-bottom-right-radius:2px;border-bottom-left-radius:2px;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-ms-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}\n\
		#drawTools-btn-icon-fill:before{border-bottom:5px solid black;border-left:8px solid transparent;border-right:8px solid transparent;display:block;position:absolute;top:-6px;left:-6px;content:'';}\n\
		#drawTools-btn-icon-line{margin:8px 16px 0px 17px;width:5px;height:15px;background:black;border-radius:2px;-webkit-transform:skew(-50deg);-moz-transform:skew(-50deg);-o-transform:skew(-50deg);transform:skew(-50deg);}\n\
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
		#drawTools-btn-icon-download{position:relative;margin:8px 8px 0px 8px;width:12px;height:8px;background:#c2c2c2;}\n\
		#drawTools-btn-icon-download:before{top:8px;left:-4px;margin:0;position:absolute;content:'';border-left:10px solid transparent;border-right:10px solid transparent;border-top:9px solid #c2c2c2;}\n\
		#drawTools-btn-icon-loop{display:block;position:relative;margin:8px 13px;width:15px;height:15px;border-radius:100%;border-bottom:3px dotted #c2c2c2;border-top:3px dotted #c2c2c2;border-left:3px dotted #c2c2c2;border-right:3px dotted transparent;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;-ms-box-sizing:border-box;box-sizing:border-box;}\n\
		#drawTools-btn-icon-loop:after{content:'';position:absolute;top:-3px;right:-2px;width:0;height:0;border-style:solid;border-width:0 0 6px 6px;border-color:transparent transparent #c2c2c2 transparent;}\n\
		#drawTools-btn-icon-fillpalette{margin:4px 8px;position:relative;width:24px;height:6px;background:linear-gradient(to right,#c2c2c2,#c2c2c2 6px,transparent 6px,transparent 9px,#c2c2c2 9px,#c2c2c2 15px,transparent 15px,transparent 18px,#c2c2c2 18px,#c2c2c2 24px);}\n\
		#drawTools-btn-icon-fillpalette:before{margin:0;position:absolute;top:9px;left:0;content:'';width:24px;height:6px;background:linear-gradient(to right,#c2c2c2,#c2c2c2 6px,transparent 6px,transparent 9px,#c2c2c2 9px,#c2c2c2 15px,transparent 15px,transparent 18px,#c2c2c2 18px,#c2c2c2 24px);}\n\
		#drawTools-btn-icon-fillpalette:after{margin:0;position:absolute;top:18px;left:0;content:'';width:24px;height:6px;background:linear-gradient(to right,#c2c2c2,#c2c2c2 6px,transparent 6px,transparent 9px,#c2c2c2 9px,#c2c2c2 15px,transparent 15px,transparent 18px,#c2c2c2 18px,#c2c2c2 24px);}\n\
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
		#drawTools-btn-loop .drawTools-btn-container{background:#252525;border-bottom:1px solid #171717;border-right:1px solid #111111;}\n\
		#drawTools-btn-loop .drawTools-btn-container:focus{outline:thin dotted #fff;}\n\
		#drawTools-btn-loop .drawTools-btn-container:hover,#drawTools-btn-loop .drawTools-btn:focus{background-color:#2e2e2e;border-bottom:1px solid #222222;}\n\
		#drawTools-btn-loop .drawTools-btn-container:active{background-color:#252525;border-bottom:1px solid #252525;}\n\
		#drawTools-btn-loop input[type='checkbox']{position:absolute;top:0;left:0;opacity:0;}\n\
		#drawTools-btn-loop input[type='checkbox']:checked ~ #drawTools-btn-icon-loop {border:3px dotted #c2c2c2;background:#252525;-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;}\n\
		\n\
		#drawTools-btn-fillpalette .drawTools-btn-container{background:#252525;border-bottom:1px solid #171717;border-right:1px solid #111111;}\n\
		#drawTools-btn-fillpalette .drawTools-btn-container:focus{outline:thin dotted #fff;}\n\
		#drawTools-btn-fillpalette .drawTools-btn-container:hover,#drawTools-btn-fillpalette .drawTools-btn:focus{background-color:#2e2e2e;border-bottom:1px solid #222222;}\n\
		#drawTools-btn-fillpalette .drawTools-btn-container:active{background-color:#252525;border-bottom:1px solid #252525;}\n\
		\n\
		#drawTools-btn-download .drawTools-btn-container{position:relative; background:#252525;border-bottom:1px solid #171717;border-right:1px solid #111111;}\n\
		#drawTools-btn-download .drawTools-btn-container:focus{outline:thin dotted #fff;}\n\
		#drawTools-btn-download .drawTools-btn-container:hover,#drawTools-btn-download .drawTools-btn:focus{background-color:#2e2e2e;border-bottom:1px solid #222222;}\n\
		#drawTools-btn-download .drawTools-btn-container:active{background-color:#252525;border-bottom:1px solid #252525;}\n\
		\n\
		#drawTools-btn-options .drawTools-btn-container{background:#252525;border-bottom:1px solid #171717;border-right:1px solid #111111;}\n\
		#drawTools-btn-options .drawTools-btn-container:focus{outline:thin dotted #fff;}\n\
		#drawTools-btn-options .drawTools-btn-container:hover,#drawTools-btn-options .drawTools-btn:focus{background-color:#2e2e2e;border-bottom:1px solid #222222;}\n\
		#drawTools-btn-options .drawTools-btn-container:active{background-color:#252525;border-bottom:1px solid #252525;}\n\
		\n\
		#drawTools-btn-exit .drawTools-btn-container{background:#a50000;border-bottom:1px solid #7c0000;}\n\
		#drawTools-btn-exit .drawTools-btn-container:focus{outline:thin dotted #fff;}\n\
		#drawTools-btn-exit .drawTools-btn-container:hover,#drawTools-btn-exit .drawTools-btn:focus{background-color:#b90c0c;border-bottom:1px solid #980909;}\n\
		#drawTools-btn-exit .drawTools-btn-container:active{background-color:#a50000;border-bottom:1px solid #a50000;}\n\
		\n\
		.drawTools-menu{position:absolute;bottom:45px;padding:8px;margin:0;background:#252525;border-bottom:1px solid #171717;width:auto;height:175px;border-radius:2px 2px 0px 0px;opacity:0;z-index:99;-webkit-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);}\n\
		.drawTools-menu-content{position:relative;}\n\
		\n\
		.drawTools-menu-palette-parent{margin-left:-105px !important;}\n\
		#drawTools-menu-palette{width:240px;height:100%;position:relative;margin:0;}\n\
		#drawTools-menu-palette label{width:40px;height:40px;float:left;overflow:hidden;display:inline-block;margin:0;padding=0;}\n\
		#drawTools-menu-palette input{display:none;visibility:hidden;margin:0px;padding:0px;}\n\
		#drawTools-menu-palette input:checked + div{border:2px solid #c2c2c2;}\n\
		#drawTools-menu-palette div{width:40px;height:40px;border:2px solid #252525;margin=0;padding=0;line-height:2.428571429;}\n\
		#drawTools-menu-palette div:focus{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;}\n\
		#drawTools-menu-palette div:hover,#drawTools-menu-palette div:focus,#drawTools-menu-palette div:active{border:2px solid red;}\n\
		\n\
		#drawTools-menu-palette1{width:240px;height:100%;position:relative;margin:0;}\n\
		#drawTools-menu-palette1 label{width:40px;height:40px;float:left;overflow:hidden;display:inline-block;margin:0;padding=0;}\n\
		#drawTools-menu-palette1 input{display:none;visibility:hidden;margin:0px;padding:0px;}\n\
		#drawTools-menu-palette1 input:checked + div{border:2px solid #c2c2c2;}\n\
		#drawTools-menu-palette1 div{width:40px;height:40px;border:2px solid #252525;margin=0;padding=0;line-height:2.428571429;}\n\
		#drawTools-menu-palette1 div:focus{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;}\n\
		#drawTools-menu-palette1 div:hover,#drawTools-menu-palette1 div:focus,#drawTools-menu-palette1 div:active{border:2px solid red;}\n\
		\n\
		#drawTools-menu-palette div{font-size:14px;font-weight:normal;text-align:center;vertical-align:middle;cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}\n\
		/* REMOVED FROM LINE ABOVE, READD IF IT CAUSES BUG: .drawTools-buttonText,*/\n\
		";
	document.body.appendChild(DTSheet);
}
  /*-----------------------------------------------------------------------------*/
 /*------------------------------- Event Handlers ------------------------------*/
/*-----------------------------------------------------------------------------*/
cleanTools.eventHandlers["mouseDown"] = function(e) {
	var c = cleanTools;
	var t = c.tools;
	
	if($(c.html.MENU_PALETTE_ID).css('opacity') == 1){
		painting = !1;
		c.canvas.restore();
		c.html.toggleMenu(c.html.MENU_PALETTE_ID);
		return;
	} else if(t.currentToolType === t.toolType.BRUSH)
		return;
	t.toolActive = true;
	c.canvas.updateLocation();
	
	// Translate mouse location to point relative to canvas
	c.mouseX = e.pageX-c.canvas.offset.left;
	c.mouseY = e.pageY-c.canvas.offset.top;
	
	if(t.currentToolType === t.toolType.FILL) {
		painting = !1;
		t.paintMethods.floodFill(c.context,c.mouseX,c.mouseY);
	} else if(t.currentToolType === t.toolType.LINE) {
		painting = !1;
		t.points.push(c.mouseX,c.mouseY);
	} else if(t.currentToolType === t.toolType.LINECHAIN) {
		painting = !1;
	} else if(t.currentToolType === t.toolType.CURVE) {
		painting = !1;
	} else if(t.currentToolType === t.toolType.RECT) {
		painting = !1;
		t.points.push(c.mouseX,c.mouseY);
	} else if(t.currentToolType === t.toolType.ELLIPSE) {
		painting = !1;
		t.points.push(c.mouseX,c.mouseY);
	} 
}

cleanTools.eventHandlers["mouseMove"] = function(e) {
	var c = cleanTools;
	var t = c.tools;
/*	if(cleanTools.canvas.isWithinBounds(e.pageX-cleanTools.canvas.offset.left,e.pageY-cleanTools.canvas.offset.top)) {
		var p = cleanTools.context.getImageData(e.pageX-cleanTools.canvas.offset.left, e.pageY-cleanTools.canvas.offset.top, 1, 1).data;
		outputDebug("[r:" +p[0] + ", g:" + p[1] + ", b:" + p[2] + ", a:" + p[3] + "]");
	} else {
		outputDebug("Out of bounds.")
	}
	*/
	if(t.currentToolType === t.toolType.BRUSH)
		return;	// default behaviors
	else if(!t.toolActive)
		return;	// If no tool is in use, ignore event
	
	// Translate mouse location to point relative to canvas
	c.mouseX = e.pageX-c.canvas.offset.left;
	c.mouseY = e.pageY-c.canvas.offset.top;
	var endPointX = c.mouseX;
	var endPointY = c.mouseY;
	
	if(t.currentToolType === t.toolType.FILL) {
		// Do nothing
	} else if(t.currentToolType === t.toolType.LINE) {
		if(c.shiftDown) {
			var a = t.lineShiftHold(t.points[0],t.points[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.canvas.restore();
		t.paintMethods.drawLine(c.context,t.points[0],t.points[1],endPointX,endPointY);
	} else if(t.currentToolType === t.toolType.LINECHAIN) {
		if(t.points.length > 0) {
			if(c.shiftDown) {
				var a = t.lineShiftHold(t.points[t.points.length-2],t.points[t.points.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
			}
			var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
			c.canvas.restore();
			t.paintMethods.drawLineChain(c.context,t.points.concat(endPointX,endPointY),true,c.data.lineToolsShouldClose,fillColor);
		}
	} else if(t.currentToolType === t.toolType.CURVE) {
		if(t.points.length > 0) {
			var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
			c.canvas.restore();
			t.paintMethods.drawSpline(c.context,t.points.concat(c.mouseX,c.mouseY),0.5,c.data.lineToolsShouldClose,fillColor,true);
		}
	} else if(t.currentToolType === t.toolType.RECT) {
		var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
		if(c.shiftDown) {
			var a = t.squareShiftHold(t.points[0],t.points[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.canvas.restore();
		t.paintMethods.drawRect(c.context,t.points.concat(endPointX,endPointY),fillColor);
	} else if(t.currentToolType === t.toolType.ELLIPSE) {
		var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
		if(c.shiftDown) {
			var a = t.squareShiftHold(t.points[0],t.points[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.canvas.restore();
		t.paintMethods.drawEllipse(c.context,t.points.concat(endPointX,endPointY),fillColor);
	}
}

cleanTools.eventHandlers["mouseUp"] = function(e) {
	var c = cleanTools;
	var t = c.tools;
	
	if(0 && $(c.html.MENU_PALETTE_ID).css('opacity') == 1){
		c.canvas.updateLocation();
		if(!c.html.isWithinMenuBounds(c.html.MENU_PALETTE_ID, e.pageX, e.pageY)) {
			c.html.toggleMenu(c.html.MENU_PALETTE_ID);
		}
		return;
	} else if(t.currentToolType === t.toolType.BRUSH)
		return;
	else if(!t.toolActive)	// If no tool is in use, ignore event
		return;
		
	// Translate mouse location to point relative to canvas
	c.mouseX = e.pageX-c.canvas.offset.left;
	c.mouseY = e.pageY-c.canvas.offset.top;
	var endPointX = c.mouseX;
	var endPointY = c.mouseY;
	
	if(t.currentToolType === t.toolType.FILL) {
		t.reset(true);
	} else if(t.currentToolType === t.toolType.LINE) {
		if(c.shiftDown) {
			var a = t.lineShiftHold(t.points[0],t.points[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.canvas.restore();
		t.paintMethods.drawLine(c.context,t.points[0],t.points[1], endPointX, endPointY);
		t.reset(true);
	} else if(t.currentToolType === t.toolType.LINECHAIN) {
		if(c.canvas.isWithinDrawingBounds(c.mouseX,c.mouseY)){
			if(c.shiftDown) {
				var a = t.lineShiftHold(t.points[t.points.length-2],t.points[t.points.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
			}
			t.points.push(endPointX,endPointY);
			if(e.which == 3) {	// If right mouse click, finish the chain
				var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
				c.canvas.restore();
				t.paintMethods.drawLineChain(c.context,t.points,false,c.data.lineToolsShouldClose,fillColor);
				t.reset(true);
			}
		} else { // If user clicks out of acceptable boundaries, cancel all tool progress
			c.canvas.restore();
			t.reset();
		}
	} else if(t.currentToolType === t.toolType.CURVE) {
		if(c.canvas.isWithinDrawingBounds(c.mouseX,c.mouseY)){
			t.points.push(c.mouseX,c.mouseY);
			if(e.which == 3) {	// If right mouse click, finish the curve
				var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
				c.canvas.restore();
				t.paintMethods.drawSpline(c.context,t.points,0.5,c.data.lineToolsShouldClose,fillColor,false);
				t.reset(true);
			}
		} else { // If user clicks out of acceptable boundaries, cancel all tool progress
			c.canvas.restore();
			t.reset();
		}
	} else if(t.currentToolType === t.toolType.RECT) {
		var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
		if(c.shiftDown) {
			var a = t.squareShiftHold(t.points[0],t.points[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.canvas.restore();
		t.points.push(endPointX,endPointY);
		t.paintMethods.drawRect(c.context,t.points,fillColor);
		t.reset(true);
	} else if(t.currentToolType === t.toolType.ELLIPSE) {
		var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
		if(c.shiftDown) {
			var a = t.squareShiftHold(t.points[0],t.points[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
		}
		c.canvas.restore();
		t.points.push(endPointX,endPointY);
		t.paintMethods.drawEllipse(c.context,t.points,fillColor);
		t.reset(true);
	}
}
cleanTools.eventHandlers["keyDown"] = function(e) {
	var c = cleanTools;
	var t = c.tools;
	if(e.keyCode == 16 ) { // If shift is pressed
		c.shiftDown = 1;
		var endPointX = c.mouseX;
		var endPointY = c.mouseY;
		
		if(!t.toolActive)
			return;
		else if( t.currentToolType === t.toolType.RECT || t.currentToolType === t.toolType.ELLIPSE ) {
			var a = t.squareShiftHold(t.points[0],t.points[1],endPointX,endPointY);
			endPointX = a.x;
			endPointY = a.y;
			
			c.canvas.restore();
			var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
			if(t.currentToolType === t.toolType.RECT)
				t.paintMethods.drawRect(c.context,t.points.concat(endPointX,endPointY),fillColor);
			else
				t.paintMethods.drawEllipse(c.context,t.points.concat(endPointX,endPointY),fillColor);
		} else if( t.currentToolType === t.toolType.LINE || t.currentToolType === t.toolType.LINECHAIN ) {
			if(t.points.length > 0) {
				var a = t.lineShiftHold(t.points[t.points.length-2],t.points[t.points.length-1],endPointX,endPointY);
				endPointX = a.x;
				endPointY = a.y;
				
				c.canvas.restore();
				if( t.currentToolType === t.toolType.LINECHAIN ) {
					var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
					t.paintMethods.drawLineChain(c.context,t.points.concat(endPointX,endPointY),true,c.data.lineToolsShouldClose,fillColor);
				} else {
					t.paintMethods.drawLine(c.context,t.points[0],t.points[1],endPointX,endPointY);
				}
			}
		}
	} else if(e.keyCode == "Q".charCodeAt(0)) {
		if(t.currentToolType === t.toolType.LINECHAIN || t.currentToolType === t.toolType.CURVE) {
			if(t.points.length) {
				t.points.length -= 2;
				c.canvas.restore();
				if(t.points.length == 0) {
					t.reset();
				} else {
					var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
					if(t.currentToolType === t.toolType.LINECHAIN)
						t.paintMethods.drawLineChain(c.context,t.points.concat(c.mouseX,c.mouseY),true,c.data.lineToolsShouldClose,fillColor);
					else
						t.paintMethods.drawSpline(c.context,t.points.concat(c.mouseX,c.mouseY),0.5,c.data.lineToolsShouldClose,fillColor,true);
				}
			}
		}
	} else {
		//alert('Keycode for that key is: ' + e.keyCode);
	}
}
cleanTools.eventHandlers["keyUp"] = function(e) {
	var c = cleanTools;
	var t = c.tools;
	if(e.keyCode == 16) { // If shift is released
		c.shiftDown = 0;
		var endPointX = c.mouseX;
		var endPointY = c.mouseY;
		
		if(!t.toolActive)
			return;
			
		if( t.currentToolType === t.toolType.RECT || t.currentToolType === t.toolType.ELLIPSE ){
			c.canvas.restore();
			var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
			if(t.currentToolType === t.toolType.RECT)
				t.paintMethods.drawRect(c.context,t.points.concat(endPointX,endPointY),fillColor);
			else
				t.paintMethods.drawEllipse(c.context,t.points.concat(endPointX,endPointY),fillColor);
		} else if( t.currentToolType === t.toolType.LINE || t.currentToolType === t.toolType.LINECHAIN ) {
			if(t.points.length > 0) {
				c.canvas.restore();
				if( t.currentToolType === t.toolType.LINECHAIN ) {
					var fillColor = (c.data.useStrokeAsFill) ? c.context.strokeStyle : c.data.fillColor;
					t.paintMethods.drawLineChain(c.context,t.points.concat(endPointX,endPointY),true,c.data.lineToolsShouldClose,fillColor);
				} else {
					t.paintMethods.drawLine(c.context,t.points[0],t.points[1],endPointX,endPointY);
				}
			}
		}
	}
}

cleanTools.tools.paintMethods["download"] = function()
{
    var dt = drawApp.toDataURL('image/png');
	window.open(dt);
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

cleanTools.html.init['createMenuPalette'] = function(drawToolsDiv, optionsButton)
{
	//Create DIV in which menu items will be placed in
	var optionsDiv = document.createElement('div');
	optionsDiv.className = cleanTools.id + '-menu';
	optionsDiv.id = optionsDiv.className + '-palette-parent';
	optionsDiv.innerHTML = 
		'<div id="' + optionsDiv.className + '-content">' +
			'<div id="' + optionsDiv.className + '-palette"></div>' +
		'</div>';
	//drawToolsDiv.appendChild(optionsDiv);
	
	//drawToolsDiv.insertBefore(optionsDiv, optionsButton.nextSibling);
	optionsButton.appendChild(optionsDiv);

	//----- BEGIN ----- ColorPicker --------------------------------------------------
	var colorElements = document.getElementsByClassName('colorPicker');
	var paletteHtml = "";
	
	paletteHtml += 
		'<label onclick=cleanTools.html.buttonHandlers.setOptionsColor(""); style="width:120px;">' +
			'<input type="radio" name="drawTools-menu-palette-radio" checked>' +
			'<div style="width:120px;background:#333333;color:#c2c2c2;">No Fill</div>' +
		'</label>';
	paletteHtml += 
		'<label onclick=cleanTools.html.buttonHandlers.setOptionsColor("",1); style="width:120px;">' +
			'<input type="radio" name="drawTools-menu-palette-radio">' +
			'<div style="width:120px;background:#333333;color:#c2c2c2;">Brush Color</div>' +
		'</label>';
	
	for(var i=0;i<colorElements.length;i++) {
		var color = colorElements[i].getAttribute("data-color");
		cleanTools.dcPalette.push(color);
		paletteHtml += 
			'<label onclick=cleanTools.html.buttonHandlers.setOptionsColor("' + color + '");>' + //
				'<input type="radio" name="drawTools-menu-palette-radio">' +
				'<div style="background:' + color + ';"></div>' +
			'</label>';
	}
	document.getElementById('drawTools-menu-palette').innerHTML = paletteHtml;
}
// Destroys all elements, styling and javascript
cleanTools.html['DTDestroy'] = function() 
{
	// 1. Destroy HTML
	document.getElementById(cleanTools.id).remove();
	// 2. Destroy CSS
	document.getElementById(cleanTools.id + 'StyleSheet').remove();
	// 3. Remove listeners
	$(document).off('mousedown');
	$(document).off('mousemove');
	$(document).off('mouseup');
	// 4. Set the state variable to reflect DTTools uninstallation
	window.DTToolsIsCurrentlyInstalled = false;
	// 5. Destroy JavaScript
	delete cleanTools.canvas; // Delete all references to cleanTools
	delete cleanTools.html;
	delete cleanTools;
	document.getElementById('DTScript').remove();
}
cleanTools.html.init['setupCssAndHtml'] = function()
{	
    var c = cleanTools;

	c.canvas.updateLocation();
	/*---- 1. Create Draw Tools Container - DIV in which DrawTools will be placed in ----*/
	var drawToolsDiv = document.createElement('div');
	drawToolsDiv.id = c.id;
	c.dcToolbar.appendChild(drawToolsDiv);
	
	/*---- 2. Setup necessary CSS for DrawTools ----*/
	c.html.init.setupCSS();
	
	/*---- 3. Make Necessary Modifications to Existing Elements ----*/
	document.getElementById(c.dcBrushes[0].id).parentNode.onclick = function(){c.html.buttonHandlers.brushClick(c.dcBrushes[0].size);};
	document.getElementById(c.dcBrushes[1].id).parentNode.onclick = function(){c.html.buttonHandlers.brushClick(c.dcBrushes[1].size);};
	document.getElementById(c.dcBrushes[2].id).parentNode.onclick = function(){c.html.buttonHandlers.brushClick(c.dcBrushes[2].size);};
	document.getElementById(c.dcBrushes[3].id).parentNode.onclick = function(){c.html.buttonHandlers.brushClick(c.dcBrushes[3].size);};
	/*	// TODO:Figure this out. This doesn't work for some reason, so i hardcoded it.
	for(var j=0;j<c.dcBrushes.length;j++)
		document.getElementById(c.dcBrushes[j].id).parentNode.onclick = function(){selectBrushAUX(c.dcBrushes[j].size);};
	*/
	
	/*---- 4. Create Draw Tools Elements and Interface ----*/
	// Create Tool Buttons
	c.html.init.createToolButton(c.tools.toolType.FILL,"fill");
	c.html.init.createToolButton(c.tools.toolType.LINE,"line");
	c.html.init.createToolButton(c.tools.toolType.LINECHAIN,"linechain");
	c.html.init.createToolButton(c.tools.toolType.CURVE,"curve");
	c.html.init.createToolButton(c.tools.toolType.RECT,"rect");
	c.html.init.createToolButton(c.tools.toolType.ELLIPSE,"ellipse");
	
	debugLabel = c.html.init.createToolButtonWithLabel(c.tools.toolType.UTIL,"label", '0');
	
	var loopButton = c.html.init.createUtilityButton("loop");
	loopButton.onclick = function(){cleanTools.html.buttonHandlers.setLineToolsOpen();};
	loopButton.innerHTML = 
		'<div class="' + c.id + '-btn-container">' +
			'<input type="checkbox" id="drawTools-menu-loop-checkbox">' +
			'<div id="' + c.id + '-btn-icon-' + 'loop' + '"></div>' +
		'</div>';
	
	/*
	var optionsButton = c.html.init.createUtilityButton("menu");
	optionsButton.onclick = function(){cleanTools.html.toggleMenu(cleanTools.html.MENU_PALETTE_ID);};
	*/
	var fillpaletteButton = c.html.init.createUtilityButton("fillpalette");
	fillpaletteButton.onclick = function(){cleanTools.html.toggleMenu(cleanTools.html.MENU_PALETTE_ID);};
	
	c.html.init.createMenuPalette(drawToolsDiv, fillpaletteButton);
	
	var downloadButton = c.html.init.createUtilityButton("download");
	downloadButton.onclick = function(){cleanTools.tools.paintMethods.download();};
	
	// Exitbutton to remove DrawTools
	var exitButton = c.html.init.createUtilityButton("exit");
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
