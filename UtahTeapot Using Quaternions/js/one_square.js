
// some globals
var gl;

var theta = 0.0;
var theta2 = 0.0;
var thetaLoc, colorLoc;


var delay = 100;
var direction = true;
var vBuffer, cBuffer;
var program;
var vertices = [];
var vcolors = [];
var color_vals = [];
var color_vals2 = [];

var max_prims = 200, num_triangles = 0;

window.onload = function init() {
	// get the canvas handle from the document's DOM
    var canvas = document.getElementById( "gl-canvas" );
    
	// initialize webgl
    gl = WebGLUtils.setupWebGL( canvas );

	// check for errors
    if ( !gl ) { 
		alert( "WebGL isn't available" ); 
	}

    // set up a viewing surface to display your image
    // gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.viewport( 0, 0, canvas.width, canvas.height );

	// clear the display with a background color 
	// specified as R,G,B triplet in 0-1.0 range
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Load shaders -- all work done in init_shaders.js
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

	// make this the current shader program
    gl.useProgram( program );

	// Get a handle to theta  - this is a uniform variable defined 
	// by the user in the vertex shader, the second parameter should match
	// exactly the name of the shader variable
    thetaLoc = gl.getUniformLocation( program, "theta" );

	// we are also going manipulate the vertex color, so get its location
	colorLoc = gl.getUniformLocation(program, "vertColor");

	// set an initial color for all vertices
	gl.uniform4fv (colorLoc, [1., 0., 0., 1.])

	// create a vertex buffer - this will hold all vertices
    vBuffer = gl.createBuffer();

	// create a vertex buffer
    cBuffer = gl.createBuffer();

	// create the square geometry, send it to GPU
	updateVertices();

    render();
};

function updateVertices() {
	// add a square at the center of the view (0, 0) of a fixed size
	// triangle 1
	// vertices.push([ 0.0,   0.3]); 
	// vertices.push([-0.3,   0.0]); 
	// vertices.push([ 0.0, - 0.3]); 

	// // triangle 2
	// vertices.push([ 0.0,  0.3]); 
	// vertices.push([ 0.0, -0.3]); 
	// vertices.push([ 0.3,  0.0]); 

	vertices.push([-0.5,-0.5,0.5,1.0]),
	vertices.push([-0.5,0.5,0.5,1.0]),
	vertices.push([0.5,0.5,0.5,1.0]),
	vertices.push([0.5,-0.5,0.5,1.0]),
	vertices.push([-0.5,-0.5,-0.5,1.0]),
	vertices.push([-0.5,0.5,-0.5,1.0]),
	vertices.push([0.5,0.5,-0.5,1.0]),
	vertices.push([0.5,-0.5,-0.5,1.0])

	// TODO: add a smaller square similar to above, right beside it
	// make sure the coordinates are within the -1.0 to 1.0 range in
	// X, Y
	// triangle 3
	// vertices.push([ 0.7,   0.1]); 
	// vertices.push([ 0.6,   0.0]); 
	// vertices.push([ 0.7,  -0.1]); 

	// // triangle 4
	// vertices.push([ 0.7,  0.1]); 
	// vertices.push([ 0.7, -0.1]); 
	// vertices.push([ 0.8,  0.0]);


	// make the needed GL calls to tranfer vertices

	// bind the buffer, i.e. this becomes the current buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	// transfer the data -- this is actually pretty inefficient!
	// flatten() function is defined in MV.js - this simply creates only
	// the vertex coordinate data array - all other metadata in Javascript
	// arrays should not be in the vertex buffer.
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	//gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	

	// Associate out shader variables with our data buffer
	// note: "vposition" is a named variable used in the vertex shader and is
	// associated with vPosition here
	var vPosition = gl.getAttribLocation( program, "vPosition");

	// specify the format of the vertex data - here it is a float with
	// 2 coordinates per vertex - these are its attributes
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);
}

function render() {
	// this is render loop

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );

	// adds a square to the vertex list (2 triangles, consisting of 3 vertices
	// each

	theta += 0.1;

	// set the theta value
	gl.uniform1f(thetaLoc, theta);
	
	// set the color, change it every 10 frames
	counter++;

	if (counter%10 == 0)
		{
			color_vals = [Math.random(), Math.random(), Math.random(), 1.];
		}
	
	// set the color in the shader
	gl.uniform4fv (colorLoc, color_vals)
	
	num_triangles = 2;
	// draw the square as a set of triangles
    gl.drawArrays(gl.TRIANGLES, 0, num_triangles*3);
	
	theta2 -= 0.4;
	counter2++;
	if (counter2%3 == 0)
	{
		color_vals2 = [Math.random(), Math.random(), Math.random(), 1.];
	}
	gl.uniform1f(thetaLoc, theta2);
	gl.uniform4fv (colorLoc, color_vals2);
	
	gl.drawArrays(gl.TRIANGLES, 6, num_triangles*3);


	// TODO: The above code draws the square; now you will call 
	//  gl to draw the second square; the vertices are following the
	//  vertices of the first square and start at index ??

	//  TODO: also change the color of the smaller square 

	//  TODO: make the second square rotate in the opposite direction
	//   and faster.

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
