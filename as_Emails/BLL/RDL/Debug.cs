using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using System.Net.Mail;
using System.Net;
using System.Collections;
using System.IO;
using System.Diagnostics;
using arkAS.BLL.Core;
using System.Text;
using System.Reflection;


namespace RDL
{
    public abstract class Debug
    {
        public Debug() { }
        public static bool EnableErrorLogEmail = true;
        public static string ErrorLogEmailTo {
            get
            {
                var res = "";
                try
                {
                    res = ConfigurationManager.AppSettings.AllKeys.Count(x => x == "errorEmails") > 0 ? ConfigurationManager.AppSettings["errorEmails"] : "";
                }
                catch (Exception ex)
                {

                }
                return res;
            }        
        }
        public static string SiteName
        {
            get
            {
                var res = "";
                try
                {
                    res = ""; // CMSProvider.GetSiteDomainName();
                }
                catch (Exception ex)
                {

                }
                return res;
            }
        }
        public static int TraceFileMaxSize = 5;

        

        public static void LogError(Exception ex, string additional="", object parameters = null)
        {
            if (HttpContext.Current.Request.IsLocal || HttpContext.Current.Request.Url.Host == "devark.web-automation.ru")
                return;

            if (ex.InnerException != null) ex = ex.InnerException;

            // get the current date and time
            string dateTime = DateTime.Now.ToLongDateString() + " "
            + DateTime.Now.ToShortTimeString();
            // stores the error message
            System.Web.HttpContext context = System.Web.HttpContext.Current;
            string errorMessage = "<br><b>Страница:</b> " + context.Request.Url.Host+ context.Request.RawUrl;
            // build the error message
            errorMessage += "<br><b>Сообщение:</b> " + ex.Message + "<br /><hr /><br />";
                errorMessage += "<b>Время возникновения ошибки:</b> " + dateTime;
            // obtain the page that generated the error
            errorMessage += "<br><b>Источник:</b> " + ex.Source;
            errorMessage += "<br><b>Метод:</b> " + ex.TargetSite;
            errorMessage += "<br>Дополнительно: " + additional;
          
            errorMessage += "<br><b>Стек трассировки:</b><br>" + ex.StackTrace;

            if (parameters != null)
            {
                errorMessage += DumpProperties(parameters);
            }
            // собираем информацию о контексте
            try
            {
                HttpContext cnt = HttpContext.Current;

                errorMessage += "<br><hr />";
                errorMessage += "<br><b>Полный путь:</b> " + cnt.Request.Url.ToString();
                errorMessage += "<br><b>Пользователь:</b> " + (cnt.User.Identity.Name != "" ? cnt.User.Identity.Name : "Не аутентифицирован");
                errorMessage += "<br><b>Браузер:</b> " + cnt.Request.Browser.Type;
                errorMessage += "<br><b>Версия браузера:</b> " + cnt.Request.Browser.Version;
                errorMessage += "<br><b>Поисковый робот:</b> " + (cnt.Request.Browser.Crawler ? "Да" : "Нет");
            }
            catch
            { }
            if (HttpContext.Current.Request["q111"] != null)
            {
                HttpContext.Current.Response.Write(errorMessage);
            }
            var mng2 = new TraceManager();
            mng2.Warn(ex.Message + " " + additional, errorMessage + " " + context.Request.Url.Host + " " + context.Request.RawUrl, 0, "exception");
      
            try
            {   
                if (EnableErrorLogEmail)
                {
                    if (context.Request.RawUrl.IndexOf("/favicon.ico", StringComparison.CurrentCultureIgnoreCase) >= 0) return;
                    string subject = "Ошибка на  сайте " + SiteName;
                    string body = errorMessage;

                    
                    var emails = ErrorLogEmailTo.Split(new char[]{ ',' });
                    List<MailAddress> addrs = new List<MailAddress>();
                    foreach (var m in emails) {
                        if (!String.IsNullOrEmpty(m)) {
                            addrs.Add( new MailAddress(m.Trim()));
                        }
                    }
                    var mng = new CoreManager();
                    mng.SendEmail(addrs, subject, body);                    
                }
            }
            catch (Exception ex11)
            {

            }
        }
        public static void P(string text)
        {
            HttpContext.Current.Response.Write(text + "<br />");
        }
        public static string DumpProperties(object Object)
        {
            try
            {
                StringBuilder TempValue = new StringBuilder();
                TempValue.Append("<table><thead><tr><th>Property Name</th><th>Property Value</th></tr></thead><tbody>");
                Type ObjectType = Object.GetType();
                PropertyInfo[] Properties = ObjectType.GetProperties();
                foreach (PropertyInfo Property in Properties)
                {
                    TempValue.Append("<tr><td>" + Property.Name + "</td><td>");
                    ParameterInfo[] Parameters = Property.GetIndexParameters();
                    if (Property.CanRead && Parameters.Length == 0)
                    {
                        try
                        {
                            object Value = Property.GetValue(Object, null);
                            TempValue.Append(Value == null ? "null" : Value.ToString());
                        }
                        catch { }
                    }
                    TempValue.Append("</td></tr>");
                }
                TempValue.Append("</tbody></table>");
                return TempValue.ToString();
            }
            catch (Exception e)
            {
                return e.ToString();
            }
        }
        public static void ProcessStackTrace()
        {
            // пока не используется
            System.Diagnostics.StackTrace callStack = new System.Diagnostics.StackTrace();
            System.Diagnostics.StackFrame frame = null;
            System.Reflection.MethodBase calledMethod = null;
            System.Reflection.ParameterInfo[] passedParams = null;
            for (int x = 0; x < callStack.FrameCount; x++)
            {
                frame = callStack.GetFrame(x);
                calledMethod = frame.GetMethod();
                passedParams = calledMethod.GetParameters();
                foreach (System.Reflection.ParameterInfo param in passedParams)
                    HttpContext.Current.Response.Write(param.ToString() + " " + param.DefaultValue + " " + param.RawDefaultValue + "<br />");
            }
        }
        public static bool WriteToTraceFile(string text)
        {
            bool result = true;
            StreamWriter sw;
            string path = HttpContext.Current.Server.MapPath("~/uploads/SiteTrace.txt");
            try
            {
                FileInfo ff = new FileInfo(path);
                if (ff.Exists)
                {
                    long length = ff.Length / 1024 / 1204; // in mb
                    if (length > TraceFileMaxSize)  // файл не должен быть более 5 Мб
                    {
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {

            }

            sw = File.AppendText(path);
            try
            {
                string line = DateTime.Now.ToString() + "         " + text;
                sw.WriteLine(line);
            }
            catch
            {
                result = false;
            }
            finally
            {
                sw.Close();
            }
            return result;
        }
    } 
}