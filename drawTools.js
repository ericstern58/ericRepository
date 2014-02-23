//Create DIV in which DrawTools will be placed in
var drawToolsDiv = document.createElement('div');
drawToolsDiv.id = 'drawTools';
drawToolsDiv.className = 'btn-group';
//drawToolsDiv.setAttribute("data-toggle","buttons"); 
document.getElementById('redo-button').parentNode.parentNode.appendChild(drawToolsDiv);

// Create Tool Button Array
var toolButtons = new Array();

// Create Tool Buttons
toolButtons.push(createToolButton("Fill")) ;
toolButtons.push(createToolButton("Line")) ;
toolButtons.push(createToolButton("Poly")) ;
toolButtons.push(createToolButton("test")) ;

// Setup Canvas Tools
var context=drawApp.context;
var canvas=context.canvas;


// Mouse Listening
// Debug mouse coords text label
var mouseCoordsLabel = createMouseCoordsLabel();
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
	mouseCoordsLabel.innerHTML=context.lineWidth;//context.lineWidth
	if(context.lineWidth == 'drawTool-Fill'){
		try {
			floodFill(e);
			alert("used floodfill");
		} catch(err) {
			alert(err);
		}
	} else if($('#'+lineButton.id).hasClass('selected')) {
		try{
			//virtualLine(e);
			//makeLine(new Point(100,100),new Point(200,200));
		} catch(err) {
			alert(err);
		}
	} else if($('#'+polygon.id).hasClass('selected')) {
		//imgTest();
	} else{
		//Else do the rest of default behaviors
		var md=drawApp.onCanvasMouseDown();
		md(e);
	}
})

/*--------------------- Button Methods ----------------------*/
function drawLine(start,finish){
	save();
	context.beginPath();
	context.moveTo(start.x,start.y);
	context.lineTo(finish.x,finish.y);
	context.stroke();
}

function floodFill(e){
	save();
	var w = drawApp.canvas.width();
	var h = drawApp.canvas.height();
	var p = drawApp.context.getImageData(0,0,w,h);
	var d = p.data;
	var targetColor = new RGBColor(d[4*w*e.offsetY+4*e.offsetX],d[4*w*e.offsetY+4*e.offsetX+1],d[4*w*e.offsetY+4*e.offsetX+2]);
	var c = parseInt(drawApp.context.strokeStyle.substr(1,6),16);
	var fillColor = new RGBColor((c>>16)&255,(c>>8)&255,c&255);
	
	try{
		if(!targetColor.equals(fillColor))
			f(e.offsetX,e.offsetY);
	} catch(err) {
		alert(err);
	}
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
//Creates Tool Buttons
function createToolButton(name){
	//create label
	// Ex: <label class="yellowButton" onclick="drawApp.setSize(35);" title="Large Brush (Hotkey: CTRL+4)">
	var button = document.createElement('label');
	button.id = 'tool-' + name;
	button.className = 'btn btn-yellow btn-drawtool'; //use whatever className drawception uses
	button.onclick = function(){drawApp.setSize(60);selectTool(name)};
	drawToolsDiv.appendChild(button);
	
	//Place element inside it( text or image )
	button.innerHTML = name;
	
	return button;
}
function selectTool(name){
	for (var i=0;i<toolButtons.length;i++) {
		//document.write(cars[i] + "<br>");
	}
	
	
}
// Debug Label
function createMouseCoordsLabel() {
	var label=document.createElement('a');
	label.id='mouseCoordsLabel';
	label.className='btn btn-yellow btn-drawtool';
	label.innerHTML='label';
	drawToolsDiv.appendChild(label);
	return label;
}

/*--------------------- CSS Style Sheets ---------------------*/
//sheet.insertRule("header { float: left; opacity: 0.8; }", 1);

function injectCSS() {
	var sheet = document.createElement('style')
	sheet.innerHTML = "\n\
		span{height:40px; width:40px; display:block; position:relative;} \n\
		\n\
		#tool-Fill{background:#333; border-radius:20px;-webkit-border-radius:20px;-moz-border-radius:20px;}\n\
		\n\
		#tool-Fill:before{content:''; height:0; width:0; display:block; border:10px transparent solid; border-right-width:0; border-left-color:#fff; position:absolute; top:10px; left:20px;}\n\
		\n\
		#tool-Fill:after{content:''; height:20px; width:4px; display:block; background:#fff; position:absolute; top:10px; left:12px;}";
	document.body.appendChild(sheet);
}
