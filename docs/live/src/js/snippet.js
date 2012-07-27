var code = (location.search || "").match(/q=([^&]+)/),
    
    code = code ? code[1] : "default.html",

    url = ['./', 'code/', code].join(""),

    runnable = document.getElementById("runnable"),

    xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject("Microsoft.XMLHTTP");

xhr.open("get", url, "async");

xhr.onreadystatechange = function () {

    if (xhr.readyState == 4) {

        if (xhr.status == 200) {

            runnable.value = xhr.responseText;

            runnable.removeAttribute("readonly");

            document.getElementById("runcode").disabled = false;

            runcode();

        } else {

            runnable.value = ["加载代码片段失败，", xhr.status, " " ,xhr.statusText].join("");

        }

    }

};

xhr.send(null);

        function runcode() {
            var s = document.getElementById("sandbox"),
                d = s.documentElement || s.contentWindow.document;
            d.open();
            d.write(runnable.value);
            d.close();
        }

function closeframe() {
    parent.closeSnippet && parent.closeSnippet();
}

function newwin() {
    window.open(url);
}
