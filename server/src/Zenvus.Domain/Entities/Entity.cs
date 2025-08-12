namespace Zenvus.Domain.Entities;

public class Entity: ITracking
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public abstract class SoftDeleteEntity : Entity, ISoftDelete
{
    public bool Disabled { get; set; } = false;
}
