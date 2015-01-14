(function () {
    var inno = new IframeHelper(),
        timer;
    inno.onReady(function () {
        var url = inno.getCurrentApp().url;
        var getUrls = function () {
            $.ajax({
                type: 'get',
                url: url + 'last-ten-urls',
                success: function (response) {
                    var urls = response.data;
                    $('#stream').html(urls && urls.length ? urls.reverse().join('<br />') : 'List is empty');
                    if (timer) {
                        clearInterval(timer);
                    }
                    timer = setTimeout(getUrls, 5000);
                },
                dataType: 'json'
            });
        };
        getUrls();
    });
})();