String.prototype.format = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

// <a class='as-email' data-code='code1' data-param1='1111' data-param2='2222'>Click</a>
var as = as || {};

as.emails = {
    options: {
        ajaxURLFormat: "/serv/form.aspx/{0}",
        //from: "default@email.com",
        //to: "target@email.com",
        //port..?
        //user..?
        //pass..?
        //etc...?
        //dispName: "Automatic Bot"

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
        var parameters = new Object();
        var title = btn.data('title');

        $.each(btn.data(), function (i, item) {
            if (i != 'title' && i != 'code') parameters["{" + i + "}"] = item;
        });
        
        var params = { code: code, parameters: parameters };
        as.sys.ajaxSend(as.emails.options.ajaxURLFormat.format('showMessage'), params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            if (!data.result) {
                as.sys.bootstrapAlert("Ошибка!", { type: 'danger' });
                console && console.log(data.msg);
                return;
            }
            
            var body = '<div><div class="col-8"><div class="input-group mb-3">' +
                '<input id="eCode" class="form-control" type="hidden" value="' + (data.email.code || '') + '" />' +
                '<lable class="control-label" for="eFrom">От:</lable><input id="eFrom" class="form-control" type="text" placeholder="От кого:" value="' + (data.email.from || '') + '" /><br />' +
                '<label class="control-label" for="eTo">Кому:</label><input id="eTo" class="form-control" type="text" placeholder="Кому:" value="' + (data.email.to || '') + '" /><br />' +
                '<label class="control-label" for="eCaption">Тема:</label><input id="eCaption" class="form-control" type="text" placeholder="Тема письма" value="' + (data.email.caption || '') + '" /><br />' +
                '<label class="control-label" for="eBody">Текст:</label><textarea id="eBody" class="form-control" cols="80" rows="10" placeholder="Текст письма">' + (data.email.body || '') + '</textarea>' +
                '</div></div></div>';

            as.sys.showDialog(title ? title : 'Отправка Email', body, 'Отправить', function () { as.emails.sendEmail(); }, true);
            });
    },
    sendEmail: function (btn) {
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
            if (typeof (data) != "object") data = eval('(' + data + ')');

            as.sys.showMessage(data.result ? 'Сообщение успешно отправлено\n' + data.msg : 'Ошибка при отправке сообщения\n' + data.msg);
        });
    }
}

        
