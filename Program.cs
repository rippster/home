using WebApplication1.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddScoped<TimeZoneService>();
builder.Services.AddHttpClient<TimeZoneService>(client =>
{
    client.BaseAddress = new Uri("https://api.opentimezone.com");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// Serve static files and enable default files
app.UseDefaultFiles();
app.UseStaticFiles();

// Map API controllers
app.MapControllers();

// Add SPA fallback to serve index.html for client-side routing
app.MapFallbackToFile("index.html");

app.Run();