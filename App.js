import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import axios from 'axios';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Button, ThemeProvider, Input, Text} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';

const useStore = create(() => ({isLogin: false, nameUserLogin: ''}));

function LoginScreen({navigation}) {
  const [name, onChangeName] = React.useState('');
  const [isnameEmpty, changeNameEmpty] = React.useState(false);
  const loginHandler = () => {
    if (name === '') {
      changeNameEmpty(!isnameEmpty);
    } else {
      const newUser = [['name', `${name}`]];
      AsyncStorage.multiSet(newUser, err => {
        if (err) {
        } else {
          useStore.setState({
            isLogin: true,
            nameUserLogin: name,
          });
          navigation.navigate('Home');
        }
      });
    }
  };
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text h2 style={{marginVertical: 10}}>
        Login
      </Text>
      <Input
        onChangeText={onChangeName}
        value={name}
        placeholder="Name"
        errorStyle={{color: 'red'}}
        errorMessage={isnameEmpty ? 'Please Input Your Username' : null}
      />
      <Button title="Login" onPress={loginHandler} />
    </View>
  );
}

class QRCODECustom extends React.Component {
  render() {
    const onSuccess = e => {
      const data = {qr: e.data, name: this.props.nameUser};
      axios
        .post('https://vale.bismut.id/api/scanqrcode', data)
        .then(response => {
          if (response.data.success) {
            showMessage({
              message: 'Success',
              type: 'success',
            });
            setTimeout(() => {
              this.scanner.reactivate();
            }, 5000);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    return (
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
        topContent={
          <Text style={styles.centerText}>
            <Text style={styles.textBold}>SCAN QR</Text>
          </Text>
        }
        ref={node => {
          this.scanner = node;
        }}
      />
    );
  }
}

function HomeScreen({navigation}) {
  const nameUser = useStore(state => state.nameUserLogin);

  return (
    <>
      <QRCODECustom nameUser={nameUser} />
      <FlashMessage position="top" />
    </>
  );
}

const Stack = createNativeStackNavigator();

const theme = {
  Button: {
    raised: false,
  },
};

function App() {
  const isSignedIn = useStore(state => state.isLogin);
  const nameUserLogin = useStore(state => state.nameUserLogin);
  const user = ['name'];
  AsyncStorage.multiGet(user, (err, result) => {
    if (err) {
    } else {
      const name = result[0][1];
      if (name) {
        useStore.setState({isLogin: true, nameUserLogin: name});
      }
    }
  });
  const logoutHandler = navigation => {
    AsyncStorage.multiRemove(user, err => {
      if (err) {
        console.log(err);
      } else {
        useStore.setState({isLogin: false, nameUserLogin: ''});
        navigation.navigate('Login');
      }
    });
  };
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#f4511e" />
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator>
            {isSignedIn ? (
              <Stack.Group>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={({navigation, route}) => ({
                    title: nameUserLogin,
                    headerStyle: {
                      backgroundColor: '#f4511e',
                    },
                    headerTintColor: '#fff',
                    headerRight: () => (
                      <Button
                        onPress={() => logoutHandler(navigation)}
                        title="Logout"
                        color="#000"
                      />
                    ),
                  })}
                />
              </Stack.Group>
            ) : (
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  title: 'QR CODE',
                  headerStyle: {
                    backgroundColor: '#f4511e',
                  },
                  headerTintColor: '#fff',
                }}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default App;
