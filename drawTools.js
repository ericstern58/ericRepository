//Create DIV in which DrawTools will be placed in
var drawToolsDiv = document.createElement('div');
drawToolsDiv.id = 'drawTools';
drawToolsDiv.className = 'btn-group';
drawToolsDiv.setAttribute("data-toggle","buttons"); 
document.getElementById('redo-button').parentNode.parentNode.appendChild(drawToolsDiv);

//Create Tool Buttons
var fillButton = createToolButton("Fill");
var lineButton = createToolButton("Line");
var polygonButton = createToolButton("Poly");
var testButton = createToolButton("test");

//Setup Canvas Tools
var context=drawApp.context;
var canvas=context.canvas;

/*
//Mouse Listening
//Debug mouse coords text label
var mouseCoordsLabel = createMouseCoordsLabel();
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
	alert("in mousedown custom function");
	if(context.lineWidth == 'drawTool-Fill';){
		try{
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

/*--------------------- Element Creation ---------------------*/
//Creates Tool Buttons
function createToolButton(name){
	var button = document.createElement('a');
	button.id = 'drawTool-' + name;
	button.className = 'btn btn-yellow btn-drawtool';
	button.innerHTML = name;
	button.onclick = function(){drawApp.setSize(name)};
	drawToolsDiv.appendChild(button);
	return button;
}
function createMouseCoordsLabel() {
	var label=document.createElement('a');
	label.id='mouseCoordsLabel';
	label.className='btn btn-yellow btn-drawtool';
	label.innerHTML='label';
	drawToolsDiv.appendChild(label);
	return label;
}
