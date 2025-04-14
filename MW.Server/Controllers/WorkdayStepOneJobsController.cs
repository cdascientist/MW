using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MW.Server.Models; // Assuming Models namespace follows project name
using System.Collections.Generic; // Added for List<T>
using System.Linq;             // Added for LINQ methods like Select and Distinct
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; // Added for StatusCodes

namespace MW.Server.Controllers // Assuming Controllers namespace follows project name
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkdayStepOneJobsController : ControllerBase
    {
        private readonly DefaultdbContext _context;
        private readonly ILogger<WorkdayStepOneJobsController> _logger;

        public WorkdayStepOneJobsController(DefaultdbContext context, ILogger<WorkdayStepOneJobsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Gets the total count of WorkdayStepOneJob records.
        /// </summary>
        /// <returns>The total number of records.</returns>
        [HttpGet("Count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<int>> GetCount()
        {
            try
            {
                // IMPORTANT: Assumes the DbSet property in 'DefaultdbContext' is named by pluralizing 'WorkdayStepOneJob' (e.g., 'WorkdayStepOneJobs')
                // If your DbSet has a different name, update it here.
                var count = await _context.WorkdayStepOneJobs.CountAsync();
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting count of WorkdayStepOneJobs");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving record count." });
            }
        }

        /// <summary>
        /// Gets a list of unique ClientFirstName values from WorkdayStepOneJob records.
        /// </summary>
        /// <returns>A list of unique client first names.</returns>
        [HttpGet("UniqueClientFirstNames")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<string>>> GetUniqueClientFirstNames()
        {
            try
            {
                // IMPORTANT: Assumes the DbSet property in 'DefaultdbContext' is named by pluralizing 'WorkdayStepOneJob' (e.g., 'WorkdayStepOneJobs')
                // If your DbSet has a different name, update it here.
                var uniqueNames = await _context.WorkdayStepOneJobs
                                        .Select(j => j.ClientFirstName) // Select only the first name
                                        .Where(name => !string.IsNullOrEmpty(name)) // Filter out null or empty names (optional but recommended)
                                        .Distinct()                     // Get unique names
                                        .OrderBy(name => name)          // Order alphabetically (optional)
                                        .ToListAsync();                 // Execute the query asynchronously

                // Handle case where no names are found
                if (uniqueNames == null || !uniqueNames.Any())
                {
                    _logger.LogInformation("No client first names found");
                    return new List<string>(); // Return empty list instead of 404
                }

                return Ok(uniqueNames);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unique client first names");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving client names." });
            }
        }

        // GET: api/WorkdayStepOneJobs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<WorkdayStepOneJob>> GetWorkdayStepOneJob(int id)
        {
            try
            {
                var job = await _context.WorkdayStepOneJobs.FindAsync(id);

                if (job == null)
                {
                    return NotFound();
                }

                return Ok(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving WorkdayStepOneJob with ID {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving the job." });
            }
        }

        // You can add other CRUD operations (POST, PUT, DELETE) here if needed.
    }
}