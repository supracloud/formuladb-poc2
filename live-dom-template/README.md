# Goals

* Allow the user to change the Template at runtime
    * All templating libraries we've found are built for the main use-case of a developer: "I know the template when I'm writing the app, the only thing that changes at runtime is the data."
    * For [FormulaDB](../README.md) the template itself is data ("meta-data" of course, but in our use case this is still data that changes at runtime)
* add as little as possible over standard HTML/CSS/JS
* Support "virtual DOM"-like behavior, meaning when a template changes do not re-render everything
* Should work both in browser and in nodejs:
    * fast server side (nodejs) to pre-render pages
    * client side to add dynamic behavior to the pre-rendered pages

# Research (May 2019)

* https://github.com/developit/htm, 
* https://github.com/developit/preact-without-babel, 
* https://github.com/Matt-Esch/virtual-dom, 
* https://github.com/wavesoft/dot-dom, 
* https://github.com/trueadm/t7, 
* https://github.com/Polymer/lit-html
* https://pure-js.com/ - similar to live-dom-template, but too complex and no "virtual DOM"
* https://github.com/leonidas/transparency - similar to live-dom-template, but no "virtual DOM" would have to re-render everything each time the template changes
* https://github.com/wix/react-templates
* https://github.com/Polymer/lit-html
* https://github.com/Polymer/lit-element
* many more...
