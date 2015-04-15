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

var counter = 0
var rndrawereg = React.createClass({
  getInitialState(){
    return {
      drawerType: 'overlay',
      openDrawerOffset:0,
      closedDrawerOffset:0,
      animation: 'linear',
      panOpenMask: .1,
      panCloseMask: .9,
      relativeDrag: false,
      panStartCompensation: true,
      openDrawerThreshold: .25,
      tweenHandlerOn: false,
      disabled: false,
    }
  },

  shouldComponentUpdate(nextProps, nextState){
    if(  this.state.openDrawerOffset !== nextState.openDrawerOffset
      || this.state.closedDrawerOffset !== nextState.closedDrawerOffset
    ){
      counter++
    }
    return true
  },

  setDrawerType(type){
    this.setState({
      drawerType: type
    })
  },

  tweenHandler(ratio){
    var drawerShadow = ratio < .2 ? ratio*5*5 : 5
    return {
      drawer: {
        shadowRadius: drawerShadow,
      },
      main: {
        opacity:(2-ratio)/2,
        scaleX: (2-ratio)/2,
      },
    }
  },

  render() {
    var controlPanel = <MyControlPanel closeDrawer={() => {this.refs.drawer.closeDrawer()}} />
    return (
      <Drawer
        ref="drawer"
        key={"drawer"+counter}
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
        tweenHandler={this.state.tweenHandlerOn ? this.tweenHandler : null}
        >
        <MyMainView
          drawerType={this.state.drawerType}
          setParentState={ (frag) => {this.setState(frag) }}
          openDrawer={() => {this.refs.drawer.openDrawer()} }
          openDrawerOffset={this.state.openDrawerOffset}
          closedDrawerOffset={this.state.closedDrawerOffset}
          panOpenMask={this.state.panOpenMask}
          panCloseMask={this.state.panCloseMask}
          relativeDrag= {this.state.relativeDrag}
          panStartCompensation= {this.state.panStartCompensation}
          tweenHandlerOn={this.state.tweenHandlerOn}
          disabled={this.state.disabled}
          openDrawerThreshold={this.state.openDrawerThreshold}
          animation={this.state.animation}
          />
      </Drawer>
    );
  }
});

AppRegistry.registerComponent('rndrawereg', () => rndrawereg);
