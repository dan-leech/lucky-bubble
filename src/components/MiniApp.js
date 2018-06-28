// @flow
import {
  defaultLifeCycle
} from 'aq-miniapp-core';
import Game from './Game';

const THREE = window.THREE;

type Props = {
  width: number,
  height: number,
  game: any,
  devt: boolean,
  data: Object
}

export default class MiniApp {

  props: Props;
  renderer: THREE.WebGLRenderer;
  game: ?Game<Object>;

  constructor(props: Props) {
    this.props = props;

    defaultLifeCycle.setOnResetCallback(this.onReset.bind(this));

    if (props.devt) {
      this.onData(props.data);
    }
    else {
      defaultLifeCycle.setOnDataCallback(this.onData.bind(this));
    }
  }

  onReset(newData: Object) {
    if (this.game) {
      if (this.props.devt) {
        this.game.onReset(this.props.data);
      }
      else {
        this.game.onReset(newData);
      }
    }
  }

  onData(data: Object) {
    if (this.game != null) {
      this.game.gameWillUnmount();
      this.game = null;
    }

    if (this.renderer == null){
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(this.props.width, this.props.height);

      if (document.body != null) {
        document.body.appendChild(this.renderer.domElement);
      }
    }

    this.game = new this.props.game(this.renderer, data);

    this.game.gameDidMount();
    defaultLifeCycle.informReady();
  }

}
