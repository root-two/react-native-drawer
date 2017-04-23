import React, {
  Component,
  PropTypes,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default class ControlPanel extends Component {
  static PropTypes = {
    openDrawer: PropTypes.func.isRequired,
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <Text>MAIN</Text>
        <TouchableOpacity style={styles.button} onPress={ this.props.openDrawer }>
          <Text>Open Drawer</Text>
        </TouchableOpacity>

      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7699dd',
    padding: 20,
    flex: 1,
  },
  button: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
  }
})
