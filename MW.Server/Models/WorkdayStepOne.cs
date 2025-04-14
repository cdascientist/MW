using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MW.Server.Models;

[Table("workday_step_one")]
public partial class WorkdayStepOne
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("my_id")]
    public int? MyId { get; set; }

    [Column("job_ret_records_bright")]
    [StringLength(2000)]
    public string? JobRetRecordsBright { get; set; }

    [Column("job_ret_records_apify")]
    [StringLength(2000)]
    public string? JobRetRecordsApify { get; set; }

    [Column("search_data")]
    public byte[]? SearchData { get; set; }
}
