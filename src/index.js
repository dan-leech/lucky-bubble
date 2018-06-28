 // @flow
import MiniApp from './components/MiniApp';
import SampleGame from './SampleGame';
import px from  "./images/px.png";
import nx from  "./images/nx.png";
import py from  "./images/py.png";
import ny from  "./images/ny.png";
import pz from  "./images/pz.png";
import nz from  "./images/nz.png";
import popAnimation from  "./images/BiggerSheet.png";


const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const DEVT = true;

/**
 * shouldWin - Tells the MiniApp to force the current game iteration to win
 * winImage - Optional. Image URL of item won. Only present if shouldWin is true.
 * source - User info of current user playing the MiniApp
 * engagementSource - User info of user who created the instance of the MiniApp
 * additionalInfo - Data specific to the MiniApp.
 */
let data = {
  shouldWin: true,
  winImage: 'https://s3.amazonaws.com/bengga-web-funtypes/gift.png',
  engagementInfo: {
    bubbleImage: "https://threejs.org/examples/textures/decal/decal-diffuse.png",
    bubbleFull: "http://example.com/example1.jpg",
    bubblePopped: "https://threejs.org/examples/textures/decal/decal-diffuse.png",
    emoticons: [
      "https://threejs.org/examples/textures/sprites/disc.png",
      "https://threejs.org/examples/textures/sprite0.png",
      "https://threejs.org/examples/textures/sprite2.png",
    ],
    coins: [
      {icon: "https://threejs.org/examples/textures/sprites/disc.png", value: 10},
      {icon: "https://threejs.org/examples/textures/sprite0.png", value: 15},
      {icon: "https://threejs.org/examples/textures/sprite2.png", value: 20},
    ],
    background: "http://example.com/example5.jpg",
    cubeBackground: [
      //"https://threejs.org/examples/textures/cube/pisa/px.png",
      //"https://threejs.org/examples/textures/cube/pisa/nx.png",
      //"https://threejs.org/examples/textures/cube/pisa/py.png",
      //"https://threejs.org/examples/textures/cube/pisa/ny.png",
      //"https://threejs.org/examples/textures/cube/pisa/pz.png",
      //"https://threejs.org/examples/textures/cube/pisa/nz.png",
        px,
        nx,
        py,
        ny,
        pz,
        nz,
    ],
    popAnimation: popAnimation
  }
}

// console.log(JSON.stringify(data));

const miniApp = new MiniApp({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  game: SampleGame,
  devt: DEVT,
  data: data
})






