// some globals
var gl;

var theta = 0.0;
var theta2 = 0.0;
var thetaLoc, colorLoc;

var delay = 100;
var direction = true;
var vBufferT, cBufferT , ibuffer;
var program;
var RotateMatLoc;
var colors = [];
var colorsT = [];
var color_vals = [];
var color_vals2 = [];
var result;
var num_lines = 0
var max_prims = 200, num_triangles = 0;

var thetaX = 0.0;
var thetaY = 0.0;
var thetaZ = 0.0;
var RotateX = true
var RotateY = false
var RotateZ = false


window.onload = function init() {
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    RotateMatLoc = gl.getUniformLocation(program , "rotateMatrix");

    // thetaLoc = gl.getUniformLocation( program, "theta" );
	// colorLoc = gl.getUniformLocation(program, "vertColor");
	// gl.uniform4fv (colorLoc, [1., 0., 0., 1.])
	
    /////// Buffer Sizes for different primitives
    vBufferT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER , vBufferT);
    var buffsizeT = max_prims * 6 * 2 * 4;
    gl.bufferData(gl.ARRAY_BUFFER , buffsizeT , gl.STATIC_DRAW);

    /////// Buffer Sizes for different primitives
    cBufferT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER , cBufferT);
    var buffsizeT = max_prims * 6 * 4 * 4;
    gl.bufferData(gl.ARRAY_BUFFER , buffsizeT , gl.STATIC_DRAW);

    ibuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER , ibuffer);

    document.getElementById("RotateX").onclick = function() { 
        RotateX = true;
        RotateZ = false;
        RotateY = false;
    };
    document.getElementById("RotateY").onclick = function() { 
        RotateY = true;
        RotateX = false;
        RotateZ = false;
    };
    document.getElementById("RotateZ").onclick = function() { 
        RotateZ = true;
        RotateX = false;
        RotateY = false;
    };
    
    // document.getElementById("RotateX").addEventListener("click" , RotateAlongX );
    // document.getElementById("RotateY").addEventListener("click" , RotateAlongY );
    // document.getElementById("RotateZ").addEventListener("click" , RotateAlongZ );


    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    updateVertices();
    render();
};

function RotateAlongX(){
    thetaX += 0.2;
    result = mat4( vec4(Math.cos(thetaX), 0 , Math.sin(thetaX) , 0),
                  vec4(0,1,0,0),
                  vec4(-Math.sin(thetaX), 0, Math.cos(thetaX) , 0),
                  vec4(0,0,0,1) );
    gl.uniformMatrix4fv( RotateMatLoc , false , flatten(result));
}

function RotateAlongY(){
    thetaY += 0.2;
    result =    mat4( vec4(1,0,0,0),
                  vec4(0, Math.cos(thetaY) , -Math.sin(thetaY) , 0),
                  vec4(0, Math.sin(thetaY) , Math.cos(thetaY) , 0),
                  vec4(0,0,0,1) 
                  );
    gl.uniformMatrix4fv( RotateMatLoc , false , flatten(result));
}

function RotateAlongZ(){
    thetaZ += 0.1;
    result = mat4(  vec4(Math.cos(thetaZ), -Math.sin(thetaZ) , 0 , 0),
                    vec4(Math.sin(thetaZ), Math.cos(thetaZ) , 0, 0),
                    vec4(0,0,1,0),
                    vec4(0,0,0,1) 
    );
    gl.uniformMatrix4fv( RotateMatLoc , false , flatten(result));
}

function updateVertices()
{
    var vertices = [];
    var vcolors = [];
    var indices = [
        1,0,3,
        3,2,1,
        2,3,7,
        7,6,2,
        3,0,4,
        4,7,3,
        6,5,1,
        1,2,6,
        4,5,6,
        6,7,4,
        5,4,0,
        0,1,5,
    ];

    vertices.push(vec4(-0.5,-0.5,0.5,1.0 ));
	vertices.push(vec4(-0.5,0.5,0.5,1.0  ));
	vertices.push(vec4(0.5,0.5,0.5,1.0   ));
	vertices.push(vec4(0.5,-0.5,0.5,1.0  ));
	vertices.push(vec4(-0.5,-0.5,-0.5,1.0));
	vertices.push(vec4(-0.5,0.5,-0.5,1.0 ));
	vertices.push(vec4(0.5,0.5,-0.5,1.0  ));
	vertices.push(vec4(0.5,-0.5,-0.5,1.0 ));

    vcolors.push(vec4(0.0,0.0,0.0,1.0));
    vcolors.push(vec4(1.0,0.0,0.0,1.0));
    vcolors.push(vec4(1.0,1.0,0.0,1.0));
    vcolors.push(vec4(0.0,1.0,0.0,1.0));
    vcolors.push(vec4(0.0,0.0,1.0,1.0));
    vcolors.push(vec4(1.0,0.0,1.0,1.0));
    vcolors.push(vec4(0.0,1.0,1.0,1.0));
    vcolors.push(vec4(1.0,1.0,1.0,1.0));

    ibuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER , ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER , new Uint8Array(indices) , gl.STATIC_DRAW);

    //vBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferT);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
    
    //ColorBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferT);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vcolors) , gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    //updateVertices();

    if (RotateX){
        RotateAlongX();
    }
    
    if (RotateY){
        RotateAlongY();
    }

    if (RotateZ){
        RotateAlongZ();
    }

    
    gl.drawElements(gl.TRIANGLES, 36 , gl.UNSIGNED_BYTE , 0);
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}