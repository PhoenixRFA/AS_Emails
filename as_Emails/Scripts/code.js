//Init
$(function () {
    $('.as-email').click(sendEmail);

    //$('.ajax').click(function () {
    //    ajaxSend('home/asTest', { }, function (data) {
    //        alert('Ajax successful!' + data != null ? '\nReturned data in console!' : '');
    //        log(data);
    //    });
    //})
});

//Service
function ajaxSend(url, data, callback) {
    var params = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: url,
        dataType: 'json',
        cache: false,
        contentType: 'application/json; charset=utf-8',
        data: params,
        success: function (data, status) {
            log(data);
            var response = data;
            if (data.d != undefined) response = data.d;
            if (callback) callback(response);
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        },
        error: function (jqXHR, txtStat, errThr) {
            var x = window.open();
            x.document.open();
            x.document.write(jqXHR.responseText);
            x.document.close();
        },
    });
}

function log(data) {
    console & console.log(data);
}

function sendEmail() {

    var code = $(this).data('code');

    var parameters = new Object();
    $.each($(this).data(), function (i, item) {
        if (i.match('param\\d+')) parameters["{" + i + "}"] = item;
    });
    ajaxSend('home/ajsendemail', { code, parameters }, function (data) {
        alert(data.result ? 'Сообщение успешно отправлено\n' + data.msg : 'Ошибка при отправке сообщения');
    });
}