# LISTA Figma plugin
Populate your designs with real IKEA product data!

## Installation
* Run `yarn` to install dependencies.
* Run `yarn build:watch` to start webpack in watch mode.
* Open `Figma` -> `Plugins` -> `Development` -> `Import plugin from manifest...` and choose `manifest.json` file from this repo.

---

## How to use it
1. Right click on the canvas and select `Plugins` -> `Development` -> `Lista`.
2. Select your component instances you want to poplulate with IKEA data. Make sure your layers have the correct naming, see [Output and naming layers](#output-and-naming-layers).
3. Fill in your search query and hit `Submit`.

---

## Data
This plugin fetches data from the [SIK API](https://sik-debug-dot-ikea-search-data.ew.r.appspot.com/index.html).
This API retrieves product data based on a search query that reflects the actual result that you see on an IKEA [search result page](https://www.ikea.com/nl/en/search/products/?q=billy).
### Input
This API can take several parameters to make the API response to fit your needs.

However the LISTA Figma plugin makes some assumptions on what we currently need as a design team and has default values for the following parameters.

**Default values**
| Key | Description |Type | Value |
| ----------- | ----------- | ----------- | ----------- |
| language | This affects the language of all the data. | `String` | "nl/en/" |
| types | The API can also output "CONTENT", "STORE", etc. | `String` | "PRODUCT" |

**Variables**
| Key | Description | Type | Default value |
| ----------- | ----------- | ----------- | ----------- |
| q | The search query | `String` | "" |
| size | Amount of items that need to be fetched. This number corresponds to the amount of selected component instances on your canvas. | `Number` | 0 |

### Output and naming layers
To make sure your text layers are populated with the correct texts and the Frames are filled with the correct images, you need to give your layers the same name as the corresponding properties from the json object prefixed with a `#`.

**Example**
| Property | Layer name |
| ----------- | ----------- |
| `name` | `#name `|
| `typeName` | `#typeName` |
| ```"price": {"prefix"}``` | `#price.prefix` |
---

## Toolings
This repo is using:
* React + Webpack
* TypeScript
* Prettier precommit hook
