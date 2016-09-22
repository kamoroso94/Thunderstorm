var canvas,ctx,lastDraw,lastTick,droplets,storm,maxDroplets,maxStorm,maxBolts,thunderpower;
var tps = 30;

window.addEventListener("DOMContentLoaded",function() {
	var moveId;
	canvas = document.querySelector("canvas");
	ctx = canvas.getContext("2d");
	window.addEventListener("resize",resize);
	canvas.addEventListener("click",function(e) {
		if(storm.length==0) {
			canvas.style.opacity = 0.5;
		}
		storm.push(new Lightning(e.clientX,0));
		thunderpower++;
	});
	init();
	lastDraw = Date.now();
	requestAnimationFrame(draw);
	lastTick = Date.now();
	setTimeout(tick,1000/tps);
});

function init() {
	droplets = [];
	storm = [];
	maxDroplets = 200;
	maxStorm = 10;
	maxBolts = 5;
	thunderpower = 0;
	resize();
}

function draw(timestamp) {
	var currentDraw = Date.now();
	var dt = currentDraw-lastDraw;
	
	ctx.fillStyle = "#00003f";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	ctx.save();
	ctx.translate(5*thunderpower*Math.random(),0);
	
	ctx.beginPath();
	for(var i=0; i<droplets.length; i++) {
		var droplet = droplets[i];
		ctx.moveTo(droplet.x1,droplet.y1);
		ctx.lineTo(droplet.x2,droplet.y2);
	}
	ctx.lineWidth = 5;
	ctx.strokeStyle = "#003f7f";
	ctx.stroke();
	
	var styles = [
		{strokeStyle:"#ffff00",lineWidth:5},
		{strokeStyle:"#ffffff",lineWidth:2}
	];
	styles.forEach(function(style) {
		ctx.beginPath();
		for(var i=0; i<storm.length; i++) {
			var lightning = storm[i];
			
			for(var j=0; j<lightning.bolts.length; j++) {
				var bolt = lightning.bolts[j];
				var point = bolt[0];
				
				ctx.moveTo(point.x,point.y);
				for(var k=1; k<bolt.length; k++) {
					point = bolt[k];
					ctx.lineTo(point.x,point.y);
				}
			}
		}
		ctx.lineWidth = style.lineWidth;
		ctx.strokeStyle = style.strokeStyle;
		ctx.stroke();
	});
	
	ctx.restore();
	lastDraw = currentDraw;
	requestAnimationFrame(draw);
}

function tick() {
	var currentTick = Date.now();
	var dt = currentTick-lastTick;
	var ay = 25;
	//fix tps dependency
	//fixed motion per frame is bad
	
	if(Math.random()<1-droplets.length/maxDroplets) {
		var x = (canvas.width+100)*Math.random()-50;
		var y1 = -canvas.height*Math.random();
		var y2 = 0.95*y1;
		droplets.push(new Droplet(x,y1,x,y2));
	}
	
	if(storm.length<maxStorm&&Math.random()<0.01) {
		if(storm.length==0) {
			canvas.style.opacity = 0.5;
		}
		storm.push(new Lightning(canvas.width*Math.random(),0));
		thunderpower++;
	}
	if(thunderpower>=10) {
		console.log(JSON.stringify(storm));
	}
	
	for(var i=0; i<droplets.length; i++) {
		var droplet = droplets[i];
		var vy = (droplet.y2-droplet.y1)/dt;
		droplet.x1 = droplet.x2;
		droplet.y1 = 0.95*droplet.y2;
		droplet.y2+=vy+ay;
		if(droplet.y1>=canvas.height||droplet.x1>=canvas.width+50) {
			if(droplets.length<=maxDroplets) {
				var x = (canvas.width+100)*Math.random()-50;
				var y1 = -canvas.height*Math.random();
				var y2 = 0.95*y1;
				
				droplet.x1 = x;
				droplet.x2 = x;
				droplet.y1 = y1;
				droplet.y2 = y2;
			} else {
				droplets[i] = droplets[droplets.length-1];
				droplets.pop();
				i--;
			}
			
		}
	}
	
	for(var i=0; i<storm.length; i++) {
		var lightning = storm[i];
		for(var j=0; j<lightning.bolts.length; j++) {
			var bolt = lightning.bolts[j];
			var tip = bolt[bolt.length-1];
			if(tip.x<0||tip.x>=canvas.width||tip.y<0||tip.y>=canvas.height) {
				storm[i] = storm[storm.length-1];
				storm.pop();
				if(storm.length==0) {
					canvas.style.opacity = 1;
				}
				thunderpower-=lightning.bolts.length;
				i--;
				break;
			}
			bolt.push({
				x: tip.x+100*Math.random()-50,
				y: tip.y+200-50*Math.random()
			});
			if(lightning.bolts.length<maxBolts&&Math.random()<0.1) {
				lightning.bolts.push([{
					x: tip.x,
					y: tip.y
				}]);
				thunderpower++;
			}
		}
	}
	
	lastTick = currentTick;
	setTimeout(tick,1000/tps);
}

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	maxDroplets = canvas.width*canvas.height*2/5000;	//1 per 50x100 density and mirrored above screen
	maxStorm = canvas.width/100;
	ctx.lineCap = "round";
}

function Droplet(x1,y1,x2,y2) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
}

function Lightning(x,y) {
	this.bolts = [[{x:x,y:y}]];
}