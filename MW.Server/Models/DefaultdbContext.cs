using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MW.Server.Models;

public partial class DefaultdbContext : DbContext
{
    public DefaultdbContext(DbContextOptions<DefaultdbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<Modeldbinit> Modeldbinits { get; set; }

    public virtual DbSet<SearchResult> SearchResults { get; set; }

    public virtual DbSet<WorkdayStepOne> WorkdayStepOnes { get; set; }

    public virtual DbSet<WorkdayStepOneJob> WorkdayStepOneJobs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");
        });

        modelBuilder.Entity<Modeldbinit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");
        });

        modelBuilder.Entity<SearchResult>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");
        });

        modelBuilder.Entity<WorkdayStepOne>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");
        });

        modelBuilder.Entity<WorkdayStepOneJob>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.AgentConsensus).HasDefaultValueSql("'false'");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
