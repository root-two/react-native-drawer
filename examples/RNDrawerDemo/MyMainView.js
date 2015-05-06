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
        scrollEventThrottle={200}
        contentInset={{top: 0}}
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

          {/*tween presets*/}
          <Text style={styles.categoryLabel}>Example Tweens</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>None</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {tweenHandlerPreset:null})}
              style={styles.rowInput}
              disabled={this.props.tweenHandlerPreset === null}
              value={this.props.tweenHandlerPreset === null} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Material Design</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {tweenHandlerPreset:'material'})}
              style={styles.rowInput}
              disabled={this.props.tweenHandlerPreset === 'material'}
              value={this.props.tweenHandlerPreset === 'material'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Rotate</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {tweenHandlerPreset:'rotate'})}
              style={styles.rowInput}
              disabled={this.props.tweenHandlerPreset === 'rotate'}
              value={this.props.tweenHandlerPreset === 'rotate'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Parallax</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {tweenHandlerPreset:'parallax'})}
              style={styles.rowInput}
              disabled={this.props.tweenHandlerPreset === 'parallax'}
              value={this.props.tweenHandlerPreset === 'parallax'} />
          </View>

          {/*animation*/}
          <Text style={styles.categoryLabel}>tweenEasing</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>linear</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {tweenEasing:'linear'})}
              style={styles.rowInput}
              disabled={this.props.tweenEasing === 'linear'}
              value={this.props.tweenEasing === 'linear'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>easeOutQuad</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {tweenEasing:'easeOutQuad'})}
              style={styles.rowInput}
              disabled={this.props.tweenEasing === 'easeOutQuad'}
              value={this.props.tweenEasing === 'easeOutQuad'} />
          </View>
          <View style={styles.lastRow}>
            <Text style={styles.rowLabel}>easeOutElastic</Text>
            <SwitchIOS
              onValueChange={this.props.setParentState.bind(this, {tweenEasing:'easeOutElastic'})}
              style={styles.rowInput}
              disabled={this.props.tweenEasing === 'easeOutElastic'}
              value={this.props.tweenEasing === 'easeOutElastic'} />
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
