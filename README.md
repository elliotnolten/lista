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

![data example](/images/data-example.png)

Check out this [API response example](https://sik.search.blue.cdtapps.com/nl/en/search-result-page?q=billy&types=PRODUCT) to see what other pieces of information you can add to your design.

```json
"product": {
  "itemNo": "00263850",
  "itemType": "ART",
  "price": {
    "prefix": "€ ",
    "wholeNumber": "44",
    "separator": ".",
    "decimals": "99",
    "suffix": "",
    "isRegularCurrency": false
  },
  "contextualImageUrl": "https://www.ikea.com/nl/en/images/products/billy-bookcase-white__1051924_pe845813_s5.jpg",
  "mainImageAlt": "BILLY Bookcase, white, 80x28x202 cm",
  "breathTaking": false,
  "discount": "",
  "name": "BILLY",
  "typeName": "Bookcase",
  "itemMeasureReferenceText": "80x28x202 cm",
  "mainImageUrl": "https://www.ikea.com/nl/en/images/products/billy-bookcase-white__0625599_pe692385_s5.jpg",
  "pipUrl": "https://www.ikea.com/nl/en/p/billy-bookcase-white-00263850/",
  "id": "00263850",
  "itemNoGlobal": "00263850",
  "onlineSellable": true,
  "lastChance": false,
  "gprDescription": {},
  "colors": [],
  "priceNumeral": 44.99,
  "currencyCode": "EUR",
  "tag": "NONE",
  "quickFacts": [],
  "features": [],
  "availability": []
}
```

---

## Toolings
This repo is using:
* React + Webpack
* TypeScript
* Prettier precommit hook
