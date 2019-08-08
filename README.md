# Booking

Ionic/Angular application for demonstration purposes only. It uses Ionic/Angular as a front end technology and Spring Boot as a backend RESTful API.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Make sure the latest version of Node.js and npm are installed. After that you should install Angular and Ionic CLI using npm install directive.
For development I was using Visual Studio Code, but you can use IDE which suits you most. 

### Installing

After installing all necessary elements you can clone this repository and open application in your IDE. Now you should download all Node Modules required by for this project to work. In your terminal execute next line of code: 


```
npm install
```

In a folder environment you will find two files containing properties for connecting to the host where Spring Boot is running on embedded Apache Tomcat server and your Google Map Api Key. 

```
export const environment = {
  production: false,
  googleMapApiKey: 'enter your google-api key',
  apacheLocation: 'enter your spring boot host address'
};
```

This one is for development purpose and the other one is for production.

Also, you should clone backend part of the application from [booking-spring](https://github.com/Smorior/booking-spring-boot) repository. 
There, you can find details about running Spring Boot Application and adding database to MySQL used by this application.

After successfully finishing all previous steps you should be able to run your Ionic application by simply executing next directive using Ionic CLI:

```
ionic serve
```

Few seconds later your browser will automatically open pointing to localhost at port 8100.

## Deployment

As I have used Ionic Capacitor for creating native Android and iOS application you have to install Android Studio on your machine for creating native app for Android. For iOS you must own a Mac and have developer account. 

Using Angular CLI, running the next line of code, you can build app as you were planing to deploy it as a regular WebApp. 

```
ng build --prod
```

Now your web app is build using production settings.

After your app is build you can run next commands for creating Android and iOS app. 
It will create folders with platform name and place all files needed for building native apps.

```
ionic capacitor sync android
ionic capacitor sync ios
```

Now, running next command your app will be opened in android studio from where you can export apk, native Android application.

```
ionic capacitor open android
```

Same works for iOS.

```
ionic capacitor open iOS
```


## Built With

* [Angular](https://angular.io/docs)
* [Ionic](https://ionicframework.com/docs)
* [Android Studio](https://developer.android.com/studio)


## Author

* **Željko Jeličić** 
