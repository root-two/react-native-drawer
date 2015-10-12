var React = require('react-native')
var { PanResponder, View, StyleSheet, Dimensions } = React
var deviceScreen = Dimensions.get('window')
var tween = require('./Tweener')

var drawer = React.createClass({

  _left: 0,
  _prevLeft: 0,
  _offsetOpen: 0,
  _offsetClosed: 0,
  _open: false,
  _panning: false,
  _tweenPending: false,
  _lastPress: 0,
  _syncAfterUpdate: false,

  propTypes: {
    type: React.PropTypes.string,
    closedDrawerOffset: React.PropTypes.number,
    openDrawerOffset: React.PropTypes.number,
    openDrawerThreshold: React.PropTypes.number,
    relativeDrag: React.PropTypes.bool,
    panStartCompensation: React.PropTypes.bool,
    panOpenMask: React.PropTypes.number,
    panCloseMask: React.PropTypes.number,
    captureGestures: React.PropTypes.bool,
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
      relativeDrag: true,
      panStartCompensation: true,
      panOpenMask: .25,
      panCloseMask: .25,
      captureGestures: false,
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
        var drawer = {}
        drawer.left = -150*(1-ratio)
        return { drawer: drawer }
      }
    }
  },

  getInitialState () {
    return { viewport: deviceScreen }
  },

  setViewport (e) {
    this.setState({ viewport: e.nativeEvent.layout })
    this._syncAfterUpdate = true
  },

  propsWhomRequireUpdate: [
    'closedDrawerOffset',
    'openDrawerOffset',
    'type'
  ],

  requiresIntialize (nextProps) {
    this.propsWhomRequireUpdate.forEach((key) => {
      if(this.props[key] !== nextProps[key]){ return true }
    })
  },

  componentWillReceiveProps (nextProps) {
    if(this.requiresIntialize(nextProps)){
      this.initialize(nextProps)
    }
  },

  initialize (props) {
    var fullWidth = this.state.viewport.width
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
        position: 'absolute',
        top: 0,
        height: this.state.viewport.height,
      }, this.props.styles.main)
    styles.drawer = Object.assign({
        position: 'absolute',
        top: 0,
        height: this.state.viewport.height,
      }, this.props.styles.drawer)

    //open
    if(props.initializeOpen === true){
      this._open = true
      this._left = fullWidth - this._offsetOpen
      this._prevLeft = this._left
      if(props.type === 'static'){
        styles.main[this.props.side] = fullWidth - this._offsetOpen
        styles.drawer[this.props.side] = 0
      }
      if(props.type === 'overlay'){
        styles.main[this.props.side] = 0
        styles.drawer[this.props.side] = 0
      }
      if(props.type === 'displace'){
        styles.main[this.props.side] = fullWidth - this._offsetOpen
        styles.drawer[this.props.side] = 0
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
      }
      if(props.type === 'overlay'){
        styles.main[this.props.side] = this._offsetClosed
        styles.drawer[this.props.side] = this._offsetClosed + this._offsetOpen - fullWidth
      }
      if(props.type === 'displace'){
        styles.main[this.props.side] = this._offsetClosed
        styles.drawer[this.props.side] = - fullWidth + this._offsetClosed + this._offsetOpen
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
        onStartShouldSetPanResponderCapture: this.handleStartShouldSetPanResponderCapture,
        onPanResponderMove: this.handlePanResponderMove,
        onPanResponderRelease: this.handlePanResponderEnd,
      })
    }
  },

  componentWillMount () {
    this.initialize(this.props)
  },

  componentDidUpdate () {
    this._offsetClosed = this.props.closedDrawerOffset%1 === 0 ? this.props.closedDrawerOffset : this.props.closedDrawerOffset*this.state.viewport.width
    this._offsetOpen = this.props.openDrawerOffset%1 === 0 ? this.props.openDrawerOffset : this.props.openDrawerOffset*this.state.viewport.width
    if(this._syncAfterUpdate){
      this._syncAfterUpdate = false
      this._open ? this.open() : this.close()
    }
  },

  updatePosition () {
    var mainProps = {}
    var drawerProps = {}

    var ratio = (this._left-this._offsetClosed)/(this.getOpenLeft()-this._offsetClosed)

    switch(this.props.type){
      case 'overlay':
        drawerProps[this.props.side] = -this.state.viewport.width+this._offsetOpen+this._left
        mainProps[this.props.side] = this._offsetClosed
        break
      case 'static':
        mainProps[this.props.side] = this._left
        drawerProps[this.props.side] = 0
        break
      case 'displace':
        mainProps[this.props.side] = this._left
        drawerProps[this.props.side] = -this.state.viewport.width+this._left+this._offsetOpen
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

  shouldOpenDrawer (dx) {
    if(this._open){
      return dx < this.state.viewport.width*this.props.openDrawerThreshold
    }
    else{
      return dx > this.state.viewport.width*this.props.openDrawerThreshold
    }
  },

  handleStartShouldSetPanResponderCapture (e, gestureState) {
    if(this.props.captureGestures){
      return this.handleStartShouldSetPanResponder(e, gestureState)
    }
  },

  handleStartShouldSetPanResponder: function(e, gestureState) {
    if(!this.testPanResponderMask(e, gestureState)){
      return false
    }

    this.processTapGestures()

    return true
  },

  processTapGestures () {
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
  },

  testPanResponderMask (e, gestureState) {
    if(this.props.disabled){ return false }
    var x0 = e.nativeEvent.pageX

    var deltaOpen = this.props.side === 'left' ? deviceScreen.width - x0 : x0
    var deltaClose = this.props.side === 'left' ? x0 : deviceScreen.width - x0

    if( this._open && deltaOpen > deviceScreen.width*this.props.panCloseMask ) return false
    if( !this._open && deltaClose > deviceScreen.width*this.props.panOpenMask ) return false
    return true
  },

  handlePanResponderMove (e, gestureState) {
    if(!this.props.acceptPan){
      return false
    }

    //Math is ugly overly verbose here, probably can be greatly cleaned up
    var dx = gestureState.dx
    //@TODO store adjustedDx max so that it does not uncompensate when panning back
    var dx = gestureState.dx
    //Do nothing if we are panning the wrong way
    if(this._open ^ dx < 0 ^ this.props.side === 'right'){ return false }

    var absDx = Math.abs(dx)
    var moveX = gestureState.moveX
    var relMoveX = this.props.side === 'left'
      ? this._open ? -this.state.viewport.width + moveX : moveX
      : this._open ? -moveX : this.state.viewport.width - moveX
    var delta = relMoveX - dx
    var factor = absDx/Math.abs(relMoveX)
    var adjustedDx = dx + delta*factor
    var left = this.props.panStartCompensation ? this._prevLeft + adjustedDx : this._prevLeft + dx
    left = Math.min(left, this.getOpenLeft())
    left = Math.max(left, this.getClosedLeft())
    this._left = left
    this.updatePosition()
    this._panning = true
  },

  open () {
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

  close () {
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

  toggle () {
    this._open ? this.close() : this.open()
  },

  handlePanResponderEnd: function(e: Object, gestureState: Object) {
    //Do nothing if we are not in an active pan state
    if(!this._panning){ return }
    //@TODO:Reevaluate - If we are panning the wrong way when the pan ends,
    // which animation should trigger?
    // if(this._open ^ gestureState.dx < 0){ return }

    var absRelMoveX = this.props.side === 'left'
      ? this._open ? this.state.viewport.width - gestureState.moveX : gestureState.moveX
      : this._open ? gestureState.moveX : this.state.viewport.width - gestureState.moveX
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

  getMainView () {
    return (
      <View
        key="main"
        style={[this.stylesheet.main, {width: this.getMainWidth(), height: this.state.viewport.height, backgroundColor: 'blue'}]}
        ref="main"
        {...this.responder.panHandlers}>
        {this.props.children}
      </View>
    )
  },

  getDrawerView () {
    var drawerActions = {
      close: this.closeDrawer
    }

    return (
      <View
        key="drawer"
        style={[this.stylesheet.drawer, {width: this.getDrawerWidth(), height: this.state.viewport.height, backgroundColor: 'red'}]}
        ref="drawer"
        {...this.responder.panHandlers}>
        {this.props.content}
      </View>
    )
  },

  render () {
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
      <View style={this.stylesheet.container} key="drawerContainer" onLayout={this.setViewport}>
        {first}
        {second}
      </View>
    )
  },

  getOpenLeft () {
    return this.state.viewport.width - this._offsetOpen
  },

  getClosedLeft () {
    return this._offsetClosed
  },

  getMainWidth () {
    return this.state.viewport.width - this._offsetClosed
  },

  getDrawerWidth () {
    return this.state.viewport.width - this._offsetOpen
  }

})

module.exports = drawer
