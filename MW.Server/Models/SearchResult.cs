using System;
using System.Collections.Generic;

namespace MW.Server.Models;

public partial class SearchResult
{
    public int Id { get; set; }

    public string? MyId { get; set; }

    public string? JobTitle { get; set; }

    public string? Company { get; set; }

    public string? Location { get; set; }

    public string? Description { get; set; }

    public string? PostDate { get; set; }
}
