/**********************************

PAGE UI: to extend to Sidebar, Play Controls, Modal.

**********************************/

export default function PageUI(dom){

	var self = {};
	self.dom = dom;

	self.pages = [];
	self.addPage = function(id, page){
		page.id = id;
		self.dom.appendChild(page.dom);
		self.pages.push(page);
	};
	self.currentPage = {
		edit: () => { }
	};
	self.showPage = function(id){
		var shownPage = {
			edit: () => {}
		};
		for(var i=0; i<self.pages.length; i++){
			var page = self.pages[i];
			if(page.id==id){
				page.show();
				shownPage = page;
			}else{
				page.hide();
			}
		}
		self.currentPage = shownPage;
		return shownPage;
	};

	return self;
}

export function Page(){

	var self = this;

	// DOM
	self.dom = document.createElement("div");
	self.show = function(){ self.dom.style.display="block"; };
	self.hide = function(){ self.dom.style.display="none"; };

	// Add Component
	self.addComponent = function(component){
		self.dom.appendChild(component.dom); // add to DOM
		return component;
	};

}
