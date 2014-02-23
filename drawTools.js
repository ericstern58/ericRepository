//Create DIV in which DrawTools will be placed in
var drawToolsDiv = document.createElement('div');
drawToolsDiv.id = 'drawTools';
drawToolsDiv.className = 'btn-group';
document.getElementById('redo-button').parentNode.parentNode.appendChild(drawToolsDiv);

//Create Tool Buttons
createTool("Blu");
createTool("Red");
createTool("Fill");
createTool("Line");
createTool("Poly");

function createTool(name){
	var button=document.createElement('a');
	button.id='brush-' + name;
	button.className='btn btn-yellow btn-drawtool';
	button.innerHTML=name;
	button.onclick=function(){drawApp.setSize(name)};
	drawToolsDiv.appendChild(button);
	return button;
}

