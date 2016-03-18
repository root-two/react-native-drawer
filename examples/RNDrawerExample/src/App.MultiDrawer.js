import React, {
  Component,
  PropTypes,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import Drawer from 'react-native-drawer'

import ControlPanel from './ControlPanel'
import Main from './Main'

export default class App extends Component {
  state={
    drawerOpen: false,
    drawerDisabled: false,
  };
  closeDrawer = () => {
    this._drawer.close()
  };
  openDrawer = () => {
    this._drawer.open()
  };
  render() {
    return (
      <Drawer
        ref={(ref) => this._drawer = ref}
        type="static"
        content={
          <ControlPanel closeDrawer={this.closeDrawer} />
        }
        acceptDoubleTap
        openDrawerOffset={0.35}
        styles={{main: {shadowColor: "#000000", shadowOpacity: 0.3, shadowRadius: 15}}}
        onOpen={() => {
          console.log('onopen')
          this.setState({drawerOpen: true})
        }}
        onClose={() => {
          console.log('onclose')
          this.setState({drawerOpen: false})
        }}
        captureGestures
        tweenDuration={100}
        negotiatePan={true}
        panThreshold={0.08}
        panOpenMask={0.35}
        disabled={this.state.drawerDisabled}
        tweenHandler={Drawer.tweenPresets.parallax}>
        <Drawer
          captureGestures
          negotiatePan
          ref={(ref) => this._drawer2 = ref}
          onOpen={() => {
            console.log('onopenInner')
          }}
          onClose={() => {
            console.log('oncloseInner')
          }}
          side="right"
          >
          <Main />
        </Drawer>
      </Drawer>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  }
})
