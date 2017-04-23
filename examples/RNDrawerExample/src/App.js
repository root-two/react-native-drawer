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
    this.setState({drawerOpen: false})
  };
  openDrawer = () => {
    this.setState({drawerOpen: true})
  };
  render() {
    return (
      <Drawer
        type="static"
        content={
          <ControlPanel closeDrawer={this.closeDrawer} />
        }
        acceptDoubleTap
        styles={{main: {shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 15}}}
        open={this.state.drawerOpen}
        onOpen={() => {
          console.log('onopen')
          this.setState({drawerOpen: true})
        }}
        onClose={() => {
          console.log('onclose')
          this.setState({drawerOpen: false})
        }}
        captureGestures={false}
        tweenDuration={100}
        panThreshold={0.08}
        disabled={this.state.drawerDisabled}
        openDrawerOffset={(viewport) => {
          return 100
        }}
        closedDrawerOffset={() => 50}
        panOpenMask={0.2}
        negotiatePan
        >
        <Main openDrawer={this.openDrawer} />
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
