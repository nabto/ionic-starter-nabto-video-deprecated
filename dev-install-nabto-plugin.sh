#!/bin/bash

cordova plugin remove cordova-plugin-nabto
cordova plugin add cordova-plugin-nabto@2.0.0-beta5 --searchpath ~/git/cordova-plugin-nabto
ionic build