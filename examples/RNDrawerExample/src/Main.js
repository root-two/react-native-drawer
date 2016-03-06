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
        <Text>MAIN</Text>
        <Text>MAIN1</Text>

        <Text>MAIN2</Text>
        <Text>MAIN3</Text>
        <Text>MAIN4</Text>
        <Text>MAIN5</Text>

      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7699dd',
    padding: 20,
    flex: 1,
  }
})
