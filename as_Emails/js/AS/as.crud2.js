// v2.00

var as = as || {};
as.crud2 = {
    options: {
        isDebug: true,
        enableFrozenHeader: true,
        defaults: {
            cont: null,
            title: '',
            tableTooltip:"",
            immediatelyLoad: true,
            emptyText: 'Нет элементов',
            filterLinkTitle: 'Найти',
            showChecksCol: true,
            showNumsCol: true,
            showToolbar: true,
            showExcelExport: false,
            toolbarAdditional: '',
            groupOperationsToolbar: '',
            ajaxURLFormat: "/serv/crud2.aspx/{0}",  // save, getItems, remove, getItem
            inlineAjaxURL: "",
            getItemsURLParameters: "",
            ctrlClickShowComment: true,
            filterByEnterKey: true,
            pageSize: 10,
            page: 1,
            sort: '',
            direction: '',
            additionalSort: false,
            sort2: '',
            direction2: '',
            cookiePrefix: 'as-crud23-',
            detailsCallback: null,
            chosenSelect: false,
            commentMarkers: [],
            notifyTag:false,
            operations: {
                remove: true,
                comments: false,                
                other: [
                //  { linkClass: 'crd2Details', iconClass: 'glyphicon glyphicon-th-large', title: 'Детали', callback: function (e) { } },
                ]
            },
            predefinedFilterLinks: [
                //
               // { title: "", tooltip: "", code: "", setFilter: function () { } },
            ],
            getFilterMakeup: function (filter) { var res = ""; return res; },
            filter: function () { var res = []; return res; },

            processRowCallback: function (tr) {
            },
            getItemsCallback: function () { }
        },
        tables: {},
    },
    init: function (options) {
        as.crud2.options = $.extend(as.crud2.options, options);
        if (typeof String.prototype.format != 'function') {
            as.sys.init();
        }
        as.crud2.initCallbacks();
    },
    initTable: function (options) {
        // cont and cols
        var g = as.tools.guidGenerator();
        options.cont.attr('data-g', g);
        as.crud2.options.tables[g] = $.extend(as.crud2.options.defaults, options);
        var tableOptions = as.crud2.getTableOptions(g);

        if (options.cont.length) {
            as.crud2.getItems({isFirst: true, g: g});

            
            if (tableOptions.operations.dateStat) {
                as.crud2.dateStat.init(tableOptions);
            }

            if (tableOptions.operations.comments) {
                as.crud2.comments.init(tableOptions);
            }

            $.each(tableOptions.operations.other, function (k, operation) {
                if (operation.linkClass && operation.callback) {
                    $(document).delegate("." + operation.linkClass, 'click', operation.callback);
                }
            });
        }
    }, 
    initCallbacks: function(){
        
        $(document).delegate('.crd2Sort', 'click', function (e) {
            e.preventDefault();
            as.crud2.sort($(this), e);
        });

        if(as.crud2.options.enableFrozenHeader){
            $(window).scroll(function (e) {
                var window = $(this);
                as.crud2.processScroll(window);
            });
            window.onresize = function (event) {
                $('.crd2Frozen').remove();
                var window = $(this);
                as.crud2.processScroll(window);
            };
            
        }

        $(document).delegate('.crd2FilterLink', 'click', function (e) {
            e.preventDefault();
            $('.crd2PredefinedFilterLink').removeClass('btn-warning');
            var g = as.crud2.getGuidByElement($(this));
            as.crud2.filter(g);
        });

        $(document).delegate('.crd2ResetFilterLink', 'click', function (e) {
            e.preventDefault();
            var cont = $(this).closest(".crd2FilterItems");
            $('input[type=text], input[type=number], input[type=date], textarea', cont).val('');
            $('select option', cont).removeAttr('selected');
            $('input[type=checkbox]:not(.activeReglament)', cont).removeAttr('checked');
            $('input[type=radio]', cont).removeAttr('checked');
        });        

        $(document).delegate('.crd2TypicalFilterLink', 'click', function (e) {
            e.preventDefault();
            as.crud2.showTypicalFiltersDialog($(this));
        });

        $(document).delegate('.crd2SaveTypicalFilter', 'click', function (e) {
            e.preventDefault();
            as.crud2.saveTypicalFilter($(this));
        });
        $(document).delegate('.crd2TypicalFilter', 'click', function (e) {
            e.preventDefault();
            as.crud2.setTypicalFilter($(this));
        });
        
        $(document).delegate('.crd2Remove', 'click', function (e) {
            e.preventDefault();
            as.crud2.removeItem($(this));
        });
       
        $(document).delegate('.crd2SelectAll', 'change', function (e) {
            $(this).closest('table').find('.crd2Select').prop("checked", $(this).prop("checked"));
            var tableOptions = as.crud2.getTableOptionsByElement($(this));

            as.crud2.updateGroupOperationsPanel(tableOptions);
        });

        $(document).delegate('.crd2Select', 'change', function (e) {
            var tableOptions = as.crud2.getTableOptionsByElement($(this));
            as.crud2.updateGroupOperationsPanel(tableOptions);
        });

        $(document).delegate('.crd2Select', 'click', function (e) {
            var tableOptions = as.crud2.getTableOptionsByElement($(this));
            as.crud2.updateGroupOperationsPanel(tableOptions);

            if (e.shiftKey && tableOptions.lastCheck) {
                var ind1 = $('.crd2Select', tableOptions.cont).index($(this));
                var ind2 = $('.crd2Select', tableOptions.cont).index(tableOptions.lastCheck);
                var min = ind1 >= ind2 ? ind2 : ind1;
                var max = ind1 >= ind2 ? ind1 : ind2;
                $('.crd2Select', tableOptions.cont).filter(':lt(' + max + ')').filter(':gt(' + min + ')').prop("checked", true);
            }
            if ($(this).is(":checked")) {
                tableOptions.lastCheck = $(this); // GAG вот здесь вопрос -подцепится ли значение в общую настройку
            } else {
                tableOptions.lastCheck = null;
            }
        });
        $(document).delegate('.crd2ItemLink', 'click', function (e) {
            e.preventDefault();
            var el = $(this);
            var code = $(this).closest("td").attr('data-code');
            var stop = false;
            var tableOptions = as.crud2.getTableOptionsByElement(el);

            $.each(tableOptions.cols, function (i, col) {
                if (stop) return;
                if (col.code == code) {
                    if (col.callback) col.callback(el);
                    stop = true;
                }
            });
        });

        $(document).delegate('.crd2Table>tbody>tr', 'click', function (e) {
            var tr = $(this);
            var tableOptions = as.crud2.getTableOptionsByElement(tr);
            if (tableOptions.ctrlClickShowComment) {
                if (e.ctrlKey == true) {
                    // показываем комменты
                    $('.crd2Comments', this).trigger('click');
                }
            }
        });

        $(document).delegate('.crd2FilterItem input[type=text], .crd2FilterItem input[type=number]', 'keyup', function (e) {
            if (e.which == 13) {
                var tableOptions = as.crud2.getTableOptionsByElement($(this));
                if(tableOptions.filterByEnterKey){
                    var cont = $(this).closest('.crd2FilterItems');
                    $('.crd2FilterLink', cont).trigger('click');
                }
            }
        });


           
            $(document).delegate('.crd2ShowExcelExport', 'click', function (e) {
                e.preventDefault();
                as.crud2.getItems({ isFirst: false, mode: "excel", g: $(this).closest("[data-g]").attr('data-g')});
            });
      
            $(document).delegate('.crd2PredefinedFilterLink', 'click', function (e) {
                e.preventDefault();
                var el = $(this);
                var code = $(this).attr('data-code');
                $('.crd2PredefinedFilterLink').removeClass('btn-warning');
                var tableOptions = as.crud2.getTableOptionsByElement(el);

                var filter = null;
                $.each(tableOptions.predefinedFilterLinks, function (i, item) {
                    if (item.code == code) filter = item.setFilter();
                });
                tableOptions.page = 1;
                as.crud2.getItems({isFirst: false, g: tableOptions.cont.attr('data-g'), mode: "", hardFilter: filter, callback: function () {
                    $('.crd2PredefinedFilterLink[data-code=' + code + ']').addClass("btn-warning");
                }});
           });

           $(document).delegate('.crd2Details', 'click', function (e) {
               e.preventDefault();
               as.crud2.showDetails($(this).closest("tr"));
           });
    },
    getTableOptions: function(g){
        var res= {};
        res = as.crud2.options.tables[g];
        return res;
    },
    getTableOptionsByElement: function (el) {
        var g = as.crud2.getGuidByElement(el);
        var tableOptions = as.crud2.getTableOptions(g);
        return tableOptions;
    },
    getGuidByElement: function(el){
        var cont = $(el).closest("[data-g]");
        return cont.attr("data-g");
    },
    getItems: function (options) {
        options = options || {};
        // options  - isFirst, mode, hardFilter, callback, g, cont
        var tableOptions = as.crud2.getTableOptions(options.g);
        params = as.crud2.getSelectParams(options.isFirst, options.hardFilter, tableOptions);

     
        params.mode= {};        
        params.mode.type = options.mode || ""; 
        params.mode.visibleCols = [];
        $(tableOptions.cont).find(">table>thead>tr>th:visible").each(function(){
            var val = $(this).attr('data-code');
            if(val) params.mode.visibleCols.push({ code: val, title: $(this).text() });
        });      

        if (!tableOptions.immediatelyLoad && options.isFirst) {
            var s = "";
            s += as.crud2.getTopPanel(tableOptions);
            s += as.crud2.getFilterMakeup(params.filter, options.isFirst, tableOptions);
            tableOptions.cont.html(s);
            if (tableOptions.getItemsCallback) tableOptions.getItemsCallback(tableOptions.cont, {});
            as.crud2.initTooltips();
            $('.crd2FilterItems input:first').focus();
            return;
        }
        var url = tableOptions.ajaxURLFormat.format("getItems") + (tableOptions.getItemsURLParameters || "");
        as.crud2.ajax({
            url: url,
            data: params,
            onSuccess: function (data) {
                if (data.msg) {
                    as.sys.bootstrapAlert(data.msg, { type: "warning" });
                }
                if (data.url) {
                    if (data.url.trim() != "#") {
                        location.href = data.url;
                    }
                    return;
                }
                var s = "";
                s += as.crud2.getTopPanel(tableOptions);              

                s += '<div  class="crd2Pagingwrapper crd2PagingwrapperUp"><div class="pagingcontainer">&nbsp;</div></div>';


                s += as.crud2.getFilterMakeup(params.filter, options.isFirst, tableOptions);
                s += as.crud2.getPredefinedFilterLinksMakeup(tableOptions);

                if (data.items.length > 0) {
                    s += "<table class='crd2Table table table-hover table-condensed table-stripped table-bordered'>";
                    s += "<thead><tr>";
                    if (tableOptions.showChecksCol) {
                        s += "<th><input type='checkbox' class='crd2SelectAll' /></th>";
                    }
                    if (tableOptions.showNumsCol) {
                        s += "<th>#</th>";
                    }
                    $.each(tableOptions.cols, function (j, col) {
                        var hide = "";
                        if (!col.isVisible) hide = " hide ";

                        var sorts = params.sort.split(",");
                        var sort1 = sorts.length > 0 ? sorts[0] : "";
                        var sort2 = sorts.length > 1 ? sorts[1] : "";

                        var directions = params.direction.split(",");
                        var direction1 = directions.length > 0 ? directions[0] : "";
                        var direction2 = directions.length > 1 ? directions[1] : "";

                        var selSortClass = "";
                        if (sort1 == col.code && direction1 == "up") {
                            selSortClass = "crd2SortUp";
                        }
                        if (sort1 == col.code && direction1 == "down") {
                            selSortClass = "crd2SortDown";
                        }

                        var selSortClass2 = "";
                        if (sort2 == col.code && direction2 == "up") {
                            selSortClass2 = "crd2SortUp2";
                        }
                        if (sort2 == col.code && direction2 == "down") {
                            selSortClass2 = "crd2SortDown2";
                        }

                        var headerName = col.isSort ?
                            ("<a class='crd2Sort' href='#' data-code='{0}'>{1}</a>").format(col.code, col.title)
                            : col.title;

                        s += ("<th class='crd2ItemHeader {0} {1} {2}' data-code='{3}' title='{4}' >{5}</th>")
                            .format(selSortClass, selSortClass2, hide, col.code, col.tooltip, headerName);
                    });
                    if (tableOptions.operations.remove) s += "<th></th>";
                    if (tableOptions.operations.comments) s += "<th></th>";
                    if (tableOptions.detailsCallback) s += "<th></th>";
                    if (tableOptions.operations.other.length > 0) s += "<th></th>";

                    s += "</tr></thead>";
                    s += "<tbody>";

                    $.each(data.items, function (i, item) {
                        var pkID = "";
                        var t = "";
                        if (tableOptions.showChecksCol) {
                            t += "<td><input type='checkbox' class='crd2Select' /></td>";
                        }
                        if (tableOptions.showNumsCol) {
                            t += ("<td>{0}</td>").format(((tableOptions.page - 1) * tableOptions.pageSize + i + 1));
                        }

                        $.each(tableOptions.cols, function (j, col) {
                            var hide = "";
                            if (!col.isVisible) hide = " hide ";
                            var name = item[col.code];
                            if (col.format) {
                                if (typeof col.format === "function") {
                                    name = col.format(item);
                                } else {
                                    name = col.format.format(name);
                                }
                                
                            }

                            if (col.callback) {
                                val = ("<a class='crd2ItemLink' href='#'>{0}</a>").format(name);
                            } else {
                                if (col.editable) {
                                    value = col.editable.type == "select" ? item[col.code + "ID"] : item[col.code];
                                    if (!value) value = item[col.code];

                                    var dataMin = "";
                                    if (col.editable.min) { dataMin = " data-min='" + col.editable.min + "' "; }
                                    var dataMax = "";
                                    if (col.editable.max) { dataMax = " data-max='" + col.editable.max + "' "; }
                                    var dataStep = "";
                                    if (col.editable.step) { dataStep = " data-step='" + col.editable.step + "' "; }

                                    val = ("<a class='crd2Editable' href='#' data-pk='{0}' data-type='{1}' data-format='{2}' " +
                                        " data-name='{3}' data-title='{4}' data-value='{5}' data-placement='{6}' {7} {8} {9}>{10}</a>")
                                        .format(pkID, col.editable.type, col.editable.format,
                                        col.code, col.title, value, (col.editable.placement || 'top'),
                                        dataMin, dataMax, dataStep, item[col.code]);
                                    if (col.format) {
                                        val = col.format.format(val);
                                    }

                                } else {
                                    val = name;
                                }

                            }
                            t += ("<td class='crd2Item {0}' data-code='{1}' title='{2}' >{3}</td>")
                                .format(hide, col.code, col.title, val);
                            if (col.isPK) pkID = item[col.code];

                        });

                        s += "<tr data-itemID='{0}' class='crd2Row'>".format(pkID);
                        s += t;
                        if (tableOptions.operations.remove) s += "<td><a href='#' class='crd2Remove' title='Удалить'><i class='fa fa-remove'></i></a></td>";
                        if (tableOptions.operations.comments) s += "<td><a href='#' class='crd2Comments' title='Комментарии'><i class='fa fa-comment'></i></a></td>";
                        if (tableOptions.detailsCallback) s += "<td><a href='#' class='crd2Details' title='Дополнительно'><i class='fa fa-info'></i></a></td>";
                        if (tableOptions.operations.other.length > 0) {
                            s += "<td>";
                            $.each(tableOptions.operations.other, function (k, operation) {
                                s += ("<a href='#' class='crd2OtherOperation {0}' title='{1}'><i class='{2}'></i></a>")
                                    .format(operation.linkClass, operation.title, operation.iconClass);
                            });
                            s += "</td>";
                        }
                        s += "</tr>";
                    });
                    s += "</tbody>";
                    s += "</table>";
                    s += '<div  class="crd2Pagingwrapper crd2PagingwrapperDown"><div class="pagingcontainer">&nbsp;</div></div>';
                } else {
                    s += "<div class='alert alert-info'>{0}</div>".format(tableOptions.emptyText);
                }
                tableOptions.cont.html(s);
                as.crud2.initTooltips();
                $('.crd2FilterItems input:first').focus();
                // для inline select заменяем элементы с name на id 
                $.each(tableOptions.cols, function (j, col) {
                    if (col.editable && col.editable.type == "select") {
                        $.each(col.editable.source, function (i, s) {
                            $('.crd2Editable[data-name=' + col.code + '][data-value=' + JSON.stringify(s.text) + ']').attr('data-value', s.value);
                        });
                    }
                });
               
                as.crud2.setPaging(params.page, params.pageSize, data.total, tableOptions);
                as.crud2.loadInlineEdit(tableOptions);
                $('.crd2Table>tbody>tr', tableOptions.cont).each(function () {
                    var tr = $(this);
                    as.crud2.setRowColor(tr);
                    if (tableOptions.processRowCallback) {
                        tableOptions.processRowCallback($(this));
                    }                        
                });
                    

                if (tableOptions.getItemsCallback) tableOptions.getItemsCallback(tableOptions.cont, data);
                if (options.callback) options.callback();

                if (options.isFirst) {
                    var parameters = as.tools.getUrlHashParameters();
                    $.each(parameters, function (i, item) {
                        if (item.name == "goto") as.crud2.gotoItem(parseInt(item.value), tableOptions);
                    })
                }

            }
        });
    },
    getSelectParams: function (isFirst, hardFilter, tableOptions) {
        var res = {
            page: tableOptions.page,
            pageSize: tableOptions.pageSize,
            filter: hardFilter ? hardFilter : as.crud2.getFilterValues(tableOptions)
        };

        var constantFilter = res.filter.constant;

        if(tableOptions.additionalSort){
            res.sort = tableOptions.sort + "," + tableOptions.sort2;
            res.direction = tableOptions.direction + "," + tableOptions.direction2;
        }else{
            res.sort = tableOptions.sort;
            res.direction = tableOptions.direction;
        }        

        var key = tableOptions.cookiePrefix + "selectParams_" + tableOptions.cont.attr('class');

        if (isFirst) {
            // если первичная загрузка - то считаем из хранилища
            var saveData = as.crud2.store.get(key);
            if (tableOptions.cookiePrefix && saveData && saveData.length > 0) {               
                res = JSON.parse(saveData) || {};               
            }
            var urlHashParapmeters = as.crud2.processParametersFromUrlHash();
            res = $.extend(res, urlHashParapmeters || {});            
            res.filter = (res.filter || {});
            res.filter.constant = constantFilter;         
        } else {
            // сохраняем в куки
            var dataToSave = JSON.stringify(res);
            as.crud2.store.set(key, dataToSave);
        }       
        return res;        
    },
    getFilterValues: function(tableOptions){
        var res = {};
        $.each(tableOptions.cols, function (i, col) {
            if (col.filter && col.filter.type && col.code) {
                var ctl = $('.crd2FilterItem[data-code=' + col.code + ']', tableOptions.cont);
                var val = as.makeup.getValueFromControlMakeup(col.filter.type, ctl);
                res[col.code] = val;
            }
        });
        res = $.extend(res, tableOptions.filter() || {});
        return res;
    },
    processParametersFromUrlHash: function () {
        var res = {}; 
        var parameters = as.tools.getUrlHashParameters();
        if (parameters.length > 0) res.filter = {}; // обнуляем фильтр если есть что то в хеше на первый раз
        for (var i = 0; i < parameters.length; i++) {
            var p = parameters[i];
            if (p && p.name) {
                switch (p.name) {
                    case "page": res.page = parseInt(p.value) || 1; break;
                    case "sort": res.sort = p.value || ""; break;
                    case "direction": res.direction = p.value || ""; break;
                    default: 
                        res.filter = res.filter || {};
                        res.filter[p.name] = p.value; 
                        break;                
                }               
            } 
        }
        return res;
    },
    setPaging: function (page, pagesize, total, tableOptions) {

        function initPagination() {
            $(".pagingcontainer", tableOptions.cont).pagination(total, {
                items_per_page: pagesize,
                callback: function (page_index, pagination_container) {

                    tableOptions.page = (parseInt(page_index) + 1);
                    as.crud2.getItems({
                        g: tableOptions.cont.attr('data-g'), callback: function () {
                            $('html, body').animate({
                                scrollTop: $(".crd2Table", tableOptions.cont).offset().top
                            }, 100);                            
                        }
                    });
                },
                prev_text: 'Назад',
                next_text: 'Вперед',
                num_display_entries: 10,
                num_edge_entries: 1,
                current_page: page - 1
            });
            var pagingcontainerwidth = tableOptions.cont.width();
           // $(".pagingcontainer", tableOptions.cont).css('width', '' + pagingcontainerwidth + 'px');
        }
        as.sys.loadLib("/JS/pagination/jquery.pagination.js", "/JS/pagination/pagination.css", $(".pagingcontainer", tableOptions.cont).pagination, initPagination);

    },
    sort: function (el, event) {
        var th = el.closest('th');
        var code = el.attr('data-code');
        var cont = el.closest("[data-g]");
        var g = cont.attr("data-g");
        var tableOptions = as.crud2.getTableOptions(g);

        if(tableOptions.additionalSort && event.altKey){  // additional sort
            tableOptions.sort2  = code;

             $('.crd2Table>thead>th',cont).removeClass("crd2SortUp2 crd2SortDown2");
            if (th.hasClass('crd2SortUp2')) {
                th.addClass('crd2SortDown2');
                tableOptions.direction2 = "down";
            } else {
                th.addClass('crd2SortUp2');
                tableOptions.direction2 = "up";
            }
        }else{   // simple sort
            tableOptions.sort = code;
            tableOptions.sort2 = "";
            tableOptions.direction2 = "";
            $('.crd2Table>thead>th', cont).removeClass("crd2SortUp2 crd2SortDown2");
            
            $('.crd2Table>thead>th', cont).removeClass("crd2SortUp crd2SortDown");
            if (th.hasClass('crd2SortUp')) {
                th.addClass('crd2SortDown');
                tableOptions.direction = "down";
            } else {
                th.addClass('crd2SortUp');
                tableOptions.direction = "up";
            }
        }      
        tableOptions.page = 1;
        as.crud2.getItems({ g: g});
    },
    getFilterMakeup: function (params, isFirst, tableOptions) {
        var s = "";
        s += "<div class='crd2FilterItems'>";

        s+= "<div class='crd2FilterItem' data-code=''>" + tableOptions.getFilterMakeup(params) + "</div>";
        s += as.crud2.appendColFilters(params, isFirst, tableOptions);


        s += "<div class='crd2FilterItem' data-code=''>" + 
            "<a href='#' class='crd2FilterLink btn btn-primary btn-xs' title='" + tableOptions.filterLinkTitle + "'><i class='fa fa-search'></i></a>"+
            "<a href='#' class='crd2ResetFilterLink btn btn-danger btn-xs' title='Сбросить'><i class='fa fa-remove'></i></a>" +
            "<a href='#' class='crd2TypicalFilterLink btn btn-default btn-xs' title='Предустановленные фильтры'><i class='fa fa-bars'></i></a>" +
            "</div>";
        
        s += "</div>";
        return s;
    },
    appendColFilters: function (params, isFirst, tableOptions) {
        var s = "";
        $.each(tableOptions.cols, function (i, col) {
            if (col.filter && col.filter.type) {
                s += "<div class='crd2FilterItem' data-code='{0}'>".format(col.code);
                var defValue = params ? params[col.code] || "" : "";
                var notSelectedIsAdded = col.filter.source &&  col.filter.source.length > 0 && col.filter.source[0].Value == 0;
                if (col.filter.notSelected && isFirst && !notSelectedIsAdded) {
                    col.filter.source.splice(0, 0, { Text: col.filter.notSelected, Value: 0 });
                }
                var cl = "";
                if (col.filter.type != "bool" && col.filter.type != "checkboxes" && col.filter.type != "html") {
                    cl = "form-control";
                }
                if (as.crud2.options.defaults.chosenSelect == true) {
                    if (cl.length > 0 && col.filter.type != "daterange")
                        cl += " chosen-select";
                    var selects = $('.crd2FilterItem').find('select');
                    if (selects.length > 0) {
                        $.each(selects, function (s, el) {
                            if (!$(el).hasClass('chosen-select')) {
                                $(el).addClass('chosen-select');
                            }
                        });
                    }
                }
                                
                var width = col.filter.width || 0;

                var ctl = as.makeup.getControlMakeupByDataType(col.filter.type, defValue, col.filter.source, cl, col.title, width );
                s += ctl;
                s += "</div>";
            }
        });
        return s;
    },
    filter: function (g) {        
        var tableOptions = as.crud2.getTableOptions(g);
        tableOptions.page = 1;
        as.crud2.getItems({ g: g });
    },
    getPredefinedFilterLinksMakeup: function (tableOptions) {
        var s = "";
        if (tableOptions.predefinedFilterLinks && tableOptions.predefinedFilterLinks.length > 0) {
            s += "<div class='crd2PredefinedFilters'>";
            for (var i = 0; i < tableOptions.predefinedFilterLinks.length; i++) {
                var item = tableOptions.predefinedFilterLinks[i];
                s +="<a href='#' class='crd2PredefinedFilterLink btn btn-default btn-xs' title='{0}' data-code='{1}' >{2}</a>"
                    .format((item.tooltip || ""), item.code, (item.title || "Filter"));
            }
            s += "</div>";
        }
        return s;
    },
    removeItem: function (btn) {
        var tableOptions = as.crud2.getTableOptionsByElement(btn)
        var itemID = btn.closest('tr').attr('data-itemID');
        if (confirm('Вы уверены, что хотите удалить?') == false) return false;
        var params = {
            id: itemID
        };
        var url = tableOptions.ajaxURLFormat.format("remove");
        
        as.crud2.ajax({
            url: url,
            data: params,
            onSuccess: function (data) {
                if (data.result) {
                    as.sys.bootstrapAlert(data.msg || "Элемент удален!", { type: 'success' });
                    btn.closest('tr').hide(100, function () { $(this).remove(); });
                } else {
                    as.sys.bootstrapAlert(data.msg || "Возникли ошибки при удалении элемента!", { type: 'danger' });
                }
            }
        });
    },
    getTopPanel: function (tableOptions) {
        var s = "";

        s += "<div class='row'>";
        s += "<div class='col-md-12'>";

        if (tableOptions.title) {
            s += "<h1 class='crd2Title'>";
            s += tableOptions.title;
            if (tableOptions.titleTooltip) {
                s += '<button type="button" class="btn btn-default btn-xs crd2TitleTooltip" data-toggle="tooltip" data-placement="bottom" title="{0}"><i class="fa fa-question"></i></button>'.format(tableOptions.titleTooltip);
            }
            s += "</h1>";
        }
        s += as.crud2.getToolbarMakeup(tableOptions);
        s += "</div>";
        s += "</div>";

        return s;
    },
    getToolbarMakeup: function (tableOptions) {
        var t = "";
        if (tableOptions.showToolbar) {
            t += "<div class='crd2Toolbar'>";
            
            if (tableOptions.toolbarAdditional) {
                t += tableOptions.toolbarAdditional;
            }

           
           
            if (tableOptions.showExcelExport) {
                t += "<a href='#' class='crd2ShowExcelExport btn btn-default'>Экспорт в Excel</a>";
            }           

            t+= "<div class='crd2GroupOperations hide'>";
            t += tableOptions.groupOperationsToolbar || '';
            t += "</div>";

            t += "</div>";
        }
        return t;
    },
    updateGroupOperationsPanel: function (tableOptions) {
        if ($('.crd2Select:checked', tableOptions.cont).length > 0) {
            $('.crd2GroupOperations', tableOptions.cont).removeClass('hide');
        } else {
            $('.crd2GroupOperations', tableOptions.cont).addClass('hide');
        }
    },
    loadInlineEdit: function (tableOptions) {
        if (tableOptions.inlineAjaxURL) {
            function initInlineEdit(response, newValue) {
                $('.crd2Editable', tableOptions.cont).editable({
                    url: tableOptions.inlineAjaxURL,
                    emptytext: "Не задано",
                    mode: 'popup', // inline
                    source: function () {
                        var td =  $(this).closest('td');
                        var code = td.attr('data-code');
                        var val = td.find(">.crd2Editable").text();                        
                        var col = as.crud2.getColByCode(code, tableOptions); 
                        var res = col.editable.source;
                        return res;
                    },
                    success: function (response, newValue) {
                        var code = $(this).closest('td').attr('data-code');
                        var col = as.crud2.getColByCode(code, tableOptions);
                        if (typeof (response.result) != "undefined") {
                            if (response.result == false) {
                                var errMsg = typeof (response.errMsg) != "undefined" ? response.errMsg : "Error text empty";
                                var errResult = "";
                                if (col.editable.errorCallback) col.editable.errorCallback($(this), errMsg, newValue);
                                else errResult = errMsg;
                                return errResult;
                            }
                        }
                        if (col.editable.callback) col.editable.callback($(this), newValue);
                    }
                });
            }




            setTimeout(function () {
                initInlineEdit();
            }, 400);

            // var countTryies = 0;
            // var timerId = setTimeout(function tick() {
                // countTryies++;
                // if (as.loadedEditable || countTryies > 19) {
                    // if (as.loadedEditable)
                        // initInlineEdit();
                // }
                // else {
                    // timerId = setTimeout(tick, 400);
                // }
            // }, 400);
        }
    },
    getColByCode: function (code, tableOptions) {
        var col = null;
        for (var i = 0; i <= tableOptions.cols.length; i++) {
            col = tableOptions.cols[i];
            if (col.code == code) {
                break;
            }
        }
        return col;
    },
    gotoItem: function (itemID, tableOptions) {
        var el = $('tr[data-itemID=' + itemID + ']', tableOptions.cont);
        if (el.length > 0) {
            $('html, body').animate({
                scrollTop: el.offset().top - 200
            }, 500);
            el.addClass('as-markedRow');
            setTimeout(function () { el.removeClass('as-markedRow') }, 3000);
        }
    },
    setRowColor: function (tr, clr) {
        var color = clr || $('td.crd2Item[data-code=color]', tr).text();
        if (!color) color = "transparent";
        $(tr).css("background-color", color);
    },
    label: function(code, value){
        var res = "";
        res = value;
        return res;
    },
    showDetails: function(tr){
        var tableOptions = as.crud2.getTableOptionsByElement(tr);
        var params = { id: tr.attr('data-itemID') };
        var url = tableOptions.ajaxURLFormat.format("details");
        as.crud2.ajax({
            url: url,
            data: params,
            onSuccess: function (data) {
                if (data.result) {
                    if (tableOptions.detailsCallback) {
                        var s = "";
                        s = tableOptions.detailsCallback(data);
                        as.sys.showDialog("Дополнительная информация", s, "", function () {
                        });
                    }
                } else {
                    as.sys.bootstrapAlert(data.msg || "Возникли ошибки при выполнении операции!", { type: 'danger' });
                }
            }
        });
    },
    processScroll: function(window){
        var top = window.scrollTop();
        if (top > 200) {
            if ($(".crd2Frozen").length == 0) {
                $("body").append("<div class='crd2Frozen'></div>");
                as.crud2.appendFrozenHeader();
            }
        } else {
            $(".crd2Frozen").hide(50, function () { $(this).remove(); })
        }
    },
    appendFrozenHeader: function(){
        var s = "";

        var cont = $("[data-g]:first");
        var tableCont = $(".crd2Table", cont);

        s += "<div class='crd2FrozenToolbar' style='position: relative; left: " + tableCont.offset().left + "px'>";
        s += "<h3>" + $(".crd2Title", cont).text() + "</h3>";
        s += "<div>"+$('.crd2Toolbar', cont).html()+"</div>";
        s += "</div>";

        

        s += "<table  style='position: relative; width: " + tableCont.css('width') + "; left: " + tableCont.offset().left + "px'>";
        s += "<thead><tr>";
        $(">thead>tr>th:visible", tableCont).each(function () {
            s += "<th width='"+($(this).css('width'))+"'>"+$(this).text()+"</th>";
        });
        s += "</tr></thead>";
        s += "</table>";
        $(".crd2Frozen").html(s);
    },
    typicalFilters: {
        getFilters: function (tableOptions) {
            var key = tableOptions.cookiePrefix + "typicalFilters";
            var res = [];
            var saveData = as.crud2.store.get(key);
            if (tableOptions.cookiePrefix && saveData && saveData.length > 0) {
                res = JSON.parse(saveData) || {};
            }
            return res || [];
        },
        saveFilters: function (filters, tableOptions) {
            var key = tableOptions.cookiePrefix + "typicalFilters";
            var dataToSave = JSON.stringify(filters);
            if (tableOptions.cookiePrefix){
                as.crud2.store.set(key, dataToSave);
            }
        }
    },
    showTypicalFiltersDialog: function(btn){
        var s = "";
        var tableOptions = as.crud2.getTableOptionsByElement(btn);
        var typicalFilters = as.crud2.typicalFilters.getFilters(tableOptions);

        s += "<div class='crd2TypicalFilterCont' data-g='" + tableOptions.cont.attr("data-g") + "'>";
        if (typicalFilters && typicalFilters.length) {
            s += "<div class='crd2FTypicalFilterItems'>";
            s += "<h4>Выбрать существующий фильтр</h4>";
            for (var i = 0; i < typicalFilters.length; i++) {
                var item = typicalFilters[i];
                s += "<a href='#' class='crd2TypicalFilter btn btn-xs btn-default' data-itemID='{1}'>{0}</a>"
                    .format(item.name, item.guid);
            }
            s += "</div>"; 
        }
        
        s += "<div class='crd2NewTypicalFilterCont'>";
        s += "<h4>Сохранить текущий фильтр</h4>";
        s += "<input type='text' class='crd2FNewTypicalFilter form-control' placeholder='Название фильтра' />";
        s += "<a href='#' class='crd2SaveTypicalFilter btn btn-default'>Сохранить фильтр</a>";
        s += "</div>";

        s += "</div>";
        setTimeout(function () { $('.crd2FNewTypicalFilter').focus(); }, 200);
        as.sys.showDialog("Предопределенные фильтры", s, "", function () {
            
        });
    },
    saveTypicalFilter: function (btn) {
        var g = btn.closest('.crd2TypicalFilterCont').attr('data-g');
       
        var tableOptions = as.crud2.getTableOptions(g);
        var typicalFilters = as.crud2.typicalFilters.getFilters(tableOptions);

        var name = $('.crd2FNewTypicalFilter').val();
        if (!name) {
            $('.crd2FNewTypicalFilter').focus();
            as.sys.bootstrapAlert("Укажите название фильтра", {type: "warning"});
            return;
        }

        var selectParams = as.crud2.getSelectParams(false, null, tableOptions);

     
        for (var i = 0; i < typicalFilters.length; i++) {
            if (typicalFilters[i].name == name) {
                $('.crd2FNewTypicalFilter').focus();
                as.sys.bootstrapAlert("Название фильтра уже существует. Выберите другое", { type: "warning" });
                return;
            }
        }

        var newFilter = {
            guid: as.tools.smallGuidGenerator(),
            name: name,
            selectParams: selectParams
        }
        typicalFilters.push(newFilter);
        as.crud2.typicalFilters.saveFilters(typicalFilters, tableOptions);
        as.sys.bootstrapAlert("Фильтр сохранен", { type: "success" });
        as.sys.closeDialog();
    },

    setTypicalFilter: function (btn) {
        var g = btn.closest('.crd2TypicalFilterCont').attr('data-g');

        var tableOptions = as.crud2.getTableOptions(g);
        var typicalFilters = as.crud2.typicalFilters.getFilters(tableOptions);

        var filterGuid = btn.attr('data-itemID');
        
        var filter = {};
        for (var i = 0; i < typicalFilters.length; i++) {
            if (typicalFilters[i].guid == filterGuid) {
                filter = typicalFilters[i];
                break;
            }
        }
        if (!filter.guid && !filter.selectParams) {
            as.sys.bootstrapAlert("Фильтр не найден", {type: "danger"});
            return;
        }

        var key = tableOptions.cookiePrefix + "selectParams_" + tableOptions.cont.attr('class');
        var dataToSave = JSON.stringify(filter.selectParams);
        if (tableOptions.cookiePrefix){
            as.crud2.store.set(key, dataToSave);
        }
        setTimeout(function () {
            as.crud2.getItems({ isFirst: false, g: g });
            as.sys.closeDialog();
        }, 200);
        
    },


    initTooltips: function () {
        $('[data-toggle="tooltip"]').tooltip({});
        $('.chosen-select').chosen({ no_results_text: "Не удалось найти", search_contains: true });
    },

    store: {
        get: function (key) {            
            return as.sys.store ? as.sys.store.get(key) : as.sys.getCookie(key);         
        },
        set: function (key, data) {
            as.sys.store ? as.sys.store.set(key, data) : as.sys.setCookie(key, data, 30);
        }
    },
    p: function (obj) {
        if(as.crud2.options.isDebug) console.log(obj);
    },
    ajax: function (options) {
        if (as.crud2.options.isDebug) as.crud2.p(options);
        if (as.sys.ajax) {
            as.sys.ajax(options);
        } else {
            as.sys.ajaxSend(options.url, options.data, options.onSuccess, options.noProgressBar, options.btn);
        }
    },
    formatValue: function (val) {
        var strVal = val + "";
        strVal = strVal.replace(/"/g, '\'').replace(/'/g, '\'');
        return strVal;
    }



};




as.crud2.comments = {
    options: {},
    init: function (options) {
       
        as.crud2.comments.options = $.extend(as.crud2.comments.options, options);
        $(document).delegate('.crd2Comments', 'click', function (e) {
            e.preventDefault();
            var btn = $(this);
            var tr = btn.closest('tr');
            if (tr.next().hasClass('crd2AddRow')) {
                tr.next().hide(50, function () { $(this).remove() });
            } else {
                as.crud2.comments.show(tr);               
            }
        });
        $(document).delegate('.crd2CommentAddLink', 'click', function (e) {
            e.preventDefault();
            var cont = $(this).closest(".crd2CommentsCont");
            var text = $('.crd2CommentText', cont).val();
            if (!text) {
                $('.crd2CommentText', cont).focus();
                return;
            }

            as.crud2.comments.addComment(cont, text);
        });
        $(document).delegate('.crd2CommentText', 'keyup', function (e) {
            e.preventDefault();
            var isEnter = e.which == 13;
            if (isEnter) {
                var btn = $(this).parent().find(".crd2CommentAddLink");
                btn.trigger('click');
            }            
        });        
        $(document).delegate('.as-crud2-tags .as-cmt-notifyTag', 'click', function (e) {
            e.preventDefault();
            var cont = $(this).closest('.crd2CommentsCont');
            var s = "";
            s += "<div class='as-cmt-notifyCont'>";
            s += "<span>Укажите дату или количество дней</span>";
            s += "<input type='text' class='as-cmt-notifyDate form-control' value='7' />";


            s += "</div>";

            as.sys.showDialog("Уведомление", s, "ОК", function () {
                var val = $('.as-cmt-notifyDate').val();
                var dt = val;
                if ($.isNumeric(val)) {
                    var date = new Date();
                    date.setDate(date.getDate() + parseInt(val));
                    dt = as.crud2.comments.formatDate(date);
                }
                var text = "#notify" + dt;


                var textarea = $(cont).find("textarea");
                $(textarea).val(textarea.val() + (textarea.val() ? '\n' : '') + text + ' ').focus();

                as.sys.closeDialog();
            }, true);
            setTimeout(function () {
                $('.as-cmt-notifyDate').datepicker({ showOn: 'button', dateFormat: "yy-mm-dd" }).focus();
            }, 300);

        });
        $(document).delegate('.as-cmt-tag', 'click', function (e) {
            if (e) e.preventDefault();
            var tag = $(this);
            var textarea = $(tag).closest(".crd2CommentsCont").find("textarea");
            $(textarea).val(textarea.val() + ($(textarea).val() != "" ? '\n' : '') + $(tag).text() + ' ').focus();
        
        });



    },
    formatDate: function (date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    },
    show: function (tr) {
        var tableOptions = as.crud2.getTableOptionsByElement(tr);
        as.crud2.comments.getComments(tr, function (m) {
            $("<tr class='crd2AddRow'><td colspan='" + tableOptions.cont.find("th:visible").length + "'>" + m + "</td></tr>").insertAfter(tr);

            setTimeout(function () {
                var nextTR = tr.next();
                $('html, body').animate({
                    scrollTop: $('.crd2CommentText', nextTR).offset().top - 300
                }, 300);
                $('.crd2CommentText', nextTR).focus();
            }, 100);
        });
    },
    getComments: function (tr, callback) {
        var params = {
            itemID: tr.attr('data-itemID')
        };
        var tableOptions = as.crud2.getTableOptionsByElement(tr);

        var url = tableOptions.ajaxURLFormat.format("getComments");
        
        as.crud2.ajax({
            url: url,
            data: params,
            onSuccess: function (data) {
                if (data.result) {
                    var s = [];
                    s.push("<div class='crd2CommentsCont' data-itemID='" + params.itemID + "'>");
                    s.push("<table class='crd2CommentsTable table table-bordered table-hover table-striped'>");
                    s.push("<thead><tr><th width='150px'>Дата</th><th width='120px'>Кто</th><th>Комментарий</th></tr></thead>");
                    s.push("<tbody>");

                    if (data.items.length > 0) {
                        $.each(data.items, function (i, item) {
                            var itemMakeup = as.crud2.comments.getItemMakeup(item);
                            s.push(itemMakeup);
                        });
                    } else {
                        s.push("<tr><td colspan='3'><div class='alert alert-info crd2NoComments'>Нет комментариев</div></td></tr>");
                    }
                    s.push("</tbody>");
                    s.push("</table>");
                    s.push("<h5>Добавление комментария</h5>");
                    s.push("<textarea class='crd2CommentText'></textarea>");
                    s.push("<a href='#' class='btn btn-primary btn-sm crd2CommentAddLink'>Написать</a>");

                    var t = "";
                    if (as.crud2.comments.options.notifyTag) {
                       t+="<a href='#' class='as-cmt-notifyTag badge' style='background:#333' title='Создать для себя уведомление'>#уведомление</a>";
                    }

                    if (as.crud2.comments.options.commentMarkers && as.crud2.comments.options.commentMarkers.length) {
                        $.each(as.crud2.comments.options.commentMarkers, function (i, item) {
                            t+= "<a href='#' class='as-cmt-tag badge' data-tag='" + item.tag + "' title='" + item.tile + "' style='background-color:" + item.color + "'>" + item.tag + "</a>";
                        });
                    }
                    if (t != "") {
                        s.push("<div class='as-crud2-tags'>"+t+ "</div>");

                    }

                    s.push("</div>");
                    if (callback) {
                        callback(s.join(""));
                    }
                } else {
                    as.sys.bootstrapAlert(data.msg || "Возникли ошибки при излечении комментариев!", { type: 'danger' });
                }
            }
        });
    },
    getItemMakeup: function (item) {
        var res = "";
        res = "<tr data-itemID='" + item.id + "'><td>" + item.created + "</td><td>" + item.username + "</td><td>" + item.text.replace(/\n/g, "<br />") + "</td></tr>";
        return res;
    },
    addComment: function (cont, text) {
        var tableOptions = as.crud2.getTableOptionsByElement(cont);

        var params = {
            itemID: cont.attr('data-itemID'),
            text: text
        };

        var url = tableOptions.ajaxURLFormat.format("addComment");
        
        as.crud2.ajax({
            url: url,
            data: params,
            onSuccess: function (data) {
                if (data.result) {
                    var itemMakeup = as.crud2.comments.getItemMakeup(data.item);
                    $('.crd2NoComments', cont).hide(100, function () {
                        $(this).remove();
                    });
                    $(cont).find(".crd2CommentsTable>tbody").append(itemMakeup);
                    $('.crd2CommentText', cont).val('');
                } else {
                    as.sys.bootstrapAlert(data.msg || "Возникли ошибки при излечении комментариев!", { type: 'danger' });
                }
            }
        });
    }
}

