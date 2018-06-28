// @flow

const THREE = window.THREE;

export default class Game<T> {
  props: T;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  loadingManager: THREE.LoadingManager;

  constructor(renderer: THREE.WebGLRenderer, props: T) {
    this.props = props;
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onLoad = this.assetsDidLoad.bind(this);
    this.loadingManager.onProgress = this.onAssetLoadProgress.bind(this);
    this.loadingManager.onError = this.onAssetLoadError.bind(this);
  }

  onAssetLoadProgress(url: string, itemsLoaded: number, itemsTotal: number) {
    //Display the file `url` currently being loaded
    console.log("loading: " + url);

    //Display the percentage of files currently loaded
    console.log("progress: " + itemsLoaded * 100.0 / itemsTotal + "%");
  }

  onAssetLoadError(url: string) {
    console.log('There was an error loading ' + url);
  }

  assetsDidLoad() {

  }

  onReset(data: T) {
    console.log(`onReset: ${JSON.stringify(data)}`);
  }

  gameDidMount() {

  }

  gameWillUnmount() {

  }



  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  render() {

  }

}
