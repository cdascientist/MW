using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MW.Server.Models; // Assuming Models namespace follows project name
using System.Collections.Generic; // Required for List<T>
using System.Threading.Tasks;
using System; // Required for DateTime
using System.Collections.Concurrent; // Required for ConcurrentDictionary
using System.Threading; // Required for Interlocked
using System.Linq; // Required for LINQ extensions
using System.IO; // Required for MemoryStream and BinaryWriter
using Tensorflow; // Required for TensorFlow (requires TensorFlow.NET package)
using Tensorflow.NumPy; // Required for NDArray (requires TensorFlow.NET.Keras package, often included with TensorFlow.NET)
using static Tensorflow.Binding; // Required for tf alias (requires TensorFlow.NET package)
using Accord.MachineLearning; // Required for KMeans (requires Accord.MachineLearning package)
using Accord.Math.Distances; // Required for SquareEuclidean (requires Accord.Math package)
using System.Dynamic; // Required for ExpandoObject
using System.Reflection; // Required for RuntimeMethodHandle
using System.ComponentModel.DataAnnotations.Schema; // Required for [Table]
using System.Diagnostics; // Required for System.Diagnostics.Debug.WriteLine
using Microsoft.Extensions.DependencyInjection; // Required for DbContextOptionsBuilder
using System.Transactions; // Required for explicit transactions
using MW.Server.Infrastructure; // Using the infrastructure namespace defined below
using Microsoft.AspNetCore.Http; // Required for StatusCodes
using System.ComponentModel.DataAnnotations; // Required for [Key], [Required], [StringLength]
using Microsoft.EntityFrameworkCore.SqlServer; // Required for UseSqlServer extension method

namespace MW.Server.Models
{
    // --- Start: Temporary Static Variables for Testing ---
    /// <summary>
    /// Static class to hold temporary data for testing purposes.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    public static class TemporaryTestData // Added static class to contain static members
    {
        /// <summary>
        /// Temporary static list to simulate a database table for WorkdayStepOneJob testing.
        /// Modified to contain only one placeholder record.
        /// Modified: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        public static readonly List<WorkdayStepOneJob> TemporaryJobs = new List<WorkdayStepOneJob>
        {
            // Add only one sample data record for testing the count
            new WorkdayStepOneJob
            {
                Id = 1,
                MyId = 101,
                Datetime = new DateTime(2023, 10, 26),
                ClientFirstName = "John",
                ClientLastName = "Doe",
                Phone = "555-1234",
                Email = "john.doe@example.com",
                JobId = 1001,
                JobName = "Software Engineer",
                Company = "Tech Solutions Inc.",
                Posted = "Yesterday",
                AgentConsensus = true,
                JenniferConsensus = true,
                AshleyConsensus = false,
                AllenConsensus = true,
                HierarchicalStructure = "Manager -> Team Lead -> Engineer"
                // Blob fields are null for simplicity in placeholder data
            }
        };

        /// <summary>
        /// Temporary static list to simulate a database table for Modeldbinit testing.
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        public static readonly List<Modeldbinit> TemporaryModelDbInits = new List<Modeldbinit>
        {
            // Add some sample data for Modeldbinit
            new Modeldbinit
            {
                Id = 1,
                CustomerId = 123,
                Modeldbinittimestamp = DateTime.UtcNow,
                ModelDbInitCatagoricalId = 5,
                ModelDbInitCatagoricalName = "Initial Category",
                ModelDbInitModelData = new byte[] { 1, 2, 3, 4 }, // Placeholder binary data
                Data = new byte[] { 5, 6, 7, 8 }, // Placeholder binary data
                ModelDbInitProductVector = "X=1.0, Y=2.0, Z=3.0", // Sample vector data
                ModelDbInitServiceVector = "X=4.0, Y=5.0, Z=6.0" // Sample vector data
            },
            new Modeldbinit
            {
                Id = 2,
                CustomerId = 456,
                Modeldbinittimestamp = DateTime.UtcNow.AddDays(-1),
                ModelDbInitCatagoricalId = 10,
                ModelDbInitCatagoricalName = "Second Category",
                 ModelDbInitModelData = new byte[] { 9, 10, 11, 12 }, // Placeholder binary data
                Data = new byte[] { 13, 14, 15, 16 }, // Placeholder binary data
                ModelDbInitProductVector = "X=10.0, Y=11.0, Z=12.0", // Sample vector data
                ModelDbInitServiceVector = "X=13.0, Y=14.0, Z=15.0" // Sample vector data
            }
        };
    }
    // --- End: Temporary Static Variables for Testing ---

    // --- Start: WorkdayStepOneJob Model Definition ---
    /// <summary>
    /// Represents the workday_step_one_job table in the database.
    /// Original Definition.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("workday_step_one_job")]
    public partial class WorkdayStepOneJob
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("my_id")]
        public int? MyId { get; set; }

        [Column("datetime", TypeName = "date")]
        public DateTime? Datetime { get; set; }

        [Column("client_first_name")]
        [StringLength(100)]
        public string? ClientFirstName { get; set; }

        [Column("client_last_name")]
        [StringLength(100)]
        public string? ClientLastName { get; set; }

        [Column("phone")]
        [StringLength(100)]
        public string? Phone { get; set; }

        [Column("email")]
        [StringLength(100)]
        public string? Email { get; set; }

        [Column("job_id")]
        public int? JobId { get; set; }

        [Column("job_name")]
        [StringLength(100)]
        public string? JobName { get; set; }

        [Column("company")]
        [StringLength(100)]
        public string? Company { get; set; }

        [Column("posted")]
        [StringLength(100)]
        public string? Posted { get; set; }

        [Column("inital_contact", TypeName = "blob")]
        public byte[]? InitalContact { get; set; }

        [Column("init_contact_analysis", TypeName = "blob")]
        public byte[]? InitContactAnalysis { get; set; }

        [Column("team_1_transcript_1_cycles")]
        public int? Team1Transcript1Cycles { get; set; }

        [Column("team_1_trasnscript_1", TypeName = "mediumtext")]
        public string? Team1Trasnscript1 { get; set; }

        [Required]
        [Column("agent_consensus")]
        public bool? AgentConsensus { get; set; }

        [Column("jennifer_consensus")]
        public bool? JenniferConsensus { get; set; }

        [Column("ashley_consensus")]
        public bool? AshleyConsensus { get; set; }

        [Column("allen_consensus")]
        public bool? AllenConsensus { get; set; }

        [Column("relational_graph")]
        public byte[]? RelationalGraph { get; set; }

        [Column("hierarchical_structure")]
        [StringLength(2055)]
        public string? HierarchicalStructure { get; set; }
    }
    // --- End: WorkdayStepOneJob Model Definition ---


    // --- Start: Added Modeldbinit Model ---
    /// <summary>
    /// Represents the modeldbinit table in the database.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("modeldbinit")]
    public partial class Modeldbinit
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("customer_id")]
        public int? CustomerId { get; set; }

        [Column("modeldbinittimestamp", TypeName = "datetime")]
        public DateTime? Modeldbinittimestamp { get; set; }

        [Column("model_db_init_catagorical_id")]
        public int? ModelDbInitCatagoricalId { get; set; }

        [Column("model_db_init_catagorical_name", TypeName = "text")]
        public string? ModelDbInitCatagoricalName { get; set; }

        [Column("model_db_init_model_data", TypeName = "varbinary(65000)")]
        public byte[]? ModelDbInitModelData { get; set; }

        // Added properties based on usage in the provided controller code
        // These seem to represent processed results or related data vectors.
        // Added: April 20, 2025 2:35:04 PM America/Denver
        [Column("data", TypeName = "varbinary(65000)")]
        public byte[]? Data { get; set; }

        [Column("model_db_init_product_vector")]
        public string? ModelDbInitProductVector { get; set; }

        [Column("model_db_init_service_vector")]
        public string? ModelDbInitServiceVector { get; set; }

        // Placeholder/stub navigation properties based on usage in the controller
        // These are not fully defined but are included to match the controller's access patterns.
        // Added: April 20, 2025 2:35:04 PM America/Denver
        public virtual ClientInformation? ClientInformation { get; set; } // Assumes a related ClientInformation model
        public virtual ICollection<ClientOrder> ClientOrders { get; set; } = new List<ClientOrder>(); // Assumes a related ClientOrder model
    }
    // --- End: Added Modeldbinit Model ---


    // --- Start: Placeholder/Stub Models based on AnalysisController usage ---
    // These models are referenced in the provided controller code but were not originally defined.
    // They are included as minimal definitions to allow the code to compile structurally.
    // Added: April 20, 2025 2:35:04 PM America/Denver

    /// <summary>
    /// Placeholder model for ClientInformation referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("client_information")] // Assuming table name
    public partial class ClientInformation
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("client_first_name")]
        public string? ClientFirstName { get; set; }
        [Column("client_last_name")]
        public string? ClientLastName { get; set; }
        [Column("cleint_phone")]
        public string? CleintPhone { get; set; }
        [Column("client_address")]
        public string? ClientAddress { get; set; }
        [Column("customer_id")]
        public int? CustomerId { get; set; }
        [Column("company_name")]
        public string? CompanyName { get; set; }
    }

    /// <summary>
    /// Placeholder model for ClientOrder referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("client_order")] // Assuming table name
    public partial class ClientOrder
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("customer_id")]
        public int? CustomerId { get; set; }
        [Column("order_id")]
        public int? OrderId { get; set; }
    }

    /// <summary>
    /// Placeholder model for ModelDbInitOperation referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("modeldbinit_operation")] // Assuming table name
    public partial class ModelDbInitOperation
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("customer_id")]
        public int? CustomerId { get; set; }
        [Column("order_id")]
        public int? OrderId { get; set; }
        [Column("operations_id")]
        public int? OperationsId { get; set; }
        [Column("data", TypeName = "varbinary(max)")]
        public byte[]? Data { get; set; }
    }

    /// <summary>
    /// Placeholder model for ModelDbInitQa referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("modeldbinit_qa")] // Assuming table name
    public partial class ModelDbInitQa
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("customer_id")]
        public int? CustomerId { get; set; }
        [Column("order_id")]
        public int? OrderId { get; set; }
        [Column("data", TypeName = "varbinary(max)")]
        public byte[]? Data { get; set; }
    }

    /// <summary>
    /// Placeholder model for OperationsStage1 referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("operations_stage1")] // Assuming table name
    public partial class OperationsStage1
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("customer_id")]
        public int? CustomerId { get; set; }
        [Column("order_id")]
        public int? OrderId { get; set; }
        [Column("operations_id")]
        public int? OperationsId { get; set; }
        [Column("operational_id")]
        public int? OperationalId { get; set; }
        [Column("csr_opartational_id")]
        public int? CsrOpartationalId { get; set; }
        [Column("sales_id")]
        public int? SalesId { get; set; }
        [Column("sub_service_a")]
        public int? SubServiceA { get; set; }
        [Column("sub_service_b")]
        public int? SubServiceB { get; set; }
        [Column("sub_service_c")]
        public int? SubServiceC { get; set; }
        [Column("sub_product_a")]
        public int? SubProductA { get; set; }
        [Column("sub_product_b")]
        public int? SubProductB { get; set; }
        [Column("sub_product_c")]
        public int? SubProductC { get; set; }
        [Column("data", TypeName = "varbinary(max)")]
        public string? Data { get; set; } // Changed to string based on usage in AnalysisController.ProcessFactoryFour
        [Column("operations_stage_one_product_vector")]
        public string? OperationsStageOneProductVector { get; set; }
        [Column("operations_stage_one_service_vector")]
        public string? OperationsStageOneServiceVector { get; set; }

        // Placeholder navigation properties
        public virtual ModelDbInitOperation? Operations { get; set; } // Assumes relationship to ModelDbInitOperation
        public virtual SubProductA? SubProductANavigation { get; set; } // Assumes relationship to SubProductA
        public virtual SubProductB? SubProductBNavigation { get; set; } // Assumes relationship to SubProductB
        public virtual SubProductC? SubProductCNavigation { get; set; } // Assumes relationship to SubProductC
        public virtual SubServiceA? SubServiceANavigation { get; set; } // Assumes relationship to SubServiceA
        public virtual SubServiceB? SubServiceBNavigation { get; set; } // Assumes relationship to SubServiceB
        public virtual SubServiceC? SubServiceCNavigation { get; set; } // Assumes relationship to SubServiceC
    }

    /// <summary>
    /// Placeholder model for SubProductA referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("sub_product_a")] // Assuming table name
    public partial class SubProductA
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("product_name")]
        public string? ProductName { get; set; }
        [Column("product_type")]
        public string? ProductType { get; set; }
        [Column("quantity")]
        public int? Quantity { get; set; }
        [Column("price", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Price { get; set; }
        [Column("ccvc", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Ccvc { get; set; }
    }

    /// <summary>
    /// Placeholder model for SubProductB referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("sub_product_b")] // Assuming table name
    public partial class SubProductB
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("product_name")]
        public string? ProductName { get; set; }
        [Column("product_type")]
        public string? ProductType { get; set; }
        [Column("quantity")]
        public int? Quantity { get; set; }
        [Column("price", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Price { get; set; }
        [Column("ccvc", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Ccvc { get; set; }
    }

    /// <summary>
    /// Placeholder model for SubProductC referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("sub_product_c")] // Assuming table name
    public partial class SubProductC
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("product_name")]
        public string? ProductName { get; set; }
        [Column("product_type")]
        public string? ProductType { get; set; }
        [Column("quantity")]
        public int? Quantity { get; set; }
        [Column("price", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Price { get; set; }
        [Column("ccvc", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Ccvc { get; set; }
    }

    /// <summary>
    /// Placeholder model for SubServiceA referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("sub_service_a")] // Assuming table name
    public partial class SubServiceA
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("service_name")]
        public string? ServiceName { get; set; }
        [Column("service_type")]
        public string? ServiceType { get; set; }
        [Column("quantity")]
        public int? Quantity { get; set; }
        [Column("price", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Price { get; set; }
        [Column("ccvc", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Ccvc { get; set; }
    }

    /// <summary>
    /// Placeholder model for SubServiceB referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("sub_service_b")] // Assuming table name
    public partial class SubServiceB
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("service_name")]
        public string? ServiceName { get; set; }
        [Column("service_type")]
        public string? ServiceType { get; set; }
        [Column("quantity")]
        public int? Quantity { get; set; }
        [Column("price", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Price { get; set; }
        [Column("ccvc", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Ccvc { get; set; }
    }

    /// <summary>
    /// Placeholder model for SubServiceC referenced in AnalysisController.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    [Table("sub_service_c")] // Assuming table name
    public partial class SubServiceC
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        [Column("service_name")]
        public string? ServiceName { get; set; }
        [Column("service_type")]
        public string? ServiceType { get; set; }
        [Column("quantity")]
        public int? Quantity { get; set; }
        [Column("price", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Price { get; set; }
        [Column("ccvc", TypeName = "decimal(18, 2)")] // Assuming decimal based on (float) cast usage
        public decimal? Ccvc { get; set; }
    }

    /// <summary>
    /// Placeholder DbContext class referenced in the WorkdayStepOneJobsController_2.
    /// This needs to be a concrete implementation in a real application.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    public class DefaultdbContext : DbContext
    {
        public DefaultdbContext(DbContextOptions<DefaultdbContext> options) : base(options) { }

        // Assuming the DbSet property is named by pluralizing 'WorkdayStepOneJob'
        public virtual DbSet<WorkdayStepOneJob> WorkdayStepOneJobs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure model relationships if necessary for the DefaultdbContext
            // For this example, we only need the DbSet for WorkdayStepOneJob.
        }
    }


    /// <summary>
    /// Placeholder DbContext class referenced in the AnalysisController.
    /// This needs to be a concrete implementation in a real application.
    /// Modified name to generic YourDbContext.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    public class YourDbContext : DbContext
    {
        public YourDbContext(DbContextOptions<YourDbContext> options) : base(options) { }

        // Define DbSet properties for all referenced models
        public virtual DbSet<ClientInformation> ClientInformations { get; set; }
        public virtual DbSet<ClientOrder> ClientOrders { get; set; }
        public virtual DbSet<Modeldbinit> ModelDbInits { get; set; }
        public virtual DbSet<ModelDbInitOperation> ModelDbInitOperations { get; set; }
        public virtual DbSet<ModelDbInitQa> ModelDbInitQas { get; set; }
        public virtual DbSet<OperationsStage1> OperationsStage1s { get; set; }
        public virtual DbSet<SubProductA> SubProductAs { get; set; }
        public virtual DbSet<SubProductB> SubProductBs { get; set; }
        public virtual DbSet<SubProductC> SubProductCs { get; set; }
        public virtual DbSet<SubServiceA> SubServiceAs { get; set; }
        public virtual DbSet<SubServiceB> SubServiceBs { get; set; }
        public virtual DbSet<SubServiceC> SubServiceCs { get; set; }


        // Configure relationships based on usage in the controller's Include statements
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Example relationship configurations (adjust based on your actual schema)
            // These are included to match the .Include() calls in the controller.
            modelBuilder.Entity<Modeldbinit>()
                .HasOne(m => m.ClientInformation)
                .WithMany() // Assuming a one-to-many or one-to-one relationship
                .HasForeignKey(m => m.CustomerId); // Assuming CustomerId is the foreign key

            modelBuilder.Entity<Modeldbinit>()
                .HasMany(m => m.ClientOrders)
                .WithOne() // Assuming a one-to-many relationship
                .HasForeignKey(o => o.CustomerId); // Assuming CustomerId is the foreign key


            modelBuilder.Entity<OperationsStage1>()
               .HasOne(o => o.Operations)
               .WithMany() // Assuming a one-to-many or one-to-one relationship
               .HasForeignKey(o => o.OperationsId); // Assuming OperationsId is the foreign key

            modelBuilder.Entity<OperationsStage1>()
               .HasOne(o => o.SubProductANavigation)
               .WithMany()
               .HasForeignKey(o => o.SubProductA);

            modelBuilder.Entity<OperationsStage1>()
               .HasOne(o => o.SubProductBNavigation)
               .WithMany()
               .HasForeignKey(o => o.SubProductB);

            modelBuilder.Entity<OperationsStage1>()
               .HasOne(o => o.SubProductCNavigation)
               .WithMany()
               .HasForeignKey(o => o.SubProductC);

            modelBuilder.Entity<OperationsStage1>()
                .HasOne(o => o.SubServiceANavigation)
                .WithMany()
                .HasForeignKey(o => o.SubServiceA);

            modelBuilder.Entity<OperationsStage1>()
                .HasOne(o => o.SubServiceBNavigation)
                .WithMany()
                .HasForeignKey(o => o.SubServiceB);

            modelBuilder.Entity<OperationsStage1>()
                .HasOne(o => o.SubServiceCNavigation)
                .WithMany()
                .HasForeignKey(o => o.SubServiceC);


            // Add configurations for other relationships if needed based on your schema
            // For testing with static data, these relationships are not functionally used,
            // but they are needed for the code structure to compile if the DbContext is included.
        }
    }
    // --- End: Placeholder/Stub Models and DbContexts ---


    /// <summary>
    /// Static class to hold runtime memory objects with Add/Get Property Functionality.
    /// Keeping original name as it's core to its function.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    public static class Jit_Memory_Object // Made static
    {
        private static readonly ExpandoObject _dynamicStorage = new ExpandoObject();
        private static readonly dynamic _dynamicObject = _dynamicStorage;
        private static RuntimeMethodHandle _jitMethodHandle;

        /// <summary>
        /// Adds or updates a property in the static dynamic storage.
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        /// <param name="propertyName">The name of the property.</param>
        /// <param name="value">The value to store.</param>
        public static void AddProperty(string propertyName, object value)
        {
            var dictionary = (IDictionary<string, object>)_dynamicStorage;
            dictionary[propertyName] = value;
        }

        /// <summary>
        /// Retrieves a property from the static dynamic storage.
        /// Returns null if the property does not exist.
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        /// <param name="propertyName">The name of the property.</param>
        /// <returns>The value of the property, or null if not found.</returns>
        public static object? GetProperty(string propertyName)
        {
            var dictionary = (IDictionary<string, object>)_dynamicStorage;
            return dictionary.TryGetValue(propertyName, out var value) ? value : null;
        }

        /// <summary>
        /// Gets the dynamic object for direct access.
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        public static dynamic DynamicObject => _dynamicObject;

        /// <summary>
        /// Sets the JIT method handle (purpose unclear in this context, but kept as per original).
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        /// <param name="handle">The RuntimeMethodHandle to set.</param>
        public static void SetJitMethodHandle(RuntimeMethodHandle handle)
        {
            _jitMethodHandle = handle;
        }

        /// <summary>
        /// Gets the stored JIT method handle.
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        /// <returns>The RuntimeMethodHandle.</returns>
        public static RuntimeMethodHandle GetJitMethodHandle()
        {
            return _jitMethodHandle;
        }
    }
}

namespace MW.Server.Infrastructure // Changed namespace to match project structure
{
    /// <summary>
    /// Configuration settings for model training.
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    public class ModelTrainingConfiguration // Keeping original name as it's descriptive
    {
        public int Epochs { get; set; }
        public float InitialLearningRate { get; set; }
        public float ConvergenceThreshold { get; set; }
        public int StableEpochsRequired { get; set; }
        public float MinLearningRate { get; set; }
    }

    /// <summary>
    /// Orchestrates parallel processing tasks (placeholder).
    /// Added: April 20, 2025 2:35:04 PM America/Denver
    /// </summary>
    public class ParallelProcessingOrchestrator // Keeping original name
    {
        private readonly ConcurrentDictionary<string, object> _sharedMemory = new ConcurrentDictionary<string, object>();

        /// <summary>
        /// Clears shared data (placeholder function).
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        public void ClearSharedData()
        {
            _sharedMemory.Clear();
        }
    }
}


namespace MW.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkdayStepOneJobsController_2 : ControllerBase
    {
        // --- Start: DbContext Dependency for WorkdayStepOneJob Count ---
        // This controller uses a DbContext to fetch data.
        // Added: April 20, 2025 2:35:04 PM America/Denver
        private readonly DefaultdbContext _context;

        /// <summary>
        /// Constructor for the WorkdayStepOneJobsController_2.
        /// Requires a DefaultdbContext instance.
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        /// <param name="context">The database context.</param>
        public WorkdayStepOneJobsController_2(DefaultdbContext context)
        {
            _context = context;
        }
        // --- End: DbContext Dependency for WorkdayStepOneJob Count ---


        /// <summary>
        /// Gets the total count of WorkdayStepOneJob records from the database context.
        /// Modified to use the injected DefaultdbContext.
        /// Modified: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        /// <returns>The total number of records.</returns>
        [HttpGet("Count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<int>> GetCount()
        {
            // IMPORTANT: Assumes the DbSet property in 'DefaultdbContext' is named by pluralizing 'WorkdayStepOneJob' (e.g., 'WorkdayStepOneJobs')
            // This implementation uses the database context for the count.
            // Modified: April 20, 2025 2:35:04 PM America/Denver
            var count = await _context.WorkdayStepOneJobs.CountAsync();
            return Ok(count);
        }

        // Note: Other API methods would need to use the database context for real data operations.
        // Added: April 20, 2025 2:35:04 PM America/Denver
    }


    [Route("api/[controller]")] // Changed name to generic AnalysisController
    [ApiController]
    public class AnalysisController : ControllerBase // Changed name to generic AnalysisController
    {
        // --- Start: DbContext Dependency ---
        // This controller's logic heavily relies on database interaction.
        // Note: To run the methods in this controller, you would need a configured DbContext.
        // Added: April 20, 2025 2:35:04 PM America/Denver
        private readonly YourDbContext _dbContext; // Changed name to generic YourDbContext
        private readonly ConcurrentDictionary<int, Session> _sessions; // Kept original name
        private readonly ParallelProcessingOrchestrator _processingOrchestrator; // Kept original name
        private static int _sessionCounter = 0; // Kept original name
        // --- End: DbContext Dependency ---

        // --- Start: Data Lists ---
        // Lists to hold data fetched from the database upon controller initialization.
        // Added: April 20, 2025 2:35:04 PM America/Denver
        private List<dynamic> All_SubProducts = new List<dynamic>();
        private List<dynamic> All_SubServices = new List<dynamic>();
        // --- End: Data Lists ---


        /// <summary>
        /// Constructor for the Analysis Controller.
        /// Includes logic to fetch initial data from the database in a background task.
        /// Requires a YourDbContext instance.
        /// Modified: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        /// <param name="dbContext">The database context.</param>
        public AnalysisController(YourDbContext dbContext) // Changed name to generic YourDbContext
        {
            _dbContext = dbContext;
            _sessions = new ConcurrentDictionary<int, Session>();
            _processingOrchestrator = new ParallelProcessingOrchestrator();

            // --- Start: Database Data Retrieval Task (Run on Initialization) ---
            // This Task.Run block was included in the code provided by the user to be added.
            // It fetches data from the database upon controller initialization.
            // IMPORTANT: This code REQUIRES a functional database connection and schema
            // matching the DbSet definitions in YourDbContext.
            // It WILL NOT work with only the static placeholder data defined in TemporaryTestData.
            // Modified: April 20, 2025 2:35:04 PM America/Denver
            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] AnalysisController Initialized. Starting parallel data retrieval task.");

            Task.Run(async () =>
            {
                try
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting parallel data retrieval");

                    // Create options for new context instances using the controller's _dbContext connection string
                    // This assumes _dbContext is valid and has a connection string configured.
                    var optionsBuilder = new DbContextOptionsBuilder<YourDbContext>(); // Changed to YourDbContext
                    // Note: _dbContext.Database.GetConnectionString() will throw if _dbContext is null or not configured.
                    // In a real application using dependency injection, you would likely inject a DbContextOptions<YourDbContext>
                    // or a factory (e.g., IDbContextFactory<YourDbContext>) here instead of relying on _dbContext.
                    optionsBuilder.UseSqlServer(_dbContext.Database.GetConnectionString());

                    // Function to create a new context instance using the options
                    YourDbContext CreateNewContext() // Changed to YourDbContext
                    {
                        return new YourDbContext(optionsBuilder.Options); // Changed to YourDbContext
                    }

                    // Create tasks with separate context instances for each query
                    var tasks = new List<Task<List<dynamic>>>(); // Specify Task<List<dynamic>> as the return type

                    // Product tasks - Modified to use YourDbContext and its DbSets
                    tasks.Add(Task.Run(async () =>
                    {
                        using var context = CreateNewContext();
                        return await context.SubProductAs // Changed to context.SubProductAs
                            .AsNoTracking()
                            .Select(p => new {
                                p.Id,
                                p.ProductName,
                                p.ProductType,
                                p.Quantity,
                                Price = (float)p.Price, // Cast to float
                                ccvc = (float)p.Ccvc // Cast to float
                            })
                            .ToListAsync();
                    }));

                    tasks.Add(Task.Run(async () =>
                    {
                        using var context = CreateNewContext();
                        return await context.SubProductBs // Changed to context.SubProductBs
                            .AsNoTracking()
                            .Select(p => new {
                                p.Id,
                                p.ProductName,
                                p.ProductType,
                                p.Quantity,
                                Price = (float)p.Price, // Cast to float
                                ccvc = (float)p.Ccvc // Cast to float
                            })
                            .ToListAsync();
                    }));

                    tasks.Add(Task.Run(async () =>
                    {
                        using var context = CreateNewContext();
                        return await context.SubProductCs // Changed to context.SubProductCs
                            .AsNoTracking()
                            .Select(p => new {
                                p.Id,
                                p.ProductName,
                                p.ProductType,
                                p.Quantity,
                                Price = (float)p.Price, // Cast to float
                                ccvc = (float)p.Ccvc // Cast to float
                            })
                            .ToListAsync();
                    }));

                    // Service tasks - Modified to use YourDbContext and its DbSets
                    tasks.Add(Task.Run(async () =>
                    {
                        using var context = CreateNewContext();
                        return await context.SubServiceAs // Changed to context.SubServiceAs
                            .AsNoTracking()
                            .Select(p => new {
                                p.Id,
                                p.ServiceName,
                                p.ServiceType,
                                p.Quantity,
                                Price = (float)p.Price, // Cast to float
                                ccvc = (float)p.Ccvc // Cast to float
                            })
                            .ToListAsync();
                    }));

                    tasks.Add(Task.Run(async () =>
                    {
                        using var context = CreateNewContext();
                        return await context.SubServiceBs // Changed to context.SubServiceBs
                            .AsNoTracking()
                            .Select(p => new {
                                p.Id,
                                p.ServiceName,
                                p.ServiceType,
                                p.Quantity,
                                Price = (float)p.Price, // Cast to float
                                ccvc = (float)p.Ccvc // Cast to float
                            })
                            .ToListAsync();
                    }));

                    tasks.Add(Task.Run(async () =>
                    {
                        using var context = CreateNewContext();
                        return await context.SubServiceCs // Changed to context.SubServiceCs
                            .AsNoTracking()
                            .Select(p => new {
                                p.Id,
                                p.ServiceName,
                                p.ServiceType,
                                p.Quantity,
                                Price = (float)p.Price, // Cast to float
                                ccvc = (float)p.Ccvc // Cast to float
                            })
                            .ToListAsync();
                    }));


                    // Execute all queries in parallel and get results array
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Executing parallel queries");
                    var results = await Task.WhenAll(tasks); // results is of type List<dynamic>[]

                    // Process results array elements
                    var productsA = results[0]; // Directly access elements
                    var productsB = results[1];
                    var productsC = results[2];
                    var servicesA = results[3];
                    var servicesB = results[4];
                    var servicesC = results[5];


                    All_SubProducts.AddRange(productsA);
                    All_SubProducts.AddRange(productsB);
                    All_SubProducts.AddRange(productsC);

                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found {productsA.Count} SubProduct A records");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found {productsB.Count} SubProduct B records");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found {productsC.Count} SubProduct C records");

                    // Process service results and add to All_SubServices
                    All_SubServices.AddRange(servicesA);
                    All_SubServices.AddRange(servicesB);
                    All_SubServices.AddRange(servicesC);

                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found {servicesA.Count} SubService A records");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found {servicesB.Count} SubService B records");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found {servicesC.Count} SubService C records");

                    // Store in runtime memory using Jit_Memory_Object
                    Jit_Memory_Object.AddProperty("All_SubServices", All_SubServices);
                    Jit_Memory_Object.AddProperty("All_SubProducts", All_SubProducts);

                    // Log final counts
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stored All_SubServices in JIT memory with {All_SubServices.Count} total records");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stored All_SubProducts in JIT memory with {All_SubProducts.Count} total records");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in parallel data retrieval during AnalysisController initialization: {ex.Message}");
                    // In a real application, you might want to handle this error more gracefully,
                    // perhaps by logging it and continuing without the data, or marking the controller as unhealthy.
                    // For this example, we just log and let the exception potentially propagate or be ignored by Task.Run.
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}");
                }
            }); // .GetAwaiter().GetResult() was removed to avoid blocking the constructor.
            // --- End: Database Data Retrieval Task ---
        }


        // --- Start: Removed API Endpoints ---
        // Removed GetCustomers2, GetCustomers, and GetCustomerByID endpoints as requested.
        // Removed: April 20, 2025 2:35:04 PM America/Denver
        // [HttpPost("GetCustomers2/")]
        // public async Task<ActionResult<IEnumerable<ClientInformation>>> GetCustomers2() { ... }
        // Removed: April 20, 2025 2:35:04 PM America/Denver
        // [HttpPost("GetCustomers/")]
        // public async Task<ActionResult<IEnumerable<ClientInformation>>> GetCustomers() { ... }
        // Removed: April 20, 2025 2:35:04 PM America/Denver
        // [HttpPost("GetCustomerByID/{customerid}")]
        // public async Task<ActionResult> GetCustomerByID(int customerid) { ... }
        // --- End: Removed API Endpoints ---


        /// <summary>
        /// This endpoint initiates a machine learning implementation process.
        /// 1. It validates the required customerID parameter.
        /// 2. It runs four distinct model processing steps in a defined sequence (Model C, Models A & B in parallel, Model D).
        /// 3. It manages TensorFlow sessions for the parallel steps.
        /// 4. It stores intermediate and final results in a combination of JIT memory (via Jit_Memory_Object) and the database (via YourDbContext).
        /// 5. It ensures resources (TensorFlow sessions) are disposed of upon completion or error.
        /// 6. Progress and errors are logged with timestamps.
        /// </summary>
        /// <param name="customerID">The ID of the customer for whom to perform the ML implementation.</param>
        /// <returns>The final Modeldbinit object representing the results of the ML implementation.</returns>
        [HttpPost("Machine_Learning_Implementation_One/{customerID?}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Modeldbinit))] // Changed return type to Modeldbinit
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<Modeldbinit>> Machine_Learning_Implementation_One(int? customerID = null) // Kept original name
        {
            if (!customerID.HasValue)
            {
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error: CustomerID is required for ML implementation");
                return BadRequest("CustomerID is required for machine learning implementation");
            }

            // Generate unique session ID for this ML implementation
            var sessionId = Interlocked.Increment(ref _sessionCounter);
            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting ML Implementation Session {sessionId} for customer {customerID.Value}");

            // Create a new DbContext instance for this request scope to prevent cross-request state issues
            // Added: April 20, 2025 2:35:04 PM America/Denver
            using (var requestDbContext = GetNewDbContext()) // Using helper method
            {
                try
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Preparing parallel implementation");

                    // Initialize model containers and results storage
                    // Note: The Modeldbinit object created here is not directly saved to the DB until ProcessFactoryFour
                    var modelInit = new Modeldbinit(); // Main container for model results
                    var modelAResults = new ConcurrentDictionary<string, object>(); // Thread-safe storage for Model A results
                    var modelBResults = new ConcurrentDictionary<string, object>(); // Thread-safe storage for Model B results

                    // Create TensorFlow sessions for parallel processing
                    // Note: TensorFlow sessions need explicit disposal.
                    var sessionA = new Session(); // TensorFlow session for Model A
                    var sessionB = new Session(); // TensorFlow session for Model B

                    // Execute Model C (ProcessFactoryOne) independently first
                    await ProcessFactoryOne(modelInit, customerID.Value, sessionId, requestDbContext); // Pass request-scoped context

                    // Retrieve the Modeldbinit object from the context after ProcessFactoryOne might have created/updated it.
                    // This ensures we have the tracked entity if needed later, although ProcessFactoryFour fetches it again.
                    // Added: April 20, 2025 2:35:04 PM America/Denver
                    var updatedModelInit = await requestDbContext.ModelDbInits
                                                .FirstOrDefaultAsync(m => m.CustomerId == customerID.Value);
                    if (updatedModelInit != null)
                    {
                        modelInit = updatedModelInit; // Update the local modelInit object reference
                    }
                    else
                    {
                        // This indicates ProcessFactoryOne failed to create the Modeldbinit record.
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryOne failed to create/find Modeldbinit for customer {customerID.Value}. Cannot proceed with subsequent models.");
                        return StatusCode(StatusCodes.Status500InternalServerError, "Failed to initialize model data."); // Use StatusCodes
                    }


                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Starting parallel model training");

                    // Execute Models A and B (ProcessFactoryTwo and ProcessFactoryThree) in parallel
                    // Note: Pass the updated modelInit reference if subsequent factories are expected to modify it directly,
                    // but the current logic fetches from DB in each factory anyway. Passing dbContext is key.
                    await Task.WhenAll(
                        ProcessFactoryTwo(modelInit, customerID.Value, sessionId, sessionA, modelAResults, requestDbContext), // Pass request-scoped context
                        ProcessFactoryThree(modelInit, customerID.Value, sessionId, sessionB, modelBResults, requestDbContext) // Pass request-scoped context
                    );


                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Parallel model training finished. Starting Model D.");

                    // Execute Model D (ProcessFactoryFour) after parallel processing completes
                    // Uses results from Models A and B for final processing
                    await ProcessFactoryFour(modelInit, customerID.Value, sessionId, modelAResults, modelBResults, requestDbContext); // Pass request-scoped context


                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ML Implementation completed successfully");
                    // Retrieve the final state of Modeldbinit before returning
                    // Use AsNoTracking if this DbContext instance shouldn't track it further after returning.
                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                    var finalModelInit = await requestDbContext.ModelDbInits
                                                .AsNoTracking() // Fetch without tracking for the response
                                                .FirstOrDefaultAsync(m => m.CustomerId == customerID.Value);

                    if (finalModelInit != null)
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Returning final Modeldbinit record for customer {customerID.Value}");
                        return Ok(finalModelInit);
                    }
                    else
                    {
                        // This case should ideally not happen if ProcessFactoryOne created the record and subsequent steps didn't delete it.
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Final Modeldbinit record not found for customer {customerID.Value} after implementation.");
                        return StatusCode(StatusCodes.Status500InternalServerError, "ML implementation completed, but final model record was not found."); // Use StatusCodes
                    }

                }
                catch (Exception ex)
                {
                    // Log error and return 500 status code
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Error in ML Implementation: {ex.Message}");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                    return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error during ML implementation: {ex.Message}"); // Use StatusCodes
                }
                finally
                {
                    // Cleanup: Dispose TensorFlow sessions
                    // Changed from ConcurrentDictionary to direct disposal as they are created per request.
                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                    sessionA?.Dispose();
                    sessionB?.Dispose();

                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Resources cleaned up");
                }
            } // requestDbContext is disposed here
        }

        /// <summary>
        /// Helper method to create a new DbContext instance for a request.
        /// Added: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        /// <returns>A new instance of YourDbContext.</returns>
        private YourDbContext GetNewDbContext()
        {
            // Create options for new context instances using the original controller's _dbContext connection string.
            // This assumes the original _dbContext has a valid connection string configured when the controller is constructed.
            var optionsBuilder = new DbContextOptionsBuilder<YourDbContext>();
            // Note: _dbContext.Database.GetConnectionString() will throw if _dbContext is null or not configured.
            // In a real application using dependency injection, you would likely inject a DbContextOptions<YourDbContext>
            // or a factory (e.g., IDbContextFactory<YourDbContext>) here instead of relying on _dbContext.
            optionsBuilder.UseSqlServer(_dbContext.Database.GetConnectionString());
            return new YourDbContext(optionsBuilder.Options);
        }


        // --- Start: ProcessFactoryOne (Model C) ---
        /// <summary>
        /// Processes data for Model C (ProcessFactoryOne).
        /// Creates or retrieves the Modeldbinit record and associated dependency records.
        /// This factory also includes placeholder TensorFlow training logic for Model C.
        /// Added parameter for request-scoped DbContext.
        /// Modified: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        private async Task ProcessFactoryOne(Modeldbinit model, int customerID, int sessionId, YourDbContext dbContext) // Added dbContext parameter
        {
            Jit_Memory_Object.AddProperty("ProcessFactoryOneActive", true);
            bool isActive = (bool)Jit_Memory_Object.GetProperty("ProcessFactoryOneActive");
            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryOneActive property value: {isActive}");
            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Starting ProcessFactoryOne (Model C)");

            // Use the passed-in dbContext
            var context = dbContext;

            try
            {
                // First ensure Modeldbinit exists
                // Use the passed-in context
                var ML_Model = await context.ModelDbInits
                    .AsNoTracking() // Use AsNoTracking if not intending to modify immediately after fetching
                    .FirstOrDefaultAsync(m => m.CustomerId == customerID);


                if (ML_Model == null)
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No existing Modeldbinit found for Customer with ID {customerID}. Initializing new model.");

                    // Get the maximum ID from the ModelDbInit table to assign a new ID
                    // Use the passed-in context
                    var maxId = await context.ModelDbInits
                        .MaxAsync(m => (int?)m.Id) ?? 0;

                    ML_Model = new Modeldbinit
                    {
                        CustomerId = customerID,
                        Modeldbinittimestamp = DateTime.UtcNow,
                        Id = maxId + 1, // Use next available ID
                        ModelDbInitCatagoricalId = null, // Kept as nullable
                        ModelDbInitCatagoricalName = null, // Kept as nullable
                        ModelDbInitModelData = null, // Kept as nullable byte array
                                                     // Initialize other new fields to null or default as well
                        Data = null,
                        ModelDbInitProductVector = null,
                        ModelDbInitServiceVector = null
                    };

                    // Add the new model using the passed-in context
                    context.ModelDbInits.Add(ML_Model);

                    // Save changes to create the Modeldbinit record
                    // Wrap in a transaction for atomicity if multiple related inserts happen here.
                    using (var transaction = await context.Database.BeginTransactionAsync())
                    {
                        try
                        {
                            await context.SaveChangesAsync();
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created new Modeldbinit record with ID {ML_Model.Id} for customer {customerID}");


                            // Create associated records after Modeldbinit exists
                            // Use the passed-in context for database operations
                            var clientOrder = await context.ClientOrders
                                .AsNoTracking() // Use AsNoTracking if not modifying
                                .FirstOrDefaultAsync(c => c.CustomerId == customerID);

                            if (clientOrder == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Creating new ClientOrder record for CustomerId: {customerID}");
                                clientOrder = new ClientOrder
                                {
                                    CustomerId = customerID,
                                    OrderId = customerID // Assuming OrderId is same as CustomerId for simplicity
                                };
                                context.ClientOrders.Add(clientOrder);
                                await context.SaveChangesAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created ClientOrder record with ID {clientOrder.Id}");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing ClientOrder record found for CustomerId: {customerID}");
                            }


                            // Create associated records Continued...
                            // Use the passed-in context for database operations
                            var operation = await context.ModelDbInitOperations
                                .AsNoTracking() // Use AsNoTracking if not modifying
                                .FirstOrDefaultAsync(o => o.CustomerId == customerID);

                            if (operation == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Creating new ModelDbInitOperation record for CustomerId: {customerID}");
                                operation = new ModelDbInitOperation
                                {
                                    CustomerId = customerID,
                                    OrderId = customerID, // Assuming OrderId is same as CustomerId
                                    OperationsId = customerID, // Assuming OperationsId is same as CustomerId
                                    Data = null // Initialize Data to null
                                };
                                context.ModelDbInitOperations.Add(operation);
                                await context.SaveChangesAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created ModelDbInitOperation record with ID {operation.Id}");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing ModelDbInitOperation record found for CustomerId: {customerID}");
                            }


                            // Create associated records Continued...
                            // Use the passed-in context for database operations
                            var qa = await context.ModelDbInitQas
                                .AsNoTracking() // Use AsNoTracking if not modifying
                                .FirstOrDefaultAsync(q => q.CustomerId == customerID);

                            if (qa == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Creating new ModelDbInitQa record for CustomerId: {customerID}");
                                qa = new ModelDbInitQa
                                {
                                    CustomerId = customerID,
                                    OrderId = customerID,
                                    Data = null
                                };
                                context.ModelDbInitQas.Add(qa);
                                await context.SaveChangesAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created ModelDbInitQa record with ID {qa.Id}");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing ModelDbInitQa record found for CustomerId: {customerID}");
                            }


                            // Create associated records Continued...
                            // Use the passed-in context for database operations
                            var operationsStage1 = await context.OperationsStage1s
                                .AsNoTracking() // Use AsNoTracking if not modifying
                                .FirstOrDefaultAsync(o => o.CustomerId == customerID);

                            if (operationsStage1 == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Creating new OperationsStage1 record for CustomerId: {customerID}");
                                operationsStage1 = new OperationsStage1
                                {
                                    CustomerId = customerID,
                                    OrderId = customerID,
                                    OperationsId = customerID,
                                    OperationalId = customerID,
                                    CsrOpartationalId = customerID,
                                    SalesId = customerID,
                                    SubServiceA = null, // Initialize nullable ints to null
                                    SubServiceB = null,
                                    SubServiceC = null,
                                    SubProductA = null,
                                    SubProductB = null,
                                    SubProductC = null,
                                    Data = null, // Initialize Data to null string
                                    OperationsStageOneProductVector = null, // Initialize vector strings to null
                                    OperationsStageOneServiceVector = null
                                };
                                context.OperationsStage1s.Add(operationsStage1);
                                await context.SaveChangesAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created OperationsStage1 record with ID {operationsStage1.Id}");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing OperationsStage1 record found for CustomerId: {customerID}");
                            }

                            // Add Objects At Runtime to JIT Memory
                            // Store the *newly created or retrieved* records in JIT memory
                            // Modified: April 20, 2025 2:35:04 PM America/Denver
                            Jit_Memory_Object.AddProperty("ClientOrderRecord", clientOrder);
                            Jit_Memory_Object.AddProperty("OperationsRecord", operation);
                            Jit_Memory_Object.AddProperty("QaRecord", qa);
                            Jit_Memory_Object.AddProperty("OperationsStage1Record", operationsStage1);
                            Jit_Memory_Object.AddProperty("ModelDbinitRecord", ML_Model); // Store the Modeldbinit record too


                            // Log JIT Memory Object INFO
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - ClientOrder ID: {clientOrder?.Id}"); // Added null check
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - Operations ID: {operation?.Id}"); // Added null check
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - QA ID: {qa?.Id}"); // Added null check
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - OperationsStage1 ID: {operationsStage1?.Id}"); // Added null check
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - Modeldbinit ID: {ML_Model?.Id}"); // Added verification for Modeldbinit

                            await transaction.CommitAsync(); // Commit the transaction
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Database operations in ProcessFactoryOne (new model) committed.");

                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync(); // Rollback on error
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error during database transaction in ProcessFactoryOne (new model): {ex.Message}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                            throw; // Rethrow to be caught by the main try-catch
                        }
                    } // End of transaction scope


                    // --- Start: Placeholder TensorFlow Model C Logic ---
                    // This block contains the TensorFlow training logic from the original code.
                    // It is included here structurally but will likely fail without a configured TensorFlow environment.
                    // The training uses fields from the newly created ML_Model as input features and target.
                    // Added: April 20, 2025 2:35:04 PM America/Denver
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting Placeholder Model C Training");
                    await Task.Run(async () => // Marked lambda as async
                    {
                        try
                        {
                            // Use the newly created ML_Model for input data
                            var modelId = ML_Model.Id;
                            var modelCustomerId = ML_Model.CustomerId;
                            var modelTimeStamp = ML_Model.Modeldbinittimestamp;
                            var modelCategoricalId = ML_Model.ModelDbInitCatagoricalId;
                            var modelCategoricalName = ML_Model.ModelDbInitCatagoricalName;
                            var modelDataBool = ML_Model.ModelDbInitModelData != null && ML_Model.ModelDbInitModelData.Length > 0; // Interpret binary data presence as a boolean feature

                            int epochs = 100;
                            float learningRate = 0.0001f;

                            // Check if TensorFlow is initialized and configured
                            if (tf == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] TensorFlow is not initialized. Skipping Model C training.");
                                return; // Exit the async Task.Run
                            }


                            tf.compat.v1.disable_eager_execution();
                            var g = tf.Graph();
                            using (var sess = tf.Session(g))
                            {
                                // Define input shape based on number of Modeldbinit fields used as features
                                var numberOfFeatures = 5; // Id, CustomerId, Timestamp, CatagoricalId, CatagoricalName (bool)
                                var x = tf.placeholder(tf.float32, shape: new[] { -1, numberOfFeatures }, name: "input");
                                var y = tf.placeholder(tf.float32, shape: new[] { -1, 1 }, name: "output"); // Assuming a single output


                                var W = tf.Variable(tf.random.normal(new[] { numberOfFeatures, 1 }, mean: 0.0f, stddev: 0.01f), name: "weight");
                                var b = tf.Variable(tf.zeros(new[] { 1 }), name: "bias");

                                var predictions = tf.add(tf.matmul(x, W), b);
                                var loss = tf.reduce_mean(tf.square(predictions - y)) * 0.5f;

                                var optimizer = tf.train.GradientDescentOptimizer(learningRate);
                                var trainOp = optimizer.minimize(loss);

                                // Create input array with single sample (current Modeldbinit values)
                                var inputData = new float[1, numberOfFeatures];
                                inputData[0, 0] = modelId;
                                inputData[0, 1] = modelCustomerId.HasValue ? (float)modelCustomerId.Value : 0f; // Handle nullable int
                                inputData[0, 2] = modelTimeStamp.HasValue ? (float)((DateTimeOffset)modelTimeStamp.Value).ToUnixTimeSeconds() : 0f; // Handle nullable DateTime
                                inputData[0, 3] = modelCategoricalId.HasValue ? (float)modelCategoricalId.Value : 0f; // Handle nullable int
                                inputData[0, 4] = modelCategoricalName != null ? 1f : 0f; // Convert string presence to float (0 or 1)


                                // Create target data (using modelId as example target - adjust as needed for your actual ML task)
                                // This target should be meaningful for the ML problem Model C is solving.
                                var targetData = new float[1, 1];
                                targetData[0, 0] = (float)customerID; // Example: use customer ID as target


                                sess.run(tf.global_variables_initializer());

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C - Data shapes:");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Input data shape: {inputData.GetLength(0)} x {inputData.GetLength(1)}");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Target data shape: {targetData.GetLength(0)} x {targetData.GetLength(1)}");

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C - Starting training with learning rate: {learningRate}");
                                float previousLoss = float.MaxValue;
                                int stableCount = 0;

                                for (int epoch = 0; epoch < epochs; epoch++)
                                {
                                    var feedDict = new Dictionary<Tensor, object>
                                        {
                                            { x, inputData },
                                            { y, targetData }
                                        };

                                    var feedItems = feedDict.Select(kv => new FeedItem(kv.Key, kv.Value)).ToArray();

                                    sess.run(trainOp, feedItems);
                                    var currentLoss = (float)sess.run(loss, feedItems);

                                    if (float.IsNaN(currentLoss) || float.IsInfinity(currentLoss))
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C - Training diverged at epoch {epoch}. Stopping training.");
                                        break;
                                    }

                                    if (Math.Abs(previousLoss - currentLoss) < 1e-6) // Use a small epsilon for convergence
                                    {
                                        stableCount++;
                                        if (stableCount > 5) // Require 5 stable epochs
                                        {
                                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C - Training converged at epoch {epoch}");
                                            break;
                                        }
                                    }
                                    else
                                    {
                                        stableCount = 0; // Reset count if loss changes significantly
                                    }
                                    previousLoss = currentLoss;

                                    if (epoch % 10 == 0) // Log periodically
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C - Epoch {epoch}, Loss: {currentLoss:E4}");
                                    }
                                }

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C - Training completed");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C - Final loss: {previousLoss:E4}");

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting Model C model serialization process");
                                using (var memoryStream = new MemoryStream())
                                using (var writer = new BinaryWriter(memoryStream))
                                {
                                    // Serialize Weights
                                    var wNDArray = (NDArray)sess.run(W);
                                    var wData = wNDArray.ToArray<float>();
                                    writer.Write(wData.Length);
                                    foreach (var w in wData)
                                    {
                                        writer.Write(w);
                                    }
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C weights serialized successfully ({wData.Length} floats)");


                                    // Serialize Bias
                                    var bNDArray = (NDArray)sess.run(b);
                                    var bData = bNDArray.ToArray<float>();
                                    writer.Write(bData.Length);
                                    foreach (var bias in bData)
                                    {
                                        writer.Write(bias);
                                    }
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C bias serialized successfully ({bData.Length} floats)");


                                    // Store the serialized model data (weights and biases) in the Modeldbinit object's Data field
                                    // Note: This will overwrite any previous data in ML_Model.Data.
                                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                                    ML_Model.Data = memoryStream.ToArray(); // Store the serialized data in the Data field
                                    Jit_Memory_Object.AddProperty("ProcessFactoryOne_Data", ML_Model.Data); // Store in JIT memory as well


                                    // Save the updated Modeldbinit object to the database using the passed-in context
                                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                                    using (var dbContextForSave = GetNewDbContext()) // Get a new context instance
                                    {
                                        try
                                        {
                                            // Fetch the Modeldbinit record again to ensure it's tracked by the current context if needed for update
                                            // Or, ensure the 'ML_Model' object is already tracked by 'context'.
                                            // Since we fetched with AsNoTracking, we need to attach or re-fetch a tracked entity.
                                            // Re-fetching and updating is safer.
                                            var dbModelDbInit = await dbContextForSave.ModelDbInits // Use the new context
                                                .FirstOrDefaultAsync(m => m.Id == ML_Model.Id); // Fetch by ID

                                            if (dbModelDbInit != null)
                                            {
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found Modeldbinit record for ID: {ML_Model.Id} for Model C data update.");
                                                dbModelDbInit.Data = ML_Model.Data; // Update the Data field
                                                dbModelDbInit.Modeldbinittimestamp = DateTime.UtcNow; // Update timestamp
                                                                                                      // Update other relevant fields if Model C modifies them
                                                dbModelDbInit.ModelDbInitCatagoricalId = ML_Model.ModelDbInitCatagoricalId; // Example: update based on model output
                                                dbModelDbInit.ModelDbInitCatagoricalName = ML_Model.ModelDbInitCatagoricalName; // Example: update based on model output
                                                dbModelDbInit.ModelDbInitModelData = ML_Model.ModelDbInitModelData; // Example: update this field too if Model C generates this data

                                                dbContextForSave.ModelDbInits.Update(dbModelDbInit); // Explicitly mark as modified
                                                await dbContextForSave.SaveChangesAsync(); // Save changes
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C data saved to Modeldbinit record successfully.");
                                            }
                                            else
                                            {
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No Modeldbinit record found for ID: {ML_Model.Id} to save Model C data.");
                                            }
                                        }
                                        catch (Exception dbEx)
                                        {
                                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error saving Model C data to database: {dbEx.Message}");
                                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {dbEx.StackTrace}");
                                            // Decide if you want to rethrow or handle
                                            throw; // Rethrow to be caught by the outer try-catch
                                        }
                                    } // dbContextForSave is disposed here


                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C data saved successfully");

                                    // Verification using JIT memory
                                    var storedCustomerId = Jit_Memory_Object.GetProperty("CustomerId"); // This should be the customerID passed in
                                    var storedModelCData = Jit_Memory_Object.GetProperty("ProcessFactoryOne_Data") as byte[];
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification (JIT Memory) - Customer ID: {storedCustomerId}");
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification (JIT Memory) - Data Size: {storedModelCData?.Length ?? 0} bytes");
                                }
                            }
                        }
                        catch (Exception ex) // Catch for the Task.Run block (TensorFlow training)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in Model C training (ProcessFactoryOne NN): {ex.Message}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                            throw; // Rethrow to be caught by the outer try-catch
                        }
                    }); // End of Task.Run
                        // --- End: Placeholder TensorFlow Model C Logic ---

                } // End of if (ML_Model == null) block


                else // Existing model found
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing Modeldbinit found for Customer ID {customerID}");

                    // Store In Memory At Runtime - Store properties from the existing record
                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                    Jit_Memory_Object.AddProperty("CustomerId", ML_Model.CustomerId);
                    Jit_Memory_Object.AddProperty("ModelDbInitTimeStamp", ML_Model.Modeldbinittimestamp);
                    Jit_Memory_Object.AddProperty("Id", ML_Model.Id);
                    Jit_Memory_Object.AddProperty("ProcessFactoryOne_Data", ML_Model.Data); // Store existing Model C data if any
                    Jit_Memory_Object.AddProperty("ModelDbinitRecord", ML_Model); // Store the existing Modeldbinit record

                    // Retrieve based upon customer ID or Create associated records
                    // Use the passed-in context for database operations
                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                    using (var transaction = await context.Database.BeginTransactionAsync())
                    {
                        try
                        {
                            var clientOrder = await context.ClientOrders
                                .FirstOrDefaultAsync(c => c.CustomerId == customerID); // Use passed-in context, remove AsNoTracking if potentially adding

                            if (clientOrder == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Creating new ClientOrder record for CustomerId: {customerID} (existing Modeldbinit)");
                                clientOrder = new ClientOrder
                                {
                                    CustomerId = customerID,
                                    OrderId = customerID
                                };
                                context.ClientOrders.Add(clientOrder);
                                await context.SaveChangesAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created ClientOrder record with ID {clientOrder.Id}");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing ClientOrder record found for CustomerId: {customerID}");
                            }


                            // Retrieve based upon customer ID or Create associated records Continued...
                            // Use the passed-in context for database operations
                            var operation = await context.ModelDbInitOperations
                                .FirstOrDefaultAsync(o => o.CustomerId == customerID); // Use passed-in context, remove AsNoTracking if potentially adding

                            if (operation == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Creating new ModelDbInitOperation record for CustomerId: {customerID} (existing Modeldbinit)");
                                operation = new ModelDbInitOperation
                                {
                                    CustomerId = customerID,
                                    OrderId = customerID,
                                    OperationsId = customerID,
                                    Data = null
                                };
                                context.ModelDbInitOperations.Add(operation);
                                await context.SaveChangesAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created ModelDbInitOperation record with ID {operation.Id}");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing ModelDbInitOperation record found for CustomerId: {customerID}");
                            }


                            // Retrieve based upon customer ID or Create associated records Continued...
                            // Use the passed-in context for database operations
                            var qa = await context.ModelDbInitQas
                                .FirstOrDefaultAsync(q => q.CustomerId == customerID); // Use passed-in context, remove AsNoTracking if potentially adding

                            if (qa == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Creating new ModelDbInitQa record for CustomerId: {customerID} (existing Modeldbinit)");
                                qa = new ModelDbInitQa
                                {
                                    CustomerId = customerID,
                                    OrderId = customerID,
                                    Data = null
                                };
                                context.ModelDbInitQas.Add(qa);
                                await context.SaveChangesAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created ModelDbInitQa record with ID {qa.Id}");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing ModelDbInitQa record found for CustomerId: {customerID}");
                            }


                            // Retrieve based upon customer ID or Create associated records Continued...
                            // Use the passed-in context for database operations
                            var operationsStage1 = await context.OperationsStage1s
                                .FirstOrDefaultAsync(o => o.CustomerId == customerID); // Use passed-in context, remove AsNoTracking if potentially adding

                            if (operationsStage1 == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Creating new OperationsStage1 record for CustomerId: {customerID} (existing Modeldbinit)");
                                operationsStage1 = new OperationsStage1
                                {
                                    CustomerId = customerID,
                                    OrderId = customerID,
                                    OperationsId = customerID,
                                    OperationalId = customerID,
                                    CsrOpartationalId = customerID,
                                    SalesId = customerID,
                                    SubServiceA = null, // Initialize nullable ints to null
                                    SubServiceB = null,
                                    SubServiceC = null,
                                    SubProductA = null,
                                    SubProductB = null,
                                    SubProductC = null,
                                    Data = null,
                                    OperationsStageOneProductVector = null,
                                    OperationsStageOneServiceVector = null
                                };
                                context.OperationsStage1s.Add(operationsStage1);
                                await context.SaveChangesAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Created OperationsStage1 record with ID {operationsStage1.Id}");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Existing OperationsStage1 record found for CustomerId: {customerID}");
                            }

                            // Store the retrieved or newly created records in JIT memory
                            // Modified: April 20, 2025 2:35:04 PM America/Denver
                            Jit_Memory_Object.AddProperty("ClientOrderRecord", clientOrder);
                            Jit_Memory_Object.AddProperty("OperationsRecord", operation);
                            Jit_Memory_Object.AddProperty("QaRecord", qa);
                            Jit_Memory_Object.AddProperty("OperationsStage1Record", operationsStage1);

                            // Store in memory at Runtime INFO
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - CustomerId: {customerID}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - ClientOrder ID: {clientOrder?.Id}"); // Added null check
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - Operations ID: {operation?.Id}"); // Added null check
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - QA ID: {qa?.Id}"); // Added null check
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - OperationsStage1 ID: {operationsStage1?.Id}"); // Added null check

                            await transaction.CommitAsync(); // Commit the transaction
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Database operations in ProcessFactoryOne (existing model) committed.");
                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync(); // Rollback on error
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error during database transaction in ProcessFactoryOne (existing model): {ex.Message}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                            throw; // Rethrow to be caught by the main try-catch
                        }
                    } // End of transaction scope


                    // --- Start: Placeholder TensorFlow Model C Logic (for existing model) ---
                    // This block contains the TensorFlow training logic, potentially for updating an existing model.
                    // It is included here structurally but will likely fail without a configured TensorFlow environment.
                    // The training uses fields from the retrieved ML_Model as input features and target.
                    // Added: April 20, 2025 2:35:04 PM America/Denver
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting Placeholder Model C Training (existing model)");
                    await Task.Run(async () => // Marked lambda as async
                    {
                        try
                        {
                            // Use the retrieved ML_Model for input data
                            var modelId = ML_Model.Id;
                            var modelCustomerId = ML_Model.CustomerId;
                            var modelTimeStamp = ML_Model.Modeldbinittimestamp;
                            var modelCategoricalId = ML_Model.ModelDbInitCatagoricalId;
                            var modelCategoricalName = ML_Model.ModelDbInitCatagoricalName;
                            var modelDataBool = ML_Model.ModelDbInitModelData != null && ML_Model.ModelDbInitModelData.Length > 0; // Interpret binary data presence as a boolean feature

                            int epochs = 100;
                            float learningRate = 0.0001f;

                            // Check if TensorFlow is initialized and configured
                            if (tf == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] TensorFlow is not initialized. Skipping Model C (Existing) training.");
                                return; // Exit the async Task.Run
                            }


                            tf.compat.v1.disable_eager_execution();
                            var g = tf.Graph();
                            using (var sess = tf.Session(g))
                            {
                                // Define input shape based on number of Modeldbinit fields used as features
                                var numberOfFeatures = 5; // Id, CustomerId, Timestamp, CatagoricalId, CatagoricalName (bool)
                                var x = tf.placeholder(tf.float32, shape: new[] { -1, numberOfFeatures }, name: "input");
                                var y = tf.placeholder(tf.float32, shape: new[] { -1, 1 }, name: "output"); // Assuming a single output


                                var W = tf.Variable(tf.random.normal(new[] { numberOfFeatures, 1 }, mean: 0.0f, stddev: 0.01f), name: "weight");
                                var b = tf.Variable(tf.zeros(new[] { 1 }), name: "bias");

                                var predictions = tf.add(tf.matmul(x, W), b);
                                var loss = tf.reduce_mean(tf.square(predictions - y)) * 0.5f;

                                var optimizer = tf.train.GradientDescentOptimizer(learningRate);
                                var trainOp = optimizer.minimize(loss);

                                // Create input array with single sample (current Modeldbinit values)
                                var inputData = new float[1, numberOfFeatures];
                                inputData[0, 0] = modelId;
                                inputData[0, 1] = modelCustomerId.HasValue ? (float)modelCustomerId.Value : 0f; // Handle nullable int
                                inputData[0, 2] = modelTimeStamp.HasValue ? (float)((DateTimeOffset)modelTimeStamp.Value).ToUnixTimeSeconds() : 0f; // Handle nullable DateTime
                                inputData[0, 3] = modelCategoricalId.HasValue ? (float)modelCategoricalId.Value : 0f; // Handle nullable int
                                inputData[0, 4] = modelCategoricalName != null ? 1f : 0f; // Convert string presence to float (0 or 1)


                                // Create target data (using customerID as example target)
                                var targetData = new float[1, 1];
                                targetData[0, 0] = (float)customerID; // Example: use customer ID as target


                                sess.run(tf.global_variables_initializer());

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) - Data shapes:");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Input data shape: {inputData.GetLength(0)} x {inputData.GetLength(1)}");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Target data shape: {targetData.GetLength(0)} x {targetData.GetLength(1)}");

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) - Starting training with learning rate: {learningRate}");
                                float previousLoss = float.MaxValue;
                                int stableCount = 0;

                                for (int epoch = 0; epoch < epochs; epoch++)
                                {
                                    var feedDict = new Dictionary<Tensor, object>
                                        {
                                            { x, inputData },
                                            { y, targetData }
                                        };

                                    var feedItems = feedDict.Select(kv => new FeedItem(kv.Key, kv.Value)).ToArray();

                                    sess.run(trainOp, feedItems);
                                    var currentLoss = (float)sess.run(loss, feedItems);

                                    if (float.IsNaN(currentLoss) || float.IsInfinity(currentLoss))
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) - Training diverged at epoch {epoch}. Stopping training.");
                                        break;
                                    }

                                    if (Math.Abs(previousLoss - currentLoss) < 1e-6) // Use a small epsilon for convergence
                                    {
                                        stableCount++;
                                        if (stableCount > 5) // Require 5 stable epochs
                                        {
                                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) - Training converged at epoch {epoch}");
                                            break;
                                        }
                                    }
                                    else
                                    {
                                        stableCount = 0; // Reset count if loss changes significantly
                                    }
                                    previousLoss = currentLoss;

                                    if (epoch % 10 == 0) // Log periodically
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) - Epoch {epoch}, Loss: {currentLoss:E4}");
                                    }
                                }

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) - Training completed");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) - Final loss: {previousLoss:E4}");

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting Model C (Existing) model serialization process");
                                using (var memoryStream = new MemoryStream())
                                using (var writer = new BinaryWriter(memoryStream))
                                {
                                    // Serialize Weights
                                    var wNDArray = (NDArray)sess.run(W);
                                    var wData = wNDArray.ToArray<float>();
                                    writer.Write(wData.Length);
                                    foreach (var w in wData)
                                    {
                                        writer.Write(w);
                                    }
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) weights serialized successfully ({wData.Length} floats)");


                                    // Serialize Bias
                                    var bNDArray = (NDArray)sess.run(b);
                                    var bData = bNDArray.ToArray<float>();
                                    writer.Write(bData.Length);
                                    foreach (var bias in bData)
                                    {
                                        writer.Write(bias);
                                    }
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) bias serialized successfully ({bData.Length} floats)");


                                    // Store the serialized model data in the ModelDbinit object's Data field
                                    // This will update the Data field of the ML_Model object retrieved from the DB.
                                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                                    ML_Model.Data = memoryStream.ToArray();
                                    Jit_Memory_Object.AddProperty("ProcessFactoryOne_Data", ML_Model.Data); // Update in JIT memory

                                    // Save the updated Modeldbinit object to the database using the passed-in context
                                    // Need a new context or ensure the existing one is tracking ML_Model and save changes.
                                    // Re-fetching with a new transient context and updating is a common pattern in async operations.
                                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                                    using (var dbContextForSave = GetNewDbContext()) // Get a new context instance
                                    {
                                        try
                                        {
                                            var dbModelDbInit = await dbContextForSave.ModelDbInits // Use the new context
                                               .FirstOrDefaultAsync(m => m.Id == ML_Model.Id); // Fetch the entity to be updated

                                            if (dbModelDbInit != null)
                                            {
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found Modeldbinit record for ID: {ML_Model.Id} for Model C (Existing) data update.");
                                                dbModelDbInit.Data = ML_Model.Data; // Update the Data field
                                                dbModelDbInit.Modeldbinittimestamp = DateTime.UtcNow; // Update timestamp
                                                                                                      // Update other relevant fields if Model C modifies them
                                                dbModelDbInit.ModelDbInitCatagoricalId = ML_Model.ModelDbInitCatagoricalId; // Example
                                                dbModelDbInit.ModelDbInitCatagoricalName = ML_Model.ModelDbInitCatagoricalName; // Example
                                                dbModelDbInit.ModelDbInitModelData = ML_Model.ModelDbInitModelData; // Example

                                                dbContextForSave.ModelDbInits.Update(dbModelDbInit); // Explicitly mark as modified
                                                await dbContextForSave.SaveChangesAsync(); // Save changes
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) data saved to Modeldbinit record successfully.");
                                            }
                                            else
                                            {
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No Modeldbinit record found for ID: {ML_Model.Id} to save Model C (Existing) data.");
                                            }
                                        }
                                        catch (Exception dbEx)
                                        {
                                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error saving Model C (Existing) data to database: {dbEx.Message}");
                                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {dbEx.StackTrace}");
                                            throw; // Rethrow to be caught by the outer try-catch
                                        }
                                    } // dbContextForSave is disposed here


                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model C (Existing) data saved successfully");

                                    // Verification using JIT memory
                                    var storedCustomerId = Jit_Memory_Object.GetProperty("CustomerId");
                                    var storedModelCData = Jit_Memory_Object.GetProperty("ProcessFactoryOne_Data") as byte[];
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification (JIT Memory) - Customer ID: {storedCustomerId}");
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification (JIT Memory) - Data Size: {storedModelCData?.Length ?? 0} bytes");
                                }
                            }
                        }
                        catch (Exception ex) // Catch for the Task.Run block (TensorFlow training)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in Model C training (ProcessFactoryOne NN, existing): {ex.Message}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                            throw; // Rethrow to be caught by the outer try-catch
                        }
                    }); // End of Task.Run
                        // --- End: Placeholder TensorFlow Model C Logic (for existing model) ---
                }
            } // End of main try block in ProcessFactoryOne
            catch (Exception ex) // Catch for database operations and Task.Run exceptions
            {
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryOne: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                throw; // Rethrow the exception to be caught by the main try-catch in the controller method
            }
            finally
            {
                Jit_Memory_Object.AddProperty("ProcessFactoryOneActive", false);
                bool isActive = (bool)Jit_Memory_Object.GetProperty("ProcessFactoryOneActive");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryOneActive property value after execution: {isActive}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH::mm:ss.fff}] Session {sessionId}: ProcessFactoryOne (Model C) finished.");
            }
        }
        // --- End: ProcessFactoryOne (Model C) ---


        // --- Start: ProcessFactoryTwo (Model A) ---
        /// <summary>
        /// Processes data for Model A (ProcessFactoryTwo).
        /// Performs clustering and neural network training using product data.
        /// This factory includes placeholder TensorFlow training logic for Model A.
        /// Added parameter for request-scoped DbContext.
        /// Modified: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        private async Task ProcessFactoryTwo(Modeldbinit model, int customerID, int sessionId,
      Session session, ConcurrentDictionary<string, object> results, YourDbContext dbContext) // Added dbContext parameter
        {
            // Use the passed-in dbContext
            var threadContext = dbContext;

            // Set tracking behavior - Using the passed-in context
            threadContext.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.TrackAll;

            try
            {
                Jit_Memory_Object.AddProperty("ProcessFactoryTwoActive", true);
                bool isActive = (bool)Jit_Memory_Object.GetProperty("ProcessFactoryTwoActive");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryTwoActive property value: {isActive}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Starting ProcessFactoryTwo (Model A)");

                // Retrieve OperationsStage1Record from JIT Memory (should have been stored in ProcessFactoryOne)
                var operationsStage1Record = Jit_Memory_Object.GetProperty("OperationsStage1Record") as OperationsStage1;
                var stageSubProducts = new List<int?>();

                if (operationsStage1Record != null)
                {
                    // Use null-conditional operator for safety
                    if (operationsStage1Record.SubProductA.HasValue ||
                        operationsStage1Record.SubProductB.HasValue ||
                        operationsStage1Record.SubProductC.HasValue)
                    {
                        stageSubProducts.Add(operationsStage1Record.SubProductA);
                        stageSubProducts.Add(operationsStage1Record.SubProductB);
                        stageSubProducts.Add(operationsStage1Record.SubProductC);
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] ProcessFactoryTwo: Collected {stageSubProducts.Count} SubProduct IDs from OperationsStage1");
                    }

                    // Retrieve All_SubProducts from JIT Memory (Populated by the constructor's Task.Run if successful)
                    // In a real application, error handling if this is null is needed.
                    var allSubProducts = Jit_Memory_Object.GetProperty("All_SubProducts") as List<dynamic>;

                    if (allSubProducts != null)
                    {
                        // Added safety check for null or non-dynamic items in allSubProducts before filtering
                        var filteredProducts = allSubProducts?.Where(p => p != null && stageSubProducts.Contains((int)p.Id)).ToList();
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] ProcessFactoryTwo: Filtered products count: {filteredProducts?.Count ?? 0}");
                        Jit_Memory_Object.AddProperty("FilteredProducts", filteredProducts);
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] ProcessFactoryTwo: All_SubProducts not found in JIT Memory. Clustering and NN will use an empty list.");
                        Jit_Memory_Object.AddProperty("FilteredProducts", new List<dynamic>()); // Add empty list to avoid null reference
                    }
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] ProcessFactoryTwo: OperationsStage1Record not found in JIT Memory. Clustering and NN will use an empty list.");
                    Jit_Memory_Object.AddProperty("FilteredProducts", new List<dynamic>()); // Add empty list to avoid null reference
                }

                // Retrieve FilteredProducts from JIT Memory
                var FilteredProducts = (List<dynamic>)Jit_Memory_Object.GetProperty("FilteredProducts");

                if (FilteredProducts == null || !FilteredProducts.Any())
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No filtered products available for ProcessFactoryTwo. Skipping clustering and NN.");
                    return; // Exit if no data
                }


                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A Phase One: Initializing Data Clustering Implementation");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found {FilteredProducts.Count} items for Model A Data Clustering");

                // Extract ccvc's for clustering
                var ccvcList = new List<double[]>();
                var ccvcValues = new List<double>();
                // Added safety check for null or non-dynamic items in FilteredProducts
                foreach (dynamic product in FilteredProducts.Where(p => p != null))
                {
                    try
                    {
                        // Use Convert.ToDouble for robustness
                        double ccvcValue = Convert.ToDouble(product.ccvc);
                        ccvcList.Add(new double[] { ccvcValue });
                        ccvcValues.Add(ccvcValue);
                    }
                    catch (Exception ccvcEx)
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error converting CCVC value for product ID {product.Id}: {ccvcEx.Message}");
                        // Decide if you want to skip this product or log the error
                    }
                }
                double[][] ccvcArray = ccvcList.ToArray();


                // Ensure ccvcArray is not empty before proceeding with clustering
                // Added: April 20, 2025 2:35:04 PM America/Denver
                if (ccvcArray.Length < 3) // Need at least 3 data points for 3 clusters (or KMeans might throw)
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Not enough valid CCVC data points ({ccvcArray.Length}) for Model A clustering (requires at least 3). Skipping clustering and NN.");
                    return;
                }

                var sortedCcvc = ccvcValues.OrderBy(v => v).ToList();
                double medianCcvc = sortedCcvc.Count % 2 == 0
                    ? (sortedCcvc[sortedCcvc.Count / 2 - 1] + sortedCcvc[sortedCcvc.Count / 2]) / 2
                    : sortedCcvc[sortedCcvc.Count / 2];

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Median CCVC value: {medianCcvc:F4}");

                int numClusters = 3;
                int numIterations = 100;

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Clustering parameters: clusters={numClusters}, iterations={numIterations}");

                var kmeans_ModelA = new Accord.MachineLearning.KMeans(numClusters)
                {
                    MaxIterations = numIterations,
                    Distance = new SquareEuclidean()
                };

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting k-means clustering for Model A");
                var clusters = kmeans_ModelA.Learn(ccvcArray);

                Jit_Memory_Object.AddProperty("ModelA_Clusters", clusters);
                Jit_Memory_Object.AddProperty("ModelA_ClusterCenters", kmeans_ModelA.Centroids);

                var modelACentroids = kmeans_ModelA.Centroids;
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Processing Model A centroids:");

                // Ensure there are enough centroids before accessing indices
                // Added: April 20, 2025 2:35:04 PM America/Denver
                if (modelACentroids.Length < 3 || modelACentroids.Any(c => c == null || c.Length < 1)) // Check for null centroids or empty centroid arrays
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Not enough valid centroids ({modelACentroids.Length}) for Model A vector calculation. Skipping vector and NN steps.");
                    return;
                }

                var centroidValues = modelACentroids.Select(c => c[0]).OrderBy(v => v).ToList();

                double centroid1 = centroidValues[0]; // Smallest centroid
                double centroid2 = centroidValues[1]; // Middle centroid
                double centroid3 = centroidValues[2]; // Largest centroid

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A Centroid Values: {centroid1:F4}, {centroid2:F4}, {centroid3:F4}");


                double x = centroid1; // Using smallest centroid as X
                double y = centroid2; // Using middle centroid as Y
                double z = centroid3; // Using largest centroid as Z


                double[] vector = { x, y, z };

                double magnitude = Math.Sqrt(x * x + y * y + z * z);

                double nx = (magnitude > 0) ? x / magnitude : 0;
                double ny = (magnitude > 0) ? y / magnitude : 0;
                double nz = (magnitude > 0) ? z / magnitude : 0;

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A Vector Coordinates: X={x:F4}, Y={y:F4}, Z={z:F4}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A Vector Magnitude: {magnitude:F4}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A Normalized Vector: nx={nx:F4}, ny={ny:F4}, nz={nz:F4}");

                Jit_Memory_Object.AddProperty("ModelA_MedianVector", vector);
                Jit_Memory_Object.AddProperty("ModelA_MedianVector_Normalized", new double[] { nx, ny, nz });
                Jit_Memory_Object.AddProperty("ModelA_MedianMagnitude", magnitude);

                var vectorString = $"X={x:F4}, Y={y:F4}, Z={z:F4}, Magnitude={magnitude:F4}, NX={nx:F4}, NY={ny:F4}, NZ={nz:F4}";

                // Database updates using the passed-in context
                // Modified: April 20, 2025 2:35:04 PM America/Denver
                try
                {
                    var customerId = (int?)Jit_Memory_Object.GetProperty("CustomerId"); // Cast to nullable int
                    if (!customerId.HasValue)
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryTwo: CustomerId not found in JIT Memory for DB update.");
                        // Decide if this is a critical error or if processing should continue without DB update.
                        // For now, log and skip DB updates for vector.
                    }
                    else
                    {
                        // Update OperationsStage1 - Use the passed-in context
                        // Use a transaction for atomicity if updating multiple records.
                        using (var transaction = await threadContext.Database.BeginTransactionAsync())
                        {
                            try
                            {
                                // Fetch a tracked instance
                                var operationsStage1 = await threadContext.OperationsStage1s
                                     .FirstOrDefaultAsync(o => o.CustomerId == customerId.Value); // Use the int value

                                if (operationsStage1 != null)
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found OperationsStage1 record for CustomerId: {customerId.Value}");
                                    operationsStage1.OperationsStageOneProductVector = vectorString;
                                    threadContext.OperationsStage1s.Update(operationsStage1); // Explicitly mark as modified
                                    await threadContext.SaveChangesAsync(); // Save changes within transaction
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Updated OperationsStage1 product vector for CustomerId: {customerId.Value}");
                                }
                                else
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No OperationsStage1 record found for CustomerId: {customerId.Value} to update product vector.");
                                }

                                await transaction.CommitAsync(); // Commit the transaction
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] OperationsStage1 product vector update committed.");
                            }
                            catch (Exception ex)
                            {
                                await transaction.RollbackAsync(); // Rollback on error
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error updating OperationsStage1 product vector in ProcessFactoryTwo: {ex.Message}");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}");
                                throw; // Rethrow to be caught by the main try-catch
                            }
                        } // End of transaction scope

                        // Verify update (Optional - use a separate context or AsNoTracking if within same context transaction was committed)
                        var verifyOperationsStage1 = await dbContext.OperationsStage1s // Use passed-in context
                            .AsNoTracking()
                            .FirstOrDefaultAsync(o => o.CustomerId == customerId.Value);

                        if (verifyOperationsStage1 != null)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - OperationsStage1 ProductVector: {verifyOperationsStage1.OperationsStageOneProductVector}");
                        }
                        var verifyModelDbInit = await dbContext.ModelDbInits // Use passed-in context
                            .AsNoTracking()
                            .FirstOrDefaultAsync(m => m.CustomerId == customerId.Value);
                        if (verifyModelDbInit != null)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - Modeldbinit ProductVector: {verifyModelDbInit.ModelDbInitProductVector}");
                        }
                    }


                }
                catch (Exception ex) // Catch for initial DB operations (retrieving customer ID)
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error during database operations in ProcessFactoryTwo (retrieving customer ID): {ex.Message}");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                    throw; // Rethrow to be caught by the main try-catch
                }


                // Neural network implementation
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A Phase Two: Initializing Neural Network Implementation");

                // Execute the Neural Network training within a Task.Run to avoid blocking the caller thread.
                // Note: This is running *within* the async ProcessFactoryTwo, not parallel to it.
                // Modified: April 20, 2025 2:35:04 PM America/Denver
                await Task.Run(async () => // Marked lambda as async
                {
                    try
                    {
                        int epochs = 100;
                        float learningRate = 0.0001f;

                        // Get unique product names - Added safety check for null products
                        var uniqueNames = FilteredProducts
                            .Where(p => p != null && p.ProductName != null)
                            .Select(p => (string)p.ProductName)
                            .Distinct()
                            .ToList();

                        // Prepare input vectors for the neural network
                        // Added safety check for FilteredProducts and individual items
                        var inputVectorsList = new List<float[]>();
                        var priceDataList = new List<float[]>();
                        var oneHotNamesList = new List<float[]>();

                        foreach (dynamic product in FilteredProducts.Where(p => p != null))
                        {
                            try
                            {
                                // Prepare the main input vector (Price, x, y, z from centroids)
                                inputVectorsList.Add(new float[] {
                                    (float)Convert.ToDouble(product.Price) / 1000f, // Normalize price
                                    (float)x, // Using centroid values from clustering
                                    (float)y,
                                    (float)z
                                });

                                // Prepare the target (Price)
                                priceDataList.Add(new float[] { (float)Convert.ToDouble(product.Price) / 1000f }); // Normalize price

                                // Prepare one-hot encoding for product name
                                var oneHotName = new float[uniqueNames.Count];
                                var nameIndex = uniqueNames.IndexOf((string)product.ProductName);
                                if (nameIndex != -1)
                                {
                                    oneHotName[nameIndex] = 1.0f;
                                }
                                oneHotNamesList.Add(oneHotName);
                            }
                            catch (Exception dataPrepEx)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error preparing data for NN for product ID {product?.Id}: {dataPrepEx.Message}");
                                // Decide how to handle errors in data preparation (skip sample, log, etc.)
                            }
                        }

                        var inputVectors = inputVectorsList.ToArray();
                        var priceData = priceDataList.ToArray();
                        var oneHotNames = oneHotNamesList.ToArray();


                        // Ensure input data is not empty before starting TensorFlow
                        // Added: April 20, 2025 2:35:04 PM America/Denver
                        if (inputVectors.Length == 0 || inputVectors.Any(v => v == null || v.Length == 0) || // Added null/empty check for inner arrays
                            priceData.Length == 0 || priceData.Any(v => v == null || v.Length == 0) ||
                            oneHotNames.Length == 0 || oneHotNames.Any(v => v == null || v.Length == 0))
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No valid input data generated for Model A Neural Network. Skipping training.");
                            return; // Exit the Task.Run
                        }

                        // Check if TensorFlow is initialized and configured
                        if (tf == null)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] TensorFlow is not initialized. Skipping Model A Neural Network training.");
                            return; // Exit the Task.Run
                        }


                        tf.compat.v1.disable_eager_execution();
                        var g = tf.Graph();
                        using (var sess = tf.Session(g))
                        {
                            // Define placeholders
                            var x_data = tf.placeholder(tf.float32, shape: new[] { -1, inputVectors[0].Length }, name: "x_data"); // Use actual input size
                            var y = tf.placeholder(tf.float32, shape: new[] { -1, 1 }, name: "output");
                            var nameFeatures = tf.placeholder(tf.float32, shape: new[] { -1, uniqueNames.Count }, name: "names");

                            // Ensure combined input dimension calculation is correct
                            var combinedInputDim = inputVectors[0].Length + uniqueNames.Count;
                            var combinedInput = tf.concat(new[] { x_data, nameFeatures }, axis: 1); // Use x_data directly or apply modifications here if needed

                            // Define weights and bias
                            var W = tf.Variable(tf.random.normal(new[] { combinedInputDim, 1 }, mean: 0.0f, stddev: 0.01f), name: "weight");
                            var b = tf.Variable(tf.zeros(new[] { 1 }), name: "bias");

                            // Define model, loss, and optimizer
                            var predictions = tf.add(tf.matmul(combinedInput, W), b);
                            var loss = tf.reduce_mean(tf.square(predictions - y)) * 0.5f;
                            var optimizer = tf.train.GradientDescentOptimizer(learningRate);
                            var trainOp = optimizer.minimize(loss);

                            // Initialize variables
                            sess.run(tf.global_variables_initializer());

                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Data shapes:");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Input vectors shape: {inputVectors.GetLength(0)} x {inputVectors.GetLength(1)}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Name features shape: {oneHotNames.GetLength(0)} x {oneHotNames.GetLength(1)}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Price data shape: {priceData.GetLength(0)} x {priceData.GetLength(1)}");

                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Starting training with learning rate: {learningRate}");
                            float previousLoss = float.MaxValue;
                            int stableCount = 0;

                            // Training loop
                            for (int epoch = 0; epoch < epochs; epoch++)
                            {
                                var feedDict = new Dictionary<Tensor, object>
                                {
                                    { x_data, inputVectors },
                                    { nameFeatures, oneHotNames },
                                    { y, priceData }
                                };

                                var feedItems = feedDict.Select(kv => new FeedItem(kv.Key, kv.Value)).ToArray();

                                sess.run(trainOp, feedItems);
                                var currentLoss = (float)sess.run(loss, feedItems);

                                // Store magnitude periodically (optional, adjust frequency)
                                // if (epoch % 10 == 0)
                                // {
                                //     var magnitudeValues = ((NDArray)sess.run(tf.sqrt(tf.reduce_sum(tf.square(x_data), axis: 1)), feedItems)).ToArray<float>();
                                //     results.TryAdd($"ModelA_Magnitude_Epoch_{epoch}", magnitudeValues); // Using a more specific key
                                // }

                                if (float.IsNaN(currentLoss) || float.IsInfinity(currentLoss))
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Training diverged at epoch {epoch}. Stopping training.");
                                    break;
                                }

                                // Convergence check
                                if (Math.Abs(previousLoss - currentLoss) < 1e-6) // Use a small epsilon
                                {
                                    stableCount++;
                                    if (stableCount > 5) // Require 5 stable epochs
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Training converged at epoch {epoch}");
                                        break;
                                    }
                                }
                                else
                                {
                                    stableCount = 0; // Reset count if loss changes significantly
                                }
                                previousLoss = currentLoss;

                                if (epoch % 10 == 0) // Log periodically
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Epoch {epoch}, Loss: {currentLoss:E4}");
                                }

                                // Store loss periodically (optional)
                                results.TryAdd($"ModelA_Loss_Epoch_{epoch}", currentLoss); // Using a more specific key
                            }

                            // Generate predictions after training
                            // Ensure feed items are correctly created for prediction
                            var predictFeedItems = new[] {
                                new FeedItem(x_data, inputVectors),
                                new FeedItem(nameFeatures, oneHotNames)
                            };
                            var modelPredictions = ((NDArray)sess.run(predictions, predictFeedItems)).ToArray<float>();

                            // Store predictions in Jit_Memory_Object
                            var predictionsWithNames = new List<Dictionary<string, object>>();
                            // Added safety check for FilteredProducts and predictions length
                            if (FilteredProducts.Count == modelPredictions.Length)
                            {
                                for (int i = 0; i < FilteredProducts.Count; i++)
                                {
                                    // Added safety check for product being null
                                    if (FilteredProducts[i] != null)
                                    {
                                        predictionsWithNames.Add(new Dictionary<string, object>
                                         {
                                             { "ProductName", FilteredProducts[i].ProductName },
                                             { "ActualPrice", (float)Convert.ToDouble(FilteredProducts[i].Price) }, // Ensure actual price is float
                                             { "PredictedPrice", modelPredictions[i] * 1000f }, // Denormalize the price
                                             { "CCVC", (float)Convert.ToDouble(FilteredProducts[i].ccvc) } // Ensure CCVC is float
                                         });
                                    }
                                }
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Warning: Mismatch between FilteredProducts count ({FilteredProducts.Count}) and predictions count ({modelPredictions.Length}). Predictions may be incomplete.");
                            }

                            Jit_Memory_Object.AddProperty("ModelA_Predictions", predictionsWithNames);

                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Predictions:");
                            foreach (var pred in predictionsWithNames)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Product: {pred["ProductName"]}, " +
                                    $"Actual: ${pred["ActualPrice"]:F2}, " +
                                    $"Predicted: ${pred["PredictedPrice"]:F2}, " +
                                    $"CCVC: {pred["CCVC"]:F2}");
                            }

                            // Starting model serialization process
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting Model A model serialization process");
                            using (var memoryStream = new MemoryStream())
                            using (var writer = new BinaryWriter(memoryStream))
                            {
                                // Serialize Weights
                                var wNDArray = (NDArray)sess.run(W);
                                var wData = wNDArray.ToArray<float>();
                                writer.Write(wData.Length);
                                foreach (var w in wData)
                                {
                                    writer.Write(w);
                                }
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A weights serialized successfully ({wData.Length} floats)");

                                // Serialize Bias
                                var bNDArray = (NDArray)sess.run(b);
                                var bData = bNDArray.ToArray<float>();
                                writer.Write(bData.Length);
                                foreach (var bias in bData)
                                {
                                    writer.Write(bias);
                                }
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A bias serialized successfully ({bData.Length} floats)");

                                // Serialize Final Magnitudes (Recalculating or getting from results)
                                // Note: The original code calculated magnitudes during the loop and stored in results,
                                // but serialized the *final* magnitudes calculated once after the loop.
                                // We'll calculate final magnitudes here based on the original input features (price, x, y, z) for serialization:
                                // Assuming the magnitude feature used in training is the magnitude of the initial [price, x, y, z] vector
                                var initialFeatureMagnitude = tf.sqrt(tf.reduce_sum(tf.square(x_data), axis: 1));
                                var finalMagnitudeArray = ((NDArray)sess.run(initialFeatureMagnitude, new[] { new FeedItem(x_data, inputVectors) })).ToArray<float>();

                                writer.Write(finalMagnitudeArray.Length);
                                foreach (var mag in finalMagnitudeArray)
                                {
                                    writer.Write(mag);
                                }
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A final feature magnitudes serialized successfully ({finalMagnitudeArray.Length} floats)");


                                // Store the serialized model data (weights, biases, magnitudes) in the Modeldbinit object's Data field
                                // Note: This will overwrite any previous data in model.Data (likely Model C's data).
                                // This suggests model.Data is intended for the *final* combined model, not intermediate factory models.
                                // Let's store Model A's data in a separate JIT memory key and avoid saving it to model.Data here.
                                // Modified: April 20, 2025 2:35:04 PM America/Denver
                                var modelASerializedData = memoryStream.ToArray();
                                Jit_Memory_Object.AddProperty("ModelA_Data", modelASerializedData); // Store in JIT memory under a specific key


                                // Save the updated Modeldbinit object to the database using the passed-in context
                                // As noted above, saving Model A data to model.Data field might be incorrect.
                                // We will skip saving Model A's serialized data to the DB here, assuming it's used later in FactoryFour.
                                // Removed: April 20, 2025 2:35:04 PM America/Denver
                                // try { ... save to db ... } catch { ... }


                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A data serialized and stored in JIT memory successfully");

                                // Verification using JIT memory
                                var storedCustomerId = Jit_Memory_Object.GetProperty("CustomerId"); // This should be the customerID passed in
                                var storedModelAData = Jit_Memory_Object.GetProperty("ModelA_Data") as byte[];
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification (JIT Memory) - Customer ID: {storedCustomerId}");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification (JIT Memory) - Data Size: {storedModelAData?.Length ?? 0} bytes");
                            }

                            // Store final weights, bias, magnitudes, and product names in results and JIT memory
                            var finalW = sess.run(W);
                            var finalB = sess.run(b);
                            var finalFeatureMagnitudes = ((NDArray)sess.run(initialFeatureMagnitude, new[] { new FeedItem(x_data, inputVectors) })).ToArray<float>(); // Recalculate based on initial features

                            results.TryAdd("ModelA_FinalWeights", ((NDArray)finalW).ToArray<float>()); // Use specific keys
                            results.TryAdd("ModelA_FinalBias", ((NDArray)finalB).ToArray<float>()); // Use specific keys
                            results.TryAdd("ModelA_FinalFeatureMagnitudes", finalFeatureMagnitudes); // Use specific keys
                            results.TryAdd("ModelA_ProductNames", uniqueNames); // Use specific keys

                            Jit_Memory_Object.AddProperty("ModelA_FinalWeights", ((NDArray)finalW).ToArray<float>());
                            Jit_Memory_Object.AddProperty("ModelA_FinalBias", ((NDArray)finalB).ToArray<float>());
                            Jit_Memory_Object.AddProperty("ModelA_FinalFeatureMagnitudes", finalFeatureMagnitudes);


                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Training completed");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Final loss: {previousLoss:E4}");
                        }
                        catch (Exception ex) // Catch for the Task.Run block (TensorFlow training)
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in Model A training (ProcessFactoryTwo NN): {ex.Message}");
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                        throw; // Rethrow to be caught by the outer try-catch
                    }
                }); // End of Task.Run
            } // End of main try block in ProcessFactoryTwo
            catch (Exception ex) // Catch for database operations (vector update) and Task.Run exceptions
            {
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryTwo: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                throw; // Rethrow to be caught by the main try-catch
            }
            finally
            {
                Jit_Memory_Object.AddProperty("ProcessFactoryTwoActive", false);
                bool isActive = (bool)Jit_Memory_Object.GetProperty("ProcessFactoryTwoActive");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryTwoActive property value after execution: {isActive}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH::mm:ss.fff}] Session {sessionId}: ProcessFactoryTwo (Model A) finished.");
            }
        }
        // --- End: ProcessFactoryTwo (Model A) ---


        // --- Start: ProcessFactoryThree (Model B) ---
        /// <summary>
        /// Processes data for Model B (ProcessFactoryThree).
        /// Performs clustering and neural network training using service data.
        /// This factory includes placeholder TensorFlow training logic for Model B.
        /// Added parameter for request-scoped DbContext.
        /// Modified: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        private async Task ProcessFactoryThree(Modeldbinit model, int customerID, int sessionId,
     Session session, ConcurrentDictionary<string, object> results, YourDbContext dbContext) // Added dbContext parameter
        {
            // Use the passed-in dbContext
            var threadContext = dbContext;

            // Set tracking behavior - Using the passed-in context
            threadContext.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.TrackAll;

            try
            {
                Jit_Memory_Object.AddProperty("ProcessFactoryThreeActive", true);
                bool isActive = (bool)Jit_Memory_Object.GetProperty("ProcessFactoryThreeActive");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryThreeActive property value: {isActive}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Starting ProcessFactoryThree (Model B)");

                // Retrieve OperationsStage1Record from JIT Memory (should have been stored in ProcessFactoryOne)
                var operationsStage1Record = Jit_Memory_Object.GetProperty("OperationsStage1Record") as OperationsStage1;
                var stageSubService = new List<int?>();

                if (operationsStage1Record != null)
                {
                    // Use null-conditional operator for safety
                    if (operationsStage1Record.SubServiceA.HasValue ||
                        operationsStage1Record.SubServiceB.HasValue ||
                        operationsStage1Record.SubServiceC.HasValue)
                    {
                        stageSubService.Add(operationsStage1Record.SubServiceA);
                        stageSubService.Add(operationsStage1Record.SubServiceB);
                        stageSubService.Add(operationsStage1Record.SubServiceC);
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] ProcessFactoryThree: Collected {stageSubService.Count} Sub Service IDs from OperationsStage1");
                    }

                    // Retrieve All_SubServices from JIT Memory (Populated by the constructor's Task.Run if successful)
                    // In a real application, error handling if this is null is needed.
                    var allSubServices = Jit_Memory_Object.GetProperty("All_SubServices") as List<dynamic>;

                    if (allSubServices != null)
                    {
                        // Added safety check for null or non-dynamic items in allSubServices before filtering
                        var filteredServices = allSubServices?.Where(p => p != null && stageSubService.Contains((int)p.Id)).ToList();
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] ProcessFactoryThree: Filtered services count: {filteredServices?.Count ?? 0}");
                        Jit_Memory_Object.AddProperty("FilteredServices", filteredServices);
                    }
                    else
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] ProcessFactoryThree: All_SubServices not found in JIT Memory. Clustering and NN will use an empty list.");
                        Jit_Memory_Object.AddProperty("FilteredServices", new List<dynamic>()); // Add empty list
                    }
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] ProcessFactoryThree: OperationsStage1Record not found in JIT Memory. Clustering and NN will use an empty list.");
                    Jit_Memory_Object.AddProperty("FilteredServices", new List<dynamic>()); // Add empty list
                }

                // Retrieve FilteredServices from JIT Memory
                var FilteredServices = (List<dynamic>)Jit_Memory_Object.GetProperty("FilteredServices");

                if (FilteredServices == null || !FilteredServices.Any())
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No filtered services available for ProcessFactoryThree. Skipping clustering and NN.");
                    return; // Exit if no data
                }


                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B Phase One: Initializing Data Clustering Implementation");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found {FilteredServices.Count} items for Model B Data Clustering");

                // Extract ccvc's for clustering
                var ccvcList = new List<double[]>();
                var ccvcValues = new List<double>();

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Extracting service CCVCs for clustering");
                // Added safety check for null or non-dynamic items in FilteredServices
                foreach (dynamic service in FilteredServices.Where(s => s != null))
                {
                    try
                    {
                        // Use Convert.ToDouble for robustness
                        double ccvcValue = Convert.ToDouble(service.ccvc);
                        ccvcList.Add(new double[] { ccvcValue });
                        ccvcValues.Add(ccvcValue);
                    }
                    catch (Exception ccvcEx)
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error converting CCVC value for service ID {service.Id}: {ccvcEx.Message}");
                        // Decide if you want to skip this service or log the error
                    }
                }

                double[][] ccvcArray = ccvcList.ToArray();

                // Ensure ccvcArray is not empty before proceeding with clustering
                // Added: April 20, 2025 2:35:04 PM America/Denver
                if (ccvcArray.Length < 3) // Need at least 3 data points for 3 clusters (or KMeans might throw)
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Not enough valid CCVC data points ({ccvcArray.Length}) for Model B clustering (requires at least 3). Skipping clustering and NN.");
                    return;
                }


                var sortedCcvc = ccvcValues.OrderBy(v => v).ToList();
                double medianCcvc = sortedCcvc.Count % 2 == 0
                    ? (sortedCcvc[sortedCcvc.Count / 2 - 1] + sortedCcvc[sortedCcvc.Count / 2]) / 2
                    : sortedCcvc[sortedCcvc.Count / 2];

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] CCVC values: {string.Join(", ", ccvcValues.Select(v => v.ToString("F4")))}"); // Format for readability
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Median CCVC value: {medianCcvc:F4}");

                int numClusters = 3;
                int numIterations = 100;

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Clustering parameters: clusters={numClusters}, iterations={numIterations}");

                var kmeans_ModelB = new Accord.MachineLearning.KMeans(numClusters)
                {
                    MaxIterations = numIterations,
                    Distance = new SquareEuclidean()
                };

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting k-means clustering for Model B");
                var clusters = kmeans_ModelB.Learn(ccvcArray);

                Jit_Memory_Object.AddProperty("ModelB_Clusters", clusters);
                Jit_Memory_Object.AddProperty("ModelB_ClusterCenters", kmeans_ModelB.Centroids);

                var modelBCentroids = kmeans_ModelB.Centroids;
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Processing Model B centroids:");

                // Ensure there are enough centroids before accessing indices
                // Added: April 20, 2025 2:35:04 PM America/Denver
                if (modelBCentroids.Length < 3 || modelBCentroids.Any(c => c == null || c.Length < 1)) // Check for null centroids or empty centroid arrays
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Not enough valid centroids ({modelBCentroids.Length}) for Model B vector calculation. Skipping vector and NN steps.");
                    return;
                }

                var centroidValues = modelBCentroids
                    .Select(c => c[0])
                    .OrderBy(v => v)
                    .ToList();

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B Centroid Values: {centroidValues[0]:F4}, {centroidValues[1]:F4}, {centroidValues[2]:F4}");

                double x = centroidValues[0];  // Lowest CCVC centroid
                double y = centroidValues[1];  // Middle CCVC centroid
                double z = centroidValues[2];  // Highest CCVC centroid


                double[] vector = { x, y, z };

                double magnitude = Math.Sqrt(x * x + y * y + z * z);

                double nx = (magnitude > 0) ? x / magnitude : 0;
                double ny = (magnitude > 0) ? y / magnitude : 0;
                double nz = (magnitude > 0) ? z / magnitude : 0;

                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B Vector Coordinates: X={x:F4}, Y={y:F4}, Z={z:F4}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B Vector Magnitude: {magnitude:F4}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B Normalized Vector: nx={nx:F4}, ny={ny:F4}, nz={nz:F4}");

                Jit_Memory_Object.AddProperty("ModelB_MedianVector", vector);
                Jit_Memory_Object.AddProperty("ModelB_MedianVector_Normalized", new double[] { nx, ny, nz });
                Jit_Memory_Object.AddProperty("ModelB_MedianMagnitude", magnitude);

                var serviceVectorString = $"X={x:F4}, Y={y:F4}, Z={z:F4}, Magnitude={magnitude:F4}, NX={nx:F4}, NY={ny:F4}, NZ={nz:F4}";

                // Database updates using the passed-in context
                // Modified: April 20, 2025 2:35:04 PM America/Denver
                try
                {
                    var customerId = (int?)Jit_Memory_Object.GetProperty("CustomerId"); // Cast to nullable int

                    if (!customerId.HasValue)
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryThree: CustomerId not found in JIT Memory for DB update.");
                        // Log and skip DB updates for vector.
                    }
                    else
                    {
                        // Update OperationsStage1 with explicit transaction - Using the passed-in context
                        using (var transaction = await threadContext.Database.BeginTransactionAsync())
                        {
                            try
                            {
                                // Fetch a tracked instance
                                var operationsStage1 = await threadContext.OperationsStage1s
                                     .FirstOrDefaultAsync(o => o.CustomerId == customerId.Value); // Use the int value

                                if (operationsStage1 != null)
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found OperationsStage1 record for CustomerId: {customerId.Value}");
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Current ServiceVector value: {operationsStage1.OperationsStageOneServiceVector}");

                                    // Update service vector
                                    operationsStage1.OperationsStageOneServiceVector = serviceVectorString;

                                    // Mark as modified
                                    threadContext.Entry(operationsStage1).State = EntityState.Modified;

                                    // Save changes
                                    await threadContext.SaveChangesAsync();

                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Updated OperationsStage1 service vector data for CustomerId: {customerId.Value}");
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] New ServiceVector value: {operationsStage1.OperationsStageOneServiceVector}");

                                    // Commit transaction
                                    await transaction.CommitAsync();
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] OperationsStage1 service vector update committed.");
                                }
                                else
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No OperationsStage1 record found for CustomerId: {customerId.Value} to update service vector.");
                                }
                            }
                            catch (Exception ex)
                            {
                                await transaction.RollbackAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error updating OperationsStage1 in ProcessFactoryThree: {ex.Message}");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}");
                                throw; // Rethrow to be caught by the outer try-catch
                            }
                        } // End of transaction scope

                        // Verify update (Optional - use a separate context or AsNoTracking if within same context transaction was committed)
                        var verifyOperationsStage1 = await dbContext.OperationsStage1s // Use passed-in context
                            .AsNoTracking()
                            .FirstOrDefaultAsync(o => o.CustomerId == customerId.Value);

                        if (verifyOperationsStage1 != null)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - OperationsStage1 ServiceVector: {verifyOperationsStage1.OperationsStageOneServiceVector}");
                        }


                        // Update Modeldbinit with separate transaction - Using the passed-in context
                        using (var transaction = await threadContext.Database.BeginTransactionAsync())
                        {
                            try
                            {
                                // Fetch a tracked instance
                                var modelDbInit = await threadContext.ModelDbInits
                                     .FirstOrDefaultAsync(m => m.CustomerId == customerId.Value); // Use passed-in context

                                if (modelDbInit != null)
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found Modeldbinit record for CustomerId: {customerId.Value}");
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Current ServiceVector value: {modelDbInit.ModelDbInitServiceVector}");

                                    modelDbInit.ModelDbInitServiceVector = serviceVectorString;
                                    threadContext.ModelDbInits.Update(modelDbInit); // Explicitly mark as modified
                                    await threadContext.SaveChangesAsync(); // Save changes immediately

                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Updated Modeldbinit service vector data for CustomerId: {customerId.Value}");
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] New ServiceVector value: {modelDbInit.ModelDbInitServiceVector}");

                                    await transaction.CommitAsync();
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Modeldbinit service vector update committed.");
                                }
                                else
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No Modeldbinit record found for CustomerId: {customerId.Value} to update service vector.");
                                }
                            }
                            catch (Exception ex)
                            {
                                await transaction.RollbackAsync();
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error updating Modeldbinit in ProcessFactoryThree: {ex.Message}");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}");
                                throw; // Rethrow to be caught by the outer try-catch
                            }
                        } // End of transaction scope


                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Successfully saved service vector data to database");

                        // Verification (Optional)
                        var verifyModelDbInit = await dbContext.ModelDbInits // Use passed-in context
                            .AsNoTracking()
                           .FirstOrDefaultAsync(m => m.CustomerId == customerId.Value);
                        if (verifyModelDbInit != null)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification - Modeldbinit ServiceVector: {verifyModelDbInit.ModelDbInitServiceVector}");
                        }
                    }
                }
                catch (Exception ex) // Catch for initial DB operations (retrieving customer ID)
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error during database updates in ProcessFactoryThree: {ex.Message}");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                    throw; // Rethrow to be caught by the main try-catch
                }


                // Neural network implementation
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B Phase Two: Initializing Neural Network Implementation");

                // Execute the Neural Network training within a Task.Run to avoid blocking the caller thread.
                // Modified: April 20, 2025 2:35:04 PM America/Denver
                await Task.Run(async () => // Marked lambda as async
                {
                    try
                    {
                        int epochs = 100;
                        float learningRate = 0.0001f;

                        // Get unique service names - Added safety check for null services
                        var uniqueNames = FilteredServices
                            .Where(s => s != null && s.ServiceName != null)
                            .Select(s => (string)s.ServiceName)
                            .Distinct()
                            .ToList();

                        // Prepare input vectors for the neural network
                        // Added safety check for FilteredServices and individual items
                        var inputVectorsList = new List<float[]>();
                        var priceDataList = new List<float[]>();
                        var oneHotNamesList = new List<float[]>();

                        foreach (dynamic service in FilteredServices.Where(s => s != null))
                        {
                            try
                            {
                                // Prepare the main input vector (Price, x, y, z from centroids)
                                inputVectorsList.Add(new float[] {
                                    (float)Convert.ToDouble(service.Price) / 1000f, // Normalize price
                                    (float)x, // Using centroid values from clustering
                                    (float)y,
                                    (float)z
                                });

                                // Prepare the target (Price)
                                priceDataList.Add(new float[] { (float)Convert.ToDouble(service.Price) / 1000f }); // Normalize price

                                // Prepare one-hot encoding for service name
                                var oneHotName = new float[uniqueNames.Count];
                                var nameIndex = uniqueNames.IndexOf((string)service.ServiceName);
                                if (nameIndex != -1)
                                {
                                    oneHotName[nameIndex] = 1.0f;
                                }
                                oneHotNamesList.Add(oneHotName);
                            }
                            catch (Exception dataPrepEx)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error preparing data for NN for service ID {service?.Id}: {dataPrepEx.Message}");
                                // Decide how to handle errors in data preparation
                            }
                        }

                        var inputVectors = inputVectorsList.ToArray();
                        var priceData = priceDataList.ToArray();
                        var oneHotNames = oneHotNamesList.ToArray();


                        // Ensure input data is not empty before starting TensorFlow
                        // Added: April 20, 2025 2:35:04 PM America/Denver
                        if (inputVectors.Length == 0 || inputVectors.Any(v => v == null || v.Length == 0) || // Added null/empty check for inner arrays
                            priceData.Length == 0 || priceData.Any(v => v == null || v.Length == 0) ||
                            oneHotNames.Length == 0 || oneHotNames.Any(v => v == null || v.Length == 0))
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No valid input data generated for Model B Neural Network. Skipping training.");
                            return; // Exit the Task.Run
                        }

                        // Check if TensorFlow is initialized and configured
                        if (tf == null)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] TensorFlow is not initialized. Skipping Model B Neural Network training.");
                            return; // Exit the Task.Run
                        }


                        tf.compat.v1.disable_eager_execution();
                        var g = tf.Graph();
                        using (var sess = tf.Session(g))
                        {
                            // Define placeholders
                            var x_data = tf.placeholder(tf.float32, shape: new[] { -1, inputVectors[0].Length }, name: "x_data"); // Use actual input size
                            var y = tf.placeholder(tf.float32, shape: new[] { -1, 1 }, name: "output");
                            var nameFeatures = tf.placeholder(tf.float32, shape: new[] { -1, uniqueNames.Count }, name: "names");

                            // Ensure combined input dimension calculation is correct
                            var combinedInputDim = inputVectors[0].Length + uniqueNames.Count;
                            var combinedInput = tf.concat(new[] { x_data, nameFeatures }, axis: 1); // Use x_data directly or apply modifications here if needed

                            // Define weights and bias
                            var W = tf.Variable(tf.random.normal(new[] { combinedInputDim, 1 }, mean: 0.0f, stddev: 0.01f), name: "weight");
                            var b = tf.Variable(tf.zeros(new[] { 1 }), name: "bias");

                            // Define model, loss, and optimizer
                            var predictions = tf.add(tf.matmul(combinedInput, W), b);
                            var loss = tf.reduce_mean(tf.square(predictions - y)) * 0.5f;
                            var optimizer = tf.train.GradientDescentOptimizer(learningRate);
                            var trainOp = optimizer.minimize(loss);

                            // Initialize variables
                            sess.run(tf.global_variables_initializer());

                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Data shapes:");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Input vectors shape: {inputVectors.GetLength(0)} x {inputVectors.GetLength(1)}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Name features shape: {oneHotNames.GetLength(0)} x {oneHotNames.GetLength(1)}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Price data shape: {priceData.GetLength(0)} x {priceData.GetLength(1)}");

                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Starting training with learning rate: {learningRate}");
                            float previousLoss = float.MaxValue;
                            int stableCount = 0;

                            // Training loop
                            for (int epoch = 0; epoch < epochs; epoch++)
                            {
                                var feedDict = new Dictionary<Tensor, object>
                                {
                                    { x_data, inputVectors },
                                    { nameFeatures, oneHotNames },
                                    { y, priceData }
                                };

                                var feedItems = feedDict.Select(kv => new FeedItem(kv.Key, kv.Value)).ToArray();

                                sess.run(trainOp, feedItems);
                                var currentLoss = (float)sess.run(loss, feedItems);

                                // Store magnitude periodically (optional, adjust frequency)
                                // if (epoch % 10 == 0)
                                // {
                                //     var magnitudeValues = ((NDArray)sess.run(tf.sqrt(tf.reduce_sum(tf.square(x_data), axis: 1)), feedItems)).ToArray<float>();
                                //      results.TryAdd($"ModelB_Magnitude_Epoch_{epoch}", magnitudeValues); // Using a more specific key
                                // }


                                if (float.IsNaN(currentLoss) || float.IsInfinity(currentLoss))
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Training diverged at epoch {epoch}. Stopping training.");
                                    break;
                                }

                                // Convergence check
                                if (Math.Abs(previousLoss - currentLoss) < 1e-6) // Use a small epsilon
                                {
                                    stableCount++;
                                    if (stableCount > 5) // Require 5 stable epochs
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Training converged at epoch {epoch}");
                                        break;
                                    }
                                }
                                else
                                {
                                    stableCount = 0; // Reset count if loss changes significantly
                                }
                                previousLoss = currentLoss;

                                if (epoch % 10 == 0) // Log periodically
                                {
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Epoch {epoch}, Loss: {currentLoss:E4}");
                                }

                                // Store loss periodically (optional)
                                results.TryAdd($"ModelB_Loss_Epoch_{epoch}", currentLoss); // Using a more specific key
                            }

                            // Generate and store predictions
                            // Ensure feed items are correctly created for prediction
                            var predictFeedItems = new[] {
                                 new FeedItem(x_data, inputVectors),
                                 new FeedItem(nameFeatures, oneHotNames)
                             };
                            var modelPredictions = ((NDArray)sess.run(predictions, predictFeedItems)).ToArray<float>();

                            var predictionsWithNames = new List<Dictionary<string, object>>();
                            // Added safety check for FilteredServices and predictions length
                            if (FilteredServices.Count == modelPredictions.Length)
                            {
                                for (int i = 0; i < FilteredServices.Count; i++)
                                {
                                    // Added safety check for service being null
                                    if (FilteredServices[i] != null)
                                    {
                                        predictionsWithNames.Add(new Dictionary<string, object>
                                         {
                                             { "ServiceName", FilteredServices[i].ServiceName }, // Changed to ServiceName
                                             { "ActualPrice", (float)Convert.ToDouble(FilteredServices[i].Price) }, // Ensure actual price is float
                                             { "PredictedPrice", modelPredictions[i] * 1000f }, // Denormalize the price
                                             { "CCVC", (float)Convert.ToDouble(FilteredServices[i].ccvc) } // Ensure CCVC is float
                                         });
                                    }
                                }
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Warning: Mismatch between FilteredServices count ({FilteredServices.Count}) and predictions count ({modelPredictions.Length}). Predictions may be incomplete.");
                            }

                            Jit_Memory_Object.AddProperty("ModelB_Predictions", predictionsWithNames);

                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Predictions:");
                            foreach (var pred in predictionsWithNames)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Service: {pred["ServiceName"]}, " + // Changed to Service
                                    $"Actual: ${pred["ActualPrice"]:F2}, " +
                                    $"Predicted: ${pred["PredictedPrice"]:F2}, " +
                                    $"CCVC: {pred["CCVC"]:F2}");
                            }

                            // Starting model serialization process
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting Model B model serialization process");
                            using (var memoryStream = new MemoryStream())
                            using (var writer = new BinaryWriter(memoryStream))
                            {
                                // Serialize Weights
                                var wNDArray = (NDArray)sess.run(W);
                                var wData = wNDArray.ToArray<float>();
                                writer.Write(wData.Length);
                                foreach (var w in wData)
                                {
                                    writer.Write(w);
                                }
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B weights serialized successfully ({wData.Length} floats)");


                                // Serialize Bias
                                var bNDArray = (NDArray)sess.run(b);
                                var bData = bNDArray.ToArray<float>();
                                writer.Write(bData.Length);
                                foreach (var bias in bData)
                                {
                                    writer.Write(bias);
                                }
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B bias serialized successfully ({bData.Length} floats)");


                                // Serialize Final Magnitudes (Recalculating based on initial features)
                                // Assuming the magnitude feature used in training is the magnitude of the initial [price, x, y, z] vector
                                var initialFeatureMagnitude = tf.sqrt(tf.reduce_sum(tf.square(x_data), axis: 1));
                                var finalMagnitudeArray = ((NDArray)sess.run(initialFeatureMagnitude, new[] { new FeedItem(x_data, inputVectors) })).ToArray<float>();

                                writer.Write(finalMagnitudeArray.Length);
                                foreach (var mag in finalMagnitudeArray)
                                {
                                    writer.Write(mag);
                                }
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B final feature magnitudes serialized successfully ({finalMagnitudeArray.Length} floats)");


                                // Store the serialized model data (weights, biases, magnitudes) in JIT memory under a specific key.
                                // Avoid saving to the main 'model.Data' field here, as it's likely for the combined model.
                                // Modified: April 20, 2025 2:35:04 PM America/Denver
                                var modelBSerializedData = memoryStream.ToArray();
                                Jit_Memory_Object.AddProperty("ModelB_Data", modelBSerializedData); // Store in JIT memory under a specific key


                                // Save the updated Modeldbinit object to the database using the passed-in context
                                // As noted in FactoryTwo, saving Model B data to model.Data field might be incorrect.
                                // If there's a specific field for Model B's data (e.g., ModelDbInitModelData), use that.
                                // The original code used ModelDbInitModelData in the model definition but 'Data' in serialization.
                                // Let's assume ModelDbInitModelData is for Model B data, and 'Data' is for the combined model.
                                // Modified: April 20, 2025 2:35:04 PM America/Denver
                                using (var dbContextForSave = GetNewDbContext()) // Get a new context instance for this save operation
                                {
                                    try
                                    {
                                        var customerId = (int?)Jit_Memory_Object.GetProperty("CustomerId"); // Cast to nullable int
                                        if (!customerId.HasValue)
                                        {
                                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error saving Model B data: CustomerId not found in JIT Memory.");
                                            // Log and skip DB update for Model B data.
                                        }
                                        else
                                        {
                                            var dbModelDbInit = await dbContextForSave.ModelDbInits // Use the new context
                                                .FirstOrDefaultAsync(m => m.CustomerId == customerId.Value); // Fetch by CustomerId

                                            if (dbModelDbInit != null)
                                            {
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found Modeldbinit record for CustomerId: {customerId.Value} for Model B data update.");
                                                // Use the ModelDbInitModelData field for Model B data
                                                dbModelDbInit.ModelDbInitModelData = modelBSerializedData;
                                                dbContextForSave.ModelDbInits.Update(dbModelDbInit); // Explicitly mark as modified
                                                await dbContextForSave.SaveChangesAsync(); // Save changes
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B data saved to Modeldbinit.ModelDbInitModelData field successfully.");
                                            }
                                            else
                                            {
                                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No Modeldbinit record found for CustomerId: {customerId.Value} to save Model B data.");
                                            }
                                        }
                                    }
                                    catch (Exception dbEx)
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error saving Model B data to database: {dbEx.Message}");
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {dbEx.StackTrace}");
                                        throw; // Rethrow to be caught by the outer try-catch
                                    }
                                } // dbContextForSave is disposed here


                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B data serialized and stored in JIT memory successfully");

                                // Verification using JIT memory
                                var storedCustomerId = Jit_Memory_Object.GetProperty("CustomerId");
                                var storedModelBData = Jit_Memory_Object.GetProperty("ModelB_Data") as byte[];
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification (JIT Memory) - Customer ID: {storedCustomerId}");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Verification (JIT Memory) - Data Size: {storedModelBData?.Length ?? 0} bytes");
                            }

                            // Store final weights, bias, magnitudes, and service names in results and JIT memory
                            var finalW = sess.run(W);
                            var finalB = sess.run(b);
                            var finalFeatureMagnitudes = ((NDArray)sess.run(initialFeatureMagnitude, new[] { new FeedItem(x_data, inputVectors) })).ToArray<float>(); // Recalculate based on initial features

                            results.TryAdd("ModelB_FinalWeights", ((NDArray)finalW).ToArray<float>()); // Use specific keys
                            results.TryAdd("ModelB_FinalBias", ((NDArray)finalB).ToArray<float>()); // Use specific keys
                            results.TryAdd("ModelB_FinalFeatureMagnitudes", finalFeatureMagnitudes); // Use specific keys
                            results.TryAdd("ModelB_ServiceNames", uniqueNames); // Use specific keys

                            Jit_Memory_Object.AddProperty("ModelB_FinalWeights", ((NDArray)finalW).ToArray<float>());
                            Jit_Memory_Object.AddProperty("ModelB_FinalBias", ((NDArray)finalB).ToArray<float>());
                            Jit_Memory_Object.AddProperty("ModelB_FinalFeatureMagnitudes", finalFeatureMagnitudes);


                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Training completed");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Final loss: {previousLoss:E4}");
                        }
                        catch (Exception ex) // Catch for the Task.Run block (TensorFlow training)
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in Model B training (ProcessFactoryThree NN): {ex.Message}");
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                        throw; // Rethrow to be caught by the outer try-catch
                    }
                }); // End of Task.Run

            } // End of main try block in ProcessFactoryThree
            catch (Exception ex) // Catch for database operations (vector update) and Task.Run exceptions
            {
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryThree: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                throw; // Rethrow to be caught by the main try-catch
            }
            finally
            {
                Jit_Memory_Object.AddProperty("ProcessFactoryThreeActive", false);
                bool isActive = (bool)Jit_Memory_Object.GetProperty("ProcessFactoryThreeActive");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryThreeActive property value after execution: {isActive}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH::mm:ss.fff}] Session {sessionId}: ProcessFactoryThree (Model B) finished.");
            }
        }
        // --- End: ProcessFactoryThree (Model B) ---


        // --- Start: ProcessFactoryFour (Model D - Combined) ---
        /// <summary>
        /// Processes data for Model D (ProcessFactoryFour), combining results from Models A and B.
        /// Trains a final model based on the combined features.
        /// Updates Modeldbinit and OperationsStage1 with the combined model data.
        /// This factory includes placeholder TensorFlow training logic for Model D.
        /// Added parameter for request-scoped DbContext.
        /// Modified: April 20, 2025 2:35:04 PM America/Denver
        /// </summary>
        private async Task ProcessFactoryFour(Modeldbinit model, int customerID, int sessionId,
      ConcurrentDictionary<string, object> modelAResults, ConcurrentDictionary<string, object> modelBResults, YourDbContext dbContext) // Added dbContext parameter
        {
            // Use the passed-in dbContext
            var threadContext = dbContext;

            Jit_Memory_Object.AddProperty("ProcessFactoryFourActive", true);
            bool isActive = (bool)Jit_Memory_Object.GetProperty("ProcessFactoryFourActive");
            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryFourActive property value: {isActive}");
            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: Starting ProcessFactoryFour (Model D)");

            // Retrieve OperationsStage1Record from JIT Memory
            var operationsStage1Record = Jit_Memory_Object.GetProperty("OperationsStage1Record") as OperationsStage1;
            if (operationsStage1Record == null)
            {
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryFour: OperationsStage1Record not found in JIT Memory");
                // Added: April 20, 2025 2:35:04 PM America/Denver
                throw new InvalidOperationException("OperationsStage1Record not found in JIT Memory for ProcessFactoryFour.");
            }

            // Retrieve Model A and Model B serialized data from JIT Memory (where they were stored after serialization in their respective factories)
            // Modified: April 20, 2025 2:35:04 PM America/Denver
            var modelAData = Jit_Memory_Object.GetProperty("ModelA_Data") as byte[];
            var modelBData = Jit_Memory_Object.GetProperty("ModelB_Data") as byte[];

            if (modelAData == null || modelBData == null)
            {
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryFour: Model A or Model B serialized data not found in JIT Memory.");
                // Added: April 20, 2025 2:35:04 PM America/Denver
                throw new InvalidOperationException("Model A or Model B serialized data not found in JIT Memory for ProcessFactoryFour.");
            }

            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Retrieved Model A Data Size: {modelAData.Length} bytes");
            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Retrieved Model B Data Size: {modelBData.Length} bytes");

            // Get CustomerId from JIT Memory
            // Modified: April 20, 2025 2:35:04 PM America/Denver
            var storedCustomerId = Jit_Memory_Object.GetProperty("CustomerId");
            if (storedCustomerId == null || !(storedCustomerId is int)) // Check if it exists and is an int
            {
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryFour: CustomerId not found or is not an integer in JIT Memory");
                // Added: April 20, 2025 2:35:04 PM America/Denver
                throw new InvalidOperationException("CustomerId not found or invalid in JIT Memory for ProcessFactoryFour.");
            }
            int customerIdInt = (int)storedCustomerId; // Cast to int


            // Deserialize and combine models' data
            using (var modelAStream = new MemoryStream(modelAData))
            using (var modelBStream = new MemoryStream(modelBData))
            using (var modelAReader = new BinaryReader(modelAStream))
            using (var modelBReader = new BinaryReader(modelBStream))
            {
                try
                {
                    // Read Model A weights and biases
                    int weightALength = modelAReader.ReadInt32();
                    var weightsA = new float[weightALength];
                    for (int i = 0; i < weightALength; i++)
                    {
                        weightsA[i] = modelAReader.ReadSingle();
                    }

                    int biasALength = modelAReader.ReadInt32();
                    var biasesA = new float[biasALength];
                    for (int i = 0; i < biasALength; i++)
                    {
                        biasesA[i] = modelAReader.ReadSingle();
                    }
                    // Skip reading Model A magnitudes if present, as they are not used for combining models here
                    if (modelAStream.Position < modelAStream.Length)
                    {
                        int magnitudeALength = modelAReader.ReadInt32();
                        // Simply read the bytes to advance the stream position
                        modelAReader.ReadBytes(magnitudeALength * sizeof(float));
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Skipped reading {magnitudeALength} Model A magnitudes.");
                    }


                    // Read Model B weights and biases
                    int weightBLength = modelBReader.ReadInt32();
                    var weightsB = new float[weightBLength];
                    for (int i = 0; i < weightBLength; i++)
                    {
                        weightsB[i] = modelBReader.ReadSingle();
                    }

                    int biasBLength = modelBReader.ReadInt32();
                    var biasesB = new float[biasBLength];
                    for (int i = 0; i < biasBLength; i++)
                    {
                        biasesB[i] = modelBReader.ReadSingle();
                    }
                    // Skip reading Model B magnitudes if present
                    if (modelBStream.Position < modelBStream.Length)
                    {
                        int magnitudeBLength = modelBReader.ReadInt32();
                        modelBReader.ReadBytes(magnitudeBLength * sizeof(float));
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Skipped reading {magnitudeBLength} Model B magnitudes.");
                    }


                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model A - Weights: {weightALength}, Biases: {biasALength}");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Model B - Weights: {weightBLength}, Biases: {biasBLength}");

                    // Check if weights/biases were successfully read and are not empty
                    // Added: April 20, 2025 2:35:04 PM America/Denver
                    if (weightsA.Length == 0 || biasesA.Length == 0 || weightsB.Length == 0 || biasesB.Length == 0)
                    {
                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryFour: Could not read non-empty weights/biases from serialized data. Skipping training.");
                        throw new InvalidOperationException("Could not deserialize non-empty weights/biases from model data for ProcessFactoryFour.");
                    }


                    // TensorFlow Combined Model training
                    await Task.Run(async () => // Marked lambda as async
                    {
                        try
                        {
                            int epochs = 100;
                            float learningRate = 0.0001f;

                            // Check if TensorFlow is initialized and configured
                            if (tf == null)
                            {
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] TensorFlow is not initialized. Skipping Model D training.");
                                return; // Exit the async Task.Run
                            }


                            tf.compat.v1.disable_eager_execution();
                            var g = tf.Graph();
                            using (var sess = tf.Session(g))
                            {
                                // Create combined input placeholder with dimensions for features derived from models A and B.
                                // The original code used weights from A and B directly as input features, which is unusual.
                                // Let's prepare a simplified input using the final bias values as features, assuming they capture some summary from A and B.
                                // We'll create input features that are the concatenation of biases from A and B.
                                // This is a simplification; a real combined model might take outputs or other learned features.
                                // Modified: April 20, 2025 2:35:04 PM America/Denver
                                var combinedInputDim = biasesA.Length + biasesB.Length; // Input features are the concatenated biases
                                var x = tf.placeholder(tf.float32, shape: new[] { -1, combinedInputDim }, name: "combined_input");

                                // Target placeholder
                                // The target data should represent what the combined model is trying to predict.
                                // Using a simple placeholder target derived from biases. Replace with actual target.
                                // Modified: April 20, 2025 2:35:04 PM America/Denver
                                var y = tf.placeholder(tf.float32, shape: new[] { -1, 1 }, name: "output");

                                // Create weight and bias for the combined model
                                var W = tf.Variable(tf.random.normal(new[] { combinedInputDim, 1 }, mean: 0.0f, stddev: 0.01f), name: "combined_weights");
                                var b = tf.Variable(tf.zeros(new[] { 1 }), name: "combined_bias");


                                // Define combined model operation (simple linear combination)
                                var predictions = tf.add(tf.matmul(x, W), b);

                                // Define loss function (Mean Squared Error)
                                var loss = tf.reduce_mean(tf.square(predictions - y)) * 0.5f;
                                var optimizer = tf.train.GradientDescentOptimizer(learningRate);
                                var trainOp = optimizer.minimize(loss);

                                // Prepare combined input data for training
                                // Input data for the combined model (using biases as features)
                                // Create a batch of size 1 for simplicity, using the concatenated biases from A and B.
                                // Modified: April 20, 2025 2:35:04 PM America/Denver
                                var combinedInputFeatures = new float[1, combinedInputDim];
                                Array.Copy(biasesA, 0, combinedInputFeatures, 0, biasesA.Length);
                                Array.Copy(biasesB, 0, combinedInputFeatures, biasesA.Length, biasesB.Length);


                                // Prepare target data for training
                                // Using the average of the first biases as a simple placeholder target. Replace with actual target.
                                // Modified: April 20, 2025 2:35:04 PM America/Denver
                                var targetData = new float[1, 1];
                                // Ensure biasesA and biasesB have elements before calling First()
                                float simpleTarget = 0f;
                                if (biasesA.Length > 0 && biasesB.Length > 0)
                                {
                                    simpleTarget = (biasesA.First() + biasesB.First()) / 2.0f; // Using LINQ .First()
                                }
                                targetData[0, 0] = simpleTarget;


                                sess.run(tf.global_variables_initializer());

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined Model - Data shapes:");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined input shape: {combinedInputFeatures.GetLength(0)} x {combinedInputFeatures.GetLength(1)}");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Target data shape: {targetData.GetLength(0)} x {targetData.GetLength(1)}");

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined Model - Starting training with learning rate: {learningRate}");
                                float previousLoss = float.MaxValue;
                                int stableCount = 0;

                                // Training loop
                                for (int epoch = 0; epoch < epochs; epoch++)
                                {
                                    var feedDict = new Dictionary<Tensor, object>
                                    {
                                        { x, combinedInputFeatures }, // Use the prepared input features
                                        { y, targetData }
                                    };

                                    var feedItems = feedDict.Select(kv => new FeedItem(kv.Key, kv.Value)).ToArray();

                                    sess.run(trainOp, feedItems);
                                    var currentLoss = (float)sess.run(loss, feedItems);

                                    if (float.IsNaN(currentLoss) || float.IsInfinity(currentLoss))
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined Model - Training diverged at epoch {epoch}. Stopping training.");
                                        break;
                                    }


                                    // Convergence check
                                    if (Math.Abs(previousLoss - currentLoss) < 1e-6) // Use a small epsilon
                                    {
                                        stableCount++;
                                        if (stableCount > 5) // Require 5 stable epochs
                                        {
                                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined Model - Training converged at epoch {epoch}");
                                            break;
                                        }
                                    }
                                    else
                                    {
                                        stableCount = 0; // Reset count
                                    }
                                    previousLoss = currentLoss;


                                    if (epoch % 10 == 0)
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined Model - Epoch {epoch}, Loss: {currentLoss:E4}");
                                    }
                                }

                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined Model - Training completed");
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined Model - Final loss: {previousLoss:E4}");


                                // Save combined model
                                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Starting combined model serialization");
                                using (var memoryStream = new MemoryStream())
                                using (var writer = new BinaryWriter(memoryStream))
                                {
                                    // Serialize Weights
                                    var finalW = (NDArray)sess.run(W);
                                    var wData = finalW.ToArray<float>();
                                    writer.Write(wData.Length);
                                    foreach (var w in wData)
                                    {
                                        writer.Write(w);
                                    }
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined model weights serialized successfully ({wData.Length} floats)");


                                    // Serialize Bias
                                    var finalB = (NDArray)sess.run(b);
                                    var bData = finalB.ToArray<float>();
                                    writer.Write(bData.Length);
                                    foreach (var bias in bData)
                                    {
                                        writer.Write(bias);
                                    }
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined model bias serialized successfully ({bData.Length} floats)");


                                    // The combined model data will be stored in the main Modeldbinit object.
                                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                                    var combinedModelData = memoryStream.ToArray();
                                    model.Data = combinedModelData; // Store in the 'Data' field of the Modeldbinit object


                                    // Convert model data to Base64 string for storage in OperationsStage1.Data
                                    // Note: The original code stored the byte[] in ModelDbinit.Data and the Base64 string in OperationsStage1.Data.
                                    // We will follow this pattern.
                                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                                    var base64ModelDataForStage1 = Convert.ToBase64String(combinedModelData);


                                    // Use the passed-in dbContext for database operations within this task.
                                    // Modified: April 20, 2025 2:35:04 PM America/Denver
                                    var dbContext = threadContext; // Use the context passed into ProcessFactoryFour

                                    try
                                    {
                                        // Use an execution strategy for transient failures if applicable to your DB provider
                                        // Added: April 20, 2025 2:35:04 PM America/Denver
                                        var strategy = dbContext.Database.CreateExecutionStrategy();
                                        await strategy.ExecuteAsync(async () => // Use async version
                                        {
                                            using (var transaction = await dbContext.Database.BeginTransactionAsync()) // Use async version
                                            {
                                                try
                                                {
                                                    // Retrieve records again within the transaction scope if needed,
                                                    // or ensure the objects being updated are tracked by 'dbContext'.
                                                    // Using FindAsync or FirstOrDefaultAsync is often safer within a transaction.
                                                    // Use the customerIdInt obtained earlier.
                                                    // Modified: April 20, 2025 2:35:04 PM America/Denver

                                                    // Update OperationsStage1
                                                    var dbOperationsStage1 = await dbContext.OperationsStage1s
                                                        .FirstOrDefaultAsync(o => o.CustomerId == customerIdInt);

                                                    if (dbOperationsStage1 != null)
                                                    {
                                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found OperationsStage1 record for CustomerId: {customerIdInt} for combined model data update.");
                                                        dbOperationsStage1.Data = base64ModelDataForStage1; // Store Base64 string
                                                        dbContext.OperationsStage1s.Update(dbOperationsStage1); // Explicitly mark as modified
                                                    }
                                                    else
                                                    {
                                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No OperationsStage1 record found for CustomerId: {customerIdInt} to save combined model data.");
                                                    }

                                                    // Update Modeldbinit
                                                    // Note: Modeldbinit.Data will store the byte array.
                                                    var dbModelDbInit = await dbContext.ModelDbInits
                                                        .FirstOrDefaultAsync(m => m.CustomerId == customerIdInt);

                                                    if (dbModelDbInit != null)
                                                    {
                                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Found Modeldbinit record for CustomerId: {customerIdInt} for combined model data update.");
                                                        dbModelDbInit.Data = combinedModelData; // Store byte array in Modeldbinit.Data
                                                        dbContext.ModelDbInits.Update(dbModelDbInit); // Explicitly mark as modified
                                                    }
                                                    else
                                                    {
                                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] No Modeldbinit record found for CustomerId: {customerIdInt} to save combined model data.");
                                                    }


                                                    // Save changes within the transaction
                                                    await dbContext.SaveChangesAsync();
                                                    // Commit transaction
                                                    await transaction.CommitAsync();
                                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Database updates for combined model committed successfully.");
                                                }
                                                catch (Exception ex)
                                                {
                                                    await transaction.RollbackAsync();
                                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error during database transaction in ProcessFactoryFour: {ex.Message}");
                                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                                                    throw; // Rethrow to be caught by the strategy.ExecuteAsync catch
                                                }
                                            }
                                            return true; // Indicate success for the strategy
                                        });
                                    }
                                    catch (Exception ex) // Catch for strategy.ExecuteAsync
                                    {
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error updating database records in ProcessFactoryFour (after strategy): {ex.Message}");
                                        System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                                        throw; // Rethrow to be caught by the main try-catch
                                    }


                                    Jit_Memory_Object.AddProperty("CombinedModel_Data", combinedModelData); // Store combined data byte array in JIT memory
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined model serialized and stored in JIT memory successfully");
                                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Combined Model - Final loss: {previousLoss:E4}");
                                }
                            }
                        }
                        catch (Exception ex) // Catch for the Task.Run block (TensorFlow training)
                        {
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in Combined Model training (ProcessFactoryFour NN): {ex.Message}");
                            System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                            throw; // Rethrow to be caught by the main try-catch
                        }
                    }); // End of Task.Run

                } // End of main try block in ProcessFactoryFour
                catch (Exception ex) // Catch for deserialization/setup
                {
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Error in ProcessFactoryFour (Deserialization/Setup): {ex.Message}");
                    System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Stack Trace: {ex.StackTrace}"); // Added stack trace logging
                    throw; // Rethrow to be caught by the main try-catch
                }
            } // MemoryStreams and BinaryReaders are disposed here
            finally
            {
                Jit_Memory_Object.AddProperty("ProcessFactoryFourActive", false);
                bool isActive = (bool)Jit_Memory_Object.GetProperty("ProcessFactoryFourActive");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss.fff}] Session {sessionId}: ProcessFactoryFourActive property value after execution: {isActive}");
                System.Diagnostics.Debug.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH::mm:ss.fff}] Session {sessionId}: ProcessFactoryFour (Model D) finished.");
            }
        }
        // --- End: ProcessFactoryFour (Model D - Combined) ---


    } // End of AnalysisController class


} // End of MW.Server.Controllers namespace