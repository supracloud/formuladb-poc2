FormulaDB apps could be plain HTML/CSS/JS web apps:

* [ ]  A `Page` is vanilla `HTML`
* [ ]  An `Entity` is `JSON, Schema - like`: proprietary FormulaDB format
* [ ]  An `Formula` is a `string`: proprietary FormulaDB format
* [ ]  An `DataObj` is plain `JSON` object conforming to `Entity` definition
* [ ]  A `TableObj` an `Array` with `DataObj` from a `Entity`
* [ ]  `Page editor`: plain HTML website builder https://github.com/givanz/VvvebJs
* [ ]  `EntityEditor` already developed as an Angular app (most notable external dependency: `ag-grid`)
* [ ]  `Pages` visualize `DataObj` and `TableObj`: valid HTML template engine http://leonidas.github.io/transparency/
* `Pages` should allow editing of `DataObj` and `TableObj`
  * [ ]  Scalar form events from `input, select`
  * [ ]  Navigate+Edit to a `DataObj' in a `TableObj` in `spreadsheet, tabs, tables, cards/grids, f-pattern` components
  * [ ]  Add `DataObj`
  * [ ]  Delete `DataObj`

```
+---------------------------------------------+                   +----------------------------------------------------------------+
|                                           BE|                   |                         User Events                            |
|   +---+                                     |                   +----------------------------------------------------------------+
|   |   |                                     |
|   | M |                                     |                   +----------------------------------------------------------------+
|   | o |                                     |                   |                                                                |  +---+
|   | n |   +--------------------+            | DataObj(JSON)     |    +----------------+                                       FE |  |BE |
|   | i |   | Tokenizer          |            +----------------------->+ FrmdbTemplate  |                                          |  +---+
|   | t |   +--------------------+            | Page(HTML)        |    +-+--------------+                                          |  |   |
|   | o |                                     |                   |      |                                                         |  | R |
|   | r |   +--------------------+            |                   |      |   +---------------+   PUT/DELETE Entity(JSON)           |  | E |
|   | i |   | StaticTypeChecker  |            |                   |      |   | EntityEditor  +--------------------------------------->+ S |
|   | n |   +--------------------+            |                   |      |   +---------------+                                     |  | T |
|   | g |                                     |                   |      |                          +---------------+              |  |   |
|   |   |   +--------------------+            |                   |    +-v--------------------+     | FormulaEditor |              |  | A |
|   +---+   | Compiler           |            |                   |    |                      |     +---------------+              |  | P |
|           +--------------------+            |                   |    |        HTML DOM      |                                    |  | I |
|   +---+                                     |                   |    |                      |                                    |  |   |
|   |   |   +--------------------+            |                   |    +----------------------+                                    |  |   |
|   | S |   | TransactionRunner  |            |                   |                      |change,click,mouseover                   |  |   |
|   | e |   +--------------------+            |                   |                      |                                         |  |   |
|   | a |                                     |                   |                +-----v---------+    PUT/DELETE DataObj(JSON)   |  |   |
|   | r |   +--------------------+            |                   |                | DataObjEditor +--------------------------------->+   |
|   | c |   | Engine             |            |                   |                +---------------+                               |  |   |
|   | h |   +--------------------+            |                   |                                                                |  |   |
|   |   |                                     |                   |            +------------+       cleanup HTML, PUT Page(HTML)   |  |   |
|   +---+   +--------------------+            |                   |            | PageEditor +---------------------------------------->+   |
|           | StorageInterface   |            |                   |            +------------+                                      |  |   |
|           +--------------------+            |                   |                                                                |  |   |
|                                             |                   |    +--------------+                                            |  |   |
|     +-----------+       +-----------+       |                   |    | EntityEditor |                                            |  |   |
|     | Postgres  |       | Cassandra |       |                   |    +--------------+                                            |  |   |
|     +-----------+       +-----------+       |                   |                                                                |  |   |
|                                             |                   |                                                                |  |   |
+---------------------------------------------+                   +----------------------------------------------------------------+  +---+

```


# "febe" internal Development

## Prerequisites

* docker
* docker-compose
* bash + git + node + vscode

## env

FRMDB_DEPLOYMENT_DIR: examples, customer-orbico, customer-dacris, etc.

```bash
alexandru.cristu@ACR MINGW64 /d/code/metawiz/febe
alexandru.cristu@ACR MINGW64 /d/code/metawiz/examples
alexandru.cristu@ACR MINGW64 /d/code/metawiz/customer-orbico
alexandru.cristu@ACR MINGW64 /d/code/metawiz/customer-dacris
```

## tools

```bash
# TBD TBD
```

# "app" Development and Deployment

## Prerequisites

* docker
* docker-compose

## env

FRMDB_DEPLOYMENT_DIR: examples, customer-orbico, customer-dacris, etc.

```bash
alexandru.cristu@ACR MINGW64 /d/code/metawiz/febe
alexandru.cristu@ACR MINGW64 /d/code/metawiz/customer-dacris
```

## Deploy

```bash
alexandru.cristu@ACR MINGW64 /d/code/metawiz/febe
. bin/tools-dev.sh

# TBD TBD
```
