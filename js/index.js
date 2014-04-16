$(function() {
    var links = $("#gamelist h1 a").map(function() {
        var gameName = this.text;
        var baseUrl = this.baseURI.substring(0, this.baseURI.lastIndexOf("/"));
        this.href = baseUrl + "/" + gameName + ".html";
        
        var qrCodeDiv = document.createElement("div");
        qrCodeDiv.id = "qrcode_" + gameName;
        this.appendChild(qrCodeDiv);
        new QRCode(qrCodeDiv, 
                   { 
                       text: this.href,
                       width: 128,
                       height: 128,
                       colorDark : "#000000",
                       colorLight : "#ffffff",
                       correctLevel : QRCode.CorrectLevel.H
                   });
        
        return;
    });
});


$(function() {
    var links = $("#goodsufflist h1 a").map(function() {
        var qrCodeDiv = document.createElement("div");
        this.appendChild(qrCodeDiv);
        new QRCode(qrCodeDiv, 
                   { 
                       text: this.href,
                       width: 128,
                       height: 128,
                       colorDark : "#000000",
                       colorLight : "#ffffff",
                       correctLevel : QRCode.CorrectLevel.H
                   });
        
        return;
    });
});