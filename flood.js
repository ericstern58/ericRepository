var code="\n\
var fillButton=document.createElement('a')\n\
document.getElementById('drawingCanvas').parentNode.appendChild(fillButton)\n\
fillButton.id='brush-fill'\n\
fillButton.className='brushPicker'\n\
fillButton.innerHTML='Fill'\n\
fillButton.onclick=function(){drawApp.setSize('fill')}\n\
\n\
var testButton=document.createElement('a')\n\
document.getElementById('drawingCanvas').parentNode.appendChild(testButton)\n\
testButton.id='brush-img'\n\
testButton.className='brushPicker'\n\
testButton.innerHTML='Img'\n\
testButton.onclick=function(){drawApp.setSize('img')}\n\
\n\
var md=drawApp.onCanvasMouseDown()\n\
// hey, that was clever, but unfortunately not enough\n\
drawApp.context.putImageData=CanvasRenderingContext2D.prototype.putImageData\n\
drawApp.canvas.off('mousedown')\n\
\n\
drawApp.canvas.on('mousedown',function(e){\n\
	if($('#brush-fill').hasClass('selected')){\n\
        floodFill(e)\n\
	} else if($('#brush-img').hasClass('selected')) { \n\
		imgTest()\n\
	} else{\n\
		md(e)\n\
	}\n\
})\n\
\n\
function floodFill(e){\n\
	save()\n\
	var w=drawApp.canvas.width()\n\
	var h=drawApp.canvas.height()\n\
	var p=drawApp.context.getImageData(0,0,w,h)\n\
	var d=p.data\n\
	var rtarget=d[4*w*e.offsetY+4*e.offsetX]\n\
	var gtarget=d[4*w*e.offsetY+4*e.offsetX+1]\n\
	var btarget=d[4*w*e.offsetY+4*e.offsetX+2]\n\
	var targetColor = new RGBColor(d[4*w*e.offsetY+4*e.offsetX],d[4*w*e.offsetY+4*e.offsetX+1],d[4*w*e.offsetY+4*e.offsetX+2])\n\
	var c=parseInt(drawApp.context.strokeStyle.substr(1,6),16)\n\
	var r=(c>>16)&255\n\
	var g=(c>>8)&255\n\
	var b=c&255\n\
	var fillColor = new RGBColor((c>>16)&255,(c>>8)&255,c&255)\n\
	\n\
	try{\n\
	if(!targetColor.equals(fillColor))\n\
		f(e.offsetX,e.offsetY)\n\
	} catch(err) {\n\
		alert(err)\n\
	}\n\
	p.data=d\n\
	drawApp.context.putImageData(p,0,0)\n\
	\n\
	function f(xinitial,yinitial){\n\
		var queue = []\n\
		queue.push(new Point(xinitial,yinitial))\n\
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
				colorPixel(d,w,point,fillColor)\n\
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
	var w=drawApp.canvas.width()\n\
	var h=drawApp.canvas.height()\n\
	var p=drawApp.context.getImageData(0,0,w,h)\n\
	var d=p.data\n\
	\n\
	var myImg = new Image;\n\
	myImg.src = 'http://g-ecx.images-amazon.com/images/G/01/DVD/Paramount/detailpages/IronMan/IronMan_Still_H5_L.jpg'\n\
	var p2=drawApp.context.getImageData(0,0,w,h)\n\
	var d2=p2.data\n\
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
"
var js=document.createElement("script")
js.text=code
document.body.appendChild(js)
