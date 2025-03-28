using System;
using System.Collections.Generic;

namespace MW.Server.Models;

public partial class WorkdayStepOneJob
{
    public int Id { get; set; }

    public int? MyId { get; set; }

    public DateTime? Datetime { get; set; }

    public string? ClientFirstName { get; set; }

    public string? ClientLastName { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public int? JobId { get; set; }

    public string? JobName { get; set; }

    public string? Company { get; set; }

    public string? Posted { get; set; }

    public byte[]? InitalContact { get; set; }

    public byte[]? InitContactAnalysis { get; set; }

    public int? Team1Transcript1Cycles { get; set; }

    public string? Team1Trasnscript1 { get; set; }

    public bool? AgentConsensus { get; set; }

    public bool? JenniferConsensus { get; set; }

    public bool? AshleyConsensus { get; set; }

    public bool? AllenConsensus { get; set; }
}
