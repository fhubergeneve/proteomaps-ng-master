# MixMHCp_ng

This is the frontend for the MixMHCp web project. It is communicating with the [MixMHCp_backend](https://gitlab.isb-sib.ch/Targetome/MixMHCp_backend).

The code is written in Javascript using the AngularJS framework. It is based on a simplified version of [ViKM](https://www.vital-it.ch/research/software/ViKM).

## Prerequisites

- [NodeJS](https://nodejs.org)
- [Bower](https://bower.io)
- [Grunt](https://gruntjs.com)

## Package installation

Call the following bash commands to install the necessary Node modules and Bower components:

```
npm install
bower install
```

To make the application use the correct css, the following section has to be changed in `bower_components/bootstrap/bower.json`:

```
 "homepage": "http://getbootstrap.com",
    "main": [
     "less/bootstrap.less",
     "dist/css/bootstrap.css",
     "dist/js/bootstrap.js",
     "dist/fonts/glyphicons-halflings-regular.eot",
     "dist/fonts/glyphicons-halflings-regular.svg",
     "dist/fonts/glyphicons-halflings-regular.ttf",
     "dist/fonts/glyphicons-halflings-regular.woff"
   ],
 ```


## Development server

You can start a development server with Grunt:

```
grunt serve
```

This should automatically open a browser window for `http://localhost:9000/`.
The page will be automatically refreshed when making changes to the code.


## Deployment

To build the frontend application use the following Grunt command:

```
grunt build
```

The folder `dist` will contain the application which has to be copied to a dedicated web-server.



