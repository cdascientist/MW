using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MW.Server.Models;

[Table("client")]
public partial class Client
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("my_id")]
    public int? MyId { get; set; }

    [Column("first_name")]
    [StringLength(100)]
    public string? FirstName { get; set; }

    [Column("last_name")]
    [StringLength(100)]
    public string? LastName { get; set; }

    [Column("phone")]
    [StringLength(100)]
    public string? Phone { get; set; }

    [Column("email")]
    [StringLength(100)]
    public string? Email { get; set; }

    [Column("slackchannelid")]
    [StringLength(100)]
    public string? Slackchannelid { get; set; }

    [Column("slackchannel")]
    [StringLength(100)]
    public string? Slackchannel { get; set; }

    [Column("current_job_id")]
    public int? CurrentJobId { get; set; }

    [Column("current_job_chat")]
    public int? CurrentJobChat { get; set; }

    [Column("ext_date")]
    [StringLength(255)]
    public string? ExtDate { get; set; }

    [Column("ext2_date")]
    [StringLength(255)]
    public string? Ext2Date { get; set; }
}
