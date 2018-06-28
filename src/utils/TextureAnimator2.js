module.exports = function (THREE) {

  THREE.TextureAnimator = function (texture, speed,  fromScale, toScale, hidden) {
    // note: texture passed by reference, will be updated by the update function.
    this.fadeSpeed = speed;

    const transform = {x: 0, y: 0};

    let scale = fromScale;
    let scaleAlpha = (fromScale - toScale) / 3;
    let angle = Math.PI/2 - (Math.random() * Math.PI);

    this.alpha = new THREE.FloatNode( hidden ? 0 : 1 );
    this.maskAlpha = new THREE.FloatNode( 1 );

    this.alphaMask = new THREE.TextureNode( texture );
    this.alphaMask.coord = new THREE.UVTransformNode();
    this.alphaMask.coord.setUvTransform( 0, 0, scale, scale, angle );

    this.alphaNode = new THREE.Math3Node(
      this.alpha,
      this.maskAlpha,
      new THREE.SwitchNode( this.alphaMask, 'w' ),
      THREE.Math3Node.MIX
    );

    // completion callback
    this.onCompleteCallback = null;

    // running
    let isRunning = false;

    this.onComplete = function (callback) {
      this.onCompleteCallback = callback;

      return this;
    };

    this.start = function () {
      isRunning = true;
      this.alpha.number = 1.0;
      this.maskAlpha.number = 0.0;

      return this;
    };

    this.update = function (milliSec) {
      if (!isRunning) return;

      scale -= milliSec * speed;
      this.alphaMask.coord.setUvTransform( transform.x, transform.y, scale, scale, angle );

      if(scale <= scaleAlpha) {
        this.alpha.number = (scale - toScale)/(scaleAlpha - toScale);
      }

      if(scale <= toScale)
      {
          isRunning = false;
          if (typeof this.onCompleteCallback === 'function')
            this.onCompleteCallback(this);
      }
    };

    this.reset = function () {
      this.alpha.number = 1.0;
      this.maskAlpha.number = 1.0;

      scale = fromScale;
      angle = Math.PI/2 - (Math.random() * Math.PI);

      this.alphaMask.coord.setUvTransform( transform.x, transform.y, scale, scale, angle );

      return this;
    };
  }
};