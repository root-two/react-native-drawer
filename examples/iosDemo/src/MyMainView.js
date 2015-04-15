var React = require('react-native')

var {
  SwitchIOS,
  SliderIOS,
  PickerIOS,
  PickerItemIOS,
  View,
  ScrollView,
  Text,
} = React

var styles = require('./styles')
var Button = require('./Button')

var drawerTypes = ['overlay', 'displace', 'static']

module.exports = React.createClass({
  render(){
    return (
      <ScrollView
        pointerEvents="box-none"
        style={styles.scrollView}
        onScroll={() => { console.log('onScroll!'); }}
        scrollEventThrottle={200}
        contentInset={{top: 50}}
        >
        <View style={styles.container}>
          <Text style={styles.welcome}>
            Drawer Configuration
          </Text>

          <Button
            onPress={this.props.openDrawer}
            text="Open Drawer"
            />

          {/*type*/}
          <Text style={styles.categoryLabel}>Drawer Type</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Overlay</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {drawerType:'overlay'})}
              style={styles.rowInput}
              disabled={this.props.drawerType === 'overlay'}
              value={this.props.drawerType === 'overlay'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Displace</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {drawerType:'displace'})}
              style={styles.rowInput}
              disabled={this.props.drawerType === 'displace'}
              value={this.props.drawerType === 'displace'} />
          </View>
          <View style={styles.lastRow}>
            <Text style={styles.rowLabel}>Static</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {drawerType:'static'})}
              style={styles.rowInput}
              disabled={this.props.drawerType === 'static'}
              value={this.props.drawerType === 'static'} />
          </View>

          {/*trigger options*/}
          <Text style={styles.categoryLabel}>Trigger Options</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>relativeDrag</Text>
            <SwitchIOS
              onValueChange={ (value) => { this.props.setParentState({'relativeDrag': value})} }
              style={styles.rowInput}
              value={this.props.relativeDrag} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>panStartCompensation</Text>
            <SwitchIOS
              onValueChange={ (value) => { this.props.setParentState({'panStartCompensation': value})} }
              style={styles.rowInput}
              value={this.props.panStartCompensation} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>disabled</Text>
            <SwitchIOS
              onValueChange={ (value) => { this.props.setParentState({'disabled': value})} }
              style={styles.rowInput}
              value={this.props.disabled} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Material Design Tween</Text>
            <SwitchIOS
              onValueChange={ (value) => { this.props.setParentState({'tweenHandlerOn': value})} }
              style={styles.rowInput}
              value={this.props.tweenHandlerOn} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>openDrawerThreshold</Text>
            <SliderIOS
              style={styles.slider}
              maximumValue={1}
              value={this.props.openDrawerThreshold}
              onSlidingComplete={(value) => {
                  this.props.setParentState({openDrawerThreshold: value})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.openDrawerThreshold*100)}%</Text>
          </View>

          {/*animation*/}
          <Text style={styles.categoryLabel}>Animation</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>linear</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {animation:'linear'})}
              style={styles.rowInput}
              disabled={this.props.animation === 'linear'}
              value={this.props.animation === 'linear'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>spring</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {animation:'spring'})}
              style={styles.rowInput}
              disabled={this.props.animation === 'spring'}
              value={this.props.animation === 'spring'} />
          </View>
          <View style={styles.lastRow}>
            <Text style={styles.rowLabel}>easeInEaseOut</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {animation:'easeInEaseOut'})}
              style={styles.rowInput}
              disabled={this.props.animation === 'easeInEaseOut'}
              value={this.props.animation === 'easeInEaseOut'} />
          </View>

          {/*offsets*/}
          <Text style={styles.categoryLabel}>Offsets</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>openDrawerOffset</Text>
            <SliderIOS
              style={styles.slider}
              maximumValue={.5}
              value={this.props.openDrawerOffset}
              onSlidingComplete={(value) => {
                  this.props.setParentState({openDrawerOffset: value})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.openDrawerOffset*100)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>closedDrawerOffset</Text>
            <SliderIOS
              style={styles.slider}
              maximumValue={.5}
              value={this.props.closedDrawerOffset}
              onSlidingComplete={(value) => {
                  this.props.setParentState({closedDrawerOffset: value})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.closedDrawerOffset*100)}%</Text>
          </View>

          {/*pan mask*/}
          <Text style={styles.categoryLabel}>Pan Mask</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>panOpenMask</Text>
            <SliderIOS
              style={styles.slider}
              maximumValue={1}
              value={this.props.panOpenMask}
              onSlidingComplete={(value) => {
                  this.props.setParentState({panOpenMask: value})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.panOpenMask*100)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>panCloseMask</Text>
            <SliderIOS
              style={styles.slider}
              maximumValue={1}
              value={this.props.panCloseMask}
              onSlidingComplete={(value) => {
                  this.props.setParentState({panCloseMask: value})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.panCloseMask*100)}%</Text>
          </View>
        </View>
      </ScrollView>
    )
  }
})

// <PickerIOS
//   style={styles.picker}
//   selectedValue={ this.props.drawerType }
//   onValueChange={ this.props.setDrawerType }>
//     {drawerTypes.map((drawerType) => (
//       <PickerItemIOS
//         key={drawerType}
//         value={drawerType}
//         label={drawerType}
//         />
//       )
//       )}
// </PickerIOS>
