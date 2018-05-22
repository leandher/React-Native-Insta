import { Navigation } from 'react-native-navigation';
import Feed from './src/components/Feed';
import Login from './src/screens/Login';
import { AsyncStorage } from 'react-native';

Navigation.registerComponent('Login', () => Login);
Navigation.registerComponent('Feed', () => Feed);

AsyncStorage.getItem('token')
  .then(token => {
    console.warn(token)
    if(token) {
      return {
        screen: 'Feed',
        title: 'Instalura'
    };
  }

  return {
    screen: 'Login',
    title: 'Login',
    navigatorStyle: {
      navBarHidden: true
    }
  }; 
 })
 .then(screen => Navigation.startSingleScreenApp({screen}));