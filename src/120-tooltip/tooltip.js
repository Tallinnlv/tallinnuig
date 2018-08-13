// import("../../node_modules/tippy.js/dist/tippy.all.min.js")

let elements = document.querySelectorAll("[data-tooltip]");

Array.prototype.forEach.call(elements, function(el, i){
    let html = el.querySelectorAll(".tooltip__content");
    let placement = el.getAttribute("data-tooltip");

    let options = {
        arrow: true,
        size: "large",
        maxWidth: "300px",
        // trigger: "click",
        interactive: true,
        theme: "tallinn",
        sticky: true,
        placement:  placement ? placement: "top",
        // popperOptions:{
        //     modifiers: {
        //         offset: {
        //             enabled: true,
        //             offset: '20,40'
        //         }
        //     }
        // }
    };
    if(html.length > 0){
        options.html = html[0];
        html[0].style.display = "block";
    }
    tippy(el,options);
    // el._tippy.show();
});

