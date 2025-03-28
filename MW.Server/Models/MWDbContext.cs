using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MW.Server.Models;

public partial class MWDbContext : DbContext
{
    public MWDbContext()
    {
    }

    public MWDbContext(DbContextOptions<MWDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<SearchResult> SearchResults { get; set; }

    public virtual DbSet<WorkdayStepOne> WorkdayStepOnes { get; set; }

    public virtual DbSet<WorkdayStepOneJob> WorkdayStepOneJobs { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySQL("server=basis-project-ef1e.g.aivencloud.com;port=13566;user=avnadmin;password=AVNS_wUH-gfFc3pf76IZ7l0Z;database=defaultdb;SSL Mode=Required");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("client");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CurrentJobChat).HasColumnName("current_job_chat");
            entity.Property(e => e.CurrentJobId).HasColumnName("current_job_id");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasColumnName("last_name");
            entity.Property(e => e.MyId).HasColumnName("my_id");
            entity.Property(e => e.Phone)
                .HasMaxLength(100)
                .HasColumnName("phone");
            entity.Property(e => e.Slackchannel)
                .HasMaxLength(100)
                .HasColumnName("slackchannel");
            entity.Property(e => e.Slackchannelid)
                .HasMaxLength(100)
                .HasColumnName("slackchannelid");
        });

        modelBuilder.Entity<SearchResult>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("search_results");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Company)
                .HasMaxLength(100)
                .HasColumnName("company");
            entity.Property(e => e.Description)
                .HasColumnType("mediumtext")
                .HasColumnName("description");
            entity.Property(e => e.JobTitle)
                .HasMaxLength(500)
                .HasColumnName("job_title");
            entity.Property(e => e.Location)
                .HasMaxLength(100)
                .HasColumnName("location");
            entity.Property(e => e.MyId)
                .HasMaxLength(400)
                .HasColumnName("my_id");
            entity.Property(e => e.PostDate)
                .HasMaxLength(100)
                .HasColumnName("post_date");
        });

        modelBuilder.Entity<WorkdayStepOne>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("workday_step_one");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.JobRetRecordsApify)
                .HasMaxLength(2000)
                .HasColumnName("job_ret_records_apify");
            entity.Property(e => e.JobRetRecordsBright)
                .HasMaxLength(2000)
                .HasColumnName("job_ret_records_bright");
            entity.Property(e => e.MyId).HasColumnName("my_id");
            entity.Property(e => e.SearchData).HasColumnName("search_data");
        });

        modelBuilder.Entity<WorkdayStepOneJob>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("workday_step_one_job");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AgentConsensus)
                .IsRequired()
                .HasDefaultValueSql("'false'")
                .HasColumnName("agent_consensus");
            entity.Property(e => e.AllenConsensus).HasColumnName("allen_consensus");
            entity.Property(e => e.AshleyConsensus).HasColumnName("ashley_consensus");
            entity.Property(e => e.ClientFirstName)
                .HasMaxLength(100)
                .HasColumnName("client_first_name");
            entity.Property(e => e.ClientLastName)
                .HasMaxLength(100)
                .HasColumnName("client_last_name");
            entity.Property(e => e.Company)
                .HasMaxLength(100)
                .HasColumnName("company");
            entity.Property(e => e.Datetime)
                .HasColumnType("date")
                .HasColumnName("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.InitContactAnalysis)
                .HasColumnType("blob")
                .HasColumnName("init_contact_analysis");
            entity.Property(e => e.InitalContact)
                .HasColumnType("blob")
                .HasColumnName("inital_contact");
            entity.Property(e => e.JenniferConsensus).HasColumnName("jennifer_consensus");
            entity.Property(e => e.JobId).HasColumnName("job_id");
            entity.Property(e => e.JobName)
                .HasMaxLength(100)
                .HasColumnName("job_name");
            entity.Property(e => e.MyId).HasColumnName("my_id");
            entity.Property(e => e.Phone)
                .HasMaxLength(100)
                .HasColumnName("phone");
            entity.Property(e => e.Posted)
                .HasMaxLength(100)
                .HasColumnName("posted");
            entity.Property(e => e.Team1Transcript1Cycles).HasColumnName("team_1_transcript_1_cycles");
            entity.Property(e => e.Team1Trasnscript1)
                .HasColumnType("mediumtext")
                .HasColumnName("team_1_trasnscript_1");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
