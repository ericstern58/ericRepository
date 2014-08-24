<html>
<head>
<style>
*, *:before, *:after {-moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;}

.loading{margin:10px 6px 10px 6px;position:relative;width:24px;height:9px;border:3px solid #c2c2c2;background:transparent;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;}
.loading:before{margin:0 0 0 -5px;position:absolute;top:0;left:0;content:'';width:15px;height:11px;border-left:3px solid #c2c2c2;border-bottom:3px solid #c2c2c2;background:transparent;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;}
.loading:after{margin:8px 0 0 8px;position:absolute;top:0;left:0;content:'';width:4px;height:14px;background:#c2c2c2;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;}

.dial2{margin:0;position:relative;width:6px;height:15px;border-top:6px solid red;border-bottom:6px solid green;background:transparent;-webkit-box-shadow:9px 0px 0px 0px #c2c2c2;-moz-box-shadow:9px 0px 0px 0px #c2c2c2;box-shadow:9px 0px 0px 0px #c2c2c2;}
.dial2:before{margin:0 0 0 -115px;position:absolute;top:0;left:0;content:'';width:15px;height:11px;border-left:3px solid #c2c2c2;border-bottom:3px solid #c2c2c2;background:transparent;}
.dial2:after{margin:118px 0 0 8px;position:absolute;top:0;left:0;content:'';width:4px;height:14px;background:#c2c2c2;}

.dial{margin:4px 8px;position:relative;width:24px;height:6px;background:linear-gradient(to right,#c2c2c2,#c2c2c2 6px,transparent 6px,transparent 9px,#c2c2c2 9px,#c2c2c2 15px,transparent 15px,transparent 18px,#c2c2c2 18px,#c2c2c2 24px);}
.dial:before{margin:0;position:absolute;top:9px;left:0;content:'';width:24px;height:6px;background:linear-gradient(to right,#c2c2c2,#c2c2c2 6px,transparent 6px,transparent 9px,#c2c2c2 9px,#c2c2c2 15px,transparent 15px,transparent 18px,#c2c2c2 18px,#c2c2c2 24px);}
.dial:after{margin:0;position:absolute;top:18px;left:0;content:'';width:24px;height:6px;background:linear-gradient(to right,#c2c2c2,#c2c2c2 6px,transparent 6px,transparent 9px,#c2c2c2 9px,#c2c2c2 15px,transparent 15px,transparent 18px,#c2c2c2 18px,#c2c2c2 24px);}



</style>
</head>
<body>

hi

<div class="loading"></div>
<br>
<div class="dial"></div>

</body>
</html>
