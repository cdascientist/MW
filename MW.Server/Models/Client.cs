using System;
using System.Collections.Generic;

namespace MW.Server.Models;

public partial class Client
{
    public int Id { get; set; }

    public int? MyId { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Slackchannelid { get; set; }

    public string? Slackchannel { get; set; }

    public int? CurrentJobId { get; set; }

    public int? CurrentJobChat { get; set; }
}
