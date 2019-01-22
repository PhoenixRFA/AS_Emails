using as_Emails.BLL;
using as_Emails.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace as_Emails.Controllers
{
    public class EmailController : Controller
    {
        public IEmailManager mng = new EmailManager();

        public ActionResult ShowMessage(string code, Dictionary<string, string> parameters)
        {
            EmailItem res = null;
            var msg = "";

            if (code != null && parameters != null)
            {
                res = mng.ShowMessage(code, parameters, out msg);
            }

            var result = res != null;
            return Json(new {
                result,
                msg,
                email = result ? new { res.code, res.from, res.to, caption = res.subject, body = res.template } : null
            });
        }

        public ActionResult Send(string code, string from, string to, string subject, string body)
        {
            var res = false;
            var msg = "";

            res = mng.Send(code, out msg, to, from, subject, body);

            return Json(new
            {
                result = res,
                msg
            });
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetItems()
        {
            var parameters = AjaxModel.GetParameters(HttpContext);
            var msg = "";
            
            var items = mng.GetAllTemplates(out msg);

            if (parameters.filter != null && parameters.filter.Count > 0)
            {
                var code = parameters.filter.ContainsKey("code") ? parameters.filter["code"].ToString() : "";

                items = items.Where(x => x.code.Contains(code));
            }

            var sorts = parameters.sort.Split(",".ToArray(), StringSplitOptions.RemoveEmptyEntries);
            var directions = parameters.direction.Split(",".ToArray(), StringSplitOptions.RemoveEmptyEntries);
            var sort1 = sorts.Length > 0 ? sorts[0] : "";
            var direction1 = directions.Length > 0 ? directions[0] : "";

            switch (sort1)
            {
                case "from":
                    if (direction1 == "up") items = items.OrderBy(x => x.code);
                    else items = items.OrderByDescending(x => x.code);
                    break;
                case "to":
                    if (direction1 == "up") items = items.OrderBy(x => x.code);
                    else items = items.OrderByDescending(x => x.code);
                    break;
                case "subject":
                    if (direction1 == "up") items = items.OrderBy(x => x.subject);
                    else items = items.OrderByDescending(x => x.subject);
                    break;
                case "cc":
                    if (direction1 == "up") items = items.OrderBy(x => x.cc);
                    else items = items.OrderByDescending(x => x.cc);
                    break;
                case "bcc":
                    if (direction1 == "up") items = items.OrderBy(x => x.bcc);
                    else items = items.OrderByDescending(x => x.bcc);
                    break;
                default:
                case "code":
                    if (direction1 == "up") items = items.OrderBy(x => x.code);
                    else items = items.OrderByDescending(x => x.code);
                    break;
            }

            var total = items.Count();
            var res = items.Skip(parameters.pageSize * (parameters.page - 1)).Take(parameters.pageSize).ToList();


            return Json(new
            {
                result = items == null,
                items = res,
                total,
                msg
            });
        }

        public ActionResult CreateItem(string code, string from, string to, string caption, string template, string cc, string bcc)
        {
            bool res;
            var msg = "";

            res = mng.CreateNewMail(new EmailItem {code=code, from=from, to=to, subject=caption, template=template, cc=cc, bcc=bcc }, out msg);

            return Json(new {
                result = res,
                msg
            });
        }

        public ActionResult EditItem(int pk, string name, [ModelBinder(typeof(AllowHtmlBinder))] string value)
        {
            bool res;
            var msg = "";

            res = mng.EditMail(pk, name, value, out msg);

            return Json(new
            {
                result = res,
                msg
            });
        }

        public ActionResult Remove(int id)
        {
            bool res;
            var msg = "";

            res = mng.DeleteMail(id, out msg);

            return Json(new {
                result = res,
                msg
            });
        }
    }
}