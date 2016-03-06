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
  closeDrawer = () => {
    this.refs.drawer.close()
  };
  openDrawer = () => {
    this.refs.drawer.open()
  };
  render() {
    return (
      <Drawer
        ref="drawer"
        type="overlay"
        initializeOpen={false}
        openDrawerOffset={30}
        closedDrawerOffset={0}
        acceptTap={false}
        acceptDoubleTap={true}
        negotiatePan={true}
        content={<ControlPanel />}
        >
        <Main />
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
