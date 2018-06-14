'use strict'

import React, { Component } from 'react';
import { NativeModules } from 'react-native'
// name as defined via ReactContextBaseJavaModule's getName

export default class ComunicationApps extends Component{

	static getProgress(){
        NativeModules.ComunicationApps.getProgress();
	}

	static setProgress(progress){
		NativeModules.ComunicationApps.setProgress(progress);
	}

	render(){
		return null;
	}
}

