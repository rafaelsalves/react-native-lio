# react-native-lio

[![Version](https://img.shields.io/npm/v/react-native-lio.svg)](https://www.npmjs.com/package/react-native-lio)
[![NPM](https://img.shields.io/npm/dm/react-native-lio.svg)](https://www.npmjs.com/package/react-native-lio)

`react-native-lio` provides the integration of payments, printing and NFC reading in Cielo LIO terminals for React Native, based on the implementation of the [official Cielo SDK](https://developercielo.github.io/manual/cielo-lio "SDK oficial da Cielo"). 

- [Features](#features)
- [Installation](#installation)
- [API](#api)
- [Troubleshooting](#troubleshooting)
- [Opening issues](#opening-issues)

## Features
1. Provides basic operations for integration, purchasing, NFC reading and printing using Cielo LIO.
2. Provides other auxiliary methods for capturing machine information and states.

## Installation

1. Install library

   from npm

   ```bash
   npm install react-native-lio
   ```

   from yarn

   ```bash
   yarn add react-native-lio
   ```

2. Add to the end of the file /android/build.gradle
```
allprojects {
	...
	repositories {
	...
		mavenLocal()
		maven {
			url("$rootDir/../node_modules/react-native-lio/android/cielo-sdk")
		}
	...
	}
	...
}
```

## Supported react-native versions

| react-native-lio | react-native |
| ---------------- | ------------ |
| <= 1.0.3            | <= 0.64.5    |
| >= 1.0.4            |  > 0.64.5    |

## API

#### - setup(clientID: string, accessToken: string, ec: string)

Load library with client ID, accessToken and ec.
* Client-Id Access identification. It's generation takes place at the time of creation by the developer panel. Its value can be viewed in the Client ID column, within the ‘Client ID Registered’ menu;
* Access-Token Access token identification, which stores the access rules allowed to the Client ID. Its generation takes place when the Client ID is created by the developer panel. It's value can be viewed by clicking on 'details' in the 'Access Tokens' column, within the 'Client ID Registered' menu;
* Ec is an client code;

Use `onChangeServiceState` to listener events, containing **stateService** `ACTIVE`, `ERROR` or `INACTIVE`.

##### - requestPaymentCrashCredit(amount, orderId)
Request payment with credit on sight. 
*amout, value to pay;
*orderId, order number to transaction;

#### requestPaymentCreditInstallment(amount, orderId, installments)
Request payment with credit in installments. 
*amout, value to pay;
*orderId, order number to transaction;
*installments, number of installments

#### requestPaymentDebit(amount, orderId)
Request payment with credit on sight. 
*amout, value to pay;
*orderId, order number to transaction;

#### getMachineInformation()
Gets the machine informations.

#### getOrderList()

Gets order list.

#### createDraftOrder()

Creats a draft order.

#### addItems()

Add items to order.

#### placeOrder()


#### checkoutOrder()


#### printText(text: string, style: object)
Print one line text using terminal printter. List of possbilities for style:

| Key                         | Description                                               |
|----------------------------|-----------------------------------------------------------|
| `KEY_ALIGN`                | Sets text alignment left(VAL_ALIGN_LEFT), center(VAL_ALIGN_CENTER), right(VAL_ALIGN_RIGHT)).                |
| `KEY_TEXT_SIZE`            | Sets the text font size.                                  |
| `KEY_TYPEFACE`             | Sets the font style (bold, italic, etc.).                 |
| `KEY_MARGIN_LEFT`          | Sets the left margin.                                     |
| `KEY_MARGIN_RIGHT`         | Sets the right margin.                                    |
| `KEY_MARGIN_TOP`           | Sets the top margin.                                      |
| `KEY_MARGIN_BOTTOM`        | Sets the bottom margin.                                   |
| `KEY_LINE_SPACE`           | Sets the line spacing.                                    |
| `KEY_WEIGHT`               | Sets the font weight (thickness).                         |


#### printImage(encodedImage: string, style = {})
Print an image using terminal printter.
* encodedImage: Image encoded with base64 to print;
* style: style of image;

#### activateNFC()
Activates the NFC reading module, waiting for NFC card reading. Whenever a card is read, an onReadNFC event will be sent, containing **status** and **cardId**.

#### deactivateNFC()
Disables the NFC reading module.

#### addListener(event, callback)
Available events: ```onReadNFC | onChangePrinterState | onChangeCancellationState | onChangePaymentState | onChangeServiceState```

## Troubleshooting

### Unexpected behavior

If you have unexpected behavior, please create a clean project with the latest versions of react-native and react-native-lio

```bash
react-native init CleanProject
cd CleanProject/
yarn add react-native-lio
```

Make a reproduction of the problem in `App.js`

```bash
react-native run-android
```

## Opening issues

Verify that it is still an issue with the latest version as specified in the previous step. If so, open a new issue, include the entire `App.js` file, specify what platforms you've tested, and the results of running this command:

```bash
react-native info
```