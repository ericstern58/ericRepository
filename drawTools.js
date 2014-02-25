// Setup Constants
var DRAW_TOOLS_ID = 'drawTools';
var DRAWCEPTION_TOOLBAR = document.getElementById('redo-button').parentNode.parentNode;

// Setup Some Global Variables
var context=drawApp.context;
var canvas=context.canvas;

context.putImageData=CanvasRenderingContext2D.prototype.putImageData;
drawApp.canvas.off('mousedown');

  /*-----------------------------------------------------------------------------*/
 /*--------------------- Custom Objects/Structures/enums -----------------------*/
/*-----------------------------------------------------------------------------*/
// Point Object
function Point(x,y) {
	this.x=x;
	this.y=y;
	// Returns wether a point is within canvas bounds
	// w = canvas width, h = canvas height
	this.isWithinBounds = function() {
		return (this.x>=0 && this.y>=0 && this.x<canvas.width && this.y<canvas.height);
	}
}
// Color Object
function RGBColor(r,g,b) {
	this.r=r;
	this.g=g;
	this.b=b;
	this.equals = function(color) {
		return (this.r===color.r && this.g===color.g && this.b===color.b);
	}
}
// Tool type enum
var toolType={BRUSH: 0,FILL: 1,LINE: 2,POLY: 3,TEST: 99};

  /*-----------------------------------------------------------------------------*/
 /*----------------------------------- Main ------------------------------------*/
/*-----------------------------------------------------------------------------*/

// Setup Some State Variables
var currentToolType = toolType.BRUSH;

setupCSS();					// Setup necessary CSS for DrawTools
modifyExistingElements();	// Make Necessary Modifications to Existing Elements
createDrawToolsElements();	// Create Draw Tools Elements and Interface

// Setup Debug Stuff
var debugLabel = createToolButtonWithLabel("label", '0');
function outputDebug(outputString){
	debugLabel.getElementsByTagName('div')[0].innerHTML = outputString;
}

/*---------------------- Setup Listeners ----------------------*/
/*
// Setup Mousemove Listener
var mouse = {x: 0, y: 0};
canvas.addEventListener('mousemove', update, false);
function update(){
	mouse.x = e.pageX;
	mouse.y = e.pageY;
	var tempx=mouse.x-pos.x;
	var tempy=mouse.y-pos.y;
	outputDebug(tempx+','+tempy);
}*/

// Setup Mousedown Listener
drawApp.canvas.on('mousedown',function(e){
	outputDebug(canvas.width + ', ' + canvas.height);
	if(currentToolType == toolType.BRUSH) {
		// default behaviors
		drawApp.onCanvasMouseDown(e);
	} else if(currentToolType == toolType.FILL) {
		try {
			floodFill(e);
		} catch(err) {
			alert(err);
		}
	} else if(currentToolType == toolType.LINE) {
		try{
			//virtualLine(e);
			//makeLine(new Point(100,100),new Point(200,200));
		} catch(err) {
			alert(err);
		}
	} else if(currentToolType == toolType.POLY) {
		//imgTest();
	} else{
		//Else it is unknown, do nothing
		alert('toolType not identified');
	}
});

  /*-----------------------------------------------------------------------------*/
 /*------------------------------ Button Methods -------------------------------*/
/*-----------------------------------------------------------------------------*/
function drawLine(start,finish){
	save();
	context.beginPath();
	context.moveTo(start.x,start.y);
	context.lineTo(finish.x,finish.y);
	context.stroke();
}

function floodFill(e){
	// Save-undo fix avoids issues with brush placing dot over flood fill seed area
	save();
	undo();
	var w = drawApp.canvas.width();
	var h = drawApp.canvas.height();
	var p = drawApp.context.getImageData(0,0,w,h);
	var d = p.data;
	var targetColor = getColorFromCoords(e.offsetX,e.offsetY);
	var c = parseInt(drawApp.context.strokeStyle.substr(1,6),16);
	var fillColor = new RGBColor((c>>16)&255,(c>>8)&255,c&255);
	var redColor = new RGBColor(255,0,0);
	var blueColor = new RGBColor(0,0,255);
	
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
			if( point.isWithinBounds && targetColor.equals(getColorFromPoint(point)) ) {
				colorPixel(point,fillColor);
				queue.push(new Point(x-1,y));
				queue.push(new Point(x+1,y));
				queue.push(new Point(x,y-1));
				queue.push(new Point(x,y+1));
			} else if(point.isWithinBounds && !(fillColor.equals(getColorFromPoint(point)))){
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
			if(point2.isWithinBounds) {
				colorPixelBlend(point2,fillColor,getColorFromCoords(x-1,y));}
			point2 = new Point(x+1,y);
			if(point2.isWithinBounds) {
				colorPixelBlend(point2,fillColor,getColorFromCoords(x+1,y));}
			point2 = new Point(x,y-1));
			if(point2.isWithinBounds) {
				colorPixelBlend(point2,fillColor,getColorFromCoords(x,y-1));}
			point2 = new Point(x,y+1);
			if(point2.isWithinBounds) {
				colorPixelBlend(point2,fillColor,getColorFromCoords(x,y+1));}
		}
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
 /*----------------------------- CSS Style Sheets ------------------------------*/
/*-----------------------------------------------------------------------------*/
//sheet.insertRule("header { float: left; opacity: 0.8; }", 1);

function setupCSS() {
	var sheet = document.createElement('style');
	sheet.innerHTML = "\n\
		/*These drawTools-btn-Icon are css only icons*/\n\
		#drawTools-btn-icon-fill{width:12px;height:12px;margin:7px -7px 1px 9px;background:black;border-bottom-right-radius:2px;border-bottom-left-radius:2px;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-ms-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}\n\
		#drawTools-btn-icon-fill:before{content:'';border-bottom:5px solid black;border-left:8px solid transparent;border-right:8px solid transparent;display:block;position:absolute;top:-6px;left:-6px;}\n\
		#drawTools-btn-icon-line{width:5px;height:15px;margin:3px 5px 2px 4px;background:black;-webkit-transform:skew(-50deg);-moz-transform:skew(-50deg);-o-transform:skew(-50deg);transform:skew(-50deg);}\n\
		#drawTools-btn-icon-poly{width:20px;margin:11px -3px 1px -3px;border-width:8px 4px 0;border-style:solid;border-color:black transparent;}\n\
		#drawTools-btn-icon-poly:before{content:'';display:block;margin:-17px 0px 0px -4px;border-width:0 10px 9px;border-style:solid;border-color:transparent transparent black;}\n\
		\n\
		.drawTools-btn-group{position:relative;display:inline-block;vertical-align:middle;}\n\
		.drawTools-btn-group>.drawTools-btn{position:relative;float:left;display:inline-block;}\n\
		\n\
		.drawTools-btn-group>.drawTools-btn:not(:first-child):not(:last-child):not(.dropdown-toggle){border-radius:0}\n\
		.drawTools-btn-group>.drawTools-btn:first-child{margin-left:0;}\n\
		.drawTools-btn-group>.drawTools-btn:first-child:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius: 0;border-top-right-radius: 0;}\n\
		.drawTools-btn-group>.drawTools-btn:last-child:not(:first-child),.drawTools-btn-group>.dropdown-toggle:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0;}\n\
		\n\
		.drawTools-btn{height:34px;padding:0px;border-radius:2px;margin-top:5px;}\n\
		.drawTools-btn input{display:none;}\n\
		\n\
		.drawTools-btn-container{background-color:#fffb8d;border-bottom:1px solid #e5e17e;height:34px;padding:6px 12px;margin:0px;font-size:14px;font-weight:normal;line-height:1.428571429;text-align:center;vertical-align:middle;cursor:pointer;border-radius:inherit;border-top:1px solid transparent;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;}\n\
		.drawTools-btn-container:focus	{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;outline-offset:-2px;}\n\
		.drawTools-btn-container:hover,.drawTools-btn:focus{background-color:#f6f166;border-bottom:1px solid #ddd85b;color:#333333;text-decoration:none;}\n\
		.drawTools-btn-container:active,.drawTools-btn input:focus + div,.drawTools-btn input:checked + div{background-color:#f6f166;border-bottom:1px solid #f6f166;-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,0.125);box-shadow:inset 0 3px 5px rgba(0,0,0,0.125);}\n\
		.drawTools-btn-container.disabled,.drawTools-btn-container[disabled],fieldset[disabled] .drawTools-btn-container{cursor:not-allowed;pointer-events:none;opacity:0.65;filter:alpha(opacity=65);-webkit-box-shadow:none;box-shadow:none;}\n\
		\n\
		";
	document.body.appendChild(sheet);
}

  /*-----------------------------------------------------------------------------*/
 /*---------------------- Elements Creation/Manipulation -----------------------*/
/*-----------------------------------------------------------------------------*/
function modifyExistingElements() {
	document.getElementById('brush-2').parentNode.onclick = function(){selectBrushAUX(2);};
	document.getElementById('brush-5').parentNode.onclick = function(){selectBrushAUX(5);};
	document.getElementById('brush-12').parentNode.onclick = function(){selectBrushAUX(12);};
	document.getElementById('brush-35').parentNode.onclick = function(){selectBrushAUX(35);};

	function selectBrushAUX(brushSize) {
		// Set its default brushsize and update currentToolType
		drawApp.setSize(brushSize);
		currentToolType = toolType.BRUSH;
		
		// Visually unselect any other tools
		var ele = document.getElementsByName("drawTools-btn-radio");
	   	for(var i=0;i<ele.length;i++)
	      		ele[i].checked = false;
	}
}

function createDrawToolsElements() {
	//Create DIV in which DrawTools will be placed in
	var drawToolsDiv = document.createElement('div');
	drawToolsDiv.id = DRAW_TOOLS_ID;
	drawToolsDiv.className = 'drawTools-btn-group';
	DRAWCEPTION_TOOLBAR.appendChild(drawToolsDiv);
	
	// Create Tool Buttons
	createToolButton(toolType.FILL, "fill");
	createToolButton(toolType.LINE, "line");
	createToolButton(toolType.POLY, "poly");
	createToolButtonWithLabel(toolType.TEST, "test", "Test");
}

//Creates Tool Buttons (wit a label)
function createToolButtonWithLabel(type, name, label){
	var button = createToolButton(type, name);
	
	//Place element inside it( text )
	button.getElementsByTagName('div')[0].innerHTML = label;
	
	return button;
}
//Creates Tool Buttons (no innerHTML)
function createToolButton(type, name){
	//create button
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = 'tool-' + name;
	button.className = 'drawTools-btn';
	button.onclick = function(){currentToolType=type;};//drawApp.setSize(0);selectTool(this)
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
