/* global moment: false */

(function () {
    var inno = new IframeHelper(),
        timerValues,
        loader = new Loader();
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
                    loader.hide();
                    if (timerValues) {
                        clearInterval(timerValues);
                    }
                    timerValues = setTimeout(getValues, 5000);
                },
                dataType: 'json'
            });
        };
        getValues();
    });
})();