module.exports = function (THREE) {

  THREE.TextureAnimator = function (textureSource, sceneSource, cameraSource, tilesHoriz, tilesVert, numTiles, tileDispDuration, billboardSize) {
    // note: texture passed by reference, will be updated by the update function.
    let tilesHorizontal = tilesHoriz;
    let tilesVertical = tilesVert;

    let size = billboardSize || 250;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet.
    let numberOfTiles = numTiles;
    let texture = textureSource.clone();
    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1 / tilesHorizontal, 1 / tilesVertical );
    // how long should each image be displayed?
    let tileDisplayDuration = tileDispDuration;
    // how long has the current image been displayed?
    let currentDisplayTime = 0;
    // which image is currently being displayed?
    let currentTile = 0;

    let material = new THREE.MeshBasicMaterial( { map: texture, transparent:true  } );
    let geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    let mesh = new THREE.Mesh(geometry, material);

    // completion callback
    this.onCompleteCallback = null;

    this.completeParams = null;

    // running
    let isRunning = false;

    this.onComplete = function (callback) {
      this.onCompleteCallback = callback;

      return this;
    };

    this.start = function (position, params) {
      isRunning = true;

      currentTile = 0;
      currentDisplayTime = 0;

      mesh.position.copy(position);

      sceneSource.add(mesh);

      this.completeParams = params;

      return this;
    };

    this.update = function (milliSec) {
      if (!isRunning) return;

      currentDisplayTime += milliSec * 1000;

      currentTile = Math.ceil(currentDisplayTime / tileDisplayDuration) - 1;

      mesh.lookAt(cameraSource.position);

      if (currentTile < numberOfTiles) {
        let currentColumn = currentTile % tilesHorizontal;
        texture.offset.x = currentColumn / tilesHorizontal;
        let currentRow = Math.floor( currentTile / tilesHorizontal );
        texture.offset.y = currentRow / tilesVertical;
      } else {
        isRunning = false;
        sceneSource.remove(mesh);

        if (typeof this.onCompleteCallback === 'function')
          this.onCompleteCallback(this, this.completeParams);
      }
    };

    this.reset = function () {
      currentTile = 0;
      currentDisplayTime = 0;

      sceneSource.remove(mesh);

      this.completeParams = null;

      return this;
    };

    this.dispose = function () {
      material.dispose();
      geometry.dispose();
    };
  }
};
