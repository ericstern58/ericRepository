document.getElementById('drawingCanvas').style.backgroundColor = "#000000";
document.body.style.backgroundColor = "#AA4930";
createTool("blue");

function createTool(name){
	var button=document.createElement('a');
	document.getElementById('redo-button').parentNode.appendChild(button);
	button.id='brush-' + name;
	button.className='brushPicker';
	button.innerHTML=name;
	button.onclick=function(){drawApp.setSize(name)};
	return button;
}
