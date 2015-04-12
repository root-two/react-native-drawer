## React Native Side Drawer

### Content
- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Examples](#examples)
- [Credits](#credits)

### Installation
```bash
npm install rn-drawer
```

### Usage
```javascript
var Drawer = require('rn-drawer')

var DrawerContents = React.createClass({
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
      <Drawer content={<DrawerContents />}>
        <MainView/>
      </Drawer>
    )
  }
})
```

If you want to close the drawer programmatically, e.g. on navigation, you can use the drawerActions prop

```javascript
var DrawerContents = React.createClass({
  about: function() {
    this.props.drawerActions.close();
    this.props.navigator.push({...});
  },

  render: function() {
    return (
      <View>
        <Text>Drawer</Text>
        <Text onPress={this.about}>About</Text>
      </View>
    );
  }
});
```

### Props
- `content` (React.Component) `null` - Menu component
- `type` (String: displace:overlay:static) - Type of drawer.
- `animation` (String: spring|linear|easeInOut) `linear` - Type of slide animation.
- `openDrawerOffset` (Number) `0` - Drawer view left margin if menu is opened
- `closedDrawerOffset` (Number) `0` - Content view left margin if drawer is closed
- `openDrawerThreshold` (Number) `.25` - Ratio of screen width that must be travelled to trigger a drawer open/close
- `panMaskThreshold` (Number) `.25` - Ratio of screen width that is valid for the start of a pan action
- `relativeDrag` (Boolean) `true` - true -> open/close calculation based on pan dx : false -> calculation based on absolute pan position (i.e. touch location)
- `panStartCompensation` (Boolean) `false` - true -> drawer will catch up to pan position
- `initializeOpen` (Boolean) `false` - true -> drawer will start open

Props are a work in progress. relativeDrag:false and panStartCompensation:true may be buggy. @TODO support right hand drawer and multiple drawers.

### Examples
```js
//Material Design Style Overlay Drawer
<Drawer
  type="overlay"
  closedDrawerOffset={0}
  openDrawerOffset={50} //50px gap on the right side of drawer
  initializeOpen={false}
  openDrawerThreshold={.3} //pan must travel 30% to trigger open/close action on release
  panOpenMask={.1} //open pan must originate in far left (10%) of screen
  panCloseMask={1} //can close with right to left swipe anywhere on screen
  panStartCompensation={false}
  relativeDrag={true}
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

### Credits
Component was adapted from and inspired by
[@khanghoang](https://github.com/khanghoang)'s [RNSideMenu](https://github.com/khanghoang/RNSideMenu)  
*AND*  
[@kureevalexey](https://twitter.com/kureevalexey)'s
[react-native-side-menu](https://github.com/Kureev/react-native-side-menu)
