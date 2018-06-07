#!/bin/sh
meteor remove-platform ios
meteor add-platform ios
cd .meteor/local/cordova-build
cordova plugin add cordova-plugin-fcm --save
cd ../../..
#meteor add cordova:cordova-plugin-fcm@2.1.2
meteor run ios-device
