var as = as || {};

as.makeup = {

    getControlMakeupByDataType: function (typecode, defValue, valuesForSelect, cl) {
        var ctl = "";
        switch (typecode) {
            case "string":
                ctl = "<input "+(cl ? " class='"+cl+"' " : "")+" type='text' value='" + (defValue || "") + "' />";
                break;
            case "int":
                ctl = "<input type='text' class='asInt " +cl + "' value='" + (defValue || "") + "' />";
                break;
            case "phone":
                ctl = "<input type='text' class='asPhone " + cl + "' value='" + (defValue || "+7(9") + "' autocomplete='off' />";
                break;
            case "email":
                ctl = "<input type='text' class='asEMail " + cl + "' value='" + (defValue || "") + "' />";
                break;
            case "float":
                ctl = "<input type='text' class='asFloat " + cl + "' value='" + (defValue || "") + "' />";
                break;
            case "date":
                ctl = "<input type='text' class='asDatepicker " + cl + "' value='" + (defValue || "") + "' />";
                break;
            case "bool":
                var guid = as.tools.guidGenerator();
                var ch = "";
                if (defValue == "1" || defValue == "True" || defValue == "true" || defValue == "Скачено") {
                    ch = " checked='checked' ";
                }
                ctl = "<input " + (cl ? " class='" + cl + "' " : "") + " type='checkbox' " + ch + " id='ch" + guid + "'  /><label style='display:none' for='ch" + guid + "'>&nbsp; " + name + "</label>";
                break;
            case "html":
                ctl = "<textarea cols='40' rows='10' class='as-html " + cl + "' >" + defValue + "</textarea>";
                break;
            case "text":
                ctl = "<textarea " + (cl ? " class='" + cl + "' " : "") + " cols='40' rows='10' >" + defValue + "</textarea>";
                break;
            case "select":
                ctl = "<select " + (cl ? " class='" + cl + "' " : "") + ">";
                $.each(valuesForSelect, function (i, item) {
                    var sel = "";
                    if (item.Selected && defValue == "" || defValue != "" && defValue == item.Value ||
                        !as.tools.isInt(defValue) && defValue == item.Text) {
                        sel = " selected='selected' ";
                    }
                    ctl += "<option value='" + item.Value + "' " + sel + ">" + item.Text + "</option>";
                })
                ctl += "</select>";
                break;
            case "checkboxes":
                ctl = "<div class='as-checkboxes'>";
                $.each(valuesForSelect, function (i, item) {
                    var sel = "";
                    // defValue is array of values                  
                    if ($.inArray(item.Value.toString(), defValue) !== -1) {
                        sel = " checked='checked' ";
                    }
                    var g = as.tools.smallGuidGenerator(4);
                    ctl += "<input " + (cl ? " class='" + cl + "' " : "") + " type='checkbox' value='" + item.Value + "' " + sel + " id='crdCheck" + guid + "' /><label for='crdCheck" + guid + " id='lbl' '>" + item.Text + "</label>";
                })
                ctl += "</div>";
                break;
            case "daterange":
                ctl = "<input type='text' class='as-daterange "+cl+"' value='" + (defValue||"") + "' />";
                break;
        }
        return ctl;
    },
    getValueFromControlMakeup: function (typecode, ctl) {
        var res = "";
        switch (typecode) {
            case "string":
            case "int":
            case "float":
            case "date":
            case "daterange":
                res = ctl.find("input[type=text]").val();
                break;
            case "bool":
                res = ctl.find("input[type=checkbox]").is(":checked");
                break;

            case "text":
                res = ctl.find("textarea").val();
                break;
            case "html":
                var mce = tinyMCE.get(ctl.find("textarea").attr('id'));
                res = mce.getContent();
                break;
            case "select":
                res = ctl.find("select option:selected").val();
                break;
            case "checkboxes":
                var res = [];
                ctl.find("input:checked").each(function () {
                    res.push($(this).val());
                });
                break;
        }
        return res;
    },
    getSelectMakeup: function (cl, items, sel, notSelectedText) {
        var s = [];
        s.push("<select class='" + cl + "'>");
        if(notSelectedText){
            s.push("<option value='0'>"+notSelectedText+"</option>");
        }
        for (var i = 0; i <= items.length; i++) {
            var item = items[i];
            var selected = "";
            if (sel == item.value) {
                sel = " selected='selected' ";
            }
            s.push("<option "+selected+" value='"+item.value+"'>"+item.text+"</option>");
        }
        s.push("</select>");
        return s.join("");
    },
    // http://getbootstrap.com/components/#breadcrumbs
    // breadcrumbs pagination  Carousel tabs collapsible

    getTabsMakeup: function (options) {
        //options.id = "myTabs"
        // options.items = элементы { header, content, active }
        var s = [];
        var id = (options.id!=''?options.id:"asTabs");
       
        s.push(" <ul class='nav nav-tabs' id='"+id+"'>");
        for(var i=0;i<options.items.length;i++)
        {
            s.push("<li "+(options.items[i].active?" class='active' ":"") +"><a href='#"+id+"Item"+i+"'>"+options.items[i].header+"</a></li>");
        }
        s.push("</ul>");
        s.push("<div class='tab-content'>");
        for(var i=0;i<options.items.length;i++)
        {
            s.push("<div class='tab-pane "+(options.items[i].active?" active":"")+"' id='"+id+"Item"+i+"'>"+options.items[i].content+"</div>");
        }
        s.push("</div>");
          
        

        return s.join("");    
    },
    setPaginationMakeup: function (options) {
        //options.selector
        //options.params{
            //    size: "small",
            //    bootstrapMajorVersion: 3,
            //    currentPage: 3,
            //    numberOfPages: 5,
            //    totalPages: 11
            //};
        var element = $(options.selector);
        element.bootstrapPaginator(options.params);


      
    },
    getCarouselMakeup: function (options) {
        //item.id = "myCarousel"
        //options.items = элементы { content, active }
        var s = [];
        var id = (options.id!=''?options.id:"asCarousel");
            s.push(" <div id='"+id+"' class='carousel slide'>");
            s.push(" <div class='carousel-inner'>");
            for(var i=0;i<options.items.length;i++)
            {
                s.push("<div class='"+(options.items[i].active?" active":"")+" item'>"+options.items[i].content+"</div>");
            }
            s.push("<a class='carousel-control left' href='#"+id+"' data-slide='prev'>&lsaquo;</a>");
            s.push("<a class='carousel-control right' href='#"+id+"' data-slide='next'>&rsaquo;</a>");
            s.push("</div>");
        return s.join("");    
    },
    getBreadcrumbsMakeup: function (options) {
        //item.id = "myBreadcrumb"
        //options.items = элементы { href,header, active }
        var s = [];
        var id = (options.id != '' ? options.id : "asBreadCrumb");

        s.push("<ol class='breadcrumb' id=" + id + ">");
        for (var i = 0; i < options.items.length; i++) {
            s.push("<li " + (options.items[i].active ? " class='active' " : "") + "><a href='#" + options.items[i].href + "'>" + options.items[i].header + "</a></li>");
        }
        s.push("</ol>");

        return s.join("");
    },

    getCollapsibleMakeup: function (options) {
        //item.id = "myBreadcrumb"
        //options.items = элементы { href,header,content }
        var s = [];
        var id = (options.id != '' ? options.id : "asCollapsible");

        s.push("<div class='accordion' id='"+id+"'>");
        for (var i = 0; i < options.items.length; i++) {
            s.push("<div class='accordion-group'>");
            s.push("<div class='accordion-heading'>");
            s.push("<a class='accordion-toggle' data-toggle='collapse' data-parent='#"+id+"' href='#"+options.items[i].href+"'>");
            s.push(options.items[i].header);
            s.push("</a>");
            s.push("</div>");
            s.push("<div id='collapseOne' class='accordion-body collapse in'>");
            s.push("<div class='accordion-inner'>");
            s.push(options.items[i].content);
            s.push("</div>");
            s.push("</div>");
            s.push("</div>");
        }
        s.push("</div>");


        return s.join("");
    },

    getDropdownMakeup: function (options) {
        //item.id = "myDropdown"
        //item.name = "Меню"
        //options.items = элементы { name,href} || элементы { name='divider',href=''}
        //
        var s = [];
        var id = (options.id != '' ? options.id : "asDropdown");

        s.push("<ul class='nav nav-pills'> id='"+id+"'");
        //s.push("<li class='active'><a href='#'>Ссылка</a></li>");
        s.push("<li class='dropdown'>");
        s.push("<a class='dropdown-toggle' data-toggle='dropdown' href='#'>"+options.name+"<b class='caret'></b></a>");
        s.push("<ul id='"+options.id+"_menu' class='dropdown-menu'>");
        for (var i = 0; i < options.items.length; i++) {
            if(options.items[i].name != 'divider')
            {
                s.push("<li><a href='"+options.items[i].href+"'>"+options.items[i].name+"</a></li>");
            }
            else
            {
                s.push(" <li class='divider'></li>");
            }
           
        }
        s.push("</ul>");
        s.push("</li>");
        s.push("</ul>");

        return s.join("");
    },

};