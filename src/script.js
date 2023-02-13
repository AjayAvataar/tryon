"use strict";
// exports.__esModule = true;
// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
// import {foo} from './other.js'

///// fooooooo
import './sth.css';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { AxesHelper } from 'three';
// import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";

window.addEventListener("resize", resizeCanvas);

function resizeCanvas (){
    const elements = document.getElementsByTagName("canvas");
    Array.from(elements).forEach(element => {
        // console.log('element', element);
        element.width = window.innerWidth;
        element.height = window.innerHeight;
        element.style.removeProperty('width');
        element.style.removeProperty('height');
    });
    
}

resizeCanvas ();


var controls = window;
var drawingUtils = window;
var mpObjectron = window;
var config = { locateFile: function (file) {
        return "https://cdn.jsdelivr.net/npm/@mediapipe/objectron@0.4.1636596145/".concat(file);
    } };


var canvasElement = document.getElementById('twoD');
var controlsElement = document.getElementsByClassName('control-panel')[0];
var canvasCtx = canvasElement.getContext('2d');


var _landmarks = [[], []];
var landmarks = null;
function onResults(results) {
    document.body.classList.add('loaded');
    canvasCtx.save();
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    // console.log('results', results);
    if (!!results.objectDetections) {
        for (var _i = 0, _a = results.objectDetections; _i < _a.length; _i++) {
            var detectedObject = _a[_i];
            // Reformat keypoint information as landmarks, for easy drawing.
            // console.log('_landmarks', _landmarks);
            _landmarks[_i] = detectedObject.keypoints.map(function (x) { return x.point3d; });
            landmarks = detectedObject.keypoints.map(function (x) { return x.point2d; });
            // console.log('2d', landmarks);
            drawingUtils.drawConnectors(canvasCtx, landmarks, mpObjectron.BOX_CONNECTIONS, { color: '#FF0000' });
            // Draw Axes
            drawAxes(canvasCtx, landmarks, {
                x: '#00FF00',
                y: '#FF0000',
                z: '#0000FF'
            });
            // Draw centroid.
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[0]], { color: '#FFFFFF' });
        }
    }
    canvasCtx.restore();
}
var objectron = new mpObjectron.Objectron(config);
objectron.onResults(onResults);

objectron.setOptions({
    selfieMode: false,
    modelName: 'Shoe',
    maxNumObjects: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
})

var videoElement = document.getElementsByClassName('input_video')[0];
// console.info('Video element', videoElement);
// navigator.mediaDevices.getUserMedia({
//     audio: false,
//     video: {
//       facingMode: 'environment',
//     }
//   })
//     .then(stream => videoElement.srcObject = stream)
//     .catch(console.error);

// canvasCtx.canvas.width = window.innerWidth;
// canvasCtx.canvas.height = window.innerHeight;

// let flag = false;
let flag = true;


if(flag){
// #ajay switching back to camera feed, (remove attributes from video tag as well)
    // const camm = new Camera();
    // console.log(camm);
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await objectron.send({ image: videoElement });
        },
        width: 1280,
        height: 720
    });
    console.log('h is', camera.h);
    console.log('facing mode', camera.h.facingMode);
    camera.h.facingMode = 'environment';
    console.log('camera is', camera);
    camera.start();
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
else {
    async function onFrame() {
        if (!videoElement.paused && !videoElement.ended) {
        await objectron.send({
            image: videoElement
        });
        // https://stackoverflow.com/questions/65144038/how-to-use-requestanimationframe-with-promise    
        await new Promise(requestAnimationFrame);
        onFrame();
        }
        else
        setTimeout(onFrame, 500);
    }
        //   load the video
        // must be same domain otherwise it will taint the canvas! 
    // videoElement.src = "./mylocalvideo.mp4"; 
    videoElement.onloadeddata = (evt) => {
        let video = evt.target;
        console.log('video on load', evt);
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;

        videoElement.play();
        onFrame();
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawAxes(canvasCtx, landmarks, color) {
    var _a = mpObjectron.BOX_KEYPOINTS, BACK_BOTTOM_RIGHT = _a.BACK_BOTTOM_RIGHT, BACK_TOP_LEFT = _a.BACK_TOP_LEFT, BACK_TOP_RIGHT = _a.BACK_TOP_RIGHT, FRONT_BOTTOM_LEFT = _a.FRONT_BOTTOM_LEFT, FRONT_BOTTOM_RIGHT = _a.FRONT_BOTTOM_RIGHT, FRONT_TOP_RIGHT = _a.FRONT_TOP_RIGHT, FRONT_TOP_LEFT = _a.FRONT_TOP_LEFT, CENTER = _a.CENTER;
    var xMidPoint = lineIntersection([landmarks[BACK_BOTTOM_RIGHT], landmarks[FRONT_TOP_RIGHT]], [landmarks[BACK_TOP_RIGHT], landmarks[FRONT_BOTTOM_RIGHT]]);
    var yMidPoint = lineIntersection([landmarks[BACK_TOP_LEFT], landmarks[FRONT_TOP_RIGHT]], [landmarks[FRONT_TOP_LEFT], landmarks[BACK_TOP_RIGHT]]);
    // console.log('yMidPoint', yMidPoint);
    var zMidPoint = lineIntersection([landmarks[FRONT_TOP_RIGHT], landmarks[FRONT_BOTTOM_LEFT]], [landmarks[FRONT_TOP_LEFT], landmarks[FRONT_BOTTOM_RIGHT]]);
    var LINE_WIDTH = 8;
    var TRIANGLE_BASE = 2 * LINE_WIDTH;
    drawingUtils.drawConnectors(canvasCtx, [landmarks[CENTER], xMidPoint], [[0, 1]], { color: color.x, lineWidth: LINE_WIDTH });
    drawingUtils.drawConnectors(canvasCtx, [landmarks[CENTER], yMidPoint], [[0, 1]], { color: color.y, lineWidth: LINE_WIDTH });
    drawingUtils.drawConnectors(canvasCtx, [landmarks[CENTER], zMidPoint], [[0, 1]], { color: color.z, lineWidth: LINE_WIDTH });
    drawTriangle(canvasCtx, xMidPoint, TRIANGLE_BASE, TRIANGLE_BASE, color.x, arctan360(xMidPoint.x - landmarks[CENTER].x, xMidPoint.y - landmarks[CENTER].y) +
        Math.PI / 2);
    drawTriangle(canvasCtx, yMidPoint, TRIANGLE_BASE, TRIANGLE_BASE, color.y, arctan360(yMidPoint.x - landmarks[CENTER].x, yMidPoint.y - landmarks[CENTER].y) +
        Math.PI / 2);
    drawTriangle(canvasCtx, zMidPoint, TRIANGLE_BASE, TRIANGLE_BASE, color.z, arctan360(zMidPoint.x - landmarks[CENTER].x, zMidPoint.y - landmarks[CENTER].y) +
        Math.PI / 2);
}
function lineIntersection(a, b) {
    var yDiffB = b[0].y - b[1].y;
    var xDiffB = b[0].x - b[1].x;
    var top = (a[0].x - b[0].x) * yDiffB - (a[0].y - b[0].y) * xDiffB;
    var bot = (a[0].x - a[1].x) * yDiffB - (a[0].y - a[1].y) * xDiffB;
    var t = top / bot;
    return {
        x: a[0].x + t * (a[1].x - a[0].x),
        y: a[0].y + t * (a[1].y - a[0].y),
        depth: 0
    };
}
function drawTriangle(ctx, point, height, base, color, rotation) {
    if (rotation === void 0) { rotation = 0; }
    var canvas = ctx.canvas;
    var realX = canvas.width * point.x;
    var realY = canvas.height * point.y;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.translate(realX, realY);
    ctx.rotate(rotation);
    ctx.moveTo(base / 2, 0);
    ctx.lineTo(0, -height);
    ctx.lineTo(-base / 2, 0);
    ctx.lineTo(base / 2, 0);
    ctx.translate(-realX, -realY);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
function arctan360(x, y) {
    if (x === 0) {
        return y >= 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    var angle = Math.atan(y / x);
    if (x > 0) {
        return angle;
    }
    return y >= 0 ? (angle + Math.PI) : angle - Math.PI;
}

/////foooooooo

// console.log('orbit controls', OrbitControls);

const scene = new THREE.Scene();

for(let i = 0; i < 9; ++i){
    const geometry = new THREE.SphereGeometry(0.001,10,10);
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

const canvas = document.getElementById('webgl');

// canvas.width = screen.width;
// canvas.height = screen.height;

const sizes ={
    height: window.innerHeight,
    width: window.innerWidth,
}

let cam = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.25,
    20
  );
  cam.position.set(0, 0.6, 2);
scene.add(cam);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true 
})

renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor( 0x000000, 0 )
renderer.render(scene, cam);





const loader = new GLTFLoader();

var ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath(
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/basis/'
  );
ktx2Loader.detectSupport( renderer );


loader.setKTX2Loader(ktx2Loader);

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );
loader.setDRACOLoader( dracoLoader );

// Load a glTF resource

let model = null;

loader.load(
    // resource URL
    '/shoe.glb',
    // called when the resource is loaded
    function ( gltf ) {
        scene.add( gltf.scene );
        model = gltf.scene;
        model.name = 'added model';
        console.log('loaded gltf', gltf.scene);
        console.log('load scene', scene);
        model.position.set(0, 0, -1);
        model.scale.set(2, 2, 2);
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

        console.log( 'An error happened' , error);

    }
);

const color = 0xFFFFFF;
const intensity = 10;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

var _a = mpObjectron.BOX_KEYPOINTS, BACK_BOTTOM_RIGHT = _a.BACK_BOTTOM_RIGHT, BACK_TOP_LEFT = _a.BACK_TOP_LEFT, BACK_TOP_RIGHT = _a.BACK_TOP_RIGHT, FRONT_BOTTOM_LEFT = _a.FRONT_BOTTOM_LEFT, FRONT_BOTTOM_RIGHT = _a.FRONT_BOTTOM_RIGHT, FRONT_TOP_RIGHT = _a.FRONT_TOP_RIGHT, FRONT_TOP_LEFT = _a.FRONT_TOP_LEFT, CENTER = _a.CENTER;
var pi = Math.PI;
var vec = new THREE.Vector3();
var pos = new THREE.Vector3(); 
const tick = () => {
    renderer.render(scene, cam);
    requestAnimationFrame(tick);
    // console.log('landmark', _landmarks[0]);
    if(_landmarks[0][FRONT_TOP_LEFT]?.x && model){
        for(let i = 0; i < 9; ++i){
            const landmark = _landmarks[0][i];
            // console.log(landmark.x, ',', landmark.y, ',', landmark.z, ',');
        }
        const a = _landmarks[0][FRONT_TOP_LEFT], b = _landmarks[0][FRONT_TOP_RIGHT], c = _landmarks[0][FRONT_BOTTOM_LEFT], d = _landmarks[0][FRONT_BOTTOM_RIGHT];
        const cen = _landmarks[0][CENTER];

        const mid = new THREE.Vector3(-(a.x + b.x + c.x + d.x) + (4 * cen.x), -(a.y + b.y + c.y + d.y) + (4 * cen.y), -(a.z + b.z + c.z + d.z) + (4 * cen.z));
        // mid.normalize();
        // const dirc = new THREE.Vector3(cen.x - mid.x, mid.y - cen.y, mid.z - cen.z);
        // dirc.normalize();
        // console.log('vector', vec);
        // model.position.set(_landmarks[0][CENTER].x, _landmarks[0][CENTER].y, _landmarks[0][CENTER].z);
        model.lookAt(mid)
        var yAxis = new THREE.Vector3(0, 1, 0);
        model.rotateOnAxis(yAxis, pi);
      
        vec.set(
            _landmarks[0][CENTER].x * 2,
            _landmarks[0][CENTER].y * 2, 
            0.5 );
      
        vec.unproject( cam );
      
        vec.sub( cam.position ).normalize();
      
        var distance = ( -1 - cam.position.z ) / vec.z;
      
        pos.copy( cam.position ).add( vec.multiplyScalar( distance ) );  

        console.log('position: ', pos);
        
        model.position.set(pos.x, pos.y, pos.z);
    }
    else{
        
    }
}
tick();


//////fooooooo