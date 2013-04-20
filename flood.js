var code="\n\
var fillButton=createTool('fill')\n\
var lineButton=createTool('line')\n\
var testButton=createTool('img')\n\
var label58=document.createElement('a')\n\
	document.getElementById('drawingCanvas').parentNode.appendChild(label58)\n\
	label58.id='label58'\n\
	label58.className='brushPicker'\n\
	label58.innerHTML='labal'\n\
\n\
var context=drawApp.context\n\
var canvas=context.canvas\n\
var mouse = {x: 0, y: 0}\n\
/* Mouse Capturing Work */\n\
//canvas.addEventListener('mousemove', update, false)\n\
//function update(){\n\
//	mouse.x = e.pageX\n\
//	mouse.y = e.pageY\n\
//	var tempx=mouse.x-pos.x\n\
//	var tempy=mouse.y-pos.y\n\
//	label58.innerHTML=tempx+','+tempy\n\
//}\n\
\n\
drawApp.context.putImageData=CanvasRenderingContext2D.prototype.putImageData\n\
drawApp.canvas.off('mousedown')\n\
\n\
drawApp.canvas.on('mousedown',function(e){\n\
	if($('#'+fillButton.id).hasClass('selected')){\n\
		try{\n\
			floodFill(e)\n\
		} catch(err) {\n\
			alert(err)\n\
		}\n\
	} else if($('#'+lineButton.id).hasClass('selected')) { \n\
		try{\n\
			//virtualLine(e)\n\
			//makeLine(new Point(100,100),new Point(200,200))\n\
		} catch(err) {\n\
			alert(err)\n\
		}\n\
	} else if($('#'+testButton.id).hasClass('selected')) { \n\
		imgTest()\n\
	} else{\n\
		var md=drawApp.onCanvasMouseDown()\n\
		md(e)\n\
	}\n\
})\n\
\n\
function virtualLine(e){\n\
	var start = new Point(e.offsetX,e.offsetY)\n\
	var pos = getElementAbsolutePos(canvas)\n\
	//canvas.addEventListener('mousemove', update, false)\n\
	canvas.addEventListener('mouseup', conclude, false)\n\
	function conclude() {\n\
		var end = new Point(mouse.x-pos.x,mouse.y-pos.y)\n\
		alert('start(' + start.x + ',' + start.y + ') end('+end.x+','+end.y+')' + ' pos('+pos.x+','+pos.y+')')\n\
		//'+e.pageX+','+e.pageY+')'+'offsetleft'+canvas.offsetLeft+' offsetTop'+canvas.offsetTop\n\
		makeLine(start,end)\n\
		//canvas.removeEventListener('mousemove', update, false)\n\
		canvas.removeEventListener('mouseup', arguments.callee, false)\n\
	}\n\
	function update(){\n\
		mouse.x = e.pageX\n\
		mouse.y = e.pageY\n\
		var tempx=mouse.x-pos.x\n\
		var tempy=mouse.y-pos.y\n\
		label58.innerHTML=tempx+','+tempy\n\
	}\n\
}\n\
\n\
function makeLine(start,finish){\n\
	save()\n\
	context.beginPath()\n\
	context.moveTo(start.x,start.y)\n\
	context.lineTo(finish.x,finish.y)\n\
	context.stroke()\n\
}\n\
\n\
function floodFill(e){\n\
	save()\n\
	var w=drawApp.canvas.width()\n\
	var h=drawApp.canvas.height()\n\
	var p=drawApp.context.getImageData(0,0,w,h)\n\
	var d=p.data\n\
	var targetColor = new RGBColor(d[4*w*e.offsetY+4*e.offsetX],d[4*w*e.offsetY+4*e.offsetX+1],d[4*w*e.offsetY+4*e.offsetX+2])\n\
	var c=parseInt(drawApp.context.strokeStyle.substr(1,6),16)\n\
	var fillColor = new RGBColor((c>>16)&255,(c>>8)&255,c&255)\n\
	\n\
	try{\n\
	if(!targetColor.equals(fillColor))\n\
		f(e.offsetX,e.offsetY)\n\
	} catch(err) {\n\
		alert(err)\n\
	}\n\
	context.putImageData(p,0,0)\n\
	\n\
	function f(xinitial,yinitial){\n\
		var queue = [new Point(xinitial,yinitial)]\n\
		var x = 0\n\
		var y = 0\n\
		while(queue.length>0) {\n\
			var point=queue.shift()\n\
			x=point.x\n\
			y=point.y\n\
			if(x>=0 && y>=0 && x<w && y<h && targetColor.equals(new RGBColor(d[4*w*y+4*x],d[4*w*y+4*x+1],d[4*w*y+4*x+2])) ) {\n\
				colorPixel(d,w,point,fillColor)\n\
				queue.push(new Point(x-1,y))\n\
				queue.push(new Point(x+1,y))\n\
				queue.push(new Point(x,y-1))\n\
				queue.push(new Point(x,y+1))\n\
			} else if(x>=0 && y>=0 && x<w && y<h){\n\
				//colorPixel(d,w,point,fillColor)\n\
				/*\
				colorPixelBlend(d,w,x-1,y,fillColor,new RGBColor(d[4*w*y+4*(x-1)],d[4*w*y+4*(x-1)+1],d[4*w*y+4*(x-1)+2]));\n\
				colorPixelBlend(d,w,x+1,y,fillColor,new RGBColor(d[4*w*y+4*(x+1)],d[4*w*y+4*(x+1)+1],d[4*w*y+4*(x+1)+2]));\n\
				colorPixelBlend(d,w,x,y-1,fillColor,new RGBColor(d[4*w*(y-1)+4*x],d[4*w*(y-1)+4*x+1],d[4*w*(y-1)+4*x+2]));\n\
				colorPixelBlend(d,w,x,y+1,fillColor,new RGBColor(d[4*w*(y+1)+4*x],d[4*w*(y+1)+4*x+1],d[4*w*(y+1)+4*x+2]));\n\
				*/\
			}\n\
		}\n\
	}\n\
}\n\
\n\
function imgTest(){\n\
	save()\n\
	alert('saving')\n\
    var e = new Image\n\
    e.onload = function () {\n\
        var t = document.getElementById('drawingCanvas').getContext("2d")\n\
        t.globalCompositeOperation = 'copy'\n\
        t.drawImage(e, 0, 0)\n\
        $('#tool-eraser').hasClass('selected') == 1 ? t.globalCompositeOperation = 'destination-out' : t.globalCompositeOperation = 'source-over'\n\
    };\n\
    e.src = 'http://media.dcentertainment.com/sites/default/files/character_bio-batman_576.jpg'\n\
	alert('imgTestDone')\n\
	\n\
}\n\
function colorPixel(d,w,point,color){\n\
	d[4*w*point.y+4*point.x]=color.r;\n\
	d[4*w*point.y+4*point.x+1]=color.g;\n\
	d[4*w*point.y+4*point.x+2]=color.b;\n\
	d[4*w+point.y+4*point.x+3]=255;\n\
}\n\
function colorPixelBlend(d,w,point,color1,color2){\n\
	var r=Math.ceil(0.5*color1.r + 0.5*r2)\n\
	var g=Math.ceil(0.5*color1.g + 0.5*g2)\n\
	var b=Math.ceil(0.5*color1.b + 0.5*b2)\n\
	colorPixel(d,w,point,new Color(r,g,b))\n\
}\n\
//Custom Objects \n\
function Point(x,y) {\n\
	this.x=x;\n\
	this.y=y;\n\
}\n\
function RGBColor(r,g,b) {\n\
	this.r=r;\n\
	this.g=g;\n\
	this.b=b;\n\
	this.equals = function(color) {\n\
		return (this.r===color.r && this.g===color.g && this.b===color.b);\n\
	}\n\
}\n\
function getElementAbsolutePos(element) {\n\
	var res = new Point(0,0)\n\
	if (element !== null) { \n\
		if (element.getBoundingClientRect) {\n\
			var viewportElement = document.documentElement\n\
 	        var box = element.getBoundingClientRect()\n\
		    var scrollLeft = viewportElement.scrollLeft\n\
 		    var scrollTop = viewportElement.scrollTop\n\
		    res.x = box.left + scrollLeft\n\
		    res.y = box.top + scrollTop\n\
		}\n\
	}\n\
    return res\n\
}\n\
//Element creation methods \n\
function createTool(name){\n\
	var button=document.createElement('a')\n\
	document.getElementById('drawingCanvas').parentNode.appendChild(button)\n\
	button.id='brush-' + name\n\
	button.className='brushPicker'\n\
	button.innerHTML=name\n\
	button.onclick=function(){drawApp.setSize(name)}\n\
	return button\n\
}\n\
"
var js=document.createElement("script")
js.text=code
document.body.appendChild(js)
