//@flow
import burstSprite from './textures/burst-sprite.png';
import whitePixel from './textures/white-pixel.png';
import playBtn from './textures/play.png';
import HDRBtn from './textures/HDR.jpg';


/* Define common assets here */
const Assets = {
  images: {},
  textures: {
    burstSprite: burstSprite,
    whitePixel: whitePixel,
    playBtn: playBtn
  },
  sounds: {},
  fonts: {}
}

/* Array of common assets to be used by Hexi Loader */
export const ASSETS = [
  Assets.textures.crate
];

export default Assets;
