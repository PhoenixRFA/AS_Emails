using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Configuration;
using System.Data.SqlClient;
using Dapper;
using System.Reflection;

namespace as_Emails.BLL
{
    public class Repo : IDisposable
    {
        #region System
        public string _connectionString;
        private bool _disposed;

        public Repo(string connectionString = "LocalSqlServerSimple")
        {
            _connectionString = connectionString;
            _disposed = false;
            //SERIALIZE WILL FAIL WITH PROXIED ENTITIES
            //dbContext.Configuration.ProxyCreationEnabled = false;
            //ENABLING COULD CAUSE ENDLESS LOOPS AND PERFORMANCE PROBLEMS
            //dbContext.Configuration.LazyLoadingEnabled = false;
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
        #endregion






        public T EditData<T>(string sql, object parameters = null, CommandType type = CommandType.StoredProcedure)
        {
            var list = GetSQLItems<T>(sql, parameters, type);
            if (list != null && list.Count > 0) return list.FirstOrDefault();
            else return default(T);
        }

        public T GetSQLItem<T>(string sql, object parameters = null, CommandType type = CommandType.StoredProcedure)
        {
            var list = GetSQLItems<T>(sql, parameters, type);
            if (list != null && list.Count > 0) return list.FirstOrDefault();
            else return default(T);

        }

        public List<T> GetSQLItems<T>(string sql, object parameters = null, CommandType type = CommandType.StoredProcedure)
        {
            var list = new List<T>();
            GetSQLMultipleData<T, int, int, int, int, int>(sql, list, null, null, null, null, null,
                parameters, type);
            return list;
        }

        public void GetSQLMultipleData<T1, T2>(string sql, List<T1> t1, List<T2> t2 = null,
           object parameters = null, CommandType type = CommandType.StoredProcedure)
        {
            GetSQLMultipleData<T1, T2, int, int, int, int>(sql, t1, t2, null, null, null, null,
                parameters, type);
        }

        public void GetSQLMultipleData<T1, T2, T3, T4, T5, T6>(string sql, List<T1> t1, List<T2> t2 = null,
            List<T3> t3 = null, List<T4> t4 = null, List<T5> t5 = null, List<T6> t6 = null,
            object parameters = null, CommandType type = CommandType.StoredProcedure)
        {
            parameters = TransformArrayParametersToTableValuedParameters(parameters);

            using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings[_connectionString].ConnectionString))
            {
                conn.Open();
                var res = conn.QueryMultiple(sql, parameters, commandType: type);
                t1.AddRange(res.Read<T1>());
                if (t2 != null) t2.AddRange(res.Read<T2>());
                if (t3 != null) t3.AddRange(res.Read<T3>());
                if (t4 != null) t4.AddRange(res.Read<T4>());
                if (t5 != null) t5.AddRange(res.Read<T5>());
                if (t6 != null) t6.AddRange(res.Read<T6>());
            }
        }

        private object TransformArrayParametersToTableValuedParameters(object parameters)
        {
            DynamicParameters dynamicParameters = parameters as DynamicParameters;

            if (dynamicParameters == null)
            {
                return parameters;
            }

            bool containsArray = false;

            DynamicParameters dynamicParametersCopy = new DynamicParameters();

            foreach (string parameterName in dynamicParameters.ParameterNames)
            {
                dynamic parameter = ((SqlMapper.IParameterLookup)dynamicParameters)[parameterName];

                if (parameter != null && parameter.GetType().IsArray)
                {
                    containsArray = true;
                    parameter = ToTableValuedParameter(parameter);
                }

                dynamicParametersCopy.Add(parameterName, parameter);
            }

            return containsArray ? dynamicParametersCopy : dynamicParameters;
        }
        private bool IsPrimitiveType(Type type)
        {
            return type == typeof(string) || !type.IsClass;
        }

        private bool IsNullable(Type type)
        {
            return type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>);
        }

        public DataTable ToTableValuedParameter<T>(T[] elements)
        {
            DataTable table = new DataTable();

            if (IsPrimitiveType(typeof(T)))
            {
                table.Columns.Add("Value", typeof(T));

                foreach (T element in elements)
                {
                    table.Rows.Add(element);
                }

                table.SetTypeName(typeof(T).Name + "Array");
            }
            else
            {
                PropertyInfo[] properties = typeof(T).GetProperties();

                foreach (PropertyInfo property in properties)
                {
                    Type propertyType = property.PropertyType;

                    if (IsNullable(propertyType))
                    {
                        propertyType = Nullable.GetUnderlyingType(propertyType);
                    }

                    table.Columns.Add(property.Name, propertyType);
                }

                foreach (T element in elements)
                {
                    object[] values = properties
                        .Select(property => property.GetValue(element) ?? DBNull.Value)
                        .ToArray();

                    table.Rows.Add(values);
                }

                table.SetTypeName(typeof(T).Name);
            }

            return table;
        }



    }
}