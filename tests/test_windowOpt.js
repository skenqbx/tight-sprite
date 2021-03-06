var windowOpt = require("../lib/solvers/windowOpt");

var rectangles = [], i;

// create a sample
for(i = 0; i < 10; ++i){
	rectangles.push({w: 16, h: 16});
}
for(i = 0; i < 6; ++i){
	rectangles.push({w: 32, h: 32});
}
for(i = 0; i < 11; ++i){
	rectangles.push({w: 24, h: 24});
}
for(i = 0; i < 4; ++i){
	rectangles.push({w: 40, h: 40});
}

function produceScore(top, stack, state){
	var cp = top.envelope.cornerPoints, w = cp[cp.length - 1].x, h = cp[0].y,
		diff = cp.length - stack[stack.length - 2].envelope.cornerPoints.length;
	return [Math.max(state.totalArea, w * h), top.envelope.areaIn() - top.area, diff]; // 960
	//return [Math.max(state.totalArea, w * h), top.envelope.areaIn() - top.area, diff, state.totalArea - top.area]; // 960
	return [Math.max(state.totalArea, w * h), top.envelope.areaIn() - top.area, diff, w * h < state.totalArea ? Math.abs(h - w) : 0]; // 1600
}

var result = windowOpt(rectangles, produceScore, 4);
//console.log(rectangles.length + " rectangles: ", rectangles);
//console.log(result);

// crude ASCII visualization

var symbols = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

var width = result.layout.reduce(function(acc, pos){
			var rect = rectangles[pos.n],
				right = pos.x + rect.w;
			return Math.max(acc, right);
		}, 0),
	height = result.layout.reduce(function(acc, pos){
			var rect = rectangles[pos.n],
				bottom = pos.y + rect.h;
			return Math.max(acc, bottom);
		}, 0);

// we know that all our rectangles are divisible by 8
width  /= 8;
height /= 8;

function rep(sym, n){
	var line = "";
	for(var size = 1; n > 0; sym += sym, size <<= 1){
		if(n & size){
			line += sym;
			n -= size;
		}
	}
	return line;
}

var line = rep(".", width),
	canvas = new Array(height);
for(i = 0; i < height; ++i){
	canvas[i] = line;
}

// the drawing code
result.layout.forEach(function(pos){
	var rect = rectangles[pos.n],
		sym  = symbols.charAt(pos.n),
		x = pos.x / 8,
		w = rect.w / 8,
		y = pos.y / 8,
		h = rect.h / 8,
		line = rep(sym, w);
	for(var i = 0; i < h; ++i){
		var old = canvas[y + i];
		canvas[y + i] = old.substring(0, x) + line + old.substring(x + w);
	}
});

canvas.forEach(function(line){
	console.log(line);
});


var totalHeight = rectangles.reduce(function(acc, rect){ return acc + rect.h; }, 0),
	totalWidth  = rectangles.reduce(function(acc, rect){ return Math.max(acc, rect.w); }, -Infinity),
	totalArea   = rectangles.reduce(function(acc, rect){ return acc + rect.area; }, 0);

console.log("width: " + (width * 8) + ", height: " + (height * 8) + ", waste: " +
	(width * height * 64 - totalArea) + " (" +
		((width * height * 64 - totalArea) / totalArea * 100).toFixed(2) + "%)");

console.log("width: " + totalWidth + ", height: " + totalHeight + ", waste: " +
	(totalWidth * totalHeight - totalArea) + " (" +
		((totalWidth * totalHeight - totalArea) / totalArea * 100).toFixed(2) + "%)");
