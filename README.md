# Pluralsight Mob Timer
A cross-platform timer built on [Electron](http://electron.atom.io/)
for doing [Mob Programming](http://mobprogramming.org/)

![Example Timer Image](timer-example.png)

Click the gear icon in the top right to configure the timer.
Then click the large circle to start/stop the timer,
or the smaller circle to skip to the next mobber.


# Build the timer
Run `npm install` and then one of the following commands for your respective operating system:
- Windows: `npm run build-win`
- Mac OS X: `npm run build-mac`
- Linux: `npm run build-linux` (You may need to install `libcanberra-gtk-module`)

Platform specific packages will be placed in the `dist` directory.
If you need a platform other than these, you will need to modify the build script in the `package.json` file.


# Development
Run `npm install` to get the dependencies, then `npm start` to run the timer.
Run `npm test` to run the unit tests once, or alternatively `npm run watch` to run them on changes.


# Motivation
Pluralsight has a development team that does mob programming full-time,
and a few other teams dabble in mobbing as well.
We have tried and enjoyed a number of other mob timers, but we had various
(mostly minor) gripes with them.
So we decided to build one of our own.

We had a few goals:

* Make a timer that is hard to ignore, but also not overly annoying
* Implement escalating alerts
* Customization
* Have a timer that we can easily hack on, built with tech we know


# License

The Pluralsight Mob Timer is licensed under the [Apache 2.0 license](LICENSE).
