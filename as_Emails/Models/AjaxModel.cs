using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace as_Emails.Models
{

    public class AjaxModel
    {
        public static Dictionary<string, object> GetAjaxParameters(HttpContextBase context)
        {
            var res = new Dictionary<string, object>();
            context.Request.InputStream.Seek(0, SeekOrigin.Begin);
            String jsonString = new StreamReader(context.Request.InputStream).ReadToEnd();
            var js = new JavaScriptSerializer();
            res = js.Deserialize<Dictionary<string, object>>(jsonString);
            return res;
        }

        public static string GetAjaxParameter(string key, IDictionary<string, object> parameters)
        {
            var res = "";
            if (parameters.ContainsKey(key) && parameters[key] != null)
            {
                res = parameters[key].ToString();
            }
            return res;
        }

        public static ASCRUDGetItemsModel GetParameters(HttpContextBase context)
        {
            var data = GetAjaxParameters(context);
            var res = new ASCRUDGetItemsModel();
            if (data != null)
            {
                res.page = RDL.Convert.StrToInt(data["page"].ToString(), 1);
                res.pageSize = RDL.Convert.StrToInt(data["pageSize"].ToString(), 10);
                res.sort = data["sort"].ToString();
                res.direction = data["direction"].ToString();
                res.mode = (object)data["mode"] as Dictionary<string, object>;
                res.filter = (object)data["filter"] as Dictionary<string, object>;
            }
            return res;
        }

        

        public static object GetFilterParameter(HttpContextBase context, string name)
        {
            string res = context.Request.Form[name];
            if (res == null) res = "";
            return res;
        }

        public static string GetValueFromSaveField(string name, List<Dictionary<string, object>> fields)
        {
            var res = "";
            try
            {
                res = fields.FirstOrDefault(x => x.Any(y => y.Key == "code" && y.Value.ToString() == name))["value"].ToString();
            }
            catch (Exception ex) {
                //RDL.Debug.LogError(ex);
            }
            return res;
        }
    }

    public class ASCRUDGetItemsModel {
        public int page { get; set; }
        public int pageSize { get; set; }
        public string sort { get; set; }
        public string direction { get; set; }
        public Dictionary<string, object> filter { get; set; }
        public Dictionary<string, object> mode { get; set; }
    
    }

    public class DateStatItemModel
    {
        public string periodName { set; get; }
        public string period { set; get; }
        public string from { set; get; }
        public string to { set; get; }
        public List<string> values { set; get; }
    }

}
