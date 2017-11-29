# RWS 3D Linked Data Project Viewer

A web viewer based on cesiumjs to visualize the different databases of RWS and external data to provide the 3D context.

## Setup

### Install dependencies

Install node.js and use the npm package manager to install the required packages by running the following command in the project folder:

`npm install`

### Add the data

The app looks for data in the data/ folder. Make sure this data is available or add your own data and change the app code to reflect these changes.

### Start an HTTP server

In python2 this can be done using the following command:

`python -m SimpleHTTPServer`

Or in python3:

`python -m http.server`

With an internet browser navigate to `localhost:8000`.
