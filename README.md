# Stamplay-cli

[![Build Status](https://travis-ci.org/Stamplay/stamplay-cli.svg)](https://travis-ci.org/Stamplay/stamplay-cli)
[![npm version](https://badge.fury.io/js/stamplay-cli.svg)](http://badge.fury.io/js/stamplay-cli)

This is the Stamplay Command Line (CLI) Tool. They can be used to:

* Administer your Stamplay account
* Interact with [Stamplay Platform](https://editor.stamplay.com), our product to host your
static HTML, JS, CSS, images, etc.

To get started with the Stamplay CLI, [read through our hosting quickstart guide](https://stamplay.com/docs/hosting.html).

## Installation

To install the  Stamplay CLI, you first need to [sign up for a Stamplay account](https://editor.stamplay.com/login?action=register&utm_source=stamplay-cli&utm_content=readme&utm_medium=github).

Then you need to install [Node.js](http://nodejs.org/) and [npm](https://npmjs.org/). Note that
installing Node.js should install npm as well.

Once npm is installed, get the Stamplay CLI by running the following command:

```bash
npm install -g stamplay-cli
```

This will provide you with the globally accessible `stamplay` command.


## Help

The command `stamplay --help` lists the available commands.

## Commands

### `deploy`
Deploys the current app to Stamplay and creates a new version.

Uploads the directory detailed by the "public" attribute in the stamplay.json settings file under. The app must contain an entry point file called index.html at root level of your public directory. If no file is found you'll be prompted to create it.

### `download`
Download the current active version of an app.

You will be prompted to type appId and apiKey, if you don't have it go into your app on https://editor.stamplay.com and get them under Backend -> ApiKey section.

### `init`
Initializes an existing Stamplay app in the current directory and prompts you to configuring it for stamplayapp.com. 

Running stamplay init in an existing repository is safe. It will not overwrite things that are already there.  
It only Generates a stamplay.json file in the current directory with all the settings required to deploy it. If you don't have appId and apiKey yet open https://editor.stamplay.com and create a new app.

### `open`
Opens the current Stamplay app's stamplayapp.com subdomain in a browser.

### `start`
Start serving your app on your localhost. The public folder will be served at the following address http://localhost:8080.

## License

The MIT License (MIT)

Copyright (c) 2015 Stamplay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
