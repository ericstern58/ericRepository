//---- START -----------GIANT try catch
try{
	
// Setup Constants
var DRAW_TOOLS_ID = 'drawTools';
var DRAWCEPTION_TOOLBAR = document.getElementById('redo-button').parentNode.parentNode;
var DTBrushes = [{id: 'brush-2', size: 2},{id: 'brush-5', size: 5},{id: 'brush-12', size: 12},
	{id: 'brush-35', size: 35}];

// Setup Some Global Variables
window.DTToolsIsCurrentlyInstalled = true;	// State variable that helps prevent double installation of script
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
function RGBColor(r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.equals = function(color) {
		return (this.r===color.r && this.g===color.g && this.b===color.b);
	}
}
// Tool type enum
var toolType={BRUSH:0,FILL:1,LINE:2,RECT:3,ELLIPSE:4,POLY:5,UTIL:99};

  /*-----------------------------------------------------------------------------*/
 /*----------------------------------- Main ------------------------------------*/
/*-----------------------------------------------------------------------------*/

// Setup Some State Variables
var currentToolType = toolType.BRUSH;
var toolInUse = false;

var canvasOffset;
var canvasWidth;
var canvasHeight;
updateCanvasStateVariables();

// Setup Debug Stuff
var debugLabel; //Go to createDrawToolsElements to find assignment
function outputDebug(outputString){
	debugLabel.getElementsByTagName('div')[0].innerHTML = outputString;
}

// Setup tool state/event variables
var DTPoints = new Array();	// Will contain user input point sets for shapes/lines/etc

createDrawToolsContainer();	// Create Draw Tools Container
setupCSS();					// Setup necessary CSS for DrawTools
modifyExistingElements();	// Make Necessary Modifications to Existing Elements
createDrawToolsElements();	// Create Draw Tools Elements and Interface

/*---------------------- Setup Listeners ----------------------*/

// Setup Mousedown Listener
drawApp.canvas.off('mousedown');
drawApp.canvas.on('mousedown', function(e){
	if(currentToolType == toolType.BRUSH)
		return;//drawApp.onCanvasMouseDown(e);	// default behaviors
	toolInUse = true;
	updateCanvasStateVariables();
	
	if(currentToolType == toolType.FILL) {
		painting = !1;
		try{
			floodFill(e);
			}catch(err){alert(err);}
	} else if(currentToolType == toolType.LINE) {
		painting = !1;
		DTPoints[0] = {x: e.pageX-canvasOffset.left, y: e.pageY-canvasOffset.top}
	} else if(currentToolType == toolType.RECT) {
		painting = !1;
		DTPoints[0] = {x: e.pageX-canvasOffset.left, y: e.pageY-canvasOffset.top}
	} else if(currentToolType == toolType.ELLIPSE) {
		painting = !1;
		DTPoints[0] = {x: e.pageX-canvasOffset.left, y: e.pageY-canvasOffset.top}
	} else if(currentToolType == toolType.POLY) {
		painting = !1;
	} else if(currentToolType == toolType.UTIL) {
		// Do Nothing
	} 
});
// Setup Mousemove Listener
$(document).off('mousemove');
$(document).on('mousemove', function(e){
 	//outputDebug( (e.pageX-canvasOffset.left) + ', ' + (e.pageY-canvasOffset.top));
 	if(currentToolType == toolType.BRUSH)
		return;	// default behaviors
	else if(!toolInUse)
		return;	// If no tool is in use, ignore event
	
	if(currentToolType == toolType.FILL) {
		// Do nothing
	} else if(currentToolType == toolType.LINE) {
		restoreCanvas();
		drawLine(DTPoints[0].x,DTPoints[0].y,(e.pageX-canvasOffset.left),(e.pageY-canvasOffset.top));
	} else if(currentToolType == toolType.RECT) {
		restoreCanvas();
		drawRect(DTPoints[0].x,DTPoints[0].y,(e.pageX-canvasOffset.left),(e.pageY-canvasOffset.top));
	} else if(currentToolType == toolType.ELLIPSE) {
		restoreCanvas();
		drawEllipse(DTPoints[0].x,DTPoints[0].y,(e.pageX-canvasOffset.left),(e.pageY-canvasOffset.top));
	} else if(currentToolType == toolType.POLY) {
		//imgTest();
	} else{ //Else tool type is unknown, do nothing
		alert('toolType not identified');
	}
});
// Setup Mouseup Listener
$(document).off('mouseup');
$(document).on('mouseup', function(e){
	if(currentToolType == toolType.BRUSH)
		return;
	else if(!toolInUse)	// If no tool is in use, ignore event
		return;
	
	if(currentToolType == toolType.FILL) {
		// Do nothing
	} else if(currentToolType == toolType.LINE) {
		restoreCanvas();
		drawLine(DTPoints[0].x,DTPoints[0].y,(e.pageX-canvasOffset.left),(e.pageY-canvasOffset.top));
	} else if(currentToolType == toolType.RECT) {
		restoreCanvas();
		drawRect(DTPoints[0].x,DTPoints[0].y,(e.pageX-canvasOffset.left),(e.pageY-canvasOffset.top));
	} else if(currentToolType == toolType.ELLIPSE) {
		restoreCanvas();
		drawEllipse(DTPoints[0].x,DTPoints[0].y,(e.pageX-canvasOffset.left),(e.pageY-canvasOffset.top));
	} else if(currentToolType == toolType.POLY) {
		//imgTest();
	} else{ //Else tool type is unknown, do nothing
		alert('toolType not identified');
	}
	DTPoints.length = 0;
	toolInUse = false;
	save();
});

  /*-----------------------------------------------------------------------------*/
 /*------------------------------ Button Methods -------------------------------*/
/*-----------------------------------------------------------------------------*/

function drawLine(startX,startY,finishX,finishY){
	context.beginPath();
	context.moveTo( startX, startY );
	context.lineTo( finishX, finishY);
	context.stroke();
}
function drawRect(startX,startY,finishX,finishY){
	context.beginPath();
	context.moveTo( startX, startY );
	context.lineTo( finishX, startY );
	context.moveTo( finishX, startY );
	context.lineTo( finishX, finishY );
	context.moveTo( finishX, finishY );
	context.lineTo( startX, finishY );
	context.moveTo( startX, finishY );
	context.lineTo( startX, startY );
	context.stroke(); 
	/*
	DTPoints[0] = {x: startX, y: startY};
	DTPoints[1] = {x: finishX, y: startY};
	DTPoints[2] = {x: startX, y: finishY};
	DTPoints[3] = {x: startX, y: finishY};
	drawPolygon(DTPoints);*/
}
function drawPolygon(points){
	context.beginPath();
	context.moveTo( startX, startY );
	for(var i=1;i<points.length;i++) {
		context.lineTo( points[i].x, points[i].y );
		context.moveTo( points[i].x, points[i].y );
	}
	context.lineTo( startX, startY );
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
		var outerEdgeQueue = [new Point(xinitial,yinitial)];
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
		return (point.x>=0 && point.y>=0 && point.x<canvasWidth && point.y<canvasHeight)
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
function updateCanvasStateVariables() {
	canvasOffset = $('#drawingCanvas').offset();	// Update canvas offset variable
	canvasWidth = drawApp.canvas.width();			// Update canvas width variable
	canvasHeight = drawApp.canvas.height(); 		// Update canvas width variable
}

function restoreCanvas() {
	context.constructor.prototype.putImageData.call(context, restorePoints[restorePosition], 0, 0);
}
  /*-----------------------------------------------------------------------------*/
 /*----------------------------- CSS Style Sheets ------------------------------*/
/*-----------------------------------------------------------------------------*/

function setupCSS()
{
	// Calculate variables used in css
	var optionsMarginTop = $("#drawTools").offset().top - canvasOffset.top + canvasHeight;
	alert("optionsmargintop: " + optionsMarginTop + "--");
	//outputDebug(optionsMarginTop);
	
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
		\n\
		.drawTools-btn-group{position:relative;display:inline-block;vertical-align:middle;}\n\
		.drawTools-btn-group>.drawTools-btn{position:relative;float:left;display:inline-block;}\n\
		\n\
		.drawTools-btn-group>.drawTools-btn:not(:first-child):not(:last-child):not(.dropdown-toggle){border-radius:0}\n\
		.drawTools-btn-group>.drawTools-btn:first-child{margin-left:0;}\n\
		.drawTools-btn-group>.drawTools-btn:first-child:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius: 0;border-top-right-radius: 0;}\n\
		.drawTools-btn-group>.drawTools-btn:last-child:not(:first-child),.drawTools-btn-group>.dropdown-toggle:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0;}\n\
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
		#drawTools-options{margin-top:-46px;background:#252525;border-bottom:1px solid #171717;width:300px;height:0px;position:absolute;border-radius:2px;opacity:0;overflow:hidden;-webkit-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);box-shadow:0px 0px 5px 0px rgba(0,0,0,0.75);}\n\
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
	drawToolsDiv.className = 'drawTools-btn-group';
	DRAWCEPTION_TOOLBAR.appendChild(drawToolsDiv);
}

function createDrawToolsElements() 
{
	var drawToolsDiv = document.getElementById(DRAW_TOOLS_ID);
	
	// Create Tool Buttons
	createToolButton(toolType.FILL,"fill");
	createToolButton(toolType.LINE,"line");
	createToolButton(toolType.RECT,"rect");
	createToolButton(toolType.ELLIPSE,"ellipse");
	createToolButton(toolType.POLY,"poly");
	
	debugLabel = createToolButtonWithLabel(toolType.UTIL,"label", '0');
	
	var optionsButton = createUtilityButton("options");
	optionsButton.onclick = function(){toggleOptions();};//nothing yet};
	
	//Create DIV in which Options will be placed in
	var optionsDiv = document.createElement('div');
	optionsDiv.id = 'drawTools-options';
	drawToolsDiv.appendChild(optionsDiv);
	
	//Create DIV in which Options Content will be placed in
	var optionsDivContent = document.createElement('div');
	optionsDivContent.id = 'drawTools-options-content';
	optionsDivContent.innerHTML = "<br><br><br><br>HELLO<br>";
	optionsDiv.appendChild(optionsDivContent);
	
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
function toggleOptions() {
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
}

}catch(err){alert(err)};
//----  END  -----------GIANT try catch
