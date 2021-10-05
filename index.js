import { NativeModules, NativeEventEmitter } from 'react-native'
const EventEmitter = new NativeEventEmitter(NativeModules.Lio || {});

const LioEvents = {
    onChangeServiceState: 'onChangeServiceState',
    LioServiceErrorReceived: 'LioServiceErrorReceived',
    LioOnPayment: 'LioOnPayment'
};

const ServiceState = {
    ACTIVE: 0,
    ERROR: 1,
    INACTIVE: 2,
}

let Lio = {};

const setup = (clientID, accessToken) => {
    return NativeModules.Lio.setup(clientID, accessToken);
}

Lio.createDraftOrder = (orderId) => {
    return NativeModules.Lio.createDraftOrder(orderId);
}

Lio.addItems = (items) => {
    return NativeModules.Lio.addItems(items);
}

Lio.placeOrder = () => {
    return NativeModules.Lio.placeOrder();
}

Lio.checkoutOrder = (value, paymentCode) => {
    return NativeModules.Lio.checkoutOrder(value, paymentCode);
}

const addListener = (event, callback) => {
    return EventEmitter.addListener(event, callback);
}

export default { 
    Lio, setup,
    addListener, LioEvents, ServiceState
}

