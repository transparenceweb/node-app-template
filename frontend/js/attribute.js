(function () {
    /**
     * JSON Schema -> HTML Editor
     * https://github.com/jdorn/json-editor/
     */
    var editor = new JSONEditor($('#form-set-attribute')[0], {
        disable_collapse: true,
        disable_edit_json: true,
        disable_properties: true,
        no_additional_properties: true,
        schema: {
            type: 'object',
            title: 'Get/Set attribute "some-attribute"',
            properties: {
                profileId: {
                    title: 'profileId',
                    type: 'string',
                    minLength: 0,
                    maxLength: 40
                },
                section: {
                    title: 'section',
                    type: 'string',
                    minLength: 0,
                    maxLength: 40
                },
                attribute: {
                    title: 'attribute',
                    type: 'string',
                    minLength: 0,
                    maxLength: 40
                }
            }
        },
        // startval: {},
        required: ['profileId', 'section'],
        required_by_default: true,
        theme: 'bootstrap3'
    });

    var inno = new IframeHelper();
    inno.onReady(function () {
        var url = inno.getCurrentApp().url;
        $('#set-attribute').on('click', function () {
            $.ajax({
                type: 'post',
                url: url + 'set',
                data: editor.getValue(),
                success: function () {
                    alert('Attribute saved');
                },
                dataType: 'json'
            });
        });

        var getAttribute = function () {
            $.ajax({
                type: 'get',
                url: url + 'get',
                data: editor.getValue(),
                success: function (response) {
                    var attributes = response.data;
                    if (attributes && attributes.length) {
                        var values = editor.getValue();
                        values['attribute'] = attributes[0].data && attributes[0].data['some-attribute'];
                        editor.setValue(values);
                    }
                },
                dataType: 'json'
            });
        };
        $('#get-attribute').on('click', getAttribute);
        getAttribute();
    });
})();