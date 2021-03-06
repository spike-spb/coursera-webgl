"use strict";

var canvas;
var gl;

var maxNumVertices  = 20000;
var index = 0;

var cindex = 0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0)   // cyan
];

var bufferId;
var cBufferId;
var lineWidth=1;
var curves = [0];
var curveLineWidth = [lineWidth];
var curve = 0; // current curve
var drawing = false;


window.onload = init;

function init() {
	canvas = document.getElementById( "gl-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	var m = document.getElementById("mymenu");

	m.addEventListener("click", function() {
		cindex = m.selectedIndex;
	});

	canvas.addEventListener("mousedown", onMouseDown);
	canvas.addEventListener("mouseup", onMouseUp);
	canvas.addEventListener("mousemove", onMouseMove);

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT );

	//
	//  Load shaders and initialize attribute buffers
	//
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
	var vPos = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPos );

	cBufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
	gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );
	
	var lineWidthEl = document.getElementById('line-width');
	lineWidthEl.addEventListener('change', onLineWidthChange);
}

function onLineWidthChange(event) {
	lineWidth = event.srcElement.value;
}

function draw(event) {
	var rect = canvas.getBoundingClientRect();
	var clientX = event.clientX-rect.left,
		clientY = event.clientY-rect.top;
	var pos = vec2(2*clientX/canvas.width-1,
					2*(canvas.height-clientY)/canvas.height-1);
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(pos));
	console.log(event.clientX, event.clientY);
	
	var color = vec4(colors[cindex]);

	gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
	gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(color));
	index++;
}

function onMouseDown(event){
	drawing = true;
	
	curves[curves.length-1]++;
	curveLineWidth[curves.length-1] = lineWidth;
	
	draw(event);
} 

function onMouseUp(event) {
	drawing = false;
	curves.push(0);
	curveLineWidth.push(lineWidth);
	render();
}

function onMouseMove(event) {
	if (!drawing)
		return;
	
	curves[curves.length-1]++;
	draw(event);
	render();
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT );

	for(var i=0, start=0; i<curves.length; i++) {
		gl.lineWidth(curveLineWidth[i]);
		gl.drawArrays( gl.LINE_STRIP, start, curves[i] );
		start += curves[i];
	}
}
