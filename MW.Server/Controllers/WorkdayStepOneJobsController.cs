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

        public WorkdayStepOneJobsController(DefaultdbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets the total count of WorkdayStepOneJob records.
        /// </summary>
        /// <returns>The total number of records.</returns>
        [HttpGet("Count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<int>> GetCount()
        {
            // IMPORTANT: Assumes the DbSet property in 'DefaultdbContext' is named by pluralizing 'WorkdayStepOneJob' (e.g., 'WorkdayStepOneJobs')
            // If your DbSet has a different name, update it here.
            var count = await _context.WorkdayStepOneJobs.CountAsync();
            return Ok(count);
        }

        /// <summary>
        /// Gets a list of unique ClientFirstName values from WorkdayStepOneJob records.
        /// </summary>
        /// <returns>A list of unique client first names.</returns>
        [HttpGet("UniqueClientFirstNames")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // Optional: If you want to return 404 if no names found
        public async Task<ActionResult<List<string>>> GetUniqueClientFirstNames()
        {
            // IMPORTANT: Assumes the DbSet property in 'DefaultdbContext' is named by pluralizing 'WorkdayStepOneJob' (e.g., 'WorkdayStepOneJobs')
            // If your DbSet has a different name, update it here.
            var uniqueNames = await _context.WorkdayStepOneJobs
                                        .Select(j => j.ClientFirstName) // Select only the first name
                                        .Where(name => !string.IsNullOrEmpty(name)) // Filter out null or empty names (optional but recommended)
                                        .Distinct()                     // Get unique names
                                        .OrderBy(name => name)          // Order alphabetically (optional)
                                        .ToListAsync();                 // Execute the query asynchronously

            // Optional: Handle case where no names are found
            // if (uniqueNames == null || !uniqueNames.Any())
            // {
            //     return NotFound("No client first names found.");
            // }

            return Ok(uniqueNames);
        }

        // You can add other CRUD operations (GET by ID, POST, PUT, DELETE) here if needed.
        // Example: Get a specific job by ID
        /*
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<WorkdayStepOneJob>> GetWorkdayStepOneJob(int id)
        {
            var job = await _context.WorkdayStepOneJobs.FindAsync(id);

            if (job == null)
            {
                return NotFound();
            }

            return Ok(job);
        }
        */
    }
}