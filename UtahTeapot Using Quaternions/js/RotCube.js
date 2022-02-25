// some globals
var gl;
var delay = 100;
var vBufferT, cBufferT, ibuffer, vNBuffer;
var program;
var RotateMatLoc, OrthoMatLoc, PerspMatLoc, camMatLoc;
var lightPosLoc, ambientLoc , diffuseLoc, specularLoc, shineLoc;
var vcolors = [];
var persp = mat4();
var camMatrix = mat4();
var eye = vec3(), upvector= vec3() , at= vec3() ;
var camMat , vNormal , uNormal , vNormal , U , V;
var WidthS=40 , HeightS=40 , NearS=40 , FarS=-10 ;
var vNormal = [];
var lightPos = vec4(0.0,200.0,0.0,1.0);
var lpx , lpy, lpz;
var drx , dry, drz, drs;
var srx , sry, srz, srs;
var amb, shine;
var TeapotG = createTeapotGeometry(20);

var rotationQuaternionLoc;
var rotateUsingQuat = vec4(1, 0, 0, 0);
var angle = 0.0;
var axis = [0, 0, 1];
var DragMouse = false;
var MouseMoving = false;
var recentPos = [0, 0, 0];
var curx, cury;
var startX, startY;

function lookAtMatrix(eye , up , at)
{
	var v = normalize( subtract(at, eye) );  // view direction vector
    var n = normalize( cross(v, up) );       // perpendicular vector
    var u = normalize( cross(n, v) );        // "new" up vector

    v = negate( v );

    var result = mat4(
        vec4( n, -dot(n, eye) ),
        vec4( u, -dot(u, eye) ),
        vec4( v, -dot(v, eye) ),
        vec4()
    );

    return result;
}

function perspMat(near , far , top , right)
{
	console.log("Inside Perspective");
	top = parseFloat(top);
	right = parseFloat(right);
	near = parseFloat(near);
	far = parseFloat(far);

	return mat4(vec4 (near/right,0,0,0), 
				vec4 (0,near/top,0,0), 
				vec4 (0,0,-(far+near)/(far-near),-2*far*near/(far-near)),
	 			vec4 (0,0,-1.0,0));

}

function translate3d(eye0 , eye1 , eye2){
    return mat4(vec4(1.0 ,0.0, 0.0 , eye0) , 
                vec4(0.0 ,1.0 ,0.0 , eye1) , 
                vec4(0.0, 0.0, 1.0 , eye2) , 
                vec4(0.0 ,0.0, 0.0 , 1.0));
}

function sendLightLoc(){

    var lightPosition = vec4(lpx, lpy, lpz, 0.0 );
    var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
    var lightDiffuse = vec4( drx, dry, drz, 1.0 );
    var lightSpecular = vec4( srx, sry, srz, 1.0 );

    var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
    var materialDiffuse = vec4( 1.0, 0.8, 1.0, 1.0 );
    var materialSpecular = vec4( 1.0, 0.8, 1.0, 1.0 );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition)); 
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),shine);

}

function multiplyQuats(a, b)
{
   // vec4(a.x*b.x - dot(a.yzw, b.yzw), a.x*b.yzw+b.x*a.yzw+cross(b.yzw, a.yzw))
   var s = vec3(a[1], a[2], a[3]);
   var t = vec3(b[1], b[2], b[3]);
   return(vec4(a[0]*b[0] - dot(s,t), add(cross(t, s), add(scale(a[0],t), scale(b[0],s)))));
}

function Mouse_View(x, y) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

function render_whileMoving(x, y)
{
    var dx, dy, dz;

    var currentPos = Mouse_View(x, y);
    if(DragMouse) {
      dx = currentPos[0] - recentPos[0];
      dy = currentPos[1] - recentPos[1];
      dz = currentPos[2] - recentPos[2];

      if (dx || dy || dz) {
	       angle = Math.sqrt(dx*dx + dy*dy + dz*dz);
	       axis[0] = recentPos[1]*currentPos[2] - recentPos[2]*currentPos[1];
	       axis[1] = recentPos[2]*currentPos[0] - recentPos[0]*currentPos[2];
	       axis[2] = recentPos[0]*currentPos[1] - recentPos[1]*currentPos[0];

           recentPos[0] = currentPos[0];
	       recentPos[1] = currentPos[1];
	       recentPos[2] = currentPos[2];
      }
    }
    render();
}

function Start_Rotation(x, y)
{
    DragMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    recentPos = Mouse_View(x, y);
	  MouseMoving=true;
}

function Stop_Rotation(x, y)
{
    DragMouse = false;
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     MouseMoving = false;
    }
}


window.onload = function init() {
	console.log("Inside Init");
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.1, 0.1, 0.1, 1.0 );
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    RotateMatLoc = gl.getUniformLocation(program , "rotateMatrix");
	PerspMatLoc = gl.getUniformLocation(program , "perspMatrix");
    camMatLoc = gl.getUniformLocation(program , "camMatrix");
    lightPosLoc = gl.getUniformLocation(program , "lightPosition");
    ambientLoc = gl.getUniformLocation(program , "ambientProduct");
    diffuseLoc = gl.getUniformLocation(program , "diffuseProduct");
    specularLoc = gl.getUniformLocation(program , "specularProduct");
    shineLoc = gl.getUniformLocation(program , "shininess");
	rotationQuaternionLoc = gl.getUniformLocation(program, "r");
    gl.uniform4fv(rotationQuaternionLoc, flatten(rotateUsingQuat));

    vBufferT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER , vBufferT);
	vNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER , vNBuffer);
    cBufferT = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER , cBufferT);

	eye = vec3(100, -50, 100);
    at = vec3(0, 0, 0);
    upvector = vec3(0, 100, 0);
	camMatrix = lookAtMatrix(eye , upvector , at);
	gl.uniformMatrix4fv( camMatLoc , false , flatten(camMatrix));
	
	//persp = perspMat(150 , 100, 1.2, 1.2);
	persp = perspMat(170 , 100, 12.5, 12.5); //near far top right
	gl.uniformMatrix4fv( PerspMatLoc , false , flatten(persp));

	lpx = document.getElementById("lpx").value;
	lpy = document.getElementById("lpy").value;
	lpz = document.getElementById("lpz").value;
	drx = document.getElementById("drx").value;
	dry = document.getElementById("dry").value;
	drz = document.getElementById("drz").value;
	srx = document.getElementById("srx").value;
	sry = document.getElementById("sry").value;
	srz = document.getElementById("srz").value;
	sendLightLoc();

	document.getElementById("lpx").oninput = function() { 
		lpx = this.value;
		sendLightLoc();
		render();
    };
	document.getElementById("lpy").oninput = function() { 
		lpy = this.value;
		sendLightLoc();
		render();
    };
	document.getElementById("lpz").oninput = function() { 
		lpz = this.value;
		sendLightLoc();
		render();
    };

	//diffuse product
	document.getElementById("drx").oninput = function() { 
		drx = this.value
		sendLightLoc();
		render();
    };
	document.getElementById("dry").oninput = function() { 
		dry = this.value;
		sendLightLoc();
		render();
    };
	document.getElementById("drz").oninput = function() { 
		drz = this.value;
		sendLightLoc();
		render();
    };

	//specular reflectivity
	document.getElementById("srx").oninput = function() { 
		srx = this.value;
		sendLightLoc();
		render();
    };
	document.getElementById("sry").oninput = function() { 
		sry = this.value;
		sendLightLoc();
		render();
    };
	document.getElementById("srz").oninput = function() { 
		srz = this.value;
		sendLightLoc();
		render();
    };

	shine = document.getElementById("shine").value;
	document.getElementById("shine").oninput = function() { 
		shine = parseFloat(this.value);
		sendLightLoc();
		render();
    };

	document.getElementById("gl-canvas").onmousedown = function(event) {
	  var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      Start_Rotation(x, y);
	};
	document.getElementById("gl-canvas").onmouseup = function(event) {
	  var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      Stop_Rotation(x, y);
	};
	
	document.getElementById("gl-canvas").onmousemove = function(event) {
		var x = 2*event.clientX/canvas.width-1;
		var y = 2*(canvas.height-event.clientY)/canvas.height-1;
		render_whileMoving(x, y);
	};

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
	updateVertices();
    render();
};

function updateVertices()
{
    //vertex Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferT);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(TeapotG[0]), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

	//vertex Normals
	gl.bindBuffer(gl.ARRAY_BUFFER, vNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(TeapotG[1]), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if(MouseMoving) {
		axis = normalize(axis);
		var cos = Math.cos(angle/2.0);
		var sin = Math.sin(angle/2.0);
		var rotation = vec4(cos, sin*axis[0], sin*axis[1], sin*axis[2]);
		rotateUsingQuat = multiplyQuats(rotateUsingQuat, rotation);
		gl.uniform4fv(rotationQuaternionLoc, flatten(rotateUsingQuat));
	  }

	gl.drawArrays(gl.TRIANGLES, 0, TeapotG[0].length )
	// setTimeout(
    //     function (){requestAnimFrame(render);}, delay
    // );
}