# LISTA Figma plugin
Populate your designs with real IKEA product data!

## Installation
* Run `yarn` to install dependencies.
* Run `yarn build:watch` to start webpack in watch mode.
* Open `Figma` -> `Plugins` -> `Development` -> `Import plugin from manifest...` and choose `manifest.json` file from this repo.

---

## How to use it
### Data
This plugin fetches data from the [SIK API](https://sik-debug-dot-ikea-search-data.ew.r.appspot.com/index.html).
This API retrieves product data based on a search query that reflects the actual result that you see on an IKEA [search result page](https://www.ikea.com/nl/en/search/products/?q=billy).
### Input
This API can take several parameters to make the API response to fit your needs.

However the LISTA Figma plugin makes some assumptions on what we currently need as a design team and has default values for the following parameters.

**Default values**
| Key | Description |Type | Default value
| ----------- | ----------- | ----------- | ----------- |
| language | This affects the language of all the data. | `String` | "nl/en/" |
| types | The API can also output "CONTENT", "STORE", etc. | `String` | "PRODUCT" |

**Variables**
| Key | Description | Type | Default value
| ----------- | ----------- | ----------- | ----------- |
| q | The search query | `String` | "" |
| size | The amount of items to retrieve. This number is automatically set by the amount of selected items on your Figma canvas. | `Number` | 0 |

### Output and naming your layers

---

## Toolings
This repo is using:
* React + Webpack
* TypeScript
* Prettier precommit hook
