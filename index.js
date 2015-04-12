var React = require('react-native')
var deviceScreen = require('Dimensions').get('window')
var styles = require('./styles')
var queueAnimation = require('./animations')

console.log('dim', require('Dimensions').get('window'))

var {
  PanResponder,
  View,
  StyleSheet
} = React

/**
 * Check if the current gesture offset bigger than allowed one
 * before opening menu
 * @param  {Number} dx Gesture offset from the left side of the window
 * @return {Boolean}
 */
var drawer = React.createClass({

  left: 0,
  prevLeft: 0,
  open: false,
  panning: false,

  propTypes: {
    type: React.PropTypes.string,
    closedDrawerOffset: React.PropTypes.number,
    openDrawerOffset: React.PropTypes.number,
    openDrawerThreshold: React.PropTypes.number,
    relativeDrag: React.PropTypes.bool,
    panStartCompensation: React.PropTypes.bool,
    panOpenMask: React.PropTypes.number,
    panCloseMask: React.PropTypes.number,
    initializeOpen: React.PropTypes.bool,
  },

  getDefaultProps () {
    return {
      type: 'displace',
      closedDrawerOffset: 0,
      openDrawerOffset: 0,
      openDrawerThreshold: .25,
      relativeDrag: false,
      panStartCompensation: true,
      panOpenMask: .25,
      panCloseMask: .25,
      initializeOpen: false,
    }
  },

  /**
   * Create pan responder before component render
   * @return {Void}
   */
  componentWillMount: function() {

    var offsetClosed = this.props.closedDrawerOffset
    var offsetOpen = this.props.openDrawerOffset
    var fullWidth = deviceScreen.width

    //open
    if(this.props.initializeOpen === true){
      this.open = true
      this.left = fullWidth - offsetOpen
      this.prevLeft = this.left
      if(this.props.type === 'static'){
        styles.main.left = fullWidth - offsetOpen
        styles.drawer.left = 0
        styles.main.width = fullWidth - offsetClosed
        styles.drawer.width = fullWidth
      }
      if(this.props.type === 'overlay'){
        styles.main.left = 0
        styles.drawer.left = 0
        styles.main.width = fullWidth
        styles.drawer.width = fullWidth - offsetOpen
      }
      if(this.props.type === 'displace'){
        styles.main.left = fullWidth - offsetOpen
        styles.drawer.left = 0
        styles.main.width = fullWidth - offsetClosed
        styles.drawer.width = fullWidth - offsetOpen
      }
    }
    //closed
    else{
      this.open = false
      this.left = offsetClosed
      this.prevLeft = this.left
      if(this.props.type === 'static'){
        styles.main.left = offsetClosed
        styles.drawer.left = 0
        styles.main.width = fullWidth - offsetClosed
        styles.drawer.width = fullWidth
      }
      if(this.props.type === 'overlay'){
        styles.main.left = offsetClosed
        styles.drawer.left = - fullWidth + offsetClosed + offsetOpen
        styles.main.width = fullWidth
        styles.drawer.width = fullWidth - offsetOpen
      }
      if(this.props.type === 'displace'){
        styles.main.left = offsetClosed
        styles.drawer.left = - fullWidth + offsetClosed + offsetOpen
        styles.main.width = fullWidth - offsetClosed
        styles.drawer.width = fullWidth - offsetOpen
      }
    }

    this.stylesheet = StyleSheet.create(styles)

    this.responder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderMove: this.handlePanResponderMove,
      onPanResponderRelease: this.handlePanResponderEnd,
    })
  },

  /**
   * Change `left` style attribute
   * Works only if `drawer` is a ref to React.Component
   * @return {Void}
   */
  updatePosition: function() {
    switch(this.props.type){
      case 'overlay':
        this.drawer.setNativeProps({ left: -deviceScreen.width+this.props.openDrawerOffset+this.left })
        break
      case 'static':
        this.main.setNativeProps({ left: this.left })
        break
      case 'displace':
        this.main.setNativeProps({ left: this.left })
        this.drawer.setNativeProps({ left: -deviceScreen.width+this.left+this.props.openDrawerOffset })
        break
    }
  },

  shouldOpenDrawer(dx: Number) {
    if(this.open){
      return dx < deviceScreen.width*this.props.openDrawerThreshold
    }
    else{
      return dx > deviceScreen.width*this.props.openDrawerThreshold
    }
  },

  /**
   * Permission to use responder
   * @return {Boolean} true
   */
  handleStartShouldSetPanResponder: () => true,

  /**
   * Handler on responder move
   * @param  {Synthetic Event} e
   * @param  {Object} gestureState
   * @return {Void}
   */
  handlePanResponderMove: function(e: Object, gestureState: Object) {
    //@TODO lol formatting?
    if(  (this.open && deviceScreen.width - gestureState.x0 > deviceScreen.width*this.props.panOpenMask)
      || (!this.open && gestureState.x0 > deviceScreen.width*this.props.panCloseMask)
      ){ return }

    //@TODO store adjustedDx max so that it does not uncompensate when panning back
    var dx = gestureState.dx
    //Do nothing if we are panning the wrong way
    if(this.open ^ dx < 0){ return}

    //Math is ugly overly verbose here, probably can be greatly cleaned up
    var absDx = Math.abs(dx)
    var moveX = gestureState.moveX
    var relMoveX = this.open ? -deviceScreen.width + moveX : moveX
    var delta = relMoveX - dx
    var factor = absDx/Math.abs(relMoveX)
    var adjustedDx = dx + delta*factor
    this.left = this.props.panStartCompensation ? this.prevLeft + adjustedDx : this.prevLeft + dx
    this.updatePosition()
    this.panning = true
  },

  /**
   * Open menu
   * @return {Void}
   */
  openDrawer: function() {
    console.log('open', this.left)
    queueAnimation(this.props.animation)
    this.left = deviceScreen.width - this.props.openDrawerOffset
    console.log('set left', this.left)
    this.open = true
    this.updatePosition()
    this.prevLeft = this.left
  },

  /**
   * Close menu
   * @return {Void}
   */
  closeDrawer: function() {
    queueAnimation(this.props.animation)
    this.left = this.props.closedDrawerOffset
    this.open = false
    this.updatePosition()
    this.prevLeft = this.left
  },

  /**
   * Handler on responder move ending
   * @param  {Synthetic Event} e
   * @param  {Object} gestureState
   * @return {Void}
   */
  handlePanResponderEnd: function(e: Object, gestureState: Object) {
    //Do nothing if we are not in an active pan state
    if(!this.panning){ return }
    //Do nothing if we are panning the wrong way
    if(this.open ^ gestureState.dx < 0){ return }

    var absRelMoveX = this.open ? deviceScreen.width - gestureState.moveX : gestureState.moveX
    var calcPos = this.props.relativeDrag ? Math.abs(gestureState.dx) : absRelMoveX
    if (this.shouldOpenDrawer(calcPos)) {
      this.openDrawer()
    } else {
      this.closeDrawer()
    }

    this.updatePosition()
    this.prevLeft = this.left
    this.panning = false
  },

  /**
   * Get content view. This view will be rendered over menu
   * @return {React.Component}
   */
  getMainView: function() {
    return (
      <View
        style={this.stylesheet.main}
        ref={(ref) => this.main = ref}
        {...this.responder.panHandlers}>
        {this.props.children}
      </View>
    )
  },

  /**
   * Get menu view. This view will be rendered under
   * content view. Also, this function will decorate
   * passed `menu` component with side menu API
   * @return {React.Component}
   */
  getDrawerView: function() {
    var drawerActions = {
      close: this.closeDrawer
    }

    return (
      <View
        style={this.stylesheet.drawer}
        ref={(ref) => this.drawer = ref}
        {...this.responder.panHandlers}>
        {React.addons.cloneWithProps(this.props.content, { drawerActions })}
      </View>
    )
  },

  /**
   * Compose and render menu and content view
   * @return {React.Component}
   */
  render: function() {
    switch(this.props.type){
      case 'overlay':
        var first = this.getMainView()
        var second = this.getDrawerView()
        break
      default:
        var first = this.getDrawerView()
        var second = this.getMainView()
        break
    }
    return (
      <View style={this.stylesheet.container}>
        {first}
        {second}
      </View>
    )
  }
})

module.exports = drawer
