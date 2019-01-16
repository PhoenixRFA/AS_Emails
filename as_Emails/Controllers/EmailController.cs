using as_Emails.BLL;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;

namespace as_Emails.Controllers
{
    public class EmailController : Controller
    {
        public EmailManager mng = new EmailManager();

        public ActionResult showMessage(string code, Dictionary<string, string> parameters)
        {
            var msg = "";
            Models.EmailItem res = null;

            if (code != null && parameters != null)
            {
                res = mng.ShowMessage(code, parameters, out msg);
            }

            var json = JsonConvert.SerializeObject(new
            {
                result = res == null ? false : true,
                msg,
                email = res == null ? null : new { res.code, res.from, res.to, caption = res.subject, body = res.template }
            });
            return Content(json, "application/json");
        }

        public ActionResult send(string code, string from, string to, string subject, string body)
        {
            var res = false;
            var msg = "";

            res = mng.Send(code, out msg, to, from, subject, body);

            var json = JsonConvert.SerializeObject(new
            {
                result = res, msg
            });
            return Content(json, "application/json");
        }
    }
}