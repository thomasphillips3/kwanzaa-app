# App Store Submission Guide

This document outlines the requirements and steps for submitting the Kwanzaa Pocket Guide to the Apple App Store and Google Play Store.

## User-Generated Content (UGC) Compliance

Since the app includes a Community Board with user-generated content, both stores require specific disclosures and moderation features.

### Required Features (Implemented)

- [x] **Content Reporting**: Users can report posts for spam, harassment, inappropriate content, misinformation, or other reasons
- [x] **User Blocking**: Users can block other users to hide their content
- [x] **Post Hiding**: Users can hide individual posts
- [x] **Signature Verification**: Posts are cryptographically signed to prevent impersonation
- [x] **Pseudonymous Identity**: Users have device-generated signing keys with customizable display names

### Required Legal Pages

**DEPLOYED URLs:**
- Privacy Policy: http://kwanzaa-pocket-guide-legal.s3-website-us-east-1.amazonaws.com/privacy.html
- Terms of Service: http://kwanzaa-pocket-guide-legal.s3-website-us-east-1.amazonaws.com/terms.html

1. **Privacy Policy** - Must disclose:
   - What data is collected (device-generated keypair, display name, posts)
   - How data syncs via Gun.js peer-to-peer network
   - That user posts are public and visible to all users
   - How users can delete their data (clear app data)

2. **Terms of Service / Community Guidelines** - Must include:
   - Prohibited content (hate speech, harassment, spam, illegal content)
   - User responsibilities
   - Moderation practices
   - Right to remove content and ban users

3. **EULA (End User License Agreement)** - For Apple

---

## Apple App Store Submission

### App Store Connect Setup

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with bundle ID: `com.yourcompany.kwanzaa`
3. Fill in app information:
   - App Name: "Kwanzaa Pocket Guide"
   - Subtitle: "Celebrate the Seven Principles"
   - Primary Category: Education or Lifestyle
   - Secondary Category: Reference

### Required Assets

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| App Icon | 1024x1024 | PNG | No transparency, no rounded corners |
| iPhone Screenshots | 1290x2796 (6.7"), 1179x2556 (6.1") | PNG/JPEG | 2-10 screenshots |
| iPad Screenshots | 2048x2732 | PNG/JPEG | If supporting iPad |
| App Preview Video | 1920x1080 | MP4 | Optional, 15-30 seconds |

### App Store Description

```
Kwanzaa Pocket Guide helps you celebrate the seven principles of Kwanzaa (Nguzo Saba) with your family.

FEATURES:
• View the current Kwanzaa day and principle
• Beautiful kinara display showing lit candles
• Learn about each of the seven principles
• Journal your daily reflections
• Connect with the community through the Community Board
• Works offline - no internet required for core features

PRINCIPLES:
1. Umoja (Unity)
2. Kujichagulia (Self-Determination)
3. Ujima (Collective Work and Responsibility)
4. Ujamaa (Cooperative Economics)
5. Nia (Purpose)
6. Kuumba (Creativity)
7. Imani (Faith)

Download now and make your Kwanzaa celebration more meaningful!
```

### Keywords
`kwanzaa, nguzo saba, african american, holiday, principles, kinara, candles, unity, celebration, culture`

### Age Rating
- Select "Made for Kids" = NO (due to UGC)
- Age Rating: 12+ (due to user-generated content)

### Privacy Declarations
- User Content: Yes (Community Board posts)
- Identifiers: Yes (device-generated keypair)
- Usage Data: No

### App Review Notes
```
This app allows users to post messages to a Community Board. We have implemented:
- Content reporting (spam, harassment, inappropriate, misinformation)
- User blocking functionality
- Post hiding functionality
- Cryptographic signature verification

Test account not required - users generate anonymous identities on device.
```

### TestFlight Build

1. Build the iOS app:
   ```bash
   cd ~/workspace/Valdi
   bazel build //apps/kwanzaa:kwanzaa_ios --platforms=@snap_platforms//os:ios_device_arm64
   ```

2. Open Xcode and archive the app
3. Upload to App Store Connect via Xcode or Transporter
4. Add internal testers in TestFlight

---

## Google Play Store Submission

### Play Console Setup

1. Log in to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Set up store listing

### Required Assets

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| App Icon | 512x512 | PNG | 32-bit with transparency |
| Feature Graphic | 1024x500 | PNG/JPEG | Promotional banner |
| Phone Screenshots | 16:9 or 9:16 | PNG/JPEG | 2-8 screenshots |
| Tablet Screenshots | 16:9 | PNG/JPEG | If supporting tablets |
| Promo Video | YouTube URL | - | Optional |

### Content Rating

Complete the IARC questionnaire:
- Violence: None
- Sexuality: None
- Language: None
- Controlled Substances: None
- User-generated content: **YES**
- Users can interact: **YES**
- Data sharing: **YES** (P2P sync)

This will likely result in a **Teen (13+)** or **Everyone 10+** rating.

### Data Safety Form

- Data collected:
  - Personal info: Display name (optional)
  - Device identifiers: Cryptographic keypair
  - User content: Community posts
  
- Data shared:
  - User content is shared publicly via P2P network

- Data handling:
  - Data is not encrypted in transit (Gun.js P2P)
  - Users cannot request data deletion (P2P nature)
  - Data is stored locally on device

### Play Store Description
(Same as App Store description above)

### Internal Testing Track Build

1. Build the Android app:
   ```bash
   cd ~/workspace/Valdi
   bazel build //apps/kwanzaa:kwanzaa_android.apk \
     --platforms=@snap_platforms//os:android_arm64 \
     --cpu=arm64-v8a --android_cpu=arm64-v8a --fat_apk_cpu=arm64-v8a
   ```

2. Sign the APK with your upload key
3. Upload to Internal testing track in Play Console
4. Add testers via email list

---

## Pre-Submission Checklist

### Legal & Compliance
- [ ] Privacy Policy hosted and accessible
- [ ] Terms of Service / Community Guidelines hosted and accessible
- [ ] Age rating appropriate for UGC (12+/Teen)
- [ ] COPPA compliance (if targeting children - not recommended with UGC)

### App Quality
- [ ] App tested on multiple device sizes
- [ ] Dark mode supported (if applicable)
- [ ] Accessibility features (VoiceOver/TalkBack tested)
- [ ] Offline functionality works
- [ ] Gun.js sync working with fallback peers

### Store Assets
- [ ] App icon meets requirements
- [ ] Screenshots show key features
- [ ] App description is clear and accurate
- [ ] Keywords optimized for discoverability

### Technical
- [ ] Release build signed with production keys
- [ ] ProGuard/R8 enabled for Android
- [ ] Bitcode enabled for iOS (if required)
- [ ] Crashlytics or similar crash reporting (optional)

---

## Post-Launch Monitoring

1. Monitor crash reports daily for first week
2. Respond to user reviews within 24 hours
3. Monitor Community Board for policy violations
4. Consider implementing server-side moderation for scale

## Support Contact

For store submission questions or issues, refer to:
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
