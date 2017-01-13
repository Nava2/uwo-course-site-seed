# UWO Course Site Seed

This project builds a static page using Gulp, and Pug that allows content creation for a simple
course website that has Labs and Lectures. 

## Lectures

Lectures are built using [reveal.js](https://github.com/hakimel/reveal.js). There are specialized
pug filters/mixins available. 

## Labs

Labs generated via the main index page. Building the labs utilize multiple blocks to quickly make 
labs of a designated format. 

## Example

See the currently in use site: [SE2205B - Data Structures and Algorithms - Winter 2017](https://uwoece-se2205b-2017.github.io).

## Development Setup 

### Prerequisites

1. Install [nodejs](https://nodejs.org/en/), preferably the current release.
2. Install yarn and gulp: `npm install -g yarn gulp-cli#4.0`

### Bootstrap the repository 

1. Clone the repository
2. Pull submodules: `git submodule update --init --recursive`
3. Install dependencies: `yarn install`
4. Create a .env file: 
  ```bash
  # Sample .env file

  PDF_HREF_BASE=https://my-page.github.io/
  ```

### Building 

1. Build: `gulp build`, for production: `NODE_ENV=production gulp build`
1. Dev server: `gulp watch serve` (note, must run `build` at least one before)
1. Open up the browser to the URL printed, e.g. `http://localhost:8000/`.
  * If some images/assets do not load, it may be caused by the development server.

