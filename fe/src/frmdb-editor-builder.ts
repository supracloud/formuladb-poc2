// /*
// Copyright 2017 Ziadin Givan

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//    http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// https://github.com/givanz/VvvebJs
// */

// import { BACKEND_SERVICE } from "./backend.service";
// import { Undo } from "./frmdb-editor/undo";
// import { WysiwygEditor } from "./component-editor/wysiwyg-editor";
// import { baseUrl, defaultComponent, Components, Blocks } from "./component-editor/element-editor.component";
// import { I18nFe, I18N_FE } from "./i18n-fe";
// import { FrmdbAddPageElement, FrmdbRemovePageElement } from "./frmdb-user-events";
// import { normalizeDOM2HTML } from "@core/normalize-html";

// var delay = (function () {
// 	var timer;
// 	return function (callback, ms) {
// 		clearTimeout(timer);
// 		timer = setTimeout(callback, ms);
// 	};
// })();

// function isElement(obj) {
// 	return (typeof obj === "object") &&
// 		(obj.nodeType === 1) && (typeof obj.style === "object") &&
// 		(typeof obj.ownerDocument === "object")/* && obj.tagName != "BODY"*/;
// }

// //@ts-ignore
// var isIE11 = !!window.MSInputMethodContext && !!(document as any).documentMode;

// export class FrmdbEditorBuilder {

// 	isPreview: boolean= false;
// 	isDragging: boolean;
// 	component: any = {};
// 	dragMoveMutation: any = false;
// 	selectedEl: JQuery;
// 	highlightEl: JQuery;
// 	canvas: JQuery;
// 	dragElement: JQuery;
// 	documentFrame: JQuery;
// 	frameDoc: JQuery<Document>;
// 	frameHtml: JQuery;
// 	frameBody: JQuery;
// 	frameHead: JQuery;
// 	texteditEl: JQuery | null = null;

// 	constructor(private iframe: HTMLIFrameElement) {
// 		this.documentFrame = $(iframe);
// 		this.canvas = $("#canvas");
// 	}

// 	init() {
// 		this.initIframe();
// 		this._initBox();
// 	}

// 	/* iframe */
// 	initIframe() {

// 		return this.documentFrame.on("load", () => {
// 			var addSectionBox = jQuery("#add-section-box");
// 			var highlightBox = jQuery("#highlight-box").hide();


// 			$(this.iframe.contentWindow!).on("beforeunload", (event) => {
// 				if (Undo.undoIndex <= 0) {
// 					var dialogText = "You have unsaved changes";
// 					(event as any).returnValue = dialogText;
// 					return dialogText;
// 				}
// 			});

// 			jQuery(this.iframe.contentWindow!).on("scroll resize", (event) => {

// 				if (this.selectedEl) {
// 					var offset = this.selectedEl.offset();

// 					$("#select-box").css(
// 						{
// 							// @ts-ignore
// 							"top": offset.top - this.frameDoc.scrollTop(),
// 							// @ts-ignore
// 							"left": offset.left - this.frameDoc.scrollLeft(),
// 							"width": this.selectedEl.outerWidth(),
// 							"height": this.selectedEl.outerHeight(),
// 							//"display": "block"
// 						});

// 				}

// 				if (this.highlightEl) {
// 					var offset = this.highlightEl.offset();

// 					highlightBox.css(
// 						{
// 							// @ts-ignore
// 							"top": offset.top - this.frameDoc.scrollTop(),
// 							// @ts-ignore
// 							"left": offset.left - this.frameDoc.scrollLeft(),
// 							"width": this.highlightEl.outerWidth(),
// 							"height": this.highlightEl.outerHeight(),
// 							//"display": "block"
// 						});


// 					addSectionBox.hide();
// 				}

// 			});

// 			WysiwygEditor.init(this.iframe.contentWindow!.document);

// 			return this._frameLoaded();
// 		});

// 	}

// 	_frameLoaded() {

// 		this.frameDoc = $(this.iframe.contentWindow!.document);
// 		// @ts-ignore
// 		this.frameHtml = $(this.iframe.contentWindow!.document).find("html");
// 		// @ts-ignore
// 		this.frameBody = $(this.iframe.contentWindow!.document).find("body");
// 		this.frameBody[0].classList.add('frmdb-editor-on');
// 		// @ts-ignore
// 		this.frameHead = $(this.iframe.contentWindow!.document).find("head");

// 		//insert editor helpers like non editable areas
// 		this.frameHead.append('<link data-vvveb-helpers href="' + baseUrl + '../../css/vvvebjs-editor-helpers.css" rel="stylesheet">');

// 		this._initHighlight();

// 		$(window).triggerHandler("vvveb.iframe.loaded", this.frameDoc);
// 	}

// 	_getElementType(el) {

// 		//search for component attribute
// 		let componentName = '';

// 		if (el.attributes)
// 			for (var j = 0; j < el.attributes.length; j++) {

// 				if (el.attributes[j].nodeName.indexOf('data-component') > -1) {
// 					componentName = el.attributes[j].nodeName.replace('data-component-', '');
// 				}
// 			}

// 		if (componentName != '') return componentName;

// 		return el.tagName;
// 	}

// 	selectNodeInComponentsTree(node) {
// 		if (!node.vvvebComponentsTreeId) return;

// 		const treeComp = $("#components-tree .tree") as JQuery;
// 		treeComp.find('input').prop('checked', false);
// 		treeComp.find('.highlighted').removeClass('highlighted');

// 		let li = treeComp.find(`li[data-node-id="${node.vvvebComponentsTreeId}"]`);
// 		if (!li) { console.warn("li for", node, "not found"); return; }
// 		li.find('input').prop('checked', true);
// 		li.addClass('highlighted');
// 		li.parents().children('input').prop('checked', true);
// 		treeComp.animate({
// 			//@ts-ignore
// 			scrollTop: Math.max(0, (li.offset() || { top: 0 }).top - treeComp!.offset().top + treeComp!.scrollTop())
// 		});
// 	}

// 	loadNodeComponent(node) {
// 		let data = Components.matchNode(node);
// 		var component;

// 		if (data)
// 			component = data.type;
// 		else
// 			component = defaultComponent;

// 		Components.render(component, this.selectedEl[0]);

// 	}

// 	selectNode(node?) {

// 		if (!node) {
// 			jQuery("#select-box").hide();
// 			return;
// 		}

// 		// TODO: move this to frmdb-editor.component
// 		// highlightDataGridCell(node[0] && node[0].tagName ? node[0] : node);


// 		let selectActions = jQuery("#select-box").removeClass("text-edit").find("#select-actions");

// 		if (this.texteditEl && this.selectedEl.get(0) != node) {
// 			WysiwygEditor.destroy(this.texteditEl);
// 			selectActions.show();
// 			this.texteditEl = null;
// 		}

// 		var target = jQuery(node);

// 		if (target) {
// 			this.selectedEl = target;

// 			try {
// 				var offset = target.offset();

// 				jQuery("#select-box").css(
// 					{
// 						//@ts-ignore
// 						"top": offset.top - this.frameDoc.scrollTop(),
// 						//@ts-ignore
// 						"left": offset.left - this.frameDoc.scrollLeft(),
// 						"width": target.outerWidth(),
// 						"height": target.outerHeight(),
// 						"display": "block",
// 					});
// 			} catch (err) {
// 				console.log(err);
// 				return false;
// 			}
// 		}

// 		jQuery("#highlight-name").html(this._getElementType(node));

// 	}

// 	/* iframe highlight */
// 	_initHighlight() {

// 		this.frameHtml.on("mousemove touchmove", (event) => {

// 			if (event.target && isElement(event.target) && event.originalEvent) {
// 				let target = jQuery(event.target);;
// 				this.highlightEl = target;
// 				var offset = target.offset();
// 				var height = target.outerHeight();
// 				var halfHeight = Math.max(height! / 2, 50);
// 				var width = target.outerWidth();
// 				var halfWidth = Math.max(width! / 2, 50);

// 				//@ts-ignore
// 				var x = (event.clientX || event.originalEvent.clientX);
// 				//@ts-ignore
// 				var y = (event.clientY || event.originalEvent.clientY);

// 				if (this.isDragging) {
// 					var parent = this.highlightEl;

// 					try {
// 						if (event.originalEvent) {
// 							if ((offset!.top < (y - halfHeight)) || (offset!.left < (x - halfWidth))) {
// 								if (isIE11)
// 									this.highlightEl.append(this.dragElement);
// 								else
// 									this.dragElement.appendTo(parent);
// 							} else {
// 								if (isIE11)
// 									this.highlightEl.prepend(this.dragElement);
// 								else
// 									this.dragElement.prependTo(parent);
// 							};
// 						}

// 					} catch (err) {
// 						console.log(err);
// 						return false;
// 					}

// 				}// else //uncomment else to disable parent highlighting when dragging
// 				{

// 					jQuery("#highlight-box").css(
// 						{
// 							//@ts-ignore
// 							"top": offset.top - this.frameDoc.scrollTop(),
// 							//@ts-ignore
// 							"left": offset.left - this.frameDoc.scrollLeft(),
// 							"width": width,
// 							"height": height,
// 							"display": event.target.hasAttribute('contenteditable') ? "none" : "block",
// 							"border": this.isDragging ? "1px dashed aqua" : "",//when dragging highlight parent with green
// 						});

// 					if (height! < 50) {
// 						jQuery("#section-actions").addClass("outside");
// 					} else {
// 						jQuery("#section-actions").removeClass("outside");
// 					}
// 					jQuery("#highlight-name").html(this._getElementType(event.target));
// 					if (this.isDragging) jQuery("#highlight-name").hide(); else jQuery("#highlight-name").show();//hide tag name when dragging
// 				}
// 			}

// 		});

// 		this.frameHtml.on("mouseup touchend", (event) => {
// 			if (this.isDragging) {
// 				this.isDragging = false;
// 				$("#component-clone").remove();

// 				if (this.dragMoveMutation === false) {
// 					if (this.component.dragHtml) //if dragHtml is set for dragging then set real component html
// 					{
// 						var newElement = $(this.component.html);
// 						this.dragElement.replaceWith(newElement);
// 						this.dragElement = newElement;
// 					}
// 					if (this.component.afterDrop) this.dragElement = this.component.afterDrop(this.dragElement);
// 				}

// 				this.dragElement.css("border", "");

// 				let node = this.dragElement.get(0);
// 				this.selectNode(node);
// 				this.loadNodeComponent(node);

// 				if (this.dragMoveMutation === false) {
// 					Undo.addMutation({
// 						type: 'childList',
// 						target: node.parentNode,
// 						addedNodes: [node],
// 						nextSibling: node.nextSibling
// 					});
// 				} else {
// 					//@ts-ignore
// 					this.dragMoveMutation.newParent = node.parentNode;
// 					//@ts-ignore
// 					this.dragMoveMutation.newNextSibling = node.nextSibling;

// 					Undo.addMutation(this.dragMoveMutation);
// 					this.dragMoveMutation = false;
// 				}
// 			}
// 		});

// 		this.frameHtml.on("dblclick", (event) => {

// 			if (this.isPreview == false) {
// 				let target = jQuery(event.target);
// 				this.texteditEl = target;

// 				WysiwygEditor.edit(this.texteditEl);

// 				this.texteditEl.attr({ 'contenteditable': true, 'spellcheckker': false });

// 				this.texteditEl.on("blur keyup paste input", (event) => {

// 					let nodeLanguage = this.texteditEl!.attr('data-i18n');
// 					const nodeValue = this.texteditEl!.text();
// 					if (!nodeLanguage) {
// 						this.texteditEl!.attr('data-i18n', I18N_FE.defaultLanguage);
// 						nodeLanguage = I18N_FE.defaultLanguage;
// 					}
// 					I18N_FE.updateNode(this.texteditEl![0], nodeLanguage, nodeLanguage, WysiwygEditor.oldValue, nodeValue);

// 					jQuery("#select-box").css({
// 						//@ts-ignore
// 						"width": this.texteditEl.outerWidth(),
// 						//@ts-ignore
// 						"height": this.texteditEl.outerHeight()
// 					});
// 				});

// 				jQuery("#select-box").addClass("text-edit").find("#select-actions").hide();
// 				jQuery("#highlight-box").hide();
// 			}
// 		});


// 		this.frameHtml.on("click", (event) => {

// 			if (this.isPreview == false) {
// 				event.preventDefault();

// 				if (event.target) {
// 					//if component properties is loaded in left panel tab instead of right panel show tab
// 					if ($(".component-properties-tab").is(":visible"))//if properites tab is enabled/visible 
// 						$('.component-properties-tab a').show().tab('show');

// 					this.selectNode(event.target);
// 					this.loadNodeComponent(event.target);
// 					this.selectNodeInComponentsTree(event.target);
// 				}

// 				// image grabbing
// 				const imgUrl = this._grabImage(event.target);
// 				if (imgUrl)
// 					console.log(`Grabbed image ${imgUrl}`);

// 				event.preventDefault();
// 				return false;
// 			}

// 		});

// 		this.frameDoc.on("FrmdbAddPageElement", (event) => {
// 			let detail: FrmdbAddPageElement = event.detail as any as FrmdbAddPageElement;
// 			let node = detail.el;
// 			if (!node) return;
// 			Undo.addMutation({
// 				type: 'childList',
// 				target: node.parentNode,
// 				addedNodes: [node],
// 				nextSibling: node.nextSibling
// 			});
// 		});

// 		this.frameDoc.on("FrmdbRemovePageElement", (event) => {
// 			let detail: FrmdbRemovePageElement = event.detail as any as FrmdbRemovePageElement;
// 			let node = detail.el;
// 			if (!node) return;
// 			Undo.addMutation({
// 				type: 'childList',
// 				target: node.parentNode,
// 				removedNodes: [node],
// 				nextSibling: node.nextSibling
// 			});
// 		});
// 	}

// 	_grabImage(element) {
// 		if (element.tagName.toLowerCase() === 'img') {
// 			return element.getAttribute('src');
// 		}
// 		const img = element.querySelector('img');
// 		if (img) return img.getAttribute('src');
// 		if (getComputedStyle(element).backgroundImage !== 'none') {
// 			return getComputedStyle(element).backgroundImage!.slice(4, -1).replace(/["']/g, "");
// 		}
// 		for (let el of element.querySelectorAll("div")) {
// 			if (getComputedStyle(el).backgroundImage !== 'none') {
// 				return getComputedStyle(el).backgroundImage!.slice(4, -1).replace(/["']/g, "");
// 			}
// 		}
// 	}

// 	_initBox() {
// 		var self = this;

// 		$("#drag-btn").on("mousedown", (event) => {
// 			jQuery("#select-box").hide();
// 			this.dragElement = this.selectedEl.css("position", "");
// 			this.isDragging = true;

// 			let node = this.dragElement.get(0);

// 			this.dragMoveMutation = {
// 				type: 'move',
// 				target: node,
// 				oldParent: node.parentNode,
// 				oldNextSibling: node.nextSibling
// 			};

// 			//this.selectNode(false);
// 			event.preventDefault();
// 			return false;
// 		});

// 		$("#down-btn").on("click", (event) => {
// 			jQuery("#select-box").hide();

// 			var node = this.selectedEl.get(0);
// 			var oldParent = node.parentNode;
// 			var oldNextSibling = node.nextSibling;

// 			var next = this.selectedEl.next();

// 			if (next.length > 0) {
// 				next.after(this.selectedEl);
// 			} else {
// 				this.selectedEl.parent().after(this.selectedEl);
// 			}

// 			var newParent = node.parentNode;
// 			var newNextSibling = node.nextSibling;

// 			Undo.addMutation({
// 				type: 'move',
// 				target: node,
// 				oldParent: oldParent,
// 				newParent: newParent,
// 				oldNextSibling: oldNextSibling,
// 				newNextSibling: newNextSibling
// 			});

// 			event.preventDefault();
// 			return false;
// 		});

// 		$("#up-btn").on("click", (event) => {
// 			jQuery("#select-box").hide();

// 			var node = this.selectedEl.get(0);
// 			var oldParent = node.parentNode;
// 			var oldNextSibling = node.nextSibling;

// 			var next = this.selectedEl.prev();

// 			if (next.length > 0) {
// 				next.before(this.selectedEl);
// 			} else {
// 				this.selectedEl.parent().before(this.selectedEl);
// 			}

// 			var newParent = node.parentNode;
// 			var newNextSibling = node.nextSibling;

// 			Undo.addMutation({
// 				type: 'move',
// 				target: node,
// 				oldParent: oldParent,
// 				newParent: newParent,
// 				oldNextSibling: oldNextSibling,
// 				newNextSibling: newNextSibling
// 			});

// 			event.preventDefault();
// 			return false;
// 		});

// 		$("#clone-btn").on("click", (event) => {

// 			var clone = this.selectedEl.clone();
// 			if (clone.get(0).id) clone.get(0).id = '' + Math.random() * new Date().getTime();

// 			this.selectedEl.after(clone);

// 			this.selectedEl = clone.click();

// 			var node = clone.get(0);
// 			Undo.addMutation({
// 				type: 'childList',
// 				target: node.parentNode,
// 				addedNodes: [node],
// 				nextSibling: node.nextSibling
// 			});

// 			event.preventDefault();
// 			return false;
// 		});

// 		$("#parent-btn").on("click", (event) => {

// 			var node = this.selectedEl.parent().get(0);

// 			this.selectNode(node);
// 			this.loadNodeComponent(node);

// 			event.preventDefault();
// 			return false;
// 		});

// 		$("#delete-btn").on("click", (event) => {
// 			jQuery("#select-box").hide();

// 			var node = this.selectedEl.get(0);

// 			Undo.addMutation({
// 				type: 'childList',
// 				target: node.parentNode,
// 				removedNodes: [node],
// 				nextSibling: node.nextSibling
// 			});

// 			this.selectedEl.remove();

// 			event.preventDefault();
// 			return false;
// 		});

// 		var addSectionBox = jQuery("#add-section-box");
// 		var addSectionElement;

// 		$("#add-section-btn").on("click", (event) => {

// 			var addSectionElement = this.highlightEl;

// 			var offset = jQuery(addSectionElement).offset();
// 			//@ts-ignore
// 			var top = (offset.top - this.frameDoc.scrollTop()) + addSectionElement.outerHeight();
// 			//@ts-ignore
// 			var left = (offset.left - this.frameDoc.scrollLeft()) + (addSectionElement.outerWidth() / 2) - (addSectionBox.outerWidth() / 2);
// 			//@ts-ignore
// 			var outerHeight = $(this.iframe.contentWindow).height() + this.frameDoc.scrollTop();

// 			//check if box is out of viewport and move inside
// 			if (left < 0) left = 0;
// 			if (top < 0) top = 0;
// 			//@ts-ignore
// 			if ((left + addSectionBox.outerWidth()) > this.frameDoc.outerWidth()) left = this.frameDoc.outerWidth() - addSectionBox.outerWidth();
// 			//@ts-ignore
// 			if (((top + addSectionBox.outerHeight()) + this.frameDoc.scrollTop()) > outerHeight) top = top - addSectionBox.outerHeight();


// 			addSectionBox.css(
// 				{
// 					"top": top,
// 					"left": left,
// 					"display": "block",
// 				});

// 			event.preventDefault();
// 			return false;
// 		});

// 		$("#close-section-btn").on("click", (event) => {
// 			addSectionBox.hide();
// 		});

// 		function addSectionComponent(html, after = true) {
// 			var node = $(html);

// 			if (after) {
// 				addSectionElement.after(node);
// 			} else {
// 				addSectionElement.append(node);
// 			}

// 			Undo.addMutation({
// 				type: 'childList',
// 				target: node.get(0).parentNode,
// 				addedNodes: [node],
// 				nextSibling: node.get(0).nextSibling
// 			});
// 		}

// 		$(".components-list li ol li", addSectionBox).on("click", (event) => {
// 			var html = Components.get(event.target.dataset.type).html;

// 			addSectionComponent(html, (jQuery("[name='add-section-insert-mode']:checked").val() == "after"));

// 			addSectionBox.hide();
// 		});

// 		$(".blocks-list li ol li", addSectionBox).on("click", (event) => {
// 			var html = Blocks.get(event.target.dataset.type).html;

// 			addSectionComponent(html, (jQuery("[name='add-section-insert-mode']:checked").val() == "after"));

// 			addSectionBox.hide();
// 		});

// 	}
// };
