using System;
using System.Collections.Generic;

namespace MW.Server.Models;

public partial class WorkdayStepOne
{
    public int Id { get; set; }

    public int? MyId { get; set; }

    public string? JobRetRecordsBright { get; set; }

    public string? JobRetRecordsApify { get; set; }

    public byte[]? SearchData { get; set; }
}
