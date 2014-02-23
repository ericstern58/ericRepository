document.body.style.backgroundColor = "#AA4930";
createButton("blue")

function changeblue(){
	document.body.style.backgroundColor = "#0713dd";
}


function createButton(name){
	var button=document.createElement('a');
	document.getElementById('buttonSpace').parentNode.appendChild(button);
	button.id='brush-' + name;
	button.className='brushPicker';
	button.innerHTML=name;
	button.onclick=function(){changeblue()};
	return button;
}
