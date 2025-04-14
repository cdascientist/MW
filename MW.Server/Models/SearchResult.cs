using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MW.Server.Models;

[Table("search_results")]
public partial class SearchResult
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("my_id")]
    [StringLength(400)]
    public string? MyId { get; set; }

    [Column("job_title")]
    [StringLength(500)]
    public string? JobTitle { get; set; }

    [Column("company")]
    [StringLength(100)]
    public string? Company { get; set; }

    [Column("location")]
    [StringLength(100)]
    public string? Location { get; set; }

    [Column("description", TypeName = "mediumtext")]
    public string? Description { get; set; }

    [Column("post_date")]
    [StringLength(100)]
    public string? PostDate { get; set; }
}
