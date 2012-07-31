// 显示代码预览执行区
function showSnippet( url ) {
    var f = document.getElementById('snippetframe'),
        v = document.getElementById('snippetview');
    v.style.display="block";
    f.src = ['./snippet/snippet.html', '?', 'q=', url].join("");
    f.style.borderLeft="1px solid #bbb";
    f.style.boxShadow="0 0 20px #ccc";
}

function closeSnippet() {
    var f = document.getElementById('snippetframe'),
        v = document.getElementById('snippetview');

    v.style.display="none";
    f.src = "about:blank";
    f.style.borderLeft="none";
    f.style.boxShadow="none";
    location.hash="OpenJS";
}

var hashPos = location.href.lastIndexOf('#'),

    hash = hashPos == -1 ? "" : location.href.slice(hashPos+1),
    
    star = '*',

    snippet;

if (hash.indexOf(star) === 0) {

    snippet = hash.slice(star.length);

}

if (snippet) {

    window.onload = function () {

        showSnippet(snippet);

    };
}
//
$("li > a.sub_toc_title").click(function (e){
    var lable = $(this);
    var list = lable.next();
    var cite = lable.parent().find('cite');
    if (list.is(":visible")) {
        list.slideUp(200, function () {
            cite.text(cite.text().replace('-','+'));
        });
    } else {
        list.slideDown(200, function () {
            cite.text(cite.text().replace('+','-'));
        });
    }
    return false;
});
