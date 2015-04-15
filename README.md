## React Native Drawer
<p align="center">
  <img width="220px" src="https://raw.githubusercontent.com/rt2zz/rn-drawer/master/examples/rn-drawer.gif" />
</p>

- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Examples](#examples)
- [Demo](#demo)
- [Credits](#credits)

### Installation
```bash
npm install rn-drawer
```

### Usage
```javascript
var Drawer = require('rn-drawer')

var DrawerContent = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text>
          Control Panel
        </Text>
      </View>
    )
  }
})

var MainView = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text>
          Main View
        </Text>
      </View>
    )
  }
})

var Application = React.createClass({
  render: function() {
    return (
      <Drawer content={<DrawerContent />}>
        <MainView/>
      </Drawer>
    )
  }
})
```

If you want to close the drawer programmatically, use the closeDrawer & openDrawer methods. There is also a drawerActions prop provided to the drawer component, but this may be removed in future versions.

### Props
This module supports a wide range of drawer styles, and hence has *a lot* of props. It may help to package up presets as separate modules.
#### Important
- `content` (React.Component) `null` - Menu component
- `type` (String: displace:overlay:static) `displace`- Type of drawer.
- `openDrawerOffset` (Number) `0` - Can either be a integer (pixel value) or decimal (ratio of screen width). Defines the right hand margin when the drawer is open.
- `closedDrawerOffset` (Number) `0` - Same as openDrawerOffset, except defines left hand margin when drawer is closed.
- `disabled` (Boolean) `false` - If true the drawer can not be opened and will not respond to pans.

#### Animation / Tween
- `animation` (String: spring|linear|easeInOut) `linear` - Type of slide animation.
- `tweenHandler` (Function) `null` - Takes in the pan ratio (decimal 0 to 1) that represents the tween percent. Returns and object of native props to be set on the constituent views { drawer: {/*native props*/}, main: {/*native props*/} }


### Additional Configurations
- `openDrawerThreshold` (Number) `.25` - Ratio of screen width that must be travelled to trigger a drawer open/close
- `panOpenMask` (Number) `.05` - Ratio of screen width that is valid for the start of a pan open action. Make this number small if you need pans to propagate to children.
- `panCloseMask` (Number) `.25` - Ratio of screen width that is valid for the start of a pan close action. Make this number small if you need pans to propagate to children.
- `relativeDrag` (Boolean) `true` - true -> open/close calculation based on pan dx : false -> calculation based on absolute pan position (i.e. touch location)
- `panStartCompensation` (Boolean) `false` - true -> drawer will catch up to pan position
- `initializeOpen` (Boolean) `false` - true -> drawer will start open

Props are a work in progress, suggestions welcome.  
@TODO support right hand drawer and multiple drawers.

### Examples
```js
//Material Design Style Overlay Drawer
<Drawer
  type="overlay"
  openDrawerOffset={50} //50px gap on the right side of drawer
  panCloseMask={1} //can close with right to left swipe anywhere on screen
  panStartCompensation={false}
  relativeDrag={true}
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
  content={<Menu />}
  >
    <Main />
</Drawer>

//Slack Style Static Drawer
<Drawer
  type="static"
  closedDrawerOffset={0}
  openDrawerOffset={100} //100px gap on the right side of drawer
  initializeOpen={false}
  openDrawerThreshold={.3} //pan must travel 30% to trigger open/close action on release
  panOpenMask={.05} //open pan must originate in far left (5%) of screen
  panCloseMask={.3} //can close with right to left swipe in right hand third of screen
  panStartCompensation={false}
  relativeDrag={true}
  content={<Menu />}
  >
    <Main />
</Drawer>

//Simple Navigation Style Displacement, Starting Open
<Drawer
  type="static"
  initializeOpen={true}
  content={<Menu />}
  >
    <Main />
</Drawer>
```

### Demo
`git clone https://github.com/rt2zz/rn-drawer.git`  
Open ``./examples/iosDemo/rndrawereg.xcodeproject` in xcode  
`command+r`

### Credits
Component was adapted from and inspired by  
[@khanghoang](https://github.com/khanghoang)'s [RNSideMenu](https://github.com/khanghoang/RNSideMenu)  
*AND*  
[@kureevalexey](https://twitter.com/kureevalexey)'s [react-native-side-menu](https://github.com/Kureev/react-native-side-menu)
