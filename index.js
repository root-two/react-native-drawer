var React = require('react-native')
var deviceScreen = require('Dimensions').get('window')
var tween = require('./Tweener')
var shallowEquals = require('shallow-equals')

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

  _left: 0,
  _prevLeft: 0,
  _offsetOpen: 0,
  _offsetClosed: 0,
  _open: false,
  _panning: false,
  _tweenPending: false,
  _lastPress: 0,

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
    tweenHandler: React.PropTypes.func,
    tweenDuration: React.PropTypes.number,
    tweenEasing: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    acceptDoubleTap: React.PropTypes.bool,
    styles: React.PropTypes.object,
    onOpen: React.PropTypes.func,
    onClose: React.PropTypes.func,
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
      tweenHandler: null,
      tweenDuration: 250,
      tweenEasing: 'linear',
      disabled: false,
      acceptDoubleTap: false,
      styles: {},
      onOpen: () => {},
      onClose: () => {},
    }
  },

  propsWhomRequireUpdate: [
    'closedDrawerOffset',
    'openDrawerOffset',
    'type'
  ],

  //@TODO is this a good idea? could be leaky
  shouldComponentUpdate(nextProps, nextState) {
    this.propsWhomRequireUpdate.forEach((key) => {
      if(this.props[key] !== nextProps[key]){ return true }
    })
    if(!shallowEquals(this.props.children.props, nextProps.children.props)){ return true }
    return false
  },

  componentWillReceiveProps(nextProps){
    if(this.shouldComponentUpdate(nextProps)){
      this.initialize(nextProps)
    }
  },

  initialize(props){
    var fullWidth = deviceScreen.width
    this._offsetClosed = props.closedDrawerOffset%1 === 0 ? props.closedDrawerOffset : props.closedDrawerOffset*fullWidth
    this._offsetOpen = props.openDrawerOffset%1 === 0 ? props.openDrawerOffset : props.openDrawerOffset*fullWidth

    var styles = {
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }
    styles.main = Object.assign({
        flex: 1,
        position: 'absolute',
        top: 0,
        height: deviceScreen.height,
      }, this.props.styles.main)
    styles.drawer = Object.assign({
        flex: 1,
        position: 'absolute',
        top: 0,
        height: deviceScreen.height,
      }, this.props.styles.drawer)

    //open
    if(props.initializeOpen === true){
      this._open = true
      this._left = fullWidth - this._offsetOpen
      this._prevLeft = this._left
      if(props.type === 'static'){
        styles.main.left = fullWidth - this._offsetOpen
        styles.drawer.left = 0
        styles.main.width = fullWidth - this._offsetClosed
        styles.drawer.width = fullWidth
      }
      if(props.type === 'overlay'){
        styles.main.left = 0
        styles.drawer.left = 0
        styles.main.width = fullWidth
        styles.drawer.width = fullWidth - this._offsetOpen
      }
      if(props.type === 'displace'){
        styles.main.left = fullWidth - this._offsetOpen
        styles.drawer.left = 0
        styles.main.width = fullWidth - this._offsetClosed
        styles.drawer.width = fullWidth - this._offsetOpen
      }
    }
    //closed
    else{
      this._open = false
      this._left = this._offsetClosed
      this._prevLeft = this._left
      if(props.type === 'static'){
        styles.main.left = this._offsetClosed
        styles.drawer.left = 0
        styles.main.width = fullWidth - this._offsetClosed
        styles.drawer.width = fullWidth
      }
      if(props.type === 'overlay'){
        styles.main.left = this._offsetClosed
        styles.drawer.left = this._offsetClosed + this._offsetOpen - fullWidth
        styles.main.width = fullWidth
        styles.drawer.width = fullWidth - this._offsetOpen
      }
      if(props.type === 'displace'){
        styles.main.left = this._offsetClosed
        styles.drawer.left = - fullWidth + this._offsetClosed + this._offsetOpen
        styles.main.width = fullWidth - this._offsetClosed
        styles.drawer.width = fullWidth - this._offsetOpen
      }
    }

    if(this.refs.main){
      this.refs.drawer.setNativeProps({ left: styles.drawer.left})
      this.refs.main.setNativeProps({ left: styles.main.left})
    }
    else{
      this.stylesheet = StyleSheet.create(styles)

      this.responder = PanResponder.create({
        onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
        onPanResponderMove: this.handlePanResponderMove,
        onPanResponderRelease: this.handlePanResponderEnd,
      })
    }
  },

  componentWillMount: function() {
    this.initialize(this.props)
  },

  /**
   * Change `left` style attributes
   * Works only if `drawer` is a ref to React.Component
   * @return {Void}
   */
  updatePosition: function() {
    var mainProps = {}
    var drawerProps = {}

    var maxLeft = this.getMaxLeft()
    var ratio = (this._left-this._offsetClosed)/(this.getMaxLeft()-this._offsetClosed)

    switch(this.props.type){
      case 'overlay':
        drawerProps.left = -deviceScreen.width+this._offsetOpen+this._left
        mainProps.left = this._offsetClosed
        break
      case 'static':
        mainProps.left = this._left
        drawerProps.left = 0
        break
      case 'displace':
        mainProps.left = this._left
        drawerProps.left = -deviceScreen.width+this._left+this._offsetOpen
        break
    }

    if(this.props.tweenHandler){
      var propsFrag = this.props.tweenHandler(ratio)
      mainProps = Object.assign(mainProps, propsFrag.main)
      drawerProps = Object.assign(drawerProps, propsFrag.drawer)
    }
    this.refs.drawer.setNativeProps(drawerProps)
    this.refs.main.setNativeProps(mainProps)
  },

  shouldOpenDrawer(dx: Number) {
    if(this._open){
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
  handleStartShouldSetPanResponder: function(e: Object, gestureState: Object) {
    if(this.props.disabled){ return false }
    var x0 = e.nativeEvent.pageX
    //@TODO lol formatting?
    if(  (this._open && deviceScreen.width - x0 > deviceScreen.width*this.props.panCloseMask)
      || (!this._open && x0 > deviceScreen.width*this.props.panOpenMask)
    ){
      return false
    }

    if(this.props.acceptDoubleTap){
      var now = new Date().getTime()
      if(now - this._lastPress < 500){
        this._open ? this.close() : this.open()
      }
      this._lastPress = now
    }

    return true
  },

  /**
   * Handler on responder move
   * @param  {Synthetic Event} e
   * @param  {Object} gestureState
   * @return {Void}
   */
  handlePanResponderMove: function(e: Object, gestureState: Object) {
    //Math is ugly overly verbose here, probably can be greatly cleaned up
    var dx = gestureState.dx
    //@TODO store adjustedDx max so that it does not uncompensate when panning back
    var dx = gestureState.dx
    //Do nothing if we are panning the wrong way
    if(this._open ^ dx < 0){ return false}

    var absDx = Math.abs(dx)
    var moveX = gestureState.moveX
    var relMoveX = this._open ? -deviceScreen.width + moveX : moveX
    var delta = relMoveX - dx
    var factor = absDx/Math.abs(relMoveX)
    var adjustedDx = dx + delta*factor
    this._left = this.props.panStartCompensation ? this._prevLeft + adjustedDx : this._prevLeft + dx
    this.updatePosition()
    this._panning = true
  },

  /**
   * Open menu
   * @return {Void}
   */
  open: function() {
    if(this.props.disabled){ return null }
    tween({
      start: this._left,
      end: this.getMaxLeft(),
      duration: this.props.tweenDuration,
      easingType: this.props.tweenEasing,
      onFrame: (tweenValue) => {
        this._left = tweenValue
        this.updatePosition()
      },
      onEnd: () => {
        this._open = true
        this._prevLeft = this._left
        this.props.onOpen()
        // @TODO _initializeAfterAnimation ????
      }
    })
  },

  /**
   * Close menu
   * @return {Void}
   */
  close: function() {
    if(this.props.disabled){ return null }
    tween({
      start: this._left,
      end: this.getMinLeft(),
      easingType: this.props.tweenEasing,
      duration: this.props.tweenDuration,
      onFrame: (tweenValue) => {
        this._left = tweenValue
        this.updatePosition()
      },
      onEnd: () => {
        this._open = false
        this._prevLeft = this._left
        this.props.onClose()
        // @TODO _initializeAfterAnimation ????
      }
    })
  },

  openDrawer: function(){
    console.warn('rn-drawer: `openDrawer` is deprecated, use `open` instead.')
    this.open()
  },

  closeDrawer: function(){
    console.warn('rn-drawer: `closeDrawer` is deprecated, use `close` instead.')
    this.close()
  },

  /**
   * Handler on responder move ending
   * @param  {Synthetic Event} e
   * @param  {Object} gestureState
   * @return {Void}
   */
  handlePanResponderEnd: function(e: Object, gestureState: Object) {
    //Do nothing if we are not in an active pan state
    if(!this._panning){ return }
    //@TODO:Reevaluate - If we are panning the wrong way when the pan ends,
    // which animation should trigger?
    // if(this._open ^ gestureState.dx < 0){ return }

    var absRelMoveX = this._open ? deviceScreen.width - gestureState.moveX : gestureState.moveX
    var calcPos = this.props.relativeDrag ? Math.abs(gestureState.dx) : absRelMoveX
    if (this.shouldOpenDrawer(calcPos)) {
      this.open()
    } else {
      this.close()
    }

    this.updatePosition()
    this._prevLeft = this._left
    this._panning = false
  },

  /**
   * Get content view. This view will be rendered over menu
   * @return {React.Component}
   */
  getMainView: function() {
    return (
      <View
        key="main"
        style={this.stylesheet.main}
        ref="main"
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
        key="drawer"
        style={this.stylesheet.drawer}
        ref="drawer"
        {...this.responder.panHandlers}>
        {this.props.content}
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
      <View style={this.stylesheet.container} key="drawerContainer">
        {first}
        {second}
      </View>
    )
  },

  getMaxLeft: function(){
    return deviceScreen.width - this._offsetOpen
  },

  getMinLeft() {
    return this._offsetClosed
  },

})

module.exports = drawer
