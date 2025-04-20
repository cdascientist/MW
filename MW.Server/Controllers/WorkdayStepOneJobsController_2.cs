using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MW.Server.Models; // Assuming Models namespace follows project name
using System.Threading.Tasks;
using Tensorflow;
using Tensorflow.NumPy;
using static Tensorflow.Binding;
using Tensorflow.Clustering;
using System.Dynamic;


namespace MW.Server.Models // Assuming Controllers namespace follows project name
{

    /// <summary>
    /// Step One - Lets Create the Runtime memory object with Add/Get Property Functionality 
    /// </summary>
    public class Jit_Memory_Object
    {
        private static readonly ExpandoObject _dynamicStorage = new ExpandoObject();
        private static readonly dynamic _dynamicObject = _dynamicStorage;
        private static RuntimeMethodHandle _jitMethodHandle;

        public static void AddProperty(string propertyName, object value)
        {
            var dictionary = (IDictionary<string, object?>)_dynamicStorage; // Updated to use nullable object
            dictionary[propertyName] = value;
        }

        public static object? GetProperty(string propertyName)
        {
            var dictionary = (IDictionary<string, object?>)_dynamicStorage; // Updated to use nullable object
            return dictionary.TryGetValue(propertyName, out var value) ? value : null;
        }

        public static dynamic DynamicObject => _dynamicObject;

        public static void SetJitMethodHandle(RuntimeMethodHandle handle)
        {
            _jitMethodHandle = handle;
        }

        public static RuntimeMethodHandle GetJitMethodHandle()
        {
            return _jitMethodHandle;
        }
    }


}



namespace MW.Server.Infrastructure
{
    public class ModelTrainingConfiguration
    {
        public int Epochs { get; set; }
        public float InitialLearningRate { get; set; }
        public float ConvergenceThreshold { get; set; }
        public int StableEpochsRequired { get; set; }
        public float MinLearningRate { get; set; }
    }
}

namespace MW.Server.Controllers
{
   

}
