(function () {
    /**
     * JSON Schema -> HTML Editor
     * https://github.com/jdorn/json-editor/
     */
    var editor = new JSONEditor($('#form-setting')[0], {
        disable_collapse: true,
        disable_edit_json: true,
        disable_properties: true,
        no_additional_properties: true,
        schema: {
            type: 'object',
            title: 'App Settings',
            properties: {
                customSettingApp: {
                    title: 'setting',
                    type: 'string',
                    minLength: 0,
                    maxLength: 40
                }
            }
        },
        //startval: {},
        required: [],
        required_by_default: true,
        theme: 'bootstrap3'
    });

    var inno = new IframeHelper();
    inno.onReady(function () {
        inno.getProperties(function (status, data) {
            if (status) {
                editor.setValue(data);
            } else {
                alert('Error');
            }
        });
    });

    $('#submit-setting').on('click', function () {
        var errors = editor.validate();
        if (errors.length) {
            errors = errors.map(function (error) {
                var field = editor.getEditor(error.path),
                    title = field.schema.title;
                return title + ': ' + error.message;
            });
            alert(errors.join('\n'));
        } else {
            inno.setProperties(editor.getValue(), function (status) {
                if (status) {
                    alert('Settings were saved.');
                }
            });
        }
    });
})();