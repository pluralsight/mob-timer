# Mob Timer

[![GitHub release](https://img.shields.io/github/release/mob-timer/mob-timer.svg)](https://github.com/mob-timer/mob-timer/releases)
[![Greenkeeper badge](https://badges.greenkeeper.io/mob-timer/mob-timer.svg)](https://greenkeeper.io/)
[![License](https://img.shields.io/github/license/mob-timer/mob-timer.svg)](LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/mob-timer/mob-timer.svg)](https://github.com/mob-timer/mob-timer/graphs/contributors)
[![Travis (.org)](https://img.shields.io/travis/mob-timer/mob-timer/master.svg)](https://travis-ci.org/mob-timer/mob-timer/branches)
[![Coverage Status](https://coveralls.io/repos/github/mob-timer/mob-timer/badge.svg?branch=master)](https://coveralls.io/github/mob-timer/mob-timer?branch=master)
![GitHub All Releases](https://img.shields.io/github/downloads/mob-timer/mob-timer/total.svg)
[![GitHub open idea issues](https://img.shields.io/github/issues-raw/mob-timer/mob-timer/idea.svg?color=blue)](https://github.com/mob-timer/mob-timer/issues?q=is%3Aissue+is%3Aopen+label%3Aidea)

A cross-platform mob-timer built on [Electron](http://electron.atom.io/)
for doing [Mob Programming](http://mobprogramming.org/). This is a fork from [pluralsight/mob-timer](https://github.com/pluralsight/mob-timer).

![Example Timer Image](timer-example.png)

Click the gear icon in the top right to configure the mob-timer.
Then click the large circle to start/stop the mob-timer,
or the smaller circle to skip to the next mobber.

# Running the mob-timer

You can either build the mob-timer from source or [download a pre-built version](https://github.com/mob-timer/mob-timer/releases).

## Build mob-timer

Run `npm install` and then one of the following commands for your respective operating system:
- Windows: `npm run build-win`
- Mac OS X: `npm run build-mac`
- Linux: `npm run build-linux` (You may need to install `libcanberra-gtk-module`)

Platform specific packages will be placed in the `dist` directory.
If you need a platform other than these, you will need to modify the build script in the `package.json` file.


# Development

Run `npm install` to get the dependencies, then `npm start` to run the timer.
Run `npm test` to run the unit tests once, or alternatively `npm run watch` to run them on changes. [More information on test structure.](./test/README.md)


# Contributing

Feel free to open Issues and Pull Requests discussing additions to this project. You can also have a look at the [existing issues](https://github.com/mob-timer/mob-timer/issues). Keep the Pull Requests small and make sure the tests and code style checks pass.

If you are uncertain, please reach out first (by opening an issue) before investing too much time. :)

# Reasons for forking

_This is a fork from [pluralsight/mob-timer](https://github.com/pluralsight/mob-timer), please have a look to see if that project is more suited to your needs!_ 🙂
 
There are a few main reasons for this fork existing:

- To build in CI and attach to release using [Travis CI](https://travis-ci.org/)
- To stay up to date with dependencies using [Greenkeeper.io](https://greenkeeper.io/)
- To move to code style and tooling suited for project, not needing to take internal company best practices into account
- To have an independent organization where the mob-timer is the focus

# License

The Mob Timer is licensed under the [Apache 2.0 license](LICENSE).
