using as_Emails.BLL;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace as_Emails.Controllers
{
    public class AsEmailController : Controller
    {
        public EmailManager mng = new EmailManager(EmailManager.DefaultSettings);

        public ActionResult asSend(string code, Dictionary<string, string> parameters)
        {
            var res = false;
            var msg = "";

            if (code != null && parameters != null)
            {
                res = mng.Send(code, parameters, out msg);
            }

            var json = JsonConvert.SerializeObject(new
            {
                result = res, msg
            });
            return Content(json, "application/json");
        }
    }
}