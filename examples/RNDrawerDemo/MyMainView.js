import React, { Component } from 'react';
import {
  Switch,
  SliderIOS,
  PickerIOS,
  PickerItemIOS,
  View,
  ScrollView,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';

import SliderJS from 'react-native-slider';

import styles from './styles';
import Button from './Button';

export default class MyMainView extends Component {
  setParentState(args){
    this.props.setParentState(args)
  }

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
            <Switch
              onValueChange={this.setParentState.bind(this, {drawerType:'overlay'})}
              style={styles.rowInput}
              disabled={this.props.drawerType === 'overlay'}
              value={this.props.drawerType === 'overlay'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Displace</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {drawerType:'displace'})}
              style={styles.rowInput}
              disabled={this.props.drawerType === 'displace'}
              value={this.props.drawerType === 'displace'} />
          </View>
          <View style={styles.lastRow}>
            <Text style={styles.rowLabel}>Static</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {drawerType:'static'})}
              style={styles.rowInput}
              disabled={this.props.drawerType === 'static'}
              value={this.props.drawerType === 'static'} />
          </View>

          {/*trigger options*/}
          <Text style={styles.categoryLabel}>Trigger Options</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>relativeDrag</Text>
            <Switch
              onValueChange={ (value) => { this.setParentState({'relativeDrag': value})} }
              style={styles.rowInput}
              value={this.props.relativeDrag} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>disabled</Text>
            <Switch
              onValueChange={ (value) => { this.setParentState({'disabled': value})} }
              style={styles.rowInput}
              value={this.props.disabled} />
          </View>
	        <View style={styles.row}>
						<Text style={styles.rowLabel}>panThreshold</Text>
						<SliderJS
								style={styles.slider}
								trackStyle={sliderStyles.track}
		            thumbStyle={sliderStyles.thumb}
		            minimumTrackTintColor={minimumTrackTintColor}
		            maximumTrackTintColor={maximumTrackTintColor}
								thumbTintColor={thumbTintColor}
	              maximumValue={.5}
	              value={this.props.panThreshold}
	              onSlidingComplete={(value) => {
	                  this.setParentState({panThreshold: value})
	                }}
							/>
            <Text style={styles.sliderMetric}>{Math.round(this.props.panThreshold*100)}%</Text>
          </View>

          {/*tween presets*/}
          <Text style={styles.categoryLabel}>Example Tweens</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>None</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {tweenHandlerPreset:null})}
              style={styles.rowInput}
              disabled={this.props.tweenHandlerPreset === null}
              value={this.props.tweenHandlerPreset === null} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Material Design</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {tweenHandlerPreset:'material'})}
              style={styles.rowInput}
              disabled={this.props.tweenHandlerPreset === 'material'}
              value={this.props.tweenHandlerPreset === 'material'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Rotate</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {tweenHandlerPreset:'rotate'})}
              style={styles.rowInput}
              disabled={this.props.tweenHandlerPreset === 'rotate'}
              value={this.props.tweenHandlerPreset === 'rotate'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Parallax</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {tweenHandlerPreset:'parallax'})}
              style={styles.rowInput}
              disabled={this.props.tweenHandlerPreset === 'parallax'}
              value={this.props.tweenHandlerPreset === 'parallax'} />
          </View>

          {/*animation*/}
          <Text style={styles.categoryLabel}>tweenEasing</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>linear</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {tweenEasing:'linear'})}
              style={styles.rowInput}
              disabled={this.props.tweenEasing === 'linear'}
              value={this.props.tweenEasing === 'linear'} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>easeOutQuad</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {tweenEasing:'easeOutQuad'})}
              style={styles.rowInput}
              disabled={this.props.tweenEasing === 'easeOutQuad'}
              value={this.props.tweenEasing === 'easeOutQuad'} />
          </View>
          <View style={styles.lastRow}>
            <Text style={styles.rowLabel}>easeOutElastic</Text>
            <Switch
              onValueChange={this.setParentState.bind(this, {tweenEasing:'easeOutElastic'})}
              style={styles.rowInput}
              disabled={this.props.tweenEasing === 'easeOutElastic'}
              value={this.props.tweenEasing === 'easeOutElastic'} />
          </View>

          {/*offsets*/}
          <Text style={styles.categoryLabel}>Offsets</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>openDrawerOffset</Text>
            <SliderJS
              style={styles.slider}
							trackStyle={sliderStyles.track}
							thumbStyle={sliderStyles.thumb}
							minimumTrackTintColor={minimumTrackTintColor}
							maximumTrackTintColor={maximumTrackTintColor}
							thumbTintColor={thumbTintColor}
              maximumValue={.5}
              value={this.props.openDrawerOffset}
              onSlidingComplete={(value) => {
                  this.setParentState({openDrawerOffset: parseFloat(value)})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.openDrawerOffset*100)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>closedDrawerOffset</Text>
            <SliderJS
              style={styles.slider}
							trackStyle={sliderStyles.track}
							thumbStyle={sliderStyles.thumb}
							minimumTrackTintColor={minimumTrackTintColor}
							maximumTrackTintColor={maximumTrackTintColor}
							thumbTintColor={thumbTintColor}
              maximumValue={.5}
              value={this.props.closedDrawerOffset}
              onSlidingComplete={(value) => {
                  this.setParentState({closedDrawerOffset: parseFloat(value)})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.closedDrawerOffset*100)}%</Text>
          </View>

          {/*pan mask*/}
          <Text style={styles.categoryLabel}>Pan Mask</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>panOpenMask</Text>
            <SliderJS
              style={styles.slider}
							trackStyle={sliderStyles.track}
							thumbStyle={sliderStyles.thumb}
							minimumTrackTintColor={minimumTrackTintColor}
							maximumTrackTintColor={maximumTrackTintColor}
							thumbTintColor={thumbTintColor}
              maximumValue={1}
              value={this.props.panOpenMask}
              onSlidingComplete={(value) => {
                  this.setParentState({panOpenMask: value})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.panOpenMask*100)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>panCloseMask</Text>
            <SliderJS
              style={styles.slider}
							trackStyle={sliderStyles.track}
							thumbStyle={sliderStyles.thumb}
							minimumTrackTintColor={minimumTrackTintColor}
							maximumTrackTintColor={maximumTrackTintColor}
							thumbTintColor={thumbTintColor}
              maximumValue={1}
              value={this.props.panCloseMask}
              onSlidingComplete={(value) => {
                  this.setParentState({panCloseMask: value})
                }}
                />
              <Text style={styles.sliderMetric}>{Math.round(this.props.panCloseMask*100)}%</Text>
          </View>

          {/*others*/}
          <Text style={styles.categoryLabel}>Others</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Accept Tap</Text>
            <Switch
              onValueChange={ (value) => { this.setParentState({'acceptTap': value})} }
              style={styles.rowInput}
              value={this.props.acceptTap} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Accept Double Tap</Text>
            <Switch
              onValueChange={ (value) => { this.setParentState({'acceptDoubleTap': value})} }
              style={styles.rowInput}
              value={this.props.acceptDoubleTap} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Accept Pan</Text>
            <Switch
              onValueChange={ (value) => { this.setParentState({'acceptPan': value})} }
              style={styles.rowInput}
              value={this.props.acceptPan} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Tap To Close</Text>
            <Switch
              onValueChange={ (value) => { this.setParentState({'tapToClose': value})} }
              style={styles.rowInput}
              value={this.props.tapToClose} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Negotiate Pan</Text>
            <Switch
              onValueChange={ (value) => { this.setParentState({'negotiatePan': value})} }
              style={styles.rowInput}
              value={this.props.negotiatePan} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Right Side (not hot changeable)</Text>
            <Switch
              onValueChange={ (value) => { this.setParentState({'rightSide': value})} }
              style={styles.rowInput}
              disabled={true}
              value={this.props.rightSide} />
          </View>
        </View>
      </ScrollView>
    )
  }
}



// Shadow props are not supported in React-Native Android apps.
// The below part handles this issue.

// iOS Styles
var iosStyles = StyleSheet.create({
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {width: 3, height: 5},
    shadowRadius: 5,
    shadowOpacity: 0.75,
  }
});

const iosMinTrTintColor = '#1073ff';
const iosMaxTrTintColor = '#b7b7b7';
const iosThumbTintColor = '#343434';

// Android styles
const androidStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 4 / 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
  },
  touchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugThumbTouchArea: {
    position: 'absolute',
    backgroundColor: 'green',
    opacity: 0.5,
  }
});

const androidMinTrTintColor = '#26A69A';
const androidMaxTrTintColor = '#d3d3d3';
const androidThumbTintColor = '#009688';


const sliderStyles = (Platform.OS === 'ios') ? iosStyles : androidStyles;
const minimumTrackTintColor = (Platform.OS === 'ios') ? iosMinTrTintColor : androidMinTrTintColor;
const maximumTrackTintColor = (Platform.OS === 'ios') ? iosMaxTrTintColor : androidMaxTrTintColor;
const thumbTintColor = (Platform.OS === 'ios') ? iosThumbTintColor : androidThumbTintColor;
