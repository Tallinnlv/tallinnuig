let mainItems ;
let subItems ;
let visibleClass ;
let mainContainer;

function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(initMenu());

function initMenu(){
    mainItems = document.querySelectorAll('.mainmenu > li');
    subItems = document.querySelectorAll('.mainmenu__sub > li');
    visibleClass = "is-open";

    Array.prototype.forEach.call(mainItems, function(el, i){
        el.addEventListener("click", toggleMainMenu);
    });

    Array.prototype.forEach.call(subItems, function(el, i){
        el.addEventListener("click", toggleSubMenu);
    });
}

function toggleMainMenu (event) {
    let container = this.querySelector(".mainmenu__container");
    mainContainer = container;
    if(!container) return;
    let that = this;
    //close open siblings
    let opensiblings = document.querySelectorAll('.mainmenu__container.'+visibleClass);


    Array.prototype.forEach.call(opensiblings, function(el, i){
        if(el.parentElement !== that) {
            removeClass(el, visibleClass);
            removeClass(el.parentElement, "is-active");
            closeSubmenu(el);
        }
    });

    if (container.classList) {
        // container.classList.add(visibleClass);
        container.classList.toggle(visibleClass);
        this.classList.toggle("is-active");
        if(!matches(container, "."+visibleClass)){
            closeSubmenu(this);
        }
    } else {
        container.className += ' ' + visibleClass;
    }

    setHeight(this);
}

function setHeight(el) {
    let open = document.querySelectorAll('.mainmenu__container.is-open > .mainmenu__sub, .mainmenu__sub.'+visibleClass);
    let max = 0;

    Array.prototype.forEach.call(open, function(el, i){
        let h = el.offsetHeight;
        h > max ? max = h : false
    });
    document.querySelector('.mainmenu__container.is-open').style.height = max+40+"px";
}


function toggleSubMenu(event) {
    event.stopPropagation();
    let container = this.querySelector(".mainmenu__sub");
    if(!container) return;


    if (container.classList) {
        // container.classList.add(visibleClass);
        closeSiblings(this);
        container.classList.toggle(visibleClass);
        this.classList.toggle("is-active");
        if(!matches(container, "."+visibleClass)){
            closeSubmenu(this);
        }
    } else {
        container.className += ' ' + visibleClass;
    }
    setHeight(container);
}


function closeSubmenu(menu) {
    let submenus = menu.querySelectorAll("."+visibleClass);
    if(!submenus) return;

    let className = visibleClass;

    Array.prototype.forEach.call(submenus, function(el, i){
        removeClass(el, visibleClass);
        removeClass(el.parentElement, "is-active");
    });
}

function closeSiblings(el){
    let siblings = Array.prototype.filter.call(el.parentNode.children, function(child){
        return child !== el;
    });

    Array.prototype.forEach.call(siblings, function(el, i){
        closeSubmenu(el);
    })
}


let matches = function(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
};

let removeClass = function (el, className) {
    if(!el) return false;
    if (el.classList)
        el.classList.remove(className);
    else
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
};