(function () {
    var $ = window.$;

    var form = $('#settings-form');

    var loader = new Loader();
    loader.show();

    var inno = new IframeHelper();
    inno.onReady(function () {
        inno.getProperties(function (status, data) {
            if (status) {
                var elements = form[0].elements;
                $.each(data, function (name, value) {
                    var field = elements[name];
                    if (!field) { return; }
                    $(field).val(value);
                });
            } else {
                alert('Error: unable to get Settings from Profile Cloud');
            }
            loader.hide();
        });
    });

    form.on('submit', function () {
        var elements = this.elements,
            stringSetting = elements.stringSetting,
            numberSetting = elements.numberSetting,
            arraySetting = elements.arraySetting;

        var values = {
            "stringSetting": stringSetting.value,
            "numberSetting": +numberSetting.value,
            "arraySetting":  $(arraySetting).val()
        };

        loader.show();
        inno.setProperties(values, function (status) {
            loader.hide();
            if (status) {
                alert('Settings were saved.');
            }
        });
        return false;
    });

})();