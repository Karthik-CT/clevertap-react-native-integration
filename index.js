/**
 * CleverTap POC - React Native App Entry Point
 *
 * This is the entry point for the app.
 * CleverTap is initialized here at the native level via AndroidManifest.xml.
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
