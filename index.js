import React, {
  PanResponder,
  View,
  StyleSheet,
  Dimensions,
  PropTypes,
  Component
} from 'react-native'
import tween from './tweener'

let deviceScreen = Dimensions.get('window')

class Drawer extends Component {

  constructor(props) {
    super(props)
    // `this` keyword binding - No Autobinding in ES6 Classes
    this.handleStartShouldSetPanResponderCapture = this.handleStartShouldSetPanResponderCapture.bind(this)
    this.handleStartShouldSetPanResponder = this.handleStartShouldSetPanResponder.bind(this)
    this.handleMoveShouldSetPanResponderCapture = this.handleMoveShouldSetPanResponderCapture.bind(this)
    this.handleMoveShouldSetPanResponder = this.handleMoveShouldSetPanResponder.bind(this)
    this.handlePanResponderMove = this.handlePanResponderMove.bind(this)
    this.handlePanResponderEnd = this.handlePanResponderEnd.bind(this)
    this.componentWillMount = this.componentWillMount.bind(this)
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this)
    this.componentDidUpdate = this.componentDidUpdate.bind(this)
    this.updatePosition = this.updatePosition.bind(this)
    this.shouldOpenDrawer = this.shouldOpenDrawer.bind(this)
    this.processTapGestures = this.processTapGestures.bind(this)
    this.testPanResponderMask = this.testPanResponderMask.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.toggle = this.toggle.bind(this)
    this.getMainView = this.getMainView.bind(this)
    this.getDrawerView = this.getDrawerView.bind(this)
    this.getOpenLeft = this.getOpenLeft.bind(this)
    this.getClosedLeft = this.getClosedLeft.bind(this)
    this.getMainWidth = this.getMainWidth.bind(this)
    this.getDrawerWidth = this.getDrawerWidth.bind(this)
    this.initialize = this.initialize.bind(this)
    this.handleSetViewport = this.handleSetViewport.bind(this)
    this.resync = this.resync.bind(this)
    this.requiresResync = this.requiresResync.bind(this)

    this._left = 0
    this._prevLeft = 0
    this._offsetOpen = 0
    this._offsetClosed = 0
    this._open = false
    this._panning = false
    this._tweenPending = false
    this._lastPress = 0
    this._panStartTime = 0
    this._syncAfterUpdate = false

    let parallaxDrawerSideNumber = -150
    this.statics = {
      tweenPresets: {
        parallax: (ratio, side = 'left') => {
          var drawer = {}
          drawer[side] = parallaxDrawerSideNumber * (1 - ratio)
          return { drawer: drawer }
        }
      }
    }

    this.propsWhomRequireUpdate = [
      'closedDrawerOffset',
      'openDrawerOffset',
      'type'
    ]

    this.state = { viewport: props.deviceScreen } // getInitialState ()
  }

  getChildContext () {
    return {
      drawer: this
    }
  }

  componentWillMount () {
    this.initialize(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (this.requiresResync(nextProps)){
      this.resync(null, nextProps)
    }
  }

  componentDidUpdate () {
    if (this._syncAfterUpdate){
      this._syncAfterUpdate = false
      this._open ? this.open() : this.close()
    }
  }

  updatePosition () {
    var mainProps = {}
    var drawerProps = {}

    var ratio = (this._left - this._offsetClosed) / (this.getOpenLeft() - this._offsetClosed)

    switch (this.props.type) {
    case 'overlay':
      drawerProps[this.props.side] = -this.state.viewport.width + this._offsetOpen + this._left
      mainProps[this.props.side] = this._offsetClosed
      break;
    case 'static':
      mainProps[this.props.side] = this._left
      drawerProps[this.props.side] = 0
      break;
    case 'displace':
      mainProps[this.props.side] = this._left
      drawerProps[this.props.side] = -this.state.viewport.width + this._left + this._offsetOpen
      break;
    }

    if (this.props.tweenHandler) {
      var propsFrag = this.props.tweenHandler(ratio, this.props.side)
      mainProps = Object.assign(mainProps, propsFrag.main)
      drawerProps = Object.assign(drawerProps, propsFrag.drawer)
    }
    this.drawer.setNativeProps({style: drawerProps})
    this.main.setNativeProps({style: mainProps})
  }

  shouldOpenDrawer (dx) {
    if (this._open){
      return dx < this.state.viewport.width * this.props.openDrawerThreshold
    }
    else {
      return dx > this.state.viewport.width * this.props.openDrawerThreshold
    }
  }

  handleStartShouldSetPanResponderCapture (e, gestureState) {
    if (this.props.captureGestures){ return this.handleStartShouldSetPanResponder(e, gestureState) }
    return false
  }

  handleStartShouldSetPanResponder (e, gestureState) {
    if (this.props.negotiatePan) {
      return false
    }
    this._panStartTime = Date.now()
    if (!this.testPanResponderMask(e, gestureState)){
      return false
    }
    return true
  }

  handleMoveShouldSetPanResponderCapture (e, gestureState) {
    if (this.props.captureGestures && this.props.negotiatePan){
      return this.handleMoveShouldSetPanResponder(e, gestureState)
    }
    return false
  }

  handleMoveShouldSetPanResponder (e, gestureState) {
    if (!this.props.negotiatePan || this.props.disabled){
      return false
    }
    var swipeToLeft = (gestureState.dx < 0) ? true : false
    var swipeToRight = (gestureState.dx > 0) ? true : false
    var swipeUpDown = (Math.abs(gestureState.dy) >= Math.abs(gestureState.dx)) ? true : false
    var swipeInCloseDirection = (this.props.side === 'left') ? swipeToLeft : swipeToRight
    if (swipeUpDown || (this._open && !swipeInCloseDirection) || (!this._open && swipeInCloseDirection)){
      return false
    }
    return true
  }

  processTapGestures () {
    let minLastPressInterval = 500
    if (this.props.acceptTap){
      this._open ? this.close() : this.open()
    }
    if (this.props.tapToClose && this._open){
      this.close()
    }
    if (this.props.acceptDoubleTap) {
      var now = new Date().getTime()
      if (now - this._lastPress < minLastPressInterval){
        this._open ? this.close() : this.open()
      }
      this._lastPress = now
    }
  }

  testPanResponderMask (e, gestureState) {
    if (this.props.disabled){ return false }
    var x0 = e.nativeEvent.pageX

    var deltaOpen = this.props.side === 'left' ? deviceScreen.width - x0 : x0
    var deltaClose = this.props.side === 'left' ? x0 : deviceScreen.width - x0

    var whenClosedMask = this.props.panOpenMask % 1 === 0 && this.props.panOpenMask > 1 ? this.props.panOpenMask : deviceScreen.width * this.props.panOpenMask
    var whenOpenMask = this.props.panCloseMask % 1 === 0 && this.props.panCloseMask > 1 ? this.props.panCloseMask : deviceScreen.width * this.props.panCloseMask
    if ( this._open && deltaOpen > whenOpenMask ){
      return false
    }
    if ( !this._open && deltaClose > whenClosedMask ){
      return false
    }
    return true
  }

  handlePanResponderMove (e, gestureState) {
    if (!this.props.acceptPan){
      return false
    }

    //Math is ugly overly verbose here, probably can be greatly cleaned up
    var dx = gestureState.dx
    //@TODO store adjustedDx max so that it does not uncompensate when panning back
    var dx = gestureState.dx
    //Do nothing if we are panning the wrong way
    if (this._open ^ dx < 0 ^ this.props.side === 'right'){ return false }

    var absDx = Math.abs(dx)
    var moveX = gestureState.moveX
    var relMoveX = this.props.side === 'left'
      ? this._open ? -this.state.viewport.width + moveX : moveX
      : this._open ? -moveX : this.state.viewport.width - moveX
    var delta = relMoveX - dx
    var factor = absDx / Math.abs(relMoveX)
    var adjustedDx = dx + delta * factor
    var left = this.props.panStartCompensation ? this._prevLeft + adjustedDx : this._prevLeft + dx
    left = Math.min(left, this.getOpenLeft())
    left = Math.max(left, this.getClosedLeft())
    this._left = left
    this.updatePosition()
    this._panning = true
  }

  open () {
    this.props.onOpenStart && this.props.onOpenStart()
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
        if (this.props.type === 'overlay'){
          this.mainOverlay.setNativeProps({ style: { height: this.state.viewport.height }})
        }
        this.props.onOpen()
      }
    })
  }

  close () {
    this.props.onCloseStart && this.props.onCloseStart()
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
        if (this.props.type === 'overlay'){
          this.mainOverlay.setNativeProps({ style: { height: 0 }})
        }
        this.props.onClose()
      }
    })
  }

  toggle () {
    this._open ? this.close() : this.open()
  }

  handlePanResponderEnd (e, gestureState) {
    let minDx = 100, minPanStartTime = 500
  // @TODO fine tune these thresholds
    if (gestureState.dx < minDx && (Date.now() - this._panStartTime < minPanStartTime)) {
      if (!this._open) {
        this.close()
      }
      this._panning = false
      this.processTapGestures()
      return
    }

    var absRelMoveX = this.props.side === 'left'
      ? this._open ? this.state.viewport.width - gestureState.moveX : gestureState.moveX
      : this._open ? gestureState.moveX : this.state.viewport.width - gestureState.moveX
    var calcPos = this.props.relativeDrag ? Math.abs(gestureState.dx) : absRelMoveX

    this.shouldOpenDrawer(calcPos) ? this.open() : this.close()

    this.updatePosition()
    this._prevLeft = this._left
    this._panning = false
  }

  getMainView () {
    return (
      <View
        {...this.responder.panHandlers}
        key="main"
        ref={c => this.main = c}
        style={[this.stylesheet.main, {width: this.getMainWidth(), height: this.state.viewport.height}]}
      >
        {this.props.children}
        {this.props.type === 'overlay'
          ? <View
            ref={c => this.mainOverlay = c}
            style={
                  [this.stylesheet.main, {width: this.getMainWidth(), height: 0, backgroundColor:'transparent'}]
                }
              />
          : null}
      </View>
    )
  }

  getDrawerView () {
    return (
      <View
        {...this.responder.panHandlers}
        key="drawer"
        ref={c => this.drawer = c}
        style={[this.stylesheet.drawer, {width: this.getDrawerWidth(), height: this.state.viewport.height}]}
      >
        {this.props.content}
      </View>
    )
  }

  getOpenLeft () {
    return this.state.viewport.width - this._offsetOpen
  }

  getClosedLeft () {
    return this._offsetClosed
  }

  getMainWidth () {
    return this.state.viewport.width - this._offsetClosed
  }

  getDrawerWidth () {
    return this.state.viewport.width - this._offsetOpen
  }

  initialize (props) {
    var fullWidth = this.state.viewport.width
    this._offsetClosed = props.closedDrawerOffset % 1 === 0 ? props.closedDrawerOffset : props.closedDrawerOffset * fullWidth
    this._offsetOpen = props.openDrawerOffset % 1 === 0 ? props.openDrawerOffset : props.openDrawerOffset * fullWidth
    this._prevLeft = this._left

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
    }, {borderWidth:0}, this.props.styles.main)

    styles.drawer = Object.assign({
      position: 'absolute',
      top: 0,
      height: this.state.viewport.height,
    }, {borderWidth:0}, this.props.styles.drawer)

    if (props.initializeOpen === true) { // open
      this._open = true
      this._left = fullWidth - this._offsetOpen
      styles.main[this.props.side] = 0
      styles.drawer[this.props.side] = 0
      if (props.type === 'static'){ styles.main[this.props.side] = fullWidth - this._offsetOpen }
      if (props.type === 'displace') { styles.main[this.props.side] = fullWidth - this._offsetOpen }
    } else { // closed
      this._open = false
      this._left = this._offsetClosed
      styles.main[this.props.side] = this._offsetClosed
      if (props.type === 'static'){ styles.drawer[this.props.side] = 0 }
      if (props.type === 'overlay'){ styles.drawer[this.props.side] = this._offsetClosed + this._offsetOpen - fullWidth }
      if (props.type === 'displace'){ styles.drawer[this.props.side] = - fullWidth + this._offsetClosed + this._offsetOpen }
    }

    if (this.main) {
      this.drawer.setNativeProps({ style: {left: styles.drawer.left}})
      this.main.setNativeProps({ style: {left: styles.main.left}})
    } else {
      this.stylesheet = StyleSheet.create(styles)
      this.responder = PanResponder.create({
        onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
        onStartShouldSetPanResponderCapture: this.handleStartShouldSetPanResponderCapture,
        onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
        onMoveShouldSetPanResponderCapture: this.handleMoveShouldSetPanResponderCapture,
        onPanResponderMove: this.handlePanResponderMove,
        onPanResponderRelease: this.handlePanResponderEnd,
      })
    }

    this.resync(null, props)
  }

  handleSetViewport (e) {
    var viewport = e.nativeEvent.layout
    var oldViewport = this.state.viewport
    if (viewport.width === oldViewport.width && viewport.height === oldViewport.height){
      return
    }
    this.resync(viewport)
  }

  resync (viewport, props) {
    if (viewport) {
      this._syncAfterUpdate = true
    }
    var viewport = viewport || this.state.viewport
    var props = props || this.props
    this._offsetClosed = props.closedDrawerOffset % 1 === 0 ? props.closedDrawerOffset : props.closedDrawerOffset * viewport.width
    this._offsetOpen = props.openDrawerOffset % 1 === 0 ? props.openDrawerOffset : props.openDrawerOffset * viewport.width
    this.setState({ viewport: viewport })
  }

  requiresResync (nextProps) {
    for (var i = 0; i < this.propsWhomRequireUpdate.length; i++) {
      var key = this.propsWhomRequireUpdate[i]
      if (this.props[key] !== nextProps[key]){ return true }
    }
  }

  render() {
    var first = this.props.type === 'overlay' ? this.getMainView() : this.getDrawerView()
    var second = this.props.type === 'overlay' ? this.getDrawerView() : this.getMainView()

    return (
      <View
        key="drawerContainer"
        onLayout={this.handleSetViewport}
        style={this.stylesheet.container}
      >
        {first}
        {second}
      </View>
    )
  }

}

Drawer.childContextTypes = {
  drawer: PropTypes.any
}

Drawer.propTypes = {
  acceptDoubleTap: React.PropTypes.bool,
  acceptPan: React.PropTypes.bool,
  acceptTap: React.PropTypes.bool,
  captureGestures: React.PropTypes.bool,
  children: React.PropTypes.node,
  closedDrawerOffset: React.PropTypes.number,
  content: React.PropTypes.node,
  disabled: React.PropTypes.bool,
  deviceScreen: React.PropTypes.object,
  initializeOpen: React.PropTypes.bool,
  negotiatePan: React.PropTypes.bool,
  onClose: React.PropTypes.func,
  onCloseStart: React.PropTypes.func,
  onOpen: React.PropTypes.func,
  onOpenStart: React.PropTypes.func,
  openDrawerOffset: React.PropTypes.number,
  openDrawerThreshold: React.PropTypes.number,
  panCloseMask: React.PropTypes.number,
  panOpenMask: React.PropTypes.number,
  panStartCompensation: React.PropTypes.bool,
  relativeDrag: React.PropTypes.bool,
  side: React.PropTypes.oneOf(['left', 'right']),
  styles: React.PropTypes.object,
  tapToClose: React.PropTypes.bool,
  tweenDuration: React.PropTypes.number,
  tweenEasing: React.PropTypes.string,
  tweenHandler: React.PropTypes.func,
  type: React.PropTypes.string,
}

Drawer.defaultProps = {
  type: 'displace',
  closedDrawerOffset: 0,
  deviceScreen: deviceScreen,
  openDrawerOffset: 0,
  openDrawerThreshold: 0.25,
  relativeDrag: true,
  panStartCompensation: true,
  panOpenMask: 0.25,
  panCloseMask: 0.25,
  captureGestures: false,
  negotiatePan: false,
  initializeOpen: false,
  tweenHandler: null,
  tweenDuration: 250,
  tweenEasing: 'linear',
  disabled: false,
  acceptDoubleTap: false,
  acceptTap: false,
  acceptPan: true,
  tapToClose: false,
  styles: {},
  onOpen: () => {},
  onClose: () => {},
  side: 'left',
}

module.exports = Drawer
