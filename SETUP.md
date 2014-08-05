![Facing Logo](https://raw.githubusercontent.com/manifestinteractive/facing/master/assets/logo/exports/main/rectangle/logo_rectangle_github.png)



Developer Documentation
===

This documentation is for OSX developers as currently everyone on the team is using a Mac.  I have provided links to the main resources where you can find the Windows install instructions, where needed.

\#1. Check Java
---

Before you can install Android Studio, you will need to make sure your Java Compiler is recent enough to work. Run the following command in terminal:

```bash
$ javac -version
```

If you do not get a response, or you get a version lower than 1.6 ( Java calls this version 6 ), e.g. `javac 1.5.X_XX`, you will need to [download the latest](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).

**[>> Direct link to Mac OS X x64](http://download.oracle.com/otn-pub/java/jdk/8u11-b12/jdk-8u11-macosx-x64.dmg)**


\#2. Installing Android Studio
---

Download and Install [Android Studio](http://developer.android.com/sdk/installing/studio.html).

In order to use the SDK contained in the Android Studio you will need to add it to your PATH.

```bash
$ nano ~/.bash_profile
```

Then add the following at the bottom of the file:

```bash
export ANDROID_SDK="/Applications/Android Studio.app/sdk/tools/"
export ANDROID_SDK_PLATFORM="/Applications/Android Studio.app/sdk/platform-tools/"
export PATH=$ANDROID_SDK:$ANDROID_SDK_PLATFORM:$PATH
```

Now you will need to update your terminal with the new PATH info:

```bash
$ source ~/.bash_profile
```

You will also need to have Ant installed, which you might not have.  Here is an easy way to install it using brew:

```bash
$ brew install ant
```

Finally, before you can use the Android Studio, you will need to update the SDK and install some tools / libraries:

1. Open Android Studio App
2. From the Quick Start menu, choose Configure
3. From the Configure menu, select SDK Manager to launch it

Once you have the SDK Manager installed, make sure you have the following installed:

* Tools > Android SDK Build-tools 19+
* Android 4.0+ (API 14+)

\#3. Installing PhoneGap
---

To install PhoneGap, [follow these instructions](http://phonegap.com/install/), here is a one line install command if you're in a hurry:

```bash
$ sudo npm install -g phonegap cordova
```

You will also want to install the native [PhoneGap Developer App](http://app.phonegap.com/) on any device you want to test on.

\#4. Putting it all together
---

### Using Android Studio

Open the Android Studio App and choose "Open Project" from the "Quick Start" Menu.  Then locate and open the ``./app/facing` folder.

### Using PhoneGap Developer App

In order to run the PhoneGap App on your physical device, you will need to run the following command in terminal:

```bash
$ cd ./app/facing
$ phonegap serve
```

Now you can grap your physical device and launch the PhoneGap app. When you ran the command above, it should have spit out some output like:

```bash
listening on 10.0.1.100:3000
```

When you launch the PhoneGap App on your device, just enter the IP Address and Port as it is listed in the output.

Once you've connected, any changes you make in Android Studio will be automatically pushed to your physical device.

### Using PhoneGap Emulators

You can also launch the application directly into local iOS and Android Emulators with ease.  First you'll need to install a quick tool:

```bash
$ npm install -g ios-sim ios-deploy
```

Now you can launch the app with the iOS Simulator ( assuming you already have the [XCode](https://developer.apple.com/xcode/) app installed ):

```bash
$ cd ./app/facing
$ cordova emulate ios
```

And to test it in Android, you can run the following:

```bash
$ cd ./app/facing
$ cordova emulate android
```

### Using PhoneGap Command-Line Interface

For more information on the PhoneGap Command-Line Interface, read their [online documentation](http://docs.phonegap.com/en/3.5.0/guide_cli_index.md.html#The%20Command-Line%20Interface).
