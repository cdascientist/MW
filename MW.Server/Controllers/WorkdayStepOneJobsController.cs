using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MW.Server.Models; // Assuming Models namespace follows project name
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;

namespace MW.Server.Controllers
{
    // DTO defined here for simplicity, or move to Models/DTOs folder
    public class ClientNameDto
    {
        public string? ClientFirstName { get; set; }
        public string? ClientLastName { get; set; }
    }

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

        // --- GetCount method ---
        [HttpGet("Count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<int>> GetCount()
        {
            try
            {
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

        // --- GetUniqueClientNames method ---
        [HttpGet("UniqueClientNames")]
        [ProducesResponseType(typeof(List<ClientNameDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<ClientNameDto>>> GetUniqueClientNames()
        {
            try
            {
                var uniqueNames = await _context.WorkdayStepOneJobs
                                        .Where(j => !string.IsNullOrEmpty(j.ClientFirstName))
                                        .Select(j => new { j.ClientFirstName, j.ClientLastName })
                                        .Distinct()
                                        .OrderBy(namePair => namePair.ClientFirstName)
                                        .ThenBy(namePair => namePair.ClientLastName)
                                        .Select(namePair => new ClientNameDto
                                        {
                                            ClientFirstName = namePair.ClientFirstName,
                                            // Clean up last name here as well for consistency
                                            ClientLastName = (!string.IsNullOrEmpty(namePair.ClientLastName) && namePair.ClientLastName.EndsWith("}"))
                                                             ? namePair.ClientLastName.Substring(0, namePair.ClientLastName.Length - 1)
                                                             : namePair.ClientLastName
                                        })
                                        .ToListAsync();

                if (uniqueNames == null)
                {
                    _logger.LogInformation("Unique client name query returned null (unexpected)");
                    return new List<ClientNameDto>();
                }

                _logger.LogInformation("Retrieved {Count} unique client name pairs.", uniqueNames.Count);
                return Ok(uniqueNames);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unique client names");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while retrieving unique client names." });
            }
        }

        /// <summary>
        /// Searches for WorkdayStepOneJob records by Client First Name AND Client Last Name (case-insensitive).
        /// Removes trailing '}' from ClientLastName in the returned results.
        /// </summary>
        /// <param name="firstName">The client first name to search for.</param>
        /// <param name="lastName">The client last name to search for.</param>
        /// <returns>A list of matching WorkdayStepOneJob records with cleaned ClientLastName.</returns>
        [HttpGet("SearchByClientName")]
        [ProducesResponseType(typeof(List<WorkdayStepOneJob>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<WorkdayStepOneJob>>> SearchByClientName(
            [FromQuery] string firstName,
            [FromQuery] string lastName)
        {
            if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
            {
                return BadRequest(new { message = "Both 'firstName' and 'lastName' parameters are required." });
            }

            try
            {
                _logger.LogInformation("Searching for jobs with ClientFirstName: {FirstName} AND ClientLastName: {LastName}", firstName, lastName);

                // 1. Retrieve matching jobs based on the input parameters
                var jobs = await _context.WorkdayStepOneJobs
                                 .Where(j => j.ClientFirstName != null &&
                                             j.ClientFirstName.Equals(firstName, StringComparison.OrdinalIgnoreCase) &&
                                             j.ClientLastName != null &&
                                             j.ClientLastName.Equals(lastName, StringComparison.OrdinalIgnoreCase))
                                 .ToListAsync(); // Fetch the results

                _logger.LogInformation("Found {Count} raw matches for ClientFirstName: {FirstName} AND ClientLastName: {LastName}. Cleaning results...", jobs.Count, firstName, lastName);

                // 2. Clean up the ClientLastName in the retrieved results
                foreach (var job in jobs)
                {
                    if (!string.IsNullOrEmpty(job.ClientLastName) && job.ClientLastName.EndsWith("}"))
                    {
                        // Remove the trailing '}'
                        job.ClientLastName = job.ClientLastName.Substring(0, job.ClientLastName.Length - 1);
                        _logger.LogTrace("Cleaned ClientLastName for Job ID {JobId}. New value: {ClientLastName}", job.Id, job.ClientLastName);
                    }
                }

                _logger.LogInformation("Returning {Count} cleaned jobs for ClientFirstName: {FirstName} AND ClientLastName: {LastName}", jobs.Count, firstName, lastName);
                return Ok(jobs); // Return the list with potentially modified ClientLastName
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching for WorkdayStepOneJobs by ClientFirstName: {FirstName} and ClientLastName: {LastName}", firstName, lastName);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while searching for jobs." });
            }
        }


        // --- GetWorkdayStepOneJob by ID method ---
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

                // Also apply cleanup when fetching a single record by ID for consistency
                if (!string.IsNullOrEmpty(job.ClientLastName) && job.ClientLastName.EndsWith("}"))
                {
                    job.ClientLastName = job.ClientLastName.Substring(0, job.ClientLastName.Length - 1);
                    _logger.LogTrace("Cleaned ClientLastName for retrieved Job ID {JobId}. New value: {ClientLastName}", job.Id, job.ClientLastName);
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
    }
}