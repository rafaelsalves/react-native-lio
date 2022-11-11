[![Version](https://img.shields.io/npm/v/react-native-lio.svg)](https://www.npmjs.com/package/react-native-lio)
[![NPM](https://img.shields.io/npm/dm/react-native-lio.svg)](https://www.npmjs.com/package/react-native-lio)

`react-native-lio` provides support to Cielo LIO machine, using the methods more used, based https://developercielo.github.io/manual/cielo-lio

- [Features](#features)
- [Installation](#installation)
- [API](#api)
- [Troubleshooting](#troubleshooting)
- [Opening issues](#opening-issues)

## Features
1. Supports basic operations of purchase using Cielo LIO. 
2. Provides another auxiliar methods to get information about machine.

## Installation
This package works Android only.
1. Install library 

   from npm

   ```bash
   npm install react-native-lio
   ```

   from yarn

   ```bash
   yarn add react-native-lio
   ```

## Supported react-native versions

| react-native-lio | react-native |
| ---------------- | ------------ |
| 1.0.0            | >=0.64.5     |

## API

### - setup(clientID, accessToken, ec)

Load library with client ID, accessToken and ec.
* Client-Id Access identification. It's generation takes place at the time of creation by the developer panel. Its value can be viewed in the Client ID column, within the ‘Client ID Registered’ menu;
* Access-Token Access token identification, which stores the access rules allowed to the Client ID. Its generation takes place when the Client ID is created by the developer panel. It's value can be viewed by clicking on 'details' in the 'Access Tokens' column, within the 'Client ID Registered' menu;
* Ec is an client code;

### - requestPaymentCrashCredit(amount, orderId)
Request payment with credit on sight. 
*amout, value to pay;
*orderId, order number to transaction;

### requestPaymentCreditInstallment(amount, orderId, installments)
Request payment with credit in installments. 
*amout, value to pay;
*orderId, order number to transaction;
*installments, number of installments

### requestPaymentDebit(amount, orderId)
Request payment with credit on sight. 
*amout, value to pay;
*orderId, order number to transaction;

### getMachineInformation()
Gets the machine informations.

### getOrderList()

Gets order list.

### createDraftOrder()

Creats a draft order.

### addItems()

Add items to order.

### placeOrder()


### checkoutOrder()


### addListener()


## Troubleshooting

### Unexpected behavior

If you have unexpected behavior, please create a clean project with the latest versions of react-native and react-native-lio

```bash
react-native init CleanProject
cd CleanProject/
yarn add react-native-lio
cd ios && pod install && cd ..
```

Make a reproduction of the problem in `App.js`

```bash
react-native run-ios
react-native run-android
```

## Opening issues

Verify that it is still an issue with the latest version as specified in the previous step. If so, open a new issue, include the entire `App.js` file, specify what platforms you've tested, and the results of running this command:

```bash
react-native info
```