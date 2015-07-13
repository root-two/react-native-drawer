var React = require('react-native')
var {NativeModules} = React
var deviceScreen = NativeModules.UIManager.Dimensions.window
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
    acceptTap: React.PropTypes.bool,
    acceptPan: React.PropTypes.bool,
    styles: React.PropTypes.object,
    onOpen: React.PropTypes.func,
    onClose: React.PropTypes.func,
    side: React.PropTypes.oneOf(['left', 'right']),
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
      acceptTap: false,
      acceptPan: true,
      styles: {},
      onOpen: () => {},
      onClose: () => {},
      side: 'left',
    }
  },

  statics: {
    tweenPresets: {
      parallax: (ratio) => {
        var r1 = 1
        var t = [
                   r1,  0,  0,  0,
                   0, r1,  0,  0,
                   0,   0,   1,  0,
                   0,   0,   0,  1,
                ]
        return {
          drawer: {
            left:-fullWidth/8 + fullWidth*ratio/8,
            transformMatrix: t,
          },
        }
      }
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
        styles.main[this.props.side] = fullWidth - this._offsetOpen
        styles.drawer[this.props.side] = 0
        styles.main.width = fullWidth - this._offsetClosed
        styles.drawer.width = fullWidth
      }
      if(props.type === 'overlay'){
        styles.main[this.props.side] = 0
        styles.drawer[this.props.side] = 0
        styles.main.width = fullWidth
        styles.drawer.width = fullWidth - this._offsetOpen
      }
      if(props.type === 'displace'){
        styles.main[this.props.side] = fullWidth - this._offsetOpen
        styles.drawer[this.props.side] = 0
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
        styles.main[this.props.side] = this._offsetClosed
        styles.drawer[this.props.side] = 0
        styles.main.width = fullWidth - this._offsetClosed
        styles.drawer.width = fullWidth
      }
      if(props.type === 'overlay'){
        styles.main[this.props.side] = this._offsetClosed
        styles.drawer[this.props.side] = this._offsetClosed + this._offsetOpen - fullWidth
        styles.main.width = fullWidth
        styles.drawer.width = fullWidth - this._offsetOpen
      }
      if(props.type === 'displace'){
        styles.main[this.props.side] = this._offsetClosed
        styles.drawer[this.props.side] = - fullWidth + this._offsetClosed + this._offsetOpen
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

    var ratio = (this._left-this._offsetClosed)/(this.getOpenLeft()-this._offsetClosed)

    switch(this.props.type){
      case 'overlay':
        drawerProps[this.props.side] = -deviceScreen.width+this._offsetOpen+this._left
        mainProps[this.props.side] = this._offsetClosed
        break
      case 'static':
        mainProps[this.props.side] = this._left
        drawerProps[this.props.side] = 0
        break
      case 'displace':
        mainProps[this.props.side] = this._left
        drawerProps[this.props.side] = -deviceScreen.width+this._left+this._offsetOpen
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

    var deltaOpen = this.props.side === 'left' ? deviceScreen.width - x0 : x0
    var deltaClose = this.props.side === 'left' ? x0 : deviceScreen.width - x0

    //@TODO lol formatting?
    if( this._open && deltaOpen > deviceScreen.width*this.props.panCloseMask
        || !this._open && deltaClose > deviceScreen.width*this.props.panOpenMask
      ){
        return false
      }

    if(this.props.acceptTap){
      this._open ? this.close() : this.open()
    }
    else if(this.props.acceptDoubleTap){
      var now = new Date().getTime()
      if(now - this._lastPress < 500){
        this._open ? this.close() : this.open()
      }
      this._lastPress = now
    }

    if(!this.props.acceptPan){
      return false
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
    if(this._open ^ dx < 0 ^ this.props.side === 'right'){ return false }

    var absDx = Math.abs(dx)
    var moveX = gestureState.moveX
    var relMoveX = this.props.side === 'left'
      ? this._open ? -deviceScreen.width + moveX : moveX
      : this._open ? -moveX : deviceScreen.width - moveX
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
      end: this.getOpenLeft(),
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
      end: this.getClosedLeft(),
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

  toggle: function() {
    this._open ? this.close() : this.open()
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

    var absRelMoveX = this.props.side === 'left'
      ? this._open ? deviceScreen.width - gestureState.moveX : gestureState.moveX
      : this._open ? gestureState.moveX : deviceScreen.width - gestureState.moveX
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

  getOpenLeft: function(){
    return deviceScreen.width - this._offsetOpen
  },

  getClosedLeft() {
    return this._offsetClosed
  },

})

module.exports = drawer
