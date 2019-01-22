// <a class='as-email' data-code='code1' data-title='Dialog Title' data-param1='2222' href='#'>Click</a>
var as = as || {};

as.emails = {
    options: {
        ajaxURLFormat: "/serv/form.aspx/{0}"

    },
    init: function (options) {
        as.emails.options = $.extend(as.emails.options, options);
        $(document).delegate('a.as-email', 'click', function (e) {
            e.preventDefault();
            as.emails.showDialog($(this));
        });
    },
    showDialog: function (btn) {
        var code = btn.data('code');
        var title = btn.data('title');
        var parameters = new Object();

        $.each(btn.data(), function (i, item) {
            if (i != 'title' && i != 'code') parameters["{" + i + "}"] = item;
        });
        
        var params = { code: code, parameters: parameters };
        as.sys.ajaxSend(as.emails.options.ajaxURLFormat.format('showMessage'), params, function (data) {
            if (!data.result) {
                as.sys.bootstrapAlert("Ошибка при отправке сообщения!", { type: 'danger' });
                console && console.log(data.msg);
                return;
            }
            var to = btn.data('to') || data.email.to;
            var body = '<div class="">' +
                '<input id="eCode" type="hidden" value="' + (data.email.code || '') + '" />' +
                '<div class="input-group mb-2"><span class="input-group-addon">От: &nbsp; &nbsp;</span><input id="eFrom" class="form-control" type="text" placeholder="От кого:" value="' + (data.email.from || '') + '" /></div>' +
                '<div class="input-group mb-2"><span class="input-group-addon">Кому:</span><input id="eTo" class="form-control" type="text" placeholder="Кому:" value="' + (to || '') + '" /></div>' +
                '<div class="input-group mb-2"><span class="input-group-addon">Тема:</span><input id="eCaption" class="form-control" type="text" placeholder="Тема письма" value="' + (data.email.caption || '') + '" /></div>' +
                '<label class="control-label" for="eBody">Текст:</label><textarea id="eBody" class="form-control" cols="80" rows="10" placeholder="Текст письма">' + (data.email.body || '') + '</textarea>' +
                '</div>';

            as.sys.showDialog(title ? title : 'Отправка Email', body, 'Отправить', function () { as.emails.sendEmail(); }, true);
            }, true);
    },
    sendEmail: function () {
        var code = $('#eCode').val();
        var from = $('#eFrom').val();
        var to = $('#eTo').val();
        var caption = $('#eCaption').val();
        var text = $('#eBody').val();

        if (!from.trim()) {
            as.sys.bootstrapAlert("Поле \"От кого:\" не заполнено!", { type: 'warning' });
            $('#eFrom').focus();
            return;
        }
        if (!to.trim()) {
            as.sys.bootstrapAlert("Поле \"Кому:\" не заполнено!", { type: 'warning' });
            $('#eTo').focus();
            return;
        }

        var params = {code: code, from: from, to: to, subject: caption, body: text };

        as.sys.ajaxSend(as.emails.options.ajaxURLFormat.format('send'), params, function (data) {
            //as.sys.showMessage(data.result ? 'Сообщение успешно отправлено\n' + data.msg : 'Ошибка при отправке сообщения\n' + data.msg);
            if (data.result) {
                as.sys.bootstrapAlert('Сообщение успешно отправлено!', { type: 'success' });
                as.sys.closeDialog();
            } else {
                as.sys.bootstrapAlert("Ошибка при отправке сообщения!", { type: 'danger' });
                console && console.log(data.msg);
            }
                
        }, true);
    }
}

        
