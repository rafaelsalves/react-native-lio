# react-native-lio

React Native library for Cielo LIO deeplink integration. Supports payments, reversals, printing, device information, and order management.

## Features

- ✅ **Device Information** - Get LIO terminal details (serial number, merchant code, battery level, etc.)
- ✅ **Payments** - Process debit and credit payments (cash and installments)
- ✅ **Reversals** - Cancel/reverse payments
- ✅ **Print** - Print receipts, images, and custom text with styling options
- ✅ **Orders** - List and filter orders with payment information and pagination
- ✅ **Promise-based API** - Clean async/await interface
- ✅ **TypeScript** - Full type definitions included
- ✅ **Environment Variables** - Automatic credential fallback with react-native-dotenv
- ✅ **Base64 Image Support** - Convert and save Base64 images for printing

## Installation

```bash
yarn add react-native-lio
# or
npm install react-native-lio
```

## Android Setup

### 1. settings.gradle

Add the module to `android/settings.gradle`:

```gradle
include ':react-native-lio'
project(':react-native-lio').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-lio/android')
```

### 2. app/build.gradle

Add the dependency in `android/app/build.gradle`:

```gradle
dependencies {
    implementation project(':react-native-lio')
    // ... other dependencies
}
```

**Important:** Set `targetSdkVersion` to 30 for LIO compatibility:

```gradle
android {
    defaultConfig {
        targetSdkVersion 30  // Required for LIO
    }
}
```

### 3. AndroidManifest.xml

Add queries and intent-filters in `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <queries>
        <!-- LIO Real Device -->
        <package android:name="com.ads.lio.uriappclient" />
        <!-- LIO Simulator (fallback) -->
        <package android:name="br.com.cielosmart.orderservice" />
    </queries>

    <application
        android:requestLegacyExternalStorage="true">
        <meta-data
            android:name="cs_integration_type"
            android:value="uri" />

        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask">

            <!-- Intent filters to receive LIO responses -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="lio" android:host="payment-response" />
                <data android:scheme="lio" android:host="reversal-response" />
                <data android:scheme="lio" android:host="print-response" />
                <data android:scheme="lio" android:host="terminalinfo-response" />
                <data android:scheme="lio" android:host="orders-response" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 4. MainActivity.kt

Configure deeplink handling in `android/app/src/main/java/com/[your-app]/MainActivity.kt`:

```kotlin
import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.reactnativelio.LioDeepLinkModule

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "YourAppName"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        handleDeepLink(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        intent?.data?.let { uri ->
            val lioModule = LioDeepLinkModule.getInstance()
            lioModule?.handleDeepLinkResponse(uri)
        }
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
```

### 5. MainApplication.kt

Register the package in `android/app/src/main/java/com/[your-app]/MainApplication.kt`:

```kotlin
import com.reactnativelio.LioDeepLinkPackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    add(LioDeepLinkPackage())
                }
        }
}
```

### 6. Environment Variables (Optional)

Create `.env` file in your project root:

```env
LIO_CLIENT_ID="your_client_id_here"
LIO_ACCESS_TOKEN="your_access_token_here"
```

Install `react-native-dotenv`:

```bash
yarn add react-native-dotenv
```

Configure `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }]
  ]
};
```

## Usage

### Import

```typescript
import Lio, { LioOrderStatus } from 'react-native-lio';
```

### 1. Get Device Information

```typescript
const deviceInfo = await Lio.getDeviceInfo({
    clientID: 'your_client_id',  // Optional if using .env
    accessToken: 'your_access_token',  // Optional if using .env
});

console.log(deviceInfo);
// {
//   serialNumber: "99999999-9",
//   logicNumber: "99999999-9",
//   merchantCode: "9999999999999999",
//   batteryLevel: 100
// }
```

### 2. Send Payment

```typescript
const payment = await Lio.sendPayment({
    value: 10000, // R$ 100.00 in cents
    installments: 0, // 0 for cash payments
    paymentCode: 'DEBITO_AVISTA',
    email: 'customer@email.com',
    items: [
        {
            sku: '123',
            name: 'Test Product',
            unit_price: 10000,
            quantity: 1,
            unitOfMeasure: 'EACH'
        }
    ]
});

console.log(payment);
// {
//   id: "payment-uuid",
//   authCode: "ABC123",
//   cieloCode: "XYZ789",
//   amount: 10000,
//   brand: "VISA",
//   installments: 1
// }
```

**Payment Codes:**
- `DEBITO_AVISTA` - Debit
- `CREDITO_AVISTA` - Credit (cash)
- `CREDITO_PARCELADO_LOJA` - Credit (installments)

**Example with Installments:**

```typescript
const payment = await Lio.sendPayment({
    value: 30000, // R$ 300.00
    installments: 3,
    paymentCode: 'CREDITO_PARCELADO_LOJA',
    items: [/* ... */]
});
```

### 3. Cancel Payment (Reversal)

```typescript
const reversal = await Lio.sendReversal({
    id: 'payment-uuid',  // Payment ID (NOT orderId)
    value: 10000,
    authCode: 'ABC123',
    cieloCode: 'XYZ789'
});
```

**Important:** Use `id` (payment ID), not `orderId`.

### 4. Print Text

```typescript
await Lio.sendPrint({
    operation: 'PRINT_TEXT',
    styles: [
        {
            key_attributes_align: 0, // 0=Center, 1=Left, 2=Right
            key_attributes_textsize: 30,
            key_attributes_typeface: 1,
            form_feed: 1
        }
    ],
    value: [
        'SALES RECEIPT\n',
        '====================\n',
        'Amount: R$ 100.00\n',
        '====================\n'
    ]
});
```

### 5. Print Image

```typescript
// First, save Base64 image to file
const imagePath = await Lio.saveBase64Image(
    'data:image/png;base64,iVBORw0KGgo...',
    'logo'
);

// Then print the image
await Lio.sendPrint({
    operation: 'PRINT_IMAGE',
    styles: [{
        key_attributes_align: 0,
        key_attributes_marginbottom: 30
    }],
    value: [imagePath]
});
```

### 6. Print Multi-Column Text

```typescript
await Lio.sendPrint({
    operation: 'PRINT_MULTI_COLUMN_TEXT',
    styles: [
        { key_attributes_align: 1, key_attributes_textsize: 20 },  // Left
        { key_attributes_align: 0, key_attributes_textsize: 20 },  // Center
        { key_attributes_align: 2, key_attributes_textsize: 20 }   // Right
    ],
    value: [
        'Left column\n',
        'Center column\n',
        'Right column\n'
    ]
});
```

**Print Style Attributes:**

| Attribute | Description | Values |
|----------|-----------|---------|
| `key_attributes_align` | Text alignment | 0 (Center), 1 (Left), 2 (Right) |
| `key_attributes_textsize` | Text size | Integer (e.g., 20, 30) |
| `key_attributes_typeface` | Font type | 0 to 8 |
| `key_attributes_marginleft` | Left margin | Integer |
| `key_attributes_marginright` | Right margin | Integer |
| `key_attributes_margintop` | Top margin | Integer |
| `key_attributes_marginbottom` | Bottom margin | Integer |
| `key_attributes_linespace` | Line spacing | Integer |
| `key_attributes_weight` | Column weight | Integer |
| `form_feed` | Spacing after print | 0 (none), 1 (with) |

### 7. List Orders with Pagination

```typescript
// Default: returns only PAID orders
const orders = await Lio.getOrders({
    page: 0,
    pageSize: 10
});

// Custom status filter
const orders = await Lio.getOrders({
    statusFilter: [LioOrderStatus.PAID, LioOrderStatus.CANCELED],
    page: 0,
    pageSize: 10
});

// All orders
const orders = await Lio.getOrders({
    statusFilter: 'ALL',
    page: 0,
    pageSize: 10
});

console.log(orders.results); // Array of orders
console.log(orders.totalItems); // Total count
```

**Order Status:**

```typescript
LioOrderStatus.PAID        // 'PAID'
LioOrderStatus.CANCELED    // 'CANCELED'
LioOrderStatus.ENTERED     // 'ENTERED'
LioOrderStatus.DRAFT       // 'DRAFT'
LioOrderStatus.CLOSED      // 'CLOSED'
LioOrderStatus.RE_ENTERED  // 'RE-ENTERED'
```

### 8. Save Base64 Image

```typescript
const imagePath = await Lio.saveBase64Image(
    base64String,  // With or without data:image prefix
    'filename'     // Without extension (will be saved as .jpg)
);

console.log(imagePath);
// /storage/emulated/0/Android/data/com.yourapp/files/images/filename.jpg
```

## API Reference

### TypeScript Types

```typescript
// Payment Parameters
interface LioPaymentParams {
    clientID?: string;  // Optional if using .env
    accessToken?: string;  // Optional if using .env
    value: number; // in cents
    items: LioPaymentItem[];
    installments?: number;
    orderId?: string;
    email?: string;
    paymentCode?: string;
}

// Payment Item
interface LioPaymentItem {
    id?: number;
    sku: string;
    name: string;
    unit_price: number; // in cents
    quantity: number;
    unitOfMeasure: string; // "EACH", "HOUR", "KILO", etc.
}

// Reversal Parameters
interface LioReversalParams {
    clientID?: string;
    accessToken?: string;
    id: string;  // Payment ID (not orderId)
    value: number;
    authCode?: string;
    cieloCode?: string;
}

// Print Parameters
interface LioPrintParams {
    clientID?: string;
    accessToken?: string;
    operation: 'PRINT_TEXT' | 'PRINT_IMAGE' | 'PRINT_MULTI_COLUMN_TEXT';
    styles?: LioPrintStyle[];
    value: string[]; // For TEXT: array of strings | For IMAGE: [file_path]
}

// Print Style
interface LioPrintStyle {
    key_attributes_align?: 0 | 1 | 2;
    key_attributes_textsize?: number;
    key_attributes_typeface?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    key_attributes_marginleft?: number;
    key_attributes_marginright?: number;
    key_attributes_margintop?: number;
    key_attributes_marginbottom?: number;
    key_attributes_linespace?: number;
    key_attributes_weight?: number;
    form_feed?: 0 | 1;
}

// Device Info Parameters
interface LioDeviceInfoParams {
    clientID?: string;
    accessToken?: string;
}

// Device Info Response
interface LioDeviceInfoResponse {
    serialNumber?: string;
    logicNumber?: string;
    imeiNumber?: string;
    deviceModel?: string;
    merchantCode?: string;
    responseCode?: number;
    batteryLevel?: number;
}

// Orders Parameters
interface LioOrdersParams {
    clientID?: string;
    accessToken?: string;
    statusFilter?: (LioOrderStatus | 'ALL')[] | 'ALL'; // Default: ['PAID']
    pageSize?: number;
    page?: number;
}

// Order
interface LioOrder {
    id: string;
    number: string;
    reference?: string;
    status: string;
    price: number;
    updatedAt: string;
    createdAt: string;
    type: string;
    pendingAmount: number;
    paidAmount: number;
    notes: string;
    payments?: LioPayment[];
    items?: LioOrderItem[];
}

// Payment (within Order)
interface LioPayment {
    id: string;
    terminal: string;
    authCode: string;
    cieloCode: string;
    brand: string;
    amount: number;
    installments: number;
    primaryCode: string;
    secondaryCode: string;
    requestDate: string;
    merchantCode: string;
    mask: string;
    externalId: string;
    applicationName: string;
    discountedAmount: number;
    description: string;
    accessKey: string;
    paymentFields: { [key: string]: any };
}

// Order Item
interface LioOrderItem {
    id: string;
    sku: string;
    name: string;
    unitPrice: number;
    quantity: number;
    unitOfMeasure: string;
    reference?: string;
    details?: string;
    description?: string;
}

// Order Status
enum LioOrderStatus {
    PAID = 'PAID',
    CANCELED = 'CANCELED',
    ENTERED = 'ENTERED',
    DRAFT = 'DRAFT',
    CLOSED = 'CLOSED',
    RE_ENTERED = 'RE-ENTERED'
}

// Orders Response
interface LioOrdersResponse {
    results?: LioOrder[];
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
}

// Generic Response
interface LioResponse {
    success?: boolean;
    error?: string;
    [key: string]: any;
}
```

### Methods

#### `getDeviceInfo(params?: LioDeviceInfoParams): Promise<LioDeviceInfoResponse>`
Get LIO terminal information including serial number, merchant code, and battery level.

#### `sendPayment(params: LioPaymentParams): Promise<LioResponse>`
Send payment request to LIO terminal. Returns payment result with transaction details.

#### `sendReversal(params: LioReversalParams): Promise<LioResponse>`
Cancel/reverse a previous payment transaction using payment ID.

#### `sendPrint(params: LioPrintParams): Promise<LioResponse>`
Print text, images, or multi-column text with optional styling.

#### `getOrders(params?: LioOrdersParams): Promise<LioOrdersResponse>`
List orders from LIO terminal with status filtering and pagination support.

#### `saveBase64Image(base64Image: string, fileName: string): Promise<string>`
Convert Base64 image to JPG file and return absolute file path for printing.

## Helper Functions

### Format LIO Date

```typescript
import { formatLioDate } from '@helpers/functions';

// Auto-detects format (ISO 8601 or "MMM DD, YYYY h:mm:ss A")
const formatted = formatLioDate(order.createdAt);
// "26/02/2026 - 17:26"

// Custom format
const custom = formatLioDate(order.createdAt, 'DD/MM/YYYY');
// "26/02/2026"
```

The `formatLioDate` function automatically detects:
- **ISO 8601** (real device): `2026-02-26T17:26:57.312Z`
- **Legacy format** (simulator): `Feb 26, 2026 9:50:55 AM`

## Troubleshooting

### Error: NO_HANDLER

This means the Cielo LIO app is not responding. Check:
1. Package names are correctly configured in AndroidManifest.xml `<queries>`
   - Real LIO: `com.ads.lio.uriappclient`
   - Simulator: `br.com.cielosmart.orderservice`
2. Credentials (`clientID` and `accessToken`) are correct
3. `targetSdkVersion` is set to 30

### Module not found

If you get "Module not found" error:

```bash
cd android && ./gradlew clean && cd ..
yarn android
```

### Deeplink not being received

Check if:
1. MainActivity `launchMode` is set to `singleTask`
2. Intent-filters are configured correctly
3. `handleDeepLink` is called in both `onCreate` and `onNewIntent`
4. `setIntent(intent)` is called in `onNewIntent`

### Images not printing

Ensure:
1. `android:requestLegacyExternalStorage="true"` is in AndroidManifest.xml
2. Base64 image is valid JPG/PNG format
3. Using `saveBase64Image()` before passing to print

### Reversal fails with "Invalid JSON"

Make sure you're using `id` (payment ID), not `orderId`:

```typescript
// ✅ Correct
await Lio.sendReversal({ id: payment.id, ... })

// ❌ Wrong
await Lio.sendReversal({ orderId: order.id, ... })
```

## Pagination Example

```typescript
const [paymentsList, setPaymentsList] = useState([]);
const [currentPage, setCurrentPage] = useState(0);
const [hasMore, setHasMore] = useState(true);
const PAGE_SIZE = 10;

const loadMore = async () => {
    if (!hasMore) return;

    const orders = await Lio.getOrders({
        statusFilter: [LioOrderStatus.PAID, LioOrderStatus.CANCELED],
        page: currentPage,
        pageSize: PAGE_SIZE
    });

    const newPayments = orders.results || [];
    setPaymentsList([...paymentsList, ...newPayments]);
    setCurrentPage(currentPage + 1);
    setHasMore(newPayments.length === PAGE_SIZE);
};

// In FlatList
<FlatList
    data={paymentsList}
    onEndReachedThreshold={0.5}
    onEndReached={({ distanceFromEnd }) => {
        if (distanceFromEnd > 0) loadMore();
    }}
/>
```

## Official Documentation

For more details about Cielo LIO deeplink integration:
- https://developercielo.github.io/manual/cielo-lio#integração-via-deep-link
- https://github.com/DeveloperCielo/LIO-SDK-Sample-Integracao-Local

## License

Unlicense
