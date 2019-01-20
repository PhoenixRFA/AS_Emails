using System;

namespace RDL
{
    using System.Globalization;

    public abstract class Convert
    {
        public static int StrToInt(string input, int defaultVal)
        {
            int res;
            if (!string.IsNullOrEmpty(input) && int.TryParse(input, out res))
            {
                return res;
            }

            return defaultVal;
        }
        public static bool StrToBoolean(string input)
        {
            return !string.IsNullOrEmpty(input);
        }

        public static double StrToDouble(string input, double defaultVal)
        {
            double res;
            if (!string.IsNullOrEmpty(input) && double.TryParse(input, NumberStyles.Any, CultureInfo.GetCultureInfo("ru-RU"), out res))
            {
                return res;
            }

            if (!string.IsNullOrEmpty(input) && double.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out res))
            {
                return res;
            }

            return defaultVal;
        }

        public static decimal StrToDecimal(string input, decimal defaultVal)
        {
            decimal res;
            if (!string.IsNullOrEmpty(input) && decimal.TryParse(input, NumberStyles.Any, CultureInfo.GetCultureInfo("ru-RU"), out res))
            {
                return res;
            }

            if (!string.IsNullOrEmpty(input) && decimal.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out res))
            {
                return res;
            }

            return defaultVal;
        }

        public static Guid StrToGuid(string input, Guid defaultVal)
        {
            Guid res = defaultVal;
            try
            {
                res = new Guid(input);
            }
            catch (Exception ex)
            {
                res = defaultVal;
            }
            return res;
        }

        public static DateTime StrToDateTime(string input, DateTime defaultVal)
        {
            DateTime res;         

            if (!string.IsNullOrEmpty(input) && DateTime.TryParse(input, CultureInfo.GetCultureInfo("ru-RU"), DateTimeStyles.AssumeLocal, out res))
            {
                return res;
            }
            
            return defaultVal;
        }

        public static int? StrToNullableInt32(string s)
        {
            int i;
            if (Int32.TryParse(s, out i)) return i;
            return null;
        }
    }
        

}