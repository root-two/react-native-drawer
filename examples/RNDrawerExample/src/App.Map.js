/*eslint-disable */
import React, {View, Text, TouchableOpacity, MapView} from 'react-native';

const Drawer = require('react-native-drawer');

var SideDrawerContent = React.createClass({
    render() {
        return (
            <View
                style={{flex:1, flexDirection: 'column', justifyContent: 'center',alignItems: 'center', backgroundColor: '#EEE'}}>
                <Text>OrderList</Text>
                <Text>Notify</Text>
            </View>
        );
    }
});

var Test = React.createClass({
    render () {
        return (
            <Drawer
                type="overlay"
                content={<SideDrawerContent />}
                captureGestures={true}
                openDrawerOffset={0.2}
                panOpenMask={20}
                negotiatePan={false}
                panCloseMask={0.2}
                closedDrawerOffset={-3}
                tweenHandler={(ratio) => ({ main: { opacity: (2 - ratio) / 2 } })}
                >
                <View style={{flex:1, flexDirection: 'column'}}>
                    <MapView style={{flex:1}}/>
                    <View style={{position: 'absolute', left: 0, top:0, bottom: 0, width: 20}} />
                    <TouchableOpacity onPress={()=>console.log("button touched")} style={{height:30, backgroundColor:'#08c'}}>
                        <Text>Button</Text>
                    </TouchableOpacity>
                </View>
            </Drawer>
        )
    }
});
module.exports = Test;
