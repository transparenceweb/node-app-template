/* global moment: false */

(function () {
    var $ = window.$;

    var inno = new IframeHelper(),
        loader = new Loader(),
        timerValues,
        timeout = 5;
    loader.show();
    inno.onReady(function () {
        var url = inno.getCurrentApp().url,
            timezone = inno.getCurrentUser().timezone;
        var getValues = function () {
            $.ajax({
                type: 'get',
                url: url + 'last-ten-values',
                success: function (response) {
                    var values = response.data;
                    if (values && values.length) {
                        for (var i = 0; i < values.length; i++) {
                            var value = JSON.parse(values[i].data);
                            values[i] = '<tr><td>' +
                                moment(value.created_at * 1).tz(timezone).format('L H:m') + /* Convert time to GUI User's timezone (based on information from his account) */
                                '</td><td>' +
                                JSON.stringify(value.values) +
                                '</td><td>' +
                                value.event +
                                '</td><td>' +
                                '<a onclick="window.open(\'' + value.link + '\', \'_blank\');" href="#">' + value.profile + '</a>' +
                                '</td></tr>';
                        }
                        $('#stream').find('tbody').html(values.join(''));
                    }
                    timeout = 5;
                },
                error: function () {
                    inno.addScreenMessage('Error: request to "' + url + 'last-ten-values" failed. Server unavailable.', 'error');
                    timeout *= 2;
                },
                complete: function () {
                    loader.hide();
                    if (timerValues) {
                        clearInterval(timerValues);
                    }
                    timerValues = setTimeout(getValues, timeout * 1000);
                },
                dataType: 'json'
            });
        };
        getValues();
    });
})();