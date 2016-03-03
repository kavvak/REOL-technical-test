# REOL technical test

## Requirements

### Git

First check whether Git is already installed in your console by trying to run the `git` command. If it cannot be found,
download it from http://git-scm.com/downloads or use your package manager of choice.

Recommended installation:

  * **OSX**: `xcode-select --install`
  * **Windows**: `choco install git`
  * **Debian/Ubuntu**: `sudo apt-get install git`
  * **Fedora**: `sudo yum install git`

Additionally, on Windows please make sure to run `git config --global core.autocrlf false` after the installation.

### Node

You can grab Node from https://nodejs.org/ or use your package manager of choice.

On OSX, you may also use NVM (https://github.com/creationix/nvm) which makes switching between Node versions a breeze
and removes the need for `sudo`.

#### node-gyp

node-gyp is necessary to build native addon modules. While it comes with Node, it requires that a C++ compiler be
installed.

  * **OSX**: `xcode-select --install` (should already have been done from Git installation)
  * **Windows**: Follow the Windows instructions from https://github.com/TooTallNate/node-gyp
  * **Debian/Ubuntu**: `sudo apt-get install gcc`
  * **Fedora**: `sudo yum install gcc`

### Gulp

  * **OSX/Linux**: `sudo npm install -g gulp`
  * **Windows**: `npm install -g gulp` (as administrator)

## Setup

```sh
$ npm install
```

## Building and running

```sh
$ gulp
```
