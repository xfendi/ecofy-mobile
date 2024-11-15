# Ecofy Mobile App

**Ecofy** is a mobile application designed to help users discover and create local eco-initiatives. From park cleanups and tree planting to educational workshops, Ecofy enables everyone to join in and contribute to sustainable community building.

## Features

- **Eco Initiative Map**: Discover local eco-events like park cleanups, tree planting, workshops, and more.
- **Create Initiatives**: Users can organize their own events to promote eco-action in their communities.
- **Notifications**: Stay updated on new initiatives with real-time notifications.
- **User Profile**: Customize your profile and track your eco-contributions.
- **Eco Community**: Engage with like-minded individuals through posts and discussions in the community section.

## App Structure

- `app/` - Main app screens and layouts:
  - `(auth)` - Screens for user login and registration
  - `(tabs)` - Main app screens (Map, Profile) visible after login
- `components/` - Reusable UI components
- `assets/` - Media and graphics files

## Technologies Used

- **React Native** + **Expo**: The main framework for mobile development
- **Firebase**: Backend for data storage, notifications, authentication, and community posts
- **React Navigation**: For navigating between screens
- **Styled Components**: Used for styling the app
- **Map API**: For displaying eco-initiatives on a map

Sure, here's the **Installation** section in English:

## Installation

To install and run the Ecofy app locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/xfendi/ecofy-mobile.git
   ```

2. Navigate into the project folder:
   ```bash
   cd ecofy-mobile
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root of the project and add the following environment variables. 

   You can find them in the respective services:

   - **Firebase API Key**: In Firebase Console under "Project Settings" -> "General" -> "Your apps".
   - **Geoapify API Key**: On the [Geoapify website](https://www.geoapify.com/) after registering and creating a project.
   - **Google Cloud Platform (GCP) API Key**: In the Google Cloud Platform Console (GCP) after creating a project and enabling the required APIs.

   Add the following to your `.env` file:

   ```
   EXPO_PUBLIC_FIREBASE_APIKEY
   EXPO_PUBLIC_FIREBASE_APPID
   EXPO_PUBLIC_GEOAPIFY_API_KEY
   EXPO_PUBLIC_GCP_API_KEY
   ```

5. Start the app:
   ```bash
   npm start
   ```

6. Scan the QR code using the Expo Go app to open the app on your device.

## Download

You can download the app directly from the **Google Play Store**: [Download Ecofy on Google Play]()

## Website

Check out the official website for more information and updates: [Ecofy Website]()

## License

Ecofy is **open-source** software licensed under the **GNU General Public License v3.0 (GPL-3.0)**. This means you are free to use, modify, and distribute the app, as long as any modifications or derivative works are also licensed under the same **GPL-3.0** license.

For more details, you can view the full license text in the [LICENSE](LICENSE)
