using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MW.Server.Models;

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
}
