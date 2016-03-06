import React, {
  Component,
  PropTypes,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

export default class ControlPanel extends Component {
  render() {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.controlText}>Control Panel</Text>
        <Text style={styles.controlText}>Control Panel</Text>

        <Text style={styles.controlText}>Control Panel12312</Text>

        <Text style={styles.controlText}>Control Panel142</Text>
        <Text style={styles.controlText}>Control Panel122</Text>
        <Text style={styles.controlText}>Control Panel</Text>
        <Text style={styles.controlText}>Control Panel</Text>
        <Text style={styles.controlText}>Control Panel</Text>
        <Text style={styles.controlText}>Control Panes3l</Text>
        <Text style={styles.controlText}>Control Pane333l</Text>
        <Text style={styles.controlText}>Control Panel</Text>

      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  controlText: {
    color: 'white',
  },
})
