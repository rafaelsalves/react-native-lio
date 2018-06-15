'use strict'

import { NativeModules, NativeEventEmitter } from 'react-native'
const EventEmitter = new NativeEventEmitter(NativeModules.Lio || {});

export const LioEvent = {
    LioServiceErrorReceived: 'LioServiceErrorReceived'
};

const Lio = {};

Lio.initializeLio = (clientID, accessToken) => {
    return NativeModules.Lio.initializeLio(clientID, accessToken);
}

Lio.createDraftOrder = (orderId) => {
    return NativeModules.Lio.createDraftOrder(orderId);
}

Lio.on = (event, callback) => {
    return EventEmitter.addListener(event, callback);
}

export default Lio;
export {};

