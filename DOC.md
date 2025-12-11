### Build android for locally

```bash
emulator -list-avds # Pixel_8_Pro
emulator -avd Pixel_8_Pro
npm start

npx expo prebuild --platform android
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

npx expo-doctor

# Step 1. Choose bankcodes
# Step 2. Choose environment
# Step 3. local build
eas build --local -p android --profile preview
```

we need to handle this error properly: ERROR ❌ API ERROR:

 <html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx</center>
</body>
</html>
