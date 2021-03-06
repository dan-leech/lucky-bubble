// @flow
import {
  defaultLifeCycle
} from 'aq-miniapp-core';
import Game from './components/Game';
import Assets, {ASSETS} from './assets';
import TextureAnimator from './utils/TextureAnimator';
import DeviceOrientationControls from './utils/DeviceOrientationControls';


// Three.js NodeLibrary
import './utils/nodes/GLNode';
import './utils/nodes/RawNode';
import './utils/nodes/TempNode';
import './utils/nodes/InputNode';
import './utils/nodes/ConstNode';
import './utils/nodes/VarNode';
import './utils/nodes/FunctionNode';
import './utils/nodes/FunctionCallNode';
import './utils/nodes/AttributeNode';
import './utils/nodes/NodeBuilder';
import './utils/nodes/NodeLib';
import './utils/nodes/NodeFrame';
import './utils/nodes/NodeMaterial';

// Accessors
import './utils/nodes/accessors/PositionNode';
import './utils/nodes/accessors/NormalNode';
import './utils/nodes/accessors/UVNode';
import './utils/nodes/accessors/ScreenUVNode';
import './utils/nodes/accessors/ColorsNode';
import './utils/nodes/accessors/CameraNode';
import './utils/nodes/accessors/ReflectNode';
import './utils/nodes/accessors/LightNode';

// Inputs
import './utils/nodes/inputs/IntNode';
import './utils/nodes/inputs/FloatNode';
import './utils/nodes/inputs/ColorNode';
import './utils/nodes/inputs/Vector2Node';
import './utils/nodes/inputs/Vector3Node';
import './utils/nodes/inputs/Vector4Node';
import './utils/nodes/inputs/TextureNode';
import './utils/nodes/inputs/Matrix3Node';
import './utils/nodes/inputs/Matrix4Node';
import './utils/nodes/inputs/CubeTextureNode';

// Math
import './utils/nodes/math/Math1Node';
import './utils/nodes/math/Math2Node';
import './utils/nodes/math/Math3Node';
import './utils/nodes/math/OperatorNode';

// Utils
import './utils/nodes/utils/SwitchNode';
import './utils/nodes/utils/JoinNode';
import './utils/nodes/utils/TimerNode';
import './utils/nodes/utils/RoughnessToBlinnExponentNode';
import './utils/nodes/utils/VelocityNode';
import './utils/nodes/utils/LuminanceNode';
import './utils/nodes/utils/ColorAdjustmentNode';
import './utils/nodes/utils/NoiseNode';
import './utils/nodes/utils/ResolutionNode';
import './utils/nodes/utils/BumpNode';
import './utils/nodes/utils/BlurNode';
import './utils/nodes/utils/UVTransformNode';

// Standard Material
import './utils/nodes/materials/StandardNode';
import './utils/nodes/materials/StandardNodeMaterial';

const THREE = window.THREE;

TextureAnimator(THREE);
DeviceOrientationControls(THREE);

type Props = {
  additionalInfo: {
    background: string
  }
}

// Graphics variables
let clock = new THREE.Clock();

let mouseCoords = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
const bubbleColor = 0x09D539;
const bubbleOpacity = 0.9

const bubbleFadeSpeed = 2;
const burstSpeed = 20;
const startBubbleBurstSpeed = 5;


// game
let bubbles = [];
let isGameRunning = false;
let isGameStartScreen = false;
let gameTriesLeft = 0;
let gameWinTotal = 0;
let gameTimer = null;
const gameTriesTotal = 20; // total tries to win - random 5
const gameTime = 10; // seconds

let mobileBrowser = false;

if ( navigator.userAgent.match( /Android/i )
    || navigator.userAgent.match( /webOS/i )
    || navigator.userAgent.match( /iPhone/i )
    || navigator.userAgent.match( /iPad/i )
    || navigator.userAgent.match( /iPod/i )
    || navigator.userAgent.match( /BlackBerry/i )
    || navigator.userAgent.match( /Windows Phone/i )
){
  mobileBrowser = true;
}
else {
  mobileBrowser = false;
}
// gui
const guiStartBubblePosition = new THREE.Vector3(0, -100, -600);
const guiTopContainer = document.getElementById('top-container');
const guiCenterContainer = document.getElementById('center-container');
const guiWin = document.getElementById('win');
const guiGameOver = document.getElementById('game-over');

// input for smooth
const inputMaxTiltedAngle = Math.PI / 3;
const inputScale = 5000;
const inputCameraSpeed = 0.01;
let inputBeta = 0;
let inputGamma = 0;


export default class SampleGame extends Game<Props> {

sceneCube: THREE.Scene;
geometry: THREE.Geometry;
alphaTexture: THREE.Texture;
cubeTexture: THREE.Texture;
burstTexture: THREE.Texture;
bubbleTexture: THREE.Texture;
playTexture: THREE.Texture;
emoticonsTextures: [];
coins: [];
material: THREE.Material;
camera: THREE.Camera;
deviceControls: THREE.DeviceOrientationControls;
cameraCube: THREE.Camera;
billboard: THREE.Sprite;
startBubble: THREE.Mesh;
startBubblePlay: THREE.Sprite;

gameDidMount() {
  // Do loading of assets here, passing our THREE.LoadingManager
  // instance to each loader needed. After loading, assetsDidLoad()
  // will be called
  this.playTexture = new THREE.TextureLoader(this.loadingManager).load(Assets.textures.playBtn);
  this.alphaTexture = new THREE.TextureLoader(this.loadingManager).load(Assets.textures.whitePixel);
  this.burstTexture = new THREE.TextureLoader(this.loadingManager).load(this.props.engagementInfo.popAnimation);

  this.cubeTexture = new THREE.CubeTextureLoader(this.loadingManager).load(this.props.engagementInfo.cubeBackground);

}

assetsDidLoad() {
  this._initGraphics();
  this._initInput();
  this._initGui();

  this.animate();

  this._loadOtherAssets();

  defaultLifeCycle.informReady();
}

gameDidReset(newProps: Props) {
  // This event fires when the host app
  // requests a game reset
  // Subclasses need to override this
  this._initGui();
}

_initGraphics() {
  this.renderer.autoClear = false;

  const size = this.renderer.getSize();
  this.camera = new THREE.PerspectiveCamera(60, size.width / size.height, 1, 100000);
  this.camera.position.z = 3200;

  this.cameraCube = new THREE.PerspectiveCamera(60, size.width / size.height, 1, 100000);

  this.camera.lookAt(this.scene.position);
  this.cameraCube.rotation.copy(this.camera.rotation);

  this.sceneCube = new THREE.Scene();
  this.geometry = new THREE.SphereGeometry(100, 32, 16);

  // Skybox
  let shader = THREE.ShaderLib["cube"];
  shader.uniforms["tCube"].value = this.cubeTexture;
  let material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,

    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  });
  let mesh = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), material);

  this.sceneCube.add(mesh);
}

_initInput() {
  const scope = this;

  this.deviceControls = THREE.DeviceOrientationControls();

  if ('ontouchstart' in document.documentElement) {
    document.addEventListener('touchstart', function (event) {
      scope._onTouchBubble(scope, event);
    }, false);
  } else {
    document.addEventListener('mousedown', function (event) {
      scope._onTouchBubble(scope, event);
    }, false);
  }
}

_initGui() {
  guiTopContainer.style.display = 'flex';

  guiCenterContainer.style.display = 'none';
  guiWin.style.display = 'none';
  guiGameOver.style.display = 'none';

  this._createStartButton();
}

_loadOtherAssets() {
  let scope = this;

  this.bubbleTexture = new THREE.TextureLoader().load(this.props.engagementInfo.bubbleImage);

  this.emoticonsTextures = [];
  this.props.engagementInfo.emoticons.forEach(function (item) {
    scope.emoticonsTextures.push(new THREE.TextureLoader().load(item));
  });

  this.coins = [];
  this.props.engagementInfo.coins.forEach(function (item) {
    scope.coins.push({texture: new THREE.TextureLoader().load(item.icon), value: item.value});
  });
}

_onTouchBubble(scope, event) {
  let x = event.clientX || (event.touches ? event.touches[0].pageX : 0);
  let y = event.clientY || (event.touches ? event.touches[0].pageY : 0);
  mouseCoords.set(
      (x / window.innerWidth) * 2 - 1,
      -(y / window.innerHeight) * 2 + 1
  );

  let intersections;

  if (isGameRunning) {
    raycaster.setFromCamera(mouseCoords, scope.camera);
    intersections = raycaster.intersectObjects(bubbles.filter(item => !item._isPoping));

    if (intersections.length > 0) {
      let intersected = intersections[0].object;
      if (intersected._isPoping || (scope.props.shouldWin && gameTriesLeft <= 0)) return;
      intersected._isPoping = true;

      gameTriesLeft--;
      function checkGameOver() {
        if (scope.props.shouldWin && gameTriesLeft <= 0) {
          scope._guiGameOver()
        }
      }

      function showCoin() {
        if(scope.props.shouldWin) {
          let spriteMap;
          let coin = scope.coins[Math.ceil(Math.random() * scope.coins.length - 1)];
          spriteMap = coin.texture;

          let spriteMaterial = new THREE.SpriteMaterial({map: spriteMap, color: 0xffffff});
          scope.billboard = new THREE.Sprite(spriteMaterial);
          scope.billboard.position.copy(intersected.position);
          scope.billboard.scale.x = scope.billboard.scale.y = 750;
          scope.scene.add(scope.billboard);

          return scope.billboard;
        }

        return null;
      }

      intersected._animator
          .onComplete(function (animator, tries) {
            intersected._isPoped = true;

            let billboard = tries <= 0 ? showCoin() : null

            if(mobileBrowser) {
              setTimeout(function () {
                scope._removeSceneObject(billboard);
                checkGameOver();
              }, 900);
            }
            else {
              setTimeout(function () {
                scope._removeSceneObject(billboard);
                checkGameOver();
              }, 400);
            }
          })
          .reset()
          .start(intersected.position, gameTriesLeft);

    }
  } else {
    if (!isGameStartScreen) return;

    raycaster.setFromCamera(mouseCoords, scope.cameraCube);
    intersections = raycaster.intersectObjects([scope.startBubble]);

    if (intersections.length > 0) {
      isGameStartScreen = false;
      let intersected = intersections[0].object;
      if (intersected._isPoping) return;
      intersected._isPoping = true;

      intersected._animator
          .onComplete(function () {
            intersected._isPoped = true;
          })
          .reset()
          .start(intersected.position);
    }
  }
}

_startGame() {
  let scope = this;

  if (this.props.shouldWin) {
    gameTriesLeft = Math.ceil(gameTriesTotal - Math.random() * 5);
  } else {
    gameTimer = gameTime
  }

  guiTopContainer.style.display = 'none';

  setTimeout(function () {
    scope._createBubbles();
    isGameRunning = true;
  }, 1500);
}

_guiGameOver() {
  const scope = this;
  isGameRunning = false;

  setTimeout(function () {
    scope._hideBubbles();
  }, 200);

  setTimeout((function () {
    guiWin.style.display = 'none';
    guiGameOver.style.display = 'none';
    guiCenterContainer.style.display = 'flex';

    // END of the GAME
    if (scope.props.shouldWin) {
      guiWin.style.display = 'block';
    } else {
      guiGameOver.style.display = 'block';
    }

    defaultLifeCycle.setResult({
      winCriteria: scope.props.shouldWin,
      score: {
        value: gameWinTotal
      },
      resultImageUrl: this.props.engagementInfo.background
    });

    setTimeout(() => {
      defaultLifeCycle.end();
    }, 2000);
  }).bind(this), 1000);
}

gameWillUnmount() {
  // Do cleanup here
  this.geometry.dispose();
  this.material.dispose();
  this.playTexture.dispose();
  this.alphaTexture.dispose();
  this.burstTexture.dispose();
  this.cubeTexture.dispose();
  this.bubbleTexture.dispose();
  this.emoticonsTextures.forEach(function (item) {
    item.dispose();
  });
  this.coins.forEach(function (item) {
    item.texture.dispose();
  });

  this._removeSceneObject(this.billboard);
  this._removeBubbles();

  this.deviceControls.dispose();
}

_createStartButton() {
  let mtl = new THREE.StandardNodeMaterial();

  var mask = new THREE.TextureNode( this.playTexture );
  mask.coord = new THREE.UVTransformNode();
  mask.coord.setUvTransform( 1.4, 0, 6, 4, THREE.Math.degToRad( 0 ) );

  var maskAlphaChannel = new THREE.SwitchNode( mask, 'w' );
  var blend = new THREE.Math3Node(
      new THREE.ColorNode( 0x09D539 ),
      new THREE.ColorNode( 0xffffff ),
      maskAlphaChannel,
      THREE.Math3Node.MIX
  );

  var roughnessA = new THREE.FloatNode( 1.0 );
  var metalnessA = new THREE.FloatNode( 1.0 );
  var roughnessB = new THREE.FloatNode( 0 );
  var metalnessB = new THREE.FloatNode( 1 );
  var roughness = new THREE.Math3Node(
      roughnessA,
      roughnessB,
      mask,
      THREE.Math3Node.MIX
  );
  var metalness = new THREE.Math3Node(
      metalnessA,
      metalnessB,
      mask,
      THREE.Math3Node.MIX
  );

  mtl.color = blend;
  mtl.roughness = roughness;
  mtl.metalness = metalness;
  mtl.environment =
      new THREE.Math3Node(
          new THREE.CubeTextureNode( this.cubeTexture ),
          new THREE.ColorNode( 0xffffff ),
          maskAlphaChannel,
          THREE.Math3Node.MIX
      );

  let animator = new THREE.TextureAnimator(this.burstTexture, this.sceneCube, this.cameraCube, 19, 1, 19, burstSpeed);

  // build shader
  mtl.build();
  this.startBubble = new THREE.Mesh(this.geometry, mtl);
  this.sceneCube.add(this.startBubble);

  this.startBubble._animator = animator;

  isGameStartScreen = true;
}

_createBubbles() {
  bubbles = [];

  var mtl = new THREE.MeshBasicMaterial( { color: bubbleColor, envMap: this.cubeTexture, opacity: bubbleOpacity, wireframe:false, transparent:true } );

  for (let i = 0; i < 200; i++) {
    let animator = new THREE.TextureAnimator(this.burstTexture, this.scene, this.camera, 19, 1, 19, burstSpeed, 850);
    let mesh = new THREE.Mesh(this.geometry, mtl);

    mesh.position.x = Math.random() * 5000 - 2500;
    mesh.position.y = Math.random() * 5000 - 2500;
    mesh.position.z = Math.random() * 5000 - 2500;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 4;
    this.scene.add(mesh);
    mesh._index = i;
    mesh._creating = false;
    mesh._animator = animator;
    bubbles.push(mesh);
  }
}

_hideBubbles() {
  for (let i = 0, il = bubbles.length; i < il; i++) {
    bubbles[i]._hidding = true;
  }
}

_removeBubbles() {
  for (let i = 0, il = bubbles.length; i < il; i++) {
    this._removeSceneObject(bubbles[i]);
  }
}

_removeSceneObject(object) {
  if (!object) return
  this.scene.remove(object);
  this._disposeObjectMaterials(object)
}

_disposeObjectMaterials(object) {
  if (object.material.length) {
    object.material.forEach(function (item) {
      item.dispose();
    });
  } else
    object.material.dispose();
}

render() {
  let delta = clock.getDelta();

  if (isGameRunning) gameTimer -= delta
  if (!this.props.shouldWin && gameTimer < 0)
    this._guiGameOver()

  this._trackBubbles(delta);
  this._controlCamera();

  this.renderer.render(this.sceneCube, this.cameraCube);
  this.renderer.render(this.scene, this.camera);
}

_controlCamera() {
  inputBeta = Math.ceil(THREE.Math.clamp(this.deviceControls.beta - 45 * Math.PI / 180, -inputMaxTiltedAngle, inputMaxTiltedAngle) * inputScale);
  inputGamma = Math.ceil((THREE.Math.clamp(this.deviceControls.gamma, -inputMaxTiltedAngle, inputMaxTiltedAngle)) * inputScale);

  this.camera.position.x += (inputGamma - this.camera.position.x) * inputCameraSpeed;
  this.camera.position.y += (-inputBeta - this.camera.position.y) * inputCameraSpeed;

  this.camera.lookAt(this.scene.position);
  this.cameraCube.rotation.copy(this.camera.rotation);
}

_trackBubbles(deltaTime) {
  let timer = 0.0001 * Date.now();

  if (this.startBubble) {
    let vec = new THREE.Vector3(0, 0, 0);
    vec.copy(guiStartBubblePosition);
    vec.applyQuaternion(this.camera.quaternion);
    this.startBubble.position.copy(vec);

    this.startBubble.lookAt(this.camera.position);

    this.startBubble._animator.update(deltaTime);

    if (this.startBubble._isPoping) {
      this.sceneCube.remove(this.startBubble);
    }
    if (this.startBubble._isPoped) {
      this.startBubble._animator.dispose();
      this.startBubble = null;
      this._startGame();
    }
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    let bubble = bubbles[i];
    if (bubble._isPoping) {
      this._removeSceneObject(bubble);
    }
    if (bubble._isPoped) {
      bubble._animator.dispose();
      bubbles.splice(i, 1);
      continue;
    }

    if (bubble._hidding) {
      bubble.material.opacity -= bubbleFadeSpeed * deltaTime;
      if(bubble.material.opacity <= 0) {
        bubble.material.opacity = 0;
        this._removeSceneObject(bubble);
        bubble._animator.dispose();
        bubbles.splice(i, 1);
        continue;
      }
    } else if (bubble._creating) {
      bubble.material.opacity += bubbleFadeSpeed * deltaTime;
      if(bubble.material.opacity >= bubbleOpacity) {
        bubble.material.opacity = bubbleOpacity;
        bubble._creating = false;
      }
    }

    bubble._animator.update(deltaTime);

    bubble.position.x = 4000 * Math.cos(timer + bubble._index);
    bubble.position.y = 4000 * Math.sin(timer + bubble._index * 1.1);

    bubble.lookAt(this.camera.position);
  }
}
}
