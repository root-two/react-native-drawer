## React Native Drawer
<img width="220px" align="right" src="https://raw.githubusercontent.com/rt2zz/react-native-drawer/master/examples/rn-drawer.gif" />

Configurable react native pull out drawer. Supports displace, overlay (material design) static (slack style) transitions modes, as well as custom tweens.  

- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Props](#props)
- [Demo](#demo)
- [Credits](#credits)

### Installation
`npm install react-native-drawer`

### Usage
```javascript
var Drawer = require('react-native-drawer')

var Application = React.createClass({
  closeDrawer: function(){
    this.refs.drawer.close()
  },
  openDrawer: function(){
    this.refs.drawer.open()
  },
  render: function() {
    return (
      <Drawer
        ref="drawer"
        content={<ControlPanel />}
        >
        <MainView />
      </Drawer>
    )
  }
})
```

### Examples
Simple
```js
//Slack Style (static)
<Drawer type="static" content={<MyMenu />} >
  <Main />
</Drawer>

//Material Design Style Drawer
<Drawer
  type="overlay"
  openDrawerOffset={50} //50px gap on the right side of drawer
  panCloseMask={1} //can close with right to left swipe anywhere on screen
  styles={{
    drawer: {
      shadowColor: "#000000",
      shadowOpacity: 0.8,
      shadowRadius: 0,
    }
  }}
  tweenHandler={(ratio) => {
    return {
      drawer: { shadowRadius: Math.min(ratio*5*5, 5) },
      main: { opacity:(2-ratio)/2 },
    }
  }}
  content={<ControlPanel />}
  >
    <Main />
</Drawer>
```

### Props
This module supports a wide range of drawer styles, and hence has *a lot* of props.
##### Important
- `content` (React.Component) `null` - Menu component
- `type` (String: displace:overlay:static) `displace`- Type of drawer.
- `openDrawerOffset` (Number) `0` - Can either be a integer (pixel value) or decimal (ratio of screen width). Defines the right hand margin when the drawer is open.
- `closedDrawerOffset` (Number) `0` - Same as openDrawerOffset, except defines left hand margin when drawer is closed.
- `disabled` (Boolean) `false` - If true the drawer can not be opened and will not respond to pans.

##### Animation / Tween
- `animation` (String: spring|linear|easeInOut) `linear` - Type of slide animation.
- `tweenHandler` (Function) `null` - Takes in the pan ratio (decimal 0 to 1) that represents the tween percent. Returns and object of native props to be set on the constituent views { drawer: {/*native props*/}, main: {/*native props*/} }
- `tweenDuration` (Integer) `250` - The duration of the open/close animation.
- `tweenEasing` (String) `linear` - A easing type supported by [tween-functions](https://www.npmjs.com/package/tween-functions)

##### Event Handlers
- `onOpen` (Function) - Will be called immediately after the drawer has entered the open state.
- `onClose` (Function) - Will be called immediately after the drawer has entered the closed state.

##### Additional Configurations
- `openDrawerThreshold` (Number) `.25` - Ratio of screen width that must be travelled to trigger a drawer open/close
- `panOpenMask` (Number) `.05` - Ratio of screen width that is valid for the start of a pan open action. Make this number small if you need pans to propagate to children.
- `panCloseMask` (Number) `.25` - Ratio of screen width that is valid for the start of a pan close action. Make this number small if you need pans to propagate to children.
- `relativeDrag` (Boolean) `true` - true -> open/close calculation based on pan dx : false -> calculation based on absolute pan position (i.e. touch location)
- `panStartCompensation` (Boolean) `false` - Should the drawer catch up to the finger drag position?
- `initializeOpen` (Boolean) `false` - Initialize with drawer open?
- `acceptDoubleTap` (Boolean) `false` - Toggle drawer when double tap occurs within pan mask?

Props are a work in progress, suggestions welcome.
@TODO support right hand drawer and multiple drawers.

### Tween Handler
You can achieve pretty much any animation you want using the tween handler with the transformMatrix property. E.G.
```js
tweenHandler={(ratio) => {
  var r0 = -ratio/6
  var r1 = 1-ratio/6
  var t = [
             r1,  r0,  0,  0,
             -r0, r1,  0,  0,
             0,   0,   1,  0,
             0,   0,   0,  1,
          ]
  return {
    main: {
      style: {
        transformMatrix: t,
        opacity: 1 - ratio/2,
      },
    }
  }
}}
```
Will result in a skewed fade out animation.

**warning:** Frame rate, and perceived smoothness will vary based on the complexity and speed of the animation. It will likely require some tweaking and compromise to get the animation just right.

### Demo
* `git clone https://github.com/rt2zz/react-native-drawer.git`
* `cd rn-drawer && npm install`
* Open ``./examples/RNDrawerDemo/RNDrawerDemo.xcodeproject` in xcode
* `command+r` (in xcode)

### Credits
Component was adapted from and inspired by
[@khanghoang](https://github.com/khanghoang)'s [RNSideMenu](https://github.com/khanghoang/RNSideMenu)
*AND*
[@kureevalexey](https://twitter.com/kureevalexey)'s [react-native-side-menu](https://github.com/Kureev/react-native-side-menu)
