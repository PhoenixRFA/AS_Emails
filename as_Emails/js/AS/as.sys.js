var as = as || {};

as.sys = {
    asHtmlFlag: 1,
    init: function () {
        as.sys.setTypeProcessor();
        as.sys.registerStringFunction();
    },
    isDebug: false,
    openProgressBar: function () {
        if ($('.as-progCont').length == 0) {
            $('body').append("<div class='as-progCont'></div>");
        }
        $('.as-progCont').html('<div class="as-overlay">' + as.resources.sysConfirm + '</div>');
    },
    closeProgressBar: function () {
        $('.as-overlay').fadeOut('slow', function () {
            $(this).remove();
        });
    },
    setSortable: function (cont, params) {
        $(cont).sortable(params);
    },
    showPopover: function (params) {
        // align, btn, urlm ajaxParams, callback, titleCallback
        params = $.extend({ align: 'left' }, params);
        var btn = params.btn;
        var jsonFilter = JSON.stringify({});
        as.sys.ajaxSend(params.url, params.ajaxParams, function (data) {
            data = eval('(' + data + ')');
            var text = params.callback ? params.callback(data) : data.text;
            var title = params.titleCallback ? params.titleCallback(data) : params.btn.html();
            if (btn.next().is(".popover")) {
                btn.next().find('.popover-content').html(text);
            } else {
                btn.popover({
                    content: text,
                    title: '<span class="text-info"><strong>' + title + '</strong></span>' +
                        '<button type="button" id="close" class="close" >&times;</button>',
                    html: true, placement: params.align
                }).popover('show');
            }
        });
    },
    showMessage: function (text) {
        $.fancybox(text);
    },
    closeMessage: function () {
        $.fancybox.close();
    },
    showNotice: function (params) {
        $.gritter.add({
            // (string | mandatory) the heading of the notification
            title: params.title || '',
            // (string | mandatory) the text inside the notification
            text: params.text || '',
            // (string | optional) the image to display on the left
            image: params.image || '',
            // (bool | optional) if you want it to fade out on its own or just sit there
            sticky: params.sticky || false,
            // (int | optional) the time you want it to be alive for before fading out (milliseconds)
            time: params.time || 8000,
            // (string | optional) the class name you want to apply directly to the notification for custom styling
            class_name: 'my-class',
            // (function | optional) function called before it opens
            before_open: function () {
            },
            // (function | optional) function called after it opens
            after_open: function (e) {
            },
            // (function | optional) function called before it closes
            before_close: function (e, manual_close) {
                // the manual_close param determined if they closed it by clicking the "x"
            },
            // (function | optional) function called after it closes
            after_close: function () {
            }
        });
    },
    showSimpleNotice: function (text, title) {
        as.sys.showNotice({ title: title, text: text });
    },
    showDialog: function (title, html, buttonText, callback, isBig, callbackAfterLoadingWindow, callbackClose, window) {
        if (!window) window = $("#asModal");
        if ($('.modal:visible').length > 0) {
            window.css('zIndex', parseInt($('.modal:visible').css('zIndex')) + 5);
        }


        $('.modal-title', window).html(title);
        $('.modal-body', window).html(html);
        var btn = $('.modal-footer .btn-primary', window);
        var btnClose1 = $('modal-header button.close', window);
        var btnClose2 = $('.modal-footer button.btn-default', window);
        btn.html(buttonText || 'OK');
        if (callback) btn.off().click(callback);
        if (callbackClose) btnClose1.off().click(callbackClose);
        if (callbackClose) btnClose2.off().click(callbackClose);
        if (isBig) {
            window.addClass('asBigModal');
        } else {
            window.removeClass('asBigModal');
        }

        window.modal({ show: true, backdrop: false });

        // Подключаем Ctrl + S к главной кнопке
        if (!as.sys.initForDialogHotKey) {
            as.sys.initForDialogHotKey = true;
            $('body').keydown(function (e) {
                if ($('#as-modal:visible').length > 0 && e.ctrlKey && e.which == 83) {
                    e.preventDefault();
                    $('#as-modal .btn-primary').trigger('click');
                }
            });

        }

        if (callbackAfterLoadingWindow) callbackAfterLoadingWindow();
    },
    closeDialog: function (window) {
        if (!window) window = $('#asModal');
        window.modal('hide');
    },

    //  function handleCallback(page_index, pagination_container) {
    //var url =   '/page='+ (parseInt(page_index)+1);
    //if(page_index==0) url = 'ddddd'
    //window.location = url;
    //return false;
    //}
    setPaginator: function (cont, total, pagesize, page, handleCallback) {
        $(cont).pagination(total, {
            items_per_page: pagesize,
            callback: handleCallback,
            prev_text: 'Prev',
            next_text: 'Next',
            num_display_entries: 10,
            num_edge_entries: 1,
            current_page: page - 1
        });
        var pagingcontainerwidth = 252 + 20 * total / pagesize;
        $(cont).css('width', '' + pagingcontainerwidth + 'px');
    },
    setTypeProcessor: function () {

        $(document).delegate(".asInt", "keypress", function (e) {
            if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                return false;
            }
        });

        $(document).delegate(".asPhone", "keyup", function (e) {
            var t = $(".asPhone").val();
            $(".asPhone").attr("value", t);
        });
        $(document).delegate(".asPhone", "focus", function (e) {

            $(".asPhone").inputmask("+7(99[9)9]9[9-]9[9-]99", {
                oncleared: function () {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                },
                greedy: false, placeholder: "", groupmarker: { start: "<", end: ">" }, showMaskOnHover: false, showMaskOnFocus: false, clearMaskOnLostFocus: false
            });
        });

        $(document).delegate(".asPhone", "blur", function (e) {

            $(".asPhone").inputmask("+7(99[9)9]9[9-]9[9-]99", {
                onincomplete: function () {
                    as.sys.bootstrapAlert(as.resources.phoneMistakes_init_AlertRequiredText, { type: "warning" });
                },
                greedy: false, placeholder: "", groupmarker: { start: "<", end: ">" }, showMaskOnHover: false, showMaskOnFocus: false, clearMaskOnLostFocus: false
            });
        });

        $(document).delegate(".asEMail", "blur", function (e) {

                var pattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
                if (!pattern.test($(this).val())) {
                    as.sys.bootstrapAlert(as.resources.emailMistakes_init_AlertRequiredText, { type: "warning" });
                }


        });

        $(document).delegate(".asFloat", "keypress", function (e) {
            if (e.which != 8 && e.which != 0 && ((e.which < 48 && e.which != 44) || e.which > 57)) {
                return false;
            }
        });
        $(document).delegate(".asDatepicker", "click", function () {
            $(this).datepicker({ showOn: 'focus', dateFormat: "dd.mm.yy", yearRange: '1950:+5', changeYear: true }).focus();
        });

        $(document).delegate('.as-html', 'mouseover', function () {
            if (as.sys.asHtmlFlag) {
                tinyMCE.init({
                    valid_elements: '*[*]',
                    mode: "specific_textareas",
                    editor_selector: "as-html",
                    encoding: "xml",
                    theme: "advanced",
                    height: "400",
                    width: "400",
                    plugins: "advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,aspnetbrowser",
                    theme_advanced_buttons1: "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect",
                    theme_advanced_buttons2: "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code",
                    theme_advanced_buttons3: "aspnetbrowser,|,insertdate,inserttime,preview,|,forecolor,backcolor",
                    theme_advanced_buttons4: "",
                    theme_advanced_toolbar_location: "top",
                    theme_advanced_toolbar_align: "left",
                    theme_advanced_statusbar_location: "bottom",
                    theme_advanced_resizing: true,
                    relative_urls: false,
                    remove_script_host: true,
                    convert_urls: false,
                    setup: function (ed) {
                        /* ed.onKeyUp.add(function(ed) {
                             console.log('dd');
                             ed.save();
                         }); */
                    }
                });
                as.sys.asHtmlFlag = 0;
            }

        });

        $(document).delegate('.as-daterange', 'mouseover', function () {
            var range = {};
            range[as.resources.sys_setTypeProcessor_range1] = [moment(), moment()];
            range[as.resources.sys_setTypeProcessor_range2] = [moment().subtract(6, 'days'), moment()];
            range[as.resources.sys_setTypeProcessor_range3] = [moment().subtract(29, 'days'), moment()];
            range[as.resources.sys_setTypeProcessor_range4] = [moment().subtract(3, 'month').startOf('month'), moment().endOf('month')];
            range[as.resources.sys_setTypeProcessor_range5] = [moment().subtract(6, 'month').startOf('month'), moment().endOf('month')];
            range[as.resources.sys_setTypeProcessor_range6] = [moment().subtract(12, 'month').startOf('month'), moment().endOf('month')];

            $(this).daterangepicker({
                ranges: range,
                format: 'DD/MM/YYYY'
            }, function (start, end, label) {
                console.log(start.toISOString(), end.toISOString(), label);
            });
        });
    },
    loadLib: function (jslink, csslink, conditionObject, callback) {
        if (!conditionObject) {
            if (csslink) {
                $('head').append('<link href="' + csslink + '" rel="stylesheet" />');
            }
            $.getScript(jslink, function (data, textStatus, jqxhr) {

                if (callback) callback();
            });
        } else {

            if (callback) callback();
        }
    },
    ajaxSend: function (url, data, callback, noProgressBar, btn) {
        var params = data;
        var txt = "";
        if (btn) {
            btn.addClass('disabled');
            btn.attr('disabled', 'disabled');
        }
        if (!noProgressBar) as.sys.openProgressBar();
        $.ajax({
            type: 'POST',
            url: url,
            cache: false,
            traditional: true,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(params),
            success: function (data, status) {
                var response = data;
                if (data.d != undefined) response = data.d;
                if (typeof (response) != "object") response = eval('(' + response + ')');
                if (callback) callback(response);
            },
            complete: function () {
                if (!noProgressBar) as.sys.closeProgressBar();
                if (btn) {
                    btn.removeClass('disabled');
                    btn.removeAttr('disabled');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (as.sys.logJSError) {
                    as.sys.logJSError(url + JSON.stringify(params) + ": " + textStatus + ", " + errorThrown);
                }
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            }
        });
    },
    logJSError: function (str) {
        console.log(as.sys.jsErrorPeriod);
        as.sys.jsErrorPeriod = as.sys.jsErrorPeriod || 500;
        as.sys.jsErrorPeriod = as.sys.jsErrorPeriod * 4;
        setTimeout(function () {
            as.sys.ajaxSend(as.options.jsErrorHandler, { s: str }, function () { });
        }, as.sys.jsErrorPeriod);
    },
    // сохранить значение в куки
    setCookie: function (name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    // загрузить значение с куки
    getCookie: function (c_name) {
        if (document.cookie.length > 0) {
            var c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                var c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = document.cookie.length;
                }
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    },
    registerStringFunction: function () {
        if (typeof String.prototype.startsWith != 'function') {
            String.prototype.startsWith = function (str) {
                return this.substring(0, str.length) === str;
            }
        };
        if (typeof String.prototype.endsWith != 'function') {
            String.prototype.endsWith = function (str) {
                return this.substring(this.length - str.length, this.length) === str;
            }
        };
        if (typeof String.prototype.format != 'function') {
            String.prototype.format = function () {
                // заменяем странные скобки
                var regexp1 = /%7B/g;
                var text = this.replace(regexp1, "\{");
                var regexp2 = /%7D/g;
                var text1 = text.replace(regexp2, "\}");

                var pattern = /\{\d+\}/g;
                var args = arguments;

                var str1 = text1.replace(pattern, function (capture) { return args[capture.match(/\d+/)]; });
                return str1;
            }
        };
    },
    bootstrapAlert: function (str, options) {
        /*
        {
        type: 'error',
        align: 'center',
        width: 'auto',
        allow_dismiss: false,
        stackup_spacing: 30
        }


        ele: 'body', // which element to append to
        type: 'info', // (null, 'info', 'danger', 'success')
        offset: {from: 'top', amount: 20}, // 'top', or 'bottom'
        align: 'right', // ('left', 'right', or 'center')
        width: 250, // (integer, or 'auto')
        delay: 4000, // Time while the message will be displayed. It's not equivalent to the *demo* timeOut!
        allow_dismiss: true, // If true then will display a cross to close the popup.
        stackup_spacing: 10 // spacing between consecutively stacked growls.
        */

        //        {
        //        ele: "body",
        //    type: "info",
        //    allow_dismiss: true,
        //    position: {
        //        from: "top",
        //        align: "right"
        //    },
        //    offset: 20,
        //    spacing: 10,
        //    z_index: 1031,
        //    fade_in: 400,
        //    delay: 5000,
        //    pause_on_mouseover: false,
        //    onGrowlShow: null,
        //    onGrowlShown: null,
        //    onGrowlClose: null,
        //    onGrowlClosed: null,
        //    template: {
        //        icon_type: 'class',
        //        container: '<div class="col-xs-10 col-sm-10 col-md-3 alert">',
        //        dismiss: '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>',
        //        title: '<strong>',
        //        title_divider: '',
        //        message: ''
        //    }


        return $.bootstrapGrowl ? $.bootstrapGrowl(str, options) : alert(str);
    },




    trace: function (text) {
        var dt = new Date().getTime();
        var res = 0;
        if (as.sys.lastTraceDate != undefined) {
            res = dt - as.sys.lastTraceDate;
        }
        as.sys.lastTraceDate = dt;
        console && console.log(res + "  " + text);
    }

};