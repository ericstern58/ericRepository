var code="\n\
var btn=document.createElement('a')\n\
document.getElementById('drawingCanvas').parentNode.appendChild(btn)\n\
btn.href='#'\n\
btn.id='brush-flood'\n\
btn.className='brushPicker'\n\
btn.innerHTML='fill'\n\
btn.onclick=function(){drawApp.setSize('flood')}\n\
\n\
var md=drawApp.onCanvasMouseDown()\n\
// hey, that was clever, but unfortunately not enough\n\
drawApp.context.putImageData=CanvasRenderingContext2D.prototype.putImageData\n\
drawApp.canvas.off('mousedown')\n\
\n\
drawApp.canvas.on('mousedown',function(e){\n\
	if($('#brush-flood').hasClass('selected')){\n\
        floodFill(e)\n\
	}else{\n\
		md(e)\n\
	}\n\
})\n\
\n\
var floodFill = function(e){\n\
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
"
var js=document.createElement("script")
js.text=code
document.body.appendChild(js)
