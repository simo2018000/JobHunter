using Microsoft.EntityFrameworkCore;

namespace JobHunter.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Models.Job> Jobs { get; set; }
    public DbSet<Models.Application> Applications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models.Job>().ToTable("jobs");
        modelBuilder.Entity<Models.Job>().Property(j => j.Id).HasColumnName("id");
        modelBuilder.Entity<Models.Job>().Property(j => j.Title).HasColumnName("title");
        modelBuilder.Entity<Models.Job>().Property(j => j.Company).HasColumnName("company");
        modelBuilder.Entity<Models.Job>().Property(j => j.Url).HasColumnName("url");
        modelBuilder.Entity<Models.Job>().Property(j => j.Source).HasColumnName("source");
        modelBuilder.Entity<Models.Job>().Property(j => j.SeenAt).HasColumnName("seen_at");
        modelBuilder.Entity<Models.Job>().Property(j => j.Score).HasColumnName("score");
        modelBuilder.Entity<Models.Job>().Property(j => j.MatchReason).HasColumnName("match_reason");
        modelBuilder.Entity<Models.Job>().Property(j => j.RequiredSkills).HasColumnName("required_skills");
        modelBuilder.Entity<Models.Job>().Property(j => j.ContractType).HasColumnName("contract_type");

        modelBuilder.Entity<Models.Application>().ToTable("applications");
        modelBuilder.Entity<Models.Application>().Property(a => a.Id).HasColumnName("id");
        modelBuilder.Entity<Models.Application>().Property(a => a.JobId).HasColumnName("job_id");
        modelBuilder.Entity<Models.Application>().Property(a => a.Status).HasColumnName("status");
        modelBuilder.Entity<Models.Application>().Property(a => a.Notes).HasColumnName("notes");
        modelBuilder.Entity<Models.Application>().Property(a => a.AppliedAt).HasColumnName("applied_at");
        modelBuilder.Entity<Models.Application>().Property(a => a.UpdatedAt).HasColumnName("updated_at");

        modelBuilder.Entity<Models.Application>()
            .HasOne(a => a.Job)
            .WithMany(j => j.Applications)
            .HasForeignKey(a => a.JobId);
    }
}
