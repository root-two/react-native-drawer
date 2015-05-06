/**
 * rn-drawer example app
 * https://github.com/facebook/react-native
 */
var React = require('react-native');
var {
  AppRegistry,
  Text,
  View,
} = React;

var styles = require('./styles')
var drawerStyles = {
  drawer: {
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 0,
  }
}

var Drawer = require('rn-drawer')
var MyMainView = require('./MyMainView')
var MyControlPanel = require('./ControlPanel')

var deviceScreen = require('Dimensions').get('window')
var tweens = require('./tweens')

var counter = 0
var RNDrawerDemo = React.createClass({
  getInitialState(){
    return {
      drawerType: 'overlay',
      openDrawerOffset:0,
      closedDrawerOffset:0,
      panOpenMask: .1,
      panCloseMask: .9,
      relativeDrag: false,
      panStartCompensation: true,
      openDrawerThreshold: .25,
      tweenHandlerOn: false,
      tweenDuration: 350,
      tweenEasing: 'linear',
      disabled: false,
      tweenHandlerPreset: null,
    }
  },

  setDrawerType(type){
    this.setState({
      drawerType: type
    })
  },

  tweenHandler(ratio){
    if(!this.state.tweenHandlerPreset){ return {} }
    return tweens[this.state.tweenHandlerPreset](ratio)
  },

  noopChange(){
    this.setState({
      changeVal: Math.random()
    })
  },

  openDrawer(){
    this.refs.drawer.open()
  },

  setStateFrag(frag){
    this.setState(frag)
  },

  render() {
    var controlPanel = <MyControlPanel closeDrawer={() => {this.refs.drawer.close()}} />
    return (
      <Drawer
        ref="drawer"
        type={this.state.drawerType}
        animation={this.state.animation}
        openDrawerOffset={this.state.openDrawerOffset}
        closedDrawerOffset={this.state.closedDrawerOffset}
        panOpenMask={this.state.panOpenMask}
        panCloseMask={this.state.panCloseMask}
        relativeDrag={this.state.relativeDrag}
        panStartCompensation={this.state.panStartCompensation}
        openDrawerThreshold={this.state.openDrawerThreshold}
        content={controlPanel}
        styles={drawerStyles}
        disabled={this.state.disabled}
        tweenHandler={this.tweenHandler}
        tweenDuration={this.state.tweenDuration}
        tweenEasing={this.state.tweenEasing}
        acceptDoubleTap={true}
        changeVal={this.state.changeVal}
        >
        <MyMainView
          drawerType={this.state.drawerType}
          setParentState={this.setStateFrag}
          openDrawer={this.openDrawer}
          openDrawerOffset={this.state.openDrawerOffset}
          closedDrawerOffset={this.state.closedDrawerOffset}
          panOpenMask={this.state.panOpenMask}
          panCloseMask={this.state.panCloseMask}
          relativeDrag= {this.state.relativeDrag}
          panStartCompensation= {this.state.panStartCompensation}
          tweenHandlerOn={this.state.tweenHandlerOn}
          disabled={this.state.disabled}
          openDrawerThreshold={this.state.openDrawerThreshold}
          tweenEasing={this.state.tweenEasing}
          tweenHandlerPreset={this.state.tweenHandlerPreset}
          animation={this.state.animation}
          noopChange={this.noopChange}
          />
      </Drawer>
    );
  }
});

AppRegistry.registerComponent('RNDrawerDemo', () => RNDrawerDemo);
