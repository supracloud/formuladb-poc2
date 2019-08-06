Vvveb.CodeEditor = {
	
	isActive: false,
	isTableEditor: false,
	oldValue: '',
	doc:false,
	codemirror:false,
	
	init: function(isTableEditor) {
		this.isTableEditor = isTableEditor;

		if (this.codemirror != false) {
			this.codemirror.toTextArea(document.querySelector("#vvveb-code-editor textarea"));
		}

		this.codemirror = CodeMirror.fromTextArea(document.querySelector("#vvveb-code-editor textarea"), {
			mode: this.isTableEditor ? 'text/x-yaml' : 'text/html',
			lineNumbers: true,
			autofocus: true,
			lineWrapping: true,
			//viewportMargin:Infinity,
			theme: 'material'
		});
		
		this.isActive = true;
		if (!this.isTableEditor) {
			this.codemirror.getDoc().on("change", function (e, v) { 
				if (v.origin != "setValue")
				delay(Vvveb.Builder.setHtml(e.getValue()), 1000);
			});
		}
		
		
		
		//_self = this;
		Vvveb.Builder.frameBody.on("vvveb.undo.add vvveb.undo.restore", function (e) { Vvveb.CodeEditor.setValue(e);});
		//load code when a new url is loaded
		Vvveb.Builder.documentFrame.on("load", function (e) { Vvveb.CodeEditor.setValue();});

		this.isActive = true;
		this.setValue();

		return this.codemirror;
	},

	setValue: function(value) {
		if (this.isActive == true)
		{
			var scrollInfo = this.codemirror.getScrollInfo();
			if (this.isTableEditor) {
				let entity = Vvveb.Gui.FRMDB_BACKEND_SERVICE.currentSchema.entities[Vvveb.Gui.CurrentTableId];
				this.codemirror.setValue(jsyaml.safeDump(entity, {
					indent: 4,
					flowLevel: 4,
				}));
			} else {
				this.codemirror.setValue(Vvveb.Builder.getHtml());
			}
			this.codemirror.scrollTo(scrollInfo.left, scrollInfo.top);
		}
	},

	destroy: function(element) {
		/*
		//save memory by destroying but lose scroll on editor toggle
		this.codemirror.toTextArea();
		this.codemirror = false;
		*/ 
		this.isActive = false;
	},

	toggle: function(isTable) {
		if (this.isActive != true)
		{
			this.isActive = true;
			return this.init(isTable);
		}
		this.isActive = false;
		this.destroy();
	}
}
