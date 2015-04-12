var deviceScreen = require('Dimensions').get('window');

module.exports = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    height: deviceScreen.height,
  },
  main: {
    flex: 1,
    position: 'absolute',
    top: 0,
    height: deviceScreen.height,
  }
}
