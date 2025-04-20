using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MW.Server.Models;

[Table("modeldbinit")]
public partial class Modeldbinit
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("customer_id")]
    public int? CustomerId { get; set; }

    [Column("modeldbinittimestamp", TypeName = "datetime")]
    public DateTime? Modeldbinittimestamp { get; set; }

    [Column("model_db_init_catagorical_id")]
    public int? ModelDbInitCatagoricalId { get; set; }

    [Column("model_db_init_catagorical_name", TypeName = "text")]
    public string? ModelDbInitCatagoricalName { get; set; }

    [Column("model_db_init_model_data", TypeName = "varbinary(65000)")]
    public byte[]? ModelDbInitModelData { get; set; }
}
