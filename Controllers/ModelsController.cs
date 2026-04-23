using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WebApplication1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelsController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _config;

    public ModelsController(IWebHostEnvironment environment, IConfiguration config)
    {
        _environment = environment;
        _config = config;
    }

    private string BookmarksFilePath()
    {
        var configured = _config["BookmarksPath"];
        if (!string.IsNullOrWhiteSpace(configured))
            return configured;
        return Path.Combine(_environment.ContentRootPath, "bookmarks.json");
    }

    [HttpGet]
    public async Task<IEnumerable<BookmarkGroup>> Get()
    {
        var path = BookmarksFilePath();
        var json = await System.IO.File.ReadAllTextAsync(path);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        return JsonSerializer.Deserialize<BookmarkGroup[]>(json, options) ?? Array.Empty<BookmarkGroup>();
    }

    [HttpPost]
    public async void Save(List<BookmarkGroup> bookmarks)
    {
        var path = BookmarksFilePath();
        string json = JsonSerializer.Serialize(bookmarks);
        await System.IO.File.WriteAllTextAsync(path, json);
    }
}

public class BookmarkGroup
{
    [JsonPropertyName("Name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("Bookmarks")]
    public Bookmark[] Bookmarks { get; set; } = Array.Empty<Bookmark>();
}

public class Bookmark
{
    [JsonPropertyName("Icon")]
    public string Icon { get; set; } = string.Empty;
    
    [JsonPropertyName("Href")]
    public string Href { get; set; } = string.Empty;
    
    [JsonPropertyName("Name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("Theme")]
    public string? Theme { get; set; }
}
