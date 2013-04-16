var code="\n\
var fillButton=document.createElement('a')\n\
document.getElementById('drawingCanvas').parentNode.appendChild(fillButton)\n\
fillButton.href='#'\n\
fillButton.id='brush-fill'\n\
fillButton.className='brushPicker'\n\
fillButton.innerHTML='Fill'\n\
fillButton.onclick=function(){drawApp.setSize('fill')}\n\
\n\
var testButton=document.createElement('a')\n\
document.getElementById('drawingCanvas').parentNode.appendChild(testButton)\n\
testButton.href='#'\n\
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
	}else{\n\
		md(e)\n\
	}\n\
})\n\
\n\
var floodFill = function(e){\n\
	save()\n\
	var w=drawApp.canvas.width()\n\
	var h=drawApp.canvas.height()\n\
	var p=drawApp.context.getImageData(0,0,w,h)\n\
	var d=p.data\n\
	var rtarget=d[4*w*e.offsetY+4*e.offsetX]\n\
	var gtarget=d[4*w*e.offsetY+4*e.offsetX+1]\n\
	var btarget=d[4*w*e.offsetY+4*e.offsetX+2]\n\
	var c=parseInt(drawApp.context.strokeStyle.substr(1,6),16)\n\
	var r=(c>>16)&255\n\
	var g=(c>>8)&255\n\
	var b=c&255\n\
	var l=function(a,b){return a===b}\n\
	var colorPixel = function(x,y,r,g,b){\n\
		d[4*w*y+4*x]=r;\n\
		d[4*w*y+4*x+1]=g;\n\
		d[4*w*y+4*x+2]=b;\n\
		d[4*w+y+4*x+3]=255;\n\
	}\n\
	var f = function(x,y){\n\
		if(x>=0 && y>=0 && x<w && y<h && l(rtarget,d[4*w*y+4*x]) && l(gtarget,d[4*w*y+4*x+1]) && l(btarget,d[4*w*y+4*x+2])){\n\
			colorPixel(x,y,r,g,b);\n\
			f(x-1,y);\n\
			f(x+1,y);\n\
			f(x,y-1);\n\
			f(x,y+1)\n\
		} else {\n\
			colorPixel(x,y,r,g,b);\n\
		}\n\
	}\n\
	if(!(rtarget===r && gtarget===g && btarget===b))\n\
		f(e.offsetX,e.offsetY)\n\
	p.data=d\n\
	drawApp.context.putImageData(p,0,0)\n\
}\n\
\n\
var imgTest = function(e){\n\
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
	var f = function(){\n\
		for (var y=0;y<h;y++) {\n\
			for (var x=0;x<w;x++) {\n\
				if(x>=0 && y>=0 && x<w && y<h){\n\
					var r=d2[4*w*y+4*x]\n\
					var g=d2[4*w*y+4*x+1]\n\
					var b=d2[4*w*y+4*x+2]\n\
					colorPixel(x,y,r,g,b);\n\
				}\n\
			}\n\
		}\n\
	}\n\
	\
    myImg.onload = function () {\n\
		var t = document.getElementById("drawingCanvas").getContext("2d")\n\
		t.globalCompositeOperation = "copy"\n\
		t.drawImage(myImg, 0, 0)\n\
		$("#tool-eraser").hasClass("selected") == 1 ? t.globalCompositeOperation = "destination-out" : t.globalCompositeOperation = "source-over"\n\
	}\n\
}\n\
"
var js=document.createElement("script")
js.text=code
document.body.appendChild(js)
