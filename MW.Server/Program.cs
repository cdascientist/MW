using Microsoft.EntityFrameworkCore; // Required for DbContext options and extension methods like UseMySQL.
using MW.Server.Models;           // Required to reference DefaultdbContext from the Models namespace.

namespace MW.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Creates a new WebApplicationBuilder instance with preconfigured defaults based on command-line args and environment variables.
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            // Registers the application's DbContext (DefaultdbContext) with the dependency injection container.
            // Configures it to use MySQL as the database provider.
            // Specifies that the connection string named "DefaultConnection" from configuration (appsettings.json) should be used.
            builder.Services.AddDbContext<DefaultdbContext>(options =>
                options.UseMySQL(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add CORS services and configure a policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", policy =>
                {
                    policy.WithOrigins("https://localhost:5173")  // Allow requests from the Vite dev server
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });

            // Registers services required for controllers (like API controllers) to be discovered and activated.
            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                // Configure JSON serialization options
                options.JsonSerializerOptions.PropertyNamingPolicy = null;
                options.JsonSerializerOptions.WriteIndented = true;
            });

            // Registers services needed for API Explorer, which is used by tools like Swashbuckle to generate OpenAPI/Swagger specifications.
            builder.Services.AddEndpointsApiExplorer();

            // Registers Swashbuckle services to generate Swagger JSON documents describing the API endpoints.
            builder.Services.AddSwaggerGen();

            // Builds the WebApplication instance from the configured services. This represents the web application itself.
            var app = builder.Build();

            // Configures the app to serve default files (like index.html) from the web root (wwwroot) when a directory is requested.
            app.UseDefaultFiles();

            // Configures the app to serve static files (like HTML, CSS, JS, images) from the web root (wwwroot).
            app.UseStaticFiles();

            // Configure the HTTP request pipeline. Determines how incoming requests are handled.

            // Checks if the application is running in the Development environment (typically set via ASPNETCORE_ENVIRONMENT variable).
            if (app.Environment.IsDevelopment())
            {
                // Enables the Swagger middleware to serve the generated Swagger JSON endpoint (e.g., /swagger/v1/swagger.json).
                app.UseSwagger();

                // Enables the Swagger UI middleware to serve the interactive Swagger documentation UI (usually at /swagger).
                app.UseSwaggerUI();
            }

            // Apply CORS policy
            app.UseCors("CorsPolicy");

            // Adds middleware to redirect HTTP requests to HTTPS, enhancing security.
            app.UseHttpsRedirection();

            // Adds middleware to enable authorization capabilities (though no specific policies are configured here).
            app.UseAuthorization();

            // Adds middleware to route requests to the appropriate controller action methods based on attributes ([Route], [HttpGet], etc.).
            app.MapControllers();

            // Configures a fallback route for requests that don't match any other endpoint; serves the specified file (e.g., for SPA routing).
            app.MapFallbackToFile("/index.html");

            // Add global exception handling
            app.UseExceptionHandler(errorApp =>
            {
                errorApp.Run(async context =>
                {
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred. Please try again later." });
                });
            });

            // Runs the application and starts listening for incoming HTTP requests. This blocks the main thread until the app is shut down.
            app.Run();
        }
    }
}