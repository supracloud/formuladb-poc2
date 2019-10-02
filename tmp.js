const polyfillCustomElements = require( 'custom-elements-module')
const jsdom = require( 'jsdom')

const { window } = new jsdom.JSDOM(`<x-h>Custom H</x-h>`, {
  beforeParse (window) {
    polyfillCustomElements(window)
  }
})

const { customElements, document, HTMLElement } = window

customElements.define(
  'x-h',
  class CustomH extends HTMLElement {
    constructor () {
      super()

      this.attachShadow({ mode: 'open' }).appendChild(
        document.createElement('slot')
      )
    }
  }
)

console.log(document.querySelector('x-h'));
