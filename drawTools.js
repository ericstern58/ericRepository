// Setup Some State Variables
var toolType = {
    BRUSH: 0,
    FILL: 1,
    LINE: 2,
    POLY: 3,
    TEST: 99
};
var currentToolType = toolType.BRUSH;

// Setup necessary CSS
setupCSS();

// Make Necessary Modifications to Existing Elements
modifyExistingElements();

//Create DIV in which DrawTools will be placed in
var drawToolsDiv = document.createElement('div');
drawToolsDiv.id = 'drawTools';
drawToolsDiv.className = 'btnTool-group';
document.getElementById('redo-button').parentNode.parentNode.appendChild(drawToolsDiv);

// Create Tool Button Array
var toolButtons = new Array();

// Create Tool Buttons
toolButtons.push(createToolButton(toolType.FILL, "fill"));
toolButtons.push(createToolButton(toolType.LINE, "line"));
toolButtons.push(createToolButton(toolType.POLY, "poly"));
toolButtons.push(createToolButtonWithLabel(toolType.TEST, "test", "Test"));

// Setup Canvas Tools
var context=drawApp.context;
var canvas=context.canvas;

// Mouse Listening
// Debug mouse coords text label
var mouseCoordsLabel = createToolButtonWithLabel("label", '0');
toolButtons.push(mouseCoordsLabel);
/*
var mouse = {x: 0, y: 0};
canvas.addEventListener('mousemove', update, false);
function update(){
	mouse.x = e.pageX;
	mouse.y = e.pageY;
	var tempx=mouse.x-pos.x;
	var tempy=mouse.y-pos.y;
	mouseCoordsLabel.innerHTML=tempx+','+tempy;
}*/

drawApp.context.putImageData=CanvasRenderingContext2D.prototype.putImageData;
drawApp.canvas.off('mousedown');

//Setup Listener
drawApp.canvas.on('mousedown',function(e){
	//mouseCoordsLabel.getElementsByTagName('div')[0].innerHTML = context.lineWidth;
	mouseCoordsLabel.getElementsByTagName('div')[0].innerHTML = currentToolType;
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

/*--------------------- Button Methods ----------------------*/
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
	var w = drawApp.canvas.width;
	var h = drawApp.canvas.height;
	var p = drawApp.context.getImageData(0,0,w,h);
	var d = p.data;
	var targetColor = new RGBColor(d[4*w*e.offsetY+4*e.offsetX],d[4*w*e.offsetY+4*e.offsetX+1],d[4*w*e.offsetY+4*e.offsetX+2]);
	var c = parseInt(drawApp.context.strokeStyle.substr(1,6),16);
	var fillColor = new RGBColor((c>>16)&255,(c>>8)&255,c&255);
	

	if(!targetColor.equals(fillColor))
		f(e.offsetX,e.offsetY);

	context.putImageData(p,0,0);
	function f(xinitial,yinitial){
		var queue = [new Point(xinitial,yinitial)];
		var x = 0;
		var y = 0;
		while(queue.length>0) {
			var point=queue.shift();
			x=point.x;
			y=point.y;
			if(x>=0 && y>=0 && x<w && y<h && targetColor.equals(new RGBColor(d[4*w*y+4*x],d[4*w*y+4*x+1],d[4*w*y+4*x+2])) ) {
				colorPixel(d,w,point,fillColor)
				queue.push(new Point(x-1,y));
				queue.push(new Point(x+1,y));
				queue.push(new Point(x,y-1));
				queue.push(new Point(x,y+1));
			} else if(x>=0 && y>=0 && x<w && y<h){
				//colorPixel(d,w,point,fillColor)
				/*
				colorPixelBlend(d,w,x-1,y,fillColor,new RGBColor(d[4*w*y+4*(x-1)],d[4*w*y+4*(x-1)+1],d[4*w*y+4*(x-1)+2]));
				colorPixelBlend(d,w,x+1,y,fillColor,new RGBColor(d[4*w*y+4*(x+1)],d[4*w*y+4*(x+1)+1],d[4*w*y+4*(x+1)+2]));
				colorPixelBlend(d,w,x,y-1,fillColor,new RGBColor(d[4*w*(y-1)+4*x],d[4*w*(y-1)+4*x+1],d[4*w*(y-1)+4*x+2]));
				colorPixelBlend(d,w,x,y+1,fillColor,new RGBColor(d[4*w*(y+1)+4*x],d[4*w*(y+1)+4*x+1],d[4*w*(y+1)+4*x+2]));
				*/
			}
		}
	}
}


/*---------------------- Color Methods ----------------------*/
//Colors a pixel with a given color
function colorPixel(d,w,point,color){
	d[4*w*point.y+4*point.x]=color.r;
	d[4*w*point.y+4*point.x+1]=color.g;
	d[4*w*point.y+4*point.x+2]=color.b;
	d[4*w+point.y+4*point.x+3]=255;
}
//Colors a pixel with a blend of 2 colors (helpful for assimilating anti-aliasing)
function colorPixelBlend(d,w,point,color1,color2){
	var r=Math.ceil(0.5*color1.r + 0.5*r2);
	var g=Math.ceil(0.5*color1.g + 0.5*g2);
	var b=Math.ceil(0.5*color1.b + 0.5*b2);
	colorPixel(d,w,point,new Color(r,g,b));
}

/*---------------------- Custom Objects ----------------------*/
//Point Object
function Point(x,y) {
	this.x=x;
	this.y=y;
}
//Color Object
function RGBColor(r,g,b) {
	this.r=r;
	this.g=g;
	this.b=b;
	this.equals = function(color) {
		return (this.r===color.r && this.g===color.g && this.b===color.b);
	}
}

/*--------------------- Element Creation/Manipulation ---------------------*/
//Creates Tool Buttons (without icon)
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
	button.className = 'btnTool';
	button.onclick = function(){currentToolType=type;};//drawApp.setSize(0);selectTool(this)
	drawToolsDiv.appendChild(button);
		
	
	//Now create input tag: <input type="radio" name="options" id="brush-35"> 
	var radio = document.createElement('input');
	radio.id = 'tool-radio-' + name;
	radio.setAttribute("type","radio");
	radio.setAttribute("name","drawToolRadio");
	button.appendChild(radio);

	//Create container div
	var container = document.createElement('div');
	container.className = 'btnToolContainer';
	button.appendChild(container);
	
	// Create icon div
	var icon = document.createElement('div');
	icon.id = 'btnToolIcon-' + name;
	container.appendChild(icon);
	
	return button;
}

/*--------------------- CSS Style Sheets ---------------------*/
//sheet.insertRule("header { float: left; opacity: 0.8; }", 1);

function setupCSS() {
	var sheet = document.createElement('style');
	sheet.innerHTML = "\n\
		\n\
		#btnToolIcon-fill{width:12px;height:12px;margin:7px -7px 1px 9px;background:black;border-bottom-right-radius:2px;border-bottom-left-radius:2px;-webkit-transform:rotate(-40deg);-moz-transform:rotate(-40deg);-ms-transform:rotate(-40deg);-o-transform:rotate(-40deg);transform:rotate(-40deg);-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;-o-transform-origin:0 100%;transform-origin:0 100%;}\n\
		#btnToolIcon-fill:before{content:'';border-bottom:5px solid black;border-left:8px solid transparent;border-right:8px solid transparent;display:block;position:absolute;top:-6px;left:-6px;}\n\
		#btnToolIcon-line{width:5px;height:15px;margin:3px 5px 2px 4px;background:black;-webkit-transform:skew(-50deg);-moz-transform:skew(-50deg);-o-transform:skew(-50deg);transform:skew(-50deg);}\n\
		#btnToolIcon-poly{width:20px;margin:11px -3px 1px -3px;border-width:8px 4px 0;border-style:solid;border-color:black transparent;}\n\
		#btnToolIcon-poly:before{content:'';display:block;margin:-17px 0px 0px -4px;border-width:0 10px 9px;border-style:solid;border-color:transparent transparent black;}\n\
		\n\
		.btnTool-group{position:relative;display:inline-block;vertical-align:middle;}\n\
		.btnTool-group>.btnTool{position:relative;float:left;display:inline-block;}\n\
		\n\
		.btnTool-group>.btnTool:not(:first-child):not(:last-child):not(.dropdown-toggle){border-radius:0}\n\
		.btnTool-group>.btnTool:first-child{margin-left:0;}\n\
		.btnTool-group>.btnTool:first-child:not(:last-child):not(.dropdown-toggle){border-bottom-right-radius: 0;border-top-right-radius: 0;}\n\
		.btnTool-group>.btnTool:last-child:not(:first-child),.btnTool-group>.dropdown-toggle:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0;}\n\
		\n\
		.btnTool{height:34px;padding:0px;border-radius:2px;margin-top:5px;}\n\
		.btnTool input{display:none;}\n\
		\n\
		.btnToolContainer{background-color:#fffb8d;border-bottom:1px solid #e5e17e;height:34px;padding:6px 12px;margin:0px;font-size:14px;font-weight:normal;line-height:1.428571429;text-align:center;vertical-align:middle;cursor:pointer;border-radius:inherit;border-top:1px solid transparent;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;}\n\
		.btnToolContainer:focus	{outline:thin dotted #333;outline:5px auto -webkit-focus-ring-color;outline-offset:-2px;}\n\
		.btnToolContainer:hover,.btnTool:focus{background-color:#f6f166;border-bottom:1px solid #ddd85b;color:#333333;text-decoration:none;}\n\
		.btnToolContainer:active,.btnTool input:focus + div,.btnTool input:checked + div{background-color:#f6f166;border-bottom:1px solid #f6f166;-webkit-box-shadow:inset 0 3px 5px rgba(0,0,0,0.125);box-shadow:inset 0 3px 5px rgba(0,0,0,0.125);}\n\
		.btnToolContainer.disabled,.btnToolContainer[disabled],fieldset[disabled] .btnToolContainer{cursor:not-allowed;pointer-events:none;opacity:0.65;filter:alpha(opacity=65);-webkit-box-shadow:none;box-shadow:none;}\n\
		\n\
		";
	document.body.appendChild(sheet);
}

/*--------------------- Modification of Existing Elements ---------------------*/
function modifyExistingElements() {
	document.getElementById('brush-2').parentNode.onclick = function(){selectBrushAUX(2);};
	document.getElementById('brush-5').parentNode.onclick = function(){selectBrushAUX(5);};
	document.getElementById('brush-12').parentNode.onclick = function(){selectBrushAUX(12);};
	document.getElementById('brush-35').parentNode.onclick = function(){selectBrushAUX(35);};
}
function selectBrushAUX(brushSize) {
	// Set its default brushsize and update currentToolType
	drawApp.setSize(brushSize);
	currentToolType = toolType.BRUSH;
	
	// Visually unselect any other tools
	var ele = document.getElementsByName("drawToolRadio");
   	for(var i=0;i<ele.length;i++)
      		ele[i].checked = false;
}
