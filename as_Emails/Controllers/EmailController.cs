using as_Emails.BLL;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Web.Mvc;

namespace as_Emails.Controllers
{
    public class EmailController : Controller
    {
        #region MyEmailManager
        public MyEmailManager myMng = new MyEmailManager(new Models.EmailSettings { Host = "smtp.google.com", Port = 465, UserName = "g_User", Password = "qwerty", DisplayName = "Anon" });
        
        public ActionResult someMethod()
        {
            var msg = "";

            var item = myMng.ShowMessage("", null, out msg);
            myMng.Send("",out msg, "+7888124567", "+7888124567", "", "Text");

            return Json(new { item });
        }
        #endregion

        public EmailManager mng = new EmailManager();

        public ActionResult ShowMessage(string code, Dictionary<string, string> parameters)
        {
            var msg = "";
            Models.EmailItem res = null;

            if (code != null && parameters != null)
            {
                res = mng.ShowMessage(code, parameters, out msg);
            }

            var result = res == null ? false : true;
            var json = JsonConvert.SerializeObject(new
            {
                result,
                msg,
                email = result ? new { res.code, res.from, res.to, caption = res.subject, body = res.template } : null
            });
            return Content(json, "application/json");
        }

        public ActionResult Send(string code, string from, string to, string subject, string body)
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