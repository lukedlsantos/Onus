# Native Wearables Integration Strategy (Future Phase)

This document outlines the zero-cost architecture for bridging Apple Watch, Garmin, and Whoop using native mobile databases (Apple HealthKit & Google Fit/Health Connect) without paying aggregator subscriptions or direct API access fees.

---

## The Concept

Garmin, Whoop, and other wearables sync their sleep, HRV, resting heart rate, and training telemetry directly to the host phone's local health database for free. We can query these databases on-device using a hybrid mobile container and upload the compiled metrics directly to our Supabase database.

```
+------------+      +--------+      +-------------+
| Apple Watch|      | Garmin |      |    Whoop    |
+-----+------+      +---+----+      +------+------+
      |                 |                  |
      | (Native Sync)   | (Connect Sync)   | (Whoop Sync)
      v                 v                  v
+-------------------------------------------------+
|          Local Phone OS Health Database          |
|    - iOS: HealthKit                             |
|    - Android: Google Fit / Health Connect       |
+-----------------------+-------------------------+
                        |
                        | (Query via Capacitor Plugins)
                        v
+-------------------------------------------------+
|         CapacitorJS Mobile App Shell            |
|    - Wraps our PWA HTML/JS client               |
+-----------------------+-------------------------+
                        |
                        | (Secure Supabase Writes)
                        v
+-------------------------------------------------+
|                  Supabase DB                    |
|    - Stores recovery scores, sleep, and HRV     |
+-------------------------------------------------+
```

---

## Detailed Step-by-Step Implementation

### Step 1: Install CapacitorJS
Wrap our existing static web app inside a native app shell. Run the following inside the project root:
```bash
# Install Capacitor core and CLI
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor configuration
npx cap init "Onus Climbing Coach" "com.onus.coaching" --web-dir=.

# Add native platforms
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

### Step 2: Install Health Integration Plugins
Install community plugins designed to interface with the native health storage layers.
```bash
# Install iOS HealthKit wrapper
npm install @awesome-cordova-plugins/health-kit
npm install cordova-plugin-health

# Sync native project files
npx cap sync
```

### Step 3: Configure Native Permissions
You must describe why the app needs access to these health files in the native configuration files.

#### For iOS (`ios/App/App/Info.plist`):
Add the following permission strings inside the `<dict>` block:
```xml
<key>NSShareUsageDescription</key>
<string>We need write access to record workouts to your Apple Health files.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We need write access to upload climbing metrics to Apple Health.</string>
<key>NSHealthShareUsageDescription</key>
<string>We need read access to retrieve sleep, resting heart rate, and HRV data to calculate your recovery score.</string>
```

#### For Android (`android/app/src/main/AndroidManifest.xml`):
Add Google Fit permissions:
```xml
<uses-permission android:name="android.permission.activity_recognition" />
<uses-permission android:name="android.permission.custom.google.fit.read" />
```

### Step 4: Write the JavaScript Data Extraction Code
Create a service worker utility (e.g., `healthSync.js`) inside the app to trigger a data fetch when the athlete opens their dashboard:

```javascript
import { db } from './db.js';

async function syncNativeHealthData(athleteId) {
  // Verify if HealthKit is available on the device
  const isAvailable = await window.plugins.navigator.healthkit.available();
  if (!isAvailable) return;

  // Request permissions for specific parameters
  window.plugins.navigator.healthkit.requestAnonymisedReadPermission(
    {
      'readTypes': ['HKQuantityTypeIdentifierHeartRateVariabilitySDNN', 'HKCategoryTypeIdentifierSleepAnalysis', 'HKQuantityTypeIdentifierRestingHeartRate']
    },
    async (success) => {
      // Fetch Sleep Duration (past 24h)
      window.plugins.navigator.healthkit.querySampleType(
        {
          'startDate': new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          'endDate': new Date(),
          'sampleType': 'HKCategoryTypeIdentifierSleepAnalysis'
        },
        async (sleepSamples) => {
          const totalSleepSeconds = sleepSamples.reduce((acc, sample) => acc + (new Date(sample.endDate) - new Date(sample.startDate)) / 1000, 0);
          const hours = totalSleepSeconds / 3600;

          // Fetch HRV (Heart Rate Variability)
          window.plugins.navigator.healthkit.querySampleType(
            {
              'startDate': new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
              'endDate': new Date(),
              'sampleType': 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN'
            },
            async (hrvSamples) => {
              const latestHRV = hrvSamples.length > 0 ? hrvSamples[0].value : null;

              // Upload gathered metrics to Supabase
              await db.uploadTelemetry(athleteId, {
                date: new Date().toISOString().split('T')[0],
                sleep_hours: hours,
                hrv: latestHRV
              });
            }
          );
        }
      );
    },
    (error) => console.error("Permission denied", error)
  );
}
```

---

## Pros & Cons (Reference)
* **Pros**: 100% Free daily syncing of high-fidelity biometric data (Sleep, HRV, Heart Rate).
* **Cons**: Build complexity (Xcode signing required, native code wrappers to maintain, manual sideloading or App Store reviews required to deploy changes to students).
