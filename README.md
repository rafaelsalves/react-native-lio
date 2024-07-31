# React Native Lio Integration

[![Version](https://img.shields.io/npm/v/react-native-lio.svg)](https://www.npmjs.com/package/react-native-lio)

[![NPM Downloads](https://img.shields.io/npm/dm/react-native-lio.svg)](https://www.npmjs.com/package/react-native-lio)

The `react-native-lio` library enables integration of React Native applications with the CIELO Lio device, incorporating key methods based on the [official CIELO Lio documentation](https://developercielo.github.io/manual/cielo-lio).

## Supported react-native versions

| react-native-lio | react-native |
| ---------------- | ------------ |
| 1.0.0            | <= 0.64.5    |
| 1.0.1            | <= 0.64.5    |
| 1.0.2+            |  > 0.64.5    |

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [API](#api)
- [Troubleshooting](#troubleshooting)
- [Opening Issues](#opening-issues)

## Features

1. Supports basic operations such as integration, purchase, and printing using Cielo LIO.
2. Provides additional helper methods for capturing information and states from the device.

## Installation

Note: This package is only supported on Android, as it is the operating system used by LIO.

1. **Install the package**

   ```bash
   npm install react-native-lio
    ```
    or

   ```bash
   yarn add react-native-lio
   ```

2. Add on end of file: **/android/build.gradle**
```
allprojects {
   ...
   repositories {
      maven {
        ...
        jcenter()
        maven {
            url("$rootDir/../node_modules/react-native-lio/android/cielo-sdk")
        }
    }
}
``````

3. Add or update the **allowBackup** on file: **android/app/src/main/AndroidManifest.xml**

```
android:allowBackup="true"
```

## API

### - setup(clientID: string, accessToken: string, EC: string)

**Description**: Load library with client ID, accessToken and EC.

**Params**:
* Client-Id Access identification. It's generation takes place at the time of creation by the developer panel. Its value can be viewed in the Client ID column, within the ‘Client ID Registered’ menu;
* Access-Token Access token identification, which stores the access rules allowed to the Client ID. Its generation takes place when the Client ID is created by the developer panel. It's value can be viewed by clicking on 'details' in the 'Access Tokens' column, within the 'Client ID Registered' menu;
* Ec is an client code;

### - requestPaymentCrashCredit(amount: number, orderId: string)
**Description**: Request payment with credit on sight.

**Params**:
* amount: value to pay;
* orderId: order number to transaction;

### - requestPaymentCreditInstallment(amount: number, orderId: string, installments: number)
**Description**: Request payment with credit in installments. 

**Params**:
* amount: value to pay;
* orderId: order number to transaction;
* installments: number of installments

### - requestPaymentDebit(amount: number, orderId: string)
**Description**:  Request payment with credit on sight. 

**Params**:
* amout: value to pay;
* orderId: order number to transaction;

### - getMachineInformation()
**Description**: Gets the machine informations.

### - getOrderList()

**Description**: Gets order list.

### - createDraftOrder()

**Description**: Creats a draft order.

### - addItems()

**Description**: Add items to order.

### - placeOrder()


### - checkoutOrder()

### - printText(text: string, style: Record< string, number >)
**Description**: Print one line text using machine printter.

**Params**:
* text: texto to print;
* style: style of text;

**Sample**:
```javascript
 {
 'key_attributes_align': Lio.PrintStyles.VAL_ALIGN_LEFT,
 'key_attributes_textsize': 22,
 'key_attributes_marginleft': 22,
 }
```

**Style Options**:

| Key  | Possible Values  |
| ------------ | ------------ |
| "key_attributes_align"  |  0 => Center, 1 => Left, 2 => Right |
|  "key_attributes_textsize" | number in pixel starting from 0  |
|  "key_attributes_typeface" | number in pixel starting from 0  |
|  "key_attributes_marginleft" | number in pixel starting from 0  |
|  "key_attributes_marginright" | number in pixel starting from 0  |
|  "key_attributes_margintop" | number in pixel starting from 0  |
|  "key_attributes_marginbottom" |  number in pixel starting from 0 |
|  "key_attributes_linespace" |  number in pixel starting from 0 |
|  "key_attributes_weight" | 0 or 1  |



### - printImage(encodedImage: string, style = {})
**Description**: Print an image using machine printter.

**Params**:
* encodedImage: Image encoded with base64 to print;
* style: style of image;

### - addListener()


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