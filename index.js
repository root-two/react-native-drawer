import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { PanResponder, View, StyleSheet, Dimensions, InteractionManager, I18nManager } from 'react-native'

import tween from './tweener'

let deviceScreen = Dimensions.get('window')
const DOUBLE_TAP_INTERVAL = 500
const TAP_DURATION = 250
const propsWhomRequireUpdate = ['closedDrawerOffset', 'openDrawerOffset', 'type', 'styles']

export default class Drawer extends Component {

  _length = 0;
  _prevLength = 0;
  _offsetOpen = 0;
  _offsetClosed = 0;
  _open = false;
  _panning = false;
  _tweenPending = false;
  _activeTween = null;
  _lastPress = 0;
  _panStartTime = 0;
  _syncAfterUpdate = false;
  _interactionHandle = null;

  static tweenPresets = {
    parallax: (ratio, side = 'left') => {
      let drawer = { [side] : -150 * (1 - ratio)}
      return { drawer }
    }
  };

  state = {
    viewport: deviceScreen
  };

  static propTypes = {
    acceptDoubleTap: PropTypes.bool,
    acceptPan: PropTypes.bool,
    acceptTap: PropTypes.bool,
    acceptPanOnDrawer: PropTypes.bool,
    captureGestures: PropTypes.oneOf([true, false, 'open', 'closed']),
    children: PropTypes.node,
    closedDrawerOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    content: PropTypes.node,
    disabled: PropTypes.bool,
    elevation: PropTypes.number,
    initializeOpen: PropTypes.bool,
    open: PropTypes.bool,
    negotiatePan: PropTypes.bool,
    onClose: PropTypes.func,
    onCloseStart: PropTypes.func,
    onOpen: PropTypes.func,
    onOpenStart: PropTypes.func,
    openDrawerOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    panThreshold: PropTypes.number,
    panCloseMask: PropTypes.number,
    panOpenMask: PropTypes.number,
    side: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    styles: PropTypes.object,
    tapToClose: PropTypes.bool,
    tweenDuration: PropTypes.number,
    tweenEasing: PropTypes.string,
    tweenHandler: PropTypes.func,
    type: PropTypes.oneOf(['overlay', 'static', 'displace']),
    useInteractionManager: PropTypes.bool,

    // deprecated
    panStartCompensation: PropTypes.bool,
    openDrawerThreshold: PropTypes.any,
  };

  static defaultProps = {
    open: null,
    initializeOpen: false,

    type: 'displace',
    closedDrawerOffset: 0,
    openDrawerOffset: 0,
    panThreshold: 0.25, // @TODO consider rename to panThreshold
    panOpenMask: null, // defaults to closedDrawerOffset
    panCloseMask: null, // defaults to openDrawerOffset

    tweenHandler: null,
    tweenDuration: 250,
    tweenEasing: 'linear',

    disabled: false,
    negotiatePan: false,
    captureGestures: 'open',
    acceptDoubleTap: false,
    acceptTap: false,
    acceptPan: true,
    acceptPanOnDrawer: true,
    tapToClose: false,

    styles: {},
    elevation: 0,
    onOpen: () => {},
    onClose: () => {},
    side: 'left',

    useInteractionManager: false,
  };

  /*** CONTEXT ***/
  static contextTypes = { drawer: PropTypes.object };
  static childContextTypes = { drawer: PropTypes.object };
  getChildContext = () => ({ drawer: this });
  /*** END CONTEXT ***/

  _registerChildDrawer(drawer) {
    // Store child drawer for gesture disambiguation with multi drawer
    // @TODO make cleaner, generalize to work with 3+ drawers, prop to disable/configure
    this._childDrawer = drawer
  }

  componentWillMount() {
    if (this.context.drawer) this.context.drawer._registerChildDrawer(this)
    if (this.props.openDrawerThreshold && process.env.NODE_ENV !== 'production') console.error('react-native-drawer: openDrawerThreshold is obsolete. Use panThreshold instead.')
    if (this.props.panStartCompensation && process.env.NODE_ENV !== 'production') console.error('react-native-drawer: panStartCompensation is deprecated.')
    if (this.props.relativeDrag && process.env.NODE_ENV !== 'production') console.error('react-native-drawer: relativeDrag is deprecated.')
    this.initialize(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (this.requiresResync(nextProps)) this.resync(null, nextProps)

    if (nextProps.open !== null && this._open !== nextProps.open) {
      this._syncAfterUpdate = true
      this._open = nextProps.open
    }
  }

  componentDidUpdate() {
    if (this._syncAfterUpdate) {
      this._syncAfterUpdate = false
      this._open ? this.open('force') : this.close('force')
    }
  }

  initialize = (props) => {
    let fullLength = this.getDeviceLength();
    this._offsetClosed = this.getClosedOffset(props, this.state.viewport)
    this._offsetOpen = this.getOpenOffset(props, this.state.viewport)
    // add function options
    this._prevLength = this._length

    let styles = {
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }

    styles.main = Object.assign({
      position: 'absolute',
      borderWidth: 0,
    }, this.isLeftOrRightSide() ? {top: 0} : {left: 0}, this.props.styles.main)

    styles.drawer = Object.assign({
      position: 'absolute',
      borderWidth:0,
    }, this.isLeftOrRightSide() ? {top: 0} : {left: 0}, this.props.styles.drawer)

    if (props.initializeOpen || props.open) { // open
      this._open = true
      this._length = fullLength - this._offsetOpen
      styles.main[this.props.side] = 0
      styles.drawer[this.props.side] = 0
      if (props.type === 'static') styles.main[this.props.side] = fullLength - this._offsetOpen
      if (props.type === 'displace') styles.main[this.props.side] = fullLength - this._offsetOpen
    } else { // closed
      this._open = false
      this._length = this._offsetClosed
      styles.main[this.props.side] = this._offsetClosed
      if (props.type === 'static') styles.drawer[this.props.side] = 0
      if (props.type === 'overlay') styles.drawer[this.props.side] = this._offsetClosed + this._offsetOpen - fullLength
      if (props.type === 'displace') styles.drawer[this.props.side] = - fullLength + this._offsetClosed + this._offsetOpen
    }

    if (this.main) {
      this.drawer.setNativeProps({ style: {left: styles.drawer.left}})
      this.main.setNativeProps({ style: {left: styles.main.left}})
    } else {
      this.stylesheet = StyleSheet.create(styles)
      this.responder = PanResponder.create({
        onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
        onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture,
        onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
        onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture,
        onPanResponderMove: this.onPanResponderMove,
        onPanResponderRelease: this.onPanResponderRelease,
	onPanResponderTerminate: this.onPanResponderTerminate
      })
    }

    this.resync(null, props)
  };

  updatePosition = () => {
    let mainProps = {}
    let drawerProps = {}
    let ratio = (this._length - this._offsetClosed) / (this.getOpenLength() - this._offsetClosed)

    switch (this.props.type) {
      case 'overlay':
        drawerProps[this.props.side] = -this.getDeviceLength() + this._offsetOpen + this._length
        mainProps[this.props.side] = this._offsetClosed
        break
      case 'static':
        mainProps[this.props.side] = this._length
        drawerProps[this.props.side] = 0
        break
      case 'displace':
        mainProps[this.props.side] = this._length
        drawerProps[this.props.side] = -this.getDeviceLength() + this._length + this._offsetOpen
        break
    }

    let mainOverlayProps = null
    let drawerOverlayProps = null
    if (this.props.tweenHandler) {
      let propsFrag = this.props.tweenHandler(ratio, this.props.side)
      mainProps = Object.assign(mainProps, propsFrag.main)
      drawerProps = Object.assign(drawerProps, propsFrag.drawer)
      mainOverlayProps = propsFrag.mainOverlay
      drawerOverlayProps = propsFrag.drawerOverlay
    }
    if (this.main && this.drawer && this.mainOverlay && this.drawerOverlay) {
      this.drawer.setNativeProps({style: drawerProps})
      this.main.setNativeProps({style: mainProps})
      if (mainOverlayProps) this.mainOverlay.setNativeProps({style: mainOverlayProps})
      if (drawerOverlayProps) this.drawerOverlay.setNativeProps({style: drawerOverlayProps})
    }
  };

  shouldOpenDrawer(delta) {
    let hasActiveHeading = this._open ^ delta > 0 ^ this.isRightOrBottomSide()
    if (!hasActiveHeading) return this._open
    else return this._open ^ Math.abs(delta) > this.getDeviceLength() * this.props.panThreshold
  }

  onPanResponderTerminate = (e, gestureState) => {
    this._panning = false
    this.shouldOpenDrawer(this.getGestureDelta(gestureState)) ? this.open() : this.close()
  };

  onStartShouldSetPanResponderCapture = (e, gestureState) => {
    if (this.shouldCaptureGestures()) return this.processShouldSet(e, gestureState)
    return false
  };

  onStartShouldSetPanResponder = (e, gestureState) => {
    if (!this.shouldCaptureGestures()) return this.processShouldSet(e, gestureState)
    return false
  };

  onMoveShouldSetPanResponderCapture = (e, gestureState) => {
    if (this.shouldCaptureGestures() && this.props.negotiatePan) return this.processMoveShouldSet(e, gestureState)
    return false
  };

  onMoveShouldSetPanResponder = (e, gestureState) => {
    if (!this.shouldCaptureGestures() && this.props.negotiatePan) return this.processMoveShouldSet(e, gestureState)
    return false
  };

  onPanResponderMove = (e, gestureState) => {
    let delta = this.getGestureDelta(gestureState);
    if (!this.props.acceptPan) return false

    //Do nothing if we are panning the wrong way
    if (this._open ^ delta < 0 ^ this.isRightOrBottomSide()) return false

    delta = this.isRightOrBottomSide() ? delta * -1 : delta
    let length = this._prevLength + delta
    length = Math.min(length, this.getOpenLength())
    length = Math.max(length, this.getClosedLength())
    this._length = length

    this.updatePosition()
    this._panning = true
  };

  onPanResponderRelease = (e, gestureState) => {
    let delta = this.getGestureDelta(gestureState);
    this._panning = false
    if (Date.now() - this._panStartTime < TAP_DURATION) this.processTapGestures()
    if (Math.abs(delta) < 50 && this._activeTween) return

    this.shouldOpenDrawer(delta) ? this.open() : this.close()
    this.updatePosition()
    this._prevLength = this._length
  };

  processShouldSet = (e, gestureState) => {
    let inMask = this.testPanResponderMask(e, gestureState)
    if (!inMask) return false
    this._panStartTime = Date.now()
    if (inMask && this.shouldCaptureGestures()) return true
    if (this.props.negotiatePan) return false
    if (!this.props.acceptPan) return false
    this.terminateActiveTween()
    return true
  };

  processMoveShouldSet = (e, gestureState) => {
    let inMask = this.testPanResponderMask(e, gestureState)
    if (!inMask && (!this.props.acceptPanOnDrawer || this._open === false )) return false
    if (!this.props.acceptPan) return false

    if (!this.props.negotiatePan || this.props.disabled || !this.props.acceptPan || this._panning) return false
    let delta = this.getGestureDelta(gestureState)
    let deltaOppositeAxis = this.getGestureDeltaOppositeAxis(gestureState)
    let swipeToLeftOrTop = (delta < 0) ? true : false
    let swipeToRightOrBottom = (delta > 0) ? true : false
    let swipeOppositeAxis = (Math.abs(deltaOppositeAxis) >= Math.abs(delta)) ? true : false
    let swipeInCloseDirection = (this.isLeftOrTopSide()) ? swipeToLeftOrTop : swipeToRightOrBottom
    if (swipeOppositeAxis || (this._open && !swipeInCloseDirection) || (!this._open && swipeInCloseDirection)) {
      return false
    }

    this.terminateActiveTween()
    return true
  };

  processTapGestures = () => {
    if (this._activeTween) return false // disable tap gestures during tween
    if (this.props.acceptTap || (this.props.tapToClose && this._open)) {
      this._open ? this.close() : this.open()
      return true
    }
    if (this.props.acceptDoubleTap) {
      let now = new Date().getTime()
      let timeDelta = now - this._lastPress
      this._lastPress = now
      if (timeDelta < DOUBLE_TAP_INTERVAL) {
        this._open ? this.close() : this.open()
        return true
      }
    }
    return false
  };

  shouldCaptureGestures() {
    if (this.props.captureGestures === true) return true
    if (this.props.captureGestures === 'closed' && this._open === false) return true
    if (this.props.captureGestures === 'open' && this._open === true) return true
    return false
  }

  testPanResponderMask = (e, gestureState) => {
    if (this.props.disabled) return false

    // Disable if parent or child drawer exist and are open
    // @TODO make cleaner, generalize to work with 3+ drawers, prop to disable/configure
    if (this.context.drawer && this.context.drawer._open) return false
    if (this._childDrawer && this._childDrawer._open) return false

    let pos0 = this.isLeftOrRightSide() ? e.nativeEvent.pageX : e.nativeEvent.pageY
    let deltaOpen = this.isLeftOrTopSide() ? this.getDeviceLength() - pos0 : pos0
    let deltaClose = this.isLeftOrTopSide() ? pos0 : this.getDeviceLength() - pos0

    if ( this._open && deltaOpen > this.getOpenMask() ) return false
    if ( !this._open && deltaClose > this.getClosedMask() ) return false
    return true
  };

  terminateActiveTween = () => {
    if (this._activeTween) {
      this._activeTween.terminate()
      this._activeTween = null
    }
  };

  open = (type, cb) => {
    let start = this._length
    let end = this.getOpenLength()

    if (this._activeTween) return
    if (type !== 'force' && start - end === 0 && this._open === true) return // do nothing if the delta is 0

    this.props.onOpenStart && this.props.onOpenStart()
    this.setInteractionHandle()
    this._activeTween = tween({
      start: this._length,
      end: this.getOpenLength(),
      duration: this.props.tweenDuration,
      easingType: this.props.tweenEasing,
      onFrame: (tweenValue) => {
        this._length = tweenValue
        this.updatePosition()
      },
      onEnd: () => {
        this._activeTween = null
        this._open = true
        this._prevLength = this._length
        this.adjustForCaptureGestures()
        this.props.onOpen()
        this.clearInteractionHandle()

        if(typeof type === 'function') {
          type() // this is actually a callback
        } else cb && cb()

      }
    })
  };

  close = (type, cb) => {
    let start = this._length
    let end = this.getClosedLength()

    if (this._activeTween) return
    if (type !== 'force' && start - end === 0 && this._open === false) return // do nothing if the delta is 0

    this.props.onCloseStart && this.props.onCloseStart()
    this.setInteractionHandle()
    this._activeTween = tween({
      start,
      end,
      easingType: this.props.tweenEasing,
      duration: this.props.tweenDuration,
      onFrame: (tweenValue) => {
        this._length = tweenValue
        this.updatePosition()
      },
      onEnd: () => {
        this._activeTween = null
        this._open = false
        this._prevLength = this._length
        this.adjustForCaptureGestures()
        this.props.onClose()
        this.clearInteractionHandle()

        if(typeof type === 'function') {
          type() // this is actually a callback
        } else cb && cb()

      }
    })
  };

  adjustForCaptureGestures() {
    if (!this.props.captureGestures) return
    let shouldCapture = this.shouldCaptureGestures()
    if (this.mainOverlay && this.drawerOverlay) {
      this.mainOverlay.setNativeProps({ pointerEvents: shouldCapture && this._open ? 'auto' : 'none' })
      this.drawerOverlay.setNativeProps({ pointerEvents: shouldCapture && !this._open ? 'auto' : 'none' })
    }
  }

  setInteractionHandle() {
    if (this._interactionHandle) InteractionManager.clearInteractionHandle(this._interactionHandle)
    if (this.props.useInteractionManager) this._interactionHandle = InteractionManager.createInteractionHandle()
  }

  clearInteractionHandle() {
    if (this._interactionHandle) InteractionManager.clearInteractionHandle(this._interactionHandle)
  }

  toggle = () => {
    this._open ? this.close() : this.open()
  };

  handleSetViewport = (e) => {
    let viewport = e.nativeEvent.layout
    let oldViewport = this.state.viewport
    if (viewport.width === oldViewport.width && viewport.height === oldViewport.height) return
    let didRotationChange = viewport.width !== oldViewport.width
    this.resync(viewport, null, didRotationChange)
  };

  resync = (viewport, props, didRotationChange) => {
    if (didRotationChange) this._syncAfterUpdate = true
    viewport = viewport || this.state.viewport
    props = props || this.props
    this._offsetClosed = this.getClosedOffset(props, viewport)
    this._offsetOpen = this.getOpenOffset(props, viewport)
    this.setState({ viewport })
  };

  requiresResync = (nextProps) => {
    for (let i = 0; i < propsWhomRequireUpdate.length; i++) {
      let key = propsWhomRequireUpdate[i]
      if (this.props[key] !== nextProps[key]) return true
    }
  };

  /*** DYNAMIC GETTERS ***/
  getDeviceLength = (viewport = this.state.viewport) => this.isLeftOrRightSide() ? viewport.width : viewport.height;
  getOpenLength = () => this.getDeviceLength() - this._offsetOpen;
  getClosedLength = () => this._offsetClosed;
  getMainWidth = (viewport = this.state.viewport) => {
    return this.isLeftOrRightSide() ? viewport.width - this._offsetClosed : viewport.width;
  };
  getMainHeight = (viewport = this.state.viewport) => {
    return this.isTopOrBottomSide() ? viewport.height - this._offsetClosed : viewport.height;
  };
  getDrawerWidth = (viewport = this.state.viewport) => {
    return this.isLeftOrRightSide() ? viewport.width - this._offsetOpen : viewport.width;
  };
  getDrawerHeight = (viewport = this.state.viewport) => {
    return this.isTopOrBottomSide() ? viewport.height - this._offsetOpen : viewport.height;
  };
  getOpenMask = (viewport = this.state.viewport) => {
    if (this.props.panCloseMask && this.props.panCloseMask % 1 === 0) return this.props.panCloseMask
    if (this.props.panCloseMask) return this.getDeviceLength(viewport) * this.props.panCloseMask
    return Math.max(0.05, this._offsetOpen)
  };
  getClosedMask = () => {
    if (this.props.panOpenMask && this.props.panOpenMask % 1 === 0) return this.props.panOpenMask
    if (this.props.panOpenMask) return this.getDeviceLength() * this.props.panOpenMask
    return Math.max(0.05, this._offsetClosed)
  };
  getOpenOffset = (props, viewport) => {
    if (typeof props.openDrawerOffset === 'function') return props.openDrawerOffset(viewport)
    return props.openDrawerOffset > 1 || props.openDrawerOffset < 0 ? props.openDrawerOffset : props.openDrawerOffset * this.getDeviceLength(viewport)
  };
  getClosedOffset = (props, viewport) => {
    if (typeof props.closedDrawerOffset === 'function') return props.closedDrawerOffset(viewport)
    return props.closedDrawerOffset > 1 || props.closedDrawerOffset < 0 ? props.closedDrawerOffset : props.closedDrawerOffset * this.getDeviceLength(viewport)
  };
  getGestureDelta = (gestureState) => this.isLeftOrRightSide() ? gestureState.dx : gestureState.dy;
  getGestureDeltaOppositeAxis = (gestureState) => this.isLeftOrRightSide() ? gestureState.dy : gestureState.dx;
  /*** END DYNAMIC GETTERS ***/

  isLeftOrRightSide = () => {
    if (I18nManager.isRTL) {
      return ["right", "left"].includes(this.props.side)
    } else {
      return ["left", "right"].includes(this.props.side)
    }
  }
  isTopOrBottomSide = () => ["top", "bottom"].includes(this.props.side);
  isLeftOrTopSide = () => {
    let side = "left";
    if (I18nManager.isRTL) {
      side = "right";
    }
    return [side, "top"].includes(this.props.side);
  }
  isRightOrBottomSide = () => {
    let side = "right"
    if (I18nManager.isRTL) {
      side = "left"
    }
    return [side, "bottom"].includes(this.props.side);
  }

  render() {
    let first = this.props.type === 'overlay' ? this.renderMain() : this.renderDrawer()
    let second = this.props.type === 'overlay' ? this.renderDrawer() : this.renderMain()

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

  renderMain() {
    return (
      <View
        {...this.responder.panHandlers}
        key="main"
        ref={c => this.main = c}
        style={[this.stylesheet.main, {height: this.getMainHeight(), width: this.getMainWidth()}]}
        >
        {this.props.children}
        <View
          pointerEvents={ this._open && this.shouldCaptureGestures() ? 'auto' : 'none' }
          ref={c => this.mainOverlay = c}
          style={[styles.overlay, this.props.styles && this.props.styles.mainOverlay]}
          />
      </View>
    )
  }

  renderDrawer() {
    return (
      <View
        {...this.responder.panHandlers}
        key="drawer"
        ref={c => this.drawer = c}
        elevation={this.props.elevation}
        style={[this.stylesheet.drawer, {height: this.getDrawerHeight(), width: this.getDrawerWidth()}]}
        >
        {this.props.content}
        <View
          pointerEvents={ !this._open && this.shouldCaptureGestures() ? 'auto' : 'none' }
          ref={c => this.drawerOverlay = c}
          style={[styles.overlay, this.props.styles && this.props.styles.drawerOverlay]}
          />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  overlay: {
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    backgroundColor: 'transparent'
  }
})
