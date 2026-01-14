using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Zenvus.Domain.Entities;

namespace Zenvus.Infra.Extensions;

[ExcludeFromCodeCoverage]
public static class ModelBuilderExtension
{
    public static void ApplyEntityConfiguration(this ModelBuilder modelBuilder)
    {
        var entities = modelBuilder.GetEntities<Entity>();
        var props = entities.SelectMany(c => c.GetProperties()).ToList();

        foreach (var property in props.Where(c => c.ClrType == typeof(int) && c.Name == "Id"))
        {
            property.IsKey();
        }
    }
    
    public static void ApplyTrackingConfiguration(this ModelBuilder modelBuilder)
    {
        var propDatas = new[] { "CriadoEm", "AtualizadoEm" };
        
        var entidades = modelBuilder.GetEntities<ITracking>();

        var dataProps = entidades
            .SelectMany(c 
                => c.GetProperties().Where(p => p.ClrType == typeof(DateTime) && propDatas.Contains(p.Name)));

        foreach (var prop in dataProps)
        {
            prop.SetColumnType("timestamp");
            prop.SetDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
    
    public static void ApplySoftDeleteConfiguration(this ModelBuilder modelBuilder)
    {
        var entidades = modelBuilder.GetEntities<ISoftDelete>();
        
        var props = entidades
            .SelectMany(c => c.GetProperties().Where(p => p.ClrType == typeof(bool))).ToList();

        foreach (var prop in props.Where(c => c.Name == "Desativado"))
        {
            prop.IsNullable = false;
            prop.SetDefaultValue(false);
        }
    }

    private static List<IMutableEntityType> GetEntities<T>(this ModelBuilder modelBuilder)
    {
        var entities = modelBuilder.Model.GetEntityTypes()
            .Where(c => c.ClrType.GetInterface(typeof(T).Name) != null).ToList();

        return entities;
    }
}
