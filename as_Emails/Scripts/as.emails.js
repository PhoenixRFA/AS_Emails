// <a class='as-email' data-code='code1' data-param1='1111' data-param2='2222'>Click</a>
var as = as || {};

as.emails = {
    options: {
        ajaxURLFormat: "/serv/form.aspx/{0}",
    },
    init: function (options) {
        as.emails.options = $.extend(as.emails.options, options);
        $(document).delegate('a.as-email', 'click', function (e) {
            e.preventDefault();
            as.emails.sendEmail($(this));
        });
    },
    sendEmail: function (btn) {
        var code = btn.data('code');
        var parameters = new Object();
        $.each(btn.data(), function (i, item) {
            if (i.match('param\\d+')) parameters["{" + i + "}"] = item;
        });
        var params = { code: code, parameters: parameters };
        as.sys.ajaxSend(as.emails.options.ajaxURLFormat, params, function (data) {
            if (typeof (data) != "object") data = eval('(' + data + ')');
            //as.sys.showMessage(data.result ? 'Сообщение успешно отправлено' : 'Ошибка при отправке сообщения');
            alert(data.result ? 'Сообщение успешно отправлено\n' + data.msg : 'Ошибка при отправке сообщения');
        });
    }
}

        
