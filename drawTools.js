document.body.style.backgroundColor = "#AA4930";
createTool("blue")

function createTool(name){\n\
	var button=document.createElement('a');
	document.getElementById('drawingCanvas').parentNode.appendChild(button);
	button.id='brush-' + name;
	button.className='brushPicker';
	button.innerHTML=name;
	button.onclick=function(){drawApp.setSize(name)};
	return button;
}
